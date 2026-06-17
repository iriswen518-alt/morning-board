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
            prev_close = (
                history[idx - 1][1] if len(history) >= abs(idx - 1) + 1 else None
            )
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
        date_advanced = date_iso and date_iso > (idx.get("closing_date") or "")
        if not date_advanced and not _sane_override(
            name, idx.get("close"), close, MAX_DEV_INDEX
        ):
            continue
        idx["close"] = close
        if prev:
            idx["daily_pct"] = round((close - prev) / prev * 100, 2)
        idx["closing_date"] = date_iso
        print(f"refresh_idx: ✓ {name} {close} ({idx.get('daily_pct')}%) {date_iso}")


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


TAIFEX_FUT_URL = "https://openapi.taifex.com.tw/v1/DailyMarketReportFut"


def refresh_taifex_futures(market):
    """Update 台指期(近月) from TAIFEX open API. Always wins over stale markdown."""
    import re as _re

    try:
        r = requests.get(TAIFEX_FUT_URL, headers={"User-Agent": UA}, timeout=10)
        r.raise_for_status()
        data = r.json()
        tx = [
            row
            for row in data
            if row.get("Contract") == "TX"
            and row.get("TradingSession") == "一般"
            and _re.fullmatch(r"\d{6}", row.get("ContractMonth(Week)", ""))
            and row.get("Last") not in (None, "", "NULL", "-")
        ]
        if not tx:
            print("refresh_taifex_futures: 無 TX 近月資料")
            return
        near = min(tx, key=lambda row: row["ContractMonth(Week)"])
        last = float(str(near["Last"]).replace(",", ""))
        pct_txt = str(near.get("%", "")).replace("%", "").replace("+", "").strip()
        daily_pct = float(pct_txt) if pct_txt not in ("", "NULL", "-") else None
        d = near.get("Date", "")
        date_iso = f"{d[:4]}-{d[4:6]}-{d[6:]}" if _re.fullmatch(r"\d{8}", d) else None
        for idx in market.get("indices", []):
            if idx.get("name") == "台指期(近月)":
                date_advanced = date_iso and date_iso > (idx.get("closing_date") or "")
                if not date_advanced and not _sane_override(
                    "台指期", idx.get("close"), last, MAX_DEV_INDEX
                ):
                    return
                idx["close"] = last
                if daily_pct is not None:
                    idx["daily_pct"] = daily_pct
                if date_iso:
                    idx["closing_date"] = date_iso
                idx["note"] = f"近月 {near['ContractMonth(Week)']}"
                print(
                    f"refresh_taifex_futures: ✓ 台指期 {last} ({daily_pct}%) {date_iso}"
                )
                return
        print("refresh_taifex_futures: market.json 中找不到 台指期(近月) 欄位")
    except Exception as e:
        print(f"refresh_taifex_futures: ⚠️ {e}")


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

    def fmt(i):
        return f"{i['name']} {i['daily_pct']:+.2f}%"

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
    refresh_taiex(market)
    refresh_other_indices(market)
    refresh_taifex_futures(market)
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
