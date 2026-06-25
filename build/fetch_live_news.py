#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""抓鉅亨網（cnyes）即時新聞頭條，產出 data/live_news.json 供「即時行情」分頁頂部
「快訊」跑馬燈輪播。比照 fetch_live_indices.py：雲端 GitHub Actions 每 20 分鐘跑，
抓取失敗就不寫檔、保留舊資料，避免把跑馬燈洗成空白。"""

from __future__ import annotations

import datetime as dt
import gzip
import json
import os
import sys
import urllib.request

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
# 鉅亨即時新聞「頭條」分類；帶 Origin 才回完整 JSON。
API = "https://api.cnyes.com/media/api/v1/newslist/category/headline?limit=25"
NEWS_URL = "https://news.cnyes.com/news/id/{}"
LIMIT = 20  # 跑馬燈最多輪播則數


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


def main() -> int:
    here = os.path.dirname(os.path.abspath(__file__))
    # 雲端 GitHub Actions：腳本在 work/，work/repo symlink 到 workspace；寫 repo/data。
    out_path = os.path.join(here, "repo", "data", "live_news.json")

    try:
        data = fetch_json(API)
        rows = (data.get("items") or {}).get("data") or []
    except Exception as e:  # 網路／來源異常：保留舊檔
        print(f"fetch failed: {e}; keeping previous file")
        return 3

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
        if len(items) >= LIMIT:
            break

    # 全部解析失敗：不寫檔、保留舊資料，回非零碼
    if not items:
        print("no parsable headlines; keeping previous file")
        return 3

    # built_at 固定用台北時間（雲端 runner 為 UTC，不可用 astimezone()）
    tpe = dt.datetime.now(dt.timezone.utc) + dt.timedelta(hours=8)
    payload = {
        "built_at": tpe.strftime("%Y-%m-%dT%H:%M"),
        "source": "鉅亨網（cnyes）",
        "items": items,
    }
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print(f"live_news.json written: {len(items)} headlines")
    return 0


if __name__ == "__main__":
    sys.exit(main())
