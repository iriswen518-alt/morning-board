#!/usr/bin/env python3
"""fetch_tpex_quotes.py — 抓 TPEx 上櫃股／ETF 當日收盤行情，產出靜態 JSON
給 morning_board PWA 在 Yahoo 暫時失效時做同源 fallback。

來源：https://www.tpex.org.tw/openapi/v1/tpex_mainboard_daily_close_quotes
（TPEx 主板，涵蓋上櫃個股 + 上櫃 ETF；CORS 未開放，需後端代抓）

輸出：repo/data/tpex_quotes.json
  {
    "date": "1150525",          # ROC 民國日期（API 原樣）
    "isoDate": "2026-05-25",
    "asOf": "2026-05-26T00:00:00+08:00",
    "quotes": {
      "4174": {
        "code": "4174", "name": "浩鼎",
        "close": 30.35, "open": 31.95, "high": 31.95, "low": 30.35,
        "change": -1.30, "prevClose": 31.65, "changePct": -4.11,
        "volume": 847309, "transactionAmount": 26021893,
        "currency": "TWD"
      }, ...
    }
  }
"""
from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "repo" / "data" / "tpex_quotes.json"
TPE = timezone(timedelta(hours=8))
SOURCE_URL = "https://www.tpex.org.tw/openapi/v1/tpex_mainboard_daily_close_quotes"


def parse_num(s):
    if s is None:
        return None
    s = str(s).strip().replace(",", "").replace("+", "")
    if s in ("", "—", "-"):
        return None
    try:
        return float(s)
    except ValueError:
        return None


def roc_to_iso(roc: str) -> str | None:
    """1150525 → 2026-05-25"""
    if not roc or len(roc) < 7:
        return None
    try:
        y = int(roc[:-4]) + 1911
        m = int(roc[-4:-2])
        d = int(roc[-2:])
        return f"{y:04d}-{m:02d}-{d:02d}"
    except (ValueError, IndexError):
        return None


def main() -> int:
    print(f"[fetch] {SOURCE_URL}")
    resp = requests.get(SOURCE_URL, timeout=30, headers={"User-Agent": "morning-board-prefetch/1.0"})
    resp.raise_for_status()
    raw = resp.json()
    if not isinstance(raw, list):
        print(f"[err] 預期 list，收到 {type(raw).__name__}", file=sys.stderr)
        return 1
    print(f"[info] 收到 {len(raw)} 筆")

    date_roc = raw[0].get("Date") if raw else None
    iso_date = roc_to_iso(date_roc)
    quotes: dict[str, dict] = {}

    for row in raw:
        code = (row.get("SecuritiesCompanyCode") or "").strip()
        if not code:
            continue
        close = parse_num(row.get("Close"))
        change = parse_num(row.get("Change"))
        if close is None:
            continue
        prev_close = round(close - change, 4) if change is not None else None
        change_pct = round((change / prev_close) * 100, 4) if (change is not None and prev_close) else None
        quotes[code] = {
            "code": code,
            "name": (row.get("CompanyName") or "").strip(),
            "close": close,
            "open": parse_num(row.get("Open")),
            "high": parse_num(row.get("High")),
            "low": parse_num(row.get("Low")),
            "change": change,
            "prevClose": prev_close,
            "changePct": change_pct,
            "volume": parse_num(row.get("TradingShares")),
            "transactionAmount": parse_num(row.get("TransactionAmount")),
            "currency": "TWD",
        }

    out = {
        "date": date_roc,
        "isoDate": iso_date,
        "asOf": datetime.now(TPE).isoformat(timespec="seconds"),
        "source": "TPEx 證券櫃檯買賣中心 openapi",
        "sourceUrl": SOURCE_URL,
        "quotes": quotes,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), "utf-8")
    print(f"[done] {len(quotes)} 檔 → {OUTPUT}  ({OUTPUT.stat().st_size/1024:.1f} KB)")
    if "4174" in quotes:
        print(f"[spot] 4174 浩鼎 收盤 {quotes['4174']['close']} 漲跌 {quotes['4174']['change']:+}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
