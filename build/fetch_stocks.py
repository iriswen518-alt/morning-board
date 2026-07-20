#!/usr/bin/env python3
"""
fetch_stocks.py — Fetch US + TW stock prices + MTD/YTD.

Sources:
  US price + daily%:   finnhub.io /quote  (free, 60/min, requires API key)
  US MTD/YTD:          Yahoo Finance v8 chart (1y) — best-effort
  TW price + daily%:   TWSE 即時行情 (mis.twse.com.tw)
  TW MTD/YTD:          TWSE STOCK_DAY (twse.com.tw/exchangeReport/STOCK_DAY)

API key: read from ~/scripts/.env  (FINNHUB_API_KEY=xxx)
Output:  repo/data/stocks.json
"""

from __future__ import annotations

import json
import os
import sys
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent
OUTPUT_FILE = ROOT / "repo" / "data" / "stocks.json"

UA = "Mozilla/5.0"  # Yahoo blocks long detailed UAs; short one works
TPE = timezone(timedelta(hours=8))


def load_finnhub_key():
    env = Path.home() / "scripts" / ".env"
    if env.exists():
        for line in env.read_text().splitlines():
            if line.startswith("FINNHUB_API_KEY="):
                return line.split("=", 1)[1].strip()
    return os.environ.get("FINNHUB_API_KEY", "")


FINNHUB_KEY = load_finnhub_key()


# 精選美股＝道瓊／S&P500／費半（SOX）重要成分股（2026-07-20 定案）
US_STOCKS = [
    # S&P500 權值（多檔亦為道瓊成分）
    ("NVDA", "輝達"),
    ("AAPL", "蘋果"),
    ("MSFT", "微軟"),
    ("GOOGL", "字母"),
    ("AMZN", "亞馬遜"),
    ("META", "Meta"),
    ("TSLA", "特斯拉"),
    ("LLY", "禮來"),
    # 道瓊藍籌
    ("JPM", "摩根大通"),
    ("V", "Visa"),
    ("UNH", "聯合健康"),
    ("WMT", "沃爾瑪"),
    ("GS", "高盛"),
    ("KO", "可口可樂"),
    ("CAT", "開拓重工"),
    # 費半（SOX）核心
    ("AVGO", "博通"),
    ("TSM", "台積電ADR"),
    ("AMD", "超微"),
    ("QCOM", "高通"),
    ("TXN", "德州儀器"),
    ("INTC", "英特爾"),
    ("MU", "美光"),
    ("AMAT", "應用材料"),
    ("ASML", "艾司摩爾"),
]

TW_STOCKS = [
    ("0050", "元大台灣50"),
    ("2330", "台積電"),
    ("2317", "鴻海"),
    ("2454", "聯發科"),
    ("2308", "台達電"),
    ("2382", "廣達"),
    ("2891", "中信金"),
    ("1301", "台塑"),
]


# === US: finnhub for price + daily; Yahoo (best-effort) for MTD/YTD ===


def fetch_finnhub_quote(symbol):
    """Returns dict with c, dp, t (current, change%, timestamp)."""
    if not FINNHUB_KEY:
        return {}
    try:
        r = requests.get(
            "https://finnhub.io/api/v1/quote",
            params={"symbol": symbol, "token": FINNHUB_KEY},
            timeout=10,
        )
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"   ! finnhub {symbol}: {e}")
        return {}


def pe_from_finnhub_metric(data):
    """finnhub /stock/metric JSON → trailing P/E (peTTM) float or None."""
    if not isinstance(data, dict):
        return None
    v = (data.get("metric") or {}).get("peTTM")
    try:
        f = float(v)
    except (ValueError, TypeError):
        return None
    return f if f > 0 else None


def fetch_finnhub_pe(symbol):
    """Trailing P/E via finnhub /stock/metric. Returns float or None."""
    if not FINNHUB_KEY:
        return None
    try:
        r = requests.get(
            "https://finnhub.io/api/v1/stock/metric",
            params={"symbol": symbol, "metric": "all", "token": FINNHUB_KEY},
            timeout=10,
        )
        r.raise_for_status()
        return pe_from_finnhub_metric(r.json())
    except Exception as e:  # noqa: BLE001
        print(f"   ! finnhub PE {symbol}: {e}")
        return None


# === TW: trailing P/E via TWSE BWIBBU_ALL (finnhub is US-only) ===
TWSE_BWIBBU = "https://openapi.twse.com.tw/v1/exchangeReport/BWIBBU_ALL"


