#!/usr/bin/env python3
"""Overwrite key index rows in market.json with latest realtime data.

- TAIEX: TWSE realtime API (t00)
- US indices (S&P 500, Nasdaq, Dow Jones): Yahoo v8 chart (best-effort)

Run after parse_market.py to ensure these have the latest available close.
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

import requests

MARKET = Path(__file__).resolve().parent / "repo" / "data" / "market.json"
UA = "Mozilla/5.0"  # short UA — Yahoo blocks long detailed ones
TPE = timezone(timedelta(hours=8))

# 防呆：Yahoo 盤中（尤其亞股開盤時段）偶爾回傳壞掉的 intraday 價，
# 會把 .md 來的確定性收盤值覆寫成離譜數字（曾出現 TAIEX -7.6%、Nikkei -6.4%）。
# 若 realtime 值相對既有確定性值偏離超過門檻 → 視為壞值,保留原值並警告。
# 指數單日真實波動極少 >5%;FX >3%。
MAX_DEV_INDEX = 0.05
MAX_DEV_FX = 0.03


def _sane_override(name, old_close, new_close, max_dev) -> bool:
    """True = 採用 realtime 新值；False = 偏離過大,判定壞值,保留舊值。"""
    if not isinstance(old_close, (int, float)) or not old_close:
        return True  # 無既有基準可比,只能採用
    if new_close is None:
        return False
    dev = abs(new_close - old_close) / old_close
    if dev > max_dev:
        print(
            f"  ⚠️ refresh skip {name}: realtime {new_close} 偏離既有 "
            f"{old_close} 達 {dev * 100:.1f}% (>{max_dev * 100:.0f}%),疑似壞值,保留原值"
        )
        return False
    return True


def refresh_taiex(market):
    """Use Yahoo for TAIEX (^TWII) to get COMPLETED close even during TW open hours."""
    close, prev, date_iso = fetch_yahoo_quote("^TWII")
    if close is None:
        return
    daily_pct = round((close - prev) / prev * 100, 2) if prev else None
    for idx in market.get("indices", []):
        if idx.get("name") in ("TAIEX", "TAIEX 加權指數", "加權指數"):
            if not _sane_override("TAIEX", idx.get("close"), close, MAX_DEV_INDEX):
                return
            idx["close"] = close
            idx["daily_pct"] = daily_pct
            idx["closing_date"] = date_iso
            print(f"refresh_taiex: ✓ {close} ({daily_pct}%) {date_iso}")
            return


def fetch_yahoo_quote(symbol):
    """Returns last COMPLETED daily close + prev close + date in exchange TZ.
    If market is currently open (now < regular.end on a bar that's today),
    returns yesterday's close instead of today's intraday partial."""
    import time as _time

    hosts = ["query2.finance.yahoo.com", "query1.finance.yahoo.com"]
    for host in hosts:
        try:
            r = requests.get(
                f"https://{host}/v8/finance/chart/{symbol}?interval=1d&range=10d",
                headers={"User-Agent": UA},
                timeout=8,
            )
            if r.status_code == 429:
                continue
            r.raise_for_status()
            d = r.json()
            result = d["chart"]["result"][0]
            meta = result.get("meta", {})
            gmtoff = meta.get("gmtoffset")
            market_tz = (
                timezone(timedelta(seconds=gmtoff)) if gmtoff is not None else TPE
            )
            ts = result.get("timestamp") or []
            closes = (
                result.get("indicators", {}).get("quote", [{}])[0].get("close") or []
            )
            history = [(t, c) for t, c in zip(ts, closes) if c is not None]
            if not history:
                return None, None, None

            now_utc = _time.time()
            regular = meta.get("currentTradingPeriod", {}).get("regular", {})
            regular_start = regular.get("start")
            regular_end = regular.get("end")
            last_t = history[-1][0]
            last_date_market = datetime.fromtimestamp(last_t, tz=market_tz).strftime(
                "%Y-%m-%d"
            )
            today_market = datetime.fromtimestamp(now_utc, tz=market_tz).strftime(
                "%Y-%m-%d"
            )
            last_is_today_open = (
                last_date_market == today_market
                and regular_end is not None
                and now_utc < regular_end
            )
            if last_is_today_open and len(history) >= 2:
                idx = -2  # today's bar is partial; use yesterday
            else:
                idx = -1
            last_t, last_close = history[idx]
            # Gap-aware prev close: use the IMMEDIATELY preceding daily bar in the
            # RAW arrays (not the None-filtered history). If Yahoo dropped that day
            # (close is None — e.g. the 2026-06-09 Asia-wide outage), prev is
            # genuinely unknown. We must NOT silently reach two days back, which
            # would compute the daily move against the wrong trading day.
            try:
                _p = ts.index(last_t)
            except ValueError:
                _p = -1
            prev_close = closes[_p - 1] if _p >= 1 else None
            date_iso = datetime.fromtimestamp(last_t, tz=market_tz).strftime("%Y-%m-%d")

            # Asian indices: Yahoo sometimes leaves yesterday's daily bar as None
            # but exposes that close in meta.regularMarketPrice / regularMarketTime.
            # If rmt represents a completed session newer than the last valid
            # historical bar AND we're outside today's regular session, prefer it.
            rmt = meta.get("regularMarketTime")
            rmp = meta.get("regularMarketPrice")
            cpc = meta.get("chartPreviousClose")
            in_session_now = (
                regular_start is not None
                and regular_end is not None
                and regular_start <= now_utc < regular_end
            )
            if rmt and rmp and not in_session_now and rmt > last_t:
                rmt_date_iso = datetime.fromtimestamp(rmt, tz=market_tz).strftime(
                    "%Y-%m-%d"
                )
                if rmt_date_iso != date_iso:
                    return rmp, last_close, rmt_date_iso

            # In-session case (KOSPI/Nikkei/ASX 等盤中):
            # idx=-2 取到的是「最後完整收盤」。但 5/18 daily bar 如果是 None，
            # history 過濾後 -2 會跳到 5/15，落後一天。
            # 此時 meta.chartPreviousClose = 盤中市場的上個交易日收盤 = 真正的 5/18 close。
            if in_session_now and cpc:
                today_dt = datetime.fromtimestamp(now_utc, tz=market_tz).date()
                prev_dt = today_dt - timedelta(days=1)
                while prev_dt.weekday() >= 5:  # 跳過 Sat/Sun
                    prev_dt -= timedelta(days=1)
                chosen_date = datetime.fromtimestamp(last_t, tz=market_tz).date()
                if chosen_date < prev_dt and abs(cpc - last_close) > 1e-6:
                    # last_close 是我們原本要回傳的「stale 完整收盤」（如 5/15），
                    # 它正好可以當「再前一個交易日收盤」用來算 daily_pct。
                    return cpc, last_close, prev_dt.isoformat()
            return last_close, prev_close, date_iso
        except Exception:
            continue
    return None, None, None


# Index name → Yahoo symbol
US_INDEX_SYMBOLS = {
    "S&P 500": "^GSPC",
    "Nasdaq": "^IXIC",
    "Nasdaq Composite": "^IXIC",
    "Dow Jones": "^DJI",
    "PHLX Semiconductor": "^SOX",
    "Nikkei 225": "^N225",
    "Hang Seng": "^HSI",
    "Hang Seng 恆生": "^HSI",
    "恆生": "^HSI",
    "KOSPI": "^KS11",
    "上證": "000001.SS",
    "Shanghai Composite": "000001.SS",
    "Shanghai 上證": "000001.SS",
    "滬深300": "000300.SS",
    "CSI 300": "000300.SS",
    "CSI 300 滬深300": "000300.SS",
    "Nifty 50": "^NSEI",
    "ASX 200": "^AXJO",
    "S&P/ASX 200": "^AXJO",
    "DAX": "^GDAXI",
    "FTSE 100": "^FTSE",
    "CAC 40": "^FCHI",
    "Euro Stoxx 50": "^STOXX50E",
}


def refresh_other_indices(market):
    for idx in market.get("indices", []):
        name = idx.get("name")
        if name in ("TAIEX", "TAIEX 加權指數", "加權指數"):
            continue
        sym = US_INDEX_SYMBOLS.get(name)
        if not sym:
            continue
        close, prev, date_iso = fetch_yahoo_quote(sym)
        if close is None:
            continue
        # Skip sanity check when closing_date advances — a new day's close is
        # always genuine; sanity check only guards same-day realtime glitches.
        date_advanced = date_iso and date_iso > (idx.get("closing_date") or "")
        if not date_advanced and not _sane_override(
            name, idx.get("close"), close, MAX_DEV_INDEX
        ):
            continue
        idx["close"] = close
        if prev:
            idx["daily_pct"] = round((close - prev) / prev * 100, 2)
        else:
            # 前一交易日 bar 缺漏(Yahoo gap)→ 日漲跌不可知。寧可顯示「—」,
            # 也不要拿「前天」當昨收算出一個自信卻錯誤的數字;Yahoo 回補後自癒。
            idx["daily_pct"] = None
            print(
                f"refresh_idx: ⚠️ {name} 前一交易日資料缺漏,daily 設「—」(待 Yahoo 回補)"
            )
        idx["closing_date"] = date_iso
        print(f"refresh_idx: ✓ {name} {close} ({idx.get('daily_pct')}%) {date_iso}")


# 台股兩大指數(TAIEX t00 / 櫃買加權 o00)改用 TWSE MIS 即時 API(官方、雲端可達)。
# 為何不用 Yahoo:
#  1) 櫃買(^TWOII) daily 長期落後 1~2 交易日、常整天 None,且原本沒有 realtime 退路。
#  2) TAIEX(^TWII) 雖有 Yahoo 退路,但 Yahoo 偶爾漏掉某一交易日的 bar(例:06-09 回
#     None)→ fetch_yahoo_quote 把 None 濾掉後,「昨收」會誤抓成「前天」收盤,使單日
#     漲跌% 算錯(06-10 實際 -3.31% 被算成 -0.64%)。
# MIS 的 y 欄位 = 該指數「真正的前一交易日收盤」(官方參考價),不會有這個 gap 問題。
# 盤中(13:35 前)z 只是 intraday 部分價,故只在收盤後採用;盤中保留既有確定收盤
# (carry-forward,不拿浮動值蓋掉昨日終值)。
TW_MIS_URL = (
    "https://mis.twse.com.tw/stock/api/getStockInfo.jsp"
    "?ex_ch=tse_t00.tw|otc_o00.tw&json=1"
)
TW_MIS_INDICES = {"t00": "TAIEX 加權指數", "o00": "OTC 櫃買加權"}
# MIS 偶爾 502/超時(雲端尤甚)→ 退回 gap-aware Yahoo,至少更新收盤;昨收缺則 daily「—」。
TW_YAHOO_FALLBACK = {"t00": "^TWII", "o00": "^TWOII"}
TW_SESSION_FINAL_HHMM = (13, 35)  # 13:30 收盤,留幾分鐘讓 MIS 落定終值


def _float_or_none(v):
    try:
        f = float(v)
        return f if f > 0 else None
    except (TypeError, ValueError):
        return None


def _fetch_mis(attempts: int = 4):
    """GET the MIS index quotes with retries (rides through transient 502s).

    Returns msgArray (list) on success, or None if all attempts fail.
    """
    import time as _time

    for a in range(attempts):
        try:
            r = requests.get(
                TW_MIS_URL,
                headers={"User-Agent": UA, "Referer": "https://mis.twse.com.tw/"},
                timeout=8,
            )
            r.raise_for_status()
            return r.json().get("msgArray") or []
        except (requests.RequestException, ValueError) as e:
            if a == attempts - 1:
                print(f"refresh_tw_indices: ⚠️ MIS fetch failed after {attempts}x ({e})")
                return None
            _time.sleep(2 * (a + 1))
    return None


def _apply_tw_row(market, name, close, prev, date_iso, src):
    """Overwrite a TW index row, guarding sanity + never moving the date backward."""
    row = next((i for i in market.get("indices", []) if i.get("name") == name), None)
    if row is None or close is None:
        return False
    cur_date = row.get("closing_date")
    if cur_date and date_iso < cur_date:
        print(
            f"refresh_tw_indices[{src}]: ⏭ {name} {date_iso} 比既有 {cur_date} 舊,不回退"
        )
        return False
    if not _sane_override(name, row.get("close"), close, MAX_DEV_INDEX):
        return False
    row["close"] = close
    # 有真正昨收 → 算 daily;缺(Yahoo gap)→ 設 None 顯示「—」,不拿前天硬算錯數字。
    row["daily_pct"] = round((close - prev) / prev * 100, 2) if prev else None
    row["closing_date"] = date_iso
    # 註:mtd_pct/ytd_pct 仍沿用 parse_market 由 markdown 帶入的基準(MIS 無歷史序列)。
    tag = "" if prev else "(daily「—」:前一交易日缺)"
    print(
        f"refresh_tw_indices[{src}]: ✓ {name} {close} "
        f"({row.get('daily_pct')}%) {date_iso} {tag}"
    )
    return True


def _committed_market():
    """data/market.json as of git HEAD — the last *committed* numbers, captured
    BEFORE build_market_json.py rebuilt the on-disk file from the Yahoo upstream.

    Why we need it: every run rebuilds market.json fresh, which resets the two TW
    indices to the Yahoo base. Yahoo intermittently drops a TW daily bar, so that
    base is often a day or two stale. When this run can't fetch a newer *completed*
    session (pre-close, or MIS+Yahoo both fail), carry-forward would otherwise keep
    that stale rebuilt base and REGRESS past a good value a previous run already
    committed. This lets _guard_tw_no_regress() restore the last good value instead.
    Returns the parsed dict, or None if unavailable (degrades safely).
    """
    import subprocess

    root = MARKET.resolve().parent.parent  # .../<repo>/data/market.json → repo root
    try:
        out = subprocess.run(
            ["git", "show", "HEAD:data/market.json"],
            cwd=str(root),
            capture_output=True,
            text=True,
            timeout=10,
        )
        if out.returncode == 0 and out.stdout.strip():
            return json.loads(out.stdout)
    except Exception as e:  # noqa: BLE001
        print(f"refresh_tw_indices: ℹ️ 讀取上次 committed market.json 失敗 ({e})")
    return None


def _guard_tw_no_regress(market, committed):
    """Never let a TW index row end this run OLDER than the last committed close.

    If this run's value for a TW index is dated earlier than what git HEAD holds
    (i.e. the Yahoo rebuild regressed it and nothing newer landed), restore the
    committed close/daily/date/MTD/YTD so a good value, once captured, sticks
    until a later run advances it to a genuinely newer completed session.
    """
    if not committed:
        return
    prev_rows = {i.get("name"): i for i in committed.get("indices", [])}
    for name in TW_MIS_INDICES.values():
        cur = next(
            (i for i in market.get("indices", []) if i.get("name") == name), None
        )
        old = prev_rows.get(name)
        if not cur or not old:
            continue
        cd, od = cur.get("closing_date"), old.get("closing_date")
        if cd and od and cd < od:
            for k in ("close", "daily_pct", "closing_date", "mtd_pct", "ytd_pct"):
                if k in old:
                    cur[k] = old[k]
            print(
                f"refresh_tw_indices: ↩️ {name} 還原上次 committed {od}"
                f"(本次重建退化到 {cd},無更新完整收盤)"
            )


def refresh_tw_indices(market):
    """Overwrite TAIEX + OTC 櫃買加權 from the TWSE MIS realtime API.

    Uses MIS `y` (official prior-session close) for the daily %, avoiding the
    Yahoo missing-bar gap that mis-computed the change against two days ago.
    Skips (carry-forward) while a session is still open so each row only ever
    holds a finished daily close. On MIS failure, falls back to gap-aware Yahoo.
    Finally guards against regressing past the last committed close.
    """
    committed = _committed_market()
    arr = _fetch_mis()
    now = datetime.now(TPE)
    today = now.strftime("%Y%m%d")
    by_code = {m.get("c"): m for m in (arr or [])}

    for code, name in TW_MIS_INDICES.items():
        q = by_code.get(code)
        applied = False
        if q:
            close = _float_or_none(q.get("z"))  # 最新成交(收盤後=當日終值)
            prev = _float_or_none(q.get("y"))  # 真正的前一交易日收盤
            date_raw = q.get("d") or ""  # YYYYMMDD
            if close is not None and len(date_raw) == 8:
                session_done = date_raw < today or (
                    date_raw == today
                    and (now.hour, now.minute) >= TW_SESSION_FINAL_HHMM
                )
                if not session_done:
                    # 盤中:carry-forward 既有確定收盤(不採 intraday、也不退回 Yahoo)。
                    print(
                        f"refresh_tw_indices: ⏸ {name} {date_raw} 盤中尚未收盤,保留既有值"
                    )
                    continue
                date_iso = f"{date_raw[:4]}-{date_raw[4:6]}-{date_raw[6:]}"
                applied = _apply_tw_row(market, name, close, prev, date_iso, "MIS")

        if not applied:
            # MIS 不可用(502/缺值)→ gap-aware Yahoo 退路:至少更新收盤,
            # 昨收缺則 daily「—」,勝過卡在更舊的 markdown 值;_apply 內含不回退守門。
            sym = TW_YAHOO_FALLBACK.get(code)
            yc, yp, yd = fetch_yahoo_quote(sym) if sym else (None, None, None)
            if yc is not None:
                _apply_tw_row(market, name, yc, yp, yd, "Yahoo-fallback")
            else:
                print(f"refresh_tw_indices: ⚠️ {name} MIS+Yahoo 皆失敗,保留既有值")

    # 收尾守門:本次若沒抓到更新的完整收盤,別讓 Yahoo 重建把已 committed 的好值洗回更舊。
    _guard_tw_no_regress(market, committed)


# FX symbols on Yahoo — keys must match market.json `name` field exactly
FX_YAHOO = {
    "DXY 美元指數": "DX-Y.NYB",
    "EUR/USD": "EURUSD=X",
    "USD/JPY": "JPY=X",
    "GBP/USD": "GBPUSD=X",
    "USD/CNY": "CNY=X",
    "USD/TWD": "TWD=X",
}


BOND_YAHOO = {
    "US 10-Year": "^TNX",  # Yahoo only has US 10Y/5Y/30Y; not 2Y/DE/JP/UK
}


# investing.com fallback for non-US 10Y bonds + US 2Y (Yahoo doesn't carry them)
BOND_INVESTING = {
    "US 2-Year": "https://www.investing.com/rates-bonds/u.s.-2-year-bond-yield",
    "Germany 10-Year": "https://www.investing.com/rates-bonds/germany-10-year-bond-yield",
    "Japan 10-Year": "https://www.investing.com/rates-bonds/japan-10-year-bond-yield",
    "UK 10-Year": "https://www.investing.com/rates-bonds/uk-10-year-bond-yield",
}


def fetch_investing_bond(url: str):
    """Scrape last yield + daily change (percentage-point) from investing.com.
    Returns (yield_pct, daily_change_pp, date_iso) or (None, None, None)."""
    import re as _re
    import time as _time

    browser_ua = (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
    )
    headers = {"User-Agent": browser_ua, "Accept-Language": "en-US,en;q=0.9"}
    for attempt in range(3):
        try:
            r = requests.get(url, headers=headers, timeout=10)
            r.raise_for_status()
            html = r.text
            m = _re.search(r'data-test="instrument-price-last"[^>]*>([\d.]+)', html)
            m2 = _re.search(
                r'data-test="instrument-price-change"[^>]*>([+\-\d.]+)', html
            )
            if m:
                y = float(m.group(1))
                dch = float(m2.group(1)) if m2 else None
                date_iso = datetime.now(TPE).strftime("%Y-%m-%d")
                return y, dch, date_iso
        except Exception:
            _time.sleep(1)
    return None, None, None


def refresh_bonds(market):
    """Refresh bond yields: Yahoo (US 10Y) + investing.com (US 2Y, DE/JP/UK 10Y)."""
    for b in market.get("bonds", []):
        name = b.get("name")
        sym = BOND_YAHOO.get(name)
        if sym:
            close, prev, date_iso = fetch_yahoo_quote(sym)
            if close is None:
                continue
            b["yield_pct"] = round(close, 2)
            if prev:
                # bp change = (today - prev) * 100, since rate is in %
                b["daily_bps"] = round((close - prev) * 100, 1)
            b["closing_date"] = date_iso
            # MTD bps from history
            hist = fetch_yahoo_history_full(sym)
            if hist:
                last_date_iso, last_close = hist[-1]
                month_start_iso = last_date_iso[:7] + "-01"
                month_base = None
                for d, c in hist:
                    if d < month_start_iso:
                        month_base = c
                if month_base:
                    b["mtd_bps"] = round((close - month_base) * 100, 1)
            print(
                f"refresh_bond: ✓ {name} y={b['yield_pct']}% "
                f"d_bps={b.get('daily_bps')} mtd_bps={b.get('mtd_bps')} "
                f"{date_iso} [yahoo]"
            )
            continue
        inv_url = BOND_INVESTING.get(name)
        if inv_url:
            y, dch, date_iso = fetch_investing_bond(inv_url)
            if y is None:
                continue
            b["yield_pct"] = round(y, 2)
            # investing.com daily change is in percentage points; ×100 = bps
            b["daily_bps"] = round(dch * 100, 1) if dch is not None else None
            b["closing_date"] = date_iso
            # MTD not available without paid history; leave as-is (likely None)
            print(
                f"refresh_bond: ✓ {name} y={b['yield_pct']}% "
                f"d_bps={b.get('daily_bps')} {date_iso} [investing]"
            )


def refresh_fx(market):
    for f in market.get("fx", []):
        name = f.get("name")
        sym = FX_YAHOO.get(name)
        if not sym:
            continue
        close, prev, date_iso = fetch_yahoo_quote(sym)
        if close is None:
            continue
        if not _sane_override(name, f.get("close"), close, MAX_DEV_FX):
            continue
        f["close"] = close
        if prev:
            f["daily_pct"] = round((close - prev) / prev * 100, 2)
        f["closing_date"] = date_iso
        # Compute MTD/YTD from history
        hist = fetch_yahoo_history_full(sym)
        if hist:
            mtd, ytd = compute_mtd_ytd(hist)
            if mtd is not None:
                f["mtd_pct"] = mtd
            if ytd is not None:
                f["ytd_pct"] = ytd
        print(
            f"refresh_fx: ✓ {name} {close} ({f.get('daily_pct')}%) "
            f"M={f.get('mtd_pct')} Y={f.get('ytd_pct')} {date_iso}"
        )


def fetch_yahoo_history_full(symbol):
    """Yahoo 1y history. Returns [(date_iso, close), ...]."""
    hosts = ["query2.finance.yahoo.com", "query1.finance.yahoo.com"]
    for host in hosts:
        try:
            r = requests.get(
                f"https://{host}/v8/finance/chart/{symbol}?interval=1d&range=1y",
                headers={"User-Agent": UA},
                timeout=8,
            )
            if r.status_code == 429:
                continue
            r.raise_for_status()
            d = r.json()
            result = d["chart"]["result"][0]
            ts = result.get("timestamp") or []
            closes = (
                result.get("indicators", {}).get("quote", [{}])[0].get("close") or []
            )
            out = []
            for t, c in zip(ts, closes):
                if c is None:
                    continue
                date_iso = datetime.fromtimestamp(t, tz=TPE).strftime("%Y-%m-%d")
                out.append((date_iso, c))
            return out
        except Exception:
            continue
    return []


def compute_mtd_ytd(history):
    if not history:
        return None, None
    last_date_iso, last_close = history[-1]
    if last_close is None:
        return None, None
    month_start_iso = last_date_iso[:7] + "-01"
    year_start_iso = last_date_iso[:4] + "-01-01"
    month_base, year_base = None, None
    for date_iso, close in history:
        if date_iso < month_start_iso:
            month_base = close
        if date_iso < year_start_iso:
            year_base = close
    mtd = round((last_close - month_base) / month_base * 100, 2) if month_base else None
    ytd = round((last_close - year_base) / year_base * 100, 2) if year_base else None
    return mtd, ytd


def regenerate_summary(market):
    # parse_market 從 .md 散文讀 summary，但 refresh_*() 之後 indices 數字已換新；
    # 不重寫的話 summary 會跟表格對不上（前一日的觀點配當日數字）。
    indices = [
        i
        for i in market.get("indices", [])
        if isinstance(i.get("daily_pct"), (int, float))
    ]
    if len(indices) < 3:
        return

    def short_date(iso):
        # "2026-06-24" -> "6/24"；無日期則回空字串
        parts = (iso or "").split("-")
        return f"{int(parts[1])}/{int(parts[2])}" if len(parts) == 3 else ""

    def fmt(i):
        # 指數行情鐵則：提到指數漲跌一律附上該行情所屬日期
        d = short_date(i.get("closing_date"))
        prefix = f"{d} " if d else ""
        return f"{prefix}{i['name']} {i['daily_pct']:+.2f}%"

    ranked = sorted(indices, key=lambda i: i["daily_pct"], reverse=True)
    gainers = [i for i in ranked if i["daily_pct"] > 0][:3]
    losers = [i for i in reversed(ranked) if i["daily_pct"] < 0][:2]

    parts = []
    if gainers:
        parts.append("、".join(fmt(i) for i in gainers) + " 領漲")
    if losers:
        parts.append("、".join(fmt(i) for i in losers) + " 走弱")

    market["summary"] = "；".join(parts) + "。" if parts else "全市場持平。"
    print(f"regenerate_summary: ✓ {market['summary']}")


def main():
    if not MARKET.exists():
        print("market.json not found")
        return
    market = json.loads(MARKET.read_text("utf-8"))
    refresh_tw_indices(market)  # TAIEX + 櫃買加權,官方 MIS,正確昨收
    refresh_other_indices(market)
    refresh_fx(market)
    refresh_bonds(market)
    # Update top-level closing_date to the MAX of all indices' per-row dates,
    # so the card preview shows the latest available trading day instead of
    # stale .md frontmatter.
    dates = [
        i.get("closing_date")
        for i in market.get("indices", [])
        if i.get("closing_date")
    ]
    if dates:
        market["closing_date"] = max(dates)
        print(f"market.closing_date set to {market['closing_date']}")
    regenerate_summary(market)
    MARKET.write_text(json.dumps(market, ensure_ascii=False, indent=2), "utf-8")


if __name__ == "__main__":
    sys.exit(main())
