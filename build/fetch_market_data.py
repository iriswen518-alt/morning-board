#!/usr/bin/env python3
"""
fetch_market_data.py — 全球市場資料「確定性」預抓器

取代舊作法(叫 LLM 用 Firecrawl 爬 JS 財經頁)。所有數字由本腳本以
Python 確定性抓取與計算 —— 下游的 claude 永遠不碰數字、不猜基準值。

為什麼要這支腳本
----------------
舊管線讓 LLM 自己爬歷史頁找「月初/年初」基準價。Firecrawl 免費額度
(500次/月)被每日排程燒光、JS 分頁歷史頁也難精準定位某一天 → LLM
拿不到基準就「猜」(同一個固定的 2025 年底收盤價天天不一樣)或整欄
留 `—`。這就是「資料缺漏一直發生」的根因。

資料源(全部免費、不需金鑰、不限額)
------------------------------------
  - Yahoo Finance chart API:15 股市指數 + 6 匯率 + 5 商品 + US 10Y 殖利率。
    一次呼叫回傳整年每日收盤,基準值用「日期定位」精準取得。
  - FRED CSV (fredgraph.csv?id=DGS2):US 2Y 殖利率,免費 CSV、含完整日資料。
  - DE/JP/UK 10Y:無乾淨免費「日」資料源 → 標 null,由下游 websearch
    僅補「當前殖利率」一格(有界例外,衍生欄位誠實留 `—`,不猜)。

輸出
----
  ~/scripts/logs/market_data_latest.json      下游 claude 讀這支
  ~/scripts/logs/market_data_{YYYYMMDD}.json  存檔 + 隔日基準校驗用

驗收閘(validation gate)
------------------------
  - 年初基準須與最近一次 JSON 一致(固定歷史值不該變)→ 不一致發 warning
  - 任一「指數/匯率/商品」核心欄位(收盤、日漲跌)為 null → error
  - 任一衍生欄位(月初/MTD/年初/YTD)整欄空 → warning

exit code:0 = ok 或僅 warning;1 = 核心資料缺失(.sh 應中止、不發佈)

用法
----
  fetch_market_data.py                # run_date = 今天
  fetch_market_data.py --date 2026-05-22
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import gzip
import io
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Optional

LOG_DIR = Path.home() / "scripts" / "logs"
LATEST_JSON = LOG_DIR / "market_data_latest.json"

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
RED = "#d62828"  # 漲 / 正值
GREEN = "#2a9d8f"  # 跌 / 負值

# ----------------------------------------------------------------------
# 工具標的設定:(顯示名稱, Yahoo 代碼, 收盤價小數位)
# 順序即為輸出表格的列序,請勿任意調動。
# ----------------------------------------------------------------------
EQUITIES = [
    ("S&P 500", "^GSPC", 2),
    ("Nasdaq Composite", "^IXIC", 2),
    ("Dow Jones", "^DJI", 2),
    ("Euro Stoxx 50", "^STOXX50E", 2),
    ("DAX", "^GDAXI", 2),
    ("FTSE 100", "^FTSE", 2),
    ("CAC 40", "^FCHI", 2),
    ("Nikkei 225", "^N225", 2),
    ("TAIEX 加權指數", "^TWII", 2),
    ("OTC 櫃買加權", "^TWOII", 2),
    ("KOSPI", "^KS11", 2),
    ("Hang Seng 恆生", "^HSI", 2),
    ("Shanghai 上證", "000001.SS", 2),
    ("CSI 300 滬深300", "000300.SS", 2),
    ("Nifty 50", "^NSEI", 2),
    ("S&P/ASX 200", "^AXJO", 2),
]

FX = [
    ("DXY 美元指數", "DX-Y.NYB", 2),
    ("EUR/USD 歐元", "EURUSD=X", 4),
    ("USD/JPY 日圓", "JPY=X", 2),
    ("GBP/USD 英鎊", "GBPUSD=X", 4),
    ("USD/CNY 人民幣", "CNY=X", 4),
    ("USD/TWD 新台幣", "TWD=X", 3),
    ("JPY/TWD 日圓兌台幣", "JPYTWD=X", 4),
]

COMMODITIES = [
    ("黃金 (USD/oz)", "GC=F", 2),
    ("白銀 (USD/oz)", "SI=F", 2),
    ("WTI 原油 (USD/bbl)", "CL=F", 2),
    ("布蘭特原油 (USD/bbl)", "BZ=F", 2),
    ("比特幣 (USD)", "BTC-USD", 0),
]

# 公債:(顯示名稱, 取得方式, 來源代碼)
#   yahoo    → Yahoo chart API(殖利率指數)
#   ecb      → ECB SDW CSV
#   treasury → 美國財政部每日公債殖利率曲線 CSV(官方、免金鑰、雲端可達)
#   fred     → FRED CSV(已棄用:2026-06 起 FRED 對非瀏覽器/資料中心 IP 連線 tarpitting,改用 treasury)
#   none     → 無免費日資料源,下游 websearch 補當前殖利率一格
BONDS = [
    ("US 10-Year", "yahoo", "^TNX"),
    # 2026-06-04：FRED DGS2 連線被 tarpit(雲端與本機皆 timeout)→ 改用財政部官方殖利率曲線 "2 Yr"
    ("US 2-Year", "treasury", "2 Yr"),
    # 2026-05-25：Germany 10Y 改用 ECB SDW（日頻率公開資料），可算 daily/MTD bps
    ("Germany 10-Year", "ecb", "YC.B.U2.EUR.4F.G_N_A.SV_C_YM.SR_10Y"),
    # Japan/UK 10Y 目前無免費日頻率資料源；保留 yahoo websearch 補當前殖利率（單格）
    ("Japan 10-Year", "none", ""),
    ("UK 10-Year", "none", ""),
]


# ----------------------------------------------------------------------
# HTTP
# ----------------------------------------------------------------------
def http_get(url: str, timeout: int = 20) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        raw = resp.read()
        if resp.headers.get("Content-Encoding") == "gzip":
            raw = gzip.decompress(raw)
        return raw


def yahoo_series(symbol: str) -> list[tuple[dt.date, float]]:
    """回傳 [(date, close)] 升冪排序,已濾掉 null。失敗 raise。"""
    enc = urllib.parse.quote(symbol, safe="=.-")
    path = f"/v8/finance/chart/{enc}?range=1y&interval=1d"
    last_err: Optional[Exception] = None
    for host in ("query1.finance.yahoo.com", "query2.finance.yahoo.com"):
        for attempt in range(3):
            try:
                data = json.loads(http_get(f"https://{host}{path}"))
                result = data["chart"]["result"][0]
                gmt = result.get("meta", {}).get("gmtoffset", 0) or 0
                ts = result.get("timestamp") or []
                closes = result["indicators"]["quote"][0].get("close") or []
                out: list[tuple[dt.date, float]] = []
                for t, c in zip(ts, closes):
                    if c is None:
                        continue
                    d = dt.datetime.fromtimestamp(t + gmt, tz=dt.timezone.utc).date()
                    out.append((d, float(c)))
                out.sort(key=lambda x: x[0])
                if out:
                    return out
                last_err = ValueError(f"{symbol}: empty series")
            except Exception as e:  # noqa: BLE001
                last_err = e
            time.sleep(0.8 * (attempt + 1))
    raise RuntimeError(f"Yahoo fetch failed for {symbol}: {last_err}")


def ecb_series(key: str) -> list[tuple[dt.date, float]]:
    """ECB SDW CSV → [(date, value)] 升冪。供德國/歐元區公債殖利率使用。"""
    url = f"https://data-api.ecb.europa.eu/service/data/YC/{key.split('YC.')[-1] if 'YC.' in key else key}?format=csvdata&lastNObservations=400"
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        raw = resp.read().decode("utf-8")
    lines = raw.strip().split("\n")
    if len(lines) < 2:
        raise ValueError(f"ECB {key}: empty")
    header = lines[0].split(",")
    try:
        date_idx = header.index("TIME_PERIOD")
        val_idx = header.index("OBS_VALUE")
    except ValueError as e:
        raise ValueError(f"ECB {key}: header missing {e}")
    out: list[tuple[dt.date, float]] = []
    for line in lines[1:]:
        cols = line.split(",")
        try:
            d = dt.date.fromisoformat(cols[date_idx])
            v = float(cols[val_idx])
            out.append((d, v))
        except (ValueError, IndexError):
            continue
    out.sort(key=lambda x: x[0])
    if not out:
        raise ValueError(f"ECB {key}: no rows parsed")
    return out


def fred_series(series_id: str) -> list[tuple[dt.date, float]]:
    """FRED CSV → [(date, value)] 升冪。缺值 '.' 略過。"""
    url = f"https://fred.stlouisfed.org/graph/fredgraph.csv?id={series_id}"
    raw = http_get(url).decode("utf-8", "replace")
    out: list[tuple[dt.date, float]] = []
    for row in csv.reader(io.StringIO(raw)):
        if len(row) < 2:
            continue
        try:
            d = dt.date.fromisoformat(row[0].strip())
            v = float(row[1].strip())
        except (ValueError, IndexError):
            continue  # 表頭 / 缺值 '.'
        out.append((d, v))
    out.sort(key=lambda x: x[0])
    if not out:
        raise RuntimeError(f"FRED fetch failed for {series_id}")
    return out


def _treasury_year_csv(tenor: str, year: int) -> list[tuple[dt.date, float]]:
    """單一年度的財政部每日公債殖利率曲線 → [(date, value)]。tenor = 表頭欄名(如 '2 Yr')。"""
    url = (
        "https://home.treasury.gov/resource-center/data-chart-center/"
        f"interest-rates/daily-treasury-rates.csv/{year}/all"
        f"?type=daily_treasury_yield_curve&field_tdr_date_value={year}"
        "&page&_format=csv"
    )
    raw = http_get(url).decode("utf-8", "replace")
    reader = csv.reader(io.StringIO(raw))
    rows = list(reader)
    if not rows:
        return []
    header = [h.strip() for h in rows[0]]
    try:
        col = header.index(tenor)
    except ValueError:
        raise RuntimeError(f"Treasury CSV missing column {tenor!r}; got {header}")
    out: list[tuple[dt.date, float]] = []
    for row in rows[1:]:
        if len(row) <= col:
            continue
        try:
            d = dt.datetime.strptime(row[0].strip(), "%m/%d/%Y").date()
            v = float(row[col].strip())
        except (ValueError, IndexError):
            continue
        out.append((d, v))
    return out


def treasury_series(tenor: str, run_date: dt.date) -> list[tuple[dt.date, float]]:
    """美國財政部每日公債殖利率曲線(par yield)→ [(date, value)] 升冪。
    抓取收盤年與前一年,確保月初/年初基準(含 1 月跨年)齊備。FRED 替代源。"""
    years = sorted({run_date.year, run_date.year - 1})
    merged: dict[dt.date, float] = {}
    last_err: Optional[Exception] = None
    for y in years:
        try:
            for d, v in _treasury_year_csv(tenor, y):
                merged[d] = v
        except Exception as e:  # noqa: BLE001
            last_err = e
    if not merged:
        raise RuntimeError(f"Treasury fetch failed for {tenor!r}: {last_err}")
    return sorted(merged.items())


# ----------------------------------------------------------------------
# 計算
# ----------------------------------------------------------------------
def _last_before(series: list[tuple[dt.date, float]], cutoff: dt.date):
    """series 中日期 < cutoff 的最後一筆 (date, value);無則 None。"""
    hit = None
    for d, v in series:
        if d < cutoff:
            hit = (d, v)
        else:
            break
    return hit


def compute(series: list[tuple[dt.date, float]], run_date: dt.date) -> dict:
    """
    給定日資料序列與執行日,算出:
      latest  = 執行日「之前」最後一個交易日的收盤(= 收盤日)
      prev    = 再前一個交易日 → 算日變動
      month_start = 上月最後交易日收盤(MTD 基準)
      year_start  = 上一年最後交易日收盤(YTD 基準)
    任一抓不到回 None,不猜。

    MTD/YTD 基準錨定在「收盤日」所屬的月/年,而非 run_date 的月/年。
    否則在每月(或每年)第一天、但最新資料還停在上月(上年)最後交易日時,
    month_start 會錨到 run_date 當月 → 抓到的正好就是收盤日那筆 →
    MTD/YTD 退化成 0.00%(2026-06-01 商品期貨「本月」全 0 的成因)。
    """
    past = [(d, v) for d, v in series if d < run_date]
    res: dict = {
        "close": None,
        "prev_close": None,
        "closing_date": None,
        "month_start": None,
        "year_start": None,
    }
    if len(past) >= 1:
        close_date = past[-1][0]
        res["close"] = past[-1][1]
        res["closing_date"] = close_date.isoformat()
        ms = _last_before(series, close_date.replace(day=1))
        if ms:
            res["month_start"] = ms[1]
        ys = _last_before(series, dt.date(close_date.year, 1, 1))
        if ys:
            res["year_start"] = ys[1]
    if len(past) >= 2:
        res["prev_close"] = past[-2][1]
    return res


def pct(now: Optional[float], base: Optional[float]) -> Optional[float]:
    if now is None or base is None or base == 0:
        return None
    return (now / base - 1.0) * 100.0


def bps(now: Optional[float], base: Optional[float]) -> Optional[float]:
    if now is None or base is None:
        return None
    return (now - base) * 100.0


# ----------------------------------------------------------------------
# 格式化(含紅漲綠跌染色)
# ----------------------------------------------------------------------
def fmt_price(v: Optional[float], dec: int) -> str:
    return "—" if v is None else f"{v:,.{dec}f}"


def _colored(txt: str, positive: bool, negative: bool) -> str:
    if positive:
        return f'<span style="color:{RED}">{txt}</span>'
    if negative:
        return f'<span style="color:{GREEN}">{txt}</span>'
    return txt


def fmt_pct(v: Optional[float]) -> str:
    if v is None:
        return "—"
    txt = f"{'+' if v >= 0 else ''}{v:.2f}%"
    return _colored(txt, v > 0, v < 0)


def fmt_bps(v: Optional[float]) -> str:
    if v is None:
        return "—"
    iv = int(round(v))
    txt = f"{'+' if iv >= 0 else ''}{iv}"
    return _colored(txt, iv > 0, iv < 0)


def fmt_yield(v: Optional[float]) -> str:
    return "—" if v is None else f"{v:.2f}%"


# ----------------------------------------------------------------------
# 抓取 + 組裝各表
# ----------------------------------------------------------------------
def build_price_rows(config, run_date, warnings) -> list[dict]:
    rows = []
    for name, symbol, dec in config:
        rec = {
            "name": name,
            "symbol": symbol,
            "decimals": dec,
            "source": "yahoo",
            "note": "",
        }
        try:
            c = compute(yahoo_series(symbol), run_date)
            rec.update(c)
            rec["daily_pct"] = pct(c["close"], c["prev_close"])
            rec["mtd_pct"] = pct(c["close"], c["month_start"])
            rec["ytd_pct"] = pct(c["close"], c["year_start"])
        except Exception as e:  # noqa: BLE001
            rec["note"] = f"fetch failed: {e}"
            warnings.append(f"{name} ({symbol}): {e}")
            rec.update(
                {
                    "close": None,
                    "prev_close": None,
                    "closing_date": None,
                    "month_start": None,
                    "year_start": None,
                    "daily_pct": None,
                    "mtd_pct": None,
                    "ytd_pct": None,
                }
            )
        time.sleep(0.4)
        rows.append(rec)
    return rows


def build_bond_rows(run_date, warnings) -> list[dict]:
    rows = []
    for name, kind, code in BONDS:
        rec = {"name": name, "symbol": code, "source": kind, "note": ""}
        if kind == "none":
            rec.update(
                {
                    "yield": None,
                    "prev_yield": None,
                    "closing_date": None,
                    "month_start": None,
                    "daily_bps": None,
                    "mtd_bps": None,
                    "note": "no free daily source — downstream websearch",
                }
            )
            rows.append(rec)
            continue
        try:
            if kind == "yahoo":
                series = yahoo_series(code)
            elif kind == "ecb":
                series = ecb_series(code)
            elif kind == "treasury":
                series = treasury_series(code, run_date)
            else:
                series = fred_series(code)
            c = compute(series, run_date)
            rec.update(
                {
                    "yield": c["close"],
                    "prev_yield": c["prev_close"],
                    "closing_date": c["closing_date"],
                    "month_start": c["month_start"],
                    "daily_bps": bps(c["close"], c["prev_close"]),
                    "mtd_bps": bps(c["close"], c["month_start"]),
                }
            )
        except Exception as e:  # noqa: BLE001
            rec["note"] = f"fetch failed: {e}"
            warnings.append(f"{name} ({code}): {e}")
            rec.update(
                {
                    "yield": None,
                    "prev_yield": None,
                    "closing_date": None,
                    "month_start": None,
                    "daily_bps": None,
                    "mtd_bps": None,
                }
            )
        time.sleep(0.4)
        rows.append(rec)
    return rows


# 台指期(TAIFEX TX 近月):Yahoo 無此商品,改用期交所 open API。
# 期貨按月轉倉,MTD/YTD 對單一合約無意義 → month_start/year_start 留 None。
TAIFEX_FUT_URL = "https://openapi.taifex.com.tw/v1/DailyMarketReportFut"


def build_taifex_tx_row(warnings) -> Optional[dict]:
    rec = {
        "name": "台指期(近月)",
        "symbol": "TAIFEX:TX",
        "decimals": 0,
        "source": "taifex",
        "note": "",
        "close": None,
        "prev_close": None,
        "closing_date": None,
        "month_start": None,
        "year_start": None,
        "daily_pct": None,
        "mtd_pct": None,
        "ytd_pct": None,
    }
    try:
        data = json.loads(http_get(TAIFEX_FUT_URL).decode("utf-8"))
        tx = [
            r
            for r in data
            if r.get("Contract") == "TX"
            and r.get("TradingSession") == "一般"
            and re.fullmatch(r"\d{6}", r.get("ContractMonth(Week)", ""))
            and r.get("Last") not in (None, "", "NULL", "-")
        ]
        if not tx:
            raise ValueError("無 TX 一般盤近月資料")
        near = min(tx, key=lambda r: r["ContractMonth(Week)"])
        last = float(str(near["Last"]).replace(",", ""))
        pct_txt = str(near.get("%", "")).replace("%", "").replace("+", "").strip()
        rec["close"] = last
        rec["daily_pct"] = float(pct_txt) if pct_txt not in ("", "NULL", "-") else None
        d = near.get("Date", "")
        if re.fullmatch(r"\d{8}", d):
            rec["closing_date"] = f"{d[:4]}-{d[4:6]}-{d[6:]}"
        chg = str(near.get("Change", "")).replace(",", "")
        try:
            rec["prev_close"] = last - float(chg)
        except ValueError:
            pass
        if rec["daily_pct"] is None and rec["prev_close"]:
            rec["daily_pct"] = pct(last, rec["prev_close"])
        rec["note"] = f"近月 {near['ContractMonth(Week)']}"
    except Exception as e:  # noqa: BLE001
        rec["note"] = f"fetch failed: {e}"
        warnings.append(f"台指期 (TAIFEX:TX): {e}")
    return rec


# ----------------------------------------------------------------------
# 渲染 markdown 表格(下游 claude 原樣貼上,不得改任何數字)
# ----------------------------------------------------------------------
def render_price_table(rows: list[dict], first_col: str) -> str:
    head = f"| {first_col} | 收盤 | 日漲跌 | 月初 | MTD | 年初 | YTD | 收盤日 |"
    sep = "|------|-----:|-------:|-----:|----:|-----:|----:|--------|"
    lines = [head, sep]
    for r in rows:
        dec = r["decimals"]
        lines.append(
            f"| {r['name']} | {fmt_price(r['close'], dec)} | "
            f"{fmt_pct(r['daily_pct'])} | {fmt_price(r['month_start'], dec)} | "
            f"{fmt_pct(r['mtd_pct'])} | {fmt_price(r['year_start'], dec)} | "
            f"{fmt_pct(r['ytd_pct'])} | {r['closing_date'] or '—'} |"
        )
    return "\n".join(lines)


def render_bond_table(rows: list[dict]) -> str:
    head = "| 債別 | 殖利率 | 日變動bps | 月初殖利率 | MTDbps | 收盤日 |"
    sep = "|------|-------:|----------:|----------:|-------:|--------|"
    lines = [head, sep]
    for r in rows:
        # 2026-05-25：Japan/UK 10Y 無免費日頻率資料源，明確標 n/a 並加 footnote
        is_spot_only = r.get("source") == "none"
        if is_spot_only and r.get("yield") is not None:
            daily_cell = '<span title="無免費日頻率資料源（Yahoo/FRED/ECB 均無），僅取即時殖利率">n/a*</span>'
            mtd_cell = '<span title="無免費日頻率資料源（Yahoo/FRED/ECB 均無），無法算 MTD">n/a*</span>'
            month_start_cell = '<span title="無歷史資料">—</span>'
        else:
            daily_cell = fmt_bps(r["daily_bps"])
            mtd_cell = fmt_bps(r["mtd_bps"])
            month_start_cell = fmt_yield(r["month_start"])
        lines.append(
            f"| {r['name']} | {fmt_yield(r['yield'])} | "
            f"{daily_cell} | {month_start_cell} | "
            f"{mtd_cell} | {r['closing_date'] or '—'} |"
        )
    return "\n".join(lines)


# ----------------------------------------------------------------------
# 驗收閘
# ----------------------------------------------------------------------
def load_prev_json(today_stamp: str) -> Optional[dict]:
    files = sorted(LOG_DIR.glob("market_data_2*.json"))
    files = [f for f in files if today_stamp not in f.name]
    if not files:
        return None
    try:
        return json.loads(files[-1].read_text("utf-8"))
    except Exception:  # noqa: BLE001
        return None


def validate(payload: dict, prev: Optional[dict]) -> dict:
    errors: list[str] = []
    warnings: list[str] = list(payload.get("_fetch_warnings", []))

    # 1. 核心欄位不可缺(指數/匯率/商品:收盤+日漲跌)
    for table in ("equity", "fx", "commodities"):
        for r in payload[table]:
            if r["close"] is None:
                errors.append(f"[{table}] {r['name']} 收盤缺失")
            if r["daily_pct"] is None:
                errors.append(f"[{table}] {r['name']} 日漲跌缺失")

    # 2. 衍生欄位整欄空 → warning
    for table in ("equity", "fx", "commodities"):
        rows = payload[table]
        for col in ("month_start", "mtd_pct", "year_start", "ytd_pct"):
            if rows and all(r[col] is None for r in rows):
                warnings.append(f"[{table}] 衍生欄位 {col} 整欄空白")

    # 2b. mtd_pct / ytd_pct 整欄非空但全 0.00% → 月初/年初邊界 bug 警訊
    #     (2026-06-01:run_date 落在新月第一天、最新收盤還停在上月底時,
    #      baseline 會錨到收盤日當天 → 報酬退化成 0.00%,validate 卻因非 None 放行)
    for table in ("equity", "fx", "commodities"):
        rows = payload[table]
        for col in ("mtd_pct", "ytd_pct"):
            vals = [r[col] for r in rows if r[col] is not None]
            if len(vals) >= 2 and all(round(v, 2) == 0.0 for v in vals):
                warnings.append(
                    f"[{table}] {col} 整欄 0.00%(疑似月初/年初基準邊界 bug,請查 compute())"
                )

    # 3. 年初基準穩定性(固定歷史值不該變)
    if prev:
        for table in ("equity", "fx", "commodities"):
            prev_map = {r["symbol"]: r.get("year_start") for r in prev.get(table, [])}
            for r in payload[table]:
                a, b = r.get("year_start"), prev_map.get(r["symbol"])
                if a and b and abs(a - b) / b > 0.005:
                    warnings.append(
                        f"[{table}] {r['name']} 年初基準變動 "
                        f"{b} → {a}(固定值不該變,請查資料源)"
                    )

    # 4. 公債:US 兩檔核心殖利率缺失。資料源「暫時」抓取失敗 → 降級為 warning
    #    (誠實顯示 n/a,整份報告照常發佈);非抓取失敗的缺值才視為 error。
    for r in payload["bonds"]:
        if r["source"] in ("yahoo", "fred", "treasury", "ecb") and r["yield"] is None:
            if str(r.get("note", "")).startswith("fetch failed"):
                warnings.append(f"[bonds] {r['name']} 殖利率暫缺(資料源失敗,顯示 n/a)")
            else:
                errors.append(f"[bonds] {r['name']} 殖利率缺失")

    status = "error" if errors else ("warn" if warnings else "ok")
    return {"status": status, "errors": errors, "warnings": warnings}


# ----------------------------------------------------------------------
# main
# ----------------------------------------------------------------------
def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--date", help="run date YYYY-MM-DD(預設今天)")
    args = ap.parse_args()
    run_date = dt.date.fromisoformat(args.date) if args.date else dt.date.today()
    LOG_DIR.mkdir(parents=True, exist_ok=True)

    print(f"[fetch_market_data] run_date={run_date}")
    fetch_warnings: list[str] = []

    equity = build_price_rows(EQUITIES, run_date, fetch_warnings)
    # 台指期(TAIFEX):插在 OTC 櫃買加權之後(無則接 TAIEX 之後)
    tx_row = build_taifex_tx_row(fetch_warnings)
    if tx_row and tx_row["close"] is not None:
        anchor = next(
            (i for i, r in enumerate(equity) if r["symbol"] == "^TWOII"), None
        )
        if anchor is None:
            anchor = next(
                (i for i, r in enumerate(equity) if r["symbol"] == "^TWII"),
                len(equity) - 1,
            )
        equity.insert(anchor + 1, tx_row)
    fx = build_price_rows(FX, run_date, fetch_warnings)
    commodities = build_price_rows(COMMODITIES, run_date, fetch_warnings)
    bonds = build_bond_rows(run_date, fetch_warnings)

    # 各表代表收盤日 = 該表最新的一個收盤日
    def table_close_date(rows, key="closing_date"):
        ds = [r[key] for r in rows if r.get(key)]
        return max(ds) if ds else None

    payload: dict = {
        "run_date": run_date.isoformat(),
        "generated_at": dt.datetime.now().isoformat(timespec="seconds"),
        "primary_closing_date": table_close_date(equity),
        "equity": equity,
        "fx": fx,
        "commodities": commodities,
        "bonds": bonds,
        "_fetch_warnings": fetch_warnings,
    }
    payload["markdown"] = {
        "equity": render_price_table(equity, "指數"),
        "fx": render_price_table(fx, "匯率"),
        "commodities": render_price_table(commodities, "商品"),
        "bonds": render_bond_table(bonds),
    }

    prev = load_prev_json(run_date.strftime("%Y%m%d"))
    payload["validation"] = validate(payload, prev)
    payload.pop("_fetch_warnings", None)

    dated = LOG_DIR / f"market_data_{run_date.strftime('%Y%m%d')}.json"
    text = json.dumps(payload, ensure_ascii=False, indent=2)
    dated.write_text(text, "utf-8")
    LATEST_JSON.write_text(text, "utf-8")

    v = payload["validation"]
    print(f"  primary_closing_date = {payload['primary_closing_date']}")
    print(f"  validation status    = {v['status']}")
    for w in v["warnings"]:
        print(f"    WARN  {w}")
    for e in v["errors"]:
        print(f"    ERROR {e}")
    print(f"  written: {dated}")
    print(f"  written: {LATEST_JSON}")

    return 1 if v["status"] == "error" else 0


if __name__ == "__main__":
    sys.exit(main())