def clean_tw_pe(val):
    """TWSE BWIBBU PEratio (e.g. '32.60', '0.00', '-') → float P/E or None.

    Rejects non-numeric ('-', '') and non-positive (0/負, 即無盈餘) values.
    """
    try:
        f = float(val)
    except (ValueError, TypeError):
        return None
    return f if f > 0 else None


def tw_pe_map_from_bwibbu(rows):
    """TWSE BWIBBU_ALL rows → {code: trailing P/E float}, dropping invalid."""
    out = {}
    if not isinstance(rows, list):
        return out
    for r in rows:
        if not isinstance(r, dict):
            continue
        code = str(r.get("Code", "")).strip()
        pe = clean_tw_pe(r.get("PEratio"))
        if code and pe is not None:
            out[code] = pe
    return out


def fetch_tw_pe_map():
    """Fetch TWSE BWIBBU_ALL → {code: trailing P/E}. Returns {} on failure."""
    try:
        r = requests.get(TWSE_BWIBBU, timeout=15)
        r.raise_for_status()
        return tw_pe_map_from_bwibbu(r.json())
    except Exception as e:  # noqa: BLE001
        print(f"   ! TWSE BWIBBU P/E: {e}")
        return {}


def fetch_yahoo_history(symbol, exchange_tz_offset_hours=None, range_str="5y"):
    """Yahoo v8 chart (default 5y). Returns list of (date_iso, close) using
    market's local timezone (so US close at 16:00 ET shows as 5/11, not 5/12
    TPE). range_str examples: "1y", "5y", "10y", "max"."""
    hosts = ["query2.finance.yahoo.com", "query1.finance.yahoo.com"]
    for host in hosts:
        try:
            r = requests.get(
                f"https://{host}/v8/finance/chart/"
                f"{symbol}?interval=1d&range={range_str}",
                headers={"User-Agent": UA},
                timeout=8,
            )
            if r.status_code == 429:
                continue
            r.raise_for_status()
            d = r.json()
            result = d["chart"]["result"][0]
            meta = result.get("meta", {})
            # Get exchange timezone offset
            tz_offset = exchange_tz_offset_hours
            if tz_offset is None:
                gmtoff = meta.get("gmtoffset")
                if gmtoff is not None:
                    tz_offset = gmtoff / 3600
                else:
                    tz_offset = 8  # default TPE
            market_tz = timezone(timedelta(hours=tz_offset))
            ts = result.get("timestamp") or []
            closes = (
                result.get("indicators", {}).get("quote", [{}])[0].get("close") or []
            )
            out = []
            for t, c in zip(ts, closes):
                if c is None:
                    continue
                date_iso = datetime.fromtimestamp(t, tz=market_tz).strftime("%Y-%m-%d")
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


def compute_long_perf(history):
    """1Y / 3Y / 5Y total return (excludes dividends — pure price return).
    Anchors: last_close vs close on or just before (last_date − N*365 days).
    Returns {"1y": pct or None, "3y": ..., "5y": ...}."""
    out = {"1y": None, "3y": None, "5y": None}
    if not history:
        return out
    last_date_iso, last_close = history[-1]
    if last_close is None:
        return out
    try:
        last_dt = datetime.strptime(last_date_iso, "%Y-%m-%d").date()
    except ValueError:
        return out
    targets = {
        "1y": (last_dt - timedelta(days=365)).isoformat(),
        "3y": (last_dt - timedelta(days=365 * 3)).isoformat(),
        "5y": (last_dt - timedelta(days=365 * 5)).isoformat(),
    }
    anchors = {k: None for k in targets}
    for date_iso, close in history:
        for k, tgt in targets.items():
            if date_iso <= tgt:
                anchors[k] = close
    for k, base in anchors.items():
        if base:
            out[k] = round((last_close - base) / base * 100, 2)
    return out


# === TW: TWSE realtime + STOCK_DAY for history ===


