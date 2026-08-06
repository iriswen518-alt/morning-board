#!/usr/bin/env python3
"""
fetch_ic_chain.py — 產業龍頭（產業價值鏈資訊平台分類 × 各環節市值最大的上市櫃公司）。

在雲端 workflow 佈局下執行（work/ 內、work/repo 連到 git 根），輸出：
    repo/data/ic_chain.json        前端吃的資料（產業→環節→龍頭＋比對到的新聞）
    repo/data/ic_chain_hist.json   龍頭收盤滾動歷史（近 21 個交易日），算近五日／近廿日用
    repo/build/ic_chain_map.json   產業／環節／成分公司分類快照（超過 7 天才重抓）

資料來源（全部公開，數字不經 LLM）
    分類  ic.tpex.org.tw introduce.php?ic=XXXX（47 個產業的價值鏈圖與成分公司）
    行情  TWSE openapi exchangeReport/STOCK_DAY_ALL、TPEx openapi 上櫃每日收盤
    股本  TWSE opendata/t187ap03_L、TPEx openapi/mopsfin_t187ap03_O
          市值＝實收資本額÷每股面額×收盤價（概算，未扣庫藏股與特別股）
    新聞  cnyes 標題池，以公司簡稱做字面比對（不經模型改寫，杜絕杜撰）

本機另有同源的完整版（~/scripts/ic_chain_open.py → 工作資料站「產業龍頭」分頁）；
此處為理財小幫手 PWA 的雲端精簡版，放在「台股分析」折疊區塊內。
"""

from __future__ import annotations

import gzip
import html
import json
import re
import time
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "repo" / "data"
OUTPUT_FILE = DATA_DIR / "ic_chain.json"
HIST_FILE = DATA_DIR / "ic_chain_hist.json"
MAP_FILE = ROOT / "repo" / "build" / "ic_chain_map.json"

TPE = timezone(timedelta(hours=8))
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

IC_BASE = "https://ic.tpex.org.tw/"
MAP_MAX_AGE_DAYS = 7  # 分類極少變動，超過這個天數才重抓 47 頁
TWSE_QUOTE = "https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL"
TWSE_PROFILE = "https://openapi.twse.com.tw/v1/opendata/t187ap03_L"
TPEX_QUOTE = "https://www.tpex.org.tw/openapi/v1/tpex_mainboard_daily_close_quotes"
TPEX_PROFILE = "https://www.tpex.org.tw/openapi/v1/mopsfin_t187ap03_O"

LEADERS_PER_SEGMENT = 5
HIST_KEEP = 21  # 近廿日報酬只需 21 個交易日，檔案才不會愈滾愈大
CNYES_CATS = ["headline", "tw_stock"]
NEWS_PER_COMPANY = 2

MARKET_PATTERNS = [
    ("上市", re.compile(r"本國上市|上市公司")),
    ("上櫃", re.compile(r"本國上櫃|上櫃公司")),
    ("興櫃", re.compile(r"興櫃")),
    ("外國企業", re.compile(r"外國企業|國外")),
]


def log(msg):
    print(f"[ic-chain] {msg}", flush=True)


def http_text(url, timeout=45, retries=3):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    last = None
    for i in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=timeout) as r:
                raw = r.read()
                if r.headers.get("Content-Encoding") == "gzip":
                    raw = gzip.decompress(raw)
            return raw.decode("utf-8", "replace")
        except Exception as e:  # noqa: BLE001
            last = e
            time.sleep(2 * (i + 1))
    raise RuntimeError(f"{url}: {last}")


def http_json(url, timeout=60):
    return json.loads(http_text(url, timeout=timeout))


def num(s):
    if s is None:
        return None
    t = str(s).replace(",", "").replace("+", "").strip()
    if t in ("", "-", "--", "---", "X"):
        return None
    try:
        return float(t)
    except ValueError:
        return None


def roc_to_iso(s):
    s = str(s or "").strip()
    if len(s) == 7 and s.isdigit():
        return f"{int(s[:3]) + 1911:04d}-{s[3:5]}-{s[5:7]}"
    return ""


# ---------- 分類快照 ----------


def strip_tags(s):
    return html.unescape(re.sub(r"<[^>]+>", "", s)).strip()


