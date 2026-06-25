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
    # 櫃買指數：Yahoo ^TWOII 長期落後／常整天空值，改走 cnyes（前端鍵仍用 ^TWOII）
    ("櫃買指數", "^TWOII", "cnyes", "TWS:OTC01:INDEX", "otc_o00.tw"),
    (
        "台指期近",
        "TWF:TXF",
        "cnyes",
        "TWF:TXF:WEIGHTED",
    ),  # 台指期近月：Yahoo 無，走 cnyes
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


def mis_prev_close(ex_ch: str, attempts: int = 4) -> float | None:
    """從 twse MIS 取昨收（y 欄）。供 cnyes 盤中圖無前一交易日序列者（如櫃買）補昨收，
    才能算當日漲跌％。沿用 refresh_taiex 已驗證可在 GitHub Actions 雲端跑通的請求方式：
    查 tse_t00|otc_o00 合併頻道、Referer 用 mis.twse.com.tw 根網域、無 cache-buster、重試。
    （單一頻道＋index.jsp Referer＋`_=` 時間戳在雲端 IP 會被擋、回空 msgArray。）
    ex_ch 例 'otc_o00.tw'，取代碼 o00 比對 msgArray 的 c 欄。"""
    code = ex_ch.split("_")[-1].split(".")[0]  # 'otc_o00.tw' -> 'o00'
    url = (
        "https://mis.twse.com.tw/stock/api/getStockInfo.jsp"
        "?ex_ch=tse_t00.tw|otc_o00.tw&json=1"
    )
    for a in range(attempts):
        try:
            req = urllib.request.Request(
                url,
                headers={
                    "User-Agent": UA,
                    "Accept": "*/*",
                    "Referer": "https://mis.twse.com.tw/",
                },
            )
            with urllib.request.urlopen(req, timeout=8) as resp:
                d = json.loads(resp.read().decode("utf-8"))
            for m in d.get("msgArray") or []:
                if m.get("c") == code:
                    y = m.get("y")
                    return float(y) if y not in (None, "", "-") else None
            return None
        except Exception:  # noqa: BLE001
            if a == attempts - 1:
                return None
            time.sleep(2 * (a + 1))
    return None


def fetch_cnyes(key: str, cnyes_sym: str | None = None) -> dict:
    """Yahoo 無資料／不可靠者改走 cnyes charting（5 分 K）。
    key 為前端鍵（如 TWF:TXF、^TWOII），輸出的 symbol 仍用此 key 以對應前端；
    cnyes_sym 為實際向 cnyes 查詢的代碼（如 TWF:TXF:WEIGHTED、TWS:OTC01:INDEX），
    未指定時沿用舊行為 f"{key}:WEIGHTED"。"""
    cnyes_sym = cnyes_sym or f"{key}:WEIGHTED"
    now = int(time.time())
    url = (
        "https://ws.api.cnyes.com/ws/api/v1/charting/history?"
        f"symbol={urllib.parse.quote(cnyes_sym)}&resolution=5&from={now - 3 * 86400}&to={now}"
    )
    try:
        d = json.loads(http_get(url))
        data = d.get("data", d)
        t = data.get("t") or []
        c = data.get("c") or []
        sessions = data.get("session") or []
        # cnyes 的 t 未必全域排序，且日盤/夜盤時段會重疊；先配對、濾空、依時間排序。
        pairs = sorted(
            (int(ts), round(float(cl), 2)) for ts, cl in zip(t, c) if cl is not None
        )
        if not pairs:
            raise ValueError("empty series")
        # 選「包含當下」的交易時段；無則取最近已收盤的時段。
        cur = next(((s, e) for s, e in sessions if s <= now <= e), None)
        state = "REGULAR" if cur else "CLOSED"
        if cur is None:
            past = [se for se in sessions if se[1] <= now]
            cur = max(past, key=lambda se: se[1]) if past else None
        if cur is not None:
            s0, e0 = cur
            cur_pairs = [p for p in pairs if s0 <= p[0] <= e0]
            before = [cl for ts, cl in pairs if ts < s0]  # 前一時段最後一筆＝昨收
        else:
            cur_pairs, before = pairs, []
        if not cur_pairs:
            cur_pairs = pairs
        series = [cl for _, cl in cur_pairs]
        prev = float(before[-1]) if before else None
        last = series[-1]
        change = (last - prev) if prev else None
        change_pct = (change / prev * 100) if (prev and change is not None) else None
        asof = dt.datetime.fromtimestamp(
            cur_pairs[-1][0] + 8 * 3600, tz=dt.timezone.utc
        ).strftime("%m/%d %H:%M")
        return {
            "ok": True,
            "symbol": key,
            "last": last,
            "prev_close": round(prev, 2) if prev else None,
            "change": round(change, 2) if change is not None else None,
            "change_pct": round(change_pct, 2) if change_pct is not None else None,
            "points": downsample(series, MAX_POINTS),
            "market_state": state,
            "asof": asof,
            "tz": "Asia/Taipei",
        }
    except Exception as e:  # noqa: BLE001
        return {"ok": False, "symbol": key, "error": f"cnyes: {str(e)[:110]}"}


def main() -> int:
    here = os.path.dirname(os.path.abspath(__file__))
    out_path = os.path.join(here, "data", "live_indices.json")
    items = []
    for entry in INDICES:
        zh, sym = entry[0], entry[1]
        src = entry[2] if len(entry) > 2 else "yahoo"
        cnyes_sym = entry[3] if len(entry) > 3 else None
        mis_ch = entry[4] if len(entry) > 4 else None
        rec = fetch_cnyes(sym, cnyes_sym) if src == "cnyes" else fetch_one(sym)
        # cnyes 盤中圖無前一交易日序列者（櫃買），昨收從 MIS 補，才能算當日漲跌％
        if (
            mis_ch
            and rec.get("ok")
            and rec.get("change_pct") is None
            and rec.get("last") is not None
        ):
            prev = mis_prev_close(mis_ch)
            if prev:
                chg = rec["last"] - prev
                rec["prev_close"] = round(prev, 2)
                rec["change"] = round(chg, 2)
                rec["change_pct"] = round(chg / prev * 100, 2)
        rec["name_zh"] = zh
        items.append(rec)
        time.sleep(0.7)  # 降低來源限流機率
    ok_n = sum(1 for r in items if r.get("ok"))
    # 全部失敗（多半是 Yahoo 限流）：不寫檔、保留舊資料，回非零碼
    if not ok_n:
        print("all fetches failed (likely rate-limited); keeping previous file")
        return 3
    # built_at 固定用台北時間（雲端 runner 為 UTC，不可用 astimezone()）
    tpe = dt.datetime.now(dt.timezone.utc) + dt.timedelta(hours=8)
    payload = {
        "built_at": tpe.strftime("%Y-%m-%dT%H:%M"),
        "indices": items,
    }
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
    print(f"live_indices.json written: {ok_n}/{len(items)} ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