def fetch_twse_realtime(symbols):
    ex_ch = "|".join(f"tse_{c}.tw" for c, _ in symbols)
    try:
        r = requests.get(
            "https://mis.twse.com.tw/stock/api/getStockInfo.jsp",
            params={"ex_ch": ex_ch, "json": 1, "delay": 0},
            headers={"User-Agent": UA, "Referer": "https://mis.twse.com.tw/stock/"},
            timeout=15,
        )
        r.raise_for_status()
        d = r.json()
    except Exception as e:
        print(f"   ! TWSE realtime fail: {e}")
        return {}
    out = {}
    for m in d.get("msgArray", []):
        code = m.get("c")
        try:
            last = float(m.get("z")) if m.get("z") not in ("", "-") else None
        except (TypeError, ValueError):
            last = None
        try:
            prev = float(m.get("y")) if m.get("y") not in ("", "-") else None
        except (TypeError, ValueError):
            prev = None
        chg_pct = None
        if last is not None and prev:
            chg_pct = round((last - prev) / prev * 100, 2)
        date = m.get("d")
        if date and len(date) == 8:
            date = f"{date[:4]}-{date[4:6]}-{date[6:]}"
        # is_realtime = 當下成交價（z）有值；盤前 z="-" 時為 False
        is_realtime = last is not None
        out[code] = {
            "price": last,
            "prev_close": prev,
            "change_pct": chg_pct,
            "market_date": date,
            "is_realtime": is_realtime,
        }
    return out


def fetch_twse_last_close(stock_no, today_iso=None):
    """抓 stock_no 最近一個交易日的 (date_iso, close)。盤前/休市備援。"""
    if today_iso:
        try:
            y, m, _ = today_iso.split("-")
            y, m = int(y), int(m)
        except ValueError:
            d = datetime.now(TPE)
            y, m = d.year, d.month
    else:
        d = datetime.now(TPE)
        y, m = d.year, d.month
    data = fetch_twse_stock_day(stock_no, f"{y:04d}{m:02d}01")
    time.sleep(0.3)
    if not data:
        pm = m - 1 or 12
        py = y - 1 if m == 1 else y
        data = fetch_twse_stock_day(stock_no, f"{py:04d}{pm:02d}01")
        time.sleep(0.3)
    if data:
        return data[-1]  # (date_iso, close)
    return (None, None)


def fetch_twse_stock_day(stock_no, yyyymmdd):
    """Returns list of (YYYY-MM-DD, close) for the month containing yyyymmdd."""
    try:
        r = requests.get(
            "https://www.twse.com.tw/exchangeReport/STOCK_DAY",
            params={"response": "json", "date": yyyymmdd, "stockNo": stock_no},
            headers={"User-Agent": UA},
            timeout=10,
        )
        r.raise_for_status()
        d = r.json()
    except Exception as e:
        print(f"   ! TWSE STOCK_DAY {stock_no}/{yyyymmdd}: {e}")
        return []
    if d.get("stat") != "OK":
        return []
    fields = d.get("fields", [])
    close_idx = next((i for i, f in enumerate(fields) if "收盤" in f), None)
    if close_idx is None:
        return []
    out = []
    for row in d.get("data", []):
        try:
            close = float(row[close_idx].replace(",", ""))
            mg, mm, dd = row[0].split("/")
            yyyy = int(mg) + 1911
            out.append((f"{yyyy:04d}-{int(mm):02d}-{int(dd):02d}", close))
        except (ValueError, IndexError):
            continue
    return out


def compute_tw_mtd_ytd(stock_no, today_date_iso, today_close):
    """For a TW stock: fetch prev month + Dec of last year to compute MTD/YTD."""
    if not today_date_iso or today_close is None:
        return None, None
    year, month, _ = today_date_iso.split("-")
    year, month = int(year), int(month)

    # MTD: last trading day close of previous month
    prev_y, prev_m = (year - 1, 12) if month == 1 else (year, month - 1)
    prev_month_data = fetch_twse_stock_day(stock_no, f"{prev_y:04d}{prev_m:02d}01")
    time.sleep(0.5)
    mtd = None
    if prev_month_data:
        prev_month_end_close = prev_month_data[-1][1]
        mtd = round(
            (today_close - prev_month_end_close) / prev_month_end_close * 100, 2
        )

    # YTD: last trading day close of last December (year-end)
    dec_data = fetch_twse_stock_day(stock_no, f"{year - 1:04d}1201")
    time.sleep(0.5)
    ytd = None
    if dec_data:
        year_end_close = dec_data[-1][1]
        ytd = round((today_close - year_end_close) / year_end_close * 100, 2)

    return mtd, ytd


def load_previous():
    if not OUTPUT_FILE.exists():
        return {}
    try:
        old = json.loads(OUTPUT_FILE.read_text("utf-8"))
    except Exception:
        return {}
    table = {}
    for r in old.get("us_stocks", []):
        table[("US", r["symbol"])] = r
    for r in old.get("tw_stocks", []):
        table[("TW", r["symbol"])] = r
    return table


