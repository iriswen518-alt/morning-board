#!/usr/bin/env python3
"""Phase-1 cloud gate. Exit non-zero (abort push) if:
  - any cloud-owned JSON is missing / empty / unparseable, OR
  - sampled stocks.json US tickers deviate > 2% from Yahoo /chart last close.
Usage: python3 validate_quotes.py   (run from a dir whose ./repo/data holds the JSON)."""

from __future__ import annotations
import json, sys
from pathlib import Path
import requests

DATA = Path(__file__).resolve().parent / "repo" / "data"
OWNED = [
    "market.json",
    "stocks.json",
    "tpex_quotes.json",
    "popular_stocks.json",
]
UA = "Mozilla/5.0"
TOL = 0.02


def fail(msg: str) -> None:
    print(f"[gate] FAIL: {msg}")
    sys.exit(1)


def yahoo_last_close(symbol: str):
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
    r = requests.get(
        url,
        params={"range": "5d", "interval": "1d"},
        headers={"User-Agent": UA},
        timeout=15,
    )
    r.raise_for_status()
    res = r.json()["chart"]["result"][0]
    closes = [c for c in res["indicators"]["quote"][0]["close"] if c is not None]
    return closes[-1] if closes else None


def main() -> None:
    for name in OWNED:
        p = DATA / name
        if not p.exists() or p.stat().st_size == 0:
            fail(f"{name} missing or empty")
        try:
            obj = json.load(open(p, encoding="utf-8"))
        except Exception as e:
            fail(f"{name} not valid JSON: {e}")
        if not obj:
            fail(f"{name} parsed but empty")

    stocks = json.load(open(DATA / "stocks.json", encoding="utf-8"))
    # stocks.json is a dict with "us_stocks" (list) and "tw_stocks" (list).
    # Each US row: {"symbol": "NVDA", "price": 224.36, ...}. Use the US group only.
    rows = stocks.get("us_stocks") or []
    checked = 0
    for row in rows:
        if checked >= 3:
            break
        if not isinstance(row, dict):
            continue
        sym = str(row.get("symbol") or "").strip()
        price = row.get("price")
        # US tickers only: skip anything with a dot/suffix (e.g. "2330.TW").
        if not sym or "." in sym or not isinstance(price, (int, float)):
            continue
        try:
            ref = yahoo_last_close(sym)
        except Exception:
            continue
        if ref and abs(price - ref) / ref > TOL:
            fail(f"{sym} price {price} deviates >2% from Yahoo {ref}")
        checked += 1
    print(f"[gate] OK ({len(OWNED)} files valid, {checked} tickers spot-checked)")


if __name__ == "__main__":
    main()
