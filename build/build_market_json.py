#!/usr/bin/env python3
"""Numbers-only market.json builder for the GitHub Actions path.
Reads ~/scripts/logs/market_data_latest.json (deterministic numbers) and writes
<script_dir>/repo/data/market.json in the existing front-end schema. NO narrative
(`summary` stays null — narrative is produced by the local build). refresh_taiex.py
runs AFTER this to overlay realtime TAIEX/US closes."""

from __future__ import annotations
import json
from pathlib import Path

SRC = Path.home() / "scripts" / "logs" / "market_data_latest.json"
OUT = Path(__file__).resolve().parent / "repo" / "data" / "market.json"


def r2(x):
    return round(x, 2) if isinstance(x, (int, float)) else x


def map_index(e):
    return {
        "name": e.get("name"),
        "name_zh": None,
        "close": e.get("close"),
        "daily_pct": r2(e.get("daily_pct")),
        "mtd_pct": r2(e.get("mtd_pct")),
        "ytd_pct": r2(e.get("ytd_pct")),
        "closing_date": e.get("closing_date"),
    }


def map_bond(b):
    return {
        "name": b.get("name"),
        "yield_pct": r2(b.get("yield")),
        "daily_bps": r2(b.get("daily_bps")),
        "mtd_bps": r2(b.get("mtd_bps")),
        "closing_date": b.get("closing_date"),
    }


def map_fx(f):
    return {
        "name": f.get("name"),
        "close": f.get("close"),
        "daily_pct": r2(f.get("daily_pct")),
        "mtd_pct": r2(f.get("mtd_pct")),
        "ytd_pct": r2(f.get("ytd_pct")),
        "closing_date": f.get("closing_date"),
    }


def map_commodity(c):
    return {
        "name": c.get("name"),
        "close": c.get("close"),
        "daily_pct": r2(c.get("daily_pct")),
        "mtd_pct": r2(c.get("mtd_pct")),
        "ytd_pct": r2(c.get("ytd_pct")),
        "closing_date": c.get("closing_date"),
    }


def main():
    src = json.load(open(SRC, encoding="utf-8"))
    out = {
        "closing_date": src.get("primary_closing_date"),
        "indices": [map_index(e) for e in src.get("equity", [])],
        "bonds": [map_bond(b) for b in src.get("bonds", [])],
        "fx": [map_fx(f) for f in src.get("fx", [])],
        "commodities": [map_commodity(c) for c in src.get("commodities", [])],
        "summary": None,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(
        f"[build_market_json] indices={len(out['indices'])} bonds={len(out['bonds'])} "
        f"fx={len(out['fx'])} commodities={len(out['commodities'])}"
    )


if __name__ == "__main__":
    main()
