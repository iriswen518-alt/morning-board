#!/usr/bin/env python3
"""資料合約驗證器 — 對 data/*.json 檢查 specs/DATA_CONTRACT.md 列出的形狀。

用法：
    python build/validate_contract.py            # 驗證全部核心檔
    python build/validate_contract.py --strict   # 任何缺欄即 exit 1（接 push 前 / CI）

設計目標：在「改了沒生效 / 補丁被覆蓋」造成前端壞掉前先擋下。
新增資料檔時，把規則加進下面的 CONTRACT。
"""

from __future__ import annotations
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")

NUM = (int, float)


# type token -> 驗證函式 (None 代表允許 null)
def _num(v):
    return v is None or isinstance(v, NUM) and not isinstance(v, bool)


def _str(v):
    return v is None or isinstance(v, str)


def _bool(v):
    return isinstance(v, bool)


def _numlist(v):
    return isinstance(v, list) and all(isinstance(x, NUM) for x in v)


CHECKS = {"num": _num, "str": _str, "bool": _bool, "numlist": _numlist}

# 每檔：top = 必備頂層欄位; rows = (陣列欄位, {欄位: 型別})
CONTRACT = {
    "stocks.json": {
        "top": {"generated_at": "str", "source": "str"},
        "rows": [
            (
                "us_stocks",
                {
                    "symbol": "str",
                    "name_zh": "str",
                    "kind": "str",
                    "price": "num",
                    "change_pct": "num",
                    "mtd_pct": "num",
                    "ytd_pct": "num",
                    "market_date": "str",
                },
            ),
            (
                "tw_stocks",
                {
                    "symbol": "str",
                    "name_zh": "str",
                    "kind": "str",
                    "price": "num",
                    "change_pct": "num",
                },
            ),
        ],
    },
    "popular_stocks.json": {
        "top": {"generated_at": "str", "source": "str"},
        "rows": [
            (
                "stocks",
                {
                    "symbol": "str",
                    "name_zh": "str",
                    "kind": "str",
                    "price": "num",
                    "change_pct": "num",
                    "mtd_pct": "num",
                },
            )
        ],
    },
    "live_indices.json": {
        "top": {"built_at": "str"},
        "rows": [
            (
                "indices",
                {
                    "ok": "bool",
                    "symbol": "str",
                    "name_zh": "str",
                    "last": "num",
                    "prev_close": "num",
                    "change_pct": "num",
                    "points": "numlist",
                },
            )
        ],
    },
    "market.json": {
        "top": {"closing_date": "str"},
        "rows": [
            (
                "indices",
                {
                    "name": "str",
                    "close": "num",
                    "daily_pct": "num",
                    "mtd_pct": "num",
                    "ytd_pct": "num",
                },
            )
        ],
    },
    "premarket.json": {
        "top": {"generated_at": "str"},
        "rows": [("indicators", {"label": "str", "price": "num", "pct": "num"})],
    },
    "meta.json": {
        "top": {"built_at": "str", "today": "str"},
        "rows": [],
    },
}


def validate(fname: str, spec: dict) -> list[str]:
    path = os.path.join(DATA, fname)
    if not os.path.exists(path):
        return [f"檔案不存在: {path}"]
    try:
        d = json.load(open(path, encoding="utf-8"))
    except Exception as e:
        return [f"JSON 解析失敗: {e}"]

    errs: list[str] = []
    for k, t in spec["top"].items():
        if k not in d:
            errs.append(f"缺頂層欄位 {k}")
        elif not CHECKS[t](d[k]):
            errs.append(f"頂層 {k} 型別應為 {t}，實得 {type(d[k]).__name__}")

    for arr_key, fields in spec["rows"]:
        rows = d.get(arr_key)
        if not isinstance(rows, list):
            errs.append(f"缺陣列 {arr_key}（或非 list）")
            continue
        if not rows:
            errs.append(f"陣列 {arr_key} 為空（資料可能沒抓到）")
            continue
        # 只抽前 3 筆驗證，避免大檔拖慢
        for i, row in enumerate(rows[:3]):
            for f, t in fields.items():
                if f not in row:
                    errs.append(f"{arr_key}[{i}] 缺欄位 {f}")
                elif not CHECKS[t](row[f]):
                    errs.append(f"{arr_key}[{i}].{f} 型別應為 {t}，實得 {row[f]!r}")
    return errs


def main() -> int:
    strict = "--strict" in sys.argv
    total = 0
    for fname, spec in CONTRACT.items():
        errs = validate(fname, spec)
        total += len(errs)
        if errs:
            print(f"✗ {fname}")
            for e in errs:
                print(f"    - {e}")
        else:
            print(f"✓ {fname}")
    print(f"\n共 {total} 個問題。")
    return 1 if (total and strict) else 0


if __name__ == "__main__":
    sys.exit(main())