def scrape_map():
    """重抓 ic.tpex 的 47 個產業（約 1 分鐘）。回傳與 MAP_FILE 相同結構。"""
    probe = http_text(IC_BASE + "introduce.php?ic=D000")
    industries, seen = [], set()
    for code, name in re.findall(
        r"<option value='([A-Z0-9]{4})'[^>]*>([^<]+)</option>", probe
    ):
        if code not in seen:
            seen.add(code)
            industries.append((code, name.strip()))

    out = {"fetched": datetime.now(TPE).date().isoformat(), "industries": []}
    for code, name in industries:
        page = (
            probe if code == "D000" else http_text(f"{IC_BASE}introduce.php?ic={code}")
        )
        # 鏈圖節點：用 chain-title-panel（上游／中游／下游）切段，段內抓 ic_link_XXXX
        marks = [
            (m.start(), strip_tags(m.group(1)))
            for m in re.finditer(
                r'<div class="chain-title-panel">(.*?)</div>', page, re.S
            )
        ] or [(0, "")]
        nodes = []
        for i, (pos, stage) in enumerate(marks):
            end = marks[i + 1][0] if i + 1 < len(marks) else len(page)
            for m in re.finditer(
                r'id="ic_link_([A-Z0-9]+)"[^>]*>(.*?)</div>', page[pos:end], re.S
            ):
                nid = m.group(1)
                if not any(n["code"] == nid for n in nodes):
                    nodes.append(
                        {
                            "code": nid,
                            "name": re.sub(r"\s+", "", strip_tags(m.group(2))),
                            "stage": stage,
                        }
                    )
        # 成分公司清單：companyList_XXXX，以 <b>本國上市公司(N家)</b> 分組
        lists = {}
        for m in re.finditer(
            r'<div id="companyList_([A-Z0-9]+)"\s+title="([^"]*)"[^>]*>(.*?)(?=<div id="companyList_|\Z)',
            page,
            re.S,
        ):
            nid, title, body = m.group(1), html.unescape(m.group(2)), m.group(3)
            companies, market = [], "其他"
            for tok in re.finditer(
                r"<b>(?P<head>[^<]*)</b>"
                r'|stk_code=(?P<stk>[0-9A-Z]+)"[^>]*title="(?P<nm>[^"]*)"',
                body,
            ):
                if tok.group("head"):
                    market = next(
                        (
                            lbl
                            for lbl, pat in MARKET_PATTERNS
                            if pat.search(tok.group("head"))
                        ),
                        "其他",
                    )
                    continue
                stk = tok.group("stk")
                if market not in ("上市", "上櫃"):
                    continue  # 只留有每日行情的，快照才不會臃腫
                if not any(c["c"] == stk for c in companies):
                    companies.append(
                        {"c": stk, "n": html.unescape(tok.group("nm")).strip()}
                    )
            lists[nid] = {"title": title, "companies": companies}

        segments = []
        for node in nodes:
            info = lists.get(node["code"], {})
            segments.append(
                {
                    "code": node["code"],
                    "name": info.get("title") or node["name"],
                    "stage": node["stage"],
                    "companies": info.get("companies", []),
                }
            )
        for nid, info in lists.items():  # 沒畫進鏈圖的環節也補上
            if not any(s["code"] == nid for s in segments):
                segments.append(
                    {
                        "code": nid,
                        "name": info["title"],
                        "stage": "",
                        "companies": info["companies"],
                    }
                )
        out["industries"].append({"code": code, "name": name, "segments": segments})
        time.sleep(0.5)
    log(f"分類重抓完成：{len(out['industries'])} 產業")
    return out


