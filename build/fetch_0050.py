#!/usr/bin/env python3
"""
fetch_0050.py — 0050（元大台灣50）50 檔成分股的 日/月/年 漲跌幅 + 收盤價/收盤日。

沿用 fetch_stocks.py 的 TWSE 慣例（realtime + STOCK_DAY），輸出與 tw_stocks 相同的
逐檔 record 形狀，讓前端可直接複用 renderStocksTable 顯示「收盤／日／本月／今年／收盤日」。

在雲端 workflow 佈局下執行（work/ 內、work/repo 連到 git 根），
輸出 repo/data/etf0050.json。加進 morning-board-quotes.yml 每日隨報價一起刷新。

★ 成分股清單需每季手動維護（0050 每季調整）：見 CONSTITUENTS。
"""

from __future__ import annotations

import json
import time
from collections import Counter
from datetime import datetime, timezone, timedelta
from pathlib import Path

from fetch_stocks import (
    TPE,
    compute_tw_mtd_ytd,
    fetch_twse_realtime,
    fetch_twse_stock_day,
)

ROOT = Path(__file__).resolve().parent
OUTPUT_FILE = ROOT / "repo" / "data" / "etf0050.json"

# 0050 成分股（代號, 名稱）——需每季維護一次。
CONSTITUENTS = [
    ("2330", "台積電"),
    ("2317", "鴻海"),
    ("2454", "聯發科"),
    ("2308", "台達電"),
    ("2382", "廣達"),
    ("2891", "中信金"),
    ("2412", "中華電"),
    ("2881", "富邦金"),
    ("2882", "國泰金"),
    ("6505", "台塑化"),
    ("2303", "聯電"),
    ("3711", "日月光投控"),
    ("2886", "兆豐金"),
    ("1216", "統一"),
    ("2884", "玉山金"),
    ("2885", "元大金"),
    ("2892", "第一金"),
    ("2357", "華碩"),
    ("2880", "華南金"),
    ("2890", "永豐金"),
    ("3034", "聯詠"),
    ("2327", "國巨"),
    ("3231", "緯創"),
    ("2379", "瑞昱"),
    ("2603", "長榮"),
    ("5880", "合庫金"),
    ("2887", "台新金"),
    ("4938", "和碩"),
    ("2883", "凱基金"),
    ("1303", "南亞"),
    ("1301", "台塑"),
    ("2002", "中鋼"),
    ("2207", "和泰車"),
    ("3008", "大立光"),
    ("2801", "彰銀"),
    ("1326", "台化"),
    ("2395", "研華"),
    ("6669", "緯穎"),
    ("3661", "世芯-KY"),
    ("2345", "智邦"),
    ("2409", "友達"),
    ("5871", "中租-KY"),
    ("2618", "長榮航"),
    ("6446", "藥華藥"),
    ("2376", "技嘉"),
    ("3037", "欣興"),
    ("2408", "南亞科"),
    ("6415", "矽力-KY"),
    ("1101", "台泥"),
    ("2912", "統一超"),
]


def load_previous():
    """上次成功的逐檔數字，供本次抓不到時沿用（避免整格變 —）。"""
    if not OUTPUT_FILE.exists():
        return {}
    try:
        old = json.loads(OUTPUT_FILE.read_text("utf-8"))
    except Exception:
        return {}
    return {r["symbol"]: r for r in old.get("stocks", [])}


def inherit(rec, prev):
    """本次為 None 的欄位沿用上次值，並標記 stale。"""
    if not prev:
        return rec
    stale = False
    for k in ("price", "change_pct", "mtd_pct", "ytd_pct", "market_date"):
        if rec.get(k) is None and prev.get(k) is not None:
            rec[k] = prev[k]
            stale = True
    if stale:
        rec["stale"] = True
    return rec


def realtime_all(symbols):
    """分批抓即時（TWSE getStockInfo 單次符號數有上限，切 25 一批）。"""
    out = {}
    for i in range(0, len(symbols), 25):
        chunk = symbols[i : i + 25]
        out.update(fetch_twse_realtime(chunk))
        time.sleep(0.4)
    return out


def build():
    print(f"[fetch] 0050 成分股 × {len(CONSTITUENTS)}（TWSE）…", flush=True)
    previous = load_previous()
    rt = realtime_all(CONSTITUENTS)
    now_tpe = datetime.now(TPE)

    stocks = []
    for sym, name in CONSTITUENTS:
        d = rt.get(sym, {})
        price = d.get("price")
        change_pct = d.get("change_pct")
        market_date = d.get("market_date")
        is_realtime = d.get("is_realtime", False)

        # 盤前/休市備援：即時無成交價 → 用本月 STOCK_DAY 最近交易日收盤
        if not is_realtime:
            month_data = fetch_twse_stock_day(
                sym, f"{now_tpe.year:04d}{now_tpe.month:02d}01"
            )
            time.sleep(0.3)
            if not month_data:
                pm = now_tpe.month - 1 or 12
                py = now_tpe.year - 1 if now_tpe.month == 1 else now_tpe.year
                month_data = fetch_twse_stock_day(sym, f"{py:04d}{pm:02d}01")
                time.sleep(0.3)
            if month_data:
                last_dt, last_close = month_data[-1]
                price = last_close
                market_date = last_dt
                if len(month_data) >= 2:
                    prev_close = month_data[-2][1]
                    change_pct = (
                        round((last_close - prev_close) / prev_close * 100, 2)
                        if prev_close
                        else None
                    )

        mtd_pct, ytd_pct = (None, None)
        if price is not None and market_date:
            mtd_pct, ytd_pct = compute_tw_mtd_ytd(sym, market_date, price)

        rec = {
            "symbol": sym,
            "name_zh": name,
            "kind": "TW",
            "price": price,
            "change_pct": change_pct,
            "mtd_pct": mtd_pct,
            "ytd_pct": ytd_pct,
            "market_date": market_date,
            "source_url": f"https://tw.stock.yahoo.com/quote/{sym}.TW",
        }
        rec = inherit(rec, previous.get(sym))
        stocks.append(rec)

        ok = "✓" if rec.get("price") is not None else "!"
        print(
            f"   {ok} {sym:6s} {name:8s} "
            f"{(rec.get('price') or 0):>10.2f} "
            f"({(rec.get('change_pct') or 0):+.2f}%) "
            f"M={(rec.get('mtd_pct') or 0):+.2f}% Y={(rec.get('ytd_pct') or 0):+.2f}% "
            f"{rec.get('market_date')}",
            flush=True,
        )

    dates = [r["market_date"] for r in stocks if r.get("market_date")]
    market_date = Counter(dates).most_common(1)[0][0] if dates else ""
    out = {
        "built_at": now_tpe.strftime("%Y-%m-%dT%H:%M:%S+08:00"),
        "market_date": market_date,
        "stocks": stocks,
    }
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(out, ensure_ascii=False, indent=2), "utf-8")
    ok = sum(1 for r in stocks if r.get("price") is not None)
    print(f"[fetch] 0050 {ok}/{len(stocks)} → {OUTPUT_FILE}", flush=True)


if __name__ == "__main__":
    build()