def merge_with_previous(rec, prev):
    if not prev:
        return rec
    # MTD/YTD + long-term perf: silent inherit
    for f in ("mtd_pct", "ytd_pct", "perf_1y", "perf_3y", "perf_5y"):
        if rec.get(f) is None and prev.get(f) is not None:
            rec[f] = prev.get(f)
    # Price: inherit + mark stale
    if rec.get("price") is None and prev.get("price") is not None:
        for f in ("price", "market_date", "change_pct"):
            if rec.get(f) is None and prev.get(f) is not None:
                rec[f] = prev.get(f)
        rec["error"] = "stale"
    return rec


def main():
    if not FINNHUB_KEY:
        print("[warn] FINNHUB_API_KEY not set — US fetch will fail")
    previous = load_previous()
    out = {
        "generated_at": datetime.now(TPE).isoformat(timespec="seconds"),
        "source": "finnhub (US price+daily) + Yahoo (US MTD/YTD) + TWSE (TW)",
        "us_stocks": [],
        "tw_stocks": [],
    }

    # === US ===
    print("[fetch] US stocks (finnhub + Yahoo) ...", flush=True)
    # US Eastern Time = UTC-4 in DST (most of year), UTC-5 in standard time
    # Approximation: use -4 (covers most of year incl. May)
    ET = timezone(timedelta(hours=-4))
    for sym, name in US_STOCKS:
        q = fetch_finnhub_quote(sym)
        price = q.get("c")
        chg_pct = q.get("dp")
        ts = q.get("t")
        market_date = None
        if ts:
            # Use Eastern Time so close at 16:00 ET shows as that date
            market_date = datetime.fromtimestamp(ts, tz=ET).strftime("%Y-%m-%d")
        mtd_pct, ytd_pct = None, None
        long_perf = {"1y": None, "3y": None, "5y": None}
        if price:
            try:
                hist = fetch_yahoo_history(
                    sym, exchange_tz_offset_hours=-4, range_str="5y"
                )
                if hist:
                    mtd_pct, ytd_pct = compute_mtd_ytd(hist)
                    long_perf = compute_long_perf(hist)
            except Exception:
                pass
        rec = {
            "symbol": sym,
            "name_zh": name,
            "kind": "US",
            "price": price if price else None,
            "change_pct": round(chg_pct, 2) if chg_pct is not None else None,
            "mtd_pct": mtd_pct,
            "ytd_pct": ytd_pct,
            "perf_1y": long_perf["1y"],
            "perf_3y": long_perf["3y"],
            "perf_5y": long_perf["5y"],
            "market_date": market_date,
            "source_url": (
                f"https://bopfund.moneydj.com/w/wj/iQuoteChart.djhtm?a={sym}.US"
            ),
            "error": None if price else "no_data",
        }
        rec = merge_with_previous(rec, previous.get(("US", sym)))
        rec["per"] = (
            fetch_finnhub_pe(rec["symbol"]) if rec.get("price") is not None else None
        )
        rec["per_kind"] = "trailing" if rec["per"] is not None else None
        out["us_stocks"].append(rec)
        if rec.get("price") is None:
            print(f"   ! {sym}: no data")
        else:
            badge = " [stale]" if rec.get("error") == "stale" else ""
            print(
                f"   ✓ {sym:6s} {name:8s} ${rec['price']:>10.2f}  "
                f"({(rec.get('change_pct') or 0):+.2f}%)  "
                f"M={(rec.get('mtd_pct') or 0):+.2f}% "
                f"Y={(rec.get('ytd_pct') or 0):+.2f}%  "
                f"{rec['market_date']}{badge}"
            )
        time.sleep(0.5)

    # === TW ===
    print("[fetch] TW stocks (TWSE) ...", flush=True)
    tw_data = fetch_twse_realtime(TW_STOCKS)
    tw_pe_map = fetch_tw_pe_map()  # 本益比：TWSE BWIBBU_ALL（上市）
    for sym, name in TW_STOCKS:
        d = tw_data.get(sym, {})
        price = d.get("price")
        change_pct = d.get("change_pct")
        market_date = d.get("market_date")
        is_realtime = d.get("is_realtime", False)

        # 盤前/休市備援：實時無 z（is_realtime=False），改用 STOCK_DAY 最近交易日收盤
        if not is_realtime:
            # 2026-05-25 修：直接抓本月 STOCK_DAY 拿最近兩個收盤計算 change_pct
            # 避免「盤前台股 7 檔全部缺日%」的問題
            from datetime import datetime as _dt

            now_tpe = _dt.now(TPE)
            month_data = fetch_twse_stock_day(
                sym, f"{now_tpe.year:04d}{now_tpe.month:02d}01"
            )
            time.sleep(0.3)
            if not month_data:
                # 月初 fallback：抓上月
                pm = now_tpe.month - 1 or 12
                py = now_tpe.year - 1 if now_tpe.month == 1 else now_tpe.year
                month_data = fetch_twse_stock_day(sym, f"{py:04d}{pm:02d}01")
                time.sleep(0.3)
            if month_data:
                last_dt, last_close = month_data[-1]
                price = last_close
                market_date = last_dt
                # 從 STOCK_DAY 抽倒數第二個收盤算前一交易日 → 最近交易日的 change_pct
                if len(month_data) >= 2:
                    prev_dt, prev_close = month_data[-2]
                    if prev_close and prev_close != 0:
                        change_pct = round(
                            (last_close - prev_close) / prev_close * 100, 2
                        )
                    else:
                        change_pct = None
                else:
                    # 本月只有 1 筆，去上月最後一筆當基準
                    pm = now_tpe.month - 1 or 12
                    py = now_tpe.year - 1 if now_tpe.month == 1 else now_tpe.year
                    prev_month_data = fetch_twse_stock_day(sym, f"{py:04d}{pm:02d}01")
                    time.sleep(0.3)
                    if prev_month_data:
                        _, prev_close = prev_month_data[-1]
                        if prev_close and prev_close != 0:
                            change_pct = round(
                                (last_close - prev_close) / prev_close * 100, 2
                            )

        mtd_pct, ytd_pct = None, None
        if price is not None and market_date:
            try:
                mtd_pct, ytd_pct = compute_tw_mtd_ytd(sym, market_date, price)
            except Exception as e:
                print(f"   ! {sym} MTD/YTD fail: {e}")
        # TW 1Y/3Y/5Y via Yahoo .TW symbol (avoids 60+ TWSE STOCK_DAY calls)
        long_perf = {"1y": None, "3y": None, "5y": None}
        if price is not None:
            try:
                hist = fetch_yahoo_history(
                    f"{sym}.TW", exchange_tz_offset_hours=8, range_str="5y"
                )
                if hist:
                    long_perf = compute_long_perf(hist)
            except Exception as e:
                print(f"   ! {sym} long perf fail: {e}")
        rec = {
            "symbol": sym,
            "name_zh": name,
            "kind": "TW",
            "price": price,
            "change_pct": change_pct,
            "mtd_pct": mtd_pct,
            "ytd_pct": ytd_pct,
            "perf_1y": long_perf["1y"],
            "perf_3y": long_perf["3y"],
            "perf_5y": long_perf["5y"],
            "market_date": market_date,
            "source_url": f"https://tw.stock.yahoo.com/quote/{sym}.TW",
            "error": None if price is not None else "no_data",
        }
        rec = merge_with_previous(rec, previous.get(("TW", sym)))
        rec["per"] = tw_pe_map.get(sym)
        rec["per_kind"] = "trailing" if rec["per"] is not None else None
        out["tw_stocks"].append(rec)
        if rec.get("price") is None:
            print(f"   ! {sym}: no data")
        else:
            badge = " [stale]" if rec.get("error") == "stale" else ""
            chg = rec.get("change_pct") or 0
            mtd = rec.get("mtd_pct") or 0
            ytd = rec.get("ytd_pct") or 0
            print(
                f"   ✓ {sym:6s} {name:6s} NT${rec['price']:>8.2f}  "
                f"({chg:+.2f}%)  M={mtd:+.2f}% Y={ytd:+.2f}%  "
                f"{rec['market_date']}{badge}"
            )

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(out, ensure_ascii=False, indent=2), "utf-8")
    us_ok = sum(1 for r in out["us_stocks"] if r["price"] is not None)
    tw_ok = sum(1 for r in out["tw_stocks"] if r["price"] is not None)
    print(
        f"[done] US {us_ok}/{len(out['us_stocks'])}  "
        f"TW {tw_ok}/{len(out['tw_stocks'])} → {OUTPUT_FILE}"
    )


if __name__ == "__main__":
    sys.exit(main())