def load_map():
    if MAP_FILE.exists():
        try:
            data = json.loads(MAP_FILE.read_text(encoding="utf-8"))
            fetched = datetime.fromisoformat(data.get("fetched", "1970-01-01")).date()
            age = (datetime.now(TPE).date() - fetched).days
            if age <= MAP_MAX_AGE_DAYS:
                log(f"沿用分類快照（{age} 天前）")
                return data
            log(f"分類快照已 {age} 天，重抓")
        except (ValueError, json.JSONDecodeError) as e:
            log(f"分類快照無法解析（{e}），重抓")
    try:
        data = scrape_map()
    except RuntimeError as e:
        if MAP_FILE.exists():  # 平台掛掉時沿用舊快照，總比整段消失好
            log(f"重抓失敗（{e}），沿用舊快照")
            return json.loads(MAP_FILE.read_text(encoding="utf-8"))
        raise
    MAP_FILE.write_text(
        json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    return data


# ---------- 行情 ----------


def load_quotes():
    quotes, dates = {}, []
    for row in http_json(TWSE_QUOTE):
        code, close = (row.get("Code") or "").strip(), num(row.get("ClosingPrice"))
        if not code or close is None:
            continue
        chg = num(row.get("Change"))
        prev = close - chg if chg is not None else None
        quotes[code] = {
            "name": (row.get("Name") or "").strip(),
            "mk": "上市",
            "close": close,
            "chg": (chg / prev * 100) if prev else None,
        }
        dates.append(roc_to_iso(row.get("Date")))
    for row in http_json(TPEX_QUOTE):
        code = (row.get("SecuritiesCompanyCode") or "").strip()
        close = num(row.get("Close"))
        if not code or close is None or code in quotes:
            continue
        chg = num(row.get("Change"))
        prev = close - chg if chg is not None else None
        quotes[code] = {
            "name": (row.get("CompanyName") or "").strip(),
            "mk": "上櫃",
            "close": close,
            "chg": (chg / prev * 100) if prev else None,
        }
        dates.append(roc_to_iso(row.get("Date")))
    date = max([d for d in dates if d], default=datetime.now(TPE).date().isoformat())
    log(f"行情 {len(quotes)} 檔，資料日 {date}")
    return quotes, date


def parse_par(s):
    m = re.search(r"([0-9]+(?:\.[0-9]+)?)", str(s or "").replace(",", ""))
    return float(m.group(1)) if m else None


def load_shares():
    """{代號: 已發行股數概算}＝實收資本額÷每股面額。"""
    shares = {}
    for row in http_json(TWSE_PROFILE):
        code = (row.get("公司代號") or "").strip()
        cap, par = (
            num(row.get("實收資本額")),
            parse_par(row.get("普通股每股面額")) or 10.0,
        )
        if code and cap and par:
            shares[code] = cap / par
    for row in http_json(TPEX_PROFILE):
        code = (row.get("SecuritiesCompanyCode") or "").strip()
        cap = num(row.get("Paidin.Capital.NTDollars"))
        par = parse_par(row.get("ParValueOfCommonStock")) or 10.0
        if code and cap and par and code not in shares:
            shares[code] = cap / par
    log(f"股本 {len(shares)} 檔")
    return shares


# ---------- 歷史（近五日／近廿日） ----------


def load_hist():
    if HIST_FILE.exists():
        try:
            d = json.loads(HIST_FILE.read_text(encoding="utf-8"))
            if isinstance(d.get("dates"), list) and isinstance(d.get("closes"), dict):
                return d
        except json.JSONDecodeError:
            pass
    return {"dates": [], "closes": {}}


def update_hist(hist, quotes, codes, date):
    """把當日收盤併進滾動歷史；同一天重跑會覆蓋而非重複追加。"""
    dates, closes = hist["dates"], hist["closes"]
    if date in dates:
        idx = dates.index(date)
    else:
        dates.append(date)
        dates.sort()
        idx = dates.index(date)
        for series in closes.values():
            series.insert(idx, None)
    for code in codes:
        series = closes.setdefault(code, [None] * len(dates))
        while len(series) < len(dates):
            series.append(None)
        q = quotes.get(code)
        series[idx] = round(q["close"], 4) if q else None
    # 只留最近 HIST_KEEP 天與現有龍頭，檔案大小才不會隨時間漲
    keep = len(dates) - HIST_KEEP
    if keep > 0:
        hist["dates"] = dates[keep:]
        closes = {c: s[keep:] for c, s in closes.items()}
    hist["closes"] = {c: s for c, s in closes.items() if c in codes}
    return hist


def perf(hist, code, back):
    series = hist["closes"].get(code) or []
    if len(series) <= back or series[-1] is None:
        return None
    prev = series[-1 - back]
    return round((series[-1] / prev - 1) * 100, 2) if prev else None


# ---------- 新聞 ----------


def fetch_news(leaders):
    pool, seen = [], set()
    for cat in CNYES_CATS:
        url = f"https://api.cnyes.com/media/api/v1/newslist/category/{cat}?limit=30"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": UA,  # 缺 UA 會被 Cloudflare 擋 403
                "Accept": "*/*",
                "Origin": "https://www.cnyes.com",
                "Referer": "https://www.cnyes.com/",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=25) as resp:
                raw = resp.read()
                if resp.headers.get("Content-Encoding") == "gzip":
                    raw = gzip.decompress(raw)
            rows = (json.loads(raw.decode()).get("items") or {}).get("data") or []
        except Exception as e:  # noqa: BLE001
            log(f"新聞 {cat} 抓取失敗：{str(e)[:70]}")
            continue
        now = time.time()
        for it in rows:
            ts = int(it.get("publishAt") or 0)
            nid = it.get("newsId")
            if now - ts > 48 * 3600 or nid in seen or not it.get("title"):
                continue
            seen.add(nid)
            pool.append(
                {
                    "t": it["title"].strip(),
                    "u": f"https://news.cnyes.com/news/id/{nid}",
                    "ts": ts,
                }
            )

    hits = {}
    for code, name in leaders.items():
        key = re.sub(r"[*＊]|-KY$|-DR$", "", name).strip()
        if len(key) < 2:
            continue
        found = [n for n in pool if key in n["t"]]
        if found:
            hits[code] = sorted(found, key=lambda x: -x["ts"])[:NEWS_PER_COMPANY]
    log(f"比對到有新聞的龍頭 {len(hits)} 家")
    return hits


