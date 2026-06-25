#!/usr/bin/env python3
"""抓全球主要指數盤中走勢 → data/live_indices.json（即時行情分頁用）。

- 來源：Yahoo Finance chart API（range=1d, interval=5m），與 fetch_market_data.py 同端點。
- 每檔輸出：中文名、最新值、昨收、漲跌、漲跌%、盤中點位序列（給前端自繪走勢圖）、
  市場狀態（盤中/收盤）與資料時間（當地時區）。
- 單一指數失敗只標記該檔 ok=False，不影響整體；前端顯示後備連結。
- 設計成可高頻重跑（盤中刷新）：請求之間有間隔，降低 Yahoo 限流機率。
"""

from __future__ import annotations

import datetime as dt
import gzip
import json
import os
import sys
import time
import urllib.parse
import urllib.request

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

# (中文四字名, Yahoo symbol)；順序對齊「全球市場」market.json indices。
INDICES = [
    ("標普500", "^GSPC"),
    ("那斯達克", "^IXIC"),
    ("道瓊工業", "^DJI"),
    ("費城半導", "^SOX"),
    ("歐洲50", "^STOXX50E"),
    ("德國DAX", "^GDAXI"),
    ("英國FTSE", "^FTSE"),
    ("法國CAC", "^FCHI"),
    ("日經225", "^N225"),
    ("台股加權", "^TWII"),
    ("櫃買指數", "^TWOII"),
    ("韓國綜合", "^KS11"),
    ("恆生指數", "^HSI"),
    ("上證指數", "000001.SS"),
    ("滬深300", "000300.SS"),
    ("印度Nifty", "^NSEI"),
    ("澳洲200", "^AXJO"),
]

MAX_POINTS = 80  # 前端走勢圖點數上限；過多則等距抽樣


def http_get(url: str, timeout: int = 20) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        raw = resp.read()
        if resp.headers.get("Content-Encoding") == "gzip":
            raw = gzip.decompress(raw)
        return raw


def downsample(vals: list[float], cap: int) -> list[float]:
    if len(vals) <= cap:
        return vals
    step = len(vals) / cap
    out = [vals[int(i * step)] for i in range(cap)]
    out[-1] = vals[-1]  # 保留最新點
    return out


def fetch_one(symbol: str) -> dict:
    enc = urllib.parse.quote(symbol, safe="=.-^")
    path = f"/v8/finance/chart/{enc}?range=1d&interval=5m"
    last_err = None
    for host in ("query1.finance.yahoo.com", "query2.finance.yahoo.com"):
        for attempt in range(3):
            try:
                data = json.loads(http_get(f"https://{host}{path}"))
                result = data["chart"]["result"][0]
                meta = result.get("meta", {})
                closes_raw = result["indicators"]["quote"][0].get("close") or []
                closes = [round(float(c), 2) for c in closes_raw if c is not None]
                if not closes:
                    raise ValueError("empty series")
                prev = meta.get("chartPreviousClose")
                if prev is None:
                    prev = meta.get("previousClose")
                last = closes[-1]
                change = (last - prev) if prev else None
                change_pct = (
                    (change / prev * 100) if (prev and change is not None) else None
                )
                # 資料時間（指數當地時區）
                ts = meta.get("regularMarketTime")
                gmt = meta.get("gmtoffset", 0) or 0
                asof = None
                if ts:
                    asof = dt.datetime.fromtimestamp(
                        ts + gmt, tz=dt.timezone.utc
                    ).strftime("%m/%d %H:%M")
                # 市場狀態：Yahoo chart meta 無 marketState，改由「抓取當下時間」
                # 對照當日交易時段（currentTradingPeriod.regular）推算。
                state = "CLOSED"
                reg = (meta.get("currentTradingPeriod") or {}).get("regular") or {}
                start, end = reg.get("start"), reg.get("end")
                now = time.time()
                if start and end:
                    if now < start:
                        state = "PRE"
                    elif now <= end:
                        state = "REGULAR"
                    else:
                        state = "CLOSED"
                return {
                    "ok": True,
                    "symbol": symbol,
                    "last": last,
                    "prev_close": round(float(prev), 2) if prev else None,
                    "change": round(change, 2) if change is not None else None,
                    "change_pct": round(change_pct, 2)
                    if change_pct is not None
                    else None,
                    "points": downsample(closes, MAX_POINTS),
                    "market_state": state,
                    "asof": asof,
                    "tz": meta.get("exchangeTimezoneName"),
                }
            except Exception as e:  # noqa: BLE001
                last_err = e
            time.sleep(0.8 * (attempt + 1))
    return {"ok": False, "symbol": symbol, "error": str(last_err)[:120]}


def main() -> int:
    here = os.path.dirname(os.path.abspath(__file__))
    # 雲端 GitHub Actions：腳本在 work/，work/repo symlink 到 workspace；寫 repo/data。
    out_path = os.path.join(here, "repo", "data", "live_indices.json")
    items = []
    for zh, sym in INDICES:
        rec = fetch_one(sym)
        rec["name_zh"] = zh
        items.append(rec)
        time.sleep(0.7)  # 降低 Yahoo 限流機率
    ok_n = sum(1 for r in items if r.get("ok"))
    # 全部失敗（多半是 Yahoo 限流）：不寫檔、保留舊資料，回非零碼
    if not ok_n:
        print("all fetches failed (likely rate-limited); keeping previous file")
        return 3
    payload = {
        "built_at": dt.datetime.now(dt.timezone.utc)
        .astimezone()
        .strftime("%Y-%m-%dT%H:%M"),
        "indices": items,
    }
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print(f"live_indices.json written: {ok_n}/{len(items)} ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
