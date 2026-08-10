#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""fetch_market_calendar.py — 財經日曆（經濟數據／利率決策／財報行事曆）雲端版。

在雲端 workflow 佈局下執行（work/ 內、work/repo 連到 git 根），輸出：
    repo/data/market_calendar.json   前端「市場」分頁『財經日曆』折疊區塊吃的資料

資料來源（全部公開、免金鑰，數字不經 LLM）
    經濟數據  TradingView Economic Calendar（US/TW/CN/EU/DE/JP/GB）
              視窗＝過去 14 天（含公布值 vs 預期）＋未來 28 天（含預期值）
    美股財報  Nasdaq 財報行事曆，只留市值 ≥ $50B 大型股
    台股財報  金管會法定時程（每月 10 日月營收、5/15、8/14、11/14、3/31 季／年報）

本機另有同源的完整版（~/scripts/market_calendar_open.py → 工作資料站「財經日曆」分頁），
翻譯表與欄位定義兩邊一致；此處為理財小幫手 PWA 的雲端版，不含今日要聞（新聞分頁已有）。

抓取失敗時保留 repo/data/market_calendar.json 舊檔（不覆寫），前端顯示舊資料。
"""

import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

try:
    from zoneinfo import ZoneInfo

    TAIPEI = ZoneInfo("Asia/Taipei")
except Exception:  # 極舊 Python 後備：固定 +8
    TAIPEI = timezone(timedelta(hours=8))

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "repo" / "data"
OUTPUT_FILE = DATA_DIR / "market_calendar.json"
# 雲端 runner 每次都是全新機器，快取寫在 repo/data 才能跨次沿用（隨資料一起 commit）
CACHE_PATH = str(DATA_DIR / "market_calendar_cache.json")
US_EARN_CACHE_PATH = str(DATA_DIR / "us_earnings_cache.json")

COUNTRIES = "US,TW,CN,EU,DE,JP,GB"
PAST_DAYS = 14
FUTURE_DAYS = 28

# 利率決策：央行政策利率相關事件（另立專區，行事曆內仍照常列出）
RATE_RE = re.compile(
    r"Interest Rate Decision|Loan Prime Rate|Deposit Facility Rate|Cash Rate"
)

UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
)

REGION = {
    "US": ("美國", "US"),
    "TW": ("台灣", "TW"),
    "CN": ("中國", "CN"),
    "EU": ("歐元區", "EUR"),
    "DE": ("德國", "EUR"),
    "GB": ("英國", "EUR"),
    "JP": ("日本", "JP"),
}
# 篩選 chip 用的地區鍵：US / TW / CN / EUR(歐元區+德國+英國) / JP

# 整條剔除的雜訊（標售、房貸利率、德國各邦 CPI 等，對判讀市場無幫助）
DROP_SUBSTR = ["Auction", "Bubill", "Mortgage Rate", "JGB Purchase", "Bank Holiday"]
DROP_RE = re.compile(
    r"^(Baden|Bavaria|Brandenburg|Hesse|North Rhine|Saxony|Saarland|Thuringia|"
    r"Berlin|Bremen|Hamburg|Lower Saxony|Mecklenburg|Rhineland|Schleswig)"
)

# ---- 名稱翻譯：片語替換（先長後短、經 sentinel 兩段替換避免中文再被改） ----
SPEECH_RULES = [
    (re.compile(r"^Fed (?:Chair )?(.+?) (?:Speech|Testimony)$"), r"Fed官員談話（\1）"),
    (re.compile(r"^Fed Vice Chair (.+?) Speech$"), r"Fed副主席談話（\1）"),
    (re.compile(r"^BoE Gov (.+?) Speech$"), r"英央行總裁談話（\1）"),
    (re.compile(r"^BoJ Gov (.+?) Speech$"), r"日銀總裁談話（\1）"),
    (re.compile(r"^ECB President (.+?) Speech$"), r"歐央行總裁談話（\1）"),
    (re.compile(r"^ECB (.+?) Speech$"), r"歐央行官員談話（\1）"),
    (re.compile(r"^BoE MPC Member (.+?) Speech$"), r"英央行委員談話（\1）"),
]

PHRASES = [
    ("Core Inflation Rate", "核心CPI"),
    ("Inflation Rate", "CPI"),
    ("Core PCE Prices", "核心PCE物價"),
    ("Core PCE Price Index", "核心PCE物價"),
    ("PCE Price Index", "PCE物價"),
    ("PCE Prices", "PCE物價"),
    ("Core PPI", "核心PPI"),
    ("PPI", "PPI"),
    ("CPI s.a", "CPI指數（季調）"),
    ("GDP Growth Rate", "GDP成長率"),
    ("GDP Growth Annualized", "GDP年化成長率"),
    ("GDP Price Index", "GDP平減指數"),
    ("GDP Capital Expenditure", "GDP資本支出"),
    ("GDP External Demand", "GDP外需"),
    ("GDP Private Consumption", "GDP民間消費"),
    ("GDP 3-Month Avg", "GDP三個月平均"),
    ("Non Farm Payrolls Annual Revision", "非農就業年度修正"),
    ("Non Farm Payrolls", "非農就業人數"),
    ("Nonfarm Productivity", "非農生產力"),
    ("Unit Labour Costs", "單位勞動成本"),
    ("Unemployment Rate", "失業率"),
    ("Unemployed Persons", "失業人數"),
    ("Unemployment Change", "失業人數變化"),
    ("Initial Jobless Claims", "初領失業救濟金人數"),
    ("Continuing Jobless Claims", "續領失業救濟金人數"),
    ("Jobless Claims 4-week Average", "初領失業金四週均值"),
    ("ADP Employment Change Weekly", "ADP就業變化（週）"),
    ("ADP Employment Change", "ADP就業人數變化"),
    ("JOLTs Job Openings", "JOLTS職位空缺"),
    ("JOLTs Job Quits", "JOLTS離職人數"),
    ("Challenger Job Cuts", "Challenger企業裁員"),
    ("Average Hourly Earnings", "平均時薪"),
    ("Average Weekly Hours", "平均週工時"),
    ("Average Cash Earnings", "平均現金薪資"),
    ("Average Earnings incl. Bonus (3Mo/Yr)", "平均週薪（含獎金）"),
    ("Average Earnings excl. Bonus (3Mo/Yr)", "平均週薪（不含獎金）"),
    ("Participation Rate", "勞動參與率"),
    ("Employment Cost Index", "就業成本指數"),
    ("Employment Cost - Wages", "就業成本（工資）"),
    ("Employment Cost - Benefits", "就業成本（福利）"),
    ("Employment Change", "就業人數變化"),
    ("Claimant Count Change", "請領失業救濟人數"),
    ("Retail Sales Control Group", "零售銷售（控制組）"),
    ("Retail Sales Ex Autos", "零售銷售（排除汽車）"),
    ("Retail Sales", "零售銷售"),
    ("Retail Inventories Ex Autos", "零售庫存（排除汽車）"),
    ("BRC Retail Sales Monitor", "BRC零售銷售"),
    ("BRC Shop Price Inflation", "BRC店面物價"),
    ("Industrial Production", "工業生產"),
    ("Industrial Profits (YTD)", "工業企業利潤（年初至今）"),
    ("Manufacturing Production", "製造業生產"),
    ("Capacity Utilization", "產能利用率"),
    ("ISM Manufacturing PMI", "ISM製造業PMI"),
    ("ISM Manufacturing Employment", "ISM製造業就業"),
    ("ISM Manufacturing New Orders", "ISM製造業新訂單"),
    ("ISM Manufacturing Prices", "ISM製造業物價"),
    ("ISM Services PMI", "ISM服務業PMI"),
    ("ISM Services Employment", "ISM服務業就業"),
    ("ISM Services New Orders", "ISM服務業新訂單"),
    ("ISM Services Prices", "ISM服務業物價"),
    ("S&P Global Manufacturing PMI", "S&P製造業PMI"),
    ("S&P Global Services PMI", "S&P服務業PMI"),
    ("S&P Global Composite PMI", "S&P綜合PMI"),
    ("S&P Global Construction PMI", "S&P營建業PMI"),
    ("NBS Manufacturing PMI", "官方製造業PMI"),
    ("NBS Non Manufacturing PMI", "官方非製造業PMI"),
    ("NBS General PMI", "官方綜合PMI"),
    ("RatingDog Manufacturing PMI", "RatingDog製造業PMI（原財新）"),
    ("RatingDog Services PMI", "RatingDog服務業PMI（原財新）"),
    ("RatingDog Composite PMI", "RatingDog綜合PMI（原財新）"),
    ("Chicago PMI", "芝加哥PMI"),
    ("Chicago Fed National Activity Index", "芝加哥聯準全國活動指數"),
    ("Philadelphia Fed Manufacturing Index", "費城聯準製造業指數"),
    ("NY Empire State Manufacturing Index", "紐約帝國製造業指數"),
    ("Dallas Fed Manufacturing Index", "達拉斯聯準製造業指數"),
    ("Dallas Fed Services Index", "達拉斯聯準服務業指數"),
    ("Dallas Fed Services Revenues Index", "達拉斯聯準服務營收指數"),
    ("Richmond Fed Manufacturing Index", "里奇蒙聯準製造業指數"),
    ("Richmond Fed Services Index", "里奇蒙聯準服務業指數"),
    ("Kansas Fed Manufacturing Index", "堪薩斯聯準製造業指數"),
    ("Kansas Fed Composite Index", "堪薩斯聯準綜合指數"),
    ("Balance of Trade Yuan", "貿易收支（人民幣計）"),
    ("Balance of Trade", "貿易收支"),
    ("Goods Trade Balance Non-EU", "商品貿易收支（非歐盟）"),
    ("Goods Trade Balance", "商品貿易收支"),
    ("Export Orders", "外銷訂單"),
    ("Export Prices", "出口物價"),
    ("Import Prices", "進口物價"),
    ("Exports", "出口"),
    ("Imports", "進口"),
    ("Current Account", "經常帳"),
    ("Foreign Exchange Reserves", "外匯存底"),
    ("M2 Money Supply", "M2貨幣供給"),
    ("M3 Money Supply", "M3貨幣供給"),
    ("New Yuan Loans", "新增人民幣貸款"),
    ("Total Social Financing", "社會融資規模"),
    ("Outstanding Loan Growth", "貸款餘額成長"),
    ("Loan Prime Rate 1Y", "LPR報價利率（一年期）"),
    ("Loan Prime Rate 5Y", "LPR報價利率（五年期）"),
    ("Fixed Asset Investment (YTD)", "固定資產投資（年初至今）"),
    ("House Price Index", "房價指數"),
    ("FDI (YTD)", "外商直接投資（年初至今）"),
    ("Vehicle Sales", "汽車銷售"),
    ("Politburo Meeting", "中共政治局會議"),
    ("Fed Interest Rate Decision", "Fed利率決策"),
    ("FOMC Minutes", "FOMC會議紀要"),
    ("FOMC Economic Projections", "FOMC經濟預測"),
    ("Fed Press Conference", "Fed記者會"),
    ("Jackson Hole Symposium", "Jackson Hole央行年會"),
    ("Fed Beige Book", "Fed褐皮書"),
    ("Monthly Budget Statement", "月度財政收支"),
    ("Net Long-term TIC Flows", "長期資本淨流入（TIC）"),
    ("Overall Net Capital Flows", "整體資本淨流量"),
    ("BoJ Interest Rate Decision", "日銀利率決策"),
    ("BoJ Monetary Policy Meeting Minutes", "日銀會議紀要"),
    ("BoJ Quarterly Outlook Report", "日銀季度展望報告"),
    ("BoJ Summary of Opinions", "日銀意見摘要"),
    ("BoE Interest Rate Decision", "英央行利率決策"),
    ("BoE Monetary Policy Report", "英央行貨幣政策報告"),
    ("BoE MPC Vote Cut", "英央行投票（降息票數）"),
    ("BoE MPC Vote Hike", "英央行投票（升息票數）"),
    ("BoE MPC Vote Unchanged", "英央行投票（不變票數）"),
    ("BoE Consumer Credit", "英央行消費信貸"),
    ("MPC Meeting Minutes", "英央行會議紀要"),
    ("ECB Interest Rate Decision", "歐央行利率決策"),
    ("ECB Deposit Facility Rate", "歐央行存款利率"),
    ("ECB Marginal Lending Rate", "歐央行邊際放款利率"),
    ("ECB Monetary Policy Meeting Accounts", "歐央行會議紀要"),
    ("ECB Consumer Inflation Expectations", "歐央行消費者通膨預期"),
    ("Negotiated Wage Growth", "協商工資成長"),
    ("Michigan Consumer Sentiment", "密大消費者信心"),
    ("Michigan Inflation Expectations", "密大通膨預期"),
    ("Michigan 5 Year Inflation Expectations", "密大五年通膨預期"),
    ("Michigan Current Conditions", "密大現況指數"),
    ("Michigan Consumer Expectations", "密大消費者預期"),
    ("CB Consumer Confidence", "諮商會消費者信心"),
    ("CB Leading Index", "諮商會領先指標"),
    ("GfK Consumer Confidence", "GfK消費者信心"),
    ("Consumer Confidence", "消費者信心"),
    ("Consumer Inflation Expectations", "消費者通膨預期"),
    ("Consumer Credit Change", "消費信貸變化"),
    ("Cleveland Fed Inflation Expectations", "克里夫蘭聯準通膨預期"),
    ("Durable Goods Orders Ex Transp", "耐久財訂單（排除運輸）"),
    ("Durable Goods Orders ex Defense", "耐久財訂單（排除國防）"),
    ("Durable Goods Orders", "耐久財訂單"),
    ("Factory Orders ex Transportation", "工廠訂單（排除運輸）"),
    ("Factory Orders", "工廠訂單"),
    ("Machinery Orders", "機械訂單"),
    ("Machine Tool Orders", "工具機訂單"),
    ("Capital Spending", "資本支出"),
    ("Household Spending", "家庭支出"),
    ("Personal Income", "個人所得"),
    ("Personal Spending", "個人支出"),
    ("Housing Starts", "新屋開工"),
    ("Building Permits", "營建許可"),
    ("New Home Sales", "新屋銷售"),
    ("Existing Home Sales", "成屋銷售"),
    ("Pending Home Sales", "成屋待完成銷售"),
    ("NAHB Housing Market Index", "NAHB房市指數"),
    ("S&P/Case-Shiller Home Price", "Case-Shiller房價"),
    ("Nationwide Housing Prices", "Nationwide房價"),
    ("Lloyds House Price Index", "Lloyds房價指數"),
    ("RICS House Price Balance", "RICS房價指標"),
    ("Mortgage Approvals", "房貸核准件數"),
    ("Mortgage Lending", "房貸放款"),
    ("Construction Spending", "營建支出"),
    ("Construction Output", "營建產出"),
    ("Construction Orders", "營建訂單"),
    ("Ifo Business Climate", "Ifo企業景氣指數"),
    ("Ifo Current Conditions", "Ifo現況指數"),
    ("Ifo Expectations", "Ifo預期指數"),
    ("ZEW Economic Sentiment Index", "ZEW經濟景氣指數"),
    ("ZEW Current Conditions", "ZEW現況指數"),
    ("Sentix Investor Confidence", "Sentix投資人信心"),
    ("Economic Sentiment", "經濟景氣指數"),
    ("Bundesbank Monthly Report", "德央行月報"),
    ("Wholesale Prices", "批發物價"),
    ("Wholesale Inventories", "批發庫存"),
    ("Business Inventories", "企業庫存"),
    ("Business Investment", "企業投資"),
    ("Corporate Profits", "企業獲利"),
    ("EIA Crude Oil Stocks Change", "EIA原油庫存變化"),
    ("EIA Cushing Crude Oil Stocks Change", "EIA庫欣原油庫存"),
    ("EIA Crude Oil Imports Change", "EIA原油進口變化"),
    ("EIA Gasoline Stocks Change", "EIA汽油庫存變化"),
    ("EIA Gasoline Production Change", "EIA汽油產量變化"),
    ("EIA Distillate Stocks Change", "EIA餾分油庫存"),
    ("EIA Distillate Fuel Production Change", "EIA餾分油產量"),
    ("EIA Heating Oil Stocks Change", "EIA熱燃油庫存"),
    ("EIA Natural Gas Stocks Change", "EIA天然氣庫存"),
    ("EIA Refinery Crude Runs Change", "EIA煉油投入變化"),
    ("API Crude Oil Stock Change", "API原油庫存變化"),
    ("Baker Hughes Oil Rig Count", "貝克休斯石油鑽井數"),
    ("Baker Hughes Total Rigs Count", "貝克休斯鑽井總數"),
    ("CBI Distributive Trades", "CBI零售銷售差值"),
    ("CBI Industrial Trends Orders", "CBI工業訂單差值"),
    ("Eco Watchers Survey Current", "景氣觀察調查（現況）"),
    ("Eco Watchers Survey Outlook", "景氣觀察調查（展望）"),
    ("Economy Watchers Sentiment", "景氣觀察者信心"),
    ("Bank Lending", "銀行放款"),
    ("Coincident Index", "同時指標"),
    ("Leading Economic Index", "領先指標"),
    ("Leading Index", "領先指標"),
    ("Tertiary Industry Index", "第三產業指數"),
    ("Reuters Tankan Index", "路透短觀指數"),
    ("Tankan Large Manufacturers Index", "短觀大型製造業指數"),
    ("Tankan Large Non-Manufacturers Index", "短觀大型非製造業指數"),
    ("Car Production", "汽車生產"),
    ("Car Registrations", "汽車掛牌數"),
    ("New Car Sales", "新車銷售"),
    ("DMP 1Y CPI Expectations", "DMP一年CPI預期"),
    ("DMP 3M Output Price Expectations", "DMP三個月售價預期"),
    ("15-Year Mortgage Rate", "15年房貸利率"),
    ("30-Year Mortgage Rate", "30年房貸利率"),
    ("Redbook", "紅皮書零售銷售"),
    ("IBD/TIPP Economic Optimism", "IBD/TIPP經濟樂觀指數"),
    ("NFIB Business Optimism Index", "NFIB小企業樂觀指數"),
    ("Used Car Prices", "中古車價格"),
    ("Total Household Spending", "家庭總支出"),
    ("Overtime Pay", "加班費"),
    ("GDP", "GDP"),
    ("CPI", "CPI指數"),
]

SUFFIXES = [
    (" YoY", "年增率"),
    (" MoM", "月增率"),
    (" QoQ", "季增率"),
    (" Flash", "・初值"),
    (" Prel", "・初值"),
    (" Final", "・終值"),
    (" Adv", "・初估"),
    (" 2nd Est", "・修正值"),
    (" 3rd Est", "・終值"),
    (" s.a", "（季調）"),
    (" n.s.a", "（未季調）"),
    (" (YTD)", "（年初至今）"),
]

_ALL_PAIRS = sorted(PHRASES + SUFFIXES, key=lambda p: -len(p[0]))


def translate(title):
    """英文數據名 → 繁中（片語替換，翻不到的保留原文）。"""
    for rx, rep in SPEECH_RULES:
        m = rx.match(title)
        if m:
            return rx.sub(rep, title)
    # sentinel 兩段替換：避免先換出的中文（含 CPI 等字母）被後面的短片語再改一次
    out = title
    tokens = {}
    for i, (en, zh) in enumerate(_ALL_PAIRS):
        if en in out:
            key = "\x00%d\x00" % i
            out = out.replace(en, key)
            tokens[key] = zh
    for key, zh in tokens.items():
        out = out.replace(key, zh)
    return out.strip()


MONTH_ZH = {
    "Jan": "1月",
    "Feb": "2月",
    "Mar": "3月",
    "Apr": "4月",
    "May": "5月",
    "Jun": "6月",
    "Jul": "7月",
    "Aug": "8月",
    "Sep": "9月",
    "Oct": "10月",
    "Nov": "11月",
    "Dec": "12月",
    "January": "1月",
    "February": "2月",
    "March": "3月",
    "April": "4月",
    "June": "6月",
    "July": "7月",
    "August": "8月",
    "September": "9月",
    "October": "10月",
    "November": "11月",
    "December": "12月",
}


def period_zh(p):
    if not p:
        return ""
    p = p.strip()
    return MONTH_ZH.get(p, p)


def fmt_num(v):
    if v is None:
        return None
    try:
        f = float(v)
    except (TypeError, ValueError):
        return str(v)
    if f == int(f) and abs(f) < 1e15:
        return str(int(f))
    return ("%.2f" % f).rstrip("0").rstrip(".")


def fmt_val(e, key):
    """把 actual/forecast/previous 加上單位（%、$B、CNY B…）。"""
    v = e.get(key)
    s = fmt_num(v)
    if s is None:
        return "—"
    unit = e.get("unit") or ""
    scale = e.get("scale") or ""
    if unit == "%":
        return s + "%"
    if unit == "$":
        return "$" + s + scale
    if unit in ("CNY", "JPY", "EUR", "GBP", "TWD"):
        return s + scale + " " + unit
    return s + scale


def fetch_events(now_utc):
    frm = (now_utc - timedelta(days=PAST_DAYS)).strftime("%Y-%m-%dT00:00:00.000Z")
    to = (now_utc + timedelta(days=FUTURE_DAYS + 1)).strftime("%Y-%m-%dT00:00:00.000Z")
    url = (
        "https://economic-calendar.tradingview.com/events?from=%s&to=%s&countries=%s"
        % (frm, to, COUNTRIES)
    )
    req = urllib.request.Request(
        url, headers={"User-Agent": UA, "Origin": "https://www.tradingview.com"}
    )
    last_err = None
    for _ in range(2):
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                data = json.loads(r.read().decode("utf-8"))
            evs = data.get("result") or []
            if evs:
                os.makedirs(os.path.dirname(CACHE_PATH), exist_ok=True)
                tmp = CACHE_PATH + ".tmp"
                with open(tmp, "w", encoding="utf-8") as f:
                    json.dump({"fetched": now_utc.isoformat(), "events": evs}, f)
                os.replace(tmp, CACHE_PATH)
                return evs, None
        except Exception as e:  # noqa: BLE001
            last_err = e
    # 後備：沿用上次成功抓到的快取
    try:
        with open(CACHE_PATH, encoding="utf-8") as f:
            cached = json.load(f)
        return cached.get("events") or [], "cache(%s)" % (last_err,)
    except Exception:
        return [], "fail(%s)" % (last_err,)


def http_json(url, headers=None, timeout=30):
    req = urllib.request.Request(url, headers={"User-Agent": UA, **(headers or {})})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8"))


def is_junk(title):
    if any(s in title for s in DROP_SUBSTR):
        return True
    return bool(DROP_RE.match(title))


def is_key_event(e):
    """「重點數據」檢視：中重要性以上；台灣全保留（TradingView 全標低重要）。"""
    if e["country"] == "TW":
        return True
    return (e.get("importance") or -1) >= 0


WEEKDAY_ZH = ["週一", "週二", "週三", "週四", "週五", "週六", "週日"]


def event_to_json(e, today):
    """單一事件 → 月曆前端用的精簡 JSON 物件。"""
    imp = e.get("importance") or -1
    cn, reg = REGION[e["country"]]
    per = period_zh(e.get("period"))
    cmp_txt = ""
    if e.get("actual") is not None:
        a, f = e.get("actualRaw"), e.get("forecastRaw")
        if a is not None and f is not None:
            try:
                a, f = float(a), float(f)
                cmp_txt = (
                    "▲ 高於預期"
                    if a > f
                    else ("▼ 低於預期" if a < f else "＝ 符合預期")
                )
            except (TypeError, ValueError):
                pass
    tm = e["dt"].strftime("%H:%M")
    return {
        "d": e["dt"].date().isoformat(),
        "tm": tm,
        "srt": tm,
        "t": "eco",
        "r": reg,
        "cn": cn,
        "zh": translate(e["title"]),
        "en": e["title"] + ("・" + per if per else ""),
        "imp": imp,
        "k": 1 if is_key_event(e) else 0,
        "act": fmt_val(e, "actual"),
        "cmp": cmp_txt,
        "fc": fmt_val(e, "forecast"),
        "pv": fmt_val(e, "previous"),
    }


US_EARN_CACHE = US_EARN_CACHE_PATH
US_EARN_PAST = 7  # 已公布財報回看天數（結果由今日要聞新聞補足，行事曆只留近一週）
US_MCAP_MIN = 50e9  # 只收市值 ≥ $50B 的大型股
NQ_TIME_ZH = {"time-pre-market": "盤前", "time-after-hours": "盤後"}


def _parse_mcap(s):
    try:
        return float(re.sub(r"[^0-9.]", "", s or ""))
    except ValueError:
        return 0.0


def fetch_us_earnings(today):
    """Nasdaq 財報行事曆：逐日抓視窗內平日，留大型股。逐日失敗沿用快取該日。"""
    try:
        with open(US_EARN_CACHE, encoding="utf-8") as f:
            cached_days = json.load(f).get("days", {})
    except Exception:
        cached_days = {}
    days = {}
    # 雲端 runner 的 IP 常被 Nasdaq 擋（403）。連續失敗 3 天就整段放棄，
    # 免得 30 幾次 timeout 把 workflow 拖成十幾分鐘；經濟數據不受影響照常輸出。
    misses = 0
    for off in range(-US_EARN_PAST, FUTURE_DAYS + 1):
        d = today + timedelta(days=off)
        if d.weekday() >= 5:
            continue
        ds = d.isoformat()
        if misses >= 3:
            if ds in cached_days:
                days[ds] = cached_days[ds]
            continue
        try:
            data = http_json(
                "https://api.nasdaq.com/api/calendar/earnings?date=" + ds,
                headers={"Accept": "application/json"},
                timeout=15,
            )
            rows = (data.get("data") or {}).get("rows") or []
            days[ds] = [
                {
                    "sym": r.get("symbol") or "",
                    "name": r.get("name") or "",
                    "time": NQ_TIME_ZH.get(r.get("time"), ""),
                    "eps": r.get("epsForecast") or "",
                    "lastEps": r.get("lastYearEPS") or "",
                    "q": r.get("fiscalQuarterEnding") or "",
                    "mcap": _parse_mcap(r.get("marketCap")),
                }
                for r in rows
                if _parse_mcap(r.get("marketCap")) >= US_MCAP_MIN
            ]
            misses = 0
            time.sleep(0.3)
        except Exception as e:  # noqa: BLE001
            misses += 1
            if ds in cached_days:
                days[ds] = cached_days[ds]
                print("[market-calendar] 美股財報 %s 抓取失敗，用快取：%s" % (ds, e))
            else:
                print("[market-calendar] 美股財報 %s 抓取失敗且無快取：%s" % (ds, e))
    if days:
        os.makedirs(os.path.dirname(US_EARN_CACHE), exist_ok=True)
        tmp = US_EARN_CACHE + ".tmp"
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump({"days": days}, f)
        os.replace(tmp, US_EARN_CACHE)
    out = []
    for ds, rows in days.items():
        for r in rows:
            # 盤前≈台北 20:00 前、盤後≈台北清晨（次日）；顯示用「盤前/盤後」不換算
            srt = {"盤前": "17:00", "盤後": "21:30"}.get(r["time"], "20:00")
            big = r["mcap"] >= 200e9
            out.append(
                {
                    "d": ds,
                    "tm": r["time"] or "美股時段",
                    "srt": srt,
                    "t": "fin",
                    "r": "US",
                    "cn": "美國",
                    "zh": "%s 財報" % r["sym"],
                    "en": (r["name"] or r["sym"]) + ("・" + r["q"] if r["q"] else ""),
                    "imp": 1 if big else 0,
                    "k": 1,
                    "act": "—",
                    "cmp": "",
                    "fc": ("EPS預估 " + r["eps"]) if r["eps"] else "—",
                    "pv": ("去年同期 " + r["lastEps"]) if r["lastEps"] else "—",
                }
            )
    return out


def tw_fin_markers(today):
    """台灣財報固定節點（法規時程，非逐家公司）：
    每月 10 日＝上市櫃月營收公布截止；5/15、8/14、11/14、3/31＝季/年報申報截止。"""
    out = []
    qmap = {(3, 31): "年報", (5, 15): "Q1財報", (8, 14): "Q2財報", (11, 14): "Q3財報"}
    d0 = today - timedelta(days=PAST_DAYS)
    d1 = today + timedelta(days=FUTURE_DAYS)
    d = d0
    while d <= d1:
        zh = en = None
        if d.day == 10:
            prev_m = d.month - 1 or 12
            zh = "上市櫃%d月營收公布截止" % prev_m
            en = "TWSE/TPEx monthly revenue deadline"
        elif (d.month, d.day) in qmap:
            zh = "上市櫃%s申報截止" % qmap[(d.month, d.day)]
            en = "TWSE/TPEx financial report deadline"
        if zh:
            out.append(
                {
                    "d": d.isoformat(),
                    "tm": "全天",
                    "srt": "00:01",
                    "t": "fin",
                    "r": "TW",
                    "cn": "台灣",
                    "zh": zh,
                    "en": en,
                    "imp": 1 if "財報" in zh or "年報" in zh else 0,
                    "k": 1,
                    "act": "—",
                    "cmp": "",
                    "fc": "—",
                    "pv": "—",
                }
            )
        d += timedelta(days=1)
    return out


def rate_rows(rate_evs, today):
    """利率決策專區：視窗內所有央行政策利率事件，依日期排序（結構化，不含 HTML）。"""
    rows = []
    for e in sorted(rate_evs, key=lambda x: x["dt"]):
        cn, reg = REGION[e["country"]]
        d = e["dt"].date()
        rows.append(
            {
                "d": d.isoformat(),
                "tm": e["dt"].strftime("%H:%M"),
                "wd": WEEKDAY_ZH[d.weekday()],
                "r": reg,
                "cn": cn,
                "zh": translate(e["title"]),
                "en": e["title"]
                + (("・" + period_zh(e.get("period"))) if e.get("period") else ""),
                "pv": fmt_val(e, "previous"),
                "fc": fmt_val(e, "forecast"),
                "act": fmt_val(e, "actual") if e.get("actual") is not None else "",
                "past": d < today,
            }
        )
    return rows


def main():
    now_utc = datetime.now(timezone.utc)
    now_tp = now_utc.astimezone(TAIPEI)
    today = now_tp.date()

    events, warn = fetch_events(now_utc)
    if not events:
        print("[market-calendar] 抓取失敗且無快取，保留現有 JSON：%s" % warn)
        return 1

    ev_json = []
    rate_evs = []
    for e in events:
        title = e.get("title") or ""
        if not title or is_junk(title) or e.get("country") not in REGION:
            continue
        try:
            dt = datetime.fromisoformat(e["date"].replace("Z", "+00:00")).astimezone(
                TAIPEI
            )
        except (KeyError, ValueError):
            continue
        e["dt"] = dt
        d = dt.date()
        if RATE_RE.search(title):
            rate_evs.append(e)
        if e.get("actual") is not None:
            if (today - d).days > PAST_DAYS:
                continue
        else:
            # 未公布：今天起算的未來事件；更早的無值事件（已結束的談話等）略過
            if d < today or (d - today).days > FUTURE_DAYS:
                continue
        ev_json.append(event_to_json(e, today))
    n_eco = len(ev_json)

    # 財報：美股大型股（Nasdaq）＋台灣法規時程標記
    us_fin = fetch_us_earnings(today)
    tw_fin = tw_fin_markers(today)
    ev_json.extend(us_fin)
    ev_json.extend(tw_fin)
    ev_json.sort(key=lambda x: (x["d"], x["srt"]))

    out = {
        "built_at": now_tp.strftime("%Y-%m-%dT%H:%M:%S+08:00"),
        "today": today.isoformat(),
        "min": (today - timedelta(days=PAST_DAYS)).isoformat(),
        "max": (today + timedelta(days=FUTURE_DAYS)).isoformat(),
        "stale": bool(warn),  # 本次 TradingView 抓取失敗、內容來自快取
        "counts": {"eco": n_eco, "us_fin": len(us_fin), "tw_fin": len(tw_fin)},
        "events": ev_json,
        "rates": rate_rows(rate_evs, today),
    }

    DATA_DIR.mkdir(parents=True, exist_ok=True)
    tmp = str(OUTPUT_FILE) + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    os.replace(tmp, str(OUTPUT_FILE))
    print(
        "[market-calendar] OK 經濟數據 %d 筆／美股財報 %d 筆／台股財報節點 %d 筆／"
        "利率決策 %d 場 → %s %s"
        % (n_eco, len(us_fin), len(tw_fin), len(out["rates"]), OUTPUT_FILE, warn or "")
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
