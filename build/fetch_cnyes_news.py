#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""抓鉅亨網（cnyes）多分類即時新聞，產出 data/cnyes_news.json 供「新聞」分頁頂部
獨立的「鉅亨新聞」區塊（分類牆）使用。與 fetch_live_news.py（頭條跑馬燈）分開：
本檔多分類、供新聞頁閱讀；live_news.json 仍只餵即時行情跑馬燈，互不影響。

比照 fetch_live_indices.py／fetch_live_news.py：雲端 GitHub Actions 每 20 分鐘跑，
單一分類抓取失敗就略過該類、保留其他類；全部失敗才不寫檔、保留舊資料。"""

from __future__ import annotations

import datetime as dt
import gzip
import json
import os
import sys
import urllib.request

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
API = "https://api.cnyes.com/media/api/v1/newslist/category/{cat}?limit=30"
NEWS_URL = "https://news.cnyes.com/news/id/{}"
PER_CAT = 12  # 每分類最多顯示則數

# (cnyes 分類代碼, 顯示標題)。標題一律四字，配合網站區塊命名慣例。
CATEGORIES = [
    ("headline", "鉅亨頭條"),
    ("tw_stock", "台股焦點"),
    ("us_stock", "美股焦點"),
    ("wd_stock", "國際財經"),
    ("forex", "外匯焦點"),
]


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Accept": "*/*",
            "Origin": "https://www.cnyes.com",
            "Referer": "https://www.cnyes.com/",
        },
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        raw = resp.read()
        if resp.headers.get("Content-Encoding") == "gzip":
            raw = gzip.decompress(raw)
    return json.loads(raw.decode("utf-8"))


def fetch_category(cat: str) -> list:
    data = fetch_json(API.format(cat=cat))
    rows = (data.get("items") or {}).get("data") or []
    items = []
    for r in rows:
        nid = r.get("newsId")
        title = (r.get("title") or "").strip()
        if not nid or not title:
            continue
        items.append(
            {
                "title": title,
                "url": NEWS_URL.format(nid),
                "publish_at": r.get("publishAt"),
            }
        )
        if len(items) >= PER_CAT:
            break
    return items


def main() -> int:
    here = os.path.dirname(os.path.abspath(__file__))
    # 雲端 GitHub Actions：腳本在 work/，work/repo symlink 到 workspace；寫 repo/data。
    out_path = os.path.join(here, "repo", "data", "cnyes_news.json")

    categories = []
    for cat, label in CATEGORIES:
        try:
            items = fetch_category(cat)
        except Exception as e:  # 單類異常：略過該類、續抓其他類
            print(f"category {cat} failed: {e}; skipping")
            continue
        if items:
            categories.append({"key": cat, "label": label, "items": items})

    # 全部分類皆失敗：不寫檔、保留舊資料，回非零碼
    if not categories:
        print("no parsable categories; keeping previous file")
        return 3

    # built_at 固定用台北時間（雲端 runner 為 UTC，不可用 astimezone()）
    tpe = dt.datetime.now(dt.timezone.utc) + dt.timedelta(hours=8)
    payload = {
        "built_at": tpe.strftime("%Y-%m-%dT%H:%M"),
        "source": "鉅亨網（cnyes）",
        "categories": categories,
    }
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    total = sum(len(c["items"]) for c in categories)
    print(f"cnyes_news.json written: {len(categories)} categories, {total} items")
    return 0


if __name__ == "__main__":
    sys.exit(main())
