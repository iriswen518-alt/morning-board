#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""抓鉅亨網（cnyes）多分類即時新聞「全文」，產出 data/cnyes_news.json 供「新聞」
分頁頂部獨立的「鉅亨新聞」區塊使用：站內直接顯示完整內容（不外連），並以 Groq
開源模型（首選 gpt-oss-120b）產生英文翻譯，中英並陳。

與 fetch_live_news.py（頭條跑馬燈）分開：本檔多分類＋全文＋翻譯；live_news.json
仍只餵即時行情跑馬燈，互不影響。

執行環境：雲端 GitHub Actions 每 20 分鐘跑（morning-board-live.yml），
GROQ_API_KEY 由 repo secret 注入；金鑰缺失時仍產出中文全文（英文留待補）。

節流與快取（Groq 免費層 TPM 8000）：
- 以 newsId 快取前次輸出的翻譯，跨分類共用，只翻新文章。
- 每輪最多翻 MAX_TRANSLATE 篇、每篇之間 sleep；沒翻到的先出中文，下輪補英文。
- 模型 429/失敗依序退到備用模型；全失敗該篇英文留空，不擋輸出。
單一分類抓取失敗就略過該類、保留其他類；全部失敗才不寫檔、保留舊資料。"""

from __future__ import annotations

import datetime as dt
import gzip
import html
import json
import os
import re
import sys
import time
import urllib.request

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
API = "https://api.cnyes.com/media/api/v1/newslist/category/{cat}?limit=20"
NEWS_URL = "https://news.cnyes.com/news/id/{}"
PER_CAT = 8  # 每分類最多顯示則數（全文模式，量比純標題模式收斂）

# (cnyes 分類代碼, 顯示標題)。標題一律四字，配合網站區塊命名慣例。
CATEGORIES = [
    ("headline", "鉅亨頭條"),
    ("tw_stock", "台股焦點"),
    ("us_stock", "美股焦點"),
    ("wd_stock", "國際財經"),
    ("forex", "外匯焦點"),
]

GROQ_API = "https://api.groq.com/openai/v1/chat/completions"
# 依序嘗試；各模型在 Groq 免費層有獨立配額，前面額度用盡自動退下一個
GROQ_MODELS = ["openai/gpt-oss-120b", "openai/gpt-oss-20b", "qwen/qwen3.6-27b"]
MAX_TRANSLATE = 24  # 每輪最多翻譯篇數（雲端 cron 稀疏，一次多翻清 backlog）
SLEEP_BETWEEN = 22  # 每篇之間秒數（TPM 8000 節流）
BODY_CHAR_CAP = 6000  # 單篇全文上限（極長文截斷，避免撐爆 token）

# 內文雜訊段落（推廣／延伸閱讀等，非本文）
NOISE_PAT = re.compile(
    r"^(更多|延伸閱讀|【更多|加入鉅亨|訂閱|下載鉅亨|👉|◤|◢)|鉅亨\s?App"
)


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


def content_to_paras(content: str) -> list:
    """cnyes 列表 API 的 content 為 HTML-entity 轉義過的 HTML；解回後拆段、去標籤。"""
    h = html.unescape(content or "")
    # 圖表／腳本整塊移除
    h = re.sub(r"<(figure|script|style|table)[\s\S]*?</\1>", "", h, flags=re.I)
    # 以段落／換行邊界切段
    parts = re.split(r"</p>|<br\s*/?>", h, flags=re.I)
    paras = []
    total = 0
    for p in parts:
        t = re.sub(r"<[^>]+>", "", p)
        t = html.unescape(t).strip()
        if not t or NOISE_PAT.search(t):
            continue
        if total + len(t) > BODY_CHAR_CAP:
            break
        paras.append(t)
        total += len(t)
    return paras


def groq_translate(key: str, title: str, paras: list) -> dict | None:
    """回 {"title_en": str, "paras_en": [str]}；全部模型失敗回 None。"""
    # 站上逐段中英對照（英上中下），段落必須一一對齊：把來源段落編號、要求同段數
    n = len(paras)
    body = "\n\n".join(f"[{i + 1}] {p}" for i, p in enumerate(paras))
    prompt = (
        "Translate this Traditional-Chinese financial news article into natural, "
        "faithful English. Keep numbers, tickers and names accurate. "
        'Return ONLY JSON: {"title_en": "...", "paras_en": ["paragraph 1", ...]} '
        f"where paras_en has EXACTLY {n} elements, one per numbered source "
        "paragraph, in the same order. Do not merge, split, drop or add "
        "paragraphs; do not include the [n] markers in the output.\n\n"
        f"TITLE: {title}\n\nARTICLE:\n{body}"
    )
    payload_base = {
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2,
        "max_tokens": 4096,
        "response_format": {"type": "json_object"},
    }
    for model in GROQ_MODELS:
        payload = dict(payload_base, model=model)
        if model.startswith("openai/"):
            payload["reasoning_effort"] = "low"
        req = urllib.request.Request(
            GROQ_API,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
                # Cloudflare 擋 python-urllib 預設 UA（error 1010），必須自帶 UA
                "User-Agent": UA,
            },
        )
        for attempt in (1, 2):
            try:
                with urllib.request.urlopen(req, timeout=90) as resp:
                    out = json.loads(resp.read().decode("utf-8"))
                got = json.loads(out["choices"][0]["message"]["content"])
                title_en = str(got.get("title_en") or "").strip()
                paras_en = [
                    str(p).strip()
                    for p in (got.get("paras_en") or [])
                    if str(p).strip()
                ]
                if title_en and len(paras_en) == n:
                    return {"title_en": title_en, "paras_en": paras_en}
                # 段數對不上就不能逐段對照，換下一個模型；都失敗就這輪先出中文，下輪再翻
                print(
                    f"  groq {model} paragraph mismatch "
                    f"({len(paras_en)} vs {n}); next model"
                )
                break  # 回了格式但內容空或段數不符：換下一個模型
            except urllib.error.HTTPError as e:
                if e.code == 429 and attempt == 1:
                    time.sleep(30)
                    continue
                print(f"  groq {model} HTTP {e.code}; next model")
                break
            except Exception as e:
                print(f"  groq {model} failed: {e}; next model")
                break
    return None


def main() -> int:
    here = os.path.dirname(os.path.abspath(__file__))
    # 雲端 GitHub Actions：腳本在 work/，work/repo symlink 到 workspace；寫 repo/data。
    out_path = os.path.join(here, "repo", "data", "cnyes_news.json")

    # 前次輸出當快取：newsId → item（含已翻好的英文），跨分類共用
    cache = {}
    try:
        with open(out_path, encoding="utf-8") as f:
            prev = json.load(f)
        for c in prev.get("categories") or []:
            for it in c.get("items") or []:
                nid = it.get("news_id")
                if nid:
                    cache[str(nid)] = it
    except Exception:
        pass

    groq_key = (os.environ.get("GROQ_API_KEY") or "").strip()
    if not groq_key:
        print("GROQ_API_KEY missing; producing zh-only output")

    # 第一輪：先抓齊全部分類、組好 item（帶快取的英文），先不翻譯
    categories = []
    done = {}  # 本輪已組好的 newsId → item（同文多分類共用，不重翻）
    for cat, label in CATEGORIES:
        try:
            data = fetch_json(API.format(cat=cat))
            rows = (data.get("items") or {}).get("data") or []
        except Exception as e:  # 單類異常：略過該類、續抓其他類
            print(f"category {cat} failed: {e}; skipping")
            continue
        items = []
        for r in rows:
            nid = str(r.get("newsId") or "")
            title = (r.get("title") or "").strip()
            if not nid or not title:
                continue
            if nid in done:
                items.append(done[nid])
            else:
                paras = content_to_paras(r.get("content") or "")
                if not paras:  # 全文模式沒內文就沒東西可看，略過（影音類等）
                    continue
                old = cache.get(nid) or {}
                old_en = old.get("paras_en") or []
                # 舊快取若段數與中文對不上（早期未強制對齊），丟掉重翻，否則逐段對照會錯位
                if len(old_en) != len(paras):
                    old_en = []
                it = {
                    "news_id": nid,
                    "title": title,
                    "title_en": (old.get("title_en") or "") if old_en else "",
                    "publish_at": r.get("publishAt"),
                    "url": NEWS_URL.format(nid),  # 僅存檔備查，前端不外連
                    "paras": paras,
                    "paras_en": old_en,
                }
                done[nid] = it
                items.append(it)
            if len(items) >= PER_CAT:
                break
        if items:
            categories.append({"key": cat, "label": label, "items": items})

    # 全部分類皆失敗：不寫檔、保留舊資料，回非零碼
    if not categories:
        print("no parsable categories; keeping previous file")
        return 3

    # 第二輪：翻譯待補的文章。**round-robin 跨分類**（每分類輪流各取一篇），
    # 避免順序在前的分類把每輪額度用光、讓後面分類（如外匯）永遠餓死。
    translated = 0
    if groq_key:
        seen = set()
        pending_by_cat = []
        for c in categories:
            lst = [it for it in c["items"] if not it["paras_en"] and id(it) not in seen]
            for it in lst:
                seen.add(id(it))
            pending_by_cat.append(lst)
        # 交錯展平：cat0[0],cat1[0],...,cat0[1],cat1[1],...
        queue = []
        for i in range(max((len(x) for x in pending_by_cat), default=0)):
            for lst in pending_by_cat:
                if i < len(lst):
                    queue.append(lst[i])
        for it in queue:
            if translated >= MAX_TRANSLATE:
                break
            print(f"translating {it['news_id']}: {it['title'][:30]}")
            got = groq_translate(groq_key, it["title"], it["paras"])
            if got:
                it["title_en"] = got["title_en"]
                it["paras_en"] = got["paras_en"]
            translated += 1
            time.sleep(SLEEP_BETWEEN)

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
    pending = sum(1 for it in done.values() if not it["paras_en"])
    print(
        f"cnyes_news.json written: {len(categories)} categories, {total} items, "
        f"{translated} translated this run, {pending} EN-pending"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
