#!/usr/bin/env python3
"""fetch_popular_stocks.py — 抓 Yahoo trending + 主流 ETF，產出市場熱門海外股票/ETF
列表（含板信 iQuote 連結）。

策略：
  1. Yahoo trending API → 取 US 區當下熱門 25 檔
  2. 與固定主流 ETF 清單合併（SPY/QQQ/IWM/DIA/ARKK/VTI/VOO/GLD/TLT/SMH/SOXX）
  3. 過濾掉非美股代碼（含 - 或 .L 等）
  4. 與 stocks.json 既有 us_stocks 去重（精選清單已經有的不再列）
  5. 用 fetch_stocks.py 既有邏輯（finnhub /quote + Yahoo MTD/YTD）拿價量
  6. 寫到 repo/data/popular_stocks.json

註：MoneyDJ (板信 iQuote) 對流動性夠的 US 股票/ETF 普遍支援，所以本腳本
   不做額外存在性驗證；source_url 都指向 bopfund iQuoteChart。
"""

from __future__ import annotations

import json
import re
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

import requests

# 重用 fetch_stocks.py 的工具函式
sys.path.insert(0, str(Path(__file__).resolve().parent))
from fetch_stocks import (  # noqa: E402
    fetch_finnhub_quote,
    fetch_yahoo_history,
    compute_mtd_ytd,
    UA,
    fetch_finnhub_pe,
)

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "repo" / "data" / "popular_stocks.json"
EXISTING_STOCKS = ROOT / "repo" / "data" / "stocks.json"
TPE = timezone(timedelta(hours=8))

# 主流 ETF（每天都該出現的）
CORE_ETFS = [
    ("SPY", "SPDR S&P 500 ETF"),
    ("QQQ", "Invesco 那斯達克 100 ETF"),
    ("IWM", "iShares 羅素 2000 ETF"),
    ("DIA", "SPDR 道瓊 30 ETF"),
    ("VTI", "Vanguard 全美股 ETF"),
    ("VOO", "Vanguard S&P 500 ETF"),
    ("ARKK", "ARK 創新 ETF"),
    ("SMH", "VanEck 半導體 ETF"),
    ("SOXX", "iShares 半導體 ETF"),
    ("GLD", "SPDR 黃金 ETF"),
    ("TLT", "iShares 20+ 年公債 ETF"),
]