# ---------- 主流程 ----------


def main():
    chain = load_map()
    quotes, date = load_quotes()
    shares = load_shares()

    # 先挑龍頭（只看市值），再更新歷史，歷史就只需存龍頭
    industries, leader_codes = [], {}
    for ind in chain["industries"]:
        segments = []
        ind_codes = set()
        for seg in ind["segments"]:
            rows = []
            for co in seg["companies"]:
                q = quotes.get(co["c"])
                if not q:
                    continue
                sh = shares.get(co["c"])
                rows.append(
                    {
                        "c": co["c"],
                        "n": co["n"] or q["name"],
                        "mk": q["mk"],
                        "p": q["close"],
                        "d": round(q["chg"], 2) if q["chg"] is not None else None,
                        "mcap": round(sh * q["close"] / 1e8, 1) if sh else None,
                    }
                )
                ind_codes.add(co["c"])
            rows.sort(key=lambda r: (r["mcap"] is None, -(r["mcap"] or 0)))
            leaders = rows[:LEADERS_PER_SEGMENT]
            for r in leaders:
                leader_codes[r["c"]] = r["n"]
            segments.append(
                {
                    "name": seg["name"],
                    "stage": seg["stage"],
                    "listed": len(rows),
                    "leaders": leaders,
                }
            )
        wsum = wtot = 0.0
        for code in ind_codes:
            q, sh = quotes.get(code), shares.get(code)
            if not q or q["chg"] is None or not sh:
                continue
            w = sh * q["close"] / 1e8
            wsum += w * q["chg"]
            wtot += w
        industries.append(
            {
                "code": ind["code"],
                "name": ind["name"],
                "companies": len(ind_codes),
                "mcap": round(wtot, 1),
                "chg": round(wsum / wtot, 2) if wtot else None,
                "segments": [s for s in segments if s["leaders"]],
            }
        )
    industries.sort(key=lambda i: -(i["mcap"] or 0))

    hist = update_hist(load_hist(), quotes, set(leader_codes), date)
    HIST_FILE.write_text(
        json.dumps(hist, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    for ind in industries:
        for seg in ind["segments"]:
            for row in seg["leaders"]:
                row["d5"] = perf(hist, row["c"], 5)
                row["d20"] = perf(hist, row["c"], 20)

    payload = {
        "built_at": datetime.now(TPE).isoformat(timespec="seconds"),
        "market_date": date,
        "chain_fetched": chain.get("fetched", ""),
        "leaders_per_segment": LEADERS_PER_SEGMENT,
        "industries": industries,
        "news": fetch_news(leader_codes),
    }
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8"
    )
    log(
        f"寫出 {OUTPUT_FILE.name}：{len(industries)} 產業、龍頭 {len(leader_codes)} 家、"
        f"{OUTPUT_FILE.stat().st_size // 1024} KB"
    )


if __name__ == "__main__":
    main()