# Trending 個股的中文化對照（涵蓋常見熱門 ~80 檔，沒命中時退到 Yahoo shortName）
STOCK_NAMES_ZH = {
    # Mega-cap tech / AI
    "AAPL": "蘋果",
    "MSFT": "微軟",
    "GOOGL": "谷歌 A",
    "GOOG": "谷歌 C",
    "AMZN": "亞馬遜",
    "META": "Meta",
    "NVDA": "輝達",
    "TSLA": "特斯拉",
    "ORCL": "甲骨文",
    "CRM": "Salesforce",
    "NOW": "ServiceNow",
    "ADBE": "Adobe",
    "PLTR": "Palantir",
    "SNOW": "Snowflake",
    "NET": "Cloudflare",
    "DDOG": "Datadog",
    "ZS": "Zscaler",
    "OKTA": "Okta",
    "PANW": "Palo Alto Networks",
    "CRWD": "CrowdStrike",
    "MDB": "MongoDB",
    "WDAY": "Workday",
    "INTU": "Intuit",
    "TEAM": "Atlassian",
    # Semiconductors
    "AMD": "超微",
    "AVGO": "博通",
    "INTC": "英特爾",
    "MU": "美光",
    "ASML": "ASML",
    "TSM": "台積電 ADR",
    "QCOM": "高通",
    "MRVL": "邁威爾",
    "NXPI": "恩智浦",
    "ARM": "Arm",
    "SMCI": "美超微",
    "LRCX": "科林研發",
    "AMAT": "應材",
    "KLAC": "科磊",
    # EV / Auto
    "RIVN": "Rivian",
    "LCID": "Lucid",
    "F": "福特",
    "GM": "通用",
    "NIO": "蔚來",
    "XPEV": "小鵬",
    "LI": "理想",
    # Fintech / Payments
    "PYPL": "PayPal",
    "SQ": "Block",
    "SOFI": "SoFi",
    "COIN": "Coinbase",
    "HOOD": "Robinhood",
    "V": "Visa",
    "MA": "萬事達",
    "AXP": "美國運通",
    # China ADRs
    "BABA": "阿里巴巴",
    "JD": "京東",
    "PDD": "拼多多",
    "BIDU": "百度",
    "TCOM": "攜程",
    "TME": "騰訊音樂",
    # Comms / Media / Consumer Internet
    "NFLX": "網飛",
    "DIS": "迪士尼",
    "RBLX": "Roblox",
    "SPOT": "Spotify",
    "T": "AT&T",
    "VZ": "威訊",
    "UBER": "Uber",
    "LYFT": "Lyft",
    "ABNB": "Airbnb",
    "DASH": "DoorDash",
    "SHOP": "Shopify",
    "ETSY": "Etsy",
    "PINS": "Pinterest",
    "SNAP": "Snap",
    "RDDT": "Reddit",
    # Energy / Materials
    "XOM": "艾克森美孚",
    "CVX": "雪佛龍",
    "NEE": "新時代能源",
    "OXY": "西方石油",
    "COP": "康菲石油",
    "FCX": "自由港麥克莫蘭",
    # Healthcare / Pharma / Biotech
    "LLY": "禮來",
    "JNJ": "嬌生",
    "PFE": "輝瑞",
    "MRK": "默克",
    "ABBV": "艾伯維",
    "REGN": "再生元",
    "MRNA": "莫德納",
    "UNH": "聯合健康",
    "CVS": "CVS Health",
    "GILD": "吉立亞",
    "VRTX": "Vertex",
    # Financials
    "JPM": "摩根大通",
    "BAC": "美國銀行",
    "GS": "高盛",
    "MS": "摩根士丹利",
    "WFC": "富國銀行",
    "C": "花旗",
    "BRK.B": "波克夏 B",
    "BLK": "貝萊德",
    "SCHW": "嘉信理財",
    # Consumer
    "COST": "好市多",
    "WMT": "沃爾瑪",
    "TGT": "標靶",
    "HD": "家得寶",
    "LOW": "羅威",
    "MCD": "麥當勞",
    "SBUX": "星巴克",
    "NKE": "Nike",
    "KO": "可口可樂",
    "PEP": "百事",
    "PG": "寶僑",
    "CL": "高露潔棕欖",
    # Industrials
    "BA": "波音",
    "CAT": "卡特彼勒",
    "GE": "奇異",
    "LMT": "洛馬",
    "RTX": "雷神",
    "DE": "強鹿",
    # Crypto-related
    "BKKT": "Bakkt",
    "MARA": "Marathon Digital",
    "RIOT": "Riot Platforms",
    "MSTR": "MicroStrategy",
    "CLSK": "CleanSpark",
    # Ad / Mar-tech
    "ZETA": "Zeta Global",
    "TTD": "The Trade Desk",
    "APP": "AppLovin",
}

VALID_SYM = re.compile(r"^[A-Z][A-Z0-9]{0,5}$")

# Yahoo shortName 後綴清理用
_NAME_SUFFIX = re.compile(
    r",?\s*(Inc\.?|Corp\.?|Corporation|Co\.?|Company|Ltd\.?|Limited|"
    r"plc|N\.V\.|S\.A\.|Holdings,?|Group,?|& Co\.?)\s*\.?$",
    re.IGNORECASE,
)


def lookup_stock_name(symbol):
    """Static zh map → Yahoo chart meta shortName → fallback to symbol."""
    if symbol in STOCK_NAMES_ZH:
        return STOCK_NAMES_ZH[symbol]
    try:
        r = requests.get(
            f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
            f"?interval=1d&range=1d",
            headers={"User-Agent": UA},
            timeout=6,
        )
        r.raise_for_status()
        meta = r.json()["chart"]["result"][0].get("meta", {})
        name = meta.get("shortName") or meta.get("longName") or ""
        # 連砍兩次後綴（"Holdings, Inc." 之類）
        name = _NAME_SUFFIX.sub("", name).strip()
        name = _NAME_SUFFIX.sub("", name).strip()
        return name or symbol
    except Exception:
        return symbol


def fetch_yahoo_trending(limit=25):
    """Yahoo trending US tickers."""
    try:
        r = requests.get(
            "https://query1.finance.yahoo.com/v1/finance/trending/US",
            params={"count": limit},
            headers={"User-Agent": UA},
            timeout=15,
        )
        r.raise_for_status()
        quotes = r.json().get("finance", {}).get("result", [{}])[0].get("quotes", [])
        out = []
        for q in quotes:
            sym = (q.get("symbol") or "").strip().upper()
            if VALID_SYM.match(sym):
                out.append(sym)
        return out
    except Exception as e:
        print(f"[warn] yahoo trending fail: {e}")
        return []


def fetch_yahoo_quote_meta(symbol):
    """Fall-back name lookup via Yahoo chart meta."""
    hist = fetch_yahoo_history(symbol)
    return hist


def build_record(symbol, name_zh):
    """Returns (record, ok). ok=False if no price data."""
    rec = {
        "symbol": symbol,
        "name_zh": name_zh,
        "kind": "US",
        "price": None,
        "change_pct": None,
        "mtd_pct": None,
        "ytd_pct": None,
        "market_date": None,
        "per": None,
        "per_kind": None,
        "source_url": f"https://bopfund.moneydj.com/w/wj/iQuoteChart.djhtm?a={symbol}.US",
        "error": None,
    }
    q = fetch_finnhub_quote(symbol)
    price = q.get("c")
    change_pct = q.get("dp")
    if price is None:
        rec["error"] = "no_price"
        return rec, False
    rec["price"] = round(price, 2) if isinstance(price, (int, float)) else price
    rec["change_pct"] = (
        round(change_pct, 2) if isinstance(change_pct, (int, float)) else change_pct
    )
    # MTD/YTD（best-effort）
    hist = fetch_yahoo_history(symbol)
    if hist:
        rec["market_date"] = hist[-1][0]
        mtd, ytd = compute_mtd_ytd(hist)
        rec["mtd_pct"] = mtd
        rec["ytd_pct"] = ytd
    rec["per"] = fetch_finnhub_pe(symbol)
    rec["per_kind"] = "trailing" if rec["per"] is not None else None
    return rec, True


def load_existing_us_symbols():
    if not EXISTING_STOCKS.exists():
        return set()
    d = json.loads(EXISTING_STOCKS.read_text("utf-8"))
    return {s["symbol"] for s in d.get("us_stocks", []) if s.get("symbol")}


def main():
    existing = load_existing_us_symbols()
    print(f"[info] 精選清單已有 {len(existing)} 檔，去重")

    trending = fetch_yahoo_trending(limit=25)
    print(f"[fetch] yahoo trending: {len(trending)} 檔")

    # 合併：trending 先，ETF 後
    seen = set(existing)
    order = []
    for sym in trending:
        if sym not in seen:
            seen.add(sym)
            order.append((sym, lookup_stock_name(sym)))
    for sym, name in CORE_ETFS:
        if sym not in seen:
            seen.add(sym)
            order.append((sym, name))

    print(f"[fetch] 將抓 {len(order)} 檔（去重後）")

    out = {
        "generated_at": datetime.now(TPE).isoformat(timespec="seconds"),
        "source": "Yahoo trending + 主流 ETF 清單；price=finnhub, MTD/YTD=Yahoo",
        "stocks": [],
    }
    for sym, name in order:
        rec, ok = build_record(sym, name)
        if not ok:
            print(f"   ! {sym:6s} skip ({rec.get('error')})")
            continue
        # 過濾 penny / 流動性低（< $5），避免熱門榜被低流動性個股污染
        if rec["price"] is not None and rec["price"] < 5:
            print(f"   – {sym:6s} skip (price ${rec['price']:.2f} < $5)")
            continue
        price_str = f"${rec['price']:>8.2f}" if rec["price"] is not None else "       —"
        chg_str = f"{rec['change_pct']:+.2f}%" if rec["change_pct"] is not None else "—"
        print(f"   ✓ {sym:6s} {price_str}  日 {chg_str}")
        out["stocks"].append(rec)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(out, ensure_ascii=False, indent=2), "utf-8")
    print(f"[done] {len(out['stocks'])} 熱門海外標的 → {OUTPUT}")


if __name__ == "__main__":
    sys.exit(main())
