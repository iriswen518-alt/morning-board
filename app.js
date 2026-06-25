// Morning Board app
const $ = (id) => document.getElementById(id);

const INDEX_NAMES = {
  "TAIEX": "加權指數",
  "TAIEX 加權指數": "加權指數",
  "S&P 500": "標普 500",
  "Nasdaq": "那斯達克",
  "Nasdaq Composite": "那斯達克",
  "Dow Jones": "道瓊",
  "PHLX Semiconductor": "費半",
  "Nikkei 225": "日經 225",
  "Hang Seng": "恆生指數",
  "Hang Seng 恆生": "恆生指數",
  "恆生": "恆生指數",
  "KOSPI": "韓國綜合",
  "Shanghai Composite": "上證綜合",
  "Shanghai 上證": "上證綜合",
  "上證": "上證綜合",
  "Shenzhen": "深證成指",
  "滬深300": "滬深 300",
  "CSI 300": "滬深 300",
  "CSI 300 滬深300": "滬深 300",
  "Nifty 50": "印度 50",
  "ASX 200": "澳洲 200",
  "S&P/ASX 200": "澳洲 200",
  "Euro Stoxx 50": "歐洲 50",
  "DAX": "德國 30",
  "FTSE 100": "富時 100",
  "CAC 40": "法國 40"
};

function indexLabel(name) {
  return INDEX_NAMES[name] || name;
}

const INDEX_BOP_CODES = {
  "TAIEX": "EB09999",
  "TAIEX 加權指數": "EB09999",
  "OTC 櫃買加權": "EB18888",
  "S&P 500": "SPY.US",
  "Nasdaq": "AI000020",
  "Nasdaq Composite": "AI000020",
  "Dow Jones": "AI000010",
  "PHLX Semiconductor": "AI000140",
  "Nikkei 225": "AI000030",
  "KOSPI": "AI000070",
  "Hang Seng": "AI000040",
  "Hang Seng 恆生": "AI000040",
  "恆生": "AI000040",
  "Shanghai Composite": "AI000220",
  "Shanghai 上證": "AI000220",
  "上證": "AI000220",
  "滬深300": "AI000545",
  "CSI 300": "AI000545",
  "CSI 300 滬深300": "AI000545",
  "Euro Stoxx 50": "AI001048",
  "ASX 200": "AI000320",
  "S&P/ASX 200": "AI000320",
  "Nifty 50": "INDA.US",
  "DAX": "EWG.US",
  "FTSE 100": "AJ011660",
  "CAC 40": "AI000170"
};

function indexUrl(name) {
  const code = INDEX_BOP_CODES[name];
  return code
    ? `https://bopfund.moneydj.com/w/wj/iQuoteChart.djhtm?a=${encodeURIComponent(code)}`
    : null;
}

function indexLink(name) {
  // 名稱連結優先用 MoneyDJ 走勢圖；無對應代碼者（如台指期）退回即時行情來源，確保仍可點擊
  const url = indexUrl(name) || indexQuoteUrl(name);
  const label = escapeHtml(indexLabel(name));
  return url
    ? `<a href="${url}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">${label}</a>`
    : label;
}

// Yahoo Finance 即時行情頁，因 MoneyDJ iQuoteChart 偶有延遲；提供使用者第二來源驗證
const INDEX_YAHOO_SYMBOLS = {
  "TAIEX": "^TWII",
  "TAIEX 加權指數": "^TWII",
  "OTC 櫃買加權": "^TWOII",
  "S&P 500": "^GSPC",
  "Nasdaq": "^IXIC",
  "Nasdaq Composite": "^IXIC",
  "Dow Jones": "^DJI",
  "PHLX Semiconductor": "^SOX",
  "Nikkei 225": "^N225",
  "Hang Seng": "^HSI",
  "Hang Seng 恆生": "^HSI",
  "恆生": "^HSI",
  "KOSPI": "^KS11",
  "Shanghai Composite": "000001.SS",
  "Shanghai 上證": "000001.SS",
  "上證": "000001.SS",
  "Shenzhen": "399001.SZ",
  "滬深300": "000300.SS",
  "CSI 300": "000300.SS",
  "CSI 300 滬深300": "000300.SS",
  "Nifty 50": "^NSEI",
  "ASX 200": "^AXJO",
  "S&P/ASX 200": "^AXJO",
  "Euro Stoxx 50": "^STOXX50E",
  "DAX": "^GDAXI",
  "FTSE 100": "^FTSE",
  "CAC 40": "^FCHI",
  "VIX": "^VIX"
};

function quoteSuffix(url) {
  if (!url) return "";
  return `<br><a href="${url}" target="_blank" rel="noopener" class="quote-link" title="開啟即時行情頁">即時行情</a>`;
}

// 部分指數 Yahoo 無對應商品，改用其他即時來源（完整 URL）
const INDEX_QUOTE_URL_OVERRIDES = {
  "台指期(近月)": "https://www.tradingview.com/symbols/TAIFEX-TXF1!/",  // TAIFEX TX 近月，Yahoo 無此商品
};

// 即時行情頁的原始 URL（override 優先，否則用 Yahoo symbol）；無對應者回 null
function indexQuoteUrl(name) {
  const override = INDEX_QUOTE_URL_OVERRIDES[name];
  if (override) return override;
  const sym = INDEX_YAHOO_SYMBOLS[name];
  return sym ? `https://finance.yahoo.com/quote/${encodeURIComponent(sym)}/` : null;
}

function indexQuoteLink(name) {
  return quoteSuffix(indexQuoteUrl(name));
}

function fmtInt(n) {
  if (n === null || n === undefined) return "—";
  return Math.round(n).toLocaleString("en-US");
}

const BOND_BOP_CODES = {
  "US 10Y": "GBUS120",
  "US 2Y": "GBUS024",
  "Germany 10Y": "GBDM120",
  "Japan 10Y": "GBJP120",
  "UK 10Y": "GBUK120"
};
const BOND_NAMES = {
  "US 10Y": "美國 10年",
  "US 2Y": "美國 2年",
  "Germany 10Y": "德國 10年",
  "Japan 10Y": "日本 10年",
  "UK 10Y": "英國 10年"
};
function bondLink(name) {
  const code = BOND_BOP_CODES[name];
  const label = escapeHtml(BOND_NAMES[name] || name);
  return code
    ? `<a href="https://bopfund.moneydj.com/w/wj/iQuoteChart.djhtm?a=${encodeURIComponent(code)}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">${label}</a>`
    : label;
}

// CNBC 各國公債即時殖利率頁；Yahoo 對非美 10Y 覆蓋差，CNBC 含 US/DE/JP/UK 完整
const BOND_QUOTE_URLS = {
  "US 10Y": "https://www.cnbc.com/quotes/US10Y",
  "US 10-Year": "https://www.cnbc.com/quotes/US10Y",
  "US 2Y": "https://www.cnbc.com/quotes/US2Y",
  "US 2-Year": "https://www.cnbc.com/quotes/US2Y",
  "Germany 10Y": "https://www.cnbc.com/quotes/DE10Y-DE",
  "Germany 10-Year": "https://www.cnbc.com/quotes/DE10Y-DE",
  "Japan 10Y": "https://www.cnbc.com/quotes/JP10Y-JP",
  "Japan 10-Year": "https://www.cnbc.com/quotes/JP10Y-JP",
  "UK 10Y": "https://www.cnbc.com/quotes/GB10Y-GB",
  "UK 10-Year": "https://www.cnbc.com/quotes/GB10Y-GB"
};

function bondQuoteLink(name) {
  return quoteSuffix(BOND_QUOTE_URLS[name]);
}

const FX_BOP_CODES = {
  "DXY": "EI0001",
  "EUR/USD": "AX000090",
  "USD/JPY": "AX000030",
  "GBP/USD": "AX000040",
  "USD/CNY": "AX000250",
  "USD/TWD": "AX000010"
};
const FX_NAMES = {
  "DXY": "美元指數",
  "EUR/USD": "歐元/美元",
  "USD/JPY": "美元/日圓",
  "GBP/USD": "英鎊/美元",
  "USD/CNY": "美元/人民幣",
  "USD/TWD": "美元/台幣"
};
function fxLink(name) {
  const code = FX_BOP_CODES[name];
  const label = escapeHtml(FX_NAMES[name] || name);
  return code
    ? `<a href="https://bopfund.moneydj.com/w/wj/iQuoteChart.djhtm?a=${encodeURIComponent(code)}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">${label}</a>`
    : label;
}

const FX_YAHOO_SYMBOLS = {
  "DXY": "DX-Y.NYB",
  "DXY 美元指數": "DX-Y.NYB",
  "EUR/USD": "EURUSD=X",
  "EUR/USD 歐元": "EURUSD=X",
  "USD/JPY": "JPY=X",
  "USD/JPY 日圓": "JPY=X",
  "GBP/USD": "GBPUSD=X",
  "GBP/USD 英鎊": "GBPUSD=X",
  "USD/CNY": "CNY=X",
  "USD/CNY 人民幣": "CNY=X",
  "USD/TWD": "TWD=X",
  "USD/TWD 新台幣": "TWD=X",
  "JPY/TWD 日圓兌台幣": "JPYTWD=X"
};

function fxQuoteLink(name) {
  const sym = FX_YAHOO_SYMBOLS[name];
  if (!sym) return "";
  return quoteSuffix(`https://finance.yahoo.com/quote/${encodeURIComponent(sym)}/`);
}

function fmtBps(n) {
  if (n === null || n === undefined) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${Math.round(n)}`;
}

function bpsClass(n) {
  if (n === null || n === undefined) return "";
  // For bond yields, rising = up; user asked for red-up/green-down convention
  return n > 0 ? "up" : (n < 0 ? "down" : "");
}

async function load(name) {
  const r = await fetch(`data/${name}.json?t=${Date.now()}`);
  if (!r.ok) throw new Error(`${name}: ${r.status}`);
  return r.json();
}

function fmtPct(n) {
  if (n === null || n === undefined) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

function pctClass(n) {
  if (n === null || n === undefined) return "";
  return n > 0 ? "up" : (n < 0 ? "down" : "");
}

// 期貨每月換倉：近月合約逐月更換，單一合約的 MTD/YTD 會混入換倉缺口而失真，故刻意不計算。
// MTD/YTD 為 null 且為台指期 → 顯示「—*」並附 tooltip 說明，避免被誤判為「抓不到資料」。
const ROLLOVER_FUT_NOTE = "台指期近月每月換倉，單一合約的月初/年初漲跌會混入換倉缺口而失真，故不計算。要看台股本月/今年漲跌請參考現貨加權指數 TAIEX。";
function isRolloverFut(row) {
  return !!row && typeof row.name === "string" && row.name.startsWith("台指期");
}
// 指數用：null 一般顯示「—」；台指期的 MTD/YTD null 則加說明 tooltip
function fmtPctIdx(n, row) {
  if ((n === null || n === undefined) && isRolloverFut(row)) {
    return `<span title="${ROLLOVER_FUT_NOTE}" style="color:#94a3b8;cursor:help">—*</span>`;
  }
  return fmtPct(n);
}

// 給「已格式化字串」用的正負染色：開頭帶 +（含全形＋）→ 紅（up）、
// 開頭帶 -／−（Unicode 減號）→ 綠（down）、無正負號（如區間 15–35%）→ 中性不染。
function signClassFromStr(v) {
  const s = String(v == null ? "" : v).trim();
  if (/^[+＋]/.test(s)) return "up";
  if (/^[-−]/.test(s)) return "down";
  return "";
}

// 把績效數字包成連到該檔績效來源頁的連結，供使用者點開驗證數值。
// color:inherit 保留紅漲綠跌染色；無 url 或無資料（—）時回傳純文字。
function perfLink(text, url) {
  if (!url || text === "—" || text === "") return text;
  return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" class="perf-link" style="color:inherit;text-decoration:underline">${text}</a>`;
}

function fmtNum(n) {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

function shortDate(iso) {
  if (!iso) return "";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[2]}-${m[3]}` : iso;
}

let DATA = {};
let CURRENT_TAB = "market";
let SEARCH_INDEX = [];
let PENDING_HIGHLIGHT = null;
let PENDING_SUBTAB = null;
let ALLOC_SUBTAB = "targets";   // 資產配置 內的次分頁：targets（主題市場）| portfolio（投組分析）

// init 時 fetch 失敗（伺服器重啟瞬間／網路 blip）的 data 名稱會被記下，
// 使用者切到對應 tab 時背景重試一次再重畫，避免長期卡在 fallback 空狀態。
const FAILED_LOADS = new Set();
const LOAD_NAME_TO_DATA_KEY = {
  meta: "meta", market: "market", news: "news", tax: "tax",
  funds: "funds", stocks: "stocks", popular_stocks: "popular",
  stock_brief: "stock_brief", insurances: "insurance",
  overseas_bonds: "obonds", overseas_bonds_all: "obonds_all", targets: "targets",
  allocation: "allocation", dca: "dca", wealth_transfer: "wealth",
  beatetf: "beatetf", presets: "presets", fund_compare: "fund_compare",
  tw_stocks: "tw_stocks", rankings: "rankings",
  premarket: "premarket",
};
const TAB_LOAD_DEPS = {
  market: ["market", "stocks", "rankings", "premarket"],
  news: ["news"],
  funds: ["funds", "dca", "beatetf", "fund_compare", "popular_funds"],
  obonds: ["overseas_bonds", "overseas_bonds_all"],
  bondmkt: ["market"],
  usstocks: ["stocks", "popular_stocks", "stock_brief"],
  insurance: ["insurances"],
  targets: ["targets"],
  portfolio: ["presets", "allocation", "targets"],
  alloc: ["targets", "presets", "allocation"],
  wealth: ["wealth_transfer", "tax"],
  twstock: ["tw_stocks"],
};
async function retryFailedForTab(tabName) {
  const deps = TAB_LOAD_DEPS[tabName] || [];
  const toRetry = deps.filter(n => FAILED_LOADS.has(n));
  if (!toRetry.length) return false;
  const results = await Promise.all(toRetry.map(async name => {
    try {
      const data = await load(name);
      DATA[LOAD_NAME_TO_DATA_KEY[name]] = data;
      FAILED_LOADS.delete(name);
      return true;
    } catch (_) { return false; }
  }));
  return results.some(Boolean);
}

function flashFindInContent(needle) {
  if (!needle) return false;
  const root = $("content");
  if (!root) return false;
  const lower = needle.toLowerCase().trim();
  if (!lower) return false;
  // 嘗試多種比對：完整字串、去空白、token（長到短）
  const tokens = lower.split(/\s+/).filter(t => t.length >= 2).sort((a, b) => b.length - a.length);
  const needles = [lower, lower.replace(/\s+/g, ""), ...tokens];
  const all = root.querySelectorAll("h1, h2, h3, h4, p, td, li, span, div, button, a");
  for (const n of needles) {
    if (!n) continue;
    for (const el of all) {
      if (el.children.length > 3) continue;
      const text = (el.textContent || "").toLowerCase();
      const textNoSpace = text.replace(/\s+/g, "");
      if (text.includes(n) || textNoSpace.includes(n)) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("flash-hit");
        setTimeout(() => el.classList.remove("flash-hit"), 2200);
        return true;
      }
    }
  }
  return false;
}

function buildSearchIndex() {
  const idx = [];
  // 主題市場 — 主題本身
  for (const t of (DATA.targets?.targets || [])) {
    const txt = [t.market_status, t.opportunity, t.pitch, t.view, t.reason, t.action, t.add_trigger, t.trim_trigger]
      .map(v => Array.isArray(v) ? v.join(" ") : (v || "")).join(" ");
    idx.push({ tab: "targets", subtab: t.key, tabLabel: "主題市場", title: t.name || t.key, text: txt });
  }
  // 主題相關基金
  for (const f of (DATA.targets?.theme_funds || [])) {
    idx.push({ tab: "targets", subtab: f.theme, tabLabel: `主題市場 · ${f.theme || ""}`, title: f.bop_name_zh || f.name_zh || "", text: f.tagline || "" });
  }
  // 財富傳承（含 fund_tax 等所有法規條目；過濾凱基）
  for (const t of (DATA.wealth?.topics || [])) {
    for (const law of t.laws || []) {
      if ((law.title && law.title.includes("凱基")) || (law.source && law.source.includes("凱基"))) continue;
      idx.push({ tab: "wealth", tabLabel: `財富傳承 · ${t.name}`, title: `${law.code || ""} ${law.title || ""}`.trim(), text: law.content || "" });
    }
  }
  // 精選基金 · 單筆投資
  for (const f of (DATA.funds?.funds || [])) {
    idx.push({ tab: "funds", subtab: "lump", tabLabel: "精選基金 · 單筆投資", title: f.name_zh || "", text: f.tagline || "" });
  }
  // 精選基金 · 定期定額
  for (const f of (DATA.dca?.funds || [])) {
    idx.push({ tab: "funds", subtab: "dca", tabLabel: "精選基金 · 定期定額", title: f.name_zh || "", text: f.tagline || "" });
  }
  // 精選基金 · 超越ETF（funds + etfs）
  for (const f of (DATA.beatetf?.funds?.items || [])) {
    idx.push({ tab: "funds", subtab: "beatetf", tabLabel: "精選基金 · 超越ETF", title: f.name_zh || "", text: DATA.beatetf?.tagline || "" });
  }
  for (const e of (DATA.beatetf?.etfs?.items || [])) {
    idx.push({ tab: "funds", subtab: "beatetf", tabLabel: "精選基金 · 超越ETF", title: `${e.symbol || ""} ${e.name_zh || ""}`.trim(), text: e.category || "" });
  }
  // 精選基金 · 熱銷基金
  for (const f of (DATA.popular_funds?.funds || [])) {
    idx.push({ tab: "funds", subtab: "popular", tabLabel: "精選基金 · 熱銷基金", title: f.name_zh || "", text: f.tagline || "" });
  }
  // 精選基金 · 基金績效比較
  for (const f of (DATA.fund_compare?.funds || [])) {
    idx.push({ tab: "funds", subtab: "compare", tabLabel: "精選基金 · 基金績效比較",
               title: f.name_zh || "", text: `${f.morningstar_category || ""} 同類比較 績效 風險 波動` });
  }
  // 海外債
  for (const b of (DATA.obonds?.bonds || [])) {
    idx.push({ tab: "obonds", tabLabel: "精選海外債", title: b.name_zh || b.name || b.isin || "", text: [b.tagline, b.summary, b.issuer].filter(Boolean).join(" ") });
  }
  // 海外股票（精選）
  for (const s of (DATA.stocks?.us_stocks || [])) {
    idx.push({ tab: "usstocks", tabLabel: "海外股票 · 精選", title: `${s.symbol} ${s.name_zh || ""}`.trim(), text: "" });
  }
  // 海外股票（熱門）
  for (const s of (DATA.popular?.stocks || [])) {
    idx.push({ tab: "usstocks", tabLabel: "海外股票 · 熱門", title: `${s.symbol} ${s.name_zh || ""}`.trim(), text: "" });
  }
  // 台股
  for (const s of (DATA.stocks?.tw_stocks || [])) {
    idx.push({ tab: "market", subtab: "tw", tabLabel: "全球市場 · 台股", title: `${s.symbol} ${s.name_zh || ""}`.trim(), text: "台股 台灣股市" });
  }
  // 保險
  for (const ins of (DATA.insurance?.insurances || [])) {
    idx.push({ tab: "insurance", tabLabel: "精選保險", title: ins.name || ins.title || "", text: [ins.tagline, ins.summary, ins.company].filter(Boolean).join(" ") });
  }
  // 新聞 TLDR + 各分區
  for (const item of (DATA.news?.tldr || [])) {
    const title = typeof item === "string" ? item : (item.title || "");
    const text = typeof item === "string" ? "" : (item.text || item.summary || "");
    idx.push({ tab: "news", tabLabel: "重要新聞 · TLDR", title, text });
  }
  for (const sec of (DATA.news?.sections || [])) {
    for (const item of sec.items || []) {
      idx.push({ tab: "news", tabLabel: `重要新聞 · ${sec.name || ""}`, title: item.title || "", text: item.summary || item.text || "" });
    }
  }
  // 稅務新聞
  for (const item of (DATA.tax?.items || [])) {
    idx.push({ tab: "wealth", tabLabel: "財富傳承 · 稅務新聞", title: item.title || "", text: item.summary || item.text || "" });
  }
  // 投組分析 · 預設組合
  for (const p of (DATA.presets?.presets || [])) {
    idx.push({ tab: "portfolio", subtab: "preset", tabLabel: "投組分析 · 預設組合", title: p.name || "", text: `${p.tagline || ""} 配置 組合 集中度 風險 費用 配息` });
  }
  // 投組分析 · 自訂組合
  idx.push({ tab: "portfolio", subtab: "custom", tabLabel: "投組分析 · 自訂組合", title: "自訂組合", text: "自選 組合 配置 HHI 重疊 配息 風險 費用 教育示範" });
  return idx;
}

function runSearch(q) {
  q = (q || "").trim().toLowerCase();
  if (!q) return [];
  const out = [];
  for (const item of SEARCH_INDEX) {
    const hay = ((item.title || "") + " " + (item.text || "") + " " + (item.tabLabel || "")).toLowerCase();
    const pos = hay.indexOf(q);
    if (pos < 0) continue;
    const raw = (item.title || "") + " · " + (item.tabLabel || "") + " · " + (item.text || "");
    const before = Math.max(0, pos - 20);
    const after = Math.min(raw.length, pos + q.length + 40);
    const snippet = (before > 0 ? "…" : "") + raw.slice(before, after) + (after < raw.length ? "…" : "");
    out.push({ ...item, snippet });
    if (out.length >= 50) break;
  }
  return out;
}

function wireSearch() {
  const input = $("search-input");
  const panel = $("search-results");
  if (!input || !panel) { console.warn("[search] input/panel not found"); return; }
  console.log("[search] wired. SEARCH_INDEX size:", SEARCH_INDEX.length);
  let timer;
  const positionPanel = () => {
    const r = input.getBoundingClientRect();
    const vv = window.visualViewport;
    const scrollY = vv ? vv.offsetTop : 0;
    const scrollX = vv ? vv.offsetLeft : 0;
    panel.style.top = (r.bottom + 4 - scrollY) + "px";
    panel.style.left = (r.left - scrollX) + "px";
    panel.style.width = r.width + "px";
  };
  const doSearch = (q) => {
    if (!q.trim()) { panel.hidden = true; panel.innerHTML = ""; return; }
    if (!SEARCH_INDEX || !SEARCH_INDEX.length) {
      try { SEARCH_INDEX = buildSearchIndex(); } catch(e) { console.error("[search] build idx fail:", e); }
    }
    const results = runSearch(q);
    positionPanel();
    panel.hidden = false;
    panel.innerHTML = results.length
      ? results.map(r => `
          <button class="search-result" data-tab="${escapeHtml(r.tab)}">
            <div class="sr-title">${escapeHtml(r.title || "(無標題)")}</div>
            <div class="sr-meta">${escapeHtml(r.tabLabel || "")}</div>
            <div class="sr-snippet">${escapeHtml(r.snippet || "")}</div>
          </button>`).join("")
      : `<div class="search-result-empty">無相符結果（共 ${SEARCH_INDEX.length} 筆索引）</div>`;
    panel.querySelectorAll(".search-result").forEach((btn, i) => {
      btn.addEventListener("click", () => {
        const r = results[i] || {};
        PENDING_HIGHLIGHT = r.title || "";
        PENDING_SUBTAB = r.subtab || null;
        switchTab(btn.dataset.tab);
        panel.hidden = true;
        input.value = "";
      });
    });
  };
  input.addEventListener("input", e => {
    clearTimeout(timer);
    timer = setTimeout(() => doSearch(e.target.value), 150);
  });
  input.addEventListener("focus", e => {
    if (e.target.value.trim()) doSearch(e.target.value);
  });
  // Enter 鍵：立即搜尋並跳到第一筆結果
  input.addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    clearTimeout(timer);
    const q = input.value.trim();
    if (!q) return;
    doSearch(q);
    const first = panel.querySelector(".search-result");
    if (first) {
      first.click();
    } else {
      panel.hidden = false;
      panel.classList.add("flash-hit");
      setTimeout(() => panel.classList.remove("flash-hit"), 800);
    }
  });
  // 阻止 main-nav 攔截搜尋 panel click
  panel.addEventListener("mousedown", e => e.stopPropagation());
  // 點外部關閉
  document.addEventListener("click", e => {
    if (!input.contains(e.target) && !panel.contains(e.target)) panel.hidden = true;
  });
  // 視窗/捲動/手機鍵盤開收時重算位置
  const repositionIfOpen = () => { if (!panel.hidden) positionPanel(); };
  window.addEventListener("resize", repositionIfOpen);
  window.addEventListener("scroll", repositionIfOpen, true);
  if (window.visualViewport) window.visualViewport.addEventListener("resize", repositionIfOpen);
}

// 上次更新時間：取「本機 build (meta.built_at)」與「雲端報價 (quotes_built_at)」較新的一個。
// 雲端 workflow 在 Mac 關著時仍會刷新數字並蓋 quotes_built_at，避免標籤卡在上次本機 build。
// 兩者皆為 +08:00 ISO 字串，可直接字典序比較。
function latestBuiltAt() {
  const a = (DATA.meta && DATA.meta.built_at) || "";
  const b = (DATA.quotes_built_at && DATA.quotes_built_at.built_at) || "";
  return a > b ? a : b;
}

async function init() {
  // 每個來源各自有 fallback：一個壞不拖垮全頁
  // 失敗時記到 FAILED_LOADS，使用者切到對應 tab 時會背景重試
  const safe = (name, fallback) => load(name).catch(() => { FAILED_LOADS.add(name); return fallback; });
  const [meta, market, news, tax, funds, stocks, popular, stock_brief, insurance, obonds, obonds_all, targets, allocation, dca, wealth, beatetf, presets, fund_compare, tw_stocks, rankings, quotes_built_at, premarket, popular_funds] = await Promise.all([
    safe("meta", { built_at: "", today: "", sources_status: {} }),
    safe("market", { closing_date: "", indices: [], bonds: [], fx: [], summary: "" }),
    safe("news", { news_date: "", tldr: [], sections: [] }),
    safe("tax", { tax_date: "", items: [] }),
    safe("funds", { funds: [] }),
    safe("stocks", { us_stocks: [], tw_stocks: [] }),
    safe("popular_stocks", { stocks: [] }),
    safe("stock_brief", { generated_at: "", week_of: "", stocks: [] }),
    safe("insurances", { insurances: [] }),
    safe("overseas_bonds", { bonds: [] }),
    safe("overseas_bonds_all", { bonds: [] }),
    safe("targets", { targets: [], summary: {}, entry_sequence: [] }),
    safe("allocation", { profiles: [], references: [] }),
    safe("dca", { funds: [] }),
    safe("wealth_transfer", { topics: [] }),
    safe("beatetf", { funds: [], benchmark: null }),
    safe("presets", { presets: [] }),
    safe("fund_compare", { funds: [], categories: [] }),
    safe("tw_stocks", []),
    safe("rankings", { tw: {}, us: {} }),
    safe("quotes_built_at", { built_at: "" }),
    safe("premarket", null),
    safe("popular_funds", { funds: [] }),
  ]);
  DATA = { meta, market, news, tax, funds, stocks, popular, stock_brief, insurance, obonds, obonds_all, targets, allocation, dca, wealth, beatetf, presets, fund_compare, tw_stocks, rankings, quotes_built_at, premarket, popular_funds };
  const _updatedAt = latestBuiltAt();
  if (!_updatedAt) {
    $("updated").textContent = `載入部分失敗（顯示快取資料）`;
  } else {
    $("updated").textContent = `上次更新：${_updatedAt.replace("T", " ").slice(0, 16)}`;
  }

  document.querySelectorAll(".main-tab").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  wireNavToggle();
  wireHomeFab();
  wireChatFab();

  SEARCH_INDEX = buildSearchIndex();
  wireSearch();

  const hashTab = location.hash.replace(/^#/, "");
  if (hashTab) CURRENT_TAB = hashTab;
  switchTab(CURRENT_TAB);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js?v=20260604-v11").catch(() => {});
  }

  wireSortableTables();
  setupPullToRefresh();

  // 進入畫面/從背景回到前景時自動檢查新版
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkForNewVersion();
  });
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) checkForNewVersion();
  });
}

// 舊 targets / portfolio / position / allocation 分頁導向合併後的「資產配置」(alloc)
function redirectToAlloc(body) {
  body.innerHTML = renderAllocSheet();
  CURRENT_TAB = "alloc";
  body.dataset.section = "alloc";
  document.querySelectorAll(".main-tab").forEach(b => {
    b.classList.toggle("active", b.dataset.tab === "alloc");
  });
  return "alloc";
}

function switchTab(name) {
  CURRENT_TAB = name;
  document.querySelectorAll(".main-tab").forEach(b => {
    b.classList.toggle("active", b.dataset.tab === name);
  });
  document.querySelectorAll(".tabbar-item[data-tab]").forEach(b => {
    b.classList.toggle("active", b.dataset.tab === name);
  });
  const body = $("content");
  body.dataset.section = name;
  if (name === "market") body.innerHTML = renderMarketSheet();
  else if (name === "live") body.innerHTML = renderLiveSheet();
  else if (name === "news") body.innerHTML = renderNewsSheet();
  else if (name === "funds") body.innerHTML = renderFundsSheet();
  else if (name === "insurance") body.innerHTML = renderInsuranceSheet();
  else if (name === "obonds") body.innerHTML = renderObondsSheet();
  else if (name === "bondmkt") body.innerHTML = renderBondMarket();
  else if (name === "usstocks") body.innerHTML = renderUsStocksSheet();
  else if (name === "dca") {
    // dca 已併入 funds 的次分頁；舊的 hash 連結轉到 funds#dca
    body.innerHTML = renderFundsSheet();
    PENDING_SUBTAB = "dca";
    name = "funds";
    CURRENT_TAB = "funds";
    body.dataset.section = "funds";
    document.querySelectorAll(".main-tab").forEach(b => {
      b.classList.toggle("active", b.dataset.tab === "funds");
    });
  }
  else if (name === "alloc") body.innerHTML = renderAllocSheet();
  else if (name === "targets") {
    // 舊「主題市場」分頁已併入「資產配置」
    ALLOC_SUBTAB = "targets";
    name = redirectToAlloc(body);
  }
  else if (name === "position" || name === "allocation") {
    // 舊「部位分析」「資產配置」分頁已併入「資產配置 → 投組分析（預設組合）」
    PORTFOLIO_SUBTAB = "preset";
    ALLOC_SUBTAB = "portfolio";
    PENDING_SUBTAB = "preset";
    name = redirectToAlloc(body);
  }
  else if (name === "portfolio") {
    // 舊「投組分析」分頁已併入「資產配置」
    ALLOC_SUBTAB = "portfolio";
    name = redirectToAlloc(body);
  }
  else if (name === "assist") {
    // 舊「資產規劃」分頁已併入「資產配置 → 專屬規劃」
    ALLOC_SUBTAB = "assist";
    name = redirectToAlloc(body);
  }
  else if (name === "wealth") body.innerHTML = renderWealthSheet();
  else if (name === "chat") body.innerHTML = renderChatSheet();
  else if (name === "calc") body.innerHTML = renderCalcSheet();
  else if (name === "twstock") body.innerHTML = renderTwStockSheet();
  if (name === "news") wireNewsTabs();
  if (name === "live") wireLive();
  if (name === "market") { wireMarketViewTabs(); wireMarketTabs(); wireTwStock(); wireNewsTabs(); }
  if (name === "funds") { wireFundsTabs(); wireFundCompare(); }
  if (name === "alloc") wireAllocTabs();
  if (name === "wealth") wireWealthTabs();
  if (name === "chat") wireChat();
  if (name === "calc") wireCalcTabs();
  if (name === "twstock") wireTwStock();
  if (name === "obonds") { SWAP_PICK = { old: null, new: null }; wireObondsTabs(); }
  if (name === "bondmkt") wireBondMarketTabs();
  if (PENDING_SUBTAB) {
    const sub = PENDING_SUBTAB;
    PENDING_SUBTAB = null;
    const sel = ["mtab", "atab", "ttab", "ctab", "wtab", "ntab", "ftab", "prtab", "otab"]
      .map(a => `.tab[data-${a}="${sub}"]`).join(",");
    const subBtn = document.querySelector(sel);
    if (subBtn) subBtn.click();
  }
  if (PENDING_HIGHLIGHT) {
    const target = PENDING_HIGHLIGHT;
    PENDING_HIGHLIGHT = null;
    setTimeout(() => flashFindInContent(target), 120);
  } else {
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  updateNavCurrent();

  // market 以外的 tab 顯示右下角「回首頁」FAB（僅手機；CSS media query 控管）
  document.body.classList.toggle("show-home-fab", name !== "market");

  // 背景重試 init 時失敗的資料；成功就重畫一次（避免 fallback 空狀態卡住）
  retryFailedForTab(name).then(updated => {
    if (updated && CURRENT_TAB === name) {
      SEARCH_INDEX = buildSearchIndex();
      switchTab(name);
    }
  });
}

function wireNavToggle() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("main-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.addEventListener("click", (e) => {
    if (!document.body.classList.contains("nav-open")) return;
    if (e.target.closest(".main-tab")) {
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    } else if (e.target === nav) {
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
  const tabbar = document.getElementById("tabbar");
  if (tabbar) {
    tabbar.addEventListener("click", (e) => {
      const item = e.target.closest(".tabbar-item");
      if (!item) return;
      if (item.dataset.action === "more") {
        const open = document.body.classList.toggle("nav-open");
        item.setAttribute("aria-expanded", open ? "true" : "false");
        if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
      } else if (item.dataset.tab) {
        if (document.body.classList.contains("nav-open")) document.body.classList.remove("nav-open");
        switchTab(item.dataset.tab);
      }
    });
  }
}

function wireHomeFab() {
  const fab = document.getElementById("home-fab");
  if (!fab) return;
  fab.addEventListener("click", () => {
    switchTab("market");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// 理財聊聊：右下角浮動 logo，點了才把聊天掛進彈出視窗（只掛一次）
function wireChatFab() {
  const fab = document.getElementById("chat-fab");
  const popup = document.getElementById("chat-popup");
  const body = document.getElementById("chat-popup-body");
  const closeBtn = document.getElementById("chat-popup-close");
  if (!fab || !popup || !body) return;
  let mounted = false;
  const openChat = () => {
    if (!mounted) { body.innerHTML = renderChatSheet(); wireChat(); mounted = true; }
    popup.classList.add("open");
    fab.setAttribute("aria-expanded", "true");
    setTimeout(() => { const i = document.getElementById("lcInput"); if (i) i.focus(); }, 80);
  };
  const closeChat = () => {
    popup.classList.remove("open");
    fab.setAttribute("aria-expanded", "false");
  };
  fab.addEventListener("click", () => {
    popup.classList.contains("open") ? closeChat() : openChat();
  });
  if (closeBtn) closeBtn.addEventListener("click", closeChat);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && popup.classList.contains("open")) closeChat();
  });
}

function updateNavCurrent() {
  const el = document.getElementById("nav-current");
  if (!el) return;
  const active = document.querySelector(".main-tab.active span");
  if (active) el.textContent = active.textContent;
}

function currencyChip(cur) {
  if (!cur) return "";
  const c = String(cur).toUpperCase();
  const cls = c === "USD" ? "chip-usd" : c === "TWD" ? "chip-twd" : c === "AUD" ? "chip-aud" : "chip-default";
  return `<span class="chip ${cls}">${escapeHtml(c)}</span>`;
}

function typeChip(type) {
  if (!type) return "";
  let cls = "chip-default";
  if (type.includes("零息")) cls = "chip-zero";
  else if (type.includes("主權") || type.includes("地方政府")) cls = "chip-sov";
  else if (type.includes("公司")) cls = "chip-corp";
  return `<span class="chip ${cls}">${escapeHtml(type)}</span>`;
}

function wireMarketTabs() {
  const buttons = document.querySelectorAll(".tab[data-mtab]");
  const ids = Array.from(buttons).map(b => "mtab-" + b.dataset.mtab);
  buttons.forEach(t => {
    t.addEventListener("click", () => {
      buttons.forEach(x => x.classList.remove("active"));
      t.classList.add("active");
      const which = "mtab-" + t.dataset.mtab;
      ids.forEach(id => {
        const el = $(id);
        if (el) el.hidden = id !== which;
      });
    });
  });
}

function wireMarketViewTabs() {
  const buttons = document.querySelectorAll(".tab[data-mvtab]");
  const ids = Array.from(buttons).map(b => "mvtab-" + b.dataset.mvtab);
  buttons.forEach(t => {
    t.addEventListener("click", () => {
      buttons.forEach(x => x.classList.remove("active"));
      t.classList.add("active");
      const which = "mvtab-" + t.dataset.mvtab;
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.hidden = id !== which;
      });
    });
  });
}

let _pullStartY = 0;
let _pullCurrentY = 0;
let _isPulling = false;
const _PULL_THRESHOLD = 80;

function setupPullToRefresh() {
  const ind = document.createElement("div");
  ind.id = "pull-indicator";
  ind.innerHTML = '<span class="arrow">↓</span><span class="text">下拉更新</span>';
  document.body.prepend(ind);

  document.addEventListener("touchstart", (e) => {
    if (window.scrollY > 0) return;
    _pullStartY = e.touches[0].clientY;
    _pullCurrentY = _pullStartY;
    _isPulling = true;
    ind.classList.remove("done");
  }, { passive: true });

  document.addEventListener("touchmove", (e) => {
    if (!_isPulling) return;
    _pullCurrentY = e.touches[0].clientY;
    const dy = _pullCurrentY - _pullStartY;
    if (dy <= 0) return;
    const offset = Math.min(dy * 0.5, 80);
    ind.style.transform = `translateY(${offset}px)`;
    ind.classList.toggle("ready", dy > _PULL_THRESHOLD);
  }, { passive: true });

  document.addEventListener("touchend", async () => {
    if (!_isPulling) return;
    const dy = _pullCurrentY - _pullStartY;
    _isPulling = false;
    const textEl = ind.querySelector(".text");
    if (dy > _PULL_THRESHOLD) {
      ind.classList.add("refreshing");
      textEl.textContent = "更新中…";
      try {
        await refreshData();
        textEl.textContent = "✓ 已更新";
        ind.classList.add("done");
      } catch (err) {
        textEl.textContent = "更新失敗";
      }
      setTimeout(() => {
        ind.style.transform = "";
        ind.classList.remove("refreshing", "ready");
        textEl.textContent = "下拉更新";
        ind.querySelector(".arrow").textContent = "↓";
      }, 1200);
    } else {
      ind.style.transform = "";
      ind.classList.remove("ready");
    }
  }, { passive: true });
}

async function checkForNewVersion() {
  try {
    const r = await fetch("./index.html?nc=" + Date.now(),
      { cache: "no-store" });
    if (!r.ok) return false;
    const html = await r.text();
    const m = html.match(/app\.js\?v=([0-9-]+)/);
    if (!m) return false;
    const liveVer = m[1];
    const cur = document.querySelector('script[src*="app.js"]');
    const curMatch = cur && cur.src.match(/v=([0-9-]+)/);
    const curVer = curMatch ? curMatch[1] : null;
    if (curVer && liveVer !== curVer) {
      location.replace(location.pathname + "?t=" + Date.now());
      return true;
    }
  } catch (_) { /* 忽略網路錯誤 */ }
  return false;
}

async function refreshData() {
  if (await checkForNewVersion()) return;

  // 資料刷新：fetch 7 個 JSON，每個各自有 fallback
  const safe = (name, fallback) => load(name).catch(() => {
    FAILED_LOADS.add(name);
    return DATA[name === "insurances" ? "insurance" : name] || fallback;
  });
  const [meta, market, news, tax, funds, stocks, popular, stock_brief, insurance, obonds, obonds_all, targets, allocation, dca, wealth, beatetf, presets, fund_compare, tw_stocks, rankings, quotes_built_at, premarket, popular_funds] = await Promise.all([
    safe("meta", { built_at: "", today: "", sources_status: {} }),
    safe("market", { closing_date: "", indices: [], bonds: [], fx: [], summary: "" }),
    safe("news", { news_date: "", tldr: [], sections: [] }),
    safe("tax", { tax_date: "", items: [] }),
    safe("funds", { funds: [] }),
    safe("stocks", { us_stocks: [], tw_stocks: [] }),
    safe("popular_stocks", { stocks: [] }),
    safe("stock_brief", { generated_at: "", week_of: "", stocks: [] }),
    safe("insurances", { insurances: [] }),
    safe("overseas_bonds", { bonds: [] }),
    safe("overseas_bonds_all", { bonds: [] }),
    safe("targets", { targets: [], summary: {}, entry_sequence: [] }),
    safe("allocation", { profiles: [], references: [] }),
    safe("dca", { funds: [] }),
    safe("wealth_transfer", { topics: [] }),
    safe("beatetf", { funds: [], benchmark: null }),
    safe("presets", { presets: [] }),
    safe("fund_compare", { funds: [], categories: [] }),
    safe("tw_stocks", []),
    safe("rankings", { tw: {}, us: {} }),
    safe("quotes_built_at", { built_at: "" }),
    safe("premarket", null),
    safe("popular_funds", { funds: [] }),
  ]);
  DATA = { meta, market, news, tax, funds, stocks, popular, stock_brief, insurance, obonds, obonds_all, targets, allocation, dca, wealth, beatetf, presets, fund_compare, tw_stocks, rankings, quotes_built_at, premarket, popular_funds };
  SEARCH_INDEX = buildSearchIndex();
  const _updatedAt = latestBuiltAt();
  if (_updatedAt) {
    $("updated").textContent =
      `上次更新：${_updatedAt.replace("T", " ").slice(0, 16)}`;
  }
  switchTab(CURRENT_TAB);
}

// ===== 換券試算：債券定價數學（純前端，每百元面額） =====
function _freqPerYear(freq) {
  if (!freq) return 2;
  if (freq.includes("月")) return 12;
  if (freq.includes("季")) return 4;
  if (freq.includes("半")) return 2;
  if (freq.includes("年")) return 1;
  return 0; // 無配息/零息
}
// 以殖利率求理論價（每百元）。零息債走折現到期。
function bondPriceFromYield(couponPct, freq, years, yieldPct) {
  const y = yieldPct / 100;
  const m = _freqPerYear(freq);
  if (years <= 0) return 100;
  if (m === 0 || !couponPct) {
    return 100 / Math.pow(1 + y, years); // 零息：年複利折現
  }
  const n = Math.max(1, Math.round(years * m));
  const c = (couponPct / 100) * 100 / m; // 每期票息
  const r = y / m;
  let pv = 0;
  for (let t = 1; t <= n; t++) pv += c / Math.pow(1 + r, t);
  pv += 100 / Math.pow(1 + r, n);
  return pv;
}
// 價格變動（每百元）：殖利率變動 dYieldPct 時的理論價差
function priceChangePer100(couponPct, freq, years, yieldPct, dYieldPct) {
  const p0 = bondPriceFromYield(couponPct, freq, years, yieldPct);
  const p1 = bondPriceFromYield(couponPct, freq, years, yieldPct + dYieldPct);
  return p1 - p0;
}
// 單一情境：含一年票息的估計損益（本幣金額）
function scenarioPnl(bond, faceValue, dYieldPct) {
  const coupon = bond.coupon_pct || 0;
  const freq = bond.coupon_freq || "";
  const years = bond.years_to_maturity || 0;
  const y = (bond.bid_yield_pct != null ? bond.bid_yield_pct
            : bond.redeem_yield_pct) || 0;
  const dPrice100 = priceChangePer100(coupon, freq, years, y, dYieldPct);
  const pricePnl = faceValue * dPrice100 / 100;
  const annualCoupon = faceValue * coupon / 100;
  return pricePnl + annualCoupon;
}

function bondUrl(b) {
  if (!b.isin || !b.code) return null;
  return `https://bopfund.moneydj.com/b2bbond/BondBasic/Basic01?id=${encodeURIComponent(b.isin)}&bid=${encodeURIComponent(b.code)}`;
}

// ── 債券市場概況 ─────────────────────────────────────────────────────────────
function renderBondMarket() {
  const m = DATA.market || {};
  const govBonds = m.bonds || [];
  const bondEtfs = m.bond_etfs || [];
  const ro = m.rate_outlook || {};
  const date = m.closing_date || "";

  // ETF ticker helper: 取名稱第一段大寫英文字母群
  function etfTicker(name) {
    return (name || "").match(/\b([A-Z]{2,5})\b/)?.[1] || "";
  }

  // 產生 Yahoo Finance 連結
  function etfLink(e) {
    const tk = etfTicker(e.name || "");
    if (!tk) return escapeHtml(e.name || "");
    const url = `https://finance.yahoo.com/quote/${tk}/`;
    return `<a href="${url}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">${escapeHtml(e.name)}</a>`;
  }

  // ETF 表格（可排序）
  function renderEtfTable(etfs, emptyMsg) {
    if (!etfs.length) return `<p style="color:var(--text-mute);padding:20px 0">${emptyMsg || "尚無資料"}</p>`;
    const rows = etfs.map(e => `
      <tr>
        <td>${etfLink(e)}</td>
        <td>${e.close != null ? e.close.toFixed(2) : "—"}</td>
        <td class="${pctClass(e.daily_pct)}">${fmtPct(e.daily_pct)}</td>
        <td class="${pctClass(e.mtd_pct)}">${fmtPct(e.mtd_pct)}</td>
        <td class="${pctClass(e.ytd_pct)}">${fmtPct(e.ytd_pct)}</td>
        <td class="date-col">${escapeHtml(shortDate(e.closing_date) || date)}</td>
      </tr>`).join("");
    return `<table class="indices freeze-col1">
      <thead><tr>
        <th>ETF 名稱</th>
        <th class="sortable-th" title="最新收盤價（美元）；來源：Yahoo Finance；點選排序">收盤</th>
        <th class="sortable-th" title="日報酬率｜今日收盤 vs 昨日收盤；點選排序">日</th>
        <th class="sortable-th" title="本月至今報酬率（MTD）；點選排序">本月</th>
        <th class="sortable-th" title="年初至今報酬率（YTD）；點選排序">今年</th>
        <th class="date-col">收盤日</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  // 公債殖利率表（重用市場資料中的 bonds）
  function renderGovBondTable() {
    if (!govBonds.length) return `<p style="color:var(--text-mute);padding:20px 0">尚未提供公債殖利率資料</p>`;
    const rows = govBonds.map(b => {
      const dailyCell = `<span class="${bpsClass(b.daily_bps)}">${fmtBps(b.daily_bps)}</span>`;
      const mtdCell   = `<span class="${bpsClass(b.mtd_bps)}">${fmtBps(b.mtd_bps)}</span>`;
      return `<tr>
        <td>${escapeHtml(b.name || "")}</td>
        <td>${b.yield_pct != null ? b.yield_pct.toFixed(2) + "%" : "—"}</td>
        <td>${dailyCell}</td>
        <td>${mtdCell}</td>
        <td class="date-col">${escapeHtml(shortDate(b.closing_date) || date)}</td>
      </tr>`;
    }).join("");
    return `<table class="indices freeze-col1">
      <thead><tr>
        <th title="殖利率來源：美國財政部/英格蘭銀行/ECB/日本財務省/Yahoo Finance">公債</th>
        <th class="sortable-th" title="到期殖利率（YTM, %）；點選排序">殖利率</th>
        <th class="sortable-th" title="日變動（bps）｜今日 yield − 昨日 yield；點選排序">日變動</th>
        <th class="sortable-th" title="本月變動（bps）｜月初首交易日 yield → 最新 yield；點選排序">本月變動</th>
        <th class="date-col">更新日</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  // 殖利率曲線利差卡片
  const y2  = ro.us2y   ?? null;
  const y10 = ro.us10y  ?? null;
  const spreadBps = ro.yield_curve_10y2y_bps ?? null;
  const curveShape = ro.curve_shape || "";
  let curveBg = "#f8fafc", curveColor = "var(--text)";
  if (curveShape === "倒掛")  { curveBg = "#fee2e2"; curveColor = "#991b1b"; }
  else if (curveShape === "正斜率") { curveBg = "#d1fae5"; curveColor = "#065f46"; }
  else if (curveShape === "平坦")  { curveBg = "#fef9c3"; curveColor = "#854d0e"; }

  const spreadCard = `
    <div style="margin-bottom:16px;padding:14px 16px;background:var(--card-bg,#fff);border:1px solid var(--border);border-radius:10px;">
      <div style="font-weight:600;font-size:16px;margin-bottom:10px;">美國殖利率曲線利差
        <a href="https://fred.stlouisfed.org/series/T10Y2Y" target="_blank" rel="noopener"
           style="font-size:11px;color:#3b82f6;text-decoration:none;margin-left:8px;">FRED T10Y2Y ↗</a>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:8px;">
        <div style="padding:8px 10px;background:var(--bg,#fff);border:1px solid var(--border);border-radius:8px;">
          <div style="font-size:11px;color:var(--text-mute);margin-bottom:3px;">US 2Y 殖利率</div>
          <div style="font-size:18px;font-weight:700;">${y2 != null ? y2.toFixed(2) + "%" : "—"}</div>
          <div style="font-size:10px;color:var(--text-mute);">升息預期指標</div>
        </div>
        <div style="padding:8px 10px;background:var(--bg,#fff);border:1px solid var(--border);border-radius:8px;">
          <div style="font-size:11px;color:var(--text-mute);margin-bottom:3px;">US 10Y 殖利率</div>
          <div style="font-size:18px;font-weight:700;">${y10 != null ? y10.toFixed(2) + "%" : "—"}</div>
          <div style="font-size:10px;color:var(--text-mute);">長期通膨/景氣預期</div>
        </div>
        <div style="padding:8px 10px;background:${curveBg};border:1px solid var(--border);border-radius:8px;">
          <div style="font-size:11px;color:var(--text-mute);margin-bottom:3px;">10Y−2Y 利差</div>
          <div style="font-size:18px;font-weight:700;color:${curveColor};">
            ${spreadBps != null ? (spreadBps >= 0 ? "+" : "") + spreadBps + " bps" : "—"}
          </div>
          <div style="font-size:10px;color:${curveColor};font-weight:500;">${curveShape || "殖利率曲線"}</div>
        </div>
      </div>
      <p style="font-size:11px;color:var(--text-mute);margin:10px 0 0;">
        10Y−2Y 正值=正斜率（景氣擴張預期）；負值=倒掛（歷史上常先行衰退訊號）。
        資料來源：美國財政部/Yahoo Finance。
      </p>
    </div>`;

  // 分類 ETF
  const igEtfs   = bondEtfs.filter(e => (e.name || "").includes("投資等級"));
  const hyEtfs   = bondEtfs.filter(e => (e.name || "").includes("高收益"));
  const emEtfs   = bondEtfs.filter(e => (e.name || "").includes("新興市場"));
  const govEtfs  = bondEtfs.filter(e => (e.name || "").includes("公債") && !(e.name || "").includes("綜合"));
  const aggEtfs  = bondEtfs.filter(e => (e.name || "").includes("綜合"));

  // 利差總覽：各分類 ETF 今年表現橫排比較
  function spreadSummaryRow(label, etfs) {
    if (!etfs.length) return "";
    const e = etfs[0];
    const dv = fmtPct(e.daily_pct);
    const mv = fmtPct(e.mtd_pct);
    const yv = fmtPct(e.ytd_pct);
    return `<tr>
      <td style="font-weight:500;">${escapeHtml(label)}</td>
      <td style="font-size:11px;color:var(--text-mute);">${etfLink(e)}</td>
      <td class="${pctClass(e.daily_pct)}">${dv}</td>
      <td class="${pctClass(e.mtd_pct)}">${mv}</td>
      <td class="${pctClass(e.ytd_pct)}">${yv}</td>
    </tr>`;
  }

  const allCatsForSpread = [
    ["長天期公債", govEtfs.filter(e => (e.name||"").includes("長天期"))],
    ["中期公債",   govEtfs.filter(e => (e.name||"").includes("中期"))],
    ["綜合債市",   aggEtfs],
    ["投資等級債", igEtfs.filter(e => (e.name||"").includes("LQD") || (e.name||"").match(/\bLQD\b/))],
    ["短期投資等級", igEtfs.filter(e => (e.name||"").includes("短期"))],
    ["高收益債",   hyEtfs.filter(e => (e.name||"").includes("HYG") || (e.name||"").match(/\bHYG\b/))],
    ["新興市場債", emEtfs],
  ];
  const spreadRows = allCatsForSpread.map(([label, etfs]) => spreadSummaryRow(label, etfs)).filter(Boolean).join("");
  const spreadTab = spreadCard + (spreadRows ? `
    <h2 style="font-size:16px;margin:20px 0 8px;">各類債券市場表現比較</h2>
    <p style="font-size:11px;color:var(--text-mute);margin-bottom:10px;">
      以 ETF 收盤價報酬率代理各類債市走勢；點擊 ETF 名稱可查 Yahoo Finance 詳情。
      實際信用利差（OAS）請參閱
      <a href="https://fred.stlouisfed.org/series/BAMLH0A0HYM2" target="_blank" rel="noopener" style="color:#3b82f6;">FRED BAMLH0A0HYM2（高收益 OAS）</a> 及
      <a href="https://fred.stlouisfed.org/series/BAMLC0A0CM" target="_blank" rel="noopener" style="color:#3b82f6;">BAMLC0A0CM（投資等級 OAS）</a>。
    </p>
    <table class="indices">
      <thead><tr>
        <th>類別</th>
        <th style="font-size:11px;color:var(--text-mute);">代表 ETF</th>
        <th class="sortable-th">日</th>
        <th class="sortable-th">本月</th>
        <th class="sortable-th">今年</th>
      </tr></thead>
      <tbody>${spreadRows}</tbody>
    </table>` : `<p style="color:var(--text-mute);padding:16px 0">ETF 資料尚未載入，請等待每日 build 後刷新。</p>`);

  const noEtfNote = `<p style="font-size:11px;color:var(--text-mute);margin-top:10px;">
    資料來源：Yahoo Finance ETF 收盤價報酬率（每日 build 後更新）。非買賣建議。
  </p>`;

  return `
    <div class="tabs tabs-wrap">
      <button class="tab active" data-bmtab="govbond">公債</button>
      <button class="tab" data-bmtab="ig">投資等級債</button>
      <button class="tab" data-bmtab="hy">非投資等級債</button>
      <button class="tab" data-bmtab="em">新興市場債</button>
      <button class="tab" data-bmtab="spread">利差總覽</button>
    </div>
    <div id="bmtab-govbond">
      <p style="font-size:11px;color:var(--text-mute);margin-bottom:10px;">
        各國 10 年期（及美國 2 年期）公債殖利率（到期殖利率 YTM）。
        來源：美國財政部 / 英格蘭銀行 / 歐洲央行 / 日本財務省 / Yahoo Finance。
      </p>
      ${renderGovBondTable()}
    </div>
    <div id="bmtab-ig" hidden>
      <p style="font-size:11px;color:var(--text-mute);margin-bottom:10px;">
        投資等級公司債市場（信評 BBB− 以上）。以 LQD（綜合投資等級）及 VCSH（短期投資等級）ETF 報酬率代理走勢。
      </p>
      ${renderEtfTable(igEtfs, "尚無投資等級債 ETF 資料")}
      ${igEtfs.length ? noEtfNote : ""}
    </div>
    <div id="bmtab-hy" hidden>
      <p style="font-size:11px;color:var(--text-mute);margin-bottom:10px;">
        非投資等級債（高收益債 / 信評 BB+ 以下）。以 HYG 及 JNK ETF 報酬率代理走勢；兩檔成分債相近，可交叉驗證。
      </p>
      ${renderEtfTable(hyEtfs, "尚無高收益債 ETF 資料")}
      ${hyEtfs.length ? noEtfNote : ""}
    </div>
    <div id="bmtab-em" hidden>
      <p style="font-size:11px;color:var(--text-mute);margin-bottom:10px;">
        新興市場主權債與公司債（美元計價）。以 EMB ETF（摩根大通新興市場美元債指數）報酬率代理走勢。
      </p>
      ${renderEtfTable(emEtfs, "尚無新興市場債 ETF 資料")}
      ${emEtfs.length ? noEtfNote : ""}
    </div>
    <div id="bmtab-spread" hidden>
      ${spreadTab}
    </div>`;
}

function wireBondMarketTabs() {
  wireTabs("[data-bmtab]", id => {
    ["govbond","ig","hy","em","spread"].forEach(k => {
      const el = document.getElementById("bmtab-" + k);
      if (el) el.hidden = (k !== id);
    });
  });
}


function renderObondsSheet() {
  const list = (DATA.obonds && DATA.obonds.bonds) || [];
  const fmtCoupon = c => (c === null || c === undefined) ? "—"
    : (c === 0 ? "零息" : `${c.toFixed(1)}%`);
  const fmtPctNum = p => (p === null || p === undefined) ? "—" : fmtPct(p);
  const fmtPrice = p => (p === null || p === undefined) ? "—" : Number(p).toFixed(1);
  const priceCell = b => fmtPrice(b.ask_price);
  const priceDateCell = b => b.price_date ? `<span style="font-size:11px;color:var(--text-mute)">${escapeHtml(shortDate(b.price_date))}</span>` : "—";

  let cards;
  if (!list.length) {
    cards = "<p style='color:var(--text-mute); padding:20px 0'>尚未提供海外債清單</p>";
  } else {
    const head = `<tr>
      <th class="cmp-th-l">債券名稱</th>
      <th>幣別</th><th>票面利率</th><th>到期日</th>
      <th>申購參考殖利率</th><th>贖回參考價</th><th>報價日</th>
      <th>週%</th><th>月%</th><th>季%</th>
    </tr>`;
    const body = list.map(b => {
      const url = bondUrl(b);
      const displayName = [b.name_zh, b.issuer].filter(Boolean).map(escapeHtml).join(" ");
      const nameHtml = url
        ? `<a href="${url}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">${displayName}</a>`
        : displayName;
      return `
      <tr>
        <td class="cmp-td-l">${nameHtml}</td>
        <td>${escapeHtml(b.currency || "—")}</td>
        <td>${fmtCoupon(b.coupon_pct)}</td>
        <td>${escapeHtml(b.maturity || "—")}</td>
        <td><span class="up">${b.bid_yield_pct != null ? b.bid_yield_pct.toFixed(1) + "%" : "—"}</span></td>
        <td>${priceCell(b)}</td>
        <td>${priceDateCell(b)}</td>
        <td class="${pctClass(b.perf_1w)}">${fmtPctNum(b.perf_1w)}</td>
        <td class="${pctClass(b.perf_1m)}">${fmtPctNum(b.perf_1m)}</td>
        <td class="${pctClass(b.perf_3m)}">${fmtPctNum(b.perf_3m)}</td>
      </tr>`;
    }).join("");
    cards = `<div class="cmp-table-wrap"><table class="indices obond-table">
      <thead>${head}</thead><tbody>${body}</tbody></table></div>`;
  }

  const moreSection = `
    <div class="fund-card" style="margin-top:18px;text-align:center">
      <h3 style="margin-bottom:6px">其他海外債</h3>
      <p class="tagline" style="margin-bottom:12px">瀏覽完整債券行情表（公司債／主權債／金融債／超國際債）</p>
      <a href="https://bopfund.moneydj.com/bond/index.html" target="_blank" rel="noopener"
         style="display:inline-block;padding:10px 22px;background:#019AB3;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
        前往債券行情表
      </a>
    </div>
  `;

  const listView = cards + moreSection;
  return `
    <div class="tabs tabs-wrap" role="tablist">
      <button class="tab active" data-otab="list" role="tab">精選海外債</button>
      <button class="tab" data-otab="swap" role="tab">換券試算</button>
    </div>
    <div class="otab-panel" data-otab-panel="list">${listView}</div>
    <div class="otab-panel" data-otab-panel="swap" hidden>${renderSwapCalc()}</div>
  `;
}

function renderSwapCalc() {
  const qb = (DATA.obonds_all && DATA.obonds_all.quote_basis) || "";
  const dateNote = qb ? `（報價基準日：${escapeHtml(shortDate(qb))}）` : "";
  return `
  <p class="swap-disclaimer">本工具僅為試算參考，非投資建議或要約；數據為每日報價${dateNote}，實際損益依市場成交為準。</p>

  <div class="swap-grid">
    <div class="fund-card swap-side" data-side="old">
      <h3>① 舊券（你的庫存）</h3>
      <div class="swap-search">
        <input type="text" class="swap-q" data-side="old" placeholder="輸入代碼或名稱關鍵字，例：FECB 或 蘋果" autocomplete="off">
        <div class="swap-results" data-side="old" hidden></div>
      </div>
      <div class="swap-picked" data-side="old" hidden></div>
      <label class="swap-field">庫存面額（原幣）
        <input type="number" class="swap-face" data-side="old" min="0" step="1000" placeholder="例：200000">
      </label>
    </div>

    <div class="fund-card swap-side" data-side="new">
      <h3>② 新券（想換的）</h3>
      <div class="swap-search">
        <input type="text" class="swap-q" data-side="new" placeholder="輸入代碼或名稱關鍵字" autocomplete="off">
        <div class="swap-results" data-side="new" hidden></div>
      </div>
      <div class="swap-picked" data-side="new" hidden></div>
      <div class="swap-field swap-auto" data-auto="new">自動換算申購面額：<b data-auto-face>—</b>　交易後剩餘現金：<b data-auto-cash>—</b></div>
    </div>
  </div>

  <div class="swap-riskgate fund-card">
    <h3>看試算結果前，請先了解風險</h3>
    <ul class="swap-risklist">
      <li><b>利率風險：</b>利率上升時債券價格下跌，年期（存續期）越長，跌得越多。</li>
      <li><b>信用風險：</b>發行人財務惡化或違約，可能影響利息與本金。</li>
      <li><b>流動性／賣出價差：</b>買價與賣價有價差，提前賣出可能不利。</li>
      <li><b>匯率風險：</b>外幣計價，換回台幣可能因匯率產生損益。</li>
      <li><b>提前買回（Callable）：</b>發行人可能提前買回，影響預期報酬。</li>
      <li><b>再投資風險：</b>未來配息或到期資金，再投資利率可能較低。</li>
    </ul>
    <label class="swap-ack"><input type="checkbox" class="swap-ack-box"> 我已了解上述風險</label>
  </div>

  <div class="swap-output" hidden></div>
  `;
}

let SWAP_PICK = { old: null, new: null };

function _swapBondLabel(b) {
  return `${b.code || ""} ${b.name_zh || ""}`.trim() + (b.currency ? `（${b.currency}）` : "");
}
function _searchBonds(q) {
  const list = (DATA.obonds_all && DATA.obonds_all.bonds) || [];
  const s = (q || "").trim().toUpperCase();
  if (!s) return [];
  return list.filter(b =>
    (b.code || "").toUpperCase().includes(s) ||
    (b.name_zh || "").toUpperCase().includes(s) ||
    (b.isin || "").toUpperCase().includes(s)
  ).slice(0, 20);
}
function _swapMoney(n) {
  if (n == null || isNaN(n)) return "—";
  return Math.round(n).toLocaleString("en-US");
}
// 走勢示意：以現價(贖回參考價)＋週/月/季報酬反推 4 點（近3月→今日），非每日真實價格。
// 回傳 [{x, price, date}]，date 為報價基準日往前推 90/30/7 天（標「約」）。
function _swapSeries(b) {
  const price = b.ask_price;
  if (price == null) return [];
  const base = b.price_date ? new Date(b.price_date) : null;
  const hasBase = base && !isNaN(base.getTime());
  const fmtD = (ms, d) => {
    if (!hasBase) return d === 0 ? "今日" : `約 ${d} 天前`;
    const dt = new Date(ms), p = n => String(n).padStart(2, "0");
    return `約 ${dt.getFullYear()}/${p(dt.getMonth() + 1)}/${p(dt.getDate())}`;
  };
  const defs = [
    { d: 90, perf: b.perf_3m },
    { d: 30, perf: b.perf_1m },
    { d: 7, perf: b.perf_1w },
    { d: 0, perf: 0 },
  ];
  return defs
    .filter(p => p.d === 0 || p.perf != null)
    .map(p => ({
      x: (90 - p.d) / 90,
      price: p.d === 0 ? price : price / (1 + p.perf / 100),
      date: fmtD(hasBase ? base.getTime() - p.d * 86400000 : 0, p.d),
    }));
}

// 把一組點渲染成 SVG（含可滑過/點選的隱形大點，data-date/data-price 供 tooltip）
function _sparkSvg(pts, opts) {
  const o = opts || {};
  const W = o.W || 170, H = o.H || 44, pad = o.pad || 5;
  const stroke = o.stroke || "#2456b8", valKey = o.valKey || "price";
  if (pts.length < 2) return "";
  const ys = pts.map(p => p[valKey]);
  const lo = Math.min(...ys), hi = Math.max(...ys), span = (hi - lo) || 1;
  const X = x => pad + x * (W - 2 * pad);
  const Y = v => pad + (1 - (v - lo) / span) * (H - 2 * pad);
  const coords = pts.map(p => `${X(p.x).toFixed(1)},${Y(p[valKey]).toFixed(1)}`).join(" ");
  const dots = pts.map(p => {
    const cx = X(p.x).toFixed(1), cy = Y(p[valKey]).toFixed(1);
    return `<circle cx="${cx}" cy="${cy}" r="2.6" fill="${stroke}"/>`
      + `<circle class="swap-dot" cx="${cx}" cy="${cy}" r="9" fill="transparent" pointer-events="all" data-date="${escapeHtml(p.date)}" data-price="${p.price.toFixed(2)}"/>`;
  }).join("");
  return `<svg class="${o.cls || "swap-spark"}" viewBox="0 0 ${W} ${H}" width="${o.fullWidth ? "100%" : W}" height="${H}">`
    + `<polyline points="${coords}" fill="none" stroke="${stroke}" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>${dots}</svg>`;
}

function _swapSparkline(b) {
  const pts = _swapSeries(b);
  if (pts.length < 2) return `<div class="swap-spark-note">走勢資料不足</div>`;
  const stroke = pts[pts.length - 1].price >= pts[0].price ? "#d9534f" : "#2e9e5b"; // 台股紅漲綠跌
  const fmtP = v => (v == null ? "—" : v + "%");
  return `${_sparkSvg(pts, { stroke })}
    <div class="swap-spark-note">走勢示意（近 3 月）·依報酬推估，非每日真實價格 ｜ 週 ${fmtP(b.perf_1w)} 月 ${fmtP(b.perf_1m)} 季 ${fmtP(b.perf_3m)}</div>`;
}

// 兩檔近 3 月走勢對照：各自以 3 月前 = 100 重訂基準，疊在同一張圖
function _swapCompareSvg(oldB, newB) {
  const os = _swapSeries(oldB), ns = _swapSeries(newB);
  if (os.length < 2 || ns.length < 2) return "";
  const reb = s => { const b0 = s[0].price; return s.map(p => ({ x: p.x, v: p.price / b0 * 100, price: p.price, date: p.date })); };
  const ro = reb(os), rn = reb(ns);
  const all = [...ro, ...rn].map(p => p.v);
  const lo = Math.min(...all), hi = Math.max(...all), span = (hi - lo) || 1;
  const W = 300, H = 90, pad = 8;
  const X = x => pad + x * (W - 2 * pad);
  const Y = v => pad + (1 - (v - lo) / span) * (H - 2 * pad);
  const line = (s, color) => {
    const c = s.map(p => `${X(p.x).toFixed(1)},${Y(p.v).toFixed(1)}`).join(" ");
    const dots = s.map(p => `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="2.4" fill="${color}"/>`
      + `<circle class="swap-dot" cx="${X(p.x).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="9" fill="transparent" pointer-events="all" data-date="${escapeHtml(p.date)}" data-price="${p.price.toFixed(2)}"/>`).join("");
    return `<polyline points="${c}" fill="none" stroke="${color}" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round"/>${dots}`;
  };
  const OLD = "#2456b8", NEW = "#e08a00";
  return `
    <h3 style="margin-top:18px">兩檔近 3 月走勢對照</h3>
    <div class="swap-legend"><span><i style="background:${OLD}"></i>舊券</span><span><i style="background:${NEW}"></i>新券</span><span class="swap-legend-note">以 3 月前 = 100 重訂基準</span></div>
    <svg class="swap-compare" viewBox="0 0 ${W} ${H}" width="100%" height="${H}">${line(ro, OLD)}${line(rn, NEW)}</svg>
    <div class="swap-spark-note">依報酬推估，非每日真實價格；已重訂基準以利比較漲跌幅。滑過或點選圓點可看各時點價格。</div>`;
}

function _swapPickedHtml(b) {
  const f = (v, suf = "") => (v == null ? "—" : v + suf);
  const url = bondUrl(b);
  const link = url ? ` · <a href="${url}" target="_blank" rel="noopener">債券明細頁</a>` : "";
  return `<div class="swap-picked-name">${escapeHtml(_swapBondLabel(b))}${link}</div>
    <div class="swap-picked-meta">票面 ${f(b.coupon_pct, "%")} · 到期 ${escapeHtml(b.maturity || "—")} · 剩餘 ${f(b.years_to_maturity, " 年")} · 申購殖利率 ${f(b.bid_yield_pct, "%")} · 申購價 ${f(b.bid_price)} · 贖回價 ${f(b.ask_price)}</div>
    ${_swapSparkline(b)}`;
}

function _recalcSwap(root) {
  const out = root.querySelector(".swap-output");
  const ack = root.querySelector(".swap-ack-box");
  const oldB = SWAP_PICK.old, newB = SWAP_PICK.new;
  const faceEl = root.querySelector('.swap-face[data-side="old"]');
  const face = parseFloat(faceEl && faceEl.value) || 0;

  const autoFace = root.querySelector('[data-auto-face]');
  const autoCash = root.querySelector('[data-auto-cash]');
  let newFace = 0, proceeds = 0;
  if (oldB && face > 0 && oldB.ask_price) {
    proceeds = face * oldB.ask_price / 100;
  }
  if (newB && newB.bid_price && proceeds > 0) {
    newFace = Math.floor(proceeds / (newB.bid_price / 100) / 1000) * 1000;
    const cost = newFace * newB.bid_price / 100;
    if (autoFace) autoFace.textContent = _swapMoney(newFace);
    if (autoCash) autoCash.textContent = _swapMoney(proceeds - cost);
  } else {
    if (autoFace) autoFace.textContent = "—";
    if (autoCash) autoCash.textContent = "—";
  }

  if (!oldB || !newB || face <= 0 || !ack.checked) {
    out.hidden = true; out.innerHTML = ""; return;
  }

  const oldCoupon = face * (oldB.coupon_pct || 0) / 100;
  const newCoupon = newFace * (newB.coupon_pct || 0) / 100;
  const cmp = `
    <table class="indices swap-table"><thead><tr>
      <th class="cmp-th-l">項目</th><th>舊券</th><th>新券</th><th>差異</th>
    </tr></thead><tbody>
      <tr><td class="cmp-td-l">殖利率</td><td>${oldB.bid_yield_pct ?? "—"}%</td><td>${newB.bid_yield_pct ?? "—"}%</td><td>${((newB.bid_yield_pct||0)-(oldB.bid_yield_pct||0)).toFixed(2)}%</td></tr>
      <tr><td class="cmp-td-l">年領利息</td><td>${_swapMoney(oldCoupon)}</td><td>${_swapMoney(newCoupon)}</td><td>${_swapMoney(newCoupon-oldCoupon)}</td></tr>
      <tr><td class="cmp-td-l">剩餘年期</td><td>${oldB.years_to_maturity ?? "—"} 年</td><td>${newB.years_to_maturity ?? "—"} 年</td><td>${(((newB.years_to_maturity||0)-(oldB.years_to_maturity||0))).toFixed(2)} 年</td></tr>
    </tbody></table>`;

  const pnlCls = v => (v == null || isNaN(v)) ? "" : (v >= 0 ? "up" : "down");
  const scen = [-2, -1, 0, 1, 2].map(d => {
    const o = scenarioPnl(oldB, face, d);
    const n = scenarioPnl(newB, newFace, d);
    const tag = d < 0 ? "降息" : (d > 0 ? "升息" : "利率不變");
    return `<tr><td class="cmp-td-l">${d>0?"+":""}${d.toFixed(1)}%（${tag}）</td>
      <td class="${pnlCls(o)}">${_swapMoney(o)}</td><td class="${pnlCls(n)}">${_swapMoney(n)}</td></tr>`;
  }).join("");

  out.innerHTML = `
    <h3 style="margin-top:18px">換券比較</h3>${cmp}
    ${_swapCompareSvg(oldB, newB)}
    <h3 style="margin-top:18px">雙向利率情境（含一年利息之估計損益）</h3>
    <table class="indices swap-table"><thead><tr>
      <th class="cmp-th-l">殖利率變動</th><th>舊券</th><th>新券</th>
    </tr></thead><tbody>${scen}</tbody></table>
    <p class="swap-disclaimer">情境為以理論定價之簡化估計；年期越長，升息時跌幅越大。申購前請評估自身適合度並詳閱公開說明書與風險預告書。</p>`;
  out.hidden = false;
}

function _ensureSwapTip() {
  let t = document.getElementById("swap-tip");
  if (!t) {
    t = document.createElement("div");
    t.id = "swap-tip"; t.className = "swap-tip"; t.hidden = true;
    document.body.appendChild(t);
  }
  return t;
}

function wireObondsTabs() {
  const root = $("content");
  if (!root) return;
  // 走勢圖時點 tooltip：滑過（桌機）＋點選（手機）。#content 為常駐元素，避免重複綁定。
  if (!root._swapTipWired) {
    root._swapTipWired = true;
    const tip = _ensureSwapTip();
    const show = (dot, x, y) => {
      tip.textContent = `${dot.dataset.date} ｜ ${dot.dataset.price}`;
      tip.style.left = x + "px"; tip.style.top = (y - 10) + "px";
      tip.hidden = false;
    };
    const findDot = e => (e.target && e.target.closest) ? e.target.closest(".swap-dot") : null;
    root.addEventListener("mousemove", e => { const d = findDot(e); if (d) show(d, e.clientX, e.clientY); });
    root.addEventListener("mouseout", e => { if (findDot(e)) tip.hidden = true; });
    root.addEventListener("click", e => {
      const d = findDot(e);
      if (d) { const r = d.getBoundingClientRect(); show(d, r.left + r.width / 2, r.top); }
      else tip.hidden = true;
    });
  }
  root.querySelectorAll('.tab[data-otab]').forEach(btn => {
    btn.addEventListener("click", () => {
      const sel = btn.dataset.otab;
      root.querySelectorAll('.tab[data-otab]').forEach(b => b.classList.toggle("active", b === btn));
      root.querySelectorAll('.otab-panel').forEach(p => { p.hidden = p.dataset.otabPanel !== sel; });
    });
  });
  root.querySelectorAll('.swap-q').forEach(inp => {
    const side = inp.dataset.side;
    const box = root.querySelector(`.swap-results[data-side="${side}"]`);
    inp.addEventListener("input", () => {
      const matches = _searchBonds(inp.value);
      if (!matches.length) { box.hidden = true; box.innerHTML = ""; return; }
      const all = (DATA.obonds_all && DATA.obonds_all.bonds) || [];
      box.innerHTML = matches.map(b =>
        `<button type="button" class="swap-opt" data-idx="${all.indexOf(b)}">${escapeHtml(_swapBondLabel(b))}</button>`
      ).join("");
      box.hidden = false;
    });
  });
  root.querySelectorAll('.swap-results').forEach(box => {
    const side = box.dataset.side;
    box.addEventListener("click", e => {
      const opt = e.target.closest(".swap-opt");
      if (!opt) return;
      const list = (DATA.obonds_all && DATA.obonds_all.bonds) || [];
      const b = list[parseInt(opt.dataset.idx, 10)];
      if (!b) return;
      SWAP_PICK[side] = b;
      const picked = root.querySelector(`.swap-picked[data-side="${side}"]`);
      picked.innerHTML = _swapPickedHtml(b); picked.hidden = false;
      box.hidden = true; box.innerHTML = "";
      const inp = root.querySelector(`.swap-q[data-side="${side}"]`);
      if (inp) inp.value = _swapBondLabel(b);
      _recalcSwap(root);
    });
  });
  root.querySelectorAll('.swap-face, .swap-ack-box').forEach(el => {
    el.addEventListener("input", () => _recalcSwap(root));
    el.addEventListener("change", () => _recalcSwap(root));
  });
}

function renderBulletsOrText(content) {
  if (!content) return "—";
  if (Array.isArray(content)) {
    return `<ul style="margin:0;padding-left:20px;line-height:1.85">${content.map(c => `<li>${escapeHtml(c)}</li>`).join("")}</ul>`;
  }
  return escapeHtml(content);
}

function stanceChip(stance) {
  const label = stance === "OW" ? "加碼" : (stance === "UW" ? "減碼" : "中立");
  const cls = stance === "OW" ? "stance-ow" : (stance === "UW" ? "stance-uw" : "stance-nt");
  return `<span class="stance-pill ${cls}">${label}</span>`;
}

const THEME_INDEX_NAME = {
  "korea": "KOSPI",
  "japan": "Nikkei 225",
  "ai": "Nasdaq",
  "vietnam": null,
  "india": "Nifty 50",
  "gold": null,
  "bonds": null
};

function renderThemeFundsBlock(themeKey) {
  const tf = ((DATA.targets || {}).theme_funds || []).filter(f => f.theme === themeKey);
  if (!tf.length) return "";
  const cards = tf.map(f => {
    const name = f.bop_name_zh || f.name_zh || "";
    const nameHtml = f.source_url
      ? `<a href="${escapeHtml(f.source_url)}" target="_blank" rel="noopener">${escapeHtml(name)}</a>`
      : escapeHtml(name);
    const perf = f.perf || {};
    return `
    <div class="fund-card">
      <h3>${nameHtml}</h3>
      <div class="grid">
        <div>
          <label>淨值</label>
          ${fmtNum(f.nav)} ${escapeHtml(f.currency || "")}
        </div>
        <div><label>淨值日</label>${f.nav_date ? escapeHtml(shortDate(f.nav_date)) : "—"}</div>
        <div><label>日</label><span class="${pctClass(f.change_pct)}">${fmtPct(f.change_pct)}</span></div>
        <div><label>近1月</label><span class="${pctClass(perf['1m'])}">${perfLink(fmtPct(perf['1m']), f.source_url)}</span></div>
        <div><label>今年</label><span class="${pctClass(perf.ytd)}">${perfLink(fmtPct(perf.ytd), f.source_url)}</span></div>
      </div>
    </div>`;
  }).join("");
  return `
    <div class="t-section">
      <div class="t-section-head"><span class="t-section-icon">💰</span><span>相關基金績效</span></div>
      <div class="t-section-body">${cards}</div>
    </div>`;
}

function renderThemeIndexBlock(themeKey) {
  const idxName = THEME_INDEX_NAME[themeKey];
  if (!idxName) return "";
  const m = DATA.market || {};
  const ix = (m.indices || []).find(i => i.name === idxName);
  if (!ix) return "";
  const date = shortDate(ix.closing_date || m.closing_date);
  return `
    <div class="t-section">
      <div class="t-section-head"><span class="t-section-icon">📈</span><span>標的市場指數</span></div>
      <div class="t-section-body">
        <table class="indices" style="margin-top:6px">
          <thead><tr>
            <th>指數</th><th>收盤</th><th class="sortable-th">日</th><th class="sortable-th">本月</th><th class="sortable-th">今年</th><th class="date-col">收盤日</th>
          </tr></thead>
          <tbody><tr>
            <td>${indexLink(ix.name)}</td>
            <td>${fmtInt(ix.close)}</td>
            <td class="${pctClass(ix.daily_pct)}">${fmtPct(ix.daily_pct)}</td>
            <td class="${pctClass(ix.mtd_pct)}">${fmtPct(ix.mtd_pct)}</td>
            <td class="${pctClass(ix.ytd_pct)}">${fmtPct(ix.ytd_pct)}</td>
            <td class="date-col">${escapeHtml(date)}</td>
          </tr></tbody>
        </table>
      </div>
    </div>`;
}

// ─────────────────────────────────────────────────────────────────────────
// 資產配置 Asset Allocation Tab（合併 主題市場 + 投組分析）
// 上層 section 切換器在 主題市場 / 投組分析 之間切；各自再帶原本的次分頁。
// ─────────────────────────────────────────────────────────────────────────
function renderAllocSheet() {
  const isPortfolio = ALLOC_SUBTAB === "portfolio";
  const isAssist = ALLOC_SUBTAB === "assist";
  const isRetirement = ALLOC_SUBTAB === "retirement";
  const isInsGap = ALLOC_SUBTAB === "ins_gap";
  const isTargets = !isPortfolio && !isAssist && !isRetirement && !isInsGap;
  const inner = isPortfolio ? renderPortfolioSheet()
    : isAssist ? renderAssistSheet()
    : isRetirement ? renderRetirementSheet()
    : isInsGap ? renderInsuranceGapSheet()
    : renderTargetsSheet();
  return `
    <div class="tabs alloc-sec-tabs tabs-wrap">
      <button class="tab alloc-sec-tab ${isTargets ? "active" : ""}" data-asec="targets">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>
        </svg>
        <span>主題市場</span>
      </button>
      <button class="tab alloc-sec-tab ${isPortfolio ? "active" : ""}" data-asec="portfolio">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9"/><path d="M12 3v9h9"/><path d="M12 12L5.5 17"/>
        </svg>
        <span>投組分析</span>
      </button>
      <button class="tab alloc-sec-tab ${isRetirement ? "active" : ""}" data-asec="retirement">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 9l9-6 9 6v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
        <span>退休試算</span>
      </button>
      <button class="tab alloc-sec-tab ${isInsGap ? "active" : ""}" data-asec="ins_gap">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>保障缺口</span>
      </button>
      <button class="tab alloc-sec-tab ${isAssist ? "active" : ""}" data-asec="assist">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M21 12a8 8 0 0 1-11 7.4L4 21l1.6-6A8 8 0 1 1 21 12z"/>
          <circle cx="9" cy="11" r="0.6" fill="currentColor"/><circle cx="12" cy="11" r="0.6" fill="currentColor"/><circle cx="15" cy="11" r="0.6" fill="currentColor"/>
        </svg>
        <span>專屬規劃</span>
      </button>
    </div>
    <div class="alloc-sec-body" id="alloc-sec-body">${inner}</div>
  `;
}

function wireAllocTabs() {
  document.querySelectorAll(".tab[data-asec]").forEach(btn => {
    btn.addEventListener("click", () => {
      ALLOC_SUBTAB = btn.dataset.asec;
      rerenderAlloc();
    });
  });
  if (ALLOC_SUBTAB === "portfolio") wirePortfolioTabs();
  else if (ALLOC_SUBTAB === "assist") wireAssistTab();
  else if (ALLOC_SUBTAB === "retirement") wireRetirementTab();
  else if (ALLOC_SUBTAB === "ins_gap") wireInsuranceGapTab();
  else wireTargetsTabs();
}

function rerenderAlloc() {
  $("content").innerHTML = renderAllocSheet();
  wireAllocTabs();
}

function renderTargetsSheet() {
  const data = DATA.targets || {};
  const list = data.targets || [];
  if (!list.length) {
    return "<p style='color:var(--text-mute); padding:20px 0'>尚未提供主題市場清單</p>";
  }
  const summary = data.summary || {};
  const seq = data.entry_sequence || [];

  // 主題索引（用於建議順序排序）
  const byKey = {};
  list.forEach(t => { byKey[t.key] = t; });

  // 下拉選單依「市場重要性」排序：全球市場規模／配置權重
  const IMPORTANCE_ORDER = ["us", "ai", "bonds", "china", "europe", "japan", "gold", "india", "korea", "energy", "asean", "vietnam"];
  const orderIdx = k => { const i = IMPORTANCE_ORDER.indexOf(k); return i === -1 ? IMPORTANCE_ORDER.length : i; };
  const ordered = list.slice().sort((a, b) => orderIdx(a.key) - orderIdx(b.key));

  // 下拉選單（取代原本主題方格按鈕）
  const themeSelect = `
    <div class="t-select-wrap">
      <select class="t-select" id="t-select">
        ${ordered.map((t, i) => `<option value="${escapeHtml(t.key)}"${i === 0 ? " selected" : ""}>${escapeHtml(t.name)}</option>`).join("")}
      </select>
    </div>`;

  // Tab panes（不顯示編號）
  const panes = ordered.map((t, i) => {
    return `
    <div class="t-pane ${i === 0 ? "active" : ""}" id="t-pane-${escapeHtml(t.key)}">
      <div class="t-head">
        <div>
          <div class="t-name">${escapeHtml(t.name)}</div>
          <div class="t-tagline">${escapeHtml(t.tagline || "")}</div>
        </div>
      </div>

      ${renderThemeIndexBlock(t.key)}
      ${renderThemeFundsBlock(t.key)}

      <div class="t-section t-status">
        <div class="t-section-head"><span class="t-section-icon">📊</span><span>市場現況</span></div>
        <div class="t-section-body">${renderBulletsOrText(t.market_status || t.view)}</div>
      </div>

      <div class="t-section t-opp">
        <div class="t-section-head"><span class="t-section-icon">💡</span><span>投資機會</span></div>
        <div class="t-section-body">${renderBulletsOrText(t.opportunity || t.reason)}</div>
      </div>

      <div class="t-section t-pitch">
        <div class="t-section-head"><span class="t-section-icon">🎯</span><span>行銷話術</span></div>
        <div class="t-section-body">${renderBulletsOrText(t.pitch || t.action)}</div>
      </div>

      <details class="t-detail">
        <summary>進階：操作建議與加減碼觸發</summary>
        <div class="t-section">
          <div class="t-section-head"><span>內部觀點 VIEW</span></div>
          <div class="t-section-body">${escapeHtml(t.view || "—")}</div>
        </div>
        <div class="t-section">
          <div class="t-section-head"><span>理由 RATIONALE</span></div>
          <div class="t-section-body">${escapeHtml(t.reason || "—")}</div>
        </div>
        <div class="t-section">
          <div class="t-section-head"><span>操作 ACTION</span></div>
          <div class="t-section-body">${escapeHtml(t.action || "—")}</div>
        </div>
        <div class="t-triggers">
          <div class="t-trigger t-trigger-add"><strong>▲ 加碼觸發</strong>${escapeHtml(t.add_trigger || "—")}</div>
          <div class="t-trigger t-trigger-trim"><strong>▼ 減碼觸發</strong>${escapeHtml(t.trim_trigger || "—")}</div>
        </div>
      </details>
    </div>
  `;
  }).join("");

  return `
    ${themeSelect}
    <div class="t-panes">${panes}</div>
  `;
}


// ─────────────────────────────────────────────────────────────────────────
// 部位分析 Position Analysis Tab
// 教育示範用途；無 PII；標的池僅限站上既有清單；純前端計算 + localStorage
// ─────────────────────────────────────────────────────────────────────────

const POSITION_LS_KEY = "morningBoard.positionAnalysis.v1";
const ASSET_CLASS_COLOR = {
  "股票": "#019AB3",
  "債券": "#003D91",
  "平衡": "#17B5AD",
  "現金": "#9ca3af",
};
const CURRENCY_ZH = {
  "USD": "美元", "TWD": "台幣", "EUR": "歐元", "JPY": "日圓",
  "AUD": "澳幣", "GBP": "英鎊", "CNY": "人民幣", "RMB": "人民幣",
  "HKD": "港幣", "CHF": "瑞士法郎", "KRW": "韓元", "NZD": "紐幣",
  "SGD": "新幣", "CAD": "加幣", "ZAR": "南非幣",
  // 已經是中文的 passthrough
  "美元": "美元", "台幣": "台幣", "歐元": "歐元", "日圓": "日圓",
  "澳幣": "澳幣", "英鎊": "英鎊", "人民幣": "人民幣", "港幣": "港幣",
};
function positionCcyZh(code) {
  if (!code) return "—";
  return CURRENCY_ZH[code] || code;
}

let PORTFOLIO_SUBTAB = "preset";   // preset | custom
let POSITION_SELECTED_PRESET = null;
let POSITION_CUSTOM = [];          // [{kind, id|symbol|currency, weight}]
let POSITION_PENDING_ADD = { kind: "fund", ref: "", weight: "" };

function positionLookup(item) {
  // Returns { name, currency, category, perf, fund_type, kind, code }
  const kind = item.kind;
  if (kind === "fund") {
    const f = (DATA.funds?.funds || []).find(x => x.id === item.id);
    if (!f) return null;
    // fund JSON 將 5y 放在 perf_single（單筆累積），perf 物件不含 5y
    const fp = f.perf || {};
    const fps = f.perf_single || {};
    return {
      kind, name: f.name_zh, currency: positionCcyZh(f.currency || "美元"),
      category: f.category || "balanced",
      perf: {
        "1m": fp["1m"] ?? fps["1m"] ?? null,
        "3m": fp["3m"] ?? fps["3m"] ?? null,
        "6m": fp["6m"] ?? fps["6m"] ?? null,
        ytd: fp.ytd ?? fps.ytd ?? null,
        "1y": fp["1y"] ?? fps["1y"] ?? null,
        "3y": fp["3y"] ?? fps["3y"] ?? null,
        "5y": fps["5y"] ?? fp["5y"] ?? null,
      },
      fund_type: f.fund_type || "A",
      code: f.bop_code || f.id, fee_pct: f.fee_pct ?? null,
      yield_pct: f.distribution_yield_pct ?? null,
      url: f.bop_code ? `https://bopfund.moneydj.com/w/${f.fund_type === "A" ? "wr/wr902" : "wb/wb902"}.djhtm?a=${encodeURIComponent(f.bop_code)}` : null,
    };
  }
  if (kind === "bond") {
    const b = (DATA.obonds?.bonds || []).find(x => x.id === item.id);
    if (!b) return null;
    // 海外債資料源 IceBond API 僅提供 1週/1月/3月，無歷史價格序列。
    // YTD/1Y/3Y/5Y 一律 null（不推估、不假裝有資料）。
    return {
      kind, name: b.name_zh, currency: positionCcyZh(b.currency || "USD"),
      category: "bond",
      perf: {
        "1m": b.perf_1m ?? null,
        "3m": b.perf_3m ?? null,
        ytd: null,
        "1y": null,
        "3y": null,
        "5y": null,
      },
      code: b.code || b.id,
      yield_pct: b.bid_yield_pct ?? null,
      coupon_pct: b.coupon_pct ?? null,
      fee_pct: 0,
      url: bondUrl(b),
    };
  }
  if (kind === "us_stock" || kind === "tw_stock") {
    const src = kind === "us_stock" ? (DATA.stocks?.us_stocks || []) : (DATA.stocks?.tw_stocks || []);
    const s = src.find(x => x.symbol === item.symbol);
    if (!s) return null;
    const suffix = kind === "us_stock" ? ".US" : ".TW";
    return {
      kind, name: s.name_zh || s.symbol, currency: positionCcyZh(kind === "us_stock" ? "USD" : "TWD"),
      category: kind === "us_stock" ? "us_stock" : "tw_stock",
      perf: {
        ytd: s.ytd_pct ?? null,
        "1m": s.mtd_pct ?? null,
        "1y": s.perf_1y ?? null,
        "3y": s.perf_3y ?? null,
        "5y": s.perf_5y ?? null,
      },
      code: s.symbol, fee_pct: 0,
      url: `https://bopfund.moneydj.com/w/wj/iQuoteChart.djhtm?a=${encodeURIComponent(s.symbol + suffix)}`,
    };
  }
  if (kind === "cash") {
    const ccyZh = positionCcyZh(item.currency || "TWD");
    return { kind, name: `現金（${ccyZh}）`, currency: ccyZh,
      category: "cash", perf: {}, code: "CASH", fee_pct: 0, url: null };
  }
  return null;
}

function positionLinkName(meta) {
  const safe = escapeHtml(meta.name);
  if (!meta.url) return safe;
  return `<a href="${meta.url}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">${safe}</a>`;
}

function positionAssetClass(meta) {
  // 4-class bucket: 股票 / 債券 / 平衡 / 現金
  if (!meta) return "其他";
  if (meta.category === "cash") return "現金";
  if (meta.category === "bond" || meta.category === "income") return "債券";
  if (meta.category === "balanced") return "平衡";
  return "股票";
}

function positionNormalizedItems(items) {
  // Resolve items into [{item, meta, weight}], dropping any that no longer exist
  return items.map(it => {
    const meta = positionLookup(it);
    return meta ? { item: it, meta, weight: Number(it.weight) || 0 } : null;
  }).filter(Boolean);
}

function computeAllocation(resolved) {
  const byClass = {};
  const byCcy = {};
  resolved.forEach(({ meta, weight }) => {
    const cls = positionAssetClass(meta);
    byClass[cls] = (byClass[cls] || 0) + weight;
    byCcy[meta.currency] = (byCcy[meta.currency] || 0) + weight;
  });
  return { byClass, byCcy };
}

function computePerformance(resolved) {
  // 真實加權績效：分母 = 整個組合權重；缺值（如海外債長期、現金）視為 0 計入
  // 同步回傳覆蓋率，讓使用者知道有多少 % 部位是真實有資料
  const periods = ["ytd", "1y", "3y", "5y"];
  const totalW = resolved.reduce((s, r) => s + r.weight, 0) || 100;
  const result = {};
  periods.forEach(p => {
    let num = 0, dataW = 0;
    resolved.forEach(({ meta, weight }) => {
      const v = meta.perf?.[p];
      if (typeof v === "number") { num += v * weight; dataW += weight; }
    });
    result[p] = {
      value: totalW > 0 ? num / totalW : null,
      coverage: totalW > 0 ? dataW / totalW * 100 : 0,
    };
  });
  return result;
}

function computeRisk(resolved) {
  // HHI: weight fraction squared sum (max 1.0 = single holding)
  const totalW = resolved.reduce((s, r) => s + r.weight, 0) || 1;
  const hhi = resolved.reduce((s, r) => s + Math.pow(r.weight / totalW, 2), 0);

  // Concentration narrative: top asset class share
  const alloc = computeAllocation(resolved).byClass;
  const sortedCls = Object.entries(alloc).sort((a, b) => b[1] - a[1]);
  const topCls = sortedCls[0] || ["—", 0];

  // MDD proxy: weighted sum of |min(0, ytd)|; honest disclosure: estimate
  let mddProxy = 0;
  resolved.forEach(({ meta, weight }) => {
    const ytd = meta.perf?.ytd;
    if (typeof ytd === "number" && ytd < 0) mddProxy += Math.abs(ytd) * weight / 100;
    const half = meta.perf?.["6m"];
    if (typeof half === "number" && half < 0) {
      mddProxy = Math.max(mddProxy, Math.abs(half) * weight / 100);
    }
  });

  // 最弱 1Y 加權貢獻：找出 1Y 報酬最低（不管正負）的標的，看其加權貢獻
  // 用意：若有負報酬，揭示「歷史最壞情境」；若全正，揭示「最弱拉抬者」
  let weakest1y = null;       // 加權貢獻百分點
  let weakestName = null;
  let weakestRaw = null;       // 該標的本身的 1Y 報酬
  let mu1y = 0, muDenom = 0;  // 順手算 1Y 加權平均，供 VaR 用
  resolved.forEach(({ meta, weight }) => {
    const y = meta.perf?.["1y"];
    if (typeof y !== "number") return;
    const contrib = y * weight / 100;
    if (weakest1y === null || contrib < weakest1y) {
      weakest1y = contrib;
      weakestName = meta.name;
      weakestRaw = y;
    }
    mu1y += y * weight; muDenom += weight;
  });
  const mu = muDenom > 0 ? mu1y / muDenom : null;

  // 年化波動度粗估：資產類別 benchmark 加權（不考慮相關性，v2 從 NAV 時序精算）
  const VOL_BY_CLASS = { "股票": 18, "債券": 6, "平衡": 12, "現金": 1, "其他": 15 };
  let volProxy = 0;
  resolved.forEach(({ meta, weight }) => {
    const cls = positionAssetClass(meta);
    volProxy += (VOL_BY_CLASS[cls] || 15) * weight / 100;
  });

  // VaR 95% / 1Y 粗估：常態單尾 1.65σ - μ；若 μ ≥ 1.65σ 則無顯著下檔
  let var95 = null;
  if (mu !== null) {
    const v = 1.65 * volProxy - mu;
    var95 = v > 0 ? v : 0;
  }

  return { hhi, topCls, mddProxy, weakest1y, weakestName, weakestRaw, volProxy, var95 };
}

function computeCost(resolved) {
  // weighted fee_pct; if any holding lacks fee, fall back to 0 with a flag
  let num = 0, denom = 0, anyMissing = false;
  resolved.forEach(({ meta, weight }) => {
    if (meta.fee_pct === null || meta.fee_pct === undefined) {
      if (meta.kind === "fund") anyMissing = true;
    } else {
      num += meta.fee_pct * weight; denom += weight;
    }
  });
  const weighted = denom > 0 ? num / denom : null;
  return { weighted, anyMissing };
}

function detectOverlap(resolved) {
  const warnings = [];
  // 1) Same fund category > 50%
  const catSum = {};
  resolved.forEach(({ meta, weight }) => {
    if (meta.kind !== "fund") return;
    catSum[meta.category] = (catSum[meta.category] || 0) + weight;
  });
  Object.entries(catSum).forEach(([cat, sum]) => {
    if (sum > 50) {
      const names = resolved
        .filter(r => r.meta.kind === "fund" && r.meta.category === cat)
        .map(r => `${r.meta.name.slice(0, 14)}（${r.weight}%）`);
      warnings.push({
        kind: "same_category",
        msg: `「${cat}」類基金合計 ${sum}%，集中度偏高：${names.join("、")}`,
      });
    }
  });
  // 2) Same bop_code prefix (different share classes of same fund)
  const codePrefix = {};
  resolved.forEach(({ meta, weight }) => {
    if (meta.kind !== "fund" || !meta.code) return;
    const prefix = String(meta.code).slice(0, 6);
    (codePrefix[prefix] ||= []).push({ name: meta.name, weight });
  });
  Object.values(codePrefix).forEach(arr => {
    if (arr.length > 1) {
      warnings.push({
        kind: "same_fund",
        msg: `同一基金不同級別重複申購：${arr.map(a => `${a.name.slice(0, 14)}（${a.weight}%）`).join("、")}`,
      });
    }
  });
  return warnings;
}

function computeIncome(resolved) {
  // 加總所有「會配息」標的（海外債 + 配息型基金）的加權年化殖利率/配息率
  let yNum = 0, yWeight = 0;
  const breakdown = [];  // [{meta, kind, yield, weight}]
  const distFundUnknown = []; // fund_type B 但 distribution_yield_pct 為 null（累積型或缺資料）
  resolved.forEach(({ meta, weight }) => {
    if (meta.kind === "bond" && typeof meta.yield_pct === "number") {
      yNum += meta.yield_pct * weight; yWeight += weight;
      breakdown.push({ meta, kind: "bond", yield: meta.yield_pct, weight });
    } else if (meta.kind === "fund" && typeof meta.yield_pct === "number") {
      yNum += meta.yield_pct * weight; yWeight += weight;
      breakdown.push({ meta, kind: "fund", yield: meta.yield_pct, weight });
    } else if (meta.kind === "fund" && meta.fund_type === "B") {
      distFundUnknown.push(meta.name);
    }
  });
  const avgYield = yWeight > 0 ? yNum / yWeight : null;
  return { avgYield, yWeight, breakdown, distFundUnknown };
}

// SVG chart helpers ────────────────────────────────────────────────────────
function positionPieSvg(data, size = 180) {
  // data = { label: value, ... }
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0);
  if (total <= 0) return `<svg width="${size}" height="${size}"></svg>`;
  const cx = size / 2, cy = size / 2, r = size / 2 - 4;
  let acc = 0;
  const slices = entries.map(([label, v]) => {
    const start = acc / total * Math.PI * 2;
    acc += v;
    const end = acc / total * Math.PI * 2;
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = cx + Math.sin(start) * r, y1 = cy - Math.cos(start) * r;
    const x2 = cx + Math.sin(end) * r,   y2 = cy - Math.cos(end) * r;
    const color = ASSET_CLASS_COLOR[label] || "#7ec5d4";
    const d = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
    return `<path d="${d}" fill="${color}" stroke="#fff" stroke-width="1.5"></path>`;
  }).join("");
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="position-pie">${slices}</svg>`;
}

function positionBarsHtml(data, color = "#019AB3") {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  return entries.map(([label, v]) => `
    <div class="position-bar-row">
      <div class="position-bar-label">${escapeHtml(label)}</div>
      <div class="position-bar-track">
        <div class="position-bar-fill" style="width:${(v / max * 100).toFixed(1)}%;background:${ASSET_CLASS_COLOR[label] || color}"></div>
      </div>
      <div class="position-bar-val">${v.toFixed(1)}%</div>
    </div>
  `).join("");
}

// localStorage ──────────────────────────────────────────────────────────────
function positionLoadCustom() {
  try {
    const raw = localStorage.getItem(POSITION_LS_KEY);
    if (!raw) return [];
    const doc = JSON.parse(raw);
    if (doc.schema_version !== 1 || !Array.isArray(doc.portfolio)) return [];
    return doc.portfolio;
  } catch { return []; }
}

function positionSaveCustom(portfolio) {
  try {
    localStorage.setItem(POSITION_LS_KEY, JSON.stringify({
      schema_version: 1,
      saved_at: new Date().toISOString(),
      portfolio,
    }));
    return true;
  } catch { return false; }
}

function positionClearCustom() {
  try { localStorage.removeItem(POSITION_LS_KEY); } catch {}
}

// Renderers ─────────────────────────────────────────────────────────────────
function renderPortfolioSheet() {
  const presets = DATA.presets?.presets || [];
  if (!presets.length && POSITION_CUSTOM.length === 0) {
    POSITION_CUSTOM = positionLoadCustom();
  }
  const subtab = PORTFOLIO_SUBTAB;
  const isPreset = subtab === "preset";
  const isCustom = subtab === "custom";

  return `
    <div class="tabs">
      <button class="tab ${isPreset ? "active" : ""}" data-prtab="preset">預設組合</button>
      <button class="tab ${isCustom ? "active" : ""}" data-prtab="custom">自訂組合</button>
    </div>
    <div class="t-panes">
      <div class="t-pane ${isPreset ? "active" : ""}" id="pf-pane-preset">
        ${renderPositionPresetPane(presets)}
      </div>
      <div class="t-pane ${isCustom ? "active" : ""}" id="pf-pane-custom">
        ${renderPositionCustomPane()}
      </div>
    </div>
  `;
}

function renderPositionPresetPane(presets) {
  if (!presets.length) {
    return `<p style="color:var(--text-mute); padding:20px 0">預設組合資料尚未生成（請先跑 build）</p>`;
  }
  const cards = presets.map(p => {
    const isSel = POSITION_SELECTED_PRESET === p.id;
    return `
      <button class="position-preset-card ${isSel ? "selected" : ""}" data-preset="${escapeHtml(p.id)}">
        <div class="position-preset-name">${escapeHtml(p.name)}</div>
        <div class="position-preset-tag">${escapeHtml(p.tagline || "")}</div>
        <div class="position-preset-count">${p.items.length} 個標的</div>
      </button>
    `;
  }).join("");

  const selected = POSITION_SELECTED_PRESET
    ? presets.find(p => p.id === POSITION_SELECTED_PRESET)
    : null;

  return `
    <div class="position-preset-grid">${cards}</div>
    ${selected ? renderPositionAnalysisPanel(selected.items, `預設組合：${selected.name}`, true) : `
      <p style="color:var(--text-mute); padding:24px 0; text-align:center">
        ↑ 點任一卡片載入分析；4 組組合均為示範用 templates，非個人化建議
      </p>
    `}
  `;
}

function renderPositionCustomPane() {
  const items = POSITION_CUSTOM;
  return `
    <div class="position-composer">
      <div class="position-composer-row">
        <label>類別
          <select id="pc-kind">
            <option value="fund" ${POSITION_PENDING_ADD.kind === "fund" ? "selected" : ""}>基金</option>
            <option value="bond" ${POSITION_PENDING_ADD.kind === "bond" ? "selected" : ""}>海外債</option>
            <option value="us_stock" ${POSITION_PENDING_ADD.kind === "us_stock" ? "selected" : ""}>美股</option>
            <option value="tw_stock" ${POSITION_PENDING_ADD.kind === "tw_stock" ? "selected" : ""}>台股</option>
            <option value="cash" ${POSITION_PENDING_ADD.kind === "cash" ? "selected" : ""}>現金</option>
          </select>
        </label>
        <label class="position-composer-ref">標的
          <select id="pc-ref">${positionRefOptions(POSITION_PENDING_ADD.kind, POSITION_PENDING_ADD.ref)}</select>
        </label>
        <label>權重 %
          <input id="pc-weight" type="number" min="1" max="100" step="1" value="${POSITION_PENDING_ADD.weight}" placeholder="10">
        </label>
      </div>
      <div class="position-composer-addrow">
        <button class="position-btn primary large" id="pc-add">＋ 加入此標的</button>
        <div class="position-composer-hint">標的清單僅限站上既有資料；資料僅存於此瀏覽器，不會上傳。</div>
      </div>
    </div>
    ${renderPositionCustomList(items)}
    <div class="position-composer-actions">
      <button class="position-btn primary" id="pc-save">儲存到此瀏覽器</button>
      <button class="position-btn" id="pc-load">載入上次儲存</button>
      <button class="position-btn warn" id="pc-clear">清空</button>
    </div>
    ${items.length > 0 ? renderPositionAnalysisPanel(items, "你的自訂組合", false) : `
      <p style="color:var(--text-mute); padding:24px 0; text-align:center">
        ↑ 加入至少一個標的後即可看到分析
      </p>
    `}
  `;
}

function positionRefOptions(kind, currentRef) {
  if (kind === "fund") {
    return (DATA.funds?.funds || []).map(f =>
      `<option value="${escapeHtml(f.id)}" ${f.id === currentRef ? "selected" : ""}>${escapeHtml(f.name_zh)}</option>`
    ).join("");
  }
  if (kind === "bond") {
    return (DATA.obonds?.bonds || []).map(b =>
      `<option value="${escapeHtml(b.id)}" ${b.id === currentRef ? "selected" : ""}>${escapeHtml(b.name_zh)}</option>`
    ).join("");
  }
  if (kind === "us_stock") {
    return (DATA.stocks?.us_stocks || []).map(s =>
      `<option value="${escapeHtml(s.symbol)}" ${s.symbol === currentRef ? "selected" : ""}>${escapeHtml(s.name_zh || s.symbol)}（${escapeHtml(s.symbol)}）</option>`
    ).join("");
  }
  if (kind === "tw_stock") {
    return (DATA.stocks?.tw_stocks || []).map(s =>
      `<option value="${escapeHtml(s.symbol)}" ${s.symbol === currentRef ? "selected" : ""}>${escapeHtml(s.name_zh || s.symbol)}（${escapeHtml(s.symbol)}）</option>`
    ).join("");
  }
  if (kind === "cash") {
    return ["TWD", "USD"].map(c =>
      `<option value="${c}" ${c === currentRef ? "selected" : ""}>${c}</option>`
    ).join("");
  }
  return "";
}

function renderPositionCustomList(items) {
  if (!items.length) {
    return `<p style="color:var(--text-mute); padding:8px 0">尚未加入任何標的</p>`;
  }
  const rows = items.map((it, idx) => {
    const meta = positionLookup(it);
    const name = meta ? meta.name : `<span style="color:var(--ph-bad,#d62828)">(已下架：${escapeHtml(it.id || it.symbol || it.currency || "")})</span>`;
    return `
      <tr>
        <td>${name}</td>
        <td><input type="number" min="0" max="100" step="1" value="${it.weight}" data-idx="${idx}" class="position-list-weight" style="width:60px"> %</td>
        <td><button class="position-btn small" data-del="${idx}">刪除</button></td>
      </tr>
    `;
  }).join("");
  const total = items.reduce((s, x) => s + Number(x.weight || 0), 0);
  const totalCls = total === 100 ? "ok" : "warn";
  return `
    <table class="position-list">
      <thead><tr><th>標的</th><th style="width:130px">權重</th><th style="width:70px">操作</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot><tr><td>合計</td><td class="position-total ${totalCls}">${total}%</td><td></td></tr></tfoot>
    </table>
  `;
}

function renderPositionAnalysisPanel(items, title, isPreset) {
  const resolved = positionNormalizedItems(items);
  if (!resolved.length) {
    return `<div class="position-analysis"><p>找不到任何有效標的（資料可能尚未載入）</p></div>`;
  }
  const alloc = computeAllocation(resolved);
  const perf = computePerformance(resolved);
  const risk = computeRisk(resolved);
  const overlaps = detectOverlap(resolved);
  const income = computeIncome(resolved);

  const constituentRows = resolved.map(({ meta, weight }) => `
    <tr>
      <td>${positionLinkName(meta)}</td>
      <td>${escapeHtml(positionAssetClass(meta))}</td>
      <td>${escapeHtml(meta.currency || "—")}</td>
      <td style="text-align:right">${weight}%</td>
    </tr>
  `).join("");

  return `
    <div class="position-analysis">
      <h3 class="position-analysis-title">${escapeHtml(title)}</h3>

      <details class="position-block" open>
        <summary>① 構成清單（${resolved.length} 個標的）</summary>
        <table class="position-constituents">
          <thead><tr><th>標的</th><th>類別</th><th>幣別</th><th style="text-align:right">權重</th></tr></thead>
          <tbody>${constituentRows}</tbody>
        </table>
      </details>

      <details class="position-block" open>
        <summary>② 配置現況</summary>
        <div class="position-alloc-grid">
          <div class="position-alloc-pie">
            ${positionPieSvg(alloc.byClass)}
            <div class="position-alloc-legend">
              ${Object.entries(alloc.byClass).map(([k, v]) => `
                <div><span class="position-legend-dot" style="background:${ASSET_CLASS_COLOR[k] || "#7ec5d4"}"></span>${escapeHtml(k)} ${v.toFixed(1)}%</div>
              `).join("")}
            </div>
          </div>
          <div class="position-alloc-bars">
            <h4>幣別曝險</h4>
            ${positionBarsHtml(alloc.byCcy)}
          </div>
        </div>
      </details>

      <details class="position-block" open>
        <summary>③ 績效歷史</summary>

        <h4 class="position-subhead">個別標的</h4>
        <div class="position-perf-fxnote">績效以各標的<b>本幣計價</b>計算（NAV/價格漲跌幅），未調整為台幣等值；對台幣投資人實際換回台幣的報酬會因匯率變動而不同。</div>
        <div class="position-perf-scroll">
          <table class="position-perf position-perf-each">
            <thead>
              <tr>
                <th>標的</th>
                <th style="text-align:right">權重</th>
                <th style="text-align:right">今年以來</th>
                <th style="text-align:right">近 1 年</th>
                <th style="text-align:right">近 3 年</th>
                <th style="text-align:right">近 5 年</th>
              </tr>
            </thead>
            <tbody>
              ${resolved.map(({ meta, weight }) => `
                <tr>
                  <td>${positionLinkName(meta)}</td>
                  <td style="text-align:right">${weight}%</td>
                  <td class="${pctClass(meta.perf?.ytd)}" style="text-align:right">${fmtPct(meta.perf?.ytd)}</td>
                  <td class="${pctClass(meta.perf?.["1y"])}" style="text-align:right">${fmtPct(meta.perf?.["1y"])}</td>
                  <td class="${pctClass(meta.perf?.["3y"])}" style="text-align:right">${fmtPct(meta.perf?.["3y"])}</td>
                  <td class="${pctClass(meta.perf?.["5y"])}" style="text-align:right">${fmtPct(meta.perf?.["5y"])}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <h4 class="position-subhead">綜合績效（本幣加權，依完整組合權重；缺值以 0 計入）</h4>
        <div class="position-perf-fxnote">本表為<b>各標的本幣報酬之加權平均</b>，未調整為台幣等值；組合內含外幣部位時，台幣投資人實際換回台幣的報酬會因匯率變動而不同。</div>
        <table class="position-perf">
          <thead><tr><th>期間</th><th>你的組合</th><th>資料覆蓋率</th></tr></thead>
          <tbody>
            ${[
              ["ytd", "今年以來"],
              ["1y",  "近 1 年"],
              ["3y",  "近 3 年"],
              ["5y",  "近 5 年"],
            ].map(([k, label]) => {
              const o = perf[k] || {};
              const v = o.value;
              const cov = o.coverage ?? 0;
              const covCls = cov >= 80 ? "" : cov >= 50 ? "position-cov-warn" : "position-cov-bad";
              return `<tr>
                <td>${label}</td>
                <td class="${pctClass(v)}">${v === null ? "—" : fmtPct(v)}</td>
                <td class="${covCls}">${cov.toFixed(1)}%${cov < 100 ? "（其餘以 0 計入）" : ""}</td>
              </tr>`;
            }).join("")}
          </tbody>
        </table>
        <p class="position-foot">
          綜合績效採完整組合權重加權（分母 = 100%）。資料覆蓋率 = 該期間有真實績效資料的部位占比；其餘部位（如海外債長期、現金）以 0% 計入，故結果為<b>下界估算</b>，實際整體表現可能更高。海外債資料源僅提供 1 週/1 月/3 月之短期報酬，無長期歷史價格序列。<b>所有數字均以各標的本幣計算，未調整匯率變動</b>；歷史表現非未來保證；組合假設權重維持不變、不含交易成本。
        </p>
      </details>

      <details class="position-block" open>
        <summary>④ 風險</summary>
        <div class="position-metric-grid">
          <div class="position-metric">
            <div class="position-metric-label">年化波動度</div>
            <div class="position-metric-val">${risk.volProxy.toFixed(1)}%</div>
            <div class="position-metric-note">採資產類別 benchmark 加權（粗估）</div>
          </div>
        </div>
        <p class="position-foot">年化波動度為估算值（依資產類別 benchmark 加權、未含標的間相關性）；後續將從歷史淨值時序精算。</p>
      </details>

      ${overlaps.length ? `
        <details class="position-block position-warn" open>
          <summary>⑤ 重疊提醒</summary>
          ${overlaps.map(w => `<div class="position-warn-card">${escapeHtml(w.msg)}</div>`).join("")}
        </details>
      ` : ""}

      ${(income.avgYield !== null || income.distFundUnknown.length) ? `
        <details class="position-block" open>
          <summary>⑥ 配息現金流</summary>
          ${income.avgYield !== null ? `
            <p>配息部位加權平均殖利率：<b>${income.avgYield.toFixed(1)}%</b>（佔組合 ${income.yWeight}%）</p>
            <p>估算 1 年配息（以該部位 NT$ 100 萬本金）：<b>${Number(income.avgYield * 10000).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} 元</b></p>
            <table class="position-perf" style="margin-top:8px">
              <thead><tr><th>標的</th><th>類別</th><th style="text-align:right">權重</th><th style="text-align:right">年化殖利率</th></tr></thead>
              <tbody>
                ${income.breakdown.map(b => `
                  <tr>
                    <td>${positionLinkName(b.meta)}</td>
                    <td>${b.kind === "bond" ? "海外債（YTM）" : "配息型基金"}</td>
                    <td style="text-align:right">${b.weight}%</td>
                    <td style="text-align:right" class="up">${b.yield.toFixed(1)}%</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          ` : ""}
          ${income.distFundUnknown.length ? `
            <p class="position-foot">另有 ${income.distFundUnknown.length} 支國內基金或無配息資料的標的未計入。</p>
          ` : ""}
          <p class="position-foot">部分配息可能來自本金（依金管會配息揭露規定，請參閱各基金說明書）；海外債採到期殖利率（YTM）、配息基金採近 12 月配息加總／當日 NAV。</p>
        </details>
      ` : ""}

      ${isPreset ? `
        <div class="position-handoff">
          <button class="position-btn primary" data-copy-preset>複製此組合到「自訂組合」當基底 ⇒</button>
        </div>
      ` : ""}
    </div>
  `;
}

function rerenderPortfolio() {
  // 投組分析現在內嵌於「資產配置」；只重畫內層 body，保留上層 section 切換器
  const host = document.getElementById("alloc-sec-body") || $("content");
  host.innerHTML = renderPortfolioSheet();
  wirePortfolioTabs();
}

function wirePortfolioTabs() {
  // Subtab switching (預設組合 / 自訂組合)
  document.querySelectorAll(".tab[data-prtab]").forEach(btn => {
    btn.addEventListener("click", () => {
      PORTFOLIO_SUBTAB = btn.dataset.prtab;
      rerenderPortfolio();
    });
  });

  // 預設組合 / 自訂組合 共用以下事件
  document.querySelectorAll(".position-preset-card").forEach(btn => {
    btn.addEventListener("click", () => {
      POSITION_SELECTED_PRESET = btn.dataset.preset;
      rerenderPortfolio();
      const a = document.querySelector(".position-analysis");
      if (a) a.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  document.querySelectorAll("[data-copy-preset]").forEach(btn => {
    btn.addEventListener("click", () => {
      const presets = DATA.presets?.presets || [];
      const p = presets.find(x => x.id === POSITION_SELECTED_PRESET);
      if (!p) return;
      POSITION_CUSTOM = p.items.map(it => ({ ...it }));
      PORTFOLIO_SUBTAB = "custom";
      rerenderPortfolio();
    });
  });

  // 自訂組合 composer
  const kindSel = document.getElementById("pc-kind");
  if (kindSel) {
    kindSel.addEventListener("change", () => {
      POSITION_PENDING_ADD.kind = kindSel.value;
      POSITION_PENDING_ADD.ref = "";
      POSITION_PENDING_ADD.weight = document.getElementById("pc-weight")?.value || "";
      rerenderPortfolio();
    });
  }
  const refSel = document.getElementById("pc-ref");
  if (refSel) {
    refSel.addEventListener("change", () => { POSITION_PENDING_ADD.ref = refSel.value; });
  }
  const wInput = document.getElementById("pc-weight");
  if (wInput) {
    wInput.addEventListener("input", () => { POSITION_PENDING_ADD.weight = wInput.value; });
  }

  const addBtn = document.getElementById("pc-add");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const kindEl = document.getElementById("pc-kind");
      const refEl = document.getElementById("pc-ref");
      const wEl = document.getElementById("pc-weight");
      const kind = kindEl?.value;
      const ref = refEl?.value;
      const weight = Number(wEl?.value);
      if (!kind || !ref || !weight || weight <= 0) {
        alert("請填齊類別、標的、權重");
        return;
      }
      const newItem = { kind, weight };
      if (kind === "cash") newItem.currency = ref;
      else if (kind === "us_stock" || kind === "tw_stock") newItem.symbol = ref;
      else newItem.id = ref;
      POSITION_CUSTOM.push(newItem);
      POSITION_PENDING_ADD.weight = "";
      rerenderPortfolio();
      // Scroll to the newly added row for visual confirmation
      const rows = document.querySelectorAll(".position-list tbody tr");
      const last = rows[rows.length - 1];
      if (last) last.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  // Inline weight edits
  document.querySelectorAll(".position-list-weight").forEach(input => {
    input.addEventListener("change", () => {
      const idx = Number(input.dataset.idx);
      const v = Number(input.value);
      if (POSITION_CUSTOM[idx]) {
        POSITION_CUSTOM[idx].weight = v;
        rerenderPortfolio();
      }
    });
  });

  document.querySelectorAll("[data-del]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.del);
      POSITION_CUSTOM.splice(idx, 1);
      rerenderPortfolio();
    });
  });

  const saveBtn = document.getElementById("pc-save");
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      const ok = positionSaveCustom(POSITION_CUSTOM);
      alert(ok ? "已儲存到此瀏覽器" : "儲存失敗（可能無 localStorage 權限）");
    });
  }
  const loadBtn = document.getElementById("pc-load");
  if (loadBtn) {
    loadBtn.addEventListener("click", () => {
      POSITION_CUSTOM = positionLoadCustom();
      rerenderPortfolio();
    });
  }
  const clearBtn = document.getElementById("pc-clear");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (!confirm("確定清空目前的自訂組合？")) return;
      POSITION_CUSTOM = [];
      positionClearCustom();
      POSITION_SELECTED_PRESET = null;
      rerenderPortfolio();
    });
  }
}

function wireTargetsTabs() {
  const sel = document.getElementById("t-select");
  if (!sel) return;
  sel.addEventListener("change", () => {
    const key = sel.value;
    document.querySelectorAll(".t-pane").forEach(p => {
      p.classList.toggle("active", p.id === `t-pane-${key}`);
    });
  });
}

function renderInsuranceSheet() {
  const list = (DATA.insurance && DATA.insurance.insurances) || [];
  if (!list.length) {
    return "<p style='color:var(--text-mute); padding:20px 0'>尚未提供保險商品清單</p>";
  }
  return list.map(it => {
    const nameHtml = it.source_url
      ? `<a href="${it.source_url}" target="_blank" rel="noopener">${escapeHtml(it.name_zh)}</a>`
      : escapeHtml(it.name_zh);
    const chips = [currencyChip(it.currency), typeChip(it.type)].join("");
    return `
    <div class="fund-card">
      <h3>${nameHtml}</h3>
      <div style="margin-bottom:6px">${chips}</div>
      <p class="tagline">${escapeHtml(it.tagline || "")}</p>
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; font-size:15px; margin-top:8px">
        <div><label style="display:block; font-size:13px; color:var(--text-mute); margin-bottom:2px">公司</label>${escapeHtml(it.company || "—")}</div>
        <div><label style="display:block; font-size:13px; color:var(--text-mute); margin-bottom:2px">類型</label>${escapeHtml(it.type || "—")}</div>
        <div><label style="display:block; font-size:13px; color:var(--text-mute); margin-bottom:2px">幣別</label>${escapeHtml(it.currency || "—")}</div>
        <div><label style="display:block; font-size:13px; color:var(--text-mute); margin-bottom:2px">期間</label>${escapeHtml(it.term || "—")}</div>
      </div>
      ${(it.highlights && it.highlights.length) ? `
        <ul style="margin:10px 0 0; padding-left:18px; font-size:15px; line-height:1.7">
          ${it.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join("")}
        </ul>` : ""}
    </div>
  `;
  }).join("");
}

// 指數卡：手機版取代擁擠的 .indices 表。stats = [{k, v, cls}]
function renderIndexCard({ nameHtml, priceHtml, stats }) {
  const st = stats.map(s =>
    `<div class="idx-st"><div class="k">${s.k}</div><div class="v ${s.cls || ""}">${s.v}</div></div>`
  ).join("");
  return `
    <div class="idx-card">
      <div class="idx-top"><span class="idx-nm">${nameHtml}</span><span class="idx-px">${priceHtml}</span></div>
      <div class="idx-stats">${st}</div>
    </div>`;
}
function renderIndexCards(cards) {
  if (!cards.length) return "";
  return `<div class="idx-cards">${cards.map(renderIndexCard).join("")}</div>`;
}

// ── 即時行情分頁 ──────────────────────────────────────────────
// 全球主要指數 → TradingView symbol（即時 widget 用）。
// tv 為 null 者改用後備外部連結（TradingView 個別商品頁）。
// 順序對齊「全球市場」market.json indices。
const LIVE_INDICES = [
  { zh: "標普500",   yahoo: "S&P 500",          tv: "SP:SPX" },
  { zh: "那斯達克",   yahoo: "Nasdaq Composite", tv: "NASDAQ:IXIC" },
  { zh: "道瓊工業",   yahoo: "Dow Jones",        tv: "DJ:DJI" },
  { zh: "費城半導體", yahoo: "PHLX Semiconductor", tv: "NASDAQ:SOX" },
  { zh: "歐洲50",     yahoo: "Euro Stoxx 50",    tv: "TVC:SX5E" },
  { zh: "德國DAX",    yahoo: "DAX",              tv: "XETR:DAX" },
  { zh: "英國FTSE",   yahoo: "FTSE 100",         tv: "TVC:UKX" },
  { zh: "法國CAC",    yahoo: "CAC 40",           tv: "EURONEXT:PX1" },
  { zh: "日經225",    yahoo: "Nikkei 225",       tv: "TVC:NI225" },
  { zh: "台股加權",   yahoo: "TAIEX 加權指數",   tv: "TWSE:TAIEX" },
  { zh: "櫃買指數",   yahoo: "OTC 櫃買加權",     tv: "TPEX:TPEx" },
  { zh: "台指期近",   yahoo: "台指期(近月)",     tv: "TAIFEX:TXF1!" },
  { zh: "韓國綜合",   yahoo: "KOSPI",            tv: "KRX:KOSPI" },
  { zh: "恆生指數",   yahoo: "Hang Seng 恆生",   tv: "HSI:HSI" },
  { zh: "上證指數",   yahoo: "Shanghai 上證",    tv: "SSE:000001" },
  { zh: "滬深300",    yahoo: "CSI 300 滬深300",  tv: "SSE:000300" },
  { zh: "印度Nifty",  yahoo: "Nifty 50",         tv: "NSE:NIFTY" },
  { zh: "澳洲200",    yahoo: "S&P/ASX 200",      tv: "ASX:XJO" },
];

function renderLiveSheet() {
  const cards = LIVE_INDICES.map((idx, i) => {
    if (idx.tv) {
      return `
        <div class="card live-card">
          <h2 class="live-name">${escapeHtml(idx.zh)}</h2>
          <div class="live-chart" data-tv="${escapeHtml(idx.tv)}" data-i="${i}"></div>
        </div>`;
    }
    // 後備：無即時 widget 的指數改放外部即時行情連結
    const url = indexQuoteUrl(idx.yahoo);
    const link = url
      ? `<a href="${url}" target="_blank" rel="noopener" class="live-fallback-link">點此看即時行情</a>`
      : `<span class="live-fallback-link muted">暫無即時行情</span>`;
    return `
      <div class="card live-card">
        <h2 class="live-name">${escapeHtml(idx.zh)}</h2>
        <div class="live-fallback">${link}</div>
      </div>`;
  }).join("");
  return `
    <section class="sheet live-sheet">
      <p class="live-intro">全球主要指數即時走勢，於本頁開啟即由瀏覽器即時更新。</p>
      <div class="live-grid">${cards}</div>
      <p class="live-credit">行情由 TradingView 提供，僅供參考，非投資建議或要約。</p>
    </section>`;
}

// 為每個 .live-chart 容器注入 TradingView mini-symbol-overview widget。
// SPA 以 innerHTML 重畫不會執行內嵌 <script>，故在此動態建立 script 元素。
function wireLive() {
  const containers = document.querySelectorAll(".live-chart[data-tv]");
  containers.forEach(el => {
    const symbol = el.getAttribute("data-tv");
    el.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "tradingview-widget-container";
    wrap.style.height = "100%";
    wrap.style.width = "100%";
    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    widget.style.height = "100%";
    widget.style.width = "100%";
    wrap.appendChild(widget);
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.textContent = JSON.stringify({
      symbol: symbol,
      width: "100%",
      height: "100%",
      locale: "zh_TW",
      dateRange: "1D",
      colorTheme: "light",
      isTransparent: true,
      autosize: true,
      largeChartUrl: "",
      chartOnly: false,
    });
    wrap.appendChild(script);
    el.appendChild(wrap);
  });
}

function renderMarketSheet() {
  // Normalize: handle both built format (indices/yield_pct) and raw fetch format (equity/yield)
  const _raw = DATA.market || {};
  const m = {
    ..._raw,
    closing_date: _raw.closing_date || _raw.primary_closing_date,
    indices: _raw.indices || _raw.equity || [],
    bonds: (_raw.bonds || []).map(b => ({
      ...b,
      yield_pct: b.yield_pct != null ? b.yield_pct : b.yield,
    })),
    fx: _raw.fx || [],
    commodities: _raw.commodities || [],
    summary: _raw.summary || null,
  };
  const date = shortDate(m.closing_date);
  const rows = m.indices.map(i => `
    <tr>
      <td>${indexLink(i.name)}${indexQuoteLink(i.name)}</td>
      <td>${fmtInt(i.close)}</td>
      <td class="${pctClass(i.daily_pct)}">${fmtPct(i.daily_pct)}</td>
      <td class="${pctClass(i.mtd_pct)}">${fmtPctIdx(i.mtd_pct, i)}</td>
      <td class="${pctClass(i.ytd_pct)}">${fmtPctIdx(i.ytd_pct, i)}</td>
      <td class="date-col">${escapeHtml(shortDate(i.closing_date) || date)}</td>
    </tr>
  `).join("");
  const indexCards = renderIndexCards(m.indices.map(i => ({
    nameHtml: `${indexLink(i.name)}${indexQuoteLink(i.name)}`,
    priceHtml: fmtInt(i.close),
    stats: [
      { k: "日", v: fmtPct(i.daily_pct), cls: pctClass(i.daily_pct) },
      { k: "本月", v: fmtPctIdx(i.mtd_pct, i), cls: pctClass(i.mtd_pct) },
      { k: "今年", v: fmtPctIdx(i.ytd_pct, i), cls: pctClass(i.ytd_pct) },
    ],
  })));
  // 2026-05-25：Japan / UK 10Y 無免費日頻率資料源，daily/MTD bps 顯式標 n/a* + tooltip
  const spotOnlyBonds = new Set(["Japan 10Y", "Japan 10-Year", "UK 10Y", "UK 10-Year"]);
  const bondRows = (m.bonds || []).map(b => {
    const isSpotOnly = spotOnlyBonds.has(b.name);
    const tip = isSpotOnly
      ? '無免費日頻率資料源（Yahoo/FRED/ECB 均無），僅取即時殖利率'
      : '';
    const dailyCell = (isSpotOnly && b.daily_bps == null)
      ? `<span title="${tip}" style="color:#94a3b8; cursor:help;">n/a*</span>`
      : `<span class="${bpsClass(b.daily_bps)}">${fmtBps(b.daily_bps)}</span>`;
    const mtdCell = (isSpotOnly && b.mtd_bps == null)
      ? `<span title="${tip}" style="color:#94a3b8; cursor:help;">n/a*</span>`
      : `<span class="${bpsClass(b.mtd_bps)}">${fmtBps(b.mtd_bps)}</span>`;
    return `
    <tr>
      <td>${bondLink(b.name)}${bondQuoteLink(b.name)}</td>
      <td>${b.yield_pct != null ? b.yield_pct.toFixed(1) + "%" : "—"}</td>
      <td>${dailyCell}</td>
      <td>${mtdCell}</td>
      <td class="date-col">${escapeHtml(shortDate(b.closing_date) || date)}</td>
    </tr>
  `;}).join("");
  const bondCards = renderIndexCards((m.bonds || []).map(b => {
    const isSpotOnly = spotOnlyBonds.has(b.name);
    const tip = isSpotOnly ? '無免費日頻率資料源（Yahoo/FRED/ECB 均無），僅取即時殖利率' : '';
    const dailyV = (isSpotOnly && b.daily_bps == null)
      ? `<span title="${tip}" style="color:#94a3b8;cursor:help">n/a*</span>`
      : `<span class="${bpsClass(b.daily_bps)}">${fmtBps(b.daily_bps)}</span>`;
    const mtdV = (isSpotOnly && b.mtd_bps == null)
      ? `<span title="${tip}" style="color:#94a3b8;cursor:help">n/a*</span>`
      : `<span class="${bpsClass(b.mtd_bps)}">${fmtBps(b.mtd_bps)}</span>`;
    return {
      nameHtml: `${bondLink(b.name)}${bondQuoteLink(b.name)}`,
      priceHtml: b.yield_pct != null ? b.yield_pct.toFixed(1) + "%" : "—",
      stats: [ { k: "日變動", v: dailyV }, { k: "本月變動", v: mtdV } ],
    };
  }));

  const fxRows = (m.fx || []).map(f => `
    <tr>
      <td>${fxLink(f.name)}${fxQuoteLink(f.name)}</td>
      <td>${f.close != null ? f.close.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "—"}</td>
      <td class="${pctClass(f.daily_pct)}">${fmtPct(f.daily_pct)}</td>
      <td class="${pctClass(f.mtd_pct)}">${fmtPct(f.mtd_pct)}</td>
      <td class="${pctClass(f.ytd_pct)}">${fmtPct(f.ytd_pct)}</td>
      <td class="date-col">${escapeHtml(shortDate(f.closing_date) || date)}</td>
    </tr>
  `).join("");
  const fxCards = renderIndexCards((m.fx || []).map(f => ({
    nameHtml: `${fxLink(f.name)}${fxQuoteLink(f.name)}`,
    priceHtml: f.close != null ? f.close.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "—",
    stats: [
      { k: "日", v: fmtPct(f.daily_pct), cls: pctClass(f.daily_pct) },
      { k: "本月", v: fmtPct(f.mtd_pct), cls: pctClass(f.mtd_pct) },
      { k: "今年", v: fmtPct(f.ytd_pct), cls: pctClass(f.ytd_pct) },
    ],
  })));

  const usStocks = DATA.stocks?.us_stocks || [];
  const twStocks = DATA.stocks?.tw_stocks || [];

  // 商品期貨：取用戶指定的三檔（倫敦布蘭特 / 紐約 WTI / 現貨黃金）
  // sym = Yahoo Finance 代碼，供名稱連結＋即時行情頁（與指數列同一套點擊行為）
  const COMMODITY_DISPLAY = [
    { match: "布蘭特", label: "倫敦原油期貨", sub: "Brent (USD/bbl)", sym: "BZ=F" },
    { match: "WTI", label: "紐約原油期貨", sub: "WTI (USD/bbl)", sym: "CL=F" },
    { match: "黃金", label: "現貨黃金", sub: "Gold (USD/oz)", sym: "GC=F" },
  ];
  const commodityLink = (cd) => {
    const url = `https://finance.yahoo.com/quote/${encodeURIComponent(cd.sym)}/`;
    return `<a href="${url}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">${escapeHtml(cd.label)}</a>${quoteSuffix(url)}`;
  };
  const commodities = m.commodities || [];
  const commodityRows = COMMODITY_DISPLAY.map(cd => {
    const c = commodities.find(x => x.name && x.name.includes(cd.match));
    if (!c) return "";
    return `
      <tr>
        <td>${commodityLink(cd)}<span style="color:var(--text-mute);font-size:12px;margin-left:6px">${cd.sub}</span></td>
        <td>${c.close != null ? c.close.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : "—"}</td>
        <td class="${pctClass(c.daily_pct)}">${fmtPct(c.daily_pct)}</td>
        <td class="${pctClass(c.mtd_pct)}">${fmtPct(c.mtd_pct)}</td>
        <td class="${pctClass(c.ytd_pct)}">${fmtPct(c.ytd_pct)}</td>
        <td class="date-col">${escapeHtml(shortDate(c.closing_date) || date)}</td>
      </tr>`;
  }).filter(Boolean).join("");

  const commoditiesBlock = commodityRows ? `
    <h2 style="font-size:16px; margin:24px 0 8px;">商品期貨</h2>
    <table class="indices">
      <thead><tr>
        <th title="商品名稱">商品</th>
        <th class="sortable-th" title="收盤價（來源：Yahoo Finance）；點選排序">收盤</th>
        <th class="sortable-th" title="日報酬率｜今日收盤 vs 昨日收盤｜來源：Yahoo Finance；點選排序">日</th>
        <th class="sortable-th" title="MTD｜當月首交易日收盤 → 最新收盤；點選排序">本月</th>
        <th class="sortable-th" title="YTD｜去年最後交易日收盤 → 最新收盤；點選排序">今年</th>
        <th class="date-col" title="收盤日：最新交易日">收盤日</th>
      </tr></thead>
      <tbody>${commodityRows}</tbody>
    </table>` : "";

  const stocksTab = `
    <table class="indices freeze-col1">
      <thead><tr>
        <th title="點名稱可開 MoneyDJ 圖表頁驗證">指數</th>
        <th class="sortable-th" title="收盤價（來源：Yahoo Finance）；點選排序">收盤</th>
        <th class="sortable-th" title="日報酬率｜定義：今日收盤 vs 昨日收盤｜來源：Yahoo Finance / FRED；點選排序">日</th>
        <th class="sortable-th" title="MTD｜定義：當月首交易日收盤 → 最新收盤｜來源：Yahoo Finance；點選排序">本月</th>
        <th class="sortable-th" title="YTD｜定義：去年最後交易日收盤 → 最新收盤｜來源：Yahoo Finance；點選排序">今年</th>
        <th class="date-col" title="收盤日：最新交易日；US ET 收盤後 build；TW TWSE 公告日">收盤日</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${commoditiesBlock}`;

  // 升息押注指標 — computed from existing bonds + fx data
  const _us10yBond = (m.bonds || []).find(b => b.name === "US 10-Year");
  const _us2yBond  = (m.bonds || []).find(b => b.name === "US 2-Year");
  const _dxyFx     = (m.fx || []).find(f => f.name && f.name.includes("DXY"));
  const _us10y = _us10yBond?.yield_pct ?? null;
  const _us2y  = _us2yBond?.yield_pct  ?? null;
  // 慣例用 10Y − 2Y：正值 = 正斜率（正常），負值 = 倒掛（2Y > 10Y）
  const _spread10y2y = (_us2y != null && _us10y != null) ? +(_us10y - _us2y).toFixed(2) : null;
  const _dxyClose    = _dxyFx?.close        ?? null;
  const _dxyDaily    = _dxyFx?.daily_pct    ?? null;
  const _spreadBps   = _spread10y2y != null ? Math.round(_spread10y2y * 100) : null;

  let _curveLabel = "", _curveBg = "", _curveColor = "", _curveDesc = "";
  if (_spread10y2y != null) {
    if (_spread10y2y > 0.1) {
      _curveLabel = "正斜率"; _curveBg = "#d1fae5"; _curveColor = "#065f46";
      _curveDesc = "長債殖利率高於短債，市場預期景氣擴張";
    } else if (_spread10y2y < -0.1) {
      _curveLabel = "倒掛"; _curveBg = "#fee2e2"; _curveColor = "#991b1b";
      _curveDesc = "短債殖利率高於長債，歷史上常先行衰退訊號";
    } else {
      _curveLabel = "平坦"; _curveBg = "#fef9c3"; _curveColor = "#854d0e";
      _curveDesc = "市場對利率走向猶豫，升降息預期接近五五波";
    }
  }

  const _spreadHtml = _spreadBps != null
    ? `<span style="color:${_spreadBps < -10 ? '#dc2626' : _spreadBps > 10 ? '#16a34a' : '#92400e'}">${_spreadBps > 0 ? '+' : ''}${_spreadBps} bps</span>`
    : "—";

  // FedWatch FOMC meeting probability panel
  const _fedwatch = (m.fedwatch || []);
  const _fwDecisions = _fedwatch.filter(fw => !fw.is_reference);
  const _fwRef = _fedwatch.find(fw => fw.is_reference);
  const _fwRows = _fwDecisions.map(fw => {
    const bps = fw.delta_bps != null ? fw.delta_bps : 0;
    const pHike = fw.p_hike ?? 0;
    const pHold = fw.p_hold ?? 0;
    const pCut  = fw.p_cut  ?? 0;
    const hikeBar  = pHike > 0  ? `<div style="height:8px;width:${pHike}%;background:#dc2626;border-radius:2px 0 0 2px;min-width:${pHike > 0 ? 2 : 0}px;"></div>` : "";
    const holdBar  = pHold > 0  ? `<div style="height:8px;width:${pHold}%;background:#94a3b8;"></div>` : "";
    const cutBar   = pCut  > 0  ? `<div style="height:8px;width:${pCut}%;background:#2563eb;border-radius:0 2px 2px 0;min-width:${pCut > 0 ? 2 : 0}px;"></div>` : "";
    const deltaStr = bps > 0 ? `<span style="color:#dc2626">+${bps.toFixed(1)}bps</span>` : bps < 0 ? `<span style="color:#2563eb">${bps.toFixed(1)}bps</span>` : `<span style="color:#64748b">0bps</span>`;
    const hikeLabel = pHike >= 5 ? `<span style="color:#dc2626;font-weight:600">${pHike.toFixed(0)}%升</span>` : "";
    const cutLabel  = pCut  >= 5 ? `<span style="color:#2563eb;font-weight:600">${pCut.toFixed(0)}%降</span>` : "";
    return `<div style="margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:baseline;font-size:12px;margin-bottom:3px;">
        <span style="font-weight:600;">${fw.label}</span>
        <span style="color:var(--text-mute);font-size:11px;">${fw.fomc_date}</span>
        <span style="margin-left:auto;font-size:11px;">implied ${fw.implied_rate != null ? fw.implied_rate.toFixed(3) + "%" : "—"} ${deltaStr}</span>
      </div>
      <div style="display:flex;width:100%;border-radius:3px;overflow:hidden;background:#e2e8f0;">${hikeBar}${holdBar}${cutBar}</div>
      <div style="display:flex;gap:8px;font-size:10px;margin-top:2px;color:var(--text-mute);">
        ${hikeLabel || cutLabel ? (hikeLabel + " " + cutLabel).trim() : `<span>持平機率${pHold.toFixed(0)}%</span>`}
        <span style="margin-left:auto;">升${pHike.toFixed(0)}% 持${pHold.toFixed(0)}% 降${pCut.toFixed(0)}%</span>
      </div>
    </div>`;
  }).join("");

  const _fedwatchSection = _fwDecisions.length > 0 ? `
    <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px;">
        <span style="font-size:12px;font-weight:600;">CME FedWatch — FOMC 升息機率</span>
        <a href="https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html" target="_blank" rel="noopener"
           style="font-size:11px;color:#3b82f6;text-decoration:none;margin-left:auto;">詳細 ↗</a>
      </div>
      ${_fwRef ? `<div style="font-size:11px;color:var(--text-mute);margin-bottom:8px;">基準：${_fwRef.label} implied ${_fwRef.implied_rate != null ? _fwRef.implied_rate.toFixed(3) + "%" : "—"}（目前有效利率）</div>` : ""}
      <div style="display:flex;gap:6px;font-size:10px;margin-bottom:6px;">
        <span style="display:flex;align-items:center;gap:3px;"><span style="display:inline-block;width:10px;height:8px;background:#dc2626;border-radius:1px;"></span>升息</span>
        <span style="display:flex;align-items:center;gap:3px;"><span style="display:inline-block;width:10px;height:8px;background:#94a3b8;border-radius:1px;"></span>持平</span>
        <span style="display:flex;align-items:center;gap:3px;"><span style="display:inline-block;width:10px;height:8px;background:#2563eb;border-radius:1px;"></span>降息</span>
      </div>
      ${_fwRows}
      <p style="font-size:10px;color:var(--text-mute);margin:4px 0 0;">各欄獨立計算：以相鄰兩次 FOMC implied rate 差值 ÷ 0.25% 估算單次會議升降息機率。</p>
    </div>` : "";

  const _rateOutlookPanel = `
    <div style="margin-bottom:16px;padding:14px 16px;background:var(--card-bg,#fff);border:1px solid var(--border);border-radius:10px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap;">
        <span style="font-weight:600;font-size:16px;">升息押注指標</span>
        ${_curveLabel && _curveLabel !== "正斜率" ? `<span style="font-size:12px;padding:2px 9px;border-radius:20px;font-weight:500;background:${_curveBg};color:${_curveColor};">${_curveLabel}</span>` : ""}
        ${_fwDecisions.length === 0 ? `<a href="https://www.cmegroup.com/markets/interest-rates/cme-fedwatch-tool.html" target="_blank" rel="noopener"
           style="margin-left:auto;font-size:12px;color:#3b82f6;text-decoration:none;white-space:nowrap;">CME FedWatch ↗</a>` : ""}
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(118px,1fr));gap:8px;">
        <div style="padding:8px 10px;background:var(--bg,#fff);border:1px solid var(--border);border-radius:8px;">
          <div style="font-size:11px;color:var(--text-mute);margin-bottom:3px;">US 2Y 殖利率</div>
          <div style="font-size:18px;font-weight:700;">${_us2y != null ? _us2y.toFixed(2) + "%" : "—"}</div>
          <div style="font-size:10px;color:var(--text-mute);">升息最敏感指標</div>
        </div>
        <div style="padding:8px 10px;background:var(--bg,#fff);border:1px solid var(--border);border-radius:8px;">
          <div style="font-size:11px;color:var(--text-mute);margin-bottom:3px;">US 10Y 殖利率</div>
          <div style="font-size:18px;font-weight:700;">${_us10y != null ? _us10y.toFixed(2) + "%" : "—"}</div>
          <div style="font-size:10px;color:var(--text-mute);">通膨／景氣長期預期</div>
        </div>
        <div style="padding:8px 10px;background:var(--bg,#fff);border:1px solid var(--border);border-radius:8px;">
          <div style="font-size:11px;color:var(--text-mute);margin-bottom:3px;">10Y−2Y 利差</div>
          <div style="font-size:18px;font-weight:700;">${_spreadHtml}</div>
          <div style="font-size:10px;color:var(--text-mute);">${_curveLabel ? _curveLabel + "：" + _curveDesc.split("，")[0] : "殖利率曲線形狀"}</div>
        </div>
        <div style="padding:8px 10px;background:var(--bg,#fff);border:1px solid var(--border);border-radius:8px;">
          <div style="font-size:11px;color:var(--text-mute);margin-bottom:3px;">DXY 美元指數</div>
          <div style="font-size:18px;font-weight:700;">${_dxyClose != null ? _dxyClose.toFixed(1) : "—"}</div>
          <div style="font-size:10px;${_dxyDaily != null ? 'color:' + (_dxyDaily >= 0 ? '#16a34a' : '#dc2626') : 'color:var(--text-mute)'}">
            ${_dxyDaily != null ? fmtPct(_dxyDaily) + " 日" : "升息→美元強"}</div>
        </div>
      </div>
      ${_fedwatchSection}
      ${_fwDecisions.length === 0 ? `<p style="font-size:11px;color:var(--text-mute);margin:10px 0 0;">2Y 殖利率對政策利率預期最敏感；10Y−2Y 倒掛（負值）表示市場預期降息或衰退；CME FedWatch 顯示各 FOMC 會議升降息機率。</p>` : ""}
    </div>`;

  const bondsTab = _rateOutlookPanel + (bondRows ? `
    <table class="indices freeze-col1">
      <thead><tr>
        <th title="點名稱可開 MoneyDJ 圖表頁驗證">債別</th>
        <th class="sortable-th" title="到期殖利率（YTM, %）｜來源：FRED (US) / 各國央行 / Yahoo Finance；點選排序">殖利率</th>
        <th class="sortable-th" title="日變動 bps｜定義：今日 yield − 昨日 yield｜來源：FRED；點選排序">日變動</th>
        <th class="sortable-th" title="MTD 變動 bps｜定義：當月首交易日 yield → 最新 yield｜來源：FRED；點選排序">本月變動</th>
        <th class="date-col" title="債券殖利率公告日">收盤日</th>
      </tr></thead>
      <tbody>${bondRows}</tbody>
    </table>` : `<p style="color:var(--text-mute); padding:20px 0">尚未提供公債資料</p>`);

  const fxTab = fxRows ? `
    <table class="indices freeze-col1">
      <thead><tr>
        <th title="點名稱可開 MoneyDJ 圖表頁驗證">幣別</th>
        <th class="sortable-th" title="收盤匯率｜來源：Yahoo Finance；點選排序">收盤</th>
        <th class="sortable-th" title="日報酬率｜定義：今日收盤 vs 昨日收盤｜來源：Yahoo Finance；點選排序">日</th>
        <th class="sortable-th" title="MTD｜定義：當月首交易日收盤 → 最新收盤｜來源：Yahoo Finance；點選排序">本月</th>
        <th class="sortable-th" title="YTD｜定義：去年最後交易日收盤 → 最新收盤｜來源：Yahoo Finance；點選排序">今年</th>
        <th class="date-col" title="收盤日：最新交易日 ET 收盤後 build">收盤日</th>
      </tr></thead>
      <tbody>${fxRows}</tbody>
    </table>` : `<p style="color:var(--text-mute); padding:20px 0">尚未提供匯率資料</p>`;

  const usTab = (renderStocksTable("", usStocks) || `<p style="color:var(--text-mute); padding:20px 0">尚未提供美股資料</p>`)
    + renderRankingsBlock("us");
  const twPresetTable = renderStocksTable("", twStocks) || `<p style="color:var(--text-mute); padding:20px 0">尚未提供台股資料</p>`;
  const twTab = `${twPresetTable}
    <div style="margin-top:28px;padding-top:20px;border-top:1px solid var(--border)">
      ${renderTwStockSheet()}
    </div>
    ${renderRankingsBlock("tw")}`;

  return `
    <div class="tabs tabs-wrap">
      <button class="tab" data-mvtab="overview">市場一覽</button>
      <button class="tab" data-mvtab="us-analysis">美股分析</button>
      <button class="tab active" data-mvtab="tw-analysis">台股分析</button>
    </div>
    <div id="mvtab-overview" hidden>
      ${renderMarketHighlights(m)}

      <div class="tabs tabs-wrap">
        <button class="tab active" data-mtab="indices">全球</button>
        <button class="tab" data-mtab="bonds">債券</button>
        <button class="tab" data-mtab="fx">匯率</button>
      </div>
      <div id="mtab-indices">${stocksTab}</div>
      <div id="mtab-bonds" hidden>${bondsTab}</div>
      <div id="mtab-fx" hidden>${fxTab}</div>
    </div>
    <div id="mvtab-us-analysis" hidden>
      ${renderUsMarketAnalysis()}
      ${renderStocksTable("", usStocks) || ""}
      ${renderRankingsBlock("us")}
    </div>
    <div id="mvtab-tw-analysis">
      ${renderPremarketBlock()}
      ${renderTwMarketAnalysis()}
      ${twPresetTable}
      ${renderRankingsBlock("tw")}
      ${renderTwStockSheet()}
    </div>
  `;
}

// ── 盤勢說明區塊（美股/台股共用） ────────────────────────────────────────────
function renderMarketCommentaryBlock(opts = {}) {
  // opts: { focus: "us"|"tw", sectors: [...] }
  const news = DATA.news || {};
  const market = DATA.market || {};
  const tldr = news.tldr || [];
  const newsDate = news.news_date || "";

  // 美股分析只顯示美股四大指數，排除中國/韓國等非美指數
  let summary = market.summary || "";
  if (opts.focus === "us") {
    const US_KEYS = new Set(["S&P 500", "Nasdaq", "Nasdaq Composite", "Dow Jones", "PHLX Semiconductor"]);
    const allIndices = market.indices || [];
    const usIndices = allIndices.filter(i => US_KEYS.has(i.name) && typeof i.daily_pct === "number");
    if (usIndices.length >= 2) {
      const ranked = [...usIndices].sort((a, b) => b.daily_pct - a.daily_pct);
      const gainers = ranked.filter(i => i.daily_pct > 0).slice(0, 3);
      const losers = ranked.filter(i => i.daily_pct < 0).reverse().slice(0, 2);
      const fmt = i => `${i.name} ${i.daily_pct >= 0 ? "+" : ""}${i.daily_pct.toFixed(2)}%`;
      const parts = [];
      if (gainers.length) parts.push(gainers.map(fmt).join("、") + " 領漲");
      if (losers.length) parts.push(losers.map(fmt).join("、") + " 走弱");
      // 指數漲跌須標明收盤日期（取自指數列的收盤日，退而求其次用 market.closing_date）
      const closeIso = usIndices.find(i => i.closing_date)?.closing_date || market.closing_date || "";
      const closeLabel = shortDate(closeIso);
      const datePrefix = closeLabel ? `${closeLabel} 美股收盤：` : "";
      summary = parts.length ? datePrefix + parts.join("；") + "。" : "";
    }
  }

  const sectors = opts.sectors || [];

  // 美股分析過濾台灣議題（只留美國市場新聞）
  const TW_ONLY_PATTERNS = [
    /元目標價/,        // 台股TWD目標價
    /財經雙首長/,      // 台灣財政部長/主計長
    /以房養老/,        // 台灣特有金融商品
    /財管需求.*保單/,  // 台灣財富管理脈絡
    /台股提防/,        // 純台股警示
    /連假前賣壓/,      // 台灣連假
    /台股/,            // 台股大漲/下跌等
    /金管會/,          // 台灣金管會監理新聞
    /外資由賣轉買|外資回補/,  // 台股外資進出
    /台灣央行|央行理事/,      // 台灣央行
    /加權指數|TAIEX/,         // 台灣加權指數
    /長照/,            // 台灣長照政策/長照基金
    /遺贈稅|遺產稅/,   // 台灣遺贈稅政策數據
    /財政部.*公告|財政部.*稅/,  // 台灣財政部稅務公告
    /健保|勞保|勞退/,  // 台灣社會保險
    /內政部|行政院/,   // 台灣政府機構
  ];

  // 台股分析過濾純美國議題（只留台灣市場相關新聞）
  const US_ONLY_PATTERNS = [
    /華爾街/,          // 華爾街市場討論
    /美股.*(創高|大漲|急跌|崩跌|破位)/,  // 美股特定走勢
    /Nasdaq .*(創|破|衝)/,  // Nasdaq 指數突破
    /S&P 500 .*(創|破|衝)/,  // S&P 指數突破
    /道瓊.*(創|破|衝|大漲|急跌)/,  // 道瓊指數走勢
    /SEC .*(裁罰|公告|規定)/,   // 美國 SEC 監理
    /美國財政部.*(拍賣|公債)/,  // 美國公債拍賣
  ];

  const filteredTldr = opts.focus === "us"
    ? tldr.filter(t => !TW_ONLY_PATTERNS.some(re => re.test(t)))
    : opts.focus === "tw"
    ? tldr.filter(t => !US_ONLY_PATTERNS.some(re => re.test(t)))
    : tldr;

  // 統一格式：summary、sectorNote、tldr 全部用 <ul><li> 點號呈現
  const liStyle = `margin-bottom:6px;line-height:1.65;font-size:15px`;
  const allItems = [];
  if (summary) allItems.push(`<li style="${liStyle}">${escapeHtml(summary)}</li>`);
  if (sectors.length) {
    const top = sectors[0];
    const bot = sectors[sectors.length - 1];
    const fmtS = (s) => `${s.name_zh || s.symbol} ${s.daily_pct != null ? (s.daily_pct >= 0 ? "+" : "") + s.daily_pct.toFixed(2) + "%" : "—"}`;
    allItems.push(`<li style="${liStyle}">類股輪動：<span style="color:#d62828;font-weight:600">${fmtS(top)}</span> 領漲，<span style="color:#2a9d8f;font-weight:600">${fmtS(bot)}</span> 跌最深。</li>`);
  }
  filteredTldr.forEach(t => allItems.push(`<li style="${liStyle}">${escapeHtml(t)}</li>`));

  const bulletsHtml = allItems.length ? `<ul style="margin:0;padding-left:18px">${allItems.join("")}</ul>` : "";

  const dateLabel = newsDate ? `<span style="font-size:12px;color:var(--text-mute)">${newsDate}</span>` : "";

  // bare mode: return only the bullets (to embed inside another card)
  if (opts.bare) return bulletsHtml;

  if (!bulletsHtml) return "";
  return `
    <div style="border:1px solid var(--border,#e5e7eb);border-radius:10px;padding:14px 16px;margin-bottom:16px;background:var(--card-bg,#fff)">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px">
        <h2 style="font-size:16px;margin:0;font-weight:700">盤勢說明</h2>${dateLabel}
      </div>
      ${bulletsHtml}
    </div>`;
}

// ── 台股盤勢分析 ─────────────────────────────────────────────────────────────
function renderTwMarketAnalysis() {
  const market = DATA.market || {};
  const rankings = DATA.rankings || {};
  const twRankings = rankings.tw || {};

  const fmtClose = (v) => v == null ? "—" : v >= 1000 ? v.toLocaleString("zh-TW", { maximumFractionDigits: 2 }) : v.toFixed(2);
  const fmtP = (v) => v == null ? "—" : (v >= 0 ? "+" : "") + v.toFixed(2) + "%";
  const pColor = (v) => v == null ? "var(--text-mute)" : v > 0 ? "#d62828" : v < 0 ? "#2a9d8f" : "var(--text-mute)";

  // 主要指數 — TAIEX, OTC
  const TW_INDEX_KEYS = ["TAIEX 加權指數", "OTC 櫃買加權"];
  const TW_INDEX_LABELS = { "TAIEX 加權指數": "台股加權", "OTC 櫃買加權": "OTC 櫃買" };
  const allIndices = market.indices || [];
  const keyIndices = TW_INDEX_KEYS.map(k => allIndices.find(i => i.name === k)).filter(Boolean);

  const indexRows = keyIndices.map(idx => {
    const label = TW_INDEX_LABELS[idx.name] || idx.name;
    const dp = idx.daily_pct;
    return `<tr>
      <td style="white-space:nowrap; text-align:center">${label}</td>
      <td style="text-align:right; font-variant-numeric:tabular-nums">${fmtClose(idx.close)}</td>
      <td class="${pctClass(dp)}" style="text-align:right; white-space:nowrap">${fmtP(dp)}</td>
      <td class="${pctClass(idx.mtd_pct)}" style="text-align:right; white-space:nowrap">${fmtP(idx.mtd_pct)}</td>
      <td class="${pctClass(idx.ytd_pct)}" style="text-align:right; white-space:nowrap">${fmtP(idx.ytd_pct)}</td>
    </tr>`;
  }).join("");

  const indexBlock = keyIndices.length ? `
    <h3 style="font-size:13px; margin:0 0 6px; color:var(--text-mute); text-transform:uppercase; letter-spacing:.05em">主要指數</h3>
    <div style="overflow-x:auto; -webkit-overflow-scrolling:touch; margin-bottom:16px">
      <table class="indices" style="width:100%">
        <thead><tr>
          <th style="text-align:center">指數</th>
          <th class="sortable-th">最新</th>
          <th class="sortable-th">日</th>
          <th class="sortable-th">月</th>
          <th class="sortable-th">年</th>
        </tr></thead>
        <tbody>${indexRows}</tbody>
      </table>
    </div>` : "";

  // 類股表現熱力圖
  const twSectors = twRankings.sectors || [];
  const sectorBgColor = (dp) => dp == null ? "#e5e7eb"
    : dp >= 3 ? "#f5a0a0" : dp >= 1 ? "#f9c0c0" : dp >= 0 ? "#fde5e5"
    : dp >= -1 ? "#d9eeec" : dp >= -3 ? "#aedbd7" : "#80cdc7";
  const twSectorBars = twSectors.map(s => {
    const dp = s.daily_pct;
    const bg = sectorBgColor(dp);
    const txtColor = "#374151";
    const pStr = dp == null ? "—" : (dp >= 0 ? "+" : "") + dp.toFixed(2) + "%";
    return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
        background:${bg};color:${txtColor};border-radius:5px;padding:8px 4px;min-width:64px;flex:1;
        font-size:13px;line-height:1.4;text-align:center">
      <span>${s.name_zh || s.symbol}</span>
      <span style="margin-top:3px">${pStr}</span>
    </div>`;
  }).join("");
  const twSectorBlock = twSectors.length ? `
    <h3 style="font-size:13px; margin:0 0 6px; color:var(--text-mute); text-transform:uppercase; letter-spacing:.05em">類股表現</h3>
    <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:4px">${twSectorBars}</div>
    <p style="color:var(--text-mute);font-size:12px;margin:4px 0 16px">依今日漲幅排序；資料來源：TWSE 類股指數</p>
  ` : "";

  // 今日熱門 ETF — top_etf 前 8 名，色塊熱力圖
  const etfs = (twRankings.top_etf || []).slice(0, 8);
  const etfBars = etfs.map(s => {
    const dp = s.daily_pct;
    const bg = dp == null ? "#e5e7eb"
      : dp >= 2 ? "#f5a0a0" : dp >= 0.5 ? "#f9c0c0" : dp >= 0 ? "#fde5e5"
      : dp >= -0.5 ? "#d9eeec" : dp >= -2 ? "#aedbd7" : "#80cdc7";
    const txtColor = "#374151";
    const pStr = dp == null ? "—" : (dp >= 0 ? "+" : "") + dp.toFixed(2) + "%";
    const href = s.source_url ? ` href="${s.source_url}" target="_blank" rel="noopener"` : "";
    return `<a${href} style="display:flex;flex-direction:column;align-items:center;justify-content:center;
        background:${bg};color:${txtColor};border-radius:5px;padding:8px 4px;min-width:72px;flex:1;
        font-size:13px;line-height:1.4;text-align:center;text-decoration:none">
      <span style="max-width:68px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.name || s.symbol}</span>
      <span style="font-size:12px;opacity:.85">${s.symbol}</span>
      <span style="margin-top:2px">${pStr}</span>
    </a>`;
  }).join("");

  const etfBlock = etfs.length ? `
    <h3 style="font-size:13px; margin:0 0 6px; color:var(--text-mute); text-transform:uppercase; letter-spacing:.05em">今日熱門 ETF</h3>
    <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:16px">${etfBars}</div>
    <p style="color:var(--text-mute);font-size:12px;margin:-10px 0 16px">依今日漲幅排序；資料來源：TWSE</p>
  ` : "";

  // 個股排行
  const gainers = (twRankings.top_gainers || []).slice(0, 5);
  const losers  = (twRankings.top_losers  || []).slice(0, 5);
  const stockFlexRow = (s, isGainer) => {
    const dp = s.daily_pct;
    const color = isGainer ? "#d62828" : "#2a9d8f";
    const pStr = dp == null ? "—" : (dp >= 0 ? "+" : "") + dp.toFixed(2) + "%";
    const href = s.source_url ? ` href="${s.source_url}" target="_blank" rel="noopener"` : "";
    return `<a${href} style="display:flex;align-items:center;padding:6px 0;border-bottom:1px solid var(--border,#e5e7eb);text-decoration:none;color:inherit;gap:6px">
      <span style="min-width:38px;font-size:12px;color:var(--text-mute)">${s.symbol}</span>
      <span style="flex:1;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.name || ""}</span>
      <span style="font-weight:700;color:${color};min-width:64px;text-align:right;font-size:13px">${pStr}</span>
      <span style="min-width:36px;text-align:right;color:var(--text-mute);font-size:12px">${s.price != null ? s.price.toFixed(1) : "—"}</span>
    </a>`;
  };

  const rankBlock = (gainers.length || losers.length) ? `
    <h3 style="font-size:13px; margin:0 0 10px; color:var(--text-mute); text-transform:uppercase; letter-spacing:.05em">個股排行</h3>
    ${gainers.length ? `
    <div style="margin-bottom:14px">
      <div style="font-size:13px;font-weight:700;color:#d62828;margin-bottom:4px">▲ 漲幅前五</div>
      ${gainers.map(s => stockFlexRow(s, true)).join("")}
    </div>` : ""}
    ${losers.length ? `
    <div style="margin-bottom:8px">
      <div style="font-size:13px;font-weight:700;color:#2a9d8f;margin-bottom:4px">▼ 跌幅前五</div>
      ${losers.map(s => stockFlexRow(s, false)).join("")}
    </div>` : ""}
    <p style="color:var(--text-mute);font-size:12px;margin:4px 0 8px">資料來源：TWSE；非投資建議</p>
  ` : "";

  const asOf = twRankings.as_of || market.closing_date || keyIndices[0]?.closing_date || "";
  if (!indexBlock && !twSectorBlock && !etfBlock && !rankBlock) return "";
  const commentaryCard = DATA.premarket ? "" : renderMarketCommentaryBlock({ focus: "tw" });
  return commentaryCard + `
    <div style="border:1px solid var(--border,#e5e7eb);border-radius:10px;padding:14px 16px;margin-bottom:18px;background:var(--card-bg,#fff)">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px">
        <h2 style="font-size:16px;margin:0;font-weight:700">台股盤勢</h2>
        ${asOf ? `<span style="font-size:12px;color:var(--text-mute)">${asOf}</span>` : ""}
      </div>
      ${indexBlock}${twSectorBlock}${etfBlock}${rankBlock}
    </div>`;
}

// ── 最新美股盤勢分析 ────────────────────────────────────────────────────────
function renderUsMarketAnalysis() {
  const market = DATA.market || {};
  const rankings = DATA.rankings || {};
  const usRankings = rankings.us || {};

  // 主要指數 — 從 market.json indices 抓四檔
  const INDEX_KEYS = ["S&P 500", "Nasdaq Composite", "Dow Jones", "PHLX Semiconductor"];
  const INDEX_LABELS = { "S&P 500": "S&P 500", "Nasdaq Composite": "Nasdaq", "Dow Jones": "Dow Jones", "PHLX Semiconductor": "SOX 半導體" };
  const allIndices = market.indices || [];
  const keyIndices = INDEX_KEYS.map(k => allIndices.find(i => i.name === k)).filter(Boolean);

  const fmtClose = (v) => v == null ? "—" : v >= 1000 ? v.toLocaleString("en-US", { maximumFractionDigits: 0 }) : v.toFixed(2);
  const fmtP = (v) => v == null ? "—" : (v >= 0 ? "+" : "") + v.toFixed(2) + "%";
  const pColor = (v) => v == null ? "var(--text-mute)" : v > 0 ? "#d62828" : v < 0 ? "#2a9d8f" : "var(--text-mute)";

  const indexRows = keyIndices.map(idx => {
    const label = INDEX_LABELS[idx.name] || idx.name;
    const dp = idx.daily_pct;
    const dateStr = shortDate(idx.closing_date) || "";
    return `
      <tr>
        <td style="white-space:nowrap; text-align:center">${label}</td>
        <td style="text-align:center; font-variant-numeric:tabular-nums">${fmtClose(idx.close)}</td>
        <td class="${pctClass(dp)}" style="text-align:center; white-space:nowrap">${fmtP(dp)}</td>
        <td class="${pctClass(idx.mtd_pct)}" style="text-align:center; white-space:nowrap">${fmtP(idx.mtd_pct)}</td>
        <td class="${pctClass(idx.ytd_pct)}" style="text-align:center; white-space:nowrap">${fmtP(idx.ytd_pct)}</td>
        <td class="date-col" style="text-align:center">${escapeHtml(dateStr)}</td>
      </tr>`;
  }).join("");

  const indexBlock = keyIndices.length ? `
    <h3 style="font-size:13px; margin:0 0 6px; color:var(--text-mute); text-transform:uppercase; letter-spacing:.05em">主要指數</h3>
    <div style="overflow-x:auto; -webkit-overflow-scrolling:touch; margin-bottom:16px">
      <table class="indices" style="width:100%">
        <thead><tr>
          <th style="text-align:center">指數</th>
          <th class="sortable-th">最新</th>
          <th class="sortable-th">日</th>
          <th class="sortable-th">月</th>
          <th class="sortable-th">年</th>
          <th class="date-col">收盤日</th>
        </tr></thead>
        <tbody>${indexRows}</tbody>
      </table>
    </div>` : "";

  // 類股 ETF 熱力圖
  const sectors = usRankings.sectors || [];
  const sectorBars = sectors.map(s => {
    const dp = s.daily_pct;
    const bg = dp == null ? "#e5e7eb"
      : dp >= 2 ? "#f5a0a0" : dp >= 0.5 ? "#f9c0c0" : dp >= 0 ? "#fde5e5"
      : dp >= -0.5 ? "#d9eeec" : dp >= -2 ? "#aedbd7" : "#80cdc7";
    const txtColor = "#374151";
    const pStr = dp == null ? "—" : (dp >= 0 ? "+" : "") + dp.toFixed(2) + "%";
    return `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
        background:${bg};color:${txtColor};border-radius:5px;padding:8px 4px;min-width:64px;flex:1;
        font-size:13px;line-height:1.4;text-align:center">
      <span>${s.name_zh || s.symbol}</span>
      <span style="font-size:12px;opacity:.85">${s.symbol}</span>
      <span style="margin-top:2px">${pStr}</span>
    </div>`;
  }).join("");

  const sectorBlock = sectors.length ? `
    <h3 style="font-size:13px; margin:0 0 6px; color:var(--text-mute); text-transform:uppercase; letter-spacing:.05em">類股 ETF 表現（SPDR 11 大類）</h3>
    <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:16px">${sectorBars}</div>
    <p style="color:var(--text-mute);font-size:12px;margin:-10px 0 16px">顏色深紅＝漲幅大、深綠＝跌幅大；資料來源：Yahoo Finance</p>
  ` : "";

  // 個股排行 — 前 5 漲 / 前 5 跌
  const gainers = (usRankings.top_gainers || []).slice(0, 5);
  const losers  = (usRankings.top_losers  || []).slice(0, 5);
  const stockFlexRow = (s, isGainer) => {
    const dp = s.daily_pct;
    const color = isGainer ? "#d62828" : "#2a9d8f";
    const pStr = dp == null ? "—" : (dp >= 0 ? "+" : "") + dp.toFixed(2) + "%";
    const href = s.source_url ? ` href="${s.source_url}" target="_blank" rel="noopener"` : "";
    return `<a${href} style="display:flex;align-items:center;padding:6px 0;border-bottom:1px solid var(--border,#e5e7eb);text-decoration:none;color:inherit;gap:6px">
      <span style="min-width:44px;font-size:12px;color:var(--text-mute);font-weight:600">${s.symbol}</span>
      <span style="flex:1;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${s.name || ""}</span>
      <span style="font-weight:700;color:${color};min-width:64px;text-align:right;font-size:13px">${pStr}</span>
      <span style="min-width:48px;text-align:right;color:var(--text-mute);font-size:12px">${s.price != null ? s.price.toFixed(2) : "—"}</span>
    </a>`;
  };

  const rankBlock = (gainers.length || losers.length) ? `
    <h3 style="font-size:13px; margin:0 0 10px; color:var(--text-mute); text-transform:uppercase; letter-spacing:.05em">個股排行</h3>
    ${gainers.length ? `
    <div style="margin-bottom:14px">
      <div style="font-size:13px;font-weight:700;color:#d62828;margin-bottom:4px">▲ 漲幅前五</div>
      ${gainers.map(s => stockFlexRow(s, true)).join("")}
    </div>` : ""}
    ${losers.length ? `
    <div style="margin-bottom:8px">
      <div style="font-size:13px;font-weight:700;color:#2a9d8f;margin-bottom:4px">▼ 跌幅前五</div>
      ${losers.map(s => stockFlexRow(s, false)).join("")}
    </div>` : ""}
    <p style="color:var(--text-mute);font-size:12px;margin:4px 0 8px">資料來源：Yahoo Finance Screener；非投資建議</p>
  ` : "";

  const asOf = usRankings.as_of || market.closing_date || "";
  const commentaryBullets = renderMarketCommentaryBlock({ focus: "us", sectors, bare: true });
  if (!indexBlock && !sectorBlock && !rankBlock && !commentaryBullets) return "";

  return `
    <div style="border:1px solid var(--border,#e5e7eb);border-radius:10px;padding:14px 16px;margin-bottom:18px;background:var(--card-bg,#fff)">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px">
        <h2 style="font-size:16px;margin:0;font-weight:700">美股盤勢</h2>
        ${asOf ? `<span style="font-size:12px;color:var(--text-mute)">${asOf}</span>` : ""}
      </div>
      ${commentaryBullets ? `<div style="margin-bottom:14px">${commentaryBullets}</div>` : ""}
      ${indexBlock}${sectorBlock}${rankBlock}
    </div>`;
}

function renderUsStocksSheet() {
  const curated = DATA.stocks?.us_stocks || [];
  const popular = DATA.popular?.stocks || [];
  const briefStocks = DATA.stock_brief?.stocks || [];
  const hasAny = curated.length || popular.length || briefStocks.length;
  if (!hasAny) {
    return `<p style="color:var(--text-mute); padding:20px 0">尚未提供海外股票資料</p>`;
  }
  const note = `<p style="color:var(--text-mute); font-size:13px; padding:6px 0 12px">資料來源：板信商銀網路銀行 iQuote。點選名稱可至板信即時報價頁。</p>`;
  const curatedBlock = curated.length ? `
    <h2 style="font-size:16px; margin:12px 0 8px;">精選海外股票</h2>
    ${renderStocksTable("", curated, { showPE: false })}
  ` : "";
  const popularBlock = popular.length ? `
    <h2 style="font-size:16px; margin:18px 0 8px;">熱門海外股票</h2>
    <p style="color:var(--text-mute); font-size:12px; margin:0 0 8px;">資料來源：Yahoo Finance trending（流動性過低個股已過濾），每次 build 重抓。</p>
    ${renderStocksTable("", popular, { showPE: false })}
  ` : "";
  const moreSection = `
    <div class="fund-card" style="margin-top:18px;text-align:center">
      <h3 style="margin-bottom:6px">其他海外股票</h3>
      <p class="tagline" style="margin-bottom:12px">瀏覽板信完整海外股票行情表</p>
      <a href="https://bopfund.moneydj.com/main.asp?sUrl=$etfweb$html$et081001]djhtm" target="_blank" rel="noopener"
         style="display:inline-block;padding:10px 22px;background:#019AB3;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
        前往海外股票行情表
      </a>
    </div>
  `;
  return renderUsMarketAnalysis() + note + curatedBlock + popularBlock + renderStockBriefBlock() + moreSection;
}

let TW_STOCK_QUERY = "";
let TW_INDUSTRY_FILTER = "全部";  // "全部" / 產業名稱
const TW_STOCK_QUICKPICK = [
  { code: "2330", name: "台積電" },
  { code: "2317", name: "鴻海" },
  { code: "2454", name: "聯發科" },
  { code: "3008", name: "大立光" },
  { code: "2891", name: "中信金" },
  { code: "2412", name: "中華電" },
  { code: "2603", name: "長榮" },
  { code: "1301", name: "台塑" },
];
// 7 大類 → 比照精選基金/稅負試算 等次分頁樣式（.tabs.tabs-wrap）
const TW_MEGA_CATEGORIES = [
  { name: "全部", industries: null },
  { name: "科技電子", industries: ["半導體業", "電子零組件", "電腦及週邊", "光電業", "通信網路業", "其他電子業", "電子通路業", "資訊服務業", "數位雲端", "電子商務"] },
  { name: "金融保險", industries: ["金融保險"] },
  { name: "生技醫療", industries: ["生技醫療"] },
  { name: "傳產製造", industries: ["鋼鐵工業", "紡織纖維", "塑膠工業", "食品工業", "化學工業", "水泥工業", "玻璃陶瓷", "橡膠工業", "造紙工業", "電機機械", "電器電纜"] },
  { name: "民生服務", industries: ["航運業", "建材營造", "汽車工業", "觀光餐旅", "貿易百貨", "油電燃氣", "綠能環保", "運動休閒", "居家生活", "文化創意業", "農業科技", "其他"] },
  { name: "ETF", industries: ["ETF"] },
];
function twMegaCategoryFor(industry) {
  for (const c of TW_MEGA_CATEGORIES) {
    if (c.industries && c.industries.includes(industry)) return c.name;
  }
  return "民生服務";  // 未分類落到「其他」歸民生服務
}
function twMegaIncludes(industry, megaName) {
  if (megaName === "全部") return true;
  const c = TW_MEGA_CATEGORIES.find(m => m.name === megaName);
  return c?.industries?.includes(industry) || false;
}
function twMegaList() {
  const list = DATA?.tw_stocks || [];
  const counts = { 全部: list.length };
  for (const c of TW_MEGA_CATEGORIES) if (c.name !== "全部") counts[c.name] = 0;
  for (const s of list) {
    const mega = twMegaCategoryFor(s.industry || "其他");
    if (counts[mega] != null) counts[mega]++;
  }
  return TW_MEGA_CATEGORIES.map(c => ({ name: c.name, count: counts[c.name] || 0 }));
}

const TW_STOCK_SNAPSHOT_CACHE = {};
function twYahooSuffix(market) {
  return market === "上櫃" ? ".TWO" : ".TW";
}
function fmtNum(n, d) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const dd = d != null ? d : 2;
  return Number(n).toLocaleString("zh-TW", { minimumFractionDigits: dd, maximumFractionDigits: dd });
}
function fmtVolume(v) {
  if (v == null || Number.isNaN(v)) return "—";
  const k = v / 1000;
  if (k >= 10000) return `${(k / 10000).toFixed(1)} 億股`;
  if (k >= 1) return `${k.toFixed(0)} 張`;
  return `${v} 股`;
}
function fmtDateFromEpoch(sec) {
  if (!sec) return "—";
  const d = new Date(sec * 1000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function parseTwseRoc(d) {
  const m = String(d || "").split("/");
  if (m.length !== 3) return "—";
  return `${parseInt(m[0]) + 1911}-${m[1].padStart(2, "0")}-${m[2].padStart(2, "0")}`;
}
function parseTwseNum(s) {
  const n = Number(String(s ?? "").replace(/[,\s+]/g, ""));
  return Number.isFinite(n) ? n : null;
}

async function fetchTwseStockDay(code, yyyymm01) {
  const url = `https://www.twse.com.tw/exchangeReport/STOCK_DAY?response=json&date=${yyyymm01}&stockNo=${encodeURIComponent(code)}`;
  const resp = await fetch(url, { mode: "cors" });
  if (!resp.ok) throw new Error(`TWSE HTTP ${resp.status}`);
  const json = await resp.json();
  if (json.stat !== "OK" || !Array.isArray(json.data) || !json.data.length) {
    throw new Error(`TWSE ${json.stat || "無資料"}`);
  }
  return json.data;
}

async function fetchTwseSnapshot(code) {
  const now = new Date();
  const ym = (y, m) => `${y}${String(m + 1).padStart(2, "0")}01`;
  let rows;
  try {
    rows = await fetchTwseStockDay(code, ym(now.getFullYear(), now.getMonth()));
  } catch {
    // 月初無本月資料 → 退到上個月
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    rows = await fetchTwseStockDay(code, ym(prev.getFullYear(), prev.getMonth()));
  }
  if (!rows.length) throw new Error("TWSE 月資料為空");
  // 若本月只有 1 筆，補抓上月以利取得昨收與 sparkline
  if (rows.length < 5) {
    try {
      const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevRows = await fetchTwseStockDay(code, ym(prev.getFullYear(), prev.getMonth()));
      rows = [...prevRows, ...rows];
    } catch {}
  }
  const last = rows[rows.length - 1];
  const prevRow = rows[rows.length - 2];
  const close = parseTwseNum(last[6]);
  const prevClose = prevRow ? parseTwseNum(prevRow[6]) : null;
  const changeRaw = parseTwseNum(last[7]);
  const change = prevClose != null ? close - prevClose : changeRaw;
  const changePct = prevClose ? (change / prevClose) * 100 : null;
  const sparkPoints = rows.slice(-10).map(r => ({ c: parseTwseNum(r[6]) })).filter(p => p.c != null);
  return {
    ok: true, source: "TWSE 證交所",
    price: close, prevClose, change, changePct,
    open: parseTwseNum(last[3]),
    high: parseTwseNum(last[4]),
    low: parseTwseNum(last[5]),
    volume: parseTwseNum(last[1]),
    dateStr: parseTwseRoc(last[0]),
    currency: "TWD",
    sparkPoints,
  };
}

async function fetchYahooSnapshot(code, market) {
  const symbol = `${code}${twYahooSuffix(market)}`;
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1mo&interval=1d`;
  const resp = await fetch(url, { mode: "cors" });
  if (!resp.ok) throw new Error(`Yahoo HTTP ${resp.status}`);
  const json = await resp.json();
  const result = json?.chart?.result?.[0];
  const err = json?.chart?.error;
  if (err || !result) throw new Error(err?.description || "Yahoo 無資料");
  const meta = result.meta || {};
  const ts = result.timestamp || [];
  const q = result.indicators?.quote?.[0] || {};
  const closes = (q.close || []).filter(x => x != null);
  if (!closes.length) throw new Error("Yahoo 空資料");
  const price = meta.regularMarketPrice ?? closes[closes.length - 1];
  const prevClose = closes.length >= 2 ? closes[closes.length - 2] : (meta.chartPreviousClose ?? null);
  const change = prevClose != null ? price - prevClose : null;
  const changePct = prevClose ? (change / prevClose) * 100 : null;
  const lastIdx = (q.close || []).length - 1;
  const lastTs = ts[lastIdx] || meta.regularMarketTime;
  const sparkPoints = ts.map((t, i) => ({ t, c: q.close?.[i] })).filter(p => p.c != null).slice(-10);
  return {
    ok: true, source: "Yahoo Finance",
    symbol, price, prevClose, change, changePct,
    open: q.open?.[lastIdx],
    high: q.high?.[lastIdx],
    low: q.low?.[lastIdx],
    volume: q.volume?.[lastIdx],
    dateStr: fmtDateFromEpoch(lastTs),
    currency: meta.currency || "TWD",
    sparkPoints,
  };
}

let TPEX_QUOTES_PROMISE = null;
function loadTpexQuotes() {
  if (!TPEX_QUOTES_PROMISE) {
    TPEX_QUOTES_PROMISE = fetch("data/tpex_quotes.json", { cache: "no-cache" })
      .then(r => { if (!r.ok) throw new Error(`tpex_quotes HTTP ${r.status}`); return r.json(); })
      .catch(e => { TPEX_QUOTES_PROMISE = null; throw e; });
  }
  return TPEX_QUOTES_PROMISE;
}

async function fetchTpexFromStatic(code) {
  const data = await loadTpexQuotes();
  const q = data?.quotes?.[code];
  if (!q) throw new Error("TPEx 靜態檔無此檔");
  return {
    ok: true, source: "TPEx 證券櫃檯買賣中心",
    price: q.close, prevClose: q.prevClose,
    change: q.change, changePct: q.changePct,
    open: q.open, high: q.high, low: q.low,
    volume: q.volume,
    dateStr: data.isoDate || "—",
    currency: "TWD",
    sparkPoints: [],
    staticAsOf: data.asOf,
  };
}

async function fetchTwStockSnapshot(code, market) {
  const key = `${code}|${market}`;
  if (TW_STOCK_SNAPSHOT_CACHE[key]) return TW_STOCK_SNAPSHOT_CACHE[key];
  const primary = market === "上櫃" ? () => fetchYahooSnapshot(code, market) : () => fetchTwseSnapshot(code);
  const fallback = market === "上櫃" ? () => fetchTpexFromStatic(code) : () => fetchYahooSnapshot(code, market);
  let snap;
  try {
    snap = await primary();
  } catch (e1) {
    try {
      snap = await fallback();
      snap.fallbackFrom = String(e1.message || e1);
    } catch (e2) {
      snap = { ok: false, error: `${e1.message} ／ ${e2.message}` };
    }
  }
  if (snap.ok) TW_STOCK_SNAPSHOT_CACHE[key] = snap;
  return snap;
}

function renderSparkline(points, width = 160, height = 40) {
  if (!points || points.length < 2) return "";
  const vals = points.map(p => p.c);
  const min = Math.min(...vals), max = Math.max(...vals);
  const range = max - min || 1;
  const stepX = width / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = (i * stepX).toFixed(1);
    const y = (height - ((p.c - min) / range) * height).toFixed(1);
    return `${x},${y}`;
  }).join(" ");
  const last = points[points.length - 1].c;
  const first = points[0].c;
  const up = last >= first;
  const color = up ? "#d62828" : "#2a9d8f";
  return `<svg class="tw-spark" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" preserveAspectRatio="none">
    <polyline fill="none" stroke="${color}" stroke-width="1.6" points="${coords}"/>
  </svg>`;
}

function renderTwStockSnapshot(snap, rec) {
  if (!snap || !snap.ok) {
    return `<div class="tw-snap-err">即時行情載入失敗${snap?.error ? `（${escapeHtml(snap.error)}）` : ""}，仍可點下方連結直接查。</div>`;
  }
  const upDown = snap.change > 0 ? "up" : snap.change < 0 ? "down" : "flat";
  const sign = snap.change > 0 ? "+" : "";
  const changeStr = snap.change != null ? `${sign}${fmtNum(snap.change, 2)}` : "—";
  const changePctStr = snap.changePct != null ? `${sign}${fmtNum(snap.changePct, 2)}%` : "—";
  return `
    <div class="tw-snap">
      <div class="tw-snap-head">
        <div class="tw-snap-price tw-${upDown}">
          <span class="tw-snap-pricenum">${fmtNum(snap.price, 2)}</span>
          <span class="tw-snap-cur">${escapeHtml(snap.currency || "TWD")}</span>
        </div>
        <div class="tw-snap-change tw-${upDown}">
          <span>${changeStr}</span>
          <span>${changePctStr}</span>
        </div>
        <div class="tw-snap-spark">${renderSparkline(snap.sparkPoints)}</div>
      </div>
      <div class="tw-snap-grid">
        <div><span class="tw-snap-k">開盤</span><span class="tw-snap-v">${fmtNum(snap.open, 2)}</span></div>
        <div><span class="tw-snap-k">最高</span><span class="tw-snap-v">${fmtNum(snap.high, 2)}</span></div>
        <div><span class="tw-snap-k">最低</span><span class="tw-snap-v">${fmtNum(snap.low, 2)}</span></div>
        <div><span class="tw-snap-k">昨收</span><span class="tw-snap-v">${fmtNum(snap.prevClose, 2)}</span></div>
        <div><span class="tw-snap-k">成交量</span><span class="tw-snap-v">${fmtVolume(snap.volume)}</span></div>
        <div><span class="tw-snap-k">資料日</span><span class="tw-snap-v">${escapeHtml(snap.dateStr)}</span></div>
      </div>
      <div class="tw-snap-foot">資料源：${escapeHtml(snap.source || "Yahoo Finance")}${snap.staticAsOf ? `（盤後 cache，更新於 ${escapeHtml(snap.staticAsOf.slice(0,16).replace("T"," "))}）` : "（瀏覽器直接抓取，無中介伺服器、無 API 金鑰）"}${snap.fallbackFrom ? `<span class="tw-snap-fallback"> · 主源失敗已自動切換</span>` : ""}</div>
    </div>`;
}

// ============ 價格走勢圖 (Price Chart) ============
const TW_CHART_CACHE = {};                 // key: `${symbol}|${range}`
const TW_MA_COLORS = ["#2563eb", "#f59e0b"]; // 短均藍、長均橘（仿 FinLab）
let TW_CHART_RANGE = "1y";                 // 預設一年
const TW_CHART_RANGES = [
  { key: "1mo", label: "1M", interval: "1d",  ma: [5, 20] },
  { key: "3mo", label: "3M", interval: "1d",  ma: [20, 60] },
  { key: "6mo", label: "6M", interval: "1d",  ma: [20, 60] },
  { key: "1y",  label: "1Y", interval: "1d",  ma: [20, 60] },
  { key: "3y",  label: "3Y", interval: "1wk", ma: [13, 26] },
  { key: "5y",  label: "5Y", interval: "1wk", ma: [13, 26] },
];

async function fetchYahooChart(code, market, range) {
  const symbol = `${code}${twYahooSuffix(market)}`;
  const cfg = TW_CHART_RANGES.find(r => r.key === range) || TW_CHART_RANGES[3];
  const cacheKey = `${symbol}|${cfg.key}`;
  if (TW_CHART_CACHE[cacheKey]) return TW_CHART_CACHE[cacheKey];
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${cfg.key}&interval=${cfg.interval}`;
  const resp = await fetch(url, { mode: "cors" });
  if (!resp.ok) throw new Error(`Yahoo HTTP ${resp.status}`);
  const json = await resp.json();
  const result = json?.chart?.result?.[0];
  const err = json?.chart?.error;
  if (err || !result) throw new Error(err?.description || "Yahoo 無資料");
  const ts = result.timestamp || [];
  const q = result.indicators?.quote?.[0] || {};
  const closes = q.close || [], vols = q.volume || [];
  const points = [];
  for (let i = 0; i < ts.length; i++) {
    const c = closes[i];
    if (c == null) continue;
    points.push({ t: ts[i], c, v: vols[i] ?? 0 });
  }
  if (points.length < 2) throw new Error("Yahoo 空資料");
  const out = { ok: true, symbol, range: cfg.key, ma: cfg.ma, interval: cfg.interval, points, currency: result.meta?.currency || "TWD", source: "Yahoo Finance" };
  TW_CHART_CACHE[cacheKey] = out;
  return out;
}

// 上市股備援：Yahoo 掛掉時改用證交所 STOCK_DAY（每月一檔，串接成日線）
const TWSE_CHART_MONTHS = { "1mo": 2, "3mo": 4, "6mo": 7, "1y": 13 };
function rocDateToEpoch(s) {
  const m = String(s || "").split("/");
  if (m.length !== 3) return 0;
  return Date.UTC(+m[0] + 1911, +m[1] - 1, +m[2]) / 1000;
}
async function fetchTwseStockDayChart(code, range) {
  const cfg = TW_CHART_RANGES.find(r => r.key === range) || TW_CHART_RANGES[3];
  const months = TWSE_CHART_MONTHS[range];
  if (!months) throw new Error("此區間無證交所備援");
  const cacheKey = `${code}.TWSE|${range}`;
  if (TW_CHART_CACHE[cacheKey]) return TW_CHART_CACHE[cacheKey];
  const now = new Date();
  const yms = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    yms.push(`${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}01`);
  }
  const results = await Promise.allSettled(yms.map(ym => fetchTwseStockDay(code, ym)));
  const points = [];
  for (const r of results) {
    if (r.status !== "fulfilled") continue;
    for (const row of r.value) {
      const c = parseTwseNum(row[6]);
      if (c == null) continue;
      points.push({ t: rocDateToEpoch(row[0]), c, v: parseTwseNum(row[1]) || 0 });
    }
  }
  points.sort((a, b) => a.t - b.t);
  if (points.length < 2) throw new Error("STOCK_DAY 無足夠資料");
  const out = { ok: true, symbol: `${code}.TW`, range, ma: cfg.ma, interval: "1d", points, currency: "TWD", source: "TWSE 證交所" };
  TW_CHART_CACHE[cacheKey] = out;
  return out;
}

function calcMA(points, period) {
  const out = new Array(points.length).fill(null);
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    sum += points[i].c;
    if (i >= period) sum -= points[i - period].c;
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

function renderPriceChart(chart) {
  const pts = chart.points;
  const n = pts.length;
  const W = 640, H = 300, padL = 4, padR = 50, padT = 10, padB = 14;
  const priceH = 196, gap = 16;
  const volTop = padT + priceH + gap;
  const volH = H - volTop - padB;
  const closes = pts.map(p => p.c);
  const ma1 = calcMA(pts, chart.ma[0]);
  const ma2 = calcMA(pts, chart.ma[1]);
  const vals = closes.concat(ma1.filter(v => v != null), ma2.filter(v => v != null));
  let lo = Math.min(...vals), hi = Math.max(...vals);
  const pv = (hi - lo) * 0.06 || (hi * 0.02) || 1;
  lo -= pv; hi += pv;
  const span = hi - lo || 1;
  const plotW = W - padL - padR;
  const X = i => padL + (n <= 1 ? plotW : (i / (n - 1)) * plotW);
  const Y = v => padT + priceH - ((v - lo) / span) * priceH;
  const path = arr => {
    let d = "", on = false;
    for (let i = 0; i < n; i++) {
      const v = arr[i];
      if (v == null) { on = false; continue; }
      d += (on ? "L" : "M") + X(i).toFixed(1) + "," + Y(v).toFixed(1);
      on = true;
    }
    return d;
  };
  let grid = "";
  for (let g = 0; g <= 3; g++) {
    const v = lo + (span * g / 3);
    const y = Y(v).toFixed(1);
    grid += `<line x1="${padL}" y1="${y}" x2="${(padL + plotW).toFixed(1)}" y2="${y}" stroke="#eceff3" stroke-width="1"/>`;
    grid += `<text x="${(W - padR + 4).toFixed(1)}" y="${(+y + 3.5).toFixed(1)}" font-size="11" fill="#9aa3af">${fmtNum(v, 2)}</text>`;
  }
  const maxVol = Math.max(...pts.map(p => p.v || 0)) || 1;
  const bw = Math.max(0.6, (plotW / n) * 0.72);
  let volBars = "";
  for (let i = 0; i < n; i++) {
    const h = ((pts[i].v || 0) / maxVol) * volH;
    const up = i === 0 ? true : pts[i].c >= pts[i - 1].c;
    volBars += `<rect x="${(X(i) - bw / 2).toFixed(1)}" y="${(volTop + volH - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0.4, h).toFixed(1)}" fill="${up ? "#d62828" : "#2a9d8f"}" opacity="0.45"/>`;
  }
  const last = closes[n - 1];
  const lastY = Y(last);
  const lastColor = last >= closes[0] ? "#d62828" : "#2a9d8f";
  const marker = `<line x1="${padL}" y1="${lastY.toFixed(1)}" x2="${(padL + plotW).toFixed(1)}" y2="${lastY.toFixed(1)}" stroke="${lastColor}" stroke-width="1" stroke-dasharray="3 3" opacity="0.6"/>
    <rect x="${(W - padR).toFixed(1)}" y="${(lastY - 8).toFixed(1)}" width="${padR}" height="16" rx="2" fill="${lastColor}"/>
    <text x="${(W - padR + padR / 2).toFixed(1)}" y="${(lastY + 3.5).toFixed(1)}" font-size="11" font-weight="700" fill="#fff" text-anchor="middle">${fmtNum(last, 2)}</text>`;
  return `<svg class="tw-chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="價格走勢圖">
    ${grid}${volBars}
    <path d="${path(closes)}" fill="none" stroke="#111827" stroke-width="1.4"/>
    <path d="${path(ma1)}" fill="none" stroke="${TW_MA_COLORS[0]}" stroke-width="1.2" opacity="0.95"/>
    <path d="${path(ma2)}" fill="none" stroke="${TW_MA_COLORS[1]}" stroke-width="1.2" opacity="0.95"/>
    ${marker}
  </svg>`;
}

function renderTwChartWrap(code, chart, errMsg) {
  const btns = TW_CHART_RANGES.map(r =>
    `<button type="button" class="tw-chart-rng${r.key === TW_CHART_RANGE ? " active" : ""}" onclick="switchTwChartRange('${code}','${r.key}')">${r.label}</button>`
  ).join("");
  let body;
  if (errMsg) {
    body = `<div class="tw-chart-msg">走勢圖載入失敗（${escapeHtml(errMsg)}）。可點下方「TradingView」看完整線圖。</div>`;
  } else if (!chart) {
    body = `<div class="tw-chart-msg">載入走勢圖中…</div>`;
  } else {
    const unit = chart.interval === "1wk" ? "週" : "日";
    const legend = `<div class="tw-chart-legend">
      <span><i style="background:#111827"></i>收盤</span>
      <span><i style="background:${TW_MA_COLORS[0]}"></i>${chart.ma[0]}${unit}均</span>
      <span><i style="background:${TW_MA_COLORS[1]}"></i>${chart.ma[1]}${unit}均</span>
      <span><i class="tw-vol-key"></i>成交量</span>
    </div>`;
    const src = chart.source || "Yahoo Finance";
    const fb = chart.fallbackFrom ? `<span class="tw-snap-fallback"> · 主源 Yahoo 失敗已切換證交所</span>` : "";
    body = legend + renderPriceChart(chart) + `<div class="tw-chart-foot">資料源：${escapeHtml(src)}（瀏覽器直接抓取，無中介伺服器）${fb}</div>`;
  }
  return `<div class="tw-chart-rngs">${btns}</div><div class="tw-chart-area">${body}</div>`;
}

function switchTwChartRange(code, range) {
  TW_CHART_RANGE = range;
  const rec = twStockFindByCode(code);
  loadTwStockChart(code, rec?.market);
}

async function loadTwStockChart(code, market) {
  const slot = document.getElementById(`tw-chart-${code}`);
  if (!slot) return;
  slot.innerHTML = renderTwChartWrap(code, null, null);
  let chart;
  try {
    chart = await fetchYahooChart(code, market, TW_CHART_RANGE);
  } catch (e) {
    const yahooErr = String(e.message || e);
    // 上市股 1M~1Y 區間：Yahoo 失敗改用證交所 STOCK_DAY 備援
    if (market !== "上櫃" && market !== "興櫃" && TWSE_CHART_MONTHS[TW_CHART_RANGE]) {
      try {
        chart = await fetchTwseStockDayChart(code, TW_CHART_RANGE);
        chart.fallbackFrom = yahooErr;
      } catch (e2) {
        const s = document.getElementById(`tw-chart-${code}`);
        if (s) s.innerHTML = renderTwChartWrap(code, null, `Yahoo：${yahooErr}；證交所備援：${String(e2.message || e2)}`);
        return;
      }
    } else {
      const s = document.getElementById(`tw-chart-${code}`);
      if (s) s.innerHTML = renderTwChartWrap(code, null, yahooErr);
      return;
    }
  }
  const s2 = document.getElementById(`tw-chart-${code}`);
  if (s2) s2.innerHTML = renderTwChartWrap(code, chart, null);
}

// ============ 基本面快覽 (Valuation grid) ============
const TW_BWIBBU_CACHE = {};  // key: yyyymmdd -> map(code -> row)，上市估值
let TPEX_PE_PROMISE = null;  // 上櫃估值（OpenAPI）

async function fetchBwibbuMap() {
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const ymd = fmtTwseDateYmd(d);
    if (TW_BWIBBU_CACHE[ymd]) return { date: ymd, map: TW_BWIBBU_CACHE[ymd] };
    try {
      const url = `https://www.twse.com.tw/rwd/zh/afterTrading/BWIBBU_d?date=${ymd}&selectType=ALL&response=json`;
      const r = await fetch(url, { mode: "cors" });
      if (!r.ok) continue;
      const j = await r.json();
      if (j.stat !== "OK" || !Array.isArray(j.data) || !j.data.length) continue;
      const map = {};
      for (const row of j.data) map[String(row[0]).trim()] = row;
      TW_BWIBBU_CACHE[ymd] = map;
      return { date: ymd, map };
    } catch (e) { /* try previous day */ }
  }
  throw new Error("近 5 日無估值資料");
}

function loadTpexPeMap() {
  if (!TPEX_PE_PROMISE) {
    TPEX_PE_PROMISE = fetch("https://www.tpex.org.tw/openapi/v1/tpex_mainboard_peratio_analysis", { mode: "cors" })
      .then(r => { if (!r.ok) throw new Error(`TPEx PE ${r.status}`); return r.json(); })
      .then(arr => {
        const map = {};
        for (const o of (arr || [])) map[String(o.SecuritiesCompanyCode).trim()] = o;
        return map;
      })
      .catch(e => { TPEX_PE_PROMISE = null; throw e; });
  }
  return TPEX_PE_PROMISE;
}

function rocYmdToIso(s) {
  const t = String(s || "");
  if (t.length < 7) return "";
  return `${parseInt(t.slice(0, 3)) + 1911}-${t.slice(3, 5)}-${t.slice(5, 7)}`;
}

async function fetchTwValuation(code, market) {
  const out = { ok: true, code, market };
  const isOtc = market === "上櫃";
  try {
    if (isOtc) {
      const map = await loadTpexPeMap();
      const o = map[code];
      if (o) {
        out.per = parseTwseNum(o.PriceEarningRatio);
        out.pbr = parseTwseNum(o.PriceBookRatio);
        out.yield = parseTwseNum(o.YieldRatio);
        out.valDate = rocYmdToIso(o.Date);
        out.valSrc = "TPEx 櫃買";
      }
    } else {
      const { date, map } = await fetchBwibbuMap();
      const row = map[code];
      if (row) {
        out.yield = parseTwseNum(row[3]);
        out.per = parseTwseNum(row[5]);
        out.pbr = parseTwseNum(row[6]);
        out.valDate = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6)}`;
        out.valSrc = "TWSE 證交所";
      }
    }
  } catch (e) { out.valErr = e.message; }
  try {
    const [incArr, balArr] = await Promise.all([loadTwBulkLocal("tw_income"), loadTwBulkLocal("tw_balance")]);
    const inc = (incArr || []).find(r => r.code === code) || null;
    const bal = (balArr || []).find(r => r.code === code) || null;
    if (inc) {
      out.eps = parseTwseNum(inc.eps);
      const rev = parseTwseNum(inc.revenue), ni = parseTwseNum(inc.net_income);
      out.npm = (rev && ni != null) ? (ni / rev * 100) : null;
      out.finYr = parseInt(inc.year) + 1911;
      out.finQ = inc.quarter;
      if (bal) {
        const eq = parseTwseNum(bal.total_equity);
        if (ni != null && eq) out.roe = (ni / eq) * 100;  // 單季 ROE
      }
    }
  } catch (e) { out.finErr = e.message; }
  return out;
}

function renderValuationGrid(v) {
  if (!v) return `<div class="tw-val-msg">載入基本面中…</div>`;
  const num = (x, suffix = "", dp = 2) => (x == null || !Number.isFinite(x)) ? "—" : `${fmtNum(x, dp)}${suffix}`;
  const finSub = (v.finYr && v.finQ) ? `${v.finYr}Q${v.finQ} 單季` : "";
  const valSub = v.valSrc ? `${v.valSrc}${v.valDate ? " " + v.valDate : ""}` : "";
  const cell = (label, value, sub) => `
    <div class="tw-val-cell">
      <div class="tw-val-num">${value}</div>
      <div class="tw-val-lbl">${escapeHtml(label)}</div>
      ${sub ? `<div class="tw-val-sub">${escapeHtml(sub)}</div>` : ""}
    </div>`;
  const cells = [
    cell("本益比 P/E", num(v.per), valSub),
    cell("股價淨值比 P/B", num(v.pbr), valSub),
    cell("殖利率", num(v.yield, "%"), valSub),
    cell("EPS", num(v.eps, " 元"), finSub),
    cell("ROE", num(v.roe, "%"), finSub),
    cell("淨利率", num(v.npm, "%"), finSub),
  ].join("");
  const note = (v.valErr && v.per == null) ? `<div class="tw-val-note">估值（P/E·P/B·殖利率）暫無：${escapeHtml(v.valErr)}，可點下方連結至外站查。</div>` : "";
  return `<div class="tw-val-grid">${cells}</div>${note}
    <div class="tw-val-foot">P/E·P/B·殖利率取自${v.market === "上櫃" ? "證券櫃買中心 OpenAPI" : "證交所 BWIBBU 每日揭露"}；EPS·ROE·淨利率由 MOPS 最新季報計算${v.finYr ? `（${v.finYr}Q${v.finQ}）` : ""}。ROE、淨利率為單季數值，非近四季 TTM，與其他網站年度數可能有別。</div>`;
}

async function loadTwStockValuation(code, market) {
  const slot = document.getElementById(`tw-val-${code}`);
  if (!slot) return;
  let v;
  try { v = await fetchTwValuation(code, market); }
  catch (e) { v = { ok: false, market, valErr: String(e.message || e) }; }
  const s2 = document.getElementById(`tw-val-${code}`);
  if (s2) s2.innerHTML = renderValuationGrid(v);
}

// ============ 月營收走勢（逐月累積） ============
let TW_REV_HIST_PROMISE = null;
function loadTwRevenueHistory() {
  if (!TW_REV_HIST_PROMISE) {
    TW_REV_HIST_PROMISE = fetch(`data/tw_revenue_history.json?t=${Date.now()}`)
      .then(r => { if (!r.ok) throw new Error(`revenue_history ${r.status}`); return r.json(); })
      .catch(e => { TW_REV_HIST_PROMISE = null; throw e; });
  }
  return TW_REV_HIST_PROMISE;
}

function renderRevenueBars(series) {
  const n = series.length;
  const W = 560, H = 140, padT = 6, padB = 18;
  const plotH = H - padT - padB;
  const revs = series.map(e => parseTwseNum(e.rev) || 0);
  const maxR = Math.max(1, ...revs);
  const step = W / n, bw = Math.max(2, step * 0.6);
  const baseY = padT + plotH;
  const bars = series.map((e, i) => {
    const r = parseTwseNum(e.rev) || 0;
    const h = (r / maxR) * plotH;
    const x = (i + 0.5) * step;
    const yoy = e.yoy == null ? null : parseTwseNum(e.yoy);
    const color = yoy == null ? "#9aa3af" : yoy > 0 ? "#d62828" : yoy < 0 ? "#2a9d8f" : "#9aa3af";
    return `<rect x="${(x - bw / 2).toFixed(1)}" y="${(baseY - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0.6, h).toFixed(1)}" fill="${color}" opacity="0.85"/>`;
  }).join("");
  const firstLbl = fmtYyyymmFromRoc(series[0].ym);
  const lastLbl = fmtYyyymmFromRoc(series[n - 1].ym);
  return `<svg class="tw-rev-bars" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
    <line x1="0" y1="${baseY}" x2="${W}" y2="${baseY}" stroke="#d7dde3" stroke-width="0.8"/>${bars}</svg>
    <div class="tw-rev-axis"><span>${escapeHtml(firstLbl)}</span><span>${escapeHtml(lastLbl)}</span></div>`;
}

function renderRevenueTrend(series, source, errMsg) {
  if (errMsg) return `<div class="tw-rev-msg">月營收走勢載入失敗（${escapeHtml(errMsg)}）。</div>`;
  if (series === null) return `<div class="tw-rev-msg">載入月營收中…</div>`;
  if (!series || !series.length) return `<div class="tw-rev-msg">查無月營收歷史（此標的可能無月營收揭露）。</div>`;
  const latest = series[series.length - 1];
  let streak = 0;
  for (let i = series.length - 1; i >= 0; i--) {
    const y = series[i].yoy == null ? null : parseTwseNum(series[i].yoy);
    if (y != null && y > 0) streak++; else break;
  }
  const yoyCls = pctClass(latest.yoy);
  const streakBadge = streak >= 2 ? `<span class="tw-rev-streak">連續 ${streak} 月 YoY 正成長</span>` : "";
  const headline = `<div class="tw-rev-headline">
      <span class="tw-rev-hl-main">${fmtYyyymmFromRoc(latest.ym)} 營收 <b>${fmtRevenue(latest.rev)}</b></span>
      <span class="tw-rev-hl-yoy">YoY <span class="${yoyCls}">${fmtPct(latest.yoy)}</span></span>
      ${streakBadge}
    </div>`;
  const body = series.length >= 2
    ? renderRevenueBars(series)
    : `<div class="tw-rev-accum">月營收歷史累積中（目前 ${series.length} 個月）。</div>`;
  return `<div class="tw-rev-trend">
      ${headline}
      ${body}
      <div class="tw-rev-foot">紅為 YoY 正成長、綠為衰退、灰為無 YoY；單位金額已換算。資料源：${escapeHtml(source || "—")}。原始揭露以 MOPS／TWSE 為準。</div>
    </div>`;
}

const TW_FINMIND_REV_CACHE = {};
async function fetchFinmindRevenue(code) {
  if (TW_FINMIND_REV_CACHE[code]) return TW_FINMIND_REV_CACHE[code];
  const d = new Date();
  const back = new Date(d.getFullYear(), d.getMonth() - 40, 1);
  const start = `${back.getFullYear()}-${String(back.getMonth() + 1).padStart(2, "0")}-01`;
  const url = `https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockMonthRevenue&data_id=${encodeURIComponent(code)}&start_date=${start}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`FinMind ${r.status}`);
  const j = await r.json();
  if (j.status !== 200 && j.msg !== "success") throw new Error(`FinMind ${j.msg || j.status}`);
  const rows = j.data || [];
  if (rows.length < 2) throw new Error("FinMind 無資料");
  const list = [];
  for (const row of rows) {
    const ry = row.revenue_year, rm = row.revenue_month, rev = row.revenue;
    if (ry == null || rm == null || rev == null) continue;
    list.push({ ym: `${ry - 1911}${String(rm).padStart(2, "0")}`, ry, rm, revNum: rev });
  }
  list.sort((a, b) => a.ym.localeCompare(b.ym));
  const byYM = {};
  for (const e of list) byYM[`${e.ry}-${e.rm}`] = e.revNum;
  const series = list.map(e => {
    const prev = byYM[`${e.ry - 1}-${e.rm}`];
    const yoy = (prev && prev !== 0) ? ((e.revNum - prev) / prev * 100) : null;
    return { ym: e.ym, rev: String(Math.round(e.revNum / 1000)), yoy: yoy == null ? null : String(yoy) };
  }).slice(-24);
  if (!series.length) throw new Error("FinMind 解析後為空");
  TW_FINMIND_REV_CACHE[code] = series;
  return series;
}

async function loadTwStockRevenueTrend(code) {
  const slot = document.getElementById(`tw-rev-trend-${code}`);
  if (!slot) return;
  let series = null, source = "";
  try {
    series = await fetchFinmindRevenue(code);  // 一次補滿近 24 個月
    source = "FinMind（彙整 TWSE／MOPS 月營收）";
  } catch (e1) {
    try {
      const hist = await loadTwRevenueHistory();  // 備援：本地逐月累積
      series = (hist.codes && hist.codes[code]) || [];
      source = "TWSE／櫃買月營收（本地逐月累積）";
    } catch (e2) {
      const s = document.getElementById(`tw-rev-trend-${code}`);
      if (s) s.innerHTML = renderRevenueTrend(undefined, "", `FinMind：${e1.message}；本地：${e2.message}`);
      return;
    }
  }
  const s2 = document.getElementById(`tw-rev-trend-${code}`);
  if (s2) s2.innerHTML = renderRevenueTrend(series, source, null);
}

// ============ 法人動向（近 N 個交易日三大法人趨勢，上市） ============
let TW_INST_HIST_PROMISE = null;
function loadTwInstHistory() {
  if (!TW_INST_HIST_PROMISE) {
    TW_INST_HIST_PROMISE = fetch(`data/tw_inst_history.json?t=${Date.now()}`)
      .then(r => { if (!r.ok) throw new Error(`inst_history ${r.status}`); return r.json(); })
      .catch(e => { TW_INST_HIST_PROMISE = null; throw e; });
  }
  return TW_INST_HIST_PROMISE;
}

function fmtLots(n) {  // 張 → 張／萬張，帶正負號
  if (n == null || !Number.isFinite(n)) return "—";
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  const a = Math.abs(n);
  if (a >= 10000) return `${sign}${(a / 10000).toFixed(1)} 萬張`;
  return `${sign}${a.toLocaleString("zh-TW")} 張`;
}

function renderInstBarRow(label, arr) {
  const a = arr || [];
  const n = a.length || 1;
  const sum = a.reduce((s, v) => s + (v || 0), 0);
  const sumCls = sum > 0 ? "tw-up" : sum < 0 ? "tw-down" : "tw-flat";
  const maxAbs = Math.max(1, ...a.map(v => Math.abs(v || 0)));
  const W = 300, H = 44, mid = H / 2;
  const step = W / n, bw = Math.max(1, step * 0.66);
  const bars = a.map((v, i) => {
    const x = (i + 0.5) * step;
    const h = (Math.abs(v || 0) / maxAbs) * (mid - 2);
    const up = (v || 0) >= 0;
    const y = up ? mid - h : mid;
    return `<rect x="${(x - bw / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0.6, h).toFixed(1)}" fill="${up ? "#d62828" : "#2a9d8f"}" opacity="0.82"/>`;
  }).join("");
  return `<div class="tw-inst-row">
    <div class="tw-inst-row-head"><span class="tw-inst-row-lbl">${escapeHtml(label)}</span><span class="tw-inst-row-sum ${sumCls}">Σ ${fmtLots(sum)}</span></div>
    <svg class="tw-inst-bars" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="${mid}" x2="${W}" y2="${mid}" stroke="#d7dde3" stroke-width="0.8"/>${bars}</svg>
  </div>`;
}

function renderInstTrend(code, hist, errMsg, isOtc) {
  if (isOtc) return `<div class="tw-inst-msg">上櫃／興櫃股的三大法人趨勢 TWSE T86 未涵蓋，請點下方「三大法人買賣超」連結至 Yahoo。</div>`;
  if (errMsg) return `<div class="tw-inst-msg">法人動向載入失敗（${escapeHtml(errMsg)}）。</div>`;
  if (!hist) return `<div class="tw-inst-msg">載入法人動向中…</div>`;
  const c = hist.codes?.[code];
  const dates = hist.dates || [];
  if (!c || !dates.length) return `<div class="tw-inst-msg">查無此檔近期三大法人資料（近期可能無交易）。</div>`;
  const fmtD = s => `${s.slice(4, 6)}/${s.slice(6, 8)}`;
  const span = `${fmtD(dates[0])}～${fmtD(dates[dates.length - 1])}（${dates.length} 個交易日）`;
  const totSum = (c.tot || []).reduce((s, v) => s + (v || 0), 0);
  const totCls = totSum > 0 ? "tw-up" : totSum < 0 ? "tw-down" : "tw-flat";
  return `
    <div class="tw-inst-trend">
      <div class="tw-inst-trend-head">
        <span class="tw-inst-trend-title">三大法人合計 <span class="${totCls}">Σ ${fmtLots(totSum)}</span></span>
        <span class="tw-inst-trend-span">${escapeHtml(span)}</span>
      </div>
      ${renderInstBarRow("外資", c.f)}
      ${renderInstBarRow("投信", c.t)}
      ${renderInstBarRow("自營商", c.d)}
      <div class="tw-inst-trend-foot">紅為買超、綠為賣超，單位：張。資料源：TWSE 證交所 T86（每日盤後揭露），最終以官方為準。</div>
    </div>`;
}

async function loadTwStockInstTrend(code, market) {
  const slot = document.getElementById(`tw-inst-trend-${code}`);
  if (!slot) return;
  if (market === "上櫃" || market === "興櫃") {
    slot.innerHTML = renderInstTrend(code, null, null, true);
    return;
  }
  let hist;
  try { hist = await loadTwInstHistory(); }
  catch (e) {
    const s = document.getElementById(`tw-inst-trend-${code}`);
    if (s) s.innerHTML = renderInstTrend(code, null, String(e.message || e), false);
    return;
  }
  const s2 = document.getElementById(`tw-inst-trend-${code}`);
  if (s2) s2.innerHTML = renderInstTrend(code, hist, null, false);
}

async function loadTwStockSnapshot(code, market) {
  const slot = document.getElementById(`tw-snap-${code}`);
  if (!slot) {
    console.warn("[twstock] snapshot slot not found for", code);
    return;
  }
  let snap;
  try {
    snap = await fetchTwStockSnapshot(code, market);
  } catch (e) {
    console.error("[twstock] snapshot fetch threw:", e);
    snap = { ok: false, error: `未預期錯誤：${e.message || e}` };
  }
  const slot2 = document.getElementById(`tw-snap-${code}`);
  if (!slot2) {
    console.warn("[twstock] snapshot slot disappeared for", code);
    return;
  }
  const rec = twStockFindByCode(code);
  try {
    slot2.outerHTML = `<div id="tw-snap-${code}" class="tw-snap-wrap">${renderTwStockSnapshot(snap, rec)}</div>`;
  } catch (e) {
    console.error("[twstock] snapshot render threw:", e);
    slot2.outerHTML = `<div id="tw-snap-${code}" class="tw-snap-wrap"><div class="tw-snap-err">摘要顯示異常（${escapeHtml(String(e.message || e))}），請改點下方連結。</div></div>`;
  }
  // 綜合小結：snap 資料先入 cache
  if (snap && snap.ok) updateTwSummary(code, { snap });
  // 接力載入價格走勢圖（Yahoo 日線）與基本面快覽（P/E、P/B、殖利率、EPS、ROE、淨利率）
  loadTwStockChart(code, market);
  loadTwStockValuation(code, market);
  // 接力載入月營收走勢（逐月累積）與法人動向（近 20 個交易日三大法人趨勢）
  loadTwStockRevenueTrend(code);
  loadTwStockInstTrend(code, market);
  // 接力載入籌碼摘要（三大法人 + 融資融券，僅上市股有 TWSE 籌碼 API）
  if (market !== "上櫃") loadTwStockChips(code);
  // 接力載入公司基本面（公司資料 / 月營收 / 季營益）
  loadTwStockBasic(code, market);
}

// ============ 綜合小結 (Result Summary) ============
const TW_RESULT_CACHE = {};
function updateTwSummary(code, patch) {
  TW_RESULT_CACHE[code] = { ...(TW_RESULT_CACHE[code] || {}), ...patch };
  const slot = document.getElementById(`tw-summary-${code}`);
  if (!slot) return;
  slot.innerHTML = renderTwSummaryBody(TW_RESULT_CACHE[code]);
}
function renderTwSummaryBody(c) {
  if (!c) return `<div class="tw-sum-loading">資料載入中…</div>`;
  const bits = [];
  if (c.snap && c.snap.ok) {
    const pct = Number(c.snap.changePct);
    const cls = pct > 0 ? "tw-up" : pct < 0 ? "tw-down" : "tw-flat";
    const sign = pct > 0 ? "+" : "";
    const chgTxt = c.snap.change != null ? `${sign}${fmtNum(c.snap.change, 2)} ` : "";
    bits.push(`<div class="tw-sum-row"><span class="tw-sum-k">今日報價</span><span class="tw-sum-v">${fmtNum(c.snap.price, 2)} ${c.snap.currency || "TWD"}　<span class="${cls}">${chgTxt}(${sign}${pct.toFixed(1)}%)</span></span></div>`);
  }
  if (c.rev) {
    const yoy = fmtPct(c.rev.yoy_pct);
    const cls = pctClass(c.rev.yoy_pct);
    bits.push(`<div class="tw-sum-row"><span class="tw-sum-k">${fmtYyyymmFromRoc(c.rev.ym)} 月營收</span><span class="tw-sum-v">${fmtRevenue(c.rev.current)}　YoY <span class="${cls}">${yoy}</span></span></div>`);
  }
  if (c.inc) {
    const yr = parseInt(c.inc.year) + 1911;
    const rev = parseTwseNum(c.inc.revenue);
    const gp = parseTwseNum(c.inc.gross_profit);
    const op = parseTwseNum(c.inc.op_income);
    const ni = parseTwseNum(c.inc.net_income);
    const gpm = (rev && gp != null) ? (gp / rev * 100).toFixed(1) : "—";
    const opm = (rev && op != null) ? (op / rev * 100).toFixed(1) : "—";
    const npm = (rev && ni != null) ? (ni / rev * 100).toFixed(1) : "—";
    bits.push(`<div class="tw-sum-row"><span class="tw-sum-k">${yr}Q${c.inc.quarter} 獲利</span><span class="tw-sum-v">毛 ${gpm}%　營益 ${opm}%　純益 ${npm}%　EPS ${c.inc.eps || "—"}</span></div>`);
  }
  if (c.bal && c.bal.bvps) {
    bits.push(`<div class="tw-sum-row"><span class="tw-sum-k">每股淨值</span><span class="tw-sum-v">${c.bal.bvps} 元</span></div>`);
  }
  if (c.t86Row) {
    const total = fmtChipChange(c.t86Row[18]);
    const foreign = fmtChipChange(c.t86Row[4]);
    bits.push(`<div class="tw-sum-row"><span class="tw-sum-k">${c.chipsDate || ""} 三大法人</span><span class="tw-sum-v">合計 <span class="${total.cls}">${total.txt}</span>　外資 <span class="${foreign.cls}">${foreign.txt}</span></span></div>`);
  }
  if (c.margnRow) {
    const finToday = parseTwseNum(c.margnRow[6]);
    const finPrev = parseTwseNum(c.margnRow[5]);
    const finDelta = (finToday != null && finPrev != null) ? finToday - finPrev : null;
    if (finToday != null) {
      const cls = finDelta == null ? "" : finDelta > 0 ? "tw-up" : finDelta < 0 ? "tw-down" : "tw-flat";
      const sign = finDelta == null ? "" : finDelta > 0 ? "+" : finDelta < 0 ? "−" : "";
      const deltaStr = finDelta == null ? "" : `　(<span class="${cls}">${sign}${Math.abs(finDelta).toLocaleString("zh-TW")}</span>)`;
      bits.push(`<div class="tw-sum-row"><span class="tw-sum-k">融資餘額</span><span class="tw-sum-v">${Number(finToday).toLocaleString("zh-TW")} 張${deltaStr}</span></div>`);
    }
  }
  if (!bits.length) return `<div class="tw-sum-loading">資料載入中…</div>`;
  return bits.join("");
}

const TW_BULK_CACHE = {};
async function loadTwBulkLocal(name) {
  if (TW_BULK_CACHE[name]) return TW_BULK_CACHE[name];
  const resp = await fetch(`data/${name}.json?t=${Date.now()}`);
  if (!resp.ok) throw new Error(`local ${name} ${resp.status}`);
  const json = await resp.json();
  if (!Array.isArray(json)) throw new Error(`local ${name} not array`);
  TW_BULK_CACHE[name] = json;
  return json;
}

function fmtTwMoney(s) {  // 整數元 → 億/萬元
  const n = parseTwseNum(s);
  if (n == null) return "—";
  if (Math.abs(n) >= 1e8) return `${(n / 1e8).toFixed(1)} 億元`;
  if (Math.abs(n) >= 1e4) return `${(n / 1e4).toFixed(1)} 萬元`;
  return `${Number(n).toLocaleString("zh-TW", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} 元`;
}
function fmtRevenue(s) {  // 月營收單位為千元
  const n = parseTwseNum(s);
  if (n == null) return "—";
  const val = n * 1000;
  if (Math.abs(val) >= 1e8) return `${(val / 1e8).toFixed(1)} 億元`;
  return `${(val / 1e4).toFixed(1)} 萬元`;
}
function fmtPct(s) {
  if (s === null || s === undefined) return "—";
  const n = parseTwseNum(s);
  if (n == null) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}
function pctClass(s) {
  if (s === null || s === undefined) return "";
  const n = parseTwseNum(s);
  return n > 0 ? "tw-up" : n < 0 ? "tw-down" : "tw-flat";
}
function fmtYyyymmFromRoc(rocYm) {  // "11504" → "2026/04"
  const s = String(rocYm || "");
  if (s.length < 5) return "—";
  const y = parseInt(s.slice(0, -2)) + 1911;
  const m = s.slice(-2);
  return `${y}/${m}`;
}
function fmtDate8(s) {  // "19940905" → "1994-09-05"
  const t = String(s || "");
  if (t.length !== 8) return "—";
  return `${t.slice(0, 4)}-${t.slice(4, 6)}-${t.slice(6)}`;
}

async function fetchTwStockBasic(code, market) {
  const result = { ok: true, info: null, revenue: null, income: null, balance: null };
  const latestByCode = (arr) => {
    const rows = arr.filter(r => r.code === code);
    rows.sort((a, b) => `${b.year}${b.quarter}`.localeCompare(`${a.year}${a.quarter}`));
    return rows[0] || null;
  };
  const promises = [
    loadTwBulkLocal("tw_company_info")
      .then(arr => { result.info = arr.find(r => r.code === code && r.market === market) || null; })
      .catch(e => { result.infoErr = e.message; }),
    loadTwBulkLocal("tw_revenue")
      .then(arr => { result.revenue = arr.find(r => r.code === code && r.market === market) || null; })
      .catch(e => { result.revenueErr = e.message; }),
    loadTwBulkLocal("tw_income")
      .then(arr => { result.income = latestByCode(arr); })
      .catch(e => { result.incomeErr = e.message; }),
    loadTwBulkLocal("tw_balance")
      .then(arr => { result.balance = latestByCode(arr); })
      .catch(e => { result.balanceErr = e.message; }),
  ];
  await Promise.all(promises);
  return result;
}

function fillCardSlot(code, name, html) {
  const slot = document.getElementById(`tw-card-${code}-${name}`);
  if (!slot) return;
  slot.innerHTML = html;
}

function renderCompanyBody(info, isOtc) {
  if (!info) return `<div class="tw-data-card-hint">查無公司資料</div>`;
  return `
    <div><span class="tw-basic-k">董事長</span><span class="tw-basic-v">${escapeHtml(info.chairman || "—")}</span></div>
    <div><span class="tw-basic-k">實收資本</span><span class="tw-basic-v">${fmtTwMoney(info.capital)}</span></div>
    <div><span class="tw-basic-k">${isOtc ? "上櫃日" : "上市日"}</span><span class="tw-basic-v">${fmtDate8(info.list_date)}</span></div>
    <div><span class="tw-basic-k">成立日</span><span class="tw-basic-v">${fmtDate8(info.inc_date)}</span></div>`;
}

function renderRevenueBody(rev) {
  if (!rev) return `<div class="tw-data-card-hint">查無月營收</div>`;
  return `
    <div class="tw-data-card-sub-inline">${fmtYyyymmFromRoc(rev.ym)}</div>
    <div><span class="tw-basic-k">當月營收</span><span class="tw-basic-v">${fmtRevenue(rev.current)}</span></div>
    <div><span class="tw-basic-k">月增率</span><span class="tw-basic-v ${pctClass(rev.mom_pct)}">${fmtPct(rev.mom_pct)}</span></div>
    <div><span class="tw-basic-k">年增率</span><span class="tw-basic-v ${pctClass(rev.yoy_pct)}">${fmtPct(rev.yoy_pct)}</span></div>
    <div><span class="tw-basic-k">累計年增</span><span class="tw-basic-v ${pctClass(rev.cum_yoy_pct)}">${fmtPct(rev.cum_yoy_pct)}</span></div>`;
}

function renderFinanceBody(fin) {  // 舊：用 t187ap17_L；保留作為 fallback / 未來其他用途
  if (!fin) return `<div class="tw-data-card-hint">查無季營益</div>`;
  const yr = parseInt(fin.year) + 1911;
  return `
    <div class="tw-data-card-sub-inline">${yr}Q${escapeHtml(String(fin.quarter))}</div>
    <div><span class="tw-basic-k">營業收入</span><span class="tw-basic-v">${escapeHtml(fin.revenue_m || "—")} 百萬</span></div>
    <div><span class="tw-basic-k">毛利率</span><span class="tw-basic-v">${escapeHtml(fin.gpm || "—")}%</span></div>
    <div><span class="tw-basic-k">營益率</span><span class="tw-basic-v">${escapeHtml(fin.opm || "—")}%</span></div>
    <div><span class="tw-basic-k">稅後純益率</span><span class="tw-basic-v">${escapeHtml(fin.npm || "—")}%</span></div>`;
}

function fmtBigKyuan(s) {  // 損益/資負原始值單位為千元，>=兆級用 兆元
  const n = parseTwseNum(s);
  if (n == null) return "—";
  const yuan = n * 1000;
  if (Math.abs(yuan) >= 1e12) return `${(yuan / 1e12).toFixed(1)} 兆元`;
  if (Math.abs(yuan) >= 1e8) return `${(yuan / 1e8).toFixed(1)} 億元`;
  if (Math.abs(yuan) >= 1e4) return `${(yuan / 1e4).toFixed(1)} 萬元`;
  return `${Number(yuan).toLocaleString("zh-TW", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} 元`;
}

function renderIncomeBody(inc) {
  if (!inc) return `<div class="tw-data-card-hint">查無損益表 (一般業 schema)，請點連結查 Yahoo</div>`;
  const yr = parseInt(inc.year) + 1911;
  const rev = parseTwseNum(inc.revenue);
  const gp = parseTwseNum(inc.gross_profit);
  const op = parseTwseNum(inc.op_income);
  const ni = parseTwseNum(inc.net_income);
  const gpm = (rev && gp != null) ? (gp / rev * 100) : null;
  const opm = (rev && op != null) ? (op / rev * 100) : null;
  const npm = (rev && ni != null) ? (ni / rev * 100) : null;
  return `
    <div class="tw-data-card-sub-inline">${yr}Q${escapeHtml(String(inc.quarter))}</div>
    <div><span class="tw-basic-k">營業收入</span><span class="tw-basic-v">${fmtBigKyuan(inc.revenue)}</span></div>
    <div><span class="tw-basic-k">毛利率</span><span class="tw-basic-v">${gpm != null ? gpm.toFixed(1) + "%" : "—"}</span></div>
    <div><span class="tw-basic-k">營益率</span><span class="tw-basic-v">${opm != null ? opm.toFixed(1) + "%" : "—"}</span></div>
    <div><span class="tw-basic-k">稅後純益率</span><span class="tw-basic-v">${npm != null ? npm.toFixed(1) + "%" : "—"}</span></div>
    <div><span class="tw-basic-k">EPS</span><span class="tw-basic-v">${escapeHtml(inc.eps || "—")} 元</span></div>`;
}

function renderBalanceBody(bal) {
  if (!bal) return `<div class="tw-data-card-hint">查無資產負債表 (一般業 schema)，請點連結查 Yahoo</div>`;
  const yr = parseInt(bal.year) + 1911;
  const assets = parseTwseNum(bal.total_assets);
  const liab = parseTwseNum(bal.total_liab);
  const debtRatio = (assets && liab != null) ? (liab / assets * 100) : null;
  return `
    <div class="tw-data-card-sub-inline">${yr}Q${escapeHtml(String(bal.quarter))}</div>
    <div><span class="tw-basic-k">資產總額</span><span class="tw-basic-v">${fmtBigKyuan(bal.total_assets)}</span></div>
    <div><span class="tw-basic-k">負債總額</span><span class="tw-basic-v">${fmtBigKyuan(bal.total_liab)}</span></div>
    <div><span class="tw-basic-k">權益總額</span><span class="tw-basic-v">${fmtBigKyuan(bal.total_equity)}</span></div>
    <div><span class="tw-basic-k">負債比率</span><span class="tw-basic-v">${debtRatio != null ? debtRatio.toFixed(1) + "%" : "—"}</span></div>
    <div><span class="tw-basic-k">每股淨值</span><span class="tw-basic-v">${escapeHtml(bal.bvps || "—")} 元</span></div>`;
}

async function loadTwStockBasic(code, market) {
  let data;
  try {
    data = await fetchTwStockBasic(code, market);
  } catch (e) {
    console.error("[twstock] basic fetch threw:", e);
    for (const k of ["company", "revenue", "income", "balance"]) {
      fillCardSlot(code, k, `<div class="tw-data-card-hint">載入失敗</div>`);
    }
    return;
  }
  const isOtc = market === "上櫃";
  fillCardSlot(code, "company", renderCompanyBody(data.info, isOtc));
  fillCardSlot(code, "revenue", renderRevenueBody(data.revenue));
  fillCardSlot(code, "income", renderIncomeBody(data.income));
  fillCardSlot(code, "balance", renderBalanceBody(data.balance));
  updateTwSummary(code, { info: data.info, rev: data.revenue, inc: data.income, bal: data.balance });
}

const TW_CHIPS_CACHE = {};
function fmtTwseDateYmd(d) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}
function fmtShareLots(s) {
  const n = parseTwseNum(s);
  if (n == null) return "—";
  const lots = n / 1000;
  if (Math.abs(lots) >= 10000) return `${(lots / 10000).toFixed(1)} 萬張`;
  return `${Math.round(lots).toLocaleString("zh-TW")} 張`;
}
function fmtChipChange(s) {
  const n = parseTwseNum(s);
  if (n == null) return { txt: "—", cls: "tw-flat" };
  const lots = n / 1000;
  const abs = Math.abs(lots);
  const txt = abs >= 10000
    ? `${n > 0 ? "+" : n < 0 ? "−" : ""}${(abs / 10000).toFixed(1)} 萬張`
    : `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.round(abs).toLocaleString("zh-TW")} 張`;
  const cls = n > 0 ? "tw-up" : n < 0 ? "tw-down" : "tw-flat";
  return { txt, cls };
}

async function fetchT86ForDate(date) {
  const url = `https://www.twse.com.tw/rwd/zh/fund/T86?date=${date}&selectType=ALL&response=json`;
  const r = await fetch(url, { mode: "cors" });
  if (!r.ok) throw new Error(`T86 ${r.status}`);
  const j = await r.json();
  if (j.stat !== "OK") throw new Error(`T86 ${j.stat}`);
  return j;
}
async function fetchMargnForDate(date) {
  const url = `https://www.twse.com.tw/rwd/zh/marginTrading/MI_MARGN?date=${date}&selectType=STOCK&response=json`;
  const r = await fetch(url, { mode: "cors" });
  if (!r.ok) throw new Error(`MARGN ${r.status}`);
  const j = await r.json();
  if (j.stat !== "OK") throw new Error(`MARGN ${j.stat}`);
  return j;
}

function chipTryDates(startYmd, count) {
  const dates = [startYmd];
  let cursor = startYmd;
  for (let i = 0; i < count; i++) {
    const y = +cursor.slice(0, 4), m = +cursor.slice(4, 6), d = +cursor.slice(6, 8);
    const prev = new Date(y, m - 1, d - 1);
    cursor = fmtTwseDateYmd(prev);
    dates.push(cursor);
  }
  return dates;
}
function ymdToIso(ymd) {
  return `${ymd.slice(0, 4)}-${ymd.slice(4, 6)}-${ymd.slice(6, 8)}`;
}
// 各資料集獨立往前找最近一個有資料的交易日。
// 三大法人(T86)與融資融券(MI_MARGN)由 TWSE 在不同時點發布，不可綁同一天，
// 否則較慢發布的那一個會把已有最新資料的另一個一起拖回前一日。
async function resolveLatestChip(fetcher, tryDates) {
  for (const date of tryDates) {
    try {
      return { date, data: await fetcher(date) };
    } catch (e) { /* 該日無資料 → 往前一日 */ }
  }
  return null;
}
async function fetchTwStockChips(code) {
  if (TW_CHIPS_CACHE[code]) return TW_CHIPS_CACHE[code];
  // 從今日往前回退（涵蓋週末/連假），不綁定報價快照日：
  // STOCK_DAY 快照走「月鍵」URL，可能被 network-first service worker 快取而落後，
  // 綁它會讓籌碼日期被一併鎖在舊日。
  const tryDates = chipTryDates(fmtTwseDateYmd(new Date()), 7);
  const [t86Res, margnRes] = await Promise.all([
    resolveLatestChip(fetchT86ForDate, tryDates),
    resolveLatestChip(fetchMargnForDate, tryDates),
  ]);
  if (!t86Res && !margnRes) throw new Error("近 8 日皆無籌碼資料");
  const t86Row = t86Res ? (t86Res.data.data || []).find(r => String(r[0]).trim() === code) : null;
  const margnRow = margnRes ? (margnRes.data.tables?.[1]?.data || []).find(r => String(r[0]).trim() === code) : null;
  const result = {
    ok: true,
    t86Date: t86Res ? ymdToIso(t86Res.date) : null,
    margnDate: margnRes ? ymdToIso(margnRes.date) : null,
    date: t86Res ? ymdToIso(t86Res.date) : (margnRes ? ymdToIso(margnRes.date) : null),
    t86Row,
    margnRow,
  };
  TW_CHIPS_CACHE[code] = result;
  return result;
}

function renderInstBody(date, t86Row) {
  if (!t86Row) return `<div class="tw-data-card-hint">當日無三大法人資料</div>`;
  const foreign = fmtChipChange(t86Row[4]);
  const trust = fmtChipChange(t86Row[10]);
  const dealer = fmtChipChange(t86Row[11]);
  const total = fmtChipChange(t86Row[18]);
  return `
    <div class="tw-data-card-sub-inline">${escapeHtml(date)}</div>
    <div><span class="tw-basic-k">外資</span><span class="tw-basic-v ${foreign.cls}">${foreign.txt}</span></div>
    <div><span class="tw-basic-k">投信</span><span class="tw-basic-v ${trust.cls}">${trust.txt}</span></div>
    <div><span class="tw-basic-k">自營</span><span class="tw-basic-v ${dealer.cls}">${dealer.txt}</span></div>
    <div><span class="tw-basic-k">合計</span><span class="tw-basic-v ${total.cls}">${total.txt}</span></div>`;
}

function renderMarginBody(date, margnRow) {
  if (!margnRow) return `<div class="tw-data-card-hint">當日無融資融券</div>`;
  const finToday = parseTwseNum(margnRow[6]);
  const finPrev = parseTwseNum(margnRow[5]);
  const finDelta = (finToday != null && finPrev != null) ? finToday - finPrev : null;
  const shortToday = parseTwseNum(margnRow[12]);
  const shortPrev = parseTwseNum(margnRow[11]);
  const shortDelta = (shortToday != null && shortPrev != null) ? shortToday - shortPrev : null;
  const deltaTxt = (n) => n == null ? "" : `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("zh-TW")}`;
  const deltaCls = (n) => n > 0 ? "tw-up" : n < 0 ? "tw-down" : "tw-flat";
  return `
    <div class="tw-data-card-sub-inline">${escapeHtml(date)}</div>
    <div><span class="tw-basic-k">融資餘額</span><span class="tw-basic-v">${Number(finToday).toLocaleString("zh-TW")} 張</span></div>
    <div><span class="tw-basic-k">↳ 較前日</span><span class="tw-basic-v ${deltaCls(finDelta)}">${deltaTxt(finDelta)}</span></div>
    <div><span class="tw-basic-k">融券餘額</span><span class="tw-basic-v">${Number(shortToday).toLocaleString("zh-TW")} 張</span></div>
    <div><span class="tw-basic-k">↳ 較前日</span><span class="tw-basic-v ${deltaCls(shortDelta)}">${deltaTxt(shortDelta)}</span></div>`;
}

// Legacy renderTwStockChips kept for backward-compat reference (unused after refactor).
function _renderTwStockChips_unused(data) {
  if (!data || !data.ok) {
    return `<div class="tw-snap-err">籌碼摘要載入失敗${data?.error ? `（${escapeHtml(data.error)}）` : ""}</div>`;
  }
  const { date, t86Row, margnRow } = data;
  const foreign = t86Row ? fmtChipChange(t86Row[4]) : { txt: "—", cls: "tw-flat" };
  const trust = t86Row ? fmtChipChange(t86Row[10]) : { txt: "—", cls: "tw-flat" };
  const dealer = t86Row ? fmtChipChange(t86Row[11]) : { txt: "—", cls: "tw-flat" };
  const total = t86Row ? fmtChipChange(t86Row[18]) : { txt: "—", cls: "tw-flat" };
  const finToday = margnRow ? parseTwseNum(margnRow[6]) : null;
  const finPrev = margnRow ? parseTwseNum(margnRow[5]) : null;
  const finDelta = (finToday != null && finPrev != null) ? finToday - finPrev : null;
  const shortToday = margnRow ? parseTwseNum(margnRow[12]) : null;
  const shortPrev = margnRow ? parseTwseNum(margnRow[11]) : null;
  const shortDelta = (shortToday != null && shortPrev != null) ? shortToday - shortPrev : null;
  const deltaTxt = (n) => n == null ? "" : `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("zh-TW")}`;
  const deltaCls = (n) => n > 0 ? "tw-up" : n < 0 ? "tw-down" : "tw-flat";
  return `
    <div class="tw-chips">
      <div class="tw-chips-title">籌碼摘要 <span class="tw-chips-date">${escapeHtml(date)}</span></div>
      ${t86Row ? `
        <div class="tw-chips-section">
          <div class="tw-chips-section-label">三大法人買賣超（當日）</div>
          <div class="tw-chips-grid">
            <div class="tw-chips-cell"><span class="tw-chips-k">外資</span><span class="tw-chips-v ${foreign.cls}">${foreign.txt}</span></div>
            <div class="tw-chips-cell"><span class="tw-chips-k">投信</span><span class="tw-chips-v ${trust.cls}">${trust.txt}</span></div>
            <div class="tw-chips-cell"><span class="tw-chips-k">自營</span><span class="tw-chips-v ${dealer.cls}">${dealer.txt}</span></div>
            <div class="tw-chips-cell tw-chips-total"><span class="tw-chips-k">合計</span><span class="tw-chips-v ${total.cls}">${total.txt}</span></div>
          </div>
        </div>` : `<div class="tw-chips-section"><div class="tw-chips-empty">當日無三大法人資料</div></div>`}
      ${margnRow ? `
        <div class="tw-chips-section">
          <div class="tw-chips-section-label">融資融券餘額</div>
          <div class="tw-chips-grid">
            <div class="tw-chips-cell">
              <span class="tw-chips-k">融資餘額</span>
              <span class="tw-chips-v">${Number(finToday).toLocaleString("zh-TW")} 張</span>
              ${finDelta != null ? `<span class="tw-chips-delta ${deltaCls(finDelta)}">${deltaTxt(finDelta)}</span>` : ""}
            </div>
            <div class="tw-chips-cell">
              <span class="tw-chips-k">融券餘額</span>
              <span class="tw-chips-v">${Number(shortToday).toLocaleString("zh-TW")} 張</span>
              ${shortDelta != null ? `<span class="tw-chips-delta ${deltaCls(shortDelta)}">${deltaTxt(shortDelta)}</span>` : ""}
            </div>
          </div>
        </div>` : `<div class="tw-chips-section"><div class="tw-chips-empty">當日無融資融券資料</div></div>`}
      <div class="tw-chips-foot">資料源：TWSE 證交所 T86 / MI_MARGN（瀏覽器直接抓取）</div>
    </div>`;
}

async function loadTwStockChips(code) {
  let data;
  try {
    data = await fetchTwStockChips(code);
  } catch (e) {
    console.error("[twstock] chips fetch threw:", e);
    fillCardSlot(code, "inst", `<div class="tw-data-card-hint">載入失敗</div>`);
    fillCardSlot(code, "margin", `<div class="tw-data-card-hint">載入失敗</div>`);
    return;
  }
  if (!data || !data.ok) {
    fillCardSlot(code, "inst", `<div class="tw-data-card-hint">${escapeHtml(data?.error || "無資料")}</div>`);
    fillCardSlot(code, "margin", `<div class="tw-data-card-hint">${escapeHtml(data?.error || "無資料")}</div>`);
    return;
  }
  fillCardSlot(code, "inst", renderInstBody(data.t86Date || data.date, data.t86Row));
  fillCardSlot(code, "margin", renderMarginBody(data.margnDate || data.date, data.margnRow));
  updateTwSummary(code, { t86Row: data.t86Row, margnRow: data.margnRow, chipsDate: data.t86Date || data.date });
}

function twStockFindByCode(code) {
  const list = DATA?.tw_stocks || [];
  if (!Array.isArray(list)) return null;
  return list.find(s => (s.code || "").toUpperCase() === code.toUpperCase()) || null;
}

function twStockSearchByKeyword(kw, limit = 12) {
  const list = DATA?.tw_stocks || [];
  if (!Array.isArray(list) || !kw) return [];
  const q = kw.trim();
  if (!q) return [];
  const inFilter = (s) => twMegaIncludes(s.industry || "其他", TW_INDUSTRY_FILTER);
  const starts = [], contains = [];
  for (const s of list) {
    if (!inFilter(s)) continue;
    const name = s.name || "";
    if (name === q) starts.unshift(s);
    else if (name.startsWith(q)) starts.push(s);
    else if (name.includes(q)) contains.push(s);
    if (starts.length + contains.length >= limit * 3) break;
  }
  return [...starts, ...contains].slice(0, limit);
}

// 各大類代表股 (市值/知名度排序)，給熱門快選
const TW_MEGA_REPRESENTATIVES = {
  "科技電子": ["2330", "2317", "2454", "3008", "2382", "2308", "2303", "2376"],
  "金融保險": ["2882", "2891", "2881", "2884", "2886", "2883", "2887", "2890"],
  "生技醫療": ["4174", "6446", "1707", "4137", "4123", "4147", "1789", "6505"],
  "傳產製造": ["1301", "1303", "2002", "1216", "1326", "1101", "1102", "2105"],
  "民生服務": ["2603", "2609", "2615", "2912", "2412", "2207", "2911", "2204"],
  "ETF": ["0050", "0056", "00878", "00713", "00919", "00940", "00936", "006208"],
};
function twIndustryQuickPicks(megaName, limit = 12) {
  const list = DATA?.tw_stocks || [];
  if (megaName === "全部") return TW_STOCK_QUICKPICK;
  const reps = TW_MEGA_REPRESENTATIVES[megaName];
  if (reps && reps.length) {
    const picks = [];
    for (const code of reps) {
      const s = list.find(x => x.code === code);
      if (s) picks.push({ code: s.code, name: s.name });
      if (picks.length >= limit) break;
    }
    if (picks.length) return picks;
  }
  // fallback：取該大類前 N 檔
  return list.filter(s => twMegaIncludes(s.industry || "其他", megaName)).slice(0, limit).map(s => ({ code: s.code, name: s.name }));
}

function twStockLinks(code) {
  const yh = `https://tw.stock.yahoo.com/quote/${code}.TW`;
  const mops = `https://mopsov.twse.com.tw/mops/web`;
  return {
    realtime: [
      { label: "Yahoo 股市", url: yh },
      { label: "TradingView", url: `https://www.tradingview.com/symbols/TWSE-${code}/` },
    ],
    pass1: [
      { label: "公司資料", url: `${yh}/profile` },
      { label: "月營收", url: `${yh}/revenue` },
      { label: "損益表（季）", url: `${yh}/income-statement` },
      { label: "資產負債表", url: `${yh}/balance-sheet` },
      { label: "現金流量表", url: `${yh}/cash-flow-statement` },
      { label: "重大訊息／新聞", url: `${yh}/news` },
      { label: "MOPS 公司資料（原始揭露）", url: `${mops}/t05st01?co_id=${code}` },
      { label: "MOPS 月營收（原始揭露）", url: `${mops}/t146sb05?co_id=${code}` },
    ],
    pass2: [
      { label: "三大法人買賣超", url: `${yh}/institutional-trading` },
      { label: "融資融券（資券變化）", url: `${yh}/margin` },
    ],
    secondary: [
      { label: "Goodinfo!", url: `https://goodinfo.tw/StockInfo/StockDetail.asp?STOCK_ID=${code}` },
      { label: "財報狗", url: `https://statementdog.com/analysis/${code}` },
      { label: "HiStock", url: `https://histock.tw/stock/${code}` },
      { label: "CMoney 同學會", url: `https://www.cmoney.tw/forum/stock/${code}` },
    ],
  };
}

function renderTwStockResults(code) {
  delete TW_RESULT_CACHE[code];
  const rec = twStockFindByCode(code);
  const groups = twStockLinks(code);
  const isOtc = rec?.market === "上櫃";
  const linkBtn = (l) => `<a class="tw-link" href="${escapeHtml(l.url)}" target="_blank" rel="noopener">${escapeHtml(l.label)}</a>`;
  const linkSection = (title, color, items) => `
    <div class="tw-res-section">
      <div class="tw-res-title" style="color:${color}">${escapeHtml(title)}</div>
      <div class="tw-res-links">${items.map(linkBtn).join("")}</div>
    </div>`;
  const dataCard = (slotId, title, sub, linkHref, linkLabel = "查詳細", extra = null) => {
    const mainLink = `<a class="tw-data-card-link" href="${escapeHtml(linkHref)}" target="_blank" rel="noopener">${escapeHtml(linkLabel)} →</a>`;
    const foot = extra
      ? `<div class="tw-data-card-foot">${mainLink}<a class="tw-data-card-link" href="${escapeHtml(extra.href)}" target="_blank" rel="noopener">${escapeHtml(extra.label)} →</a></div>`
      : mainLink;
    return `
    <div class="tw-data-card">
      <div class="tw-data-card-title">${escapeHtml(title)}${sub ? ` <span class="tw-data-card-sub">${escapeHtml(sub)}</span>` : ""}</div>
      <div class="tw-data-card-body" id="${slotId}">
        <div class="tw-data-card-loading">載入中…</div>
      </div>
      ${foot}
    </div>`;
  };
  const noDataCard = (title, linkHref, hint = "點下方連結至外站查") => `
    <div class="tw-data-card tw-data-card-plain">
      <div class="tw-data-card-title">${escapeHtml(title)}</div>
      <div class="tw-data-card-body"><div class="tw-data-card-hint">${escapeHtml(hint)}</div></div>
      <a class="tw-data-card-link" href="${escapeHtml(linkHref)}" target="_blank" rel="noopener">查詳細 →</a>
    </div>`;
  const yh = `https://tw.stock.yahoo.com/quote/${code}.TW`;
  const mops = `https://mopsov.twse.com.tw/mops/web`;
  const marketBadge = rec
    ? `<span class="tw-res-market tw-res-market-${isOtc ? "otc" : "listed"}">${escapeHtml(rec.market || "")}</span>`
    : "";
  const nameSpan = rec
    ? `<span class="tw-res-name">${escapeHtml(rec.name)}</span>`
    : `<span class="tw-res-hint">查無此代號（仍可直接點擊下方連結試查）</span>`;
  // PASS 1 卡片：4 張 data card + 4 張 plain card
  const pass1Cards = [
    dataCard(`tw-card-${code}-company`, "公司資料", "", `${yh}/profile`, "查 Yahoo", { href: `${mops}/t05st01?co_id=${code}`, label: "MOPS 原始揭露" }),
    dataCard(`tw-card-${code}-revenue`, "月營收", "", `${yh}/revenue`, "查 Yahoo", { href: `${mops}/t146sb05?co_id=${code}`, label: "MOPS 原始揭露" }),
    dataCard(`tw-card-${code}-income`, "損益表（季）", "", `${yh}/income-statement`, "查 Yahoo"),
    dataCard(`tw-card-${code}-balance`, "資產負債表（季）", "", `${yh}/balance-sheet`, "查 Yahoo"),
    noDataCard("現金流量表", `${yh}/cash-flow-statement`),
    noDataCard("重大訊息／新聞", `${yh}/news`),
  ].join("");
  // PASS 2 卡片：上市才有資料
  const pass2Cards = isOtc
    ? [
        noDataCard("三大法人買賣超", `${yh}/institutional-trading`, "上櫃股 TWSE 籌碼 API 未提供，請至 Yahoo"),
        noDataCard("融資融券（資券變化）", `${yh}/margin`, "上櫃股 TWSE 籌碼 API 未提供，請至 Yahoo"),
      ].join("")
    : [
        dataCard(`tw-card-${code}-inst`, "三大法人買賣超", "", `${yh}/institutional-trading`, "查 Yahoo"),
        dataCard(`tw-card-${code}-margin`, "融資融券", "", `${yh}/margin`, "查 Yahoo"),
      ].join("");
  return `
    <div class="tw-res-card">
      <div class="tw-res-header">
        <div class="tw-res-id"><span class="tw-res-code">${escapeHtml(code)}</span>${nameSpan}${marketBadge}</div>
        <a class="tw-res-quote" href="${escapeHtml(groups.realtime[0].url)}" target="_blank" rel="noopener">查即時報價 →</a>
      </div>
      <div id="tw-snap-${escapeHtml(code)}" class="tw-snap-wrap"><div class="tw-snap-loading">載入即時行情中…</div></div>
      <div id="tw-chart-${escapeHtml(code)}" class="tw-chart-wrap"><div class="tw-chart-msg">載入走勢圖中…</div></div>
      <div class="tw-res-section">
        <div class="tw-res-title" style="color:#019AB3">基本面</div>
        <div id="tw-val-${escapeHtml(code)}" class="tw-val-wrap"><div class="tw-val-msg">載入基本面中…</div></div>
      </div>
      <div class="tw-res-section">
        <div class="tw-res-title" style="color:#019AB3">月營收</div>
        <div id="tw-rev-trend-${escapeHtml(code)}" class="tw-rev-trend-wrap"><div class="tw-rev-msg">載入月營收中…</div></div>
      </div>
      <div class="tw-res-section">
        <div class="tw-res-title" style="color:#017A8F">法人動向</div>
        <div id="tw-inst-trend-${escapeHtml(code)}" class="tw-inst-trend-wrap"><div class="tw-inst-msg">載入法人動向中…</div></div>
      </div>
      ${linkSection("即時報價", "#019AB3", groups.realtime)}
      <div class="tw-res-section">
        <div class="tw-res-title" style="color:#017A8F">綜合小結</div>
        <div class="tw-summary" id="tw-summary-${escapeHtml(code)}"><div class="tw-sum-loading">資料載入中…</div></div>
      </div>
      <div class="tw-res-section">
        <div class="tw-res-title" style="color:#019AB3">1. 財報與營運</div>
        <div class="tw-data-cards">${pass1Cards}</div>
      </div>
      <div class="tw-res-section">
        <div class="tw-res-title" style="color:#017A8F">2. 籌碼</div>
        <div class="tw-data-cards">${pass2Cards}</div>
      </div>
      ${linkSection("二手研究（快速發現）", "#17B5AD", groups.secondary)}
      <p class="tw-res-note">最終決策請回 MOPS／TWSE 對原始資料。Yahoo 股市為公開揭露摘要，便利檢視用。</p>
    </div>`;
}

function renderTwStockMatchList(matches, keyword) {
  const rows = matches.map(s => `
    <button class="tw-match" type="button" onclick="doTwStockSearch('${s.code}')">
      <span class="tw-match-code">${escapeHtml(s.code)}</span>
      <span class="tw-match-name">${escapeHtml(s.name)}</span>
      <span class="tw-match-market tw-res-market-${s.market === "上櫃" ? "otc" : "listed"}">${escapeHtml(s.market || "")}</span>
    </button>
  `).join("");
  return `
    <div class="tw-matches">
      <div class="tw-matches-title">關鍵字「${escapeHtml(keyword)}」找到 ${matches.length} 檔：</div>
      <div class="tw-matches-list">${rows}</div>
    </div>`;
}

function renderTwIndustryTabs() {
  const items = twMegaList();
  if (!items.length) return "";
  const tabs = `<div class="tabs tabs-wrap tw-ind-tabs" id="tw-ind-tabs">${
    items.map(it => `
      <button class="tab ${TW_INDUSTRY_FILTER === it.name ? "active" : ""}" type="button" onclick="setTwIndustry('${escapeHtml(it.name)}')">
        ${escapeHtml(it.name)} <span class="tw-ind-tab-n">${it.count}</span>
      </button>
    `).join("")
  }</div>`;
  const options = items.map(it =>
    `<option value="${escapeHtml(it.name)}" ${TW_INDUSTRY_FILTER === it.name ? "selected" : ""}>${escapeHtml(it.name)}（${it.count}）</option>`
  ).join("");
  const select = `
    <label class="tw-ind-select-wrap" for="tw-ind-select">
      <span class="tw-ind-select-label">產業大類</span>
      <select id="tw-ind-select" class="tw-ind-select" onchange="setTwIndustry(this.value)">${options}</select>
    </label>`;
  return tabs + select;
}

function setTwIndustry(name) {
  TW_INDUSTRY_FILTER = name;
  // 切換產業時，清空搜尋結果與輸入；如果之前查的股票符合該產業則保留
  const wrap = document.getElementById("tw-stock-result")?.closest(".tw-search-box");
  if (wrap) wrap.outerHTML = renderTwStockSearch();
  wireTwStock();
  // 若有先前查的代號，且仍在新篩選的範圍內（或產業==全部），保留結果
  if (TW_STOCK_QUERY) {
    const rec = twStockFindByCode(TW_STOCK_QUERY);
    const visible = TW_INDUSTRY_FILTER === "全部" || (rec && rec.industry === TW_INDUSTRY_FILTER);
    if (visible && rec) {
      const slot = document.getElementById("tw-stock-result");
      if (slot) {
        slot.innerHTML = renderTwStockResults(TW_STOCK_QUERY);
        loadTwStockSnapshot(TW_STOCK_QUERY, rec?.market);
      }
    }
  }
}

function renderTwStockSearch() {
  const picks = twIndustryQuickPicks(TW_INDUSTRY_FILTER, 12).map(p =>
    `<button class="tw-pick" type="button" onclick="doTwStockSearch('${p.code}')">${p.code} ${escapeHtml(p.name)}</button>`
  ).join("");
  const initialResult = TW_STOCK_QUERY ? renderTwStockResults(TW_STOCK_QUERY) : "";
  const total = Array.isArray(DATA?.tw_stocks) ? DATA.tw_stocks.length : 0;
  const filterHint = TW_INDUSTRY_FILTER === "全部"
    ? (total > 0 ? `已載入 ${total} 檔台股（上市/上櫃/興櫃含 ETF），可輸入代碼或名稱關鍵字` : "")
    : `當前篩選：<b>${escapeHtml(TW_INDUSTRY_FILTER)}</b>，搜尋與熱門只顯示該產業`;
  const placeholder = TW_INDUSTRY_FILTER === "全部"
    ? "輸入台股代碼或公司名稱（如 2330 或 台積電）"
    : `在「${TW_INDUSTRY_FILTER}」中搜尋…（仍可輸入任何代碼直接查）`;
  return `
    <div class="tw-search-box">
      ${renderTwIndustryTabs()}
      <div class="tw-search-row">
        <input id="tw-stock-input" type="text" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(TW_STOCK_QUERY)}" autocomplete="off" role="combobox" aria-autocomplete="list" aria-controls="tw-stock-suggest" aria-expanded="false" />
        <button class="tw-search-btn" type="button" onclick="doTwStockSearch()">搜尋</button>
        <div id="tw-stock-suggest" class="tw-suggest" role="listbox" hidden></div>
      </div>
      <div class="tw-pick-row"><span class="tw-pick-label">${TW_INDUSTRY_FILTER === "全部" ? "熱門" : TW_INDUSTRY_FILTER}：</span>${picks}</div>
      ${filterHint ? `<div class="tw-search-hint">${filterHint}</div>` : ""}
      <div id="tw-stock-result">${initialResult}</div>
    </div>`;
}

function doTwStockSearch(query) {
  let q = query;
  if (q === undefined || q === null) {
    const input = document.getElementById("tw-stock-input");
    if (!input) return;
    q = (input.value || "").trim();
  } else {
    q = String(q).trim();
  }
  hideTwStockSuggest();
  const result = document.getElementById("tw-stock-result");
  if (!result) return;
  if (!q) {
    result.innerHTML = `<div class="tw-warn">請輸入代碼（如 2330）或公司名稱關鍵字（如 台積電）</div>`;
    return;
  }
  // Detect: is this a stock code? Allow digits + optional trailing letter (ETF like 00878, 00400A)
  const codeCandidate = q.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
  const looksLikeCode = /^[0-9]{4,6}[A-Z]?$/.test(codeCandidate);
  if (looksLikeCode) {
    TW_STOCK_QUERY = codeCandidate;
    const input = document.getElementById("tw-stock-input");
    if (input) input.value = codeCandidate;
    result.innerHTML = renderTwStockResults(codeCandidate);
    const rec = twStockFindByCode(codeCandidate);
    loadTwStockSnapshot(codeCandidate, rec?.market);
    setTimeout(() => result.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    return;
  }
  // Keyword search
  const matches = twStockSearchByKeyword(q, 20);
  if (matches.length === 0) {
    result.innerHTML = `<div class="tw-warn">找不到「${escapeHtml(q)}」相符的上市櫃股票。請改用代碼或更短的關鍵字。</div>`;
    return;
  }
  if (matches.length === 1) {
    const rec = matches[0];
    TW_STOCK_QUERY = rec.code;
    const input = document.getElementById("tw-stock-input");
    if (input) input.value = rec.code;
    result.innerHTML = renderTwStockResults(rec.code);
    loadTwStockSnapshot(rec.code, rec.market);
    setTimeout(() => result.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    return;
  }
  result.innerHTML = renderTwStockMatchList(matches, q);
  setTimeout(() => result.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
}

function wireTwStock() {
  const input = document.getElementById("tw-stock-input");
  if (input) {
    input.addEventListener("keydown", (e) => {
      const box = document.getElementById("tw-stock-suggest");
      const open = box && !box.hidden && TW_SUGGEST_STATE.items.length > 0;
      if (e.key === "ArrowDown" && open) {
        e.preventDefault();
        const next = (TW_SUGGEST_STATE.active + 1) % TW_SUGGEST_STATE.items.length;
        setTwSuggestActive(next);
        return;
      }
      if (e.key === "ArrowUp" && open) {
        e.preventDefault();
        const n = TW_SUGGEST_STATE.items.length;
        const prev = (TW_SUGGEST_STATE.active - 1 + n) % n;
        setTwSuggestActive(prev);
        return;
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        hideTwStockSuggest();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (open && TW_SUGGEST_STATE.active >= 0) {
          pickTwStockSuggest(TW_SUGGEST_STATE.active);
        } else {
          doTwStockSearch();
        }
      }
    });
    input.addEventListener("input", (e) => {
      updateTwStockSuggest(e.target.value);
    });
    input.addEventListener("focus", (e) => {
      if ((e.target.value || "").trim()) updateTwStockSuggest(e.target.value);
    });
    input.addEventListener("blur", () => {
      // 延遲關閉，讓 click 先觸發
      setTimeout(hideTwStockSuggest, 150);
    });
  }
  // 切回 tab 時若有先前查詢結果，重新觸發 snapshot
  if (TW_STOCK_QUERY) {
    const slot = document.getElementById(`tw-snap-${TW_STOCK_QUERY}`);
    if (slot && slot.querySelector(".tw-snap-loading")) {
      const rec = twStockFindByCode(TW_STOCK_QUERY);
      loadTwStockSnapshot(TW_STOCK_QUERY, rec?.market);
    }
  }
}

let TW_SUGGEST_STATE = { items: [], active: -1 };
const TW_SUGGEST_LIMIT = 12;

function renderTwStockSuggest(matches) {
  return matches.map((s, i) => {
    const marketCls = s.market === "上櫃" ? "otc" : "listed";
    const marketChip = s.market
      ? `<span class="tw-suggest-market tw-res-market-${marketCls}">${escapeHtml(s.market)}</span>`
      : "";
    return `
      <button class="tw-suggest-item" type="button" role="option" data-index="${i}"
        onmousedown="event.preventDefault()" onclick="pickTwStockSuggest(${i})">
        <span class="tw-suggest-code">${escapeHtml(s.code)}</span>
        <span class="tw-suggest-name">${escapeHtml(s.name)}</span>
        ${marketChip}
      </button>`;
  }).join("");
}

function updateTwStockSuggest(value) {
  const input = document.getElementById("tw-stock-input");
  const box = document.getElementById("tw-stock-suggest");
  if (!box) return;
  const q = (value || "").trim();
  if (!q) { hideTwStockSuggest(); return; }
  // 代碼直查（純數字 4-6 碼 + 可選字母）也支援前綴比對
  const list = DATA?.tw_stocks || [];
  const upper = q.replace(/[^0-9A-Za-z]/g, "").toUpperCase();
  let matches = [];
  if (/^[0-9]/.test(upper) && upper.length >= 1) {
    const inFilter = (s) => twMegaIncludes(s.industry || "其他", TW_INDUSTRY_FILTER);
    matches = list.filter(s => inFilter(s) && (s.code || "").toUpperCase().startsWith(upper)).slice(0, TW_SUGGEST_LIMIT);
  }
  if (matches.length === 0) {
    matches = twStockSearchByKeyword(q, TW_SUGGEST_LIMIT);
  }
  TW_SUGGEST_STATE = { items: matches, active: -1 };
  if (!matches.length) {
    box.hidden = false;
    box.innerHTML = `<div class="tw-suggest-empty">找不到「${escapeHtml(q)}」相符的股票</div>`;
    if (input) input.setAttribute("aria-expanded", "true");
    return;
  }
  box.innerHTML = renderTwStockSuggest(matches);
  box.hidden = false;
  if (input) input.setAttribute("aria-expanded", "true");
}

function hideTwStockSuggest() {
  const input = document.getElementById("tw-stock-input");
  const box = document.getElementById("tw-stock-suggest");
  if (box) { box.hidden = true; box.innerHTML = ""; }
  if (input) input.setAttribute("aria-expanded", "false");
  TW_SUGGEST_STATE = { items: [], active: -1 };
}

function pickTwStockSuggest(i) {
  const rec = TW_SUGGEST_STATE.items[i];
  if (!rec) return;
  const input = document.getElementById("tw-stock-input");
  if (input) input.value = rec.code;
  hideTwStockSuggest();
  doTwStockSearch(rec.code);
}

function setTwSuggestActive(i) {
  const box = document.getElementById("tw-stock-suggest");
  if (!box) return;
  TW_SUGGEST_STATE.active = i;
  [...box.querySelectorAll(".tw-suggest-item")].forEach((el, idx) => {
    el.classList.toggle("active", idx === i);
    if (idx === i) el.scrollIntoView({ block: "nearest" });
  });
}

function renderTwStockSheet() {
  const lnk = (href, text) => `<a href="${href}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">${text}</a>`;
  return `
    ${renderTwStockSearch()}

    <details class="tw-sop-reference">
    <summary class="tw-sop-summary">📚 資料來源</summary>

    <h3 style="font-size:16px;margin:24px 0 8px">1. 基本面</h3>
    <div style="background:#E5F2F5;padding:12px 16px;border-radius:6px;margin:10px 0;font-size:13px">
      入口：<b>${lnk("https://mops.twse.com.tw", "mops.twse.com.tw")}</b> → 上方搜尋輸入股票代號或公司名
    </div>
    <div style="overflow-x:auto">
    <table class="tw-quote-table" style="width:100%;border-collapse:collapse;font-size:13px;min-width:520px">
      <tr style="background:#019AB3;color:#fff">
        <th style="padding:10px;text-align:left;width:40%">項目</th>
        <th style="padding:10px;text-align:left">內容</th>
      </tr>
      <tr style="background:#F2F8FA"><td style="padding:8px 12px"><b>公司治理一覽表</b></td><td style="padding:8px 12px">資本額、員工數、董事長、產業別、實收資本</td></tr>
      <tr><td style="padding:8px 12px"><b>月營收</b>（每月 10 日後）</td><td style="padding:8px 12px">最近 12 個月趨勢、年增率、累計年增率</td></tr>
      <tr style="background:#F2F8FA"><td style="padding:8px 12px"><b>最新季財報</b></td><td style="padding:8px 12px">三表 + 毛利率／營益率／EPS 三大關鍵</td></tr>
      <tr><td style="padding:8px 12px"><b>重大訊息</b>（過去 3 個月）</td><td style="padding:8px 12px">併購、買回庫藏股、業績預警、董監異動</td></tr>
      <tr style="background:#F2F8FA"><td style="padding:8px 12px"><b>法說會簡報</b></td><td style="padding:8px 12px">公司怎麼講自己（管理層敘事 vs 數字）</td></tr>
    </table>
    </div>

    <h3 style="font-size:16px;margin:24px 0 8px">2. TWSE 看籌碼</h3>
    <div style="background:#E5F2F5;padding:12px 16px;border-radius:6px;margin:10px 0;font-size:13px">
      入口：<b>${lnk("https://www.twse.com.tw", "www.twse.com.tw")}</b> → 交易資訊
    </div>
    <div style="overflow-x:auto">
    <table class="tw-quote-table" style="width:100%;border-collapse:collapse;font-size:13px;min-width:520px">
      <tr style="background:#017A8F;color:#fff">
        <th style="padding:10px;text-align:left;width:40%">項目</th>
        <th style="padding:10px;text-align:left">內容</th>
      </tr>
      <tr style="background:#F2F8FA"><td style="padding:8px 12px"><b>三大法人買賣超</b>（最近 5 日）</td><td style="padding:8px 12px">外資、投信、自營商各別買賣超；連買連賣天數</td></tr>
      <tr><td style="padding:8px 12px"><b>融資融券餘額變化</b></td><td style="padding:8px 12px">融資增 = 散戶看好；融券增 = 看空或避險</td></tr>
      <tr style="background:#F2F8FA"><td style="padding:8px 12px"><b>借券賣出餘額</b></td><td style="padding:8px 12px">外資／法人放空指標；快速攀升警訊</td></tr>
    </table>
    </div>

    <h3 style="font-size:16px;margin:24px 0 8px">3. 產業／競爭</h3>
    <div style="overflow-x:auto">
    <table class="tw-quote-table" style="width:100%;border-collapse:collapse;font-size:13px;min-width:520px">
      <tr style="background:#17B5AD;color:#fff">
        <th style="padding:10px;text-align:left;width:40%">項目</th>
        <th style="padding:10px;text-align:left">內容</th>
      </tr>
      <tr style="background:#F2F8FA"><td style="padding:8px 12px"><b>公司年報「行業狀況」章節</b></td><td style="padding:8px 12px">產業地位、市佔、上下游、技術門檻</td></tr>
      <tr><td style="padding:8px 12px"><b>最近一次法說會 Q&amp;A</b></td><td style="padding:8px 12px">分析師問什麼 = 市場關注點</td></tr>
      <tr style="background:#F2F8FA"><td style="padding:8px 12px"><b>同業比較表</b>（找 3 家競品）</td><td style="padding:8px 12px">營收成長、毛利率、PE、ROE 對比</td></tr>
    </table>
    </div>

    <h3 style="font-size:16px;margin:28px 0 8px">紅旗訊號（看到立即扣分）</h3>
    <div style="background:#FFEBEE;padding:16px 20px;border-radius:6px">
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr><td style="padding:6px 0;width:28px">⛔</td><td style="padding:6px 0"><b>處置股／變更交易方法</b> — 監管警示，遠離</td></tr>
        <tr><td style="padding:6px 0">⛔</td><td style="padding:6px 0"><b>內部人連續申讓</b> — 董監對自家股票沒信心</td></tr>
        <tr><td style="padding:6px 0">⛔</td><td style="padding:6px 0"><b>業績預警公告</b> — 重大訊息列出</td></tr>
        <tr><td style="padding:6px 0">⛔</td><td style="padding:6px 0"><b>連續 2 季毛利率衰退</b> — 護城河可能失守</td></tr>
        <tr><td style="padding:6px 0">⛔</td><td style="padding:6px 0"><b>應收帳款週轉天數異常拉長</b> — 收款品質惡化</td></tr>
        <tr><td style="padding:6px 0">⛔</td><td style="padding:6px 0"><b>會計師非無保留意見</b> — 財報品質警訊</td></tr>
        <tr><td style="padding:6px 0">⛔</td><td style="padding:6px 0"><b>頻繁更換會計師事務所或財務長</b> — 財務透明度疑慮</td></tr>
      </table>
    </div>

    <h3 style="font-size:16px;margin:24px 0 8px">綠旗訊號（看到加分）</h3>
    <div style="background:#E8F5E9;padding:16px 20px;border-radius:6px">
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr><td style="padding:6px 0;width:28px">✅</td><td style="padding:6px 0"><b>連續多季營收／EPS 雙增長</b> — 基本面擴張</td></tr>
        <tr><td style="padding:6px 0">✅</td><td style="padding:6px 0"><b>毛利率穩定或上升</b> — 議價能力佳</td></tr>
        <tr><td style="padding:6px 0">✅</td><td style="padding:6px 0"><b>自由現金流為正且穩定</b> — 真正賺到錢</td></tr>
        <tr><td style="padding:6px 0">✅</td><td style="padding:6px 0"><b>長期穩定發股利</b> — 對股東負責</td></tr>
        <tr><td style="padding:6px 0">✅</td><td style="padding:6px 0"><b>外資長期持股比例高且穩定</b> — 機構認可</td></tr>
        <tr><td style="padding:6px 0">✅</td><td style="padding:6px 0"><b>法說會誠實面對問題</b>（不只報喜）— 管理層可信</td></tr>
      </table>
    </div>

    <h3 style="font-size:16px;margin:28px 0 8px">工具備忘</h3>
    <div style="overflow-x:auto">
    <table class="tw-quote-table" style="width:100%;border-collapse:collapse;font-size:13px;min-width:520px">
      <tr style="background:#F2F8FA"><td style="padding:8px 12px;width:30%"><b>MOPS</b></td><td style="padding:8px 12px">${lnk("https://mops.twse.com.tw", "mops.twse.com.tw")} — 第一手揭露</td></tr>
      <tr><td style="padding:8px 12px"><b>TWSE</b></td><td style="padding:8px 12px">${lnk("https://www.twse.com.tw", "www.twse.com.tw")} — 行情、籌碼</td></tr>
      <tr style="background:#F2F8FA"><td style="padding:8px 12px"><b>Goodinfo!</b></td><td style="padding:8px 12px">${lnk("https://goodinfo.tw", "goodinfo.tw")} — 個股資料總覽（二手，僅供發現）</td></tr>
      <tr><td style="padding:8px 12px"><b>財報狗</b></td><td style="padding:8px 12px">${lnk("https://statementdog.com", "statementdog.com")} — 財報視覺化</td></tr>
      <tr style="background:#F2F8FA"><td style="padding:8px 12px"><b>CMoney</b></td><td style="padding:8px 12px">${lnk("https://cmoney.tw", "cmoney.tw")} — 法人籌碼</td></tr>
    </table>
    </div>
    <p style="color:var(--text-mute);font-size:12px;margin:10px 0 4px">二手網站只用來「快速發現」，最終決策必回 MOPS／TWSE 對原始資料。</p>

    <p class="a-note" style="margin-top:24px;font-size:12px;color:var(--text-mute)">個人研究 SOP v1.0 · 2026-05-08 建立</p>
    </details>
  `;
}

function renderStockBriefBlock() {
  const brief = DATA.stock_brief || {};
  const curatedBrief = brief.stocks || [];
  const popularBrief = brief.popular_stocks || [];
  if (!curatedBrief.length && !popularBrief.length) {
    return `
      <h2 style="font-size:16px; margin:24px 0 8px;">週度檢視</h2>
      <p style="color:var(--text-mute); font-size:12px; margin:0 0 8px;">每週日晚 20:30 自動更新。本週尚未產出。</p>
    `;
  }
  const updated = brief.generated_at
    ? brief.generated_at.replace("T", " ").slice(0, 16)
    : "—";
  const wkStart = brief.week_of_start || "";
  const wkEnd = brief.week_of_end || "";
  // 取月日呈現（5/17 ~ 5/24）
  const shortMD = (iso) => iso ? iso.slice(5).replace("-", "/").replace(/^0/, "") : "";
  const dateLabel = (wkStart && wkEnd)
    ? `（${shortMD(wkStart)} ~ ${shortMD(wkEnd)}）`
    : (brief.week_of ? `（${brief.week_of}）` : "");

  const curatedCards = curatedBrief.map(st => renderBriefCard(st, wkStart, wkEnd)).join("");
  const popularCards = popularBrief.map(st => renderBriefCard(st, wkStart, wkEnd)).join("");

  const curatedSection = curatedBrief.length ? `
    <h3 style="font-size:15px; margin:14px 0 8px; color:#019AB3;">精選股票本週重點</h3>
    ${curatedCards}
  ` : "";

  const popularSection = popularBrief.length ? `
    <h3 style="font-size:15px; margin:18px 0 4px; color:#019AB3;">熱門股票本週重點</h3>
    <p style="color:var(--text-mute); font-size:12px; margin:0 0 8px;">取週日晚 snapshot 前 10 檔，避免每次 build 輪動造成解讀混亂。</p>
    ${popularCards}
  ` : "";

  return `
    <h2 style="font-size:16px; margin:24px 0 4px;">週度檢視${dateLabel}</h2>
    <p style="color:var(--text-mute); font-size:12px; margin:0 0 12px;">
      AI 摘要・資訊聚合・非投資建議・更新 ${updated}<br>
      資料來源：finnhub company-news；摘要由 Claude CLI 產出。本區塊僅供研究，不構成個股投資建議。
    </p>
    ${curatedSection}
    ${popularSection}
  `;
}

function renderBriefCard(st, wkStart, wkEnd) {
  const impColor = (lvl) => ({ HIGH: "#d62828", MED: "#f59e0b", LOW: "#6b7280" })[lvl] || "#6b7280";
  const impLabel = (lvl) => ({ HIGH: "高", MED: "中", LOW: "低" })[lvl] || lvl;
  // Yahoo Finance 標的頁：台股 4 位數字加 .TW，美股 symbol 直用
  const ySym = st.symbol && /^\d{4}$/.test(st.symbol) ? `${st.symbol}.TW` : st.symbol;
  const yahooUrl = ySym ? `https://finance.yahoo.com/quote/${encodeURIComponent(ySym)}/` : null;
  // 真實 5 個交易日 close-to-close（資料管線改從 Yahoo chart API 抓，2026-05-24 修正）
  const shortMD = (iso) => iso ? iso.slice(5).replace("-", "/").replace(/^0/, "") : "";
  const hasReal = typeof st.weekly_change_pct === "number";
  const wkPctStr = hasReal
    ? `${st.weekly_change_pct >= 0 ? "+" : ""}${st.weekly_change_pct.toFixed(1)}%`
    : "—";
  const wkColor = hasReal
    ? (st.weekly_change_pct >= 0 ? "#d62828" : "#2a9d8f")
    : "inherit";
  // 顯示為「基準收盤 → 最新收盤」格式，避免讀者誤解為「資料區間 5/15~5/22」
  const wkRange = (st.weekly_start && st.weekly_as_of)
    ? `(基準 ${shortMD(st.weekly_start)} → ${shortMD(st.weekly_as_of)})`
    : "";
  const wkTitle = hasReal
    ? `定義：${st.weekly_definition || "5 個交易日 close-to-close"}\n基準收盤日（denominator）：${st.weekly_start || "—"}\n最新收盤日（numerator）：${st.weekly_as_of || "—"}\n算法：(${st.weekly_as_of} 收盤 / ${st.weekly_start} 收盤) − 1\n來源：${st.weekly_source || "yahoo_chart"}（點開可驗證）`
    : "weekly 資料未取得，點開 Yahoo 自驗";
  const wkValue = yahooUrl
    ? `<a href="${yahooUrl}" target="_blank" rel="noopener" title="${wkTitle.replace(/"/g,'&quot;')}" style="color:${wkColor}; text-decoration:underline; text-decoration-style:dotted; font-size:13px;">${wkPctStr}</a>`
    : `<span style="color:${wkColor}; font-size:13px;">${wkPctStr}</span>`;
  const wkPct = `<span style="font-size:13px;">本週${wkRange ? ` <span style="color:var(--text-mute); font-size:11px;">${wkRange}</span>` : ""} ${wkValue}</span>`;
  const newsHtml = (st.news_highlights || []).map(n => `
    <li style="margin-bottom:8px; line-height:1.55;">
      <span style="display:inline-block; padding:1px 6px; border-radius:3px; font-size:11px; color:#fff; background:${impColor(n.importance)}; margin-right:6px;">${impLabel(n.importance)}</span>
      <a href="${n.url}" target="_blank" rel="noopener" style="color:inherit; text-decoration:underline;">${n.headline_zh || n.headline_en}</a>
      <span style="color:var(--text-mute); font-size:12px; margin-left:6px;">${n.source || ""} · ${n.published || ""}</span>
    </li>
  `).join("") || `<li style="color:var(--text-mute); font-size:13px;">本週無重大新聞</li>`;
  const catalyst = st.next_week_catalyst
    ? `<div style="margin-top:6px; font-size:13px; color:var(--text-mute);"><strong>下週觀察：</strong>${st.next_week_catalyst}</div>`
    : "";
  return `
    <div style="border:1px solid var(--border, #e5e7eb); border-radius:8px; padding:14px; margin-bottom:12px; background:var(--card-bg, #fff);">
      <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:8px;">
        <strong style="font-size:15px;">${st.symbol} ${st.name_zh || ""}</strong>
        <span>${wkPct}</span>
      </div>
      <ul style="margin:0 0 8px; padding-left:0; list-style:none;">${newsHtml}</ul>
      <div style="font-size:13px; line-height:1.55; padding:8px 10px; background:#f8f9fb; border-radius:4px;">
        <strong style="color:#019AB3;">論點檢視：</strong>${st.thesis_check || "—"}
      </div>
      ${catalyst}
    </div>
  `;
}

function renderStocksTable(title, list, opts = {}) {
  const showPE = opts.showPE !== false;  // default true; pass { showPE: false } to hide
  if (!list || !list.length) return "";
  const fmtPrice = (p, kind) => {
    if (p === null || p === undefined) return "—";
    const prefix = "";  // 價格一律不顯示 $ 符號（含美股）
    return prefix + p.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };
  // 來源驗證 URL：美股優先 Yahoo Finance 歷史頁（使用者偏好），台股優先 Yahoo TW
  const verifyUrl = (s) => {
    if (s.kind === "TW") return `https://tw.stock.yahoo.com/quote/${s.symbol}.TW/history`;
    return `https://finance.yahoo.com/quote/${encodeURIComponent(s.symbol)}/history`;
  };
  const srcLabel = (s) => s.kind === "TW"
    ? "原始來源：TWSE；驗證：Yahoo TW 歷史頁"
    : "原始來源：finnhub /quote（價/日%）+ Yahoo（MTD/YTD）；驗證：Yahoo Finance 歷史頁";
  // 期間區間連到 Yahoo 歷史頁，period1/period2 為 UTC 12:00 epoch（避開時區邊界）
  const histBase = (s) => s.kind === "TW"
    ? `https://tw.stock.yahoo.com/quote/${encodeURIComponent(s.symbol)}.TW/history`
    : `https://finance.yahoo.com/quote/${encodeURIComponent(s.symbol)}/history`;
  const noonUTC = (y, m, d) => Math.floor(Date.UTC(y, m, d, 12, 0, 0) / 1000);
  const periodEpochs = (s) => {
    const m = String(s.market_date || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return null;
    const y = +m[1], mo = +m[2] - 1, d = +m[3];
    const end = noonUTC(y, mo, d);
    const prevD = new Date(Date.UTC(y, mo, d));
    prevD.setUTCDate(prevD.getUTCDate() - 1);
    return {
      day: { p1: noonUTC(prevD.getUTCFullYear(), prevD.getUTCMonth(), prevD.getUTCDate()), p2: end },
      mtd: { p1: noonUTC(y, mo, 1), p2: end },
      ytd: { p1: noonUTC(y, 0, 1), p2: end },
    };
  };
  const rangedCell = (s, val, range, label) => {
    const html = fmtPct(val);
    if (!s.symbol || val === null || val === undefined) return html;
    const ep = periodEpochs(s);
    if (!ep || !ep[range]) return html;
    const { p1, p2 } = ep[range];
    const url = `${histBase(s)}?period1=${p1}&period2=${p2}&frequency=1d`;
    const title = `${label} 績效區間於 Yahoo 歷史頁驗證`;
    return `<a href="${url}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline;text-decoration-style:dotted;" title="${escapeHtml(title)}">${html}</a>`;
  };
  const rows = list.map(s => {
    const nameCell = s.source_url
      ? `<a href="${s.source_url}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline" title="${escapeHtml(srcLabel(s))}">${escapeHtml(s.name_zh)}</a>`
      : escapeHtml(s.name_zh);
    // 台股 → Yahoo TW 即時報價；美股 → Yahoo Finance quote 頁
    let quoteSfx = "";
    if (s.symbol) {
      const qUrl = s.kind === "TW"
        ? `https://tw.stock.yahoo.com/quote/${encodeURIComponent(s.symbol)}.TW`
        : `https://finance.yahoo.com/quote/${encodeURIComponent(s.symbol)}`;
      quoteSfx = quoteSuffix(qUrl);
    }
    return `
    <tr>
      <td>${nameCell}${quoteSfx}</td>
      <td>${fmtPrice(s.price, s.kind)}</td>
      ${showPE ? `<td>${fmtPE(s.per, s.per_kind)}</td>` : ""}
      <td class="${pctClass(s.change_pct)}">${rangedCell(s, s.change_pct, "day", "日")}</td>
      <td class="${pctClass(s.mtd_pct)}">${rangedCell(s, s.mtd_pct, "mtd", "本月")}</td>
      <td class="${pctClass(s.ytd_pct)}">${rangedCell(s, s.ytd_pct, "ytd", "今年")}</td>
      <td class="date-col"><a href="${verifyUrl(s)}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline; text-decoration-style:dotted;" title="${escapeHtml(srcLabel(s))}">${escapeHtml(shortDate(s.market_date))}</a></td>
    </tr>
  `;
  }).join("");
  return `
    ${title ? `<h3>${title}</h3>` : ""}
    <table class="indices stock-cols">
      <colgroup><col class="c-name"><col class="c-num">${showPE ? `<col class="c-num">` : ""}<col class="c-num"><col class="c-num"><col class="c-num"><col class="c-num"></colgroup>
      <thead><tr>
        <th>名稱</th>
        <th class="sortable-th" title="收盤價，來源見名稱欄連結；點選排序">收盤</th>
        ${showPE ? `<th class="sortable-th" title="本益比（近四季 trailing，來源：finnhub）；點選排序">本益比</th>` : ""}
        <th class="sortable-th" title="日報酬率，定義：今日收盤 vs 昨日收盤；來源：finnhub /quote (US) 或 TWSE (TW)；點選排序">日</th>
        <th class="sortable-th" title="月初到今報酬率（MTD），來源：Yahoo (US) 或 TWSE (TW)；點選排序">本月</th>
        <th class="sortable-th" title="年初到今報酬率（YTD），來源：Yahoo (US) 或 TWSE (TW)；點選排序">今年</th>
        <th class="date-col" title="收盤日：finnhub quote 的 timestamp（ET 時區）轉日期，或 TWSE 公告日">收盤日</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// ─────────────────────────────────────────────────────────────────────────
// 通用欄位排序（parseSortValue + wireSortableTables）
// 任何帶有 class="sortable-th" 的 <th> 點擊即可排序所在 <table>
// ─────────────────────────────────────────────────────────────────────────

// 將儲存格文字轉成可排序的數值；無法解析 → null（null 永遠排底）
function parseSortValue(text) {
  if (text == null) return null;
  const s = String(text).trim();
  // 空字串 / 破折號類 / N/A
  if (!s || /^[—–\-]+$/.test(s) || /^n\/a$/i.test(s)) return null;
  // 兆／億 市值格式（如 "61.07 兆"、"5.00 億"）
  const zhCap = s.match(/^([+\-＋－]?\d[\d,.]*)[\s ]*(兆|億)$/u);
  if (zhCap) {
    const n = parseFloat(zhCap[1].replace(/,/g, ""));
    if (isNaN(n)) return null;
    return zhCap[2] === "兆" ? n * 1e12 : n * 1e8;
  }
  // 剝掉 %、＋/+（保留負號），去掉逗號與空白，處理全形負號 −
  let clean = s
    .replace(/%/g, "")
    .replace(/[＋+]/g, "")
    .replace(/[−]/g, "-")   // U+2212 MINUS SIGN → ASCII -
    .replace(/,/g, "")
    .trim();
  // 移除前綴 ▲/▼ 指示符（排序後 th 文字可能含此符號）
  clean = clean.replace(/^[▲▼]\s*/, "");
  const n = parseFloat(clean);
  return isNaN(n) ? null : n;
}

// 單一委派點擊監聽器；init() 呼叫一次即可，re-render 後繼續有效
function wireSortableTables() {
  // 各 table 的當前排序狀態：WeakMap<HTMLTableElement, {colIdx, dir}>
  const sortState = new WeakMap();

  document.body.addEventListener("click", (e) => {
    const th = e.target.closest("th.sortable-th");
    if (!th) return;
    const table = th.closest("table");
    if (!table) return;
    const thead = table.tHead;
    if (!thead) return;
    const headerRow = thead.rows[0];
    if (!headerRow) return;

    const colIdx = th.cellIndex;

    // 決定排序方向
    const prev = sortState.get(table) || {};
    const dir = (prev.colIdx === colIdx && prev.dir === "desc") ? "asc" : "desc";
    sortState.set(table, { colIdx, dir });

    // 收集 tbody 所有 <tr>
    const tbody = table.tBodies[0];
    if (!tbody) return;
    const rows = Array.from(tbody.rows);

    // 排序：null 永遠在底部
    rows.sort((a, b) => {
      const av = parseSortValue(a.cells[colIdx] ? a.cells[colIdx].textContent : null);
      const bv = parseSortValue(b.cells[colIdx] ? b.cells[colIdx].textContent : null);
      const aNull = av === null;
      const bNull = bv === null;
      if (aNull && bNull) return 0;
      if (aNull) return 1;
      if (bNull) return -1;
      return dir === "asc" ? av - bv : bv - av;
    });

    // 重新插入排序後的列
    rows.forEach(tr => tbody.appendChild(tr));

    // 若第一欄標題為「排名」，重新編號
    const firstHeader = headerRow.cells[0];
    if (firstHeader && firstHeader.textContent.trim() === "排名") {
      Array.from(tbody.rows).forEach((tr, i) => {
        if (tr.cells[0]) tr.cells[0].textContent = i + 1;
      });
    }

    // 更新 ▲/▼ 指示符與樣式
    Array.from(headerRow.cells).forEach(h => {
      if (!h.classList.contains("sortable-th")) return;
      // 去掉舊指示符（末尾的 ▲ 或 ▼ 及前置空格）
      h.textContent = h.textContent.replace(/\s*[▲▼]$/, "");
      if (h.cellIndex === colIdx) {
        h.textContent += (dir === "desc" ? " ▼" : " ▲");
        h.style.cssText = "cursor:pointer;text-decoration:underline;text-decoration-style:dotted;font-weight:700";
      } else {
        h.style.cssText = "cursor:pointer;text-decoration:underline;text-decoration-style:dotted;opacity:0.75";
      }
    });
  });
}

function renderRankingTable(items, opts) {
  const showCap = opts && opts.showMarketCap;
  const showPE = opts && opts.showPE;
  const asOf = opts && opts.asOf ? shortDate(opts.asOf) : "—";
  if (!items || !items.length)
    return `<p style="color:var(--text-mute);padding:12px 0">尚未提供排行資料</p>`;

  const rows = items.map((r, i) => `
    <tr>
      <td style="text-align:center">${i + 1}</td>
      <td style="text-align:left">${r.source_url
        ? `<a href="${escapeHtml(r.source_url)}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline;text-decoration-style:dotted">${escapeHtml(r.name || r.symbol)}</a>`
        : escapeHtml(r.name || r.symbol)}</td>
      <td>${r.price == null ? "—" : Number(r.price).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</td>
      ${showPE ? `<td>${fmtPE(r.pe, r.pe_kind)}</td>` : ""}
      <td class="${pctClass(r.daily_pct)}">${fmtPct(r.daily_pct)}</td>
      <td class="${pctClass(r.mtd_pct)}">${fmtPct(r.mtd_pct)}</td>
      <td class="${pctClass(r.ytd_pct)}">${fmtPct(r.ytd_pct)}</td>
      ${showCap ? `<td class="mcap">${fmtMarketCapZh(r.market_cap)}</td>` : ""}
      <td class="date-col">${escapeHtml(r.closing_date ? shortDate(r.closing_date) : asOf)}</td>
    </tr>`).join("");

  return `
    <table class="indices ranking-table">
      ${showPE
        ? `<colgroup><col style="width:6%"><col style="width:20%"><col style="width:12%"><col style="width:10%"><col style="width:10%"><col style="width:10%"><col style="width:10%"><col style="width:11%"><col style="width:11%"></colgroup>`
        : `<colgroup><col style="width:7%"><col style="width:26%"><col style="width:16%"><col style="width:13%"><col style="width:13%"><col style="width:13%"><col style="width:12%"></colgroup>`}
      <thead><tr>
        <th style="text-align:center">排名</th><th style="text-align:left">名稱</th>
        <th class="sortable-th" title="收盤價；點選排序">收盤</th>
        ${showPE ? `<th class="sortable-th" title="本益比（近四季 trailing；「預」=預估 forward）；點選排序">本益比</th>` : ""}
        <th class="sortable-th" title="當日漲跌；點選排序">日</th>
        <th class="sortable-th" title="本月至今(MTD)；點選排序">本月</th>
        <th class="sortable-th" title="今年至今(YTD)；點選排序">本年</th>
        ${showCap ? `<th class="sortable-th mcap" title="市值；點選排序">市值</th>` : ""}
        <th class="date-col" title="收盤日：最新交易日">收盤日</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

function fmtMarketCapZh(v) {
  if (v == null) return "—";
  // 兆級保留 1 位小數（避免 1.6 兆 退化成 2 兆），億級以下一律取整數
  if (v >= 1e12) return (v / 1e12).toFixed(1) + " 兆";
  if (v >= 1e8) return Math.round(v / 1e8).toLocaleString("en-US") + " 億";
  return Math.round(Number(v)).toLocaleString("en-US");
}

function fmtPE(pe, kind) {
  if (pe == null) return "—";
  const s = Number(pe).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return kind === "forward" ? `${s} 預` : s;
}

function renderRankingsBlock(market) {
  if (FAILED_LOADS.has("rankings")) return "";
  const sec = (DATA.rankings && DATA.rankings[market]) || {};
  const asOf = sec.as_of || null;
  const blocks = [
    ["市值前十大", sec.top_marketcap, true,  true],
    ["最大漲幅",   sec.top_gainers,   true,  true],
    ["最大跌幅",   sec.top_losers,    true,  true],
    ["ETF 排行榜", sec.top_etf,       false, false],
  ];
  return `
    <div style="margin-top:28px;padding-top:20px;border-top:1px solid var(--border)">
      ${blocks.map(([title, items, cap, pe]) => `
          <h3 style="font-size:16px;margin:18px 0 8px">${title}</h3>
          ${renderRankingTable(items, { showMarketCap: cap, showPE: pe, asOf })}
        `).join("")}
      <p style="color:var(--text-mute);font-size:12px;margin:10px 0 0">
        當日全市場掃描；點名稱可至 Yahoo／TWSE 驗證。本月=MTD，本年=YTD。本益比為近四季（trailing），「預」=預估值（forward）。</p>
    </div>`;
}

function renderPremarketBlock() {
  const p = DATA.premarket;
  if (!p) return `<p style="color:var(--text-mute);padding:32px 0;text-align:center">今日尚無盤前分析資料</p>`;

  const pmDate = shortDate((p.generated_at || "").slice(0, 10));

  // 盤前分析 label → market.json 對應列（供 price/MTD fallback）+ 連結生成函式
  const PM_MARKET_MAP = {
    "S&P 500":  { src: "indices",    marketName: "S&P 500",         nameHtml: indexLink("S&P 500")         + indexQuoteLink("S&P 500") },
    "NASDAQ":   { src: "indices",    marketName: "Nasdaq Composite", nameHtml: indexLink("Nasdaq Composite") + indexQuoteLink("Nasdaq Composite") },
    "道瓊":     { src: "indices",    marketName: "Dow Jones",        nameHtml: indexLink("Dow Jones")        + indexQuoteLink("Dow Jones") },
    "台股加權": { src: "indices",    marketName: "TAIEX 加權指數",   nameHtml: indexLink("TAIEX 加權指數")   + indexQuoteLink("TAIEX 加權指數") },
    "VIX":      { src: "commodities",marketName: "VIX",              nameHtml: indexLink("VIX")              + indexQuoteLink("VIX") },
    "DXY":      { src: "fx",         marketName: "DXY 美元指數",     nameHtml: fxLink("DXY")                 + fxQuoteLink("DXY") },
    "USD/TWD":  { src: "fx",         marketName: "USD/TWD 新台幣",   nameHtml: fxLink("USD/TWD")             + fxQuoteLink("USD/TWD") },
  };
  const mktIndices    = (DATA.market && DATA.market.indices)    || [];
  const mktFx         = (DATA.market && DATA.market.fx)         || [];
  const mktCommodities= (DATA.market && DATA.market.commodities)|| [];
  function pmMarketRow(label) {
    const ref = PM_MARKET_MAP[label];
    if (!ref || !ref.marketName) return null;
    const arr = ref.src === "fx" ? mktFx : ref.src === "commodities" ? mktCommodities : mktIndices;
    return arr.find(r => r.name === ref.marketName) || null;
  }

  const indicatorRows = (p.indicators || []).map(ind => {
    const mrow = pmMarketRow(ind.label);
    // 若 premarket price 為 null，fallback 到 market.json 最新收盤（邏輯同市場一覽）
    const price   = ind.price != null ? ind.price : (mrow ? mrow.close : null);
    const pct     = ind.pct   != null ? ind.pct   : (mrow ? mrow.daily_pct : null);
    const indDate = ind.date  || (mrow ? mrow.closing_date : null);
    const priceStr = price == null || isNaN(price) ? "—"
      : ind.label === "VIX"                              ? price.toFixed(1)
      : ind.label === "DXY" || ind.label === "USD/TWD"  ? price.toFixed(2)
      : Math.round(price).toLocaleString("en-US");
    const mtd = mrow ? mrow.mtd_pct : null;
    const info = PM_MARKET_MAP[ind.label];
    const nameHtml = info ? info.nameHtml : escapeHtml(ind.label);
    return `
      <tr>
        <td>${nameHtml}</td>
        <td style="font-variant-numeric:tabular-nums">${escapeHtml(priceStr)}</td>
        <td class="${pctClass(pct)}" style="font-variant-numeric:tabular-nums">${fmtPct(pct)}</td>
        <td class="${pctClass(mtd)}" style="font-variant-numeric:tabular-nums">${fmtPct(mtd)}</td>
        <td class="date-col">${escapeHtml(indDate ? shortDate(indDate) : pmDate)}</td>
      </tr>`;
  }).join("");
  const indicatorTable = `
    <table class="indices pm-fit" style="margin-top:4px;table-layout:fixed;width:100%">
      <colgroup>
        <col style="width:34%">
        <col style="width:17%">
        <col style="width:15%">
        <col style="width:15%">
        <col style="width:19%">
      </colgroup>
      <thead><tr>
        <th>指數</th>
        <th>收盤</th>
        <th>日</th>
        <th>本月</th>
        <th class="date-col">收盤日</th>
      </tr></thead>
      <tbody>${indicatorRows}</tbody>
    </table>`;


  // Parse analysis, skip 【今日判斷】 block
  const analysisParts = (() => {
    const raw = (p.analysis || "").split("\n").filter(l => l.trim() && l.trim() !== "---");
    const lines = [];
    let skip = false;
    for (const l of raw) {
      if (l.startsWith("【今日判斷】")) { skip = true; continue; }
      if (skip && l.startsWith("【") && l.includes("】")) skip = false;
      if (!skip) lines.push(l);
    }
    return { summary: [], detail: lines };
  })();

  // 統一格式：盤前分析全部用 <ul><li> 點號呈現（與下方盤勢說明一致，不混段落／列點兩種格式）
  const renderLines = lines => {
    const liStyle = `margin-bottom:6px;line-height:1.65;font-size:15px`;
    const items = [];
    let i = 0;
    // Strip leading warning emoji and convert **bold** markdown to <strong>
    const cleanText = raw => {
      const stripped = raw.replace(/^[⚠️⚠\s]+/, "").trim();
      const bolded = escapeHtml(stripped).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      return bolded;
    };
    while (i < lines.length) {
      const l = lines[i];
      if (l.startsWith("【") && l.includes("】")) {
        const end = l.indexOf("】") + 1;
        const tag = escapeHtml(l.slice(1, end - 1));
        const bodyLines = [l.slice(end).trim()];
        while (i + 1 < lines.length && !(lines[i + 1].startsWith("【") && lines[i + 1].includes("】"))) {
          i++;
          bodyLines.push(lines[i].trim());
        }
        const body = bodyLines.filter(Boolean).join("　");
        items.push(`<li style="${liStyle}"><strong style="color:var(--brand)">${tag}</strong>${body ? `：${cleanText(body)}` : ""}</li>`);
      } else {
        items.push(`<li style="${liStyle}">${cleanText(l)}</li>`);
      }
      i++;
    }
    return items.length ? `<ul style="margin:0;padding-left:18px">${items.join("")}</ul>` : "";
  };

  const summaryHtml = renderLines(analysisParts.summary);
  // 不再顯示 美股摘要／台股展望／今日注意 等盤前敘述，只保留下方「重點股市及新聞列表」
  const detailHtml = "";

  const commentaryBullets = renderMarketCommentaryBlock({ focus: "tw", bare: true });
  const commentaryAppend = commentaryBullets
    ? `<div style="border-top:1px solid var(--border,#e5e7eb);margin-top:14px;padding-top:12px">${commentaryBullets}</div>`
    : "";

  return `
    ${summaryHtml ? `<div class="fund-card" style="margin-bottom:8px">${summaryHtml}</div>` : ""}
    ${(detailHtml || commentaryAppend) ? `<div class="fund-card" style="margin-bottom:8px">${detailHtml}${commentaryAppend}</div>` : ""}
    <div class="fund-card" style="margin-bottom:8px">
      ${indicatorTable}
    </div>
  `;
}

function renderMarketHighlights(m) {
  const ix = (m.indices || []).filter(i => i.daily_pct !== null && i.daily_pct !== undefined);
  if (!ix.length) return "";
  const fmt = i => `${escapeHtml(indexLabel(i.name))} ${fmtPct(i.daily_pct)}`;
  const ups = ix.slice().sort((a, b) => b.daily_pct - a.daily_pct).filter(i => i.daily_pct > 0).slice(0, 3);
  const downs = ix.slice().sort((a, b) => a.daily_pct - b.daily_pct).filter(i => i.daily_pct < 0).slice(0, 3);
  const tldr = (DATA.news && DATA.news.tldr) ? DATA.news.tldr.slice(0, 5) : [];
  const newsDate = (DATA.news && DATA.news.news_date) ? DATA.news.news_date : "";
  const dateLabel = newsDate ? `<span style="font-size:12px;color:var(--text-mute)">${newsDate}</span>` : "";

  const liStyle = `margin-bottom:6px;line-height:1.65;font-size:15px`;
  const items = [];
  if (ups.length) items.push(`<li style="${liStyle}"><strong style="color:#d62828">領漲</strong>：${ups.map(fmt).join("、")}</li>`);
  if (downs.length) items.push(`<li style="${liStyle}"><strong style="color:#2a9d8f">領跌</strong>：${downs.map(fmt).join("、")}</li>`);
  tldr.forEach(t => items.push(`<li style="${liStyle}">${escapeHtml(t)}</li>`));

  if (!items.length) return "";
  return `
    <div style="border:1px solid var(--border,#e5e7eb);border-radius:10px;padding:14px 16px;margin-bottom:16px;background:var(--card-bg,#fff)">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:10px">
        <h2 style="font-size:16px;margin:0;font-weight:700">今日重點</h2>${dateLabel}
      </div>
      <ul style="margin:0;padding-left:18px">${items.join("")}</ul>
    </div>`;
}

function renderNewsSheet() {
  const today = (DATA.meta && DATA.meta.today) || "";
  const newsDate = (DATA.news && DATA.news.news_date) || "";
  const isStale = today && newsDate && newsDate !== today;
  const staleBanner = isStale ? `
    <div style="background:#fff4e6; border:1px solid #ffb74d; border-radius:6px; padding:10px 14px; margin-bottom:12px; color:#5a3a00; font-size:15px; line-height:1.5">
      <strong>今日新聞尚未產生</strong>　目前顯示 ${escapeHtml(newsDate)} 內容（今日 ${escapeHtml(today)}）。系統將於 08:40 / 09:30 / 11:30 / 14:00 自動補抓。
    </div>
  ` : "";
  return `
    ${staleBanner}
    <div class="tabs">
      <button class="tab active" data-tab="market">市場</button>
      <button class="tab" data-tab="wm">財管</button>
      <button class="tab" data-tab="tax">稅務</button>
      <button class="tab" data-tab="intl">國際</button>
    </div>
    <div id="tab-market">${renderNewsByCategory("market")}</div>
    <div id="tab-wm" hidden>${renderNewsByCategory("wm")}</div>
    <div id="tab-tax" hidden>${renderNewsByCategory("tax")}</div>
    <div id="tab-intl" hidden>${renderNewsByCategory("intl")}</div>
  `;
}

// 把 news.json 的 sections 名稱對應到 4 大類（市場/財管/稅務/國際）
const SECTION_TO_CATEGORY = {
  "Taiwan Equities": "market",
  "股市行情": "market",
  "Industry": "market",
  "產業動態": "market",
  "產業": "market",
  "Global Markets": "market",
  "國際財經": "market",
  "Macro & Policy": "market",
  "總經政策": "market",
  "Financial Sector": "wm",
  "金融族群": "wm",
  "金融": "wm",
  "Wealth Management": "wm",
  "財富管理": "wm",
  "財管": "wm",
  "Tax & Regulations": "tax",
  "稅務法規": "tax",
  "稅務": "tax",
  "International": "intl",
  "國際": "intl",
};

function sectionCategory(section) {
  const en = section.section || "";
  const zh = section.section_zh || "";
  return SECTION_TO_CATEGORY[en] || SECTION_TO_CATEGORY[zh] || "market";
}

// 全文優先：有 body_zh 就直接顯示整篇（無圖片），否則退回短摘要。
function newsBodyHtml(it) {
  const body = (it.body_zh || "").trim();
  if (body) {
    const paras = body.split("\n")
      .map(p => p.trim()).filter(Boolean)
      .map(p => `<p>${escapeHtml(p)}</p>`).join("");
    return `<div class="news-body">${paras}</div>`;
  }
  return `<div class="summary">${escapeHtml(it.summary_zh || "")}</div>`;
}

function renderNewsByCategory(cat) {
  const newsDate = (DATA.news && DATA.news.news_date) || "";
  const dateFmt = newsDate ? newsDate.slice(5).replace("-", "/") : ""; // "06/16"
  const sections = (DATA.news.sections || [])
    .filter(s => sectionCategory(s) === cat);
  let html = sections.map(s => {
    const items = (s.items || []).filter(it => it.title_zh);
    if (!items.length) return "";
    const sectionTitle = s.section_zh || s.section;
    return `
      <h3 style="color:var(--brand-deep); margin-top:18px">${escapeHtml(sectionTitle)}</h3>
      ${items.map(it => {
        const titleDateM = it.title_zh && it.title_zh.match(/[（(](\d{4}-(\d{2}-\d{2}))[）)]/);
        const itemDateFmt = titleDateM ? titleDateM[2].replace("-", "/") : dateFmt;
        return `
        <div class="news-item">
          <details>
            <summary>${escapeHtml(it.title_zh)}${itemDateFmt ? `<span class="news-date">${escapeHtml(itemDateFmt)}</span>` : ""}</summary>
            ${newsBodyHtml(it)}
            ${it.source_url ? `<a class="source" href="${it.source_url}" target="_blank" rel="noopener">${escapeHtml(it.source_name || "來源")}</a>` : ""}
          </details>
        </div>
      `}).join("")}
    `;
  }).join("");

  // 稅務 tab 附加 tax.json 的深度文章
  if (cat === "tax") {
    const taxItems = (DATA.tax && DATA.tax.items) || [];
    if (taxItems.length) {
      html += `
        <h3 style="color:var(--brand-deep); margin-top:18px">稅務深度</h3>
        ${taxItems.map(it => `
          <div class="news-item">
            <details>
              <summary>${escapeHtml(it.title)}${dateFmt ? `<span class="news-date">${escapeHtml(dateFmt)}</span>` : ""}</summary>
              <div class="summary">${escapeHtml(it.summary)}</div>
              ${it.source_url ? `<a class="source" href="${it.source_url}" target="_blank" rel="noopener">${escapeHtml(it.source_name || "來源")}</a>` : ""}
            </details>
          </div>
        `).join("")}
      `;
    }
  }

  if (!html.trim()) return `<p style="color:var(--text-mute); padding:20px 0">本分類今日無新聞</p>`;
  return html;
}

// renderTaxNews() removed — tax content merged into renderNewsByCategory("tax")

function fundPerfUrl(f) {
  if (!f.bop_code) return null;
  const base = f.fund_type === "A" ? "wr/wr03" : "wb/wb03";
  return `https://bopfund.moneydj.com/w/${base}.djhtm?a=${encodeURIComponent(f.bop_code)}`;
}

function renderWealthSheet() {
  const wealth = DATA.wealth || {};
  const topics = wealth.topics || [];
  if (!topics.length) {
    return "<p style='color:var(--text-mute); padding:20px 0'>尚未提供財富傳承資料</p>";
  }

  // 加上一個「稅務新聞」虛擬 tab
  const newsKey = "news";
  const allTabs = [...topics.map(t => ({key: t.key, name: t.name})), {key: newsKey, name: "稅務新聞"}];

  const tabBtns = allTabs.map((t, i) => `
    <button class="tab ${i === 0 ? "active" : ""}" data-wtab="${escapeHtml(t.key)}">
      ${escapeHtml(t.name)}
    </button>
  `).join("");

  // 8 個主題 pane
  const topicPanes = topics.map((t, i) => `
    <div class="t-pane ${i === 0 ? "active" : ""}" id="w-pane-${escapeHtml(t.key)}">
      <div class="t-head">
        <div>
          <div class="t-name">${escapeHtml(t.name)}</div>
          <div class="t-tagline">${escapeHtml(t.summary || "")}</div>
        </div>
      </div>
      ${(t.laws || [])
        .filter(law => !((law.title && law.title.includes("凱基")) || (law.source && law.source.includes("凱基"))))
        .map(law => `
        <div class="w-law">
          <div class="w-law-head">
            <span class="w-law-code">${renderLawCode(law.code || "")}</span>
            <span class="w-law-title">${escapeHtml(law.title || "")}</span>
          </div>
          <div class="w-law-body">${escapeHtml(law.content || "")}</div>
          ${law.source ? `<div class="w-law-source">資料來源：${escapeHtml(law.source)}</div>` : ""}
        </div>`).join("")}
    </div>
  `).join("");

  // 稅務新聞 pane（從 DATA.tax 取）
  const taxItems = (DATA.tax && DATA.tax.items) || [];
  const newsPane = `
    <div class="t-pane" id="w-pane-${newsKey}">
      <div class="t-head">
        <div>
          <div class="t-name">稅務新聞</div>
          <div class="t-tagline">每日自動彙整財富傳承相關稅務新聞（資料日 ${escapeHtml(DATA.tax?.tax_date || "—")}）</div>
        </div>
      </div>
      ${taxItems.length ? taxItems.map(it => `
        <div class="w-law">
          <div class="w-law-head">
            <span class="w-law-title">${it.url ? `<a href="${it.url}" target="_blank" rel="noopener">${escapeHtml(it.title || "")}</a>` : escapeHtml(it.title || "")}</span>
          </div>
          ${it.summary ? `<div class="w-law-body">${escapeHtml(it.summary)}</div>` : ""}
          ${it.source ? `<div class="w-law-source">${escapeHtml(it.source)}</div>` : ""}
        </div>
      `).join("") : "<p style='color:var(--text-mute);padding:12px'>今日無稅務新聞</p>"}
    </div>
  `;

  const noteHtml = wealth.note ? `<p class="a-note">${escapeHtml(wealth.note)}</p>` : "";

  return `
    ${noteHtml}
    <div class="tabs tabs-wrap">${tabBtns}</div>
    <div class="t-panes">${topicPanes}${newsPane}</div>
  `;
}

// ===== 稅負試算 =====
const CALC_TABS = [
  {key: "income",    name: "綜所稅",       group: "single"},
  {key: "amt",       name: "最低稅負制",   group: "single"},
  {key: "gift",      name: "贈與稅",       group: "single"},
  {key: "estate",    name: "遺產稅",       group: "single"},
  {key: "house",     name: "房地合一稅",   group: "single"},
  {key: "land",      name: "土地增值稅",   group: "single"},
  {key: "case_house",name: "房產：繼承/贈與/買賣比較",  group: "compare"},
  {key: "case_stock",name: "股票：個人/投資公司比較", group: "compare"},
  {key: "case_fund", name: "基金：個人/投資公司比較", group: "compare"},
  {key: "case_realty",name: "房產：個人/投資公司比較", group: "compare"},
];

function fmtMoney(n) {
  if (n === null || n === undefined || isNaN(n)) return "—";
  return "NT$ " + Number(n).toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// 綜所稅試算（114 年度）
function calcIncomeTax(taxableIncome) {
  const brackets = [
    {limit: 590000,  rate: 0.05, base: 0},
    {limit: 1330000, rate: 0.12, base: 29500},
    {limit: 2660000, rate: 0.20, base: 118300},
    {limit: 4980000, rate: 0.30, base: 384300},
    {limit: Infinity, rate: 0.40, base: 1080300},
  ];
  for (const b of brackets) {
    if (taxableIncome <= b.limit) {
      const lower = brackets[brackets.indexOf(b) - 1]?.limit || 0;
      return Math.max(0, b.base + (taxableIncome - lower) * b.rate);
    }
  }
  return 0;
}

// 贈與稅
function calcGiftTax(giftAmount) {
  const net = Math.max(0, giftAmount - 2440000); // 244 萬免稅
  if (net <= 0) return {net, tax: 0, rate: "0%"};
  if (net <= 28110000) return {net, tax: net * 0.10, rate: "10%"};
  if (net <= 56210000) return {net, tax: net * 0.15 - 1405500, rate: "15%"};
  return {net, tax: net * 0.20 - 4216000, rate: "20%"};
}

// 遺產稅
function calcEstateTax(total, deductions) {
  const net = Math.max(0, total - 13330000 - deductions); // 1,333 萬免稅 + 扣除額
  if (net <= 0) return {net, tax: 0, rate: "0%"};
  if (net <= 56210000) return {net, tax: net * 0.10, rate: "10%"};
  if (net <= 112420000) return {net, tax: net * 0.15 - 2810500, rate: "15%"};
  return {net, tax: net * 0.20 - 8431500, rate: "20%"};
}

// 房地合一稅
function calcHouseLandTax(gain, holdYears, isSelfUse) {
  if (gain <= 0) return {taxable: 0, tax: 0, rate: "0%"};
  if (isSelfUse && holdYears >= 6) {
    const taxable = Math.max(0, gain - 4000000); // 自住 400 萬免稅額
    return {taxable, tax: taxable * 0.10, rate: "10%（自住）"};
  }
  if (holdYears <= 2) return {taxable: gain, tax: gain * 0.45, rate: "45%"};
  if (holdYears <= 5) return {taxable: gain, tax: gain * 0.35, rate: "35%"};
  if (holdYears <= 10) return {taxable: gain, tax: gain * 0.20, rate: "20%"};
  return {taxable: gain, tax: gain * 0.15, rate: "15%"};
}

// 土地增值稅（簡化版：未考慮物價指數調整、長期持有減徵）
function calcLandValueTax(increase, originPrice, isSelfUse, holdYears) {
  if (increase <= 0) return {tax: 0, rate: "0%"};
  if (isSelfUse) return {tax: increase * 0.10, rate: "10%（自用）"};
  const ratio = increase / originPrice;
  let baseRate, base;
  if (ratio <= 1) { baseRate = 0.20; base = 0; }
  else if (ratio <= 2) { baseRate = 0.30; base = originPrice * 0.10; }
  else { baseRate = 0.40; base = originPrice * 0.30; }
  let tax = base + increase * baseRate;
  // 長期持有減徵
  let reduceRate = 0;
  if (holdYears >= 40) reduceRate = 0.40;
  else if (holdYears >= 30) reduceRate = 0.30;
  else if (holdYears >= 20) reduceRate = 0.20;
  tax = tax * (1 - reduceRate);
  return {tax, rate: `${(baseRate * 100)}%${reduceRate ? `（持有 ${holdYears} 年減 ${reduceRate * 100}%）` : ""}`};
}

// 最低稅負制（114 年度）
function calcAmtTax(comprehensive, overseas, largeInsurance, otherAdditions, regularIncomeTax) {
  let amtBase = comprehensive;
  if (overseas >= 1000000) amtBase += overseas;
  if (largeInsurance > 37400000) amtBase += (largeInsurance - 37400000);
  amtBase += otherAdditions;
  const amt = Math.max(0, (amtBase - 6700000) * 0.20);
  const final = Math.max(amt, regularIncomeTax);
  return {amtBase, amt, regular: regularIncomeTax, final, needPay: final - regularIncomeTax};
}

function renderCalcSheet() {
  const tabBtns = CALC_TABS.map((t, i) => `
    <button class="tab ${i === 0 ? "active" : ""}" data-ctab="${escapeHtml(t.key)}">${escapeHtml(t.name)}</button>
  `).join("");

  return `
    <div class="tabs tabs-wrap">${tabBtns}</div>
    <div class="t-panes">
      <div class="t-pane active" id="c-pane-income">${renderCalcIncome()}</div>
      <div class="t-pane" id="c-pane-amt">${renderCalcAmt()}</div>
      <div class="t-pane" id="c-pane-gift">${renderCalcGift()}</div>
      <div class="t-pane" id="c-pane-estate">${renderCalcEstate()}</div>
      <div class="t-pane" id="c-pane-house">${renderCalcHouse()}</div>
      <div class="t-pane" id="c-pane-land">${renderCalcLand()}</div>
      <div class="t-pane" id="c-pane-case_house">${renderCalcCaseHouse()}</div>
      <div class="t-pane" id="c-pane-case_stock">${renderCalcCaseStock()}</div>
      <div class="t-pane" id="c-pane-case_fund">${renderCalcCaseFund()}</div>
      <div class="t-pane" id="c-pane-case_realty">${renderCalcCaseRealty()}</div>
    </div>
    <p class="a-note" style="margin-top:24px">本試算依 114 年度（2026 年申報）級距，僅供參考。實際以稅捐稽徵機關核定為準。</p>
  `;
}

function renderCalcCaseHouse() {
  return `
    <div class="calc-form calc-form-wide">
      <h3>案例試算：房產繼承 vs 贈與 vs 買賣比較</h3>
      <p style="font-size:13px; color:var(--text-sub); margin-bottom:14px">
        同一筆房地，比較「繼承」「贈與」「買賣」三種傳承方式之稅負總成本（本次移轉稅 ＋ 未來受讓人出售之房地合一稅）。
      </p>
      <div class="calc-shared">
        <h4>共用資料：房產與受讓人條件</h4>
        <div class="calc-row"><label>土地公告現值（移轉時）</label><input type="number" id="cx-land-cur" placeholder="例：12000000"></div>
        <div class="calc-row"><label>房屋評定標準價格（移轉時）</label><input type="number" id="cx-house-cur" placeholder="例：3000000"></div>
        <div class="calc-row"><label>土地原規定地價／前次移轉現值</label><input type="number" id="cx-land-ori" placeholder="例：5000000"></div>
        <div class="calc-row"><label>市價（預估出售／買賣價金）</label><input type="number" id="cx-market" placeholder="例：30000000"></div>
        <div class="calc-row"><label>受讓人是否符合自住 6 年條件再出售</label>
          <select id="cx-selfuse"><option value="0">否</option><option value="1">是</option></select>
        </div>
      </div>
      <div class="calc-cols cols-3">
        <div class="calc-col col-inherit">
          <h4>繼承路徑</h4>
          <div class="calc-row"><label>被繼承人遺產總額（含本房產）</label><input type="number" id="cx-estate-total" placeholder="例：40000000"></div>
          <div class="calc-row"><label>有配偶？（扣 553 萬）</label>
            <select id="cx-spouse"><option value="0">無</option><option value="1" selected>有</option></select>
          </div>
          <div class="calc-row"><label>直系卑親屬人數（每人扣 56 萬）</label><input type="number" id="cx-children" value="2"></div>
          <div class="calc-row"><label>其他扣除額（喪葬 138 萬已預設）</label><input type="number" id="cx-other-deduct" value="1380000"></div>
          <div class="calc-row"><label>繼承後預計持有年數再出售</label><input type="number" id="cx-hold-inherit" value="11"></div>
        </div>
        <div class="calc-col col-gift">
          <h4>贈與路徑</h4>
          <div class="calc-row"><label>受贈人為配偶？（土增稅不課徵）</label>
            <select id="cx-gift-spouse"><option value="0" selected>否（直系卑親屬）</option><option value="1">是</option></select>
          </div>
          <div class="calc-row"><label>當年度其他贈與（影響 244 萬免稅）</label><input type="number" id="cx-other-gift" value="0"></div>
          <div class="calc-row"><label>贈與後預計持有年數再出售</label><input type="number" id="cx-hold-gift" value="3"></div>
        </div>
        <div class="calc-col col-sale">
          <h4>買賣路徑（父母→子女）</h4>
          <div class="calc-row"><label>父母原始取得成本（房地合計）</label><input type="number" id="cx-parent-cost" placeholder="例：8000000"></div>
          <div class="calc-row"><label>父母已持有年數（影響房地合一）</label><input type="number" id="cx-parent-hold" value="15"></div>
          <div class="calc-row"><label>買賣後預計持有年數再出售</label><input type="number" id="cx-hold-sale" value="3"></div>
        </div>
      </div>
      <button class="calc-btn" onclick="doCalcCaseHouse()">試算比較</button>
      <div class="calc-result" id="cx-result"></div>
    </div>
    <details class="calc-notes">
      <summary>試算邏輯與規則說明</summary>
      <h4>繼承路徑（推薦於高齡長輩、財產量大）</h4>
      <ul>
        <li>遺產稅：以遺產總額計算，免稅 1,333 萬＋扣除額（配偶 553 / 子女 56/人 / 喪葬 138 等）</li>
        <li>土地增值稅：<b>免徵</b>（§39）</li>
        <li>房屋契稅：免徵</li>
        <li>取得成本：以繼承時公告現值 + 房屋評定標準價</li>
        <li>未來出售房地合一：持有期間含被繼承人持有期間，多落在 ≥10 年 15% 級距</li>
      </ul>
      <h4>贈與路徑（推薦於年輕、財產量低、分年規劃）</h4>
      <ul>
        <li>贈與稅：贈與淨額（公告現值 + 評定價 − 244 萬免稅）× 10/15/20%</li>
        <li>土地增值稅：須繳納（除配偶間贈與不課徵）；受贈人為直系卑親屬須繳一般稅率</li>
        <li>房屋契稅：6%（房屋評定標準價 × 6%）</li>
        <li>取得成本：以贈與時公告現值 + 房屋評定標準價</li>
        <li>未來出售房地合一：持有期間從受贈日重新起算，短期出售稅率高（≤2 年 45%、2–5 年 35%）</li>
      </ul>
      <h4>買賣路徑（父母賣給子女；推薦於子女有實際購買能力時）</h4>
      <ul>
        <li>父母端房地合一稅：(市價 − 父母原始取得成本) × 持有年限對應稅率（≤2 年 45%、2–5 年 35%、5–10 年 20%、&gt;10 年 15%）</li>
        <li>父母端土地增值稅：(土地公告現值 − 原規定地價) × 累進稅率（一般稅率 20/30/40%）</li>
        <li>子女端房屋契稅：6%（房屋評定標準價 × 6%）</li>
        <li>子女端印花稅：契約金額 × 0.1%（土地公告現值 + 房屋評定價）</li>
        <li>取得成本：以實際買賣價金（市價）為基礎，未來再出售之房地合一稅基極低</li>
        <li><b style="color:#d62828">⚠ 擬制贈與風險（遺贈稅法 §5 第 6 款）</b>：父母與子女間買賣，稅捐機關推定為贈與；子女須提供「實際支付價款」與「資金來源非父母提供」之證明（例如子女自有薪資、貸款、實際支付匯款紀錄等），否則仍依贈與稅課徵。</li>
      </ul>
      <h4>建議判斷原則</h4>
      <ul>
        <li>遺產 &lt; 1,333 萬免稅額：繼承幾乎零成本，明顯優於贈與與買賣</li>
        <li>遺產 1,471 萬 ~ 2,000 萬：繼承 10% 稅率，仍多優於贈與（贈與含土增＋契稅）</li>
        <li>遺產 ≥ 5,621 萬：邊際稅率 15-20%，可考慮分年贈與或安排買賣分擔稅基</li>
        <li>父母帳上市價 ≫ 公告現值 → 買賣路徑父母房地合一稅高，未必划算</li>
        <li>子女有真實購買能力＋持有年限長 → 買賣可降低未來房地合一稅，但須備齊資金來源證明</li>
        <li>受贈／受讓後短期出售（&lt; 5 年）：贈與／買賣路徑房地合一 35-45%，總成本反而高，建議繼承</li>
        <li>受贈為配偶：土增稅不課徵、契稅減半，但仍須贈與稅；可作為配偶間財產移轉</li>
      </ul>
      <p class="calc-note-src">資料來源：遺贈稅法 §5、§16-§22、§39；所得稅法 §14-4；土地稅法 §28-§39-1；契稅條例；印花稅法 §7</p>
    </details>`;
}

function doCalcCaseHouse() {
  const landCur = +$("cx-land-cur").value || 0;       // 土地公告現值（移轉時）
  const houseCur = +$("cx-house-cur").value || 0;     // 房屋評定價（移轉時）
  const landOri = +$("cx-land-ori").value || 0;       // 土地原規定地價
  const market = +$("cx-market").value || 0;          // 市價／買賣價金
  const estateTotal = +$("cx-estate-total").value || 0;
  const hasSpouse = +$("cx-spouse").value === 1;
  const children = +$("cx-children").value || 0;
  const otherDeduct = +$("cx-other-deduct").value || 0;
  const giftSpouse = +$("cx-gift-spouse").value === 1;
  const otherGift = +$("cx-other-gift").value || 0;
  const parentCost = +$("cx-parent-cost").value || 0;
  const parentHold = +$("cx-parent-hold").value || 0;
  const holdInherit = +$("cx-hold-inherit").value || 0;
  const holdGift = +$("cx-hold-gift").value || 0;
  const holdSale = +$("cx-hold-sale").value || 0;
  const selfUse = +$("cx-selfuse").value === 1;

  // 房地價值（公告現值總和，課稅基準）
  const declaredValue = landCur + houseCur;

  // ========== 繼承路徑 ==========
  const inheritDeductions = (hasSpouse ? 5530000 : 0) + children * 560000 + otherDeduct;
  const estateRes = calcEstateTax(estateTotal, inheritDeductions);
  const houseShareInherit = estateTotal > 0 ? declaredValue / estateTotal : 0;
  const inheritEstateTax = estateRes.tax * houseShareInherit;
  const inheritGain = Math.max(0, market - declaredValue);
  const inheritHL = calcHouseLandTax(inheritGain, holdInherit, selfUse);
  const inheritTotal = inheritEstateTax + inheritHL.tax;

  // ========== 贈與路徑 ==========
  const giftAmount = declaredValue + otherGift;
  const giftRes = calcGiftTax(giftAmount);
  const houseShareGift = giftAmount > 0 ? declaredValue / giftAmount : 1;
  const giftTaxOnHouse = giftRes.tax * houseShareGift;
  let giftLVT = 0;
  if (!giftSpouse) {
    const incLand = landCur - landOri;
    const lvtRes = calcLandValueTax(incLand, landOri, false, 0);
    giftLVT = lvtRes.tax;
  }
  const giftDeed = houseCur * 0.06;
  const giftGain = Math.max(0, market - declaredValue);
  const giftHL = calcHouseLandTax(giftGain, holdGift, selfUse);
  const giftTotal = giftTaxOnHouse + giftLVT + giftDeed + giftHL.tax;

  // ========== 買賣路徑（父母→子女） ==========
  // 父母端房地合一：(市價 − 父母取得成本) × 持有期間對應稅率
  const saleParentGain = Math.max(0, market - parentCost);
  const saleParentHL = calcHouseLandTax(saleParentGain, parentHold, false); // 父母端通常非自住適用
  // 父母端土增稅（一般買賣須課）
  const incLandSale = landCur - landOri;
  const saleLVT = incLandSale > 0 ? calcLandValueTax(incLandSale, landOri, false, 0).tax : 0;
  // 子女端契稅 6%
  const saleDeed = houseCur * 0.06;
  // 子女端印花稅 0.1%（公告現值 + 評定價）
  const saleStamp = declaredValue * 0.001;
  // 未來子女出售房地合一：取得成本＝實際買賣價金（市價），通常 gain 接近 0
  // 但若未來再增值，假設市價維持 → gain = 0；保守起見以 gain=0 計
  const saleFutureGain = 0; // 子女以市價取得，未來出售若市價未變動則 gain=0
  const saleFutureHL = calcHouseLandTax(saleFutureGain, holdSale, selfUse);
  const saleTotal = saleParentHL.tax + saleLVT + saleDeed + saleStamp + saleFutureHL.tax;

  // 三方比較取最低
  const paths = [
    { name: "繼承", total: inheritTotal },
    { name: "贈與", total: giftTotal },
    { name: "買賣", total: saleTotal },
  ];
  paths.sort((a, b) => a.total - b.total);
  const winner = paths[0].name;
  const diff = paths[1].total - paths[0].total;

  const winnerNote = {
    "繼承": "；惟須等待被繼承人離世，無立即移轉效果。",
    "贈與": "；可立即移轉房產控制權。",
    "買賣": "；可立即移轉，但須備齊子女資金來源證明，避免被認定擬制贈與（遺贈稅法 §5）。",
  };

  $("cx-result").innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;margin-bottom:10px">
      <div style="padding:10px;background:#fff;border-radius:6px">
        <div style="font-size:13px;color:var(--brand-deep);font-weight:700;margin-bottom:6px">繼承路徑</div>
        <div class="kv"><span>遺產稅（房產佔比）</span><b>${fmtMoney(inheritEstateTax)}</b></div>
        <div class="kv"><span>土地增值稅</span><b style="color:var(--down)">免徵</b></div>
        <div class="kv"><span>房屋契稅</span><b style="color:var(--down)">免徵</b></div>
        <div class="kv"><span>未來出售房地合一（${inheritHL.rate}）</span><b>${fmtMoney(inheritHL.tax)}</b></div>
        <div class="kv" style="border-top:1px solid var(--border);margin-top:6px;padding-top:6px"><span>合計</span><b style="color:var(--up);font-size:16px">${fmtMoney(inheritTotal)}</b></div>
      </div>
      <div style="padding:10px;background:#fff;border-radius:6px">
        <div style="font-size:13px;color:#e08a3c;font-weight:700;margin-bottom:6px">贈與路徑</div>
        <div class="kv"><span>贈與稅（房產佔比）</span><b>${fmtMoney(giftTaxOnHouse)}</b></div>
        <div class="kv"><span>土地增值稅${giftSpouse?'（配偶不課徵）':''}</span><b>${fmtMoney(giftLVT)}</b></div>
        <div class="kv"><span>房屋契稅 6%</span><b>${fmtMoney(giftDeed)}</b></div>
        <div class="kv"><span>未來出售房地合一（${giftHL.rate}）</span><b>${fmtMoney(giftHL.tax)}</b></div>
        <div class="kv" style="border-top:1px solid var(--border);margin-top:6px;padding-top:6px"><span>合計</span><b style="color:var(--up);font-size:16px">${fmtMoney(giftTotal)}</b></div>
      </div>
      <div style="padding:10px;background:#fff;border-radius:6px">
        <div style="font-size:13px;color:#6a5acd;font-weight:700;margin-bottom:6px">買賣路徑</div>
        <div class="kv"><span>父母房地合一（${saleParentHL.rate}）</span><b>${fmtMoney(saleParentHL.tax)}</b></div>
        <div class="kv"><span>父母土地增值稅</span><b>${fmtMoney(saleLVT)}</b></div>
        <div class="kv"><span>子女房屋契稅 6%</span><b>${fmtMoney(saleDeed)}</b></div>
        <div class="kv"><span>子女印花稅 0.1%</span><b>${fmtMoney(saleStamp)}</b></div>
        <div class="kv"><span>未來出售房地合一（${saleFutureHL.rate}）</span><b>${fmtMoney(saleFutureHL.tax)}</b></div>
        <div class="kv" style="border-top:1px solid var(--border);margin-top:6px;padding-top:6px"><span>合計</span><b style="color:var(--up);font-size:16px">${fmtMoney(saleTotal)}</b></div>
      </div>
    </div>
    <div style="padding:12px 14px;background:linear-gradient(135deg,#E5F2F5,#fff);border-radius:8px">
      <div style="font-size:15px;font-weight:700;color:var(--brand-deep);margin-bottom:4px">建議：${winner}路徑較划算</div>
      <div style="font-size:13px;color:var(--text-sub)">較次低差額約 <b>${fmtMoney(diff)}</b>${winnerNote[winner] || ""}</div>
    </div>`;
}

// ========== 案例：股票 個人 vs 投資公司 ==========
function renderCalcCaseStock() {
  return `
    <div class="calc-form calc-form-wide">
      <h3>案例試算：股票持有 個人 vs 投資公司比較</h3>
      <p style="font-size:13px;color:var(--text-sub);margin-bottom:14px">
        比較相同股票部位由「個人」或「投資公司」持有，於年度配息＋資本利得情境下之稅負總和。
      </p>
      <div class="calc-shared">
        <h4>共用：投資情境</h4>
        <div class="calc-row"><label>年股利所得（境內公司股利）</label><input type="number" id="cs-div" placeholder="例：5000000"></div>
        <div class="calc-row"><label>年資本利得（賣股獲利）</label><input type="number" id="cs-gain" placeholder="例：10000000"></div>
      </div>
      <div class="calc-cols cols-2">
        <div class="calc-col col-person">
          <h4>個人持有</h4>
          <div class="calc-row"><label>個人邊際稅率</label>
            <select id="cs-rate">
              <option value="0.05">5%</option>
              <option value="0.12">12%</option>
              <option value="0.20">20%</option>
              <option value="0.30" selected>30%</option>
              <option value="0.40">40%</option>
            </select>
          </div>
          <p style="font-size:12px;color:var(--text-mute);margin:6px 0 0">
            股利兩制取低 + 二代健保 2.11%；資本利得停徵
          </p>
        </div>
        <div class="calc-col col-company">
          <h4>投資公司持有</h4>
          <div class="calc-row"><label>股利是否分配給股東？</label>
            <select id="cs-distrib">
              <option value="0" selected>否（保留盈餘，加徵 5%）</option>
              <option value="1">是（最終分配，再課個人）</option>
            </select>
          </div>
          <p style="font-size:12px;color:var(--text-mute);margin:6px 0 0">
            §42 股利免稅；資本利得計入最低稅負 12%
          </p>
        </div>
      </div>
      <button class="calc-btn" onclick="doCalcCaseStock()">試算比較</button>
      <div class="calc-result" id="cs-result"></div>
    </div>
    <details class="calc-notes">
      <summary>試算邏輯與規則說明</summary>
      <h4>個人持有</h4>
      <ul>
        <li>股利：所得稅法 §15 兩制擇一。合併計稅＝股利 × 邊際稅率 − min(股利 × 8.5%, 80,000)；分離計稅＝股利 × 28%。取較低者。</li>
        <li>二代健保補充保費：股利 × 2.11%（單筆 ≥ 2 萬元才扣，單次上限 1,000 萬元）</li>
        <li>資本利得：證券交易所得停徵（§4-1），個人不課所得稅</li>
      </ul>
      <h4>投資公司持有</h4>
      <ul>
        <li>股利：法人間股利免稅（§42）</li>
        <li>未分配盈餘加徵 5%（§66-9）：若不分配，當年盈餘 × 5%</li>
        <li>資本利得：個人證所稅停徵不適用法人；計入營利事業最低稅負，基本稅額 12%（基本稅額條例 §7）</li>
        <li>若最終分配給個人股東：個人再課股利兩制（雙重課稅）</li>
        <li>額外成本：公司設立、會計師簽證、營業稅申報等行政費用（本試算未計入）</li>
      </ul>
      <p class="calc-note-src">資料來源：所得稅法 §4-1、§15、§42、§66-9；所得基本稅額條例 §7；全民健保法 §31</p>
    </details>`;
}
function doCalcCaseStock() {
  const div = +$("cs-div").value || 0;
  const gain = +$("cs-gain").value || 0;
  const rate = +$("cs-rate").value || 0.3;
  const distrib = +$("cs-distrib").value === 1;

  // 個人端
  // 股利兩制
  const taxCombined = Math.max(0, div * rate - Math.min(div * 0.085, 80000));
  const taxSeparate = div * 0.28;
  const personalDivTax = Math.min(taxCombined, taxSeparate);
  const divMethod = taxCombined < taxSeparate ? "合併計稅" : "分離 28%";
  // 二代健保 2.11%（單次 ≥ 2 萬 扣繳）
  const personalNHI = div >= 20000 ? Math.min(div, 10000000) * 0.0211 : 0;
  // 資本利得：個人停徵
  const personalGain = 0;
  const personalTotal = personalDivTax + personalNHI + personalGain;

  // 投資公司端
  // 股利免稅，但未分配盈餘加徵 5%（假設股利進入盈餘且不分配）
  let companyDivTax = 0;
  let companyRetention = 0;
  let companyDistribToPerson = 0;
  if (distrib) {
    // 分配出來：個人股利兩制再算一次（雙重課稅）
    const finalDiv = div; // 簡化：股利全額分配
    const tc = Math.max(0, finalDiv * rate - Math.min(finalDiv * 0.085, 80000));
    const ts = finalDiv * 0.28;
    companyDistribToPerson = Math.min(tc, ts);
  } else {
    // 未分配盈餘加徵 5%
    companyRetention = div * 0.05;
  }
  // 資本利得計入營利事業最低稅負 12%
  const companyGainAMT = gain * 0.12;
  const companyTotal = companyDivTax + companyRetention + companyDistribToPerson + companyGainAMT;

  const winner = personalTotal < companyTotal ? "個人持有" : "投資公司持有";
  const diff = Math.abs(personalTotal - companyTotal);

  $("cs-result").innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px">
      <div style="padding:10px;background:#fff;border-radius:6px">
        <div style="font-size:13px;color:var(--brand-deep);font-weight:700;margin-bottom:6px">個人持有</div>
        <div class="kv"><span>股利稅（${divMethod}）</span><b>${fmtMoney(personalDivTax)}</b></div>
        <div class="kv"><span>二代健保 2.11%</span><b>${fmtMoney(personalNHI)}</b></div>
        <div class="kv"><span>資本利得稅</span><b style="color:var(--down)">停徵</b></div>
        <div class="kv" style="border-top:1px solid var(--border);margin-top:6px;padding-top:6px"><span>合計</span><b style="color:var(--up);font-size:16px">${fmtMoney(personalTotal)}</b></div>
      </div>
      <div style="padding:10px;background:#fff;border-radius:6px">
        <div style="font-size:13px;color:#6a5acd;font-weight:700;margin-bottom:6px">投資公司持有</div>
        <div class="kv"><span>股利稅（§42 免稅）</span><b style="color:var(--down)">免徵</b></div>
        ${distrib
          ? `<div class="kv"><span>分配給個人再課（兩制擇低）</span><b>${fmtMoney(companyDistribToPerson)}</b></div>`
          : `<div class="kv"><span>未分配盈餘加徵 5%</span><b>${fmtMoney(companyRetention)}</b></div>`}
        <div class="kv"><span>資本利得最低稅負 12%</span><b>${fmtMoney(companyGainAMT)}</b></div>
        <div class="kv" style="border-top:1px solid var(--border);margin-top:6px;padding-top:6px"><span>合計</span><b style="color:var(--up);font-size:16px">${fmtMoney(companyTotal)}</b></div>
      </div>
    </div>
    <div style="padding:12px 14px;background:linear-gradient(135deg,#E5F2F5,#fff);border-radius:8px">
      <div style="font-size:15px;font-weight:700;color:var(--brand-deep);margin-bottom:4px">建議：${winner}較划算</div>
      <div style="font-size:13px;color:var(--text-sub)">差額約 <b>${fmtMoney(diff)}</b>${winner === "投資公司持有" ? "；惟須計入公司設立與行政成本，且未來盈餘分配給個人時將二次課稅。" : "；個人持有單純，但股利大額時邊際稅率高。"}</div>
    </div>`;
}

// ========== 案例：基金 個人 vs 投資公司 ==========
function renderCalcCaseFund() {
  return `
    <div class="calc-form calc-form-wide">
      <h3>案例試算：基金持有 個人 vs 投資公司比較</h3>
      <p style="font-size:13px;color:var(--text-sub);margin-bottom:14px">
        比較相同基金部位由「個人」或「投資公司」持有，於配息＋贖回利得情境下之稅負總和。
      </p>
      <div class="calc-shared">
        <h4>共用：基金類型與所得</h4>
        <div class="calc-row"><label>基金發行地</label>
          <select id="cf-loc">
            <option value="dom" selected>境內基金（投信發行）</option>
            <option value="off">境外基金（盧森堡/開曼）</option>
          </select>
        </div>
        <div class="calc-row"><label>年配息（合計）</label><input type="number" id="cf-div" placeholder="例：3000000"></div>
        <div class="calc-row"><label>年贖回利得（資本利得）</label><input type="number" id="cf-gain" placeholder="例：5000000"></div>
      </div>
      <div class="calc-cols cols-2">
        <div class="calc-col col-person">
          <h4>個人持有</h4>
          <div class="calc-row"><label>個人邊際稅率</label>
            <select id="cf-rate">
              <option value="0.05">5%</option>
              <option value="0.20">20%</option>
              <option value="0.30" selected>30%</option>
              <option value="0.40">40%</option>
            </select>
          </div>
          <p style="font-size:12px;color:var(--text-mute);margin:6px 0 0">
            境內：贖回停徵、股利兩制。境外：海外所得扣 670 萬後 ×20% AMT
          </p>
        </div>
        <div class="calc-col col-company">
          <h4>投資公司持有</h4>
          <p style="font-size:12px;color:var(--text-mute);margin:6px 0 0">
            境內：股利 §42 免稅、贖回計入未分配盈餘 5% 加徵。境外：贖回利得+配息併營所稅 20%
          </p>
        </div>
      </div>
      <button class="calc-btn" onclick="doCalcCaseFund()">試算比較</button>
      <div class="calc-result" id="cf-result"></div>
    </div>
    <details class="calc-notes">
      <summary>試算邏輯與規則說明</summary>
      <h4>境內基金（投信發行）</h4>
      <ul>
        <li>個人：贖回利得屬證券交易所得，<b>停徵</b>（§4-1）；配息依組成課稅（股利兩制／利息合併或併儲蓄扣除 27 萬／財產交易併綜所）</li>
        <li>投資公司：贖回利得為證券交易所得，免營所稅，但計入未分配盈餘加徵 5%；配息中股利部分依 §42 免稅、利息部分併營所稅 20%</li>
      </ul>
      <h4>境外基金（盧森堡 SICAV、開曼公司型）</h4>
      <ul>
        <li>個人：贖回利得＋配息＝海外所得，計入最低稅負；扣除 670 萬免稅後 × 20%，與綜所稅取大繳納</li>
        <li>投資公司：境外基金贖回利得＋配息屬營利事業所得，併入營所稅 20%</li>
      </ul>
      <p class="calc-note-src">資料來源：所得稅法 §4-1、§14、§42；所得基本稅額條例 §12；財政部 99.10.4 台財稅字第 09904100250 號令</p>
    </details>`;
}
function doCalcCaseFund() {
  const loc = $("cf-loc").value;
  const div = +$("cf-div").value || 0;
  const gain = +$("cf-gain").value || 0;
  const rate = +$("cf-rate").value || 0.3;

  let personalTotal, companyTotal;
  let personalBreakdown, companyBreakdown;

  if (loc === "dom") {
    // 境內基金
    // 個人：配息簡化全部以股利兩制處理；贖回利得停徵
    const tc = Math.max(0, div * rate - Math.min(div * 0.085, 80000));
    const ts = div * 0.28;
    const personalDivTax = Math.min(tc, ts);
    personalTotal = personalDivTax;
    personalBreakdown = `
      <div class="kv"><span>配息（股利兩制取低）</span><b>${fmtMoney(personalDivTax)}</b></div>
      <div class="kv"><span>贖回利得</span><b style="color:var(--down)">停徵</b></div>`;

    // 投資公司：配息股利部分 §42 免稅（簡化全免），贖回利得計入未分配盈餘 5%
    const companyRet = (div + gain) * 0.05; // 簡化：當年盈餘 = 配息+贖回利得，全留未分配
    companyTotal = companyRet;
    companyBreakdown = `
      <div class="kv"><span>配息（§42 免稅）</span><b style="color:var(--down)">免徵</b></div>
      <div class="kv"><span>未分配盈餘加徵 5%（含贖回利得）</span><b>${fmtMoney(companyRet)}</b></div>`;
  } else {
    // 境外基金
    // 個人：合計海外所得，扣 670 萬，× 20%，與綜所稅取大（簡化：只看 AMT 部分）
    const overseas = div + gain;
    const amt = Math.max(0, overseas - 6700000) * 0.20;
    personalTotal = amt;
    personalBreakdown = `
      <div class="kv"><span>海外所得合計</span><span>${fmtMoney(overseas)}</span></div>
      <div class="kv"><span>扣 670 萬後 × 20%（與綜所稅取大）</span><b>${fmtMoney(amt)}</b></div>`;

    // 投資公司：併入營所稅 20%
    const companyTax = (div + gain) * 0.20;
    companyTotal = companyTax;
    companyBreakdown = `
      <div class="kv"><span>境外基金所得合計</span><span>${fmtMoney(overseas)}</span></div>
      <div class="kv"><span>計入營所稅 20%</span><b>${fmtMoney(companyTax)}</b></div>`;
  }

  const winner = personalTotal < companyTotal ? "個人持有" : "投資公司持有";
  const diff = Math.abs(personalTotal - companyTotal);

  $("cf-result").innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px">
      <div style="padding:10px;background:#fff;border-radius:6px">
        <div style="font-size:13px;color:var(--brand-deep);font-weight:700;margin-bottom:6px">個人持有</div>
        ${personalBreakdown}
        <div class="kv" style="border-top:1px solid var(--border);margin-top:6px;padding-top:6px"><span>合計</span><b style="color:var(--up);font-size:16px">${fmtMoney(personalTotal)}</b></div>
      </div>
      <div style="padding:10px;background:#fff;border-radius:6px">
        <div style="font-size:13px;color:#6a5acd;font-weight:700;margin-bottom:6px">投資公司持有</div>
        ${companyBreakdown}
        <div class="kv" style="border-top:1px solid var(--border);margin-top:6px;padding-top:6px"><span>合計</span><b style="color:var(--up);font-size:16px">${fmtMoney(companyTotal)}</b></div>
      </div>
    </div>
    <div style="padding:12px 14px;background:linear-gradient(135deg,#E5F2F5,#fff);border-radius:8px">
      <div style="font-size:15px;font-weight:700;color:var(--brand-deep);margin-bottom:4px">建議：${winner}較划算</div>
      <div style="font-size:13px;color:var(--text-sub)">差額約 <b>${fmtMoney(diff)}</b>${loc==="dom" ? "（境內基金，個人贖回利得停徵為關鍵優勢）" : "（境外基金，個人有 670 萬免稅額；公司全額併入營所稅）"}</div>
    </div>`;
}

// ========== 案例：房產 個人 vs 投資公司 ==========
function renderCalcCaseRealty() {
  return `
    <div class="calc-form calc-form-wide">
      <h3>案例試算：房產持有 個人 vs 投資公司比較</h3>
      <p style="font-size:13px;color:var(--text-sub);margin-bottom:14px">
        比較同一筆出租房產由「個人」或「投資公司」持有，於持有期間（租賃所得）＋未來出售（房地合一）之稅負總和。
      </p>
      <div class="calc-shared">
        <h4>共用：房產與租賃資料</h4>
        <div class="calc-row"><label>年租金收入</label><input type="number" id="cr-rent" placeholder="例：1200000"></div>
        <div class="calc-row"><label>取得成本（含土地房屋）</label><input type="number" id="cr-cost" placeholder="例：15000000"></div>
        <div class="calc-row"><label>預估出售價</label><input type="number" id="cr-sale" placeholder="例：25000000"></div>
        <div class="calc-row"><label>持有年數</label><input type="number" id="cr-hold" value="6"></div>
      </div>
      <div class="calc-cols cols-2">
        <div class="calc-col col-person">
          <h4>個人持有</h4>
          <div class="calc-row"><label>個人邊際稅率</label>
            <select id="cr-rate">
              <option value="0.05">5%</option>
              <option value="0.20">20%</option>
              <option value="0.30" selected>30%</option>
              <option value="0.40">40%</option>
            </select>
          </div>
          <p style="font-size:12px;color:var(--text-mute);margin:6px 0 0">
            租金 ×57% 併綜所稅；房地合一依持有期間 45/35/20/15%（自住優惠）
          </p>
        </div>
        <div class="calc-col col-company">
          <h4>投資公司持有</h4>
          <p style="font-size:12px;color:var(--text-mute);margin:6px 0 0">
            租金 ×70% 併營所稅 20%；房地合一 45/35/20%（無自住）+ 未分配盈餘加徵 5%
          </p>
        </div>
      </div>
      <button class="calc-btn" onclick="doCalcCaseRealty()">試算比較</button>
      <div class="calc-result" id="cr-result"></div>
    </div>
    <details class="calc-notes">
      <summary>試算邏輯與規則說明</summary>
      <h4>個人持有</h4>
      <ul>
        <li>租賃所得：租金 × 57%（扣 43% 必要費用率）併入綜所稅，按邊際稅率課徵</li>
        <li>持有：自住地價稅 2‰／房屋稅 1.2%；非自住稅率較高</li>
        <li>出售：房地合一 §14-4，依持有期間 45/35/20/15%（自住可享 400 萬免稅＋10% 優惠）</li>
      </ul>
      <h4>投資公司持有（房地產業以外）</h4>
      <ul>
        <li>租賃所得：列入營業收入，扣除實際費用後依營所稅 20%</li>
        <li>持有：地價稅一般稅率 10‰；房屋稅 3-3.6%（非自住、營業用較高）</li>
        <li>出售：法人房地合一 §24-5；持有 ≤ 2 年 45%、2-5 年 35%、&gt; 5 年 20%（法人無自住優惠）</li>
        <li>盈餘分配：若分配給個人股東須再課股利稅；不分配則加徵 5%</li>
      </ul>
      <p class="calc-note-src">資料來源：所得稅法 §14-4、§24-5；土地稅法；房屋稅條例；§66-9</p>
    </details>`;
}
function doCalcCaseRealty() {
  const rent = +$("cr-rent").value || 0;
  const cost = +$("cr-cost").value || 0;
  const sale = +$("cr-sale").value || 0;
  const hold = +$("cr-hold").value || 0;
  const rate = +$("cr-rate").value || 0.3;

  const gain = Math.max(0, sale - cost);

  // 個人持有
  const personalRentTax = rent * 0.57 * rate; // 43% 必要費用率
  // 房地合一個人稅率
  let personalHLRate;
  if (hold <= 2) personalHLRate = 0.45;
  else if (hold <= 5) personalHLRate = 0.35;
  else if (hold <= 10) personalHLRate = 0.20;
  else personalHLRate = 0.15;
  const personalSaleTax = gain * personalHLRate;
  const personalTotal = personalRentTax + personalSaleTax;

  // 投資公司持有
  // 租賃所得：簡化扣 30% 費用 → 課營所稅 20%
  const companyRentTax = rent * 0.70 * 0.20;
  // 房地合一法人稅率
  let companyHLRate;
  if (hold <= 2) companyHLRate = 0.45;
  else if (hold <= 5) companyHLRate = 0.35;
  else companyHLRate = 0.20;
  const companySaleTax = gain * companyHLRate;
  // 出售後盈餘若未分配加徵 5%（簡化以 gain 為盈餘來源）
  const companyRet = Math.max(0, gain - companySaleTax) * 0.05;
  const companyTotal = companyRentTax + companySaleTax + companyRet;

  const winner = personalTotal < companyTotal ? "個人持有" : "投資公司持有";
  const diff = Math.abs(personalTotal - companyTotal);

  $("cr-result").innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px">
      <div style="padding:10px;background:#fff;border-radius:6px">
        <div style="font-size:13px;color:var(--brand-deep);font-weight:700;margin-bottom:6px">個人持有</div>
        <div class="kv"><span>租賃所得稅（×57%×${(rate*100).toFixed(0)}%）</span><b>${fmtMoney(personalRentTax)}</b></div>
        <div class="kv"><span>房地合一（${(personalHLRate*100).toFixed(0)}%）</span><b>${fmtMoney(personalSaleTax)}</b></div>
        <div class="kv" style="border-top:1px solid var(--border);margin-top:6px;padding-top:6px"><span>合計</span><b style="color:var(--up);font-size:16px">${fmtMoney(personalTotal)}</b></div>
      </div>
      <div style="padding:10px;background:#fff;border-radius:6px">
        <div style="font-size:13px;color:#6a5acd;font-weight:700;margin-bottom:6px">投資公司持有</div>
        <div class="kv"><span>租金併營所稅 20%（×70%）</span><b>${fmtMoney(companyRentTax)}</b></div>
        <div class="kv"><span>房地合一（${(companyHLRate*100).toFixed(0)}%）</span><b>${fmtMoney(companySaleTax)}</b></div>
        <div class="kv"><span>未分配盈餘加徵 5%</span><b>${fmtMoney(companyRet)}</b></div>
        <div class="kv" style="border-top:1px solid var(--border);margin-top:6px;padding-top:6px"><span>合計</span><b style="color:var(--up);font-size:16px">${fmtMoney(companyTotal)}</b></div>
      </div>
    </div>
    <div style="padding:12px 14px;background:linear-gradient(135deg,#E5F2F5,#fff);border-radius:8px">
      <div style="font-size:15px;font-weight:700;color:var(--brand-deep);margin-bottom:4px">建議：${winner}較划算</div>
      <div style="font-size:13px;color:var(--text-sub)">差額約 <b>${fmtMoney(diff)}</b>；持有 ≤ 5 年短期持有時，個人房地合一稅率與法人相同，但法人多了營所稅與未分配盈餘加徵。</div>
    </div>`;
}

function renderCalcIncome() {
  return `
    <div class="calc-form">
      <h3>綜合所得稅試算</h3>
      <div class="calc-row"><label>所得總額（年薪/總收入）</label><input type="number" id="ci-income" placeholder="例：1500000"></div>
      <div class="calc-row"><label>免稅額（單身 92,000 / 70 歲以上 138,000）</label><input type="number" id="ci-exempt" value="92000"></div>
      <div class="calc-row"><label>標準扣除額（單身 132k / 夫妻 264k）</label><input type="number" id="ci-deduct" value="132000"></div>
      <div class="calc-row"><label>薪資特別扣除（每人上限 218k）</label><input type="number" id="ci-salary" value="218000"></div>
      <div class="calc-row"><label>其他扣除額</label><input type="number" id="ci-other" value="0"></div>
      <button class="calc-btn" onclick="doCalcIncome()">試算</button>
      <div class="calc-result" id="ci-result"></div>
    </div>
    <details class="calc-notes">
      <summary>相關規定說明（114 年度）</summary>
      <h4>免稅額</h4>
      <ul>
        <li>本人、配偶及受扶養親屬：每人 92,000 元</li>
        <li>本人、配偶年滿 70 歲或受扶養之直系尊親屬：每人 138,000 元</li>
      </ul>
      <h4>扣除額：標準 vs 列舉（擇一）</h4>
      <ul>
        <li>標準扣除額：單身 132,000；夫妻合併申報 264,000</li>
        <li>列舉扣除額：捐贈、人身保險費（每人上限 24,000）、醫藥及生育費、災害損失、購屋借款利息（每戶上限 300,000）、房屋租金支出（每戶上限 120,000）</li>
      </ul>
      <h4>特別扣除額</h4>
      <ul>
        <li>薪資所得特別扣除：每人 218,000</li>
        <li>儲蓄投資特別扣除：每戶 270,000</li>
        <li>身心障礙特別扣除：每人 218,000</li>
        <li>教育學費特別扣除：每人 25,000（大專以上子女）</li>
        <li>幼兒學前特別扣除：5 歲以下每人 120,000（第二名以上加倍）</li>
        <li>長期照顧特別扣除：每人 120,000</li>
      </ul>
      <h4>稅率級距（114 年度）</h4>
      <ul>
        <li>590,000 以下：5%</li>
        <li>590,001 – 1,330,000：12%（累進差額 29,500）</li>
        <li>1,330,001 – 2,660,000：20%（累進差額 118,300）</li>
        <li>2,660,001 – 4,980,000：30%（累進差額 384,300）</li>
        <li>4,980,001 以上：40%（累進差額 1,080,300）</li>
      </ul>
      <p class="calc-note-src">資料來源：所得稅法 §17、財政部 114 年度公告</p>
    </details>`;
}

function renderCalcAmt() {
  return `
    <div class="calc-form">
      <h3>最低稅負制試算（個人 AMT）</h3>
      <div class="calc-row"><label>綜所淨額（已扣除免稅額/扣除額）</label><input type="number" id="ca-comp" placeholder="例：5000000"></div>
      <div class="calc-row"><label>海外所得（一申報戶全年合計）</label><input type="number" id="ca-overseas" value="0"></div>
      <div class="calc-row"><label>大額人壽保險給付（要保≠受益）</label><input type="number" id="ca-ins" value="0"></div>
      <div class="calc-row"><label>未上市股票交易所得＋其他加項</label><input type="number" id="ca-other" value="0"></div>
      <div class="calc-row"><label>原本綜所稅應納稅額</label><input type="number" id="ca-regular" value="0"></div>
      <button class="calc-btn" onclick="doCalcAmt()">試算</button>
      <div class="calc-result" id="ca-result"></div>
    </div>
    <details class="calc-notes">
      <summary>相關規定說明（114 年度）</summary>
      <h4>基本所得額加項（§12）</h4>
      <ul>
        <li>海外所得：一申報戶全年合計 ≥ NT$100 萬，全數計入（未達 100 萬免計）</li>
        <li>大額人壽保險給付：要保人與受益人不同，且全年合計逾 NT$3,740 萬（114 年度），就超出部分計入</li>
        <li>私募證券投資信託基金之受益憑證交易所得</li>
        <li>未上市、未上櫃且非興櫃公司股票交易所得</li>
        <li>非現金部分之捐贈扣除額</li>
      </ul>
      <h4>個人 CFC（§12-1）</h4>
      <ul>
        <li>個人＋配偶＋二親等內親屬合計持有低稅負國家之關係企業 ≥ 50%</li>
        <li>計算盈餘按持股比率＋持有期間認列為海外所得</li>
        <li>豁免：實質營運活動，或 CFC 當年度盈餘 ≤ 700 萬（全戶 CFC 盈餘合計亦 ≤ 700 萬）</li>
      </ul>
      <h4>計算公式（§13）</h4>
      <ul>
        <li>基本稅額 = （基本所得額 − 670 萬）× 20%</li>
        <li>與綜所稅應納稅額比較取較高者繳納</li>
        <li>綜所稅 ≥ 基本稅額：不須補繳</li>
        <li>基本稅額 > 綜所稅：差額另行補繳</li>
        <li>海外已納稅額可扣抵（不得超過該海外所得依國內稅率計算之稅額）</li>
      </ul>
      <p class="calc-note-src">資料來源：所得基本稅額條例 §12、§12-1、§13；財政部 114 年度公告</p>
    </details>`;
}

function renderCalcGift() {
  return `
    <div class="calc-form">
      <h3>贈與稅試算</h3>
      <div class="calc-row"><label>本年度贈與總額</label><input type="number" id="cg-amount" placeholder="例：10000000"></div>
      <p style="font-size:13px; color:var(--text-mute)">114 年度免稅額 244 萬／級距 10% (≤2,811 萬) → 15% → 20% (>5,621 萬)</p>
      <button class="calc-btn" onclick="doCalcGift()">試算</button>
      <div class="calc-result" id="cg-result"></div>
    </div>
    <details class="calc-notes">
      <summary>相關規定說明（114 年度）</summary>
      <h4>免稅額與稅率（§22、§19）</h4>
      <ul>
        <li>每位贈與人每年免稅額 244 萬元</li>
        <li>贈與淨額 ≤ 2,811 萬：10%</li>
        <li>2,811 萬 ~ 5,621 萬：15%（累進差額 140.55 萬）</li>
        <li>&gt; 5,621 萬：20%（累進差額 421.6 萬）</li>
      </ul>
      <h4>不計入贈與總額（§20）</h4>
      <ul>
        <li>配偶相互贈與之財產（但贈與不動產仍須繳契稅）</li>
        <li>子女結婚登記前後 6 個月內，父母各得贈與 100 萬</li>
        <li>農地贈與民法第 1138 條法定繼承人，並維持農用 5 年</li>
        <li>捐贈政府、公營事業、財團法人（建議先取得不計入證明書）</li>
        <li>父母對未成年子女扶養費</li>
        <li>受扶養之父母、祖父母、兄弟姊妹、子女之扶養費</li>
      </ul>
      <h4>可扣除項目</h4>
      <ul>
        <li>贈與不動產附有貸款，可從贈與總額扣除貸款金額</li>
        <li>不動產贈與發生之契稅、土地增值稅</li>
        <li>但若由贈與人提供資金繳納上述稅費，須先併入贈與總額後再扣除</li>
      </ul>
      <h4>申報與重要提醒</h4>
      <ul>
        <li>申報期限：贈與行為發生日起 30 日內</li>
        <li>被繼承人死亡前 2 年內贈與配偶、直系卑親屬、兄弟姊妹、祖父母及其配偶之財產，視為遺產併入課徵</li>
        <li>逾期申報罰：稅額一倍；漏報短報：兩倍罰鍰</li>
      </ul>
      <p class="calc-note-src">資料來源：遺產及贈與稅法 §19、§20、§22；財政部 114 年度公告</p>
    </details>`;
}

function renderCalcEstate() {
  return `
    <div class="calc-form">
      <h3>遺產稅試算</h3>
      <div class="calc-row"><label>遺產總額</label><input type="number" id="ce-total" placeholder="例：50000000"></div>
      <div class="calc-row"><label>配偶扣除額（有配偶填 5,530,000）</label><input type="number" id="ce-spouse" value="0"></div>
      <div class="calc-row"><label>直系血親卑親屬人數（每人扣 56 萬）</label><input type="number" id="ce-children" value="0"></div>
      <div class="calc-row"><label>父母人數（每人扣 138 萬）</label><input type="number" id="ce-parents" value="0"></div>
      <div class="calc-row"><label>喪葬費扣除（固定 1,380,000）</label><input type="number" id="ce-funeral" value="1380000"></div>
      <div class="calc-row"><label>其他扣除額</label><input type="number" id="ce-other" value="0"></div>
      <p style="font-size:13px; color:var(--text-mute)">114 年度免稅額 1,333 萬／級距 10% (≤5,621 萬) → 15% → 20% (>1.1242 億)</p>
      <button class="calc-btn" onclick="doCalcEstate()">試算</button>
      <div class="calc-result" id="ce-result"></div>
    </div>
    <details class="calc-notes">
      <summary>相關規定說明（114 年度）</summary>
      <h4>免稅額與稅率（§18、§19）</h4>
      <ul>
        <li>免稅額：1,333 萬元（經常居住境內國民）</li>
        <li>遺產淨額 ≤ 5,621 萬：10%</li>
        <li>5,621 萬 ~ 1.1242 億：15%（累進差額 281.05 萬）</li>
        <li>&gt; 1.1242 億：20%（累進差額 843.15 萬）</li>
      </ul>
      <h4>扣除額（§17，114 年度）</h4>
      <ul>
        <li>配偶扣除額：553 萬</li>
        <li>直系血親卑親屬：每人 56 萬（未成年者每年加扣 56 萬至屆滿成年）</li>
        <li>父母：每人 138 萬</li>
        <li>重度以上身心障礙：693 萬</li>
        <li>受被繼承人扶養之兄弟姊妹、祖父母：每人 56 萬</li>
        <li>喪葬費：138 萬</li>
        <li>被繼承人債務、應納未納稅捐、罰鍰</li>
      </ul>
      <h4>不計入遺產總額（§16）</h4>
      <ul>
        <li>指定受益人之人壽、軍公教、勞工、農民保險金及互助金</li>
        <li>被繼承人日常生活必需器具及用具：100 萬</li>
        <li>被繼承人職業上之工具：56 萬</li>
        <li>捐贈各級政府、公立教育、文化、公益、慈善機關之財產</li>
        <li>文物、著作、發明、藝術品等</li>
      </ul>
      <h4>節稅與重要規範</h4>
      <ul>
        <li>5 年內已納遺產稅之繼承財產不計入遺產總額</li>
        <li>6-9 年遞減扣除：6 年前 80%、7 年前 60%、8 年前 40%、9 年前 20%</li>
        <li>生存配偶剩餘財產差額分配請求權（須於取得完稅證明 1 年內給付）</li>
        <li>死亡前 2 年內贈與特定親屬之財產，視為遺產併入課徵</li>
      </ul>
      <h4>申報與繳納</h4>
      <ul>
        <li>申報期限：被繼承人死亡之日起 6 個月內（得申請延長 3 個月）</li>
        <li>應納稅額 ≥ 30 萬，現金繳納困難可申請分 18 期（每期 2 個月，加郵儲一年期定存利息）</li>
        <li>實物抵繳：境內遺產或納稅人易變價資產優先，須繼承人過半同意或應繼分 ≥ 2/3 同意</li>
      </ul>
      <p class="calc-note-src">資料來源：遺產及贈與稅法 §16、§17、§18、§19；財政部 114 年度公告</p>
    </details>`;
}

function renderCalcHouse() {
  return `
    <div class="calc-form">
      <h3>房地合一稅試算（2.0）</h3>
      <div class="calc-row"><label>交易所得（賣價 − 成本 − 必要費用）</label><input type="number" id="ch-gain" placeholder="例：3000000"></div>
      <div class="calc-row"><label>持有年數</label><input type="number" id="ch-years" value="3"></div>
      <div class="calc-row"><label>是否符合自住房地（6 年條件）</label>
        <select id="ch-selfuse"><option value="0">否</option><option value="1">是</option></select>
      </div>
      <p style="font-size:13px; color:var(--text-mute)">≤2 年 45%／2–5 年 35%／5–10 年 20%／&gt;10 年 15%；自住 10% + 400 萬免稅額</p>
      <button class="calc-btn" onclick="doCalcHouse()">試算</button>
      <div class="calc-result" id="ch-result"></div>
    </div>
    <details class="calc-notes">
      <summary>相關規定說明（成本及必要費用計算）</summary>
      <h4>成本（取得 + 改良）</h4>
      <ul>
        <li>取得成本：購入價金、契稅、印花稅、登記規費、買進時仲介費、代書費</li>
        <li>使房地價值提高所支付之費用：增建、擴建、改良成本</li>
        <li>取得房屋後達一定期間 (使用年限) 之耐久性設備支出</li>
        <li>繼承或受贈取得：以繼承或受贈時公告土地現值與房屋評定標準價格為準</li>
      </ul>
      <h4>必要費用（出售移轉）</h4>
      <ul>
        <li>出售時仲介費、廣告費、清潔費、搬運費、移轉登記規費、代書費、地政士費</li>
        <li>無法提供憑證者：按交易價格 5% 推計，上限 NT$30 萬</li>
      </ul>
      <h4>不可列為費用</h4>
      <ul>
        <li>使用期間之維修費</li>
        <li>貸款利息</li>
        <li>地價稅、房屋稅</li>
        <li>管理費、瓦斯水電費</li>
      </ul>
      <h4>持有期間與稅率</h4>
      <ul>
        <li>≤ 2 年：45%</li>
        <li>2 ~ 5 年：35%</li>
        <li>5 ~ 10 年：20%</li>
        <li>&gt; 10 年：15%</li>
        <li>繼承取得：持有期間含被繼承人持有期間</li>
      </ul>
      <h4>自住房地優惠（10% + 400 萬免稅額，§14-4 III）</h4>
      <ul>
        <li>個人、配偶及未成年子女於該房地辦竣戶籍登記</li>
        <li>持有並居住於該房屋連續滿 6 年</li>
        <li>交易前 6 年內未供出租、營業或執行業務使用</li>
        <li>個人與其配偶及未成年子女於交易前 6 年內未曾適用本條項規定</li>
        <li>免稅額為 NT$400 萬（超過部分按 10% 課徵）</li>
      </ul>
      <h4>申報與繳納</h4>
      <ul>
        <li>申報期限：完成所有權移轉登記之次日起 30 日內</li>
        <li>逾期或漏報：加徵 1.5 倍滯納金；漏報所得：補徵稅額並加 2 倍以下罰鍰</li>
      </ul>
      <p class="calc-note-src">資料來源：所得稅法 §14-4、§14-5、§14-6、§14-7、§14-8；房地合一所得稅法 2.0（110.7.1 施行）</p>
    </details>`;
}

function renderCalcLand() {
  return `
    <div class="calc-form">
      <h3>土地增值稅試算（簡化）</h3>
      <div class="calc-row"><label>現值移轉價</label><input type="number" id="cl-current" placeholder="例：20000000"></div>
      <div class="calc-row"><label>原規定地價（含物價調整後）</label><input type="number" id="cl-origin" placeholder="例：8000000"></div>
      <div class="calc-row"><label>是否為自用住宅</label>
        <select id="cl-selfuse"><option value="0">否</option><option value="1">是</option></select>
      </div>
      <div class="calc-row"><label>持有年數（一般稅率才減徵）</label><input type="number" id="cl-years" value="10"></div>
      <p style="font-size:13px; color:var(--text-mute)">漲價 1 倍 20%／2 倍 30%／&gt;2 倍 40%；長期持有 20/30/40 年減 20/30/40%；自用 10%</p>
      <button class="calc-btn" onclick="doCalcLand()">試算</button>
      <div class="calc-result" id="cl-result"></div>
    </div>
    <details class="calc-notes">
      <summary>相關規定說明（現值移轉價與原規定地價計算）</summary>
      <h4>現值移轉價格（申報移轉現值）</h4>
      <ul>
        <li>原則以政府每年 1/1 公告之「公告土地現值」為準</li>
        <li>公告現值每年由各縣市政府於 1/1 公告調整</li>
        <li>實際成交價低於公告現值者，按公告現值申報</li>
        <li>實際成交價高於公告現值者，得選擇按實際成交價申報（一旦選定，後續移轉皆以該成交價為前次移轉現值）</li>
      </ul>
      <h4>原規定地價 / 前次移轉現值</h4>
      <ul>
        <li>原規定地價：土地首次規定地價時之公告土地現值（民國 53 年起陸續規定）</li>
        <li>前次移轉現值：取得該土地時之申報移轉現值（不論該次移轉是否需課稅）</li>
        <li>繼承取得：以繼承開始時之公告土地現值為前次移轉現值（繼承時免徵土增稅）</li>
        <li>配偶相互贈與：以配偶間第一次贈與前之原規定地價為基準（不重複物價調整）</li>
        <li>須以消費者物價指數（CPI）調整：原地價 × 當期 CPI ÷ 取得時 CPI</li>
      </ul>
      <h4>漲價總數額計算</h4>
      <ul>
        <li>漲價總數額 = 申報移轉現值 × 物價指數 − 原規定地價 / 前次移轉現值 − 土地改良費用 − 工程受益費 − 土地重劃費用 − 因土地使用變更而無償捐贈之公共設施用地價值</li>
      </ul>
      <h4>稅率（§33）</h4>
      <ul>
        <li>漲價總數額未超過原地價 1 倍：20%</li>
        <li>1 倍 ~ 2 倍：30%（累進差額：原地價 × 10%）</li>
        <li>超過 2 倍：40%（累進差額：原地價 × 30%）</li>
      </ul>
      <h4>長期持有減徵（一般稅率才適用）</h4>
      <ul>
        <li>持有 20 年以上：減徵 20%</li>
        <li>持有 30 年以上：減徵 30%</li>
        <li>持有 40 年以上：減徵 40%</li>
      </ul>
      <h4>自用住宅優惠 10%（§34）</h4>
      <ul>
        <li>本人、配偶、直系親屬於該地辦竣戶籍登記</li>
        <li>地上建物完工後 1 年以上</li>
        <li>出售前 1 年內未供出租或營業使用</li>
        <li>面積：都市土地 3 公畝（90.75 坪）以下、非都市土地 7 公畝（211.75 坪）以下</li>
        <li>一生一次：每人一生限申請一次（§34）</li>
        <li>一生一屋：用完一生一次後，再次出售自用住宅亦可，但持有 ≥ 6 年、本人/配偶/未成年子女僅持有 1 戶（§34-1）</li>
      </ul>
      <h4>免徵與不課徵</h4>
      <ul>
        <li>繼承免徵（§39）</li>
        <li>配偶相互贈與不課徵（§39-1）</li>
        <li>共有物分割不課徵（§39-2，按原持分比例）</li>
        <li>公設保留地、農業用地（合於要件）免徵</li>
      </ul>
      <p class="calc-note-src">資料來源：土地稅法 §28、§31、§33、§34、§34-1、§39、§39-1、§39-2；平均地權條例</p>
    </details>`;
}

function wireCalcTabs() {
  const buttons = document.querySelectorAll(".tab[data-ctab]");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.ctab;
      buttons.forEach(b => b.classList.toggle("active", b.dataset.ctab === key));
      document.querySelectorAll(".t-pane[id^='c-pane-']").forEach(p => {
        p.classList.toggle("active", p.id === `c-pane-${key}`);
      });
    });
  });
}

function doCalcIncome() {
  const income = +$("ci-income").value || 0;
  const exempt = +$("ci-exempt").value || 0;
  const deduct = +$("ci-deduct").value || 0;
  const salary = +$("ci-salary").value || 0;
  const other = +$("ci-other").value || 0;
  const taxable = Math.max(0, income - exempt - deduct - salary - other);
  const tax = calcIncomeTax(taxable);
  $("ci-result").innerHTML = `
    <div class="kv"><span>所得淨額</span><b>${fmtMoney(taxable)}</b></div>
    <div class="kv"><span>應納稅額</span><b style="color:var(--up)">${fmtMoney(tax)}</b></div>
    <div class="kv"><span>實質稅率</span><b>${income > 0 ? (tax / income * 100).toFixed(1) : 0}%</b></div>`;
}

function doCalcAmt() {
  const comp = +$("ca-comp").value || 0;
  const ov = +$("ca-overseas").value || 0;
  const ins = +$("ca-ins").value || 0;
  const other = +$("ca-other").value || 0;
  const reg = +$("ca-regular").value || 0;
  const r = calcAmtTax(comp, ov, ins, other, reg);
  $("ca-result").innerHTML = `
    <div class="kv"><span>基本所得額</span><b>${fmtMoney(r.amtBase)}</b></div>
    <div class="kv"><span>最低稅負（基本稅額）</span><b>${fmtMoney(r.amt)}</b></div>
    <div class="kv"><span>原綜所稅</span><b>${fmtMoney(r.regular)}</b></div>
    <div class="kv"><span>取大者為應納</span><b style="color:var(--up)">${fmtMoney(r.final)}</b></div>
    <div class="kv"><span>需補繳（基本稅額 − 綜所稅）</span><b>${fmtMoney(Math.max(0, r.needPay))}</b></div>`;
}

function doCalcGift() {
  const amount = +$("cg-amount").value || 0;
  const r = calcGiftTax(amount);
  $("cg-result").innerHTML = `
    <div class="kv"><span>贈與淨額</span><b>${fmtMoney(r.net)}</b></div>
    <div class="kv"><span>適用稅率</span><b>${r.rate}</b></div>
    <div class="kv"><span>應納贈與稅</span><b style="color:var(--up)">${fmtMoney(r.tax)}</b></div>`;
}

function doCalcEstate() {
  const total = +$("ce-total").value || 0;
  const spouse = +$("ce-spouse").value || 0;
  const children = (+$("ce-children").value || 0) * 560000;
  const parents = (+$("ce-parents").value || 0) * 1380000;
  const funeral = +$("ce-funeral").value || 0;
  const other = +$("ce-other").value || 0;
  const deductions = spouse + children + parents + funeral + other;
  const r = calcEstateTax(total, deductions);
  $("ce-result").innerHTML = `
    <div class="kv"><span>遺產總額</span><b>${fmtMoney(total)}</b></div>
    <div class="kv"><span>免稅額</span><b>${fmtMoney(13330000)}</b></div>
    <div class="kv"><span>扣除額合計</span><b>${fmtMoney(deductions)}</b></div>
    <div class="kv"><span>遺產淨額</span><b>${fmtMoney(r.net)}</b></div>
    <div class="kv"><span>適用稅率</span><b>${r.rate}</b></div>
    <div class="kv"><span>應納遺產稅</span><b style="color:var(--up)">${fmtMoney(r.tax)}</b></div>`;
}

function doCalcHouse() {
  const gain = +$("ch-gain").value || 0;
  const years = +$("ch-years").value || 0;
  const self = +$("ch-selfuse").value === 1;
  const r = calcHouseLandTax(gain, years, self);
  $("ch-result").innerHTML = `
    <div class="kv"><span>課稅所得</span><b>${fmtMoney(r.taxable)}</b></div>
    <div class="kv"><span>適用稅率</span><b>${r.rate}</b></div>
    <div class="kv"><span>應納稅額</span><b style="color:var(--up)">${fmtMoney(r.tax)}</b></div>`;
}

function doCalcLand() {
  const cur = +$("cl-current").value || 0;
  const ori = +$("cl-origin").value || 0;
  const self = +$("cl-selfuse").value === 1;
  const years = +$("cl-years").value || 0;
  const inc = cur - ori;
  const r = calcLandValueTax(inc, ori, self, years);
  $("cl-result").innerHTML = `
    <div class="kv"><span>漲價總數</span><b>${fmtMoney(inc)}</b></div>
    <div class="kv"><span>適用稅率</span><b>${r.rate}</b></div>
    <div class="kv"><span>應納土地增值稅</span><b style="color:var(--up)">${fmtMoney(r.tax)}</b></div>`;
}

function wireWealthTabs() {
  const buttons = document.querySelectorAll(".tab[data-wtab]");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.wtab;
      buttons.forEach(b => b.classList.toggle("active", b.dataset.wtab === key));
      document.querySelectorAll(".t-pane[id^='w-pane-']").forEach(p => {
        p.classList.toggle("active", p.id === `w-pane-${key}`);
      });
    });
  });
}

function renderLumpFundCards() {
  const funds = (DATA.funds || {}).funds || [];
  if (!funds.length) {
    return "<p style='color:var(--text-mute); padding:20px 0'>尚未提供精選基金清單</p>";
  }
  const periods = [
    { label: "近1月", get: f => f.perf_single?.['1m'] },
    { label: "近3月", get: f => f.perf_single?.['3m'] },
    { label: "今年來", get: f => f.perf?.ytd },
    { label: "近1年", get: f => f.perf_single?.['1y'] },
    { label: "近3年", get: f => f.perf_single?.['3y'] },
    { label: "近5年", get: f => f.perf_single?.['5y'] }
  ];
  const fmtR = v => (v === null || v === undefined) ? "—" : `${Number(v).toFixed(1)}%`;
  const cellClass = v => (v === null || v === undefined) ? "" : (v > 0 ? "up" : (v < 0 ? "down" : ""));
  const tdBase = "padding:6px 8px;border-bottom:1px solid var(--border)";
  const thBase = "padding:6px 8px;border-bottom:1px solid var(--border);background:#fff";

  const headerCells = periods.map(p =>
    `<th style="${thBase};text-align:right">${p.label}</th>`
  ).join("");

  // 商品屬性中文標籤：以基金 id 對照（精準），未知者退回 category 代碼對照
  const LUMP_CAT = {
    franklin_em_income: "新興市場債",
    franklin_corporate_bond: "公司債",
    franklin_sinoam_multi_asset: "多重資產",
    amundi_em_bond: "新興市場債",
    amundi_global_strategic: "全球股債",
    schroder_global_income: "全球股債",
    pinebridge_japan_multi_asset: "日本多重資產",
    first_global_utilities: "基建／公用",
    allianz_tw_tech: "台股科技",
    ab_intl_tech: "科技"
  };
  const LUMP_CAT_CODE = { tech: "科技", income: "月收益", balanced: "多重資產", bond: "債券" };

  const rows = funds.map(f => {
    const nameHtml = f.source_url
      ? `<a href="${f.source_url}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">${escapeHtml(f.name_zh)}</a>`
      : escapeHtml(f.name_zh);
    const chip = f.currency ? `<span style="margin-left:6px">${currencyChip(f.currency)}</span>` : "";
    const catLabel = LUMP_CAT[f.id] || LUMP_CAT_CODE[f.category] || "";
    const catChip = catLabel
      ? `<span class="chip chip-default" style="background:#E5F2F5;color:var(--brand-deep);margin-left:6px;font-size:11px">${escapeHtml(catLabel)}</span>`
      : "";
    const cells = periods.map(p => {
      const v = p.get(f);
      return `<td style="${tdBase};text-align:right" class="${cellClass(v)}">${perfLink(fmtR(v), f.perf_url || f.source_url)}</td>`;
    }).join("");
    return `<tr><td style="${tdBase};white-space:nowrap">${nameHtml}${chip}${catChip}</td>${cells}</tr>`;
  }).join("");

  return `
    <div style="overflow-x:auto;background:#fff;border-radius:8px">
      <table class="freeze-col1" style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr>
            <th style="${thBase};text-align:left">名稱</th>
            ${headerCells}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderDcaFundCards() {
  const list = ((DATA.dca || {}).funds) || [];
  if (!list.length) {
    return "<p style='color:var(--text-mute); padding:20px 0'>尚未提供定期定額清單</p>";
  }
  const periods = [
    { key: "1m", label: "近1月" },
    { key: "3m", label: "近3月" },
    { key: "6m", label: "近6月" },
    { key: "1y", label: "近1年" },
    { key: "3y", label: "近3年" },
    { key: "5y", label: "近5年" }
  ];
  const fmtR = v => (v === null || v === undefined) ? "—" : `${Number(v).toFixed(1)}%`;
  const cellClass = v => (v === null || v === undefined) ? "" : (v > 0 ? "up" : (v < 0 ? "down" : ""));
  const tdBase = "padding:6px 8px;border-bottom:1px solid var(--border)";
  const thBase = "padding:6px 8px;border-bottom:1px solid var(--border);background:#fff";

  const headerCells = periods.map(p =>
    `<th style="${thBase};text-align:right">${p.label}</th>`
  ).join("");

  const rows = list.map(f => {
    const nameHtml = f.source_url
      ? `<a href="${f.source_url}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">${escapeHtml(f.name_zh)}</a>`
      : escapeHtml(f.name_zh);
    const curChip = f.currency ? `<span style="margin-left:6px">${currencyChip(f.currency)}</span>` : "";
    const catChip = f.category
      ? `<span class="chip chip-default" style="background:#E5F2F5;color:var(--brand-deep);margin-left:6px;font-size:11px">${escapeHtml(f.category)}</span>`
      : "";
    const cells = periods.map(p => {
      const v = f.perf_dca?.[p.key];
      return `<td style="${tdBase};text-align:right" class="${cellClass(v)}">${perfLink(fmtR(v), f.perf_url || f.source_url)}</td>`;
    }).join("");
    return `<tr><td style="${tdBase};white-space:nowrap">${nameHtml}${curChip}${catChip}</td>${cells}</tr>`;
  }).join("");

  return `
    <div style="overflow-x:auto;background:#fff;border-radius:8px">
      <table class="freeze-col1" style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr>
            <th style="${thBase};text-align:left">名稱</th>
            ${headerCells}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function renderBeatEtfCards() {
  const data = DATA.beatetf || {};
  const fundItems = ((data.funds && data.funds.items) || []).filter(f => !f.unlisted);
  const etfItems  = (data.etfs  && data.etfs.items)  || [];
  if (!fundItems.length && !etfItems.length) {
    return "<p style='color:var(--text-mute); padding:20px 0'>尚未提供超越ETF清單</p>";
  }
  const periods = [
    { key: "1m", label: "近1月" },
    { key: "3m", label: "近3月" },
    { key: "6m", label: "近6月" },
    { key: "1y", label: "近1年" },
    { key: "3y", label: "近3年" },
    { key: "5y", label: "近5年" }
  ];
  const fmtR = v => (v === null || v === undefined) ? "—" : `${Number(v).toFixed(1)}%`;
  const cellClass = v => (v === null || v === undefined) ? "" : (v > 0 ? "up" : (v < 0 ? "down" : ""));

  const tdBase = "padding:6px 8px;border-bottom:1px solid var(--border)";
  const thBase = "padding:6px 8px;border-bottom:1px solid var(--border);background:#fff";

  const headerCells = periods.map(p =>
    `<th style="${thBase};text-align:right">${p.label}</th>`
  ).join("");

  const groupHeader = (title, bg) => `<tr>
    <td colspan="${periods.length + 1}" style="padding:10px 8px;font-weight:600;color:var(--brand-deep);background:${bg};border-bottom:1px solid var(--border)">${escapeHtml(title)}</td>
  </tr>`;

  // 商品屬性中文標籤：以基金名稱（去空白）對照
  const BEAT_FUND_CAT = {
    "安聯台灣科技基金": "台股科技",
    "安聯台灣大壩基金": "台股",
    "野村中小基金": "台股中小",
    "野村高科技基金": "台股科技",
    "野村e科技基金": "台股科技",
    "元大新主流基金": "台股",
    "路博邁台灣5G股票基金": "台股科技",
    "摩根新興科技基金": "科技",
    "統一奔騰基金": "台股",
    "元大卓越基金": "台股",
    "國泰小龍基金": "台股中小",
    "統一全天候基金": "台股"
  };
  const beatCatChip = name => {
    const lab = BEAT_FUND_CAT[(name || "").replace(/\s/g, "")];
    return lab
      ? `<span class="chip chip-default" style="background:#E5F2F5;color:var(--brand-deep);margin-left:6px;font-size:11px">${escapeHtml(lab)}</span>`
      : "";
  };

  const fundRows = fundItems.map(f => {
    if (f.unlisted) {
      return `<tr>
        <td style="${tdBase};white-space:nowrap;color:var(--text-mute)">${escapeHtml(f.name_zh)}</td>
        <td colspan="${periods.length}" style="${tdBase};color:var(--text-mute);font-size:12px">${escapeHtml(f.note || "未上架")}</td>
      </tr>`;
    }
    const nameHtml = f.source_url
      ? `<a href="${f.source_url}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">${escapeHtml(f.name_zh)}</a>`
      : escapeHtml(f.name_zh);
    const cells = periods.map(p => {
      const v = f.perf?.[p.key];
      return `<td style="${tdBase};text-align:right" class="${cellClass(v)}">${perfLink(fmtR(v), f.source_url)}</td>`;
    }).join("");
    return `<tr><td style="${tdBase};white-space:nowrap">${nameHtml}${beatCatChip(f.name_zh)}</td>${cells}</tr>`;
  }).join("");

  const etfRows = etfItems.map(e => {
    const catChip = e.category
      ? `<span class="chip chip-default" style="background:#E5F2F5;color:var(--brand-deep);margin-left:6px;font-size:11px">${escapeHtml(e.category)}</span>`
      : "";
    const cells = periods.map(p => {
      const v = e.perf?.[p.key];
      return `<td style="${tdBase};text-align:right" class="${cellClass(v)}">${fmtR(v)}</td>`;
    }).join("");
    return `<tr><td style="${tdBase};white-space:nowrap">${escapeHtml(e.name_zh)}${catChip}</td>${cells}</tr>`;
  }).join("");

  return `
    <div style="overflow-x:auto;background:#fff;border-radius:8px">
      <table class="freeze-col1" style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr>
            <th style="${thBase};text-align:left">名稱</th>
            ${headerCells}
          </tr>
        </thead>
        <tbody>
          ${fundItems.length ? groupHeader("老牌主動式台股基金", "#CCE8ED") : ""}
          ${fundRows}
          ${etfItems.length ? groupHeader("代表性台股 ETF（對照）", "#E5F2F5") : ""}
          ${etfRows}
        </tbody>
      </table>
    </div>
  `;
}

// ===== 基金績效比較次分頁 =====
function renderFundCompare() {
  const data = DATA.fund_compare || {};
  const cats = data.categories || [];
  const funds = data.funds || [];
  if (!funds.length) {
    return "<p style='color:var(--text-mute); padding:20px 0'>尚未提供基金績效比較資料</p>";
  }
  const asOf = data.static_as_of || "";
  const asOfNote = data.as_of_note || "";
  const chips = cats.map((c, i) =>
    `<button class="cmp-cat${i === 0 ? " active" : ""}" data-cmpcat="${escapeHtml(c.key)}">${escapeHtml(c.label)}</button>`
  ).join("");
  const panes = cats.map((c, i) => {
    const inCat = funds.filter(f => f.category === c.key);
    const cards = inCat.length
      ? inCat.map(f => renderCompareCard(f, asOf)).join("")
      : "<p style='color:var(--text-mute); padding:16px 0'>本類別暫無基金</p>";
    return `<div class="cmp-pane" id="cmp-pane-${escapeHtml(c.key)}"${i === 0 ? "" : " hidden"}>${cards}</div>`;
  }).join("");

  return `
    <div class="cmp-intro">
      本分頁為教育示範用途,將精選基金與同類平均、同類競品並列比較,僅呈現公開數據,不構成投資建議。比較表報酬率來自 MoneyDJ 每日更新(可點數字查證),波動度與 Sharpe 為 SITCA 截至 2026-03-31;同類平均截至 2026-04-30。近1/3/5年報酬為滾動累積報酬率(含息),非曆年、非年化。
    </div>
    <div class="cmp-cats">${chips}</div>
    ${panes}
    ${renderCompareMethodology(asOf)}
  `;
}

function wireFundCompare() {
  const btns = document.querySelectorAll(".cmp-cat[data-cmpcat]");
  btns.forEach(b => {
    b.addEventListener("click", () => {
      btns.forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      const key = b.dataset.cmpcat;
      document.querySelectorAll(".cmp-pane").forEach(p => {
        p.hidden = p.id !== `cmp-pane-${key}`;
      });
    });
  });
}

function renderBasicsBlock(f) {
  const s = f.self || {};
  const inc = s.inception_date || "—";
  const aum = (s.aum_twd_yi === null || s.aum_twd_yi === undefined)
    ? "—"
    : `${Number(s.aum_twd_yi).toLocaleString("zh-TW", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} 億元`;
  const foreignNote = (s.aum_twd_yi != null && s.aum_ccy && s.aum_ccy !== "台幣" && s.aum_ccy !== "新台幣")
    ? `<span class="cmp-basics-note">（${escapeHtml(s.aum_ccy)}規模匯率換算）</span>` : "";
  const aumDate = s.aum_date ? `<span class="cmp-basics-note">${escapeHtml(s.aum_date)}</span>` : "";
  const exp = (s.expense_ratio === null || s.expense_ratio === undefined)
    ? "—" : `${Number(s.expense_ratio).toFixed(1)}%`;
  const dy = (s.distribution_yield === null || s.distribution_yield === undefined)
    ? "—" : `${Number(s.distribution_yield).toFixed(1)}%`;
  return `<div class="cmp-basics">
    <span><b>成立日期</b> ${escapeHtml(inc)}</span>
    <span><b>基金總規模</b> ${aum}${foreignNote} ${aumDate}</span>
    <span><b>總費用率</b> ${exp}</span>
    <span><b>年化配息率</b> ${dy}</span>
  </div>`;
}

function renderCompareCard(f, asOf) {
  const s = f.self || {};
  const stars = f.morningstar_rating
    ? "★".repeat(f.morningstar_rating) + "☆".repeat(5 - f.morningstar_rating)
    : "";
  const msCat = f.morningstar_category
    ? `<span class="cmp-chip">${escapeHtml(f.morningstar_category)}</span>` : "";
  const rrChip = f.rr
    ? `<span class="cmp-chip cmp-chip-rr">${escapeHtml(f.rr)}</span>` : "";
  const starHtml = stars
    ? `<span class="cmp-stars" title="晨星評等">${stars}</span>` : "";
  const nameHtml = f.source_url
    ? `<a href="${f.source_url}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">${escapeHtml(f.name_zh)}</a>`
    : escapeHtml(f.name_zh);
  return `
    <div class="cmp-card">
      <div class="cmp-card-head">
        <h3>${nameHtml}</h3>
        <div class="cmp-card-chips">${msCat}${rrChip}${starHtml}</div>
      </div>
      ${renderBasicsBlock(f)}
      ${renderCompareTable(f, asOf)}
      ${renderCompareRank(f)}
      ${renderRiskReturnScatter(f)}
      ${renderHoldingsBlock(s)}
    </div>`;
}

function renderCompareTable(f, asOf) {
  const fmtR = v => (v === null || v === undefined) ? "—" : `${Number(v).toFixed(1)}%`;
  const cls = v => (v === null || v === undefined) ? "" : (v > 0 ? "up" : (v < 0 ? "down" : ""));
  const fmtV = (v, suffix) => (v === null || v === undefined) ? "—" : `${Number(v).toFixed(1)}${suffix || ""}`;

  const rows = [];
  const s = f.self || {};
  rows.push({ label: f.name_zh, url: f.source_url, hi: true, ret: s.return || {}, std: s.std_3y, sharpe: s.sharpe_3y });
  const ca = f.category_avg || {};
  rows.push({ label: "同類平均", url: null, catUrl: f.category_url, ret: ca.return || {}, std: ca.std_3y, sharpe: ca.sharpe_3y, always: true });
  if (f.benchmark) {
    rows.push({ label: f.benchmark.name, url: f.benchmark.url || null, ret: f.benchmark.return || {}, std: f.benchmark.std_3y, sharpe: f.benchmark.sharpe_3y });
  }
  for (const p of (f.peers || [])) {
    rows.push({ label: p.name, url: p.url || null, ret: p.return || {}, std: p.std_3y, sharpe: p.sharpe_3y });
  }

  const rowHasData = r => r.hi || r.always ||
    [r.ret["1y"], r.ret["3y"], r.ret["5y"], r.std, r.sharpe].some(v => v !== null && v !== undefined);
  const shownRows = rows.filter(rowHasData);

  const periods = [["1y", "近1年"], ["3y", "近3年"], ["5y", "近5年"]];
  const head = `<tr>
    <th class="cmp-th-l">比較對象</th>
    ${periods.map(p => `<th>${p[1]}報酬</th>`).join("")}
    <th>年化波動度</th><th>Sharpe</th>
  </tr>`;
  const body = shownRows.map(r => `
    <tr class="${r.hi ? "cmp-row-self" : ""}">
      <td class="cmp-td-l">${(r.url || r.catUrl) ? `<a href="${r.url || r.catUrl}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">${escapeHtml(r.label || "—")}</a>` : escapeHtml(r.label || "—")}</td>
      ${periods.map(p => `<td class="${cls(r.ret[p[0]])}">${perfLink(fmtR(r.ret[p[0]]), r.url)}</td>`).join("")}
      <td>${fmtV(r.std, "%")}</td>
      <td>${fmtV(r.sharpe)}</td>
    </tr>`).join("");

  return `<div class="cmp-table-wrap"><table class="cmp-table">
    <thead>${head}</thead><tbody>${body}</tbody></table></div>
    <div class="cmp-asof">報酬率為各基金 MoneyDJ 最新淨值日數字(每日更新、可點數字查證);年化波動度、Sharpe 為 SITCA 截至 2026-03-31;同類平均截至 2026-04-30。</div>`;
}

function renderCompareRank(f) {
  const r = f.category_rank || {};
  const items = [
    ["近1年報酬", r.return_1y_pct],
    ["波動度", r.std_3y_pct],
    ["Sharpe", r.sharpe_3y_pct],
  ];
  if (items.every(it => it[1] === null || it[1] === undefined)) return "";
  const badges = items.map(it => {
    const v = it[1];
    const txt = (v === null || v === undefined) ? "—" : `同類前 ${v}%`;
    return `<span class="cmp-badge"><b>${escapeHtml(it[0])}</b> ${txt}</span>`;
  }).join("");
  return `<div class="cmp-rank">${badges}</div>`;
}

function renderRiskReturnScatter(f) {
  const pts = [];
  const s = f.self || {};
  pts.push({ x: s.std_3y, y: (s.return || {})["3y"], label: "本檔", cls: "self" });
  const ca = f.category_avg || {};
  pts.push({ x: ca.std_3y, y: (ca.return || {})["3y"], label: "同類平均", cls: "avg" });
  if (f.benchmark) pts.push({ x: f.benchmark.std_3y, y: (f.benchmark.return || {})["3y"], label: "指數", cls: "bench" });
  (f.peers || []).forEach((p, i) => pts.push({ x: p.std_3y, y: (p.return || {})["3y"], label: "競品" + (i + 1), cls: "peer" }));
  const valid = pts.filter(p => p.x !== null && p.x !== undefined && p.y !== null && p.y !== undefined);
  if (valid.length < 2) {
    return `<div class="cmp-scatter-empty">風險報酬定位圖:資料不足</div>`;
  }
  const W = 280, H = 160, PAD = 34;
  const xs = valid.map(p => p.x), ys = valid.map(p => p.y);
  const xMin = Math.min(...xs), xMax = Math.max(...xs);
  const yMin = Math.min(...ys), yMax = Math.max(...ys);
  const sx = v => PAD + (xMax === xMin ? 0.5 : (v - xMin) / (xMax - xMin)) * (W - PAD - 12);
  const sy = v => (H - PAD) - (yMax === yMin ? 0.5 : (v - yMin) / (yMax - yMin)) * (H - PAD - 12);
  const colors = { self: "#019AB3", avg: "#9aa5ad", bench: "#003D91", peer: "#17B5AD" };
  const dots = valid.map(p => `
    <circle cx="${sx(p.x).toFixed(1)}" cy="${sy(p.y).toFixed(1)}" r="${p.cls === "self" ? 6 : 4.5}"
      fill="${colors[p.cls]}" stroke="#fff" stroke-width="1.5"></circle>`).join("");
  const labels = valid.map(p => {
    const px = sx(p.x), py = sy(p.y);
    const rightSide = px > PAD + (W - PAD - 12) * 0.62;
    const tx = rightSide ? px - 8 : px + 8;
    const anchor = rightSide ? "end" : "start";
    return `<text x="${tx.toFixed(1)}" y="${(py + 3).toFixed(1)}" text-anchor="${anchor}" font-size="9" fill="#4b5563">${escapeHtml(p.label)}</text>`;
  }).join("");
  return `
    <div class="cmp-scatter">
      <div class="cmp-scatter-title">風險報酬定位(近3年)</div>
      <svg viewBox="0 0 ${W} ${H}" class="cmp-scatter-svg" role="img" aria-label="風險報酬散點圖">
        <line x1="${PAD}" y1="${H - PAD}" x2="${W - 6}" y2="${H - PAD}" stroke="#d8dee3"></line>
        <line x1="${PAD}" y1="6" x2="${PAD}" y2="${H - PAD}" stroke="#d8dee3"></line>
        <text x="${W - 6}" y="${H - PAD + 14}" font-size="9" fill="#9aa5ad" text-anchor="end">波動度 →</text>
        <text x="${PAD - 6}" y="12" font-size="9" fill="#9aa5ad">報酬 ↑</text>
        ${dots}${labels}
      </svg>
    </div>`;
}

function renderHoldingsBlock(s) {
  const conc = s.top10_concentration;
  const concTxt = (conc === null || conc === undefined) ? "—" : `${Number(conc).toFixed(1)}%`;
  const holds = (s.top_holdings || []).slice(0, 10);
  const holdTxt = holds.length
    ? holds.map(h => `${escapeHtml(h.name)} ${Number(h.pct).toFixed(1)}%`).join("、")
    : "—";
  const secs = (s.sector_top3 || []);
  const maxPct = secs.length ? Math.max(...secs.map(x => x.pct || 0)) : 1;
  const bars = secs.length
    ? secs.map(x => `
        <div class="cmp-bar-row">
          <span class="cmp-bar-label">${escapeHtml(x.name)}</span>
          <span class="cmp-bar-track"><span class="cmp-bar-fill" style="width:${Math.round((x.pct || 0) / maxPct * 100)}%"></span></span>
          <span class="cmp-bar-val">${Number(x.pct || 0).toFixed(1)}%</span>
        </div>`).join("")
    : "<div class='cmp-bar-row' style='color:var(--text-mute)'>產業分布:—</div>";
  return `
    <div class="cmp-holdings">
      <div class="cmp-holdings-line"><b>前十大持股集中度</b> ${concTxt}</div>
      <div class="cmp-holdings-line cmp-holdings-list"><b>前十大持股</b> ${holdTxt}</div>
      <div class="cmp-holdings-bars"><div class="cmp-holdings-line"><b>產業／類股分布</b></div>${bars}</div>
    </div>`;
}

function renderCompareMethodology(asOf) {
  return `
    <div class="cmp-method">
      <div class="cmp-method-title">方法與資料來源</div>
      <ul>
        <li>報酬率採 MoneyDJ 各基金績效頁之近1/3/5年累積報酬(含息),每日更新,點數字可開啟來源頁查證;同類平均與風險指標仍為 SITCA 月底數據,故報酬率與其餘欄位日期不同。</li>
        <li>年化波動度、Sharpe、Beta、晨星評等:採 SITCA／晨星公開公布值,非自行計算;資料截至 2026-03-31。</li>
        <li>基金總規模、總費用率(經理費+保管費)、前十大持股:來源板信基金平台。</li>
        <li>同類平均:採 SITCA 中華民國證券投資信託暨顧問商業同業公會(投信投顧公會)「境內基金績效評比」公布之同類別平均;基金分類採晨星(Morningstar)類別,資料截至 2026-04-30,點該列名稱可開啟 SITCA 來源頁。同類排名、產業分布若來源未公開則顯示「—」。</li>
        <li>基金規模採全級別合計之「基金總規模」,以新台幣億元表示(外幣計價基金以 USD/TWD 即期匯率換算);規模日期見各卡。來源板信基金平台。</li>
        <li>過去績效不代表未來表現;基金投資可能發生本金損失,請詳閱公開說明書與風險預告書。本分頁僅供參考,不構成投資建議。</li>
      </ul>
    </div>`;
}

// 已合併：精選基金主分頁，內含「單筆投資」、「定期定額」、「超越ETF」、「基金績效比較」四個次分頁
function renderFundsSheet() {
  return `
    <div class="tabs">
      <button class="tab active" data-ftab="lump">單筆投資</button>
      <button class="tab" data-ftab="dca">定期定額</button>
      <button class="tab" data-ftab="beatetf">超越ETF</button>
      <button class="tab" data-ftab="compare">績效比較</button>
      <button class="tab" data-ftab="popular">熱銷基金</button>
    </div>
    <div id="ftab-lump">${renderLumpFundCards()}</div>
    <div id="ftab-dca" hidden>${renderDcaFundCards()}</div>
    <div id="ftab-beatetf" hidden>${renderBeatEtfCards()}</div>
    <div id="ftab-compare" hidden>${renderFundCompare()}</div>
    <div id="ftab-popular" hidden>${renderPopularFundCards()}</div>
    <div class="fund-card" style="margin-top:18px;text-align:center">
      <h3 style="margin-bottom:6px">其他基金</h3>
      <p class="tagline" style="margin-bottom:12px">瀏覽完整基金總覽（境外／國內基金龍虎榜、市場龍虎榜、快速搜尋）</p>
      <a href="https://bopfund.moneydj.com/" target="_blank" rel="noopener"
         style="display:inline-block;padding:10px 22px;background:#019AB3;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
        前往基金總覽
      </a>
    </div>
  `;
}

function renderPopularFundCards() {
  const funds = (DATA.popular_funds || {}).funds || [];
  if (!funds.length) {
    return "<p style='color:var(--text-mute); padding:20px 0'>尚未提供熱銷基金清單</p>";
  }
  const periods = [
    { label: "近1月", key: "1m" },
    { label: "近3月", key: "3m" },
    { label: "近6月", key: "6m" },
    { label: "近1年", key: "1y" },
    { label: "近3年", key: "3y" },
    { label: "近5年", key: "5y" },
  ];
  const fmtR = v => (v === null || v === undefined) ? "—" : `${Number(v).toFixed(1)}%`;
  const cellClass = v => (v === null || v === undefined) ? "" : (v > 0 ? "up" : (v < 0 ? "down" : ""));
  const tdBase = "padding:6px 8px;border-bottom:1px solid var(--border)";
  const thBase = "padding:6px 8px;border-bottom:1px solid var(--border);background:#fff";

  const headerCells = periods.map(p =>
    `<th style="${thBase};text-align:right">${p.label}</th>`
  ).join("");

  const CAT_COLOR = {
    bond: "#E5F2F5", equity: "#EEF5E5", balanced: "#F5F0E5", income: "#F5E5EE",
  };

  const rows = funds.map(f => {
    const nameHtml = f.source_url
      ? `<a href="${f.source_url}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">${escapeHtml(f.name_zh)}</a>`
      : escapeHtml(f.name_zh);
    const chip = f.currency ? `<span style="margin-left:6px">${currencyChip(f.currency)}</span>` : "";
    const catLabel = f.cat_label || "";
    const catBg = CAT_COLOR[f.category] || "#E5F2F5";
    const catChip = catLabel
      ? `<span class="chip chip-default" style="background:${catBg};color:var(--brand-deep);margin-left:6px;font-size:11px">${escapeHtml(catLabel)}</span>`
      : "";
    const listedChip = f.panhsin_listed === true
      ? `<span class="chip chip-default" style="background:#E5F5EC;color:#1a7a42;margin-left:6px;font-size:11px">板信上架</span>`
      : `<span class="chip chip-default" style="background:#F5F0E5;color:#7a5a1a;margin-left:6px;font-size:11px">板信未上架</span>`;
    const cells = periods.map(p => {
      const v = f.perf_single?.[p.key];
      return `<td style="${tdBase};text-align:right" class="${cellClass(v)}">${perfLink(fmtR(v), f.perf_url || f.source_url)}</td>`;
    }).join("");
    return `<tr><td style="${tdBase};white-space:nowrap">${nameHtml}${chip}${catChip}${listedChip}</td>${cells}</tr>`;
  }).join("");

  const asOf = funds.find(f => f.perf_date)?.perf_date || "";
  const note = asOf ? `<p style="font-size:11px;color:var(--text-mute);margin:8px 0 0">績效截至 ${asOf}，資料來源：板信基金平台（MoneyDJ），不構成投資建議。</p>` : "";

  return `
    <div style="overflow-x:auto;background:#fff;border-radius:8px">
      <table class="freeze-col1" style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr>
            <th style="${thBase};text-align:left">名稱</th>
            ${headerCells}
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    ${note}
  `;
}

function renderDcaSheet() {
  // 保留以維持向後相容；實際內容在 renderFundsSheet 的 dca 次分頁
  return renderFundsSheet();
}

function wireFundsTabs() {
  const buttons = document.querySelectorAll(".tab[data-ftab]");
  const ids = Array.from(buttons).map(b => "ftab-" + b.dataset.ftab);
  buttons.forEach(t => {
    t.addEventListener("click", () => {
      buttons.forEach(x => x.classList.remove("active"));
      t.classList.add("active");
      const which = "ftab-" + t.dataset.ftab;
      ids.forEach(id => {
        const el = $(id);
        if (el) el.hidden = id !== which;
      });
    });
  });
}

function wireNewsTabs() {
  const tabIds = ["tab-market", "tab-wm", "tab-tax", "tab-intl"];
  const buttons = document.querySelectorAll(".tab[data-tab]");
  buttons.forEach(t => {
    t.addEventListener("click", () => {
      buttons.forEach(x => x.classList.remove("active"));
      t.classList.add("active");
      const which = "tab-" + t.dataset.tab;
      tabIds.forEach(id => {
        const el = $(id);
        if (el) el.hidden = id !== which;
      });
    });
  });
}

function escapeHtml(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// 法條代碼 → 全國法規資料庫 pcode（法規 ID）
const LAW_PCODE_MAP = {
  "遺贈稅法": "G0340072",
  "遺產及贈與稅法": "G0340072",
  "遺產及贈與稅法施行細則": "G0340073",
  "所得稅法": "G0340003",
  "所得稅法施行細則": "G0340004",
  "所得基本稅額條例": "G0340097",
  "所得基本稅額條例施行細則": "G0340098",
  "土地稅法": "G0340048",
  "土地稅法施行細則": "G0340049",
  "民法": "B0000001",
  "信託法": "I0020023",
  "信託業法": "G0380025",
  "保險法": "G0390002",
  "全民健康保險法": "L0060001",
  "個人計算辦法": "G0340146",
  "個人計算受控外國企業所得適用辦法": "G0340146",
  "營利事業計算辦法": "G0340145",
  "營所事業計算辦法": "G0340145",
  "營利事業認列受控外國企業所得適用辦法": "G0340145",
};

// 將「法名 §條號」字串轉成可點擊連結；支援多筆引用、條號帶 -N、「、§N」延伸同母法
function renderLawCode(codeStr) {
  if (!codeStr) return "";
  const re = /([一-龥]+(?:法|條例|細則|辦法))\s*§\s*(\d+(?:-\d+)?)/g;
  const tailRe = /[、,]\s*§\s*(\d+(?:-\d+)?)/y;
  const wrap = (pcode, art, label) => pcode
    ? `<a href="https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode=${pcode}&flno=${encodeURIComponent(art)}" target="_blank" rel="noopener" title="全國法規資料庫">${escapeHtml(label)}</a>`
    : escapeHtml(label);
  let out = "";
  let last = 0;
  let m;
  while ((m = re.exec(codeStr)) !== null) {
    out += escapeHtml(codeStr.slice(last, m.index));
    const pcode = LAW_PCODE_MAP[m[1]];
    out += wrap(pcode, m[2], m[0]);
    let cursor = m.index + m[0].length;
    tailRe.lastIndex = cursor;
    let t;
    while ((t = tailRe.exec(codeStr)) !== null) {
      out += escapeHtml(codeStr.slice(cursor, t.index));
      out += wrap(pcode, t[1], t[0]);
      cursor = t.index + t[0].length;
      tailRe.lastIndex = cursor;
    }
    last = cursor;
    re.lastIndex = cursor;
  }
  out += escapeHtml(codeStr.slice(last));
  return out;
}

// ============ 專屬規劃 (Asset Planning) ============
// 公開部署模式：Prompt Builder — 零後端，組好 prompt 給同事貼到自己的 claude.ai 用
// 開發模式：localStorage.assist_dev_mode === '1' → 直接打 localhost:8766（Iris 本機用）
const ASSIST_API = "http://localhost:8766";
const ASSIST_DEV_MODE = (typeof localStorage !== "undefined" && localStorage.getItem("assist_dev_mode") === "1");
let ASSIST_SYSTEM_PROMPT = null;  // 公開精簡版，lazy load on first use

async function loadAssistSystemPrompt() {
  if (ASSIST_SYSTEM_PROMPT !== null) return ASSIST_SYSTEM_PROMPT;
  try {
    const r = await fetch(`data/system_prompt.json?t=${Date.now()}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json();
    ASSIST_SYSTEM_PROMPT = d.prompt;
    return ASSIST_SYSTEM_PROMPT;
  } catch (e) {
    throw new Error(`無法載入 system prompt：${e.message}`);
  }
}

function renderAssistSheet() {
  const opt = (vals) => vals.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join("");
  return `
<style>
.ast-field { margin-bottom: 10px; }
.ast-field label { display: block; font-size: 12px; color: var(--text-mute); margin-bottom: 4px; font-weight: 500; }
.ast-field select, .ast-field input[type=text], .ast-field textarea {
  width: 100%; padding: 7px 10px; border: 1px solid var(--border); border-radius: 4px;
  font-size: 13px; font-family: inherit; box-sizing: border-box;
  background: var(--bg); color: var(--text);
}
.ast-field textarea { resize: vertical; min-height: 60px; }
.ast-existing { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
.ast-existing label { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 400; cursor: pointer; color: var(--text); }
.ast-submit { background: var(--brand-primary); color: white; border: 0; padding: 9px 16px; border-radius: 6px;
  font-size: 13px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 10px; }
.ast-submit:hover { opacity: .88; }
.ast-submit:disabled { opacity: .5; cursor: wait; }
.ast-sec { font-size: 10px; font-weight: 700; color: var(--text-mute); text-transform: uppercase;
  letter-spacing: .06em; margin: 14px 0 8px; padding-bottom: 3px; border-bottom: 1px solid var(--border); }
.ast-notice { background: var(--bg-alt); border-left: 3px solid #f97316;
  padding: 10px 14px; margin-bottom: 12px; border-radius: 0 6px 6px 0; font-size: 12px; color: var(--text-mute); }
.ast-notice strong { display: block; margin-bottom: 4px; color: var(--text); font-size: 12px; }
.ast-notice ul { margin: 0; padding-left: 16px; line-height: 1.7; }
.ast-prompt-out { background: var(--bg-alt); border: 1px solid var(--border); border-radius: 6px;
  padding: 12px; font-family: ui-monospace, "SF Mono", Consolas, monospace;
  font-size: 11px; line-height: 1.5; white-space: pre-wrap; word-break: break-word;
  max-height: 220px; overflow-y: auto; margin: 8px 0; color: var(--text); }
.ast-btn-row { display: flex; gap: 8px; flex-wrap: wrap; margin: 8px 0; }
.ast-btn-row button, .ast-btn-row a {
  padding: 9px 14px; border-radius: 4px; font-size: 13px; font-weight: 600;
  cursor: pointer; text-decoration: none; text-align: center; display: inline-block; flex: 1; }
.ast-btn-p { background: var(--brand-primary); color: white; border: 0; }
.ast-btn-p:hover { opacity: .88; }
.ast-btn-s { background: var(--bg); color: var(--brand-primary); border: 1px solid var(--brand-primary) !important; }
.ast-btn-s:hover { background: var(--bg-alt); }
.ast-step-num { display: inline-flex; align-items: center; justify-content: center;
  background: var(--brand-primary); color: white; width: 20px; height: 20px;
  border-radius: 50%; font-size: 11px; margin-right: 6px; font-weight: 700; flex-shrink: 0; }
.ast-step-title { font-size: 13px; font-weight: 600; color: var(--text); margin: 14px 0 6px; display: flex; align-items: center; }
.ast-paste { width: 100%; min-height: 120px; padding: 10px; border: 1px solid var(--border);
  border-radius: 4px; font-family: ui-monospace, "SF Mono", Consolas, monospace;
  font-size: 11px; line-height: 1.5; box-sizing: border-box; resize: vertical;
  background: var(--bg); color: var(--text); }
.ast-status { text-align: center; padding: 20px; color: var(--text-mute); font-size: 13px; }
.ast-status .spinner { font-size: 24px; animation: spin 1.5s linear infinite; display: inline-block; }
.ast-product { border-left: 3px solid var(--brand-primary); padding: 6px 10px; margin: 6px 0;
  background: var(--bg-alt); font-size: 12px; }
.ast-product .name { font-weight: 600; color: var(--text); }
.ast-product .reason { color: var(--text-mute); margin-top: 2px; }
.ast-script { background: var(--bg-alt); padding: 8px 12px; border-radius: 4px; margin: 6px 0; font-size: 12px; line-height: 1.6; }
.ast-script .lbl { font-weight: 600; color: var(--brand-primary); font-size: 11px; margin-bottom: 2px; }
.ast-list { margin: 0; padding-left: 18px; font-size: 12px; line-height: 1.7; color: var(--text); }
.ast-disclaimer { background: var(--bg-alt); border-left: 3px solid #f59e0b; padding: 8px 12px; margin: 12px 0; font-size: 11px; color: var(--text-mute); }
.ast-feedback { margin-top: 16px; padding-top: 12px; border-top: 1px dashed var(--border); }
.ast-feedback button { margin-right: 8px; padding: 6px 14px; border: 1px solid var(--border);
  background: var(--bg); color: var(--text); border-radius: 4px; cursor: pointer; font-size: 12px; }
.ast-feedback button:hover { background: var(--bg-alt); }
.ast-feedback button.adopted { background: #d1fae5; border-color: #2a9d8f; }
.ast-feedback button.modified { background: #fef3c7; border-color: #f59e0b; }
.ast-feedback button.rejected { background: #fee2e2; border-color: #d62828; }
.ast-error { color: #d62828; background: #fee2e2; padding: 10px; border-radius: 4px; font-size: 12px; }
.ast-meta { font-size: 10px; color: var(--text-mute); margin-top: 8px; }
.ast-section { margin-bottom: 16px; }
.ast-section h4 { margin: 0 0 6px; font-size: 13px; color: var(--text); font-weight: 600; }
.ast-section p { margin: 4px 0; font-size: 12px; line-height: 1.6; color: var(--text); }
</style>

<div style="display:grid;grid-template-columns:1fr 1.4fr;gap:16px;align-items:start">
  <div class="card" style="animation:none;opacity:1;transform:none">
    <div class="tcalc-h">專屬規劃</div>

    <div class="ast-notice">
      <strong>使用須知</strong>
      <ul>
        <li><strong>禁止輸入客戶實名、身分證、帳號等 PII</strong>；只填代稱</li>
        <li>輸出為顧問參考草稿，正式銷售須完成 KYC 與適合度評估</li>
      </ul>
    </div>

    <form id="assist-form">
      <div class="ast-field">
        <label>客戶代稱（永不填本名）</label>
        <input type="text" name="client_code" value="A" maxlength="20" required>
      </div>

      <div class="ast-sec">基本條件</div>
      <div class="ast-field">
        <label>年齡區間</label>
        <select name="age_band" required>${opt(["<40", "40-55", "55-65", "65-75", ">75"])}</select>
      </div>
      <div class="ast-field">
        <label>總資產區間</label>
        <select name="asset_band" required>${opt(["<500萬", "500-3000萬", "3000萬-1億", ">1億"])}</select>
      </div>
      <div class="ast-field">
        <label>月可投資額</label>
        <select name="investable_monthly" required>${opt(["<5萬", "5-20萬", "20-50萬", ">50萬"])}</select>
      </div>

      <div class="ast-sec">投資偏好</div>
      <div class="ast-field">
        <label>風險承受度</label>
        <select name="risk_tolerance" required>${opt(["保守", "穩健", "積極"])}</select>
      </div>
      <div class="ast-field">
        <label>投資年期</label>
        <select name="horizon" required>${opt(["<3年", "3-5年", "5-10年", ">10年"])}</select>
      </div>
      <div class="ast-field">
        <label>主要目標</label>
        <select name="goal" required>${opt(["退休", "教育金", "傳承", "增值", "保本"])}</select>
      </div>

      <div class="ast-sec">既有部位</div>
      <div class="ast-field">
        <div class="ast-existing">
          ${["定存","股票","基金","保險","信託","海外債","房產","其他"].map(v =>
            `<label><input type="checkbox" name="existing" value="${v}"> ${v}</label>`).join("")}
        </div>
      </div>

      <div class="ast-field" style="margin-top:10px">
        <label>自由補充（選填）</label>
        <textarea name="free_text" placeholder="例：客戶剛賣掉一間公寓..." maxlength="500"></textarea>
      </div>

      <button type="submit" class="ast-submit" id="assist-submit-btn">產出建議</button>
    </form>
  </div>

  <div class="card" style="animation:none;opacity:1;transform:none">
    <div class="tcalc-h">輸出</div>
    <div id="assist-output">
      <div class="ast-status">填左側 → 按「組 Prompt」→ 拿到完整 prompt → 自己貼到 claude.ai 跑</div>
    </div>
  </div>
</div>
`;
}

function wireAssistTab() {
  const form = document.getElementById("assist-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const p = {
      client_code: fd.get("client_code") || "A",
      age_band: fd.get("age_band"),
      asset_band: fd.get("asset_band"),
      investable_monthly: fd.get("investable_monthly"),
      risk_tolerance: fd.get("risk_tolerance"),
      horizon: fd.get("horizon"),
      goal: fd.get("goal"),
      existing: fd.getAll("existing"),
      free_text: (fd.get("free_text") || "").trim(),
    };
    document.getElementById("assist-output").innerHTML = renderAssistRuleResult(p);
  });
}

function renderAssistRuleResult(p) {
  const risk = p.risk_tolerance;
  const goal = p.goal;
  const horizon = p.horizon;
  const age = p.age_band;
  const assets = p.asset_band;
  const existing = p.existing || [];

  // --- 資產配置建議 ---
  const alloc = {
    "保守": { "股票型": 10, "債券 / 固定收益": 50, "平衡 / 多元資產": 20, "現金 / 定存": 20 },
    "穩健": { "股票型": 30, "債券 / 固定收益": 35, "平衡 / 多元資產": 25, "現金 / 定存": 10 },
    "積極": { "股票型": 60, "債券 / 固定收益": 20, "平衡 / 多元資產": 15, "現金 / 定存": 5 },
  }[risk] || { "平衡 / 多元資產": 60, "現金 / 定存": 40 };

  // 目標微調
  if (goal === "傳承") { alloc["債券 / 固定收益"] = (alloc["債券 / 固定收益"] || 0) + 10; alloc["股票型"] = Math.max(0, (alloc["股票型"] || 0) - 10); }
  if (goal === "保本") { alloc["現金 / 定存"] = (alloc["現金 / 定存"] || 0) + 15; alloc["股票型"] = Math.max(0, (alloc["股票型"] || 0) - 15); }
  if (goal === "增值" && risk === "積極") { alloc["股票型"] = Math.min(75, (alloc["股票型"] || 0) + 5); }

  const allocRows = Object.entries(alloc).map(([k, v]) => `
    <div style="margin-bottom:6px">
      <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px">
        <span style="color:var(--text-mute)">${k}</span><span style="font-weight:600;color:var(--text)">${v}%</span>
      </div>
      <div style="background:var(--border);border-radius:3px;height:6px;overflow:hidden">
        <div style="background:var(--brand-primary);width:${v}%;height:100%;border-radius:3px"></div>
      </div>
    </div>`).join("");

  // --- 商品類別建議 ---
  const PRODUCTS = {
    "保守": ["投資等級債基金", "短期債券 ETF", "配息型保險", "定存連動商品"],
    "穩健": ["全球平衡型基金", "多元資產基金", "投資等級債", "高評級配息基金"],
    "積極": ["全球股票型基金", "科技 / 主題型 ETF", "海外股票", "新興市場基金"],
  };
  const goalAddons = {
    "退休": ["目標日期基金", "月配息基金"],
    "教育金": ["定期定額股票型基金", "兒童目標儲蓄計畫"],
    "傳承": ["海外債券（信託架構）", "人壽保險（傳承規劃）"],
    "增值": ["主動型成長基金", "主題型 ETF"],
    "保本": ["保本型結構商品", "國債 / 貨幣市場基金"],
  };
  const baseProds = (PRODUCTS[risk] || []).slice(0, 3);
  const goalProds = (goalAddons[goal] || []).slice(0, 2);
  const allProds = [...new Set([...baseProds, ...goalProds])];
  const prodRows = allProds.map(name => `
    <div style="border-left:3px solid var(--brand-primary);padding:5px 10px;margin:5px 0;background:var(--bg-alt);font-size:12px;color:var(--text)">${name}</div>`).join("");

  // --- 缺口提示 ---
  const gaps = [];
  if (!existing.includes("保險")) gaps.push("尚無保險部位，建議評估壽險與醫療保障缺口");
  if (!existing.includes("基金") && !existing.includes("海外債") && !existing.includes("股票")) gaps.push("目前以傳統資產為主，可考慮增加多元化配置");
  if (existing.includes("定存") && risk !== "保守") gaps.push("定存比重偏高，依風險屬性可適度往投資型商品移動");
  if (age === "55-65" || age === "65-75" || age === ">75") gaps.push("接近或已達退休年齡，建議優先確保流動性與定期收益");
  if (horizon === "<3年" && risk === "積極") gaps.push("短年期搭配積極風險，需留意市場波動對贖回時點的影響");

  // --- 追問清單 ---
  const followups = [
    "客戶目前每月固定支出約多少？退休後預計維持同等生活水準嗎？",
    goal === "傳承" ? "有無指定受益人規劃或遺囑安排？" : "未來 3 年有無大額支出計畫（購車、換屋、醫療）？",
    "投資組合中有無已虧損部位需要整理？",
    risk === "積極" ? "是否能接受單年最大回撤 20% 以上？" : "是否曾有因市場下跌而贖回的經驗？",
  ];

  return `
<div style="background:var(--bg-alt);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px">
  <div style="font-size:11px;font-weight:700;color:var(--text-mute);margin-bottom:8px">建議配置方向（${risk} · ${goal} · ${horizon}）</div>
  ${allocRows}
</div>

<div class="ast-section">
  <h4>適合商品類別</h4>
  ${prodRows}
</div>

${gaps.length ? `
<div class="ast-section">
  <h4>注意 / 缺口提示</h4>
  <ul class="ast-list">${gaps.map(g => `<li>${g}</li>`).join("")}</ul>
</div>` : ""}

<div class="ast-section">
  <h4>建議追問</h4>
  <ul class="ast-list">${followups.map(q => `<li>${q}</li>`).join("")}</ul>
</div>

<div class="ast-disclaimer">本建議依輸入條件自動產出，僅供顧問參考架構；正式銷售須完成 KYC、適合度評估及商品說明書揭露。</div>
`;
}

// ============ 退休金試算 ============
function renderRetirementSheet() {
  return `
<style>
.tcalc-grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 16px; align-items: start; }
@media (max-width: 800px) { .tcalc-grid { grid-template-columns: 1fr; } }
.tcalc-field { margin-bottom: 10px; }
.tcalc-field label { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-mute); margin-bottom: 3px; font-weight: 500; }
.tcalc-field label .val { color: var(--brand-primary); font-weight: 600; }
.tcalc-field input[type=range] { width: 100%; accent-color: var(--brand-primary); }
.tcalc-field input[type=number] { width: 100%; padding: 6px 10px; border: 1px solid var(--border); border-radius: 4px; font-size: 13px; box-sizing: border-box; background: var(--bg); color: var(--text); }
.tcalc-sec { font-size: 10px; font-weight: 700; color: var(--text-mute); text-transform: uppercase; letter-spacing: .06em; margin: 14px 0 8px; padding-bottom: 3px; border-bottom: 1px solid var(--border); }
.tcalc-btn { background: var(--brand-primary); color: white; border: 0; padding: 9px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 10px; }
.tcalc-btn:hover { opacity: .88; }
.tcalc-result-sec { padding: 8px 0; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; font-size: 13px; }
.tcalc-result-sec:last-of-type { border-bottom: none; }
.tcalc-result-sec .lbl { color: var(--text-mute); }
.tcalc-result-sec .val { font-weight: 600; color: var(--text); }
.tcalc-gap { border: 2px solid; border-radius: 8px; padding: 12px 16px; margin: 12px 0; text-align: center; }
.tcalc-gap .gnum { font-size: 22px; font-weight: 700; }
.tcalc-gap .glbl { font-size: 12px; color: var(--text-mute); margin-top: 3px; }
.tcalc-subgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
.tcalc-subbox { background: var(--bg-alt); border: 1px solid var(--border); border-radius: 6px; padding: 10px; text-align: center; }
.tcalc-subbox .sv { font-size: 16px; font-weight: 700; color: var(--brand-deep); }
.tcalc-subbox .sl { font-size: 11px; color: var(--text-mute); margin-top: 2px; line-height: 1.4; }
.tcalc-note { font-size: 11px; color: var(--text-mute); margin-top: 12px; line-height: 1.6; border-top: 1px solid var(--border); padding-top: 8px; }
.tcalc-h { font-size: 14px; font-weight: 700; color: var(--brand-deep); margin: 0 0 12px; }
</style>

<div style="display:grid;grid-template-columns:1fr 1.3fr;gap:16px;align-items:start">
  <div class="card" style="animation:none;opacity:1;transform:none">
    <div class="tcalc-h">退休金試算</div>
    <div class="tcalc-sec">個人資訊</div>

    <div class="tcalc-field">
      <label>目前年齡<span class="val"><span id="ret-age-val">45</span> 歲</span></label>
      <input type="range" id="ret-age" min="25" max="64" value="45">
    </div>
    <div class="tcalc-field">
      <label>預計退休年齡<span class="val"><span id="ret-retire-val">65</span> 歲</span></label>
      <input type="range" id="ret-retire" min="50" max="75" value="65">
    </div>
    <div class="tcalc-field">
      <label>預計壽命<span class="val"><span id="ret-life-val">85</span> 歲</span></label>
      <input type="range" id="ret-life" min="70" max="100" value="85">
    </div>

    <div class="tcalc-sec">收入與儲蓄</div>
    <div class="tcalc-field">
      <label>目前月薪<span class="val"><span id="ret-salary-val">6.0</span> 萬</span></label>
      <input type="range" id="ret-salary" min="3" max="50" value="6" step="0.5">
    </div>
    <div class="tcalc-field">
      <label>勞保現有年資<span class="val"><span id="ret-labins-val">20</span> 年</span></label>
      <input type="range" id="ret-labins" min="0" max="45" value="20">
    </div>
    <div class="tcalc-field">
      <label>勞退自提比例<span class="val"><span id="ret-self-val">0</span>%</span></label>
      <input type="range" id="ret-self" min="0" max="6" value="0" step="1">
    </div>
    <div class="tcalc-field">
      <label>目前退休儲蓄（萬元）</label>
      <input type="number" id="ret-savings" value="200" min="0" step="10">
    </div>

    <div class="tcalc-sec">退休後規劃</div>
    <div class="tcalc-field">
      <label>退休後月支出<span class="val"><span id="ret-exp-val">4.0</span> 萬</span></label>
      <input type="range" id="ret-exp" min="1" max="20" value="4" step="0.5">
    </div>
    <div class="tcalc-field">
      <label>預計投資報酬率<span class="val"><span id="ret-ret-val">5.0</span>%／年</span></label>
      <input type="range" id="ret-ret" min="1" max="12" value="5" step="0.5">
    </div>
    <div class="tcalc-field">
      <label>通膨率<span class="val"><span id="ret-inf-val">2.0</span>%／年</span></label>
      <input type="range" id="ret-inf" min="0" max="5" value="2" step="0.5">
    </div>

    <button class="tcalc-btn" id="ret-calc-btn">試算退休缺口</button>
  </div>

  <div class="card" style="animation:none;opacity:1;transform:none">
    <div class="tcalc-h">試算結果</div>
    <div id="ret-result" style="color:var(--text-mute);font-size:13px;padding:20px 0;text-align:center">填入資料後按「試算退休缺口」</div>
  </div>
</div>
`;
}

function wireRetirementTab() {
  const sliders = [
    ["ret-age", "ret-age-val", v => v],
    ["ret-retire", "ret-retire-val", v => v],
    ["ret-life", "ret-life-val", v => v],
    ["ret-salary", "ret-salary-val", v => parseFloat(v).toFixed(1)],
    ["ret-labins", "ret-labins-val", v => v],
    ["ret-self", "ret-self-val", v => v],
    ["ret-exp", "ret-exp-val", v => parseFloat(v).toFixed(1)],
    ["ret-ret", "ret-ret-val", v => parseFloat(v).toFixed(1)],
    ["ret-inf", "ret-inf-val", v => parseFloat(v).toFixed(1)],
  ];
  sliders.forEach(([id, valId, fmt]) => {
    const el = document.getElementById(id);
    const val = document.getElementById(valId);
    if (!el || !val) return;
    el.addEventListener("input", () => { val.textContent = fmt(el.value); });
  });

  const btn = document.getElementById("ret-calc-btn");
  if (btn) btn.addEventListener("click", () => {
    const g = id => parseFloat(document.getElementById(id)?.value || 0);
    const age = g("ret-age");
    const retireAge = g("ret-retire");
    const lifeAge = g("ret-life");
    const salaryWan = g("ret-salary");
    const labInsYears = g("ret-labins");
    const selfPct = g("ret-self") / 100;
    const currentSavingsWan = g("ret-savings");
    const monthExpWan = g("ret-exp");
    const annualReturn = g("ret-ret") / 100;
    const inflation = g("ret-inf") / 100;

    const n1 = Math.max(retireAge - age, 1);  // years to retirement
    const n2 = Math.max(lifeAge - retireAge, 1);  // retirement duration years

    const monthlyReturn = annualReturn / 12;
    const monthlyInflation = inflation / 12;

    // --- 勞保老年年金 ---
    // 公式：平均月投保薪資 × (勞保年資) × 1.55%
    const totalLabInsYears = Math.min(labInsYears + n1, 45);
    // 月投保薪資上限 45,800（2024），依薪資級距取最近值
    const labInsSalary = Math.min(salaryWan * 10000, 45800);
    const monthlyLabIns = (labInsSalary * totalLabInsYears * 0.0155);

    // --- 勞退新制 ---
    // 雇主提撥6% + 自提，複利累積到退休
    const monthlyLabRetire = salaryWan * 10000 * (0.06 + selfPct);
    // 勞退基金長期報酬率約2-3%（保守用2.5%）
    const labRetireReturn = 0.025 / 12;
    const labRetireFV = monthlyLabRetire * ((Math.pow(1 + labRetireReturn, n1 * 12) - 1) / labRetireReturn);
    // 分25年領（300個月）
    const labRetireMonthly = labRetireFV / (n2 * 12);

    // --- 個人儲蓄 ---
    const savingsFV = currentSavingsWan * 10000 * Math.pow(1 + annualReturn, n1);
    // 退休後月領（等額分配，退休後報酬率保守取一半）
    const retireMonthlyReturn = (annualReturn / 2) / 12;
    let savingsMonthly;
    if (retireMonthlyReturn > 0) {
      const pvFactor = (1 - Math.pow(1 + retireMonthlyReturn, -(n2 * 12))) / retireMonthlyReturn;
      savingsMonthly = savingsFV / pvFactor;
    } else {
      savingsMonthly = savingsFV / (n2 * 12);
    }

    // --- 退休後月支出（通膨調整）---
    const futureMonthExp = monthExpWan * 10000 * Math.pow(1 + inflation, n1);

    // --- 現有收入合計 ---
    const totalMonthlyIncome = monthlyLabIns + labRetireMonthly + savingsMonthly;
    const monthlyGap = futureMonthExp - totalMonthlyIncome;

    // --- 補足缺口需每月多存多少 ---
    let extraMonthly = 0;
    if (monthlyGap > 0) {
      // 需在退休前再累積多少本金以填補缺口
      let pvFactor2;
      if (retireMonthlyReturn > 0) {
        pvFactor2 = (1 - Math.pow(1 + retireMonthlyReturn, -(n2 * 12))) / retireMonthlyReturn;
      } else {
        pvFactor2 = n2 * 12;
      }
      const extraCorpus = monthlyGap * pvFactor2;
      const fvFactor = (Math.pow(1 + monthlyReturn, n1 * 12) - 1) / monthlyReturn;
      extraMonthly = fvFactor > 0 ? extraCorpus / fvFactor : 0;
    }

    const fmt = v => `${(v / 10000).toFixed(1)} 萬`;
    const gapClass = monthlyGap <= 0 ? "gap-ok" : monthlyGap < 20000 ? "gap-warn" : "gap-bad";
    const gapIcon = monthlyGap <= 0 ? "✓" : "△";
    const gapText = monthlyGap <= 0
      ? `每月盈餘 ${fmt(-monthlyGap)}`
      : `每月缺口 ${fmt(monthlyGap)}`;

    document.getElementById("ret-result").innerHTML = `
<div style="background:var(--bg-alt);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:10px">
  <div style="font-size:11px;font-weight:700;color:var(--text-mute);margin-bottom:6px">退休後每月收支預估（退休年齡 ${retireAge} 歲）</div>
  ${[
    ["退休後月支出（通膨後）", fmt(futureMonthExp), false],
    ["勞保老年年金", fmt(monthlyLabIns), true],
    ["勞退新制月領", fmt(labRetireMonthly), true],
    ["個人儲蓄月領", fmt(savingsMonthly), true],
    ["每月可用收入合計", fmt(totalMonthlyIncome), true],
  ].map(([lbl, val, green]) => `
  <div class="tcalc-result-sec">
    <span class="lbl">${lbl}</span>
    <span class="val" style="${green ? 'color:var(--down)' : ''}">${val}</span>
  </div>`).join("")}
</div>
<div style="border:2px solid ${monthlyGap <= 0 ? 'var(--down)' : monthlyGap < 20000 ? '#f59e0b' : 'var(--up)'};border-radius:8px;padding:12px;text-align:center;margin:0 0 10px">
  <div style="font-size:22px;font-weight:700;color:${monthlyGap <= 0 ? 'var(--down)' : monthlyGap < 20000 ? '#d97706' : 'var(--up)'}">${gapIcon} ${gapText}</div>
  <div style="font-size:12px;color:var(--text-mute);margin-top:3px">${monthlyGap <= 0 ? '目前規劃充足，建議定期檢視' : `建議每月再多存 ${fmt(extraMonthly)}（到退休前）`}</div>
</div>
<div class="tcalc-subgrid">
  <div class="tcalc-subbox"><div class="sv">${(labRetireFV / 10000).toFixed(0)} 萬</div><div class="sl">勞退累積本金<br>（退休時）</div></div>
  <div class="tcalc-subbox"><div class="sv">${(savingsFV / 10000).toFixed(0)} 萬</div><div class="sl">個人儲蓄本金<br>（退休時）</div></div>
  <div class="tcalc-subbox"><div class="sv">${totalLabInsYears.toFixed(0)} 年</div><div class="sl">勞保投保年資<br>（退休時）</div></div>
  <div class="tcalc-subbox"><div class="sv">${n2} 年</div><div class="sl">退休後預計<br>需支應年數</div></div>
</div>
<p class="tcalc-note"><strong>計算基礎：</strong>勞保年金 = 月投保薪資 × 年資 × 1.55%（月投保薪資上限 45,800 元，依 2024 勞保局規定）；勞退新制採雇主 6%＋自提，長期報酬率假設 2.5%；退休後個人儲蓄月領以複利年金公式計算，報酬率取投資報酬率之半（保守假設）。此工具僅供估算參考，實際請洽勞動部勞工保險局查詢個人紀錄。</p>
`;
  });
}

// ============ 保障缺口試算 ============
function renderInsuranceGapSheet() {
  return `
<style>
.tins-field { margin-bottom: 10px; }
.tins-field label { display: flex; justify-content: space-between; font-size: 12px; color: var(--text-mute); margin-bottom: 3px; font-weight: 500; }
.tins-field label .val { color: var(--brand-primary); font-weight: 600; }
.tins-field input[type=range] { width: 100%; accent-color: var(--brand-primary); }
.tins-field input[type=number] { width: 100%; padding: 6px 10px; border: 1px solid var(--border); border-radius: 4px; font-size: 13px; box-sizing: border-box; background: var(--bg); color: var(--text); }
.tins-sec { font-size: 10px; font-weight: 700; color: var(--text-mute); text-transform: uppercase; letter-spacing: .06em; margin: 14px 0 8px; padding-bottom: 3px; border-bottom: 1px solid var(--border); }
.tins-btn { background: var(--brand-primary); color: white; border: 0; padding: 9px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 10px; }
.tins-btn:hover { opacity: .88; }
.tins-gsec { background: var(--bg-alt); border: 1px solid var(--border); border-radius: 8px; padding: 12px; margin-bottom: 10px; }
.tins-gsec h4 { margin: 0 0 8px; font-size: 13px; color: var(--brand-deep); font-weight: 700; }
.tins-grow { display: flex; justify-content: space-between; font-size: 12px; padding: 4px 0; border-bottom: 1px solid var(--border); color: var(--text-mute); }
.tins-grow:last-child { border-bottom: none; }
.tins-gtotal { display: flex; justify-content: space-between; font-size: 14px; font-weight: 700; padding: 8px 0; border-top: 2px solid var(--brand-primary); margin-top: 6px; color: var(--text); }
.tins-badge { display: inline-block; padding: 1px 7px; border-radius: 10px; font-size: 10px; font-weight: 600; }
.tins-badge.high { background: #fee2e2; color: #991b1b; }
.tins-badge.mid { background: #fef3c7; color: #92400e; }
.tins-badge.low { background: #d1fae5; color: #065f46; }
.tins-pitem { font-size: 12px; padding: 4px 0; display: flex; gap: 8px; align-items: center; color: var(--text); }
.tins-note { font-size: 11px; color: var(--text-mute); margin-top: 12px; line-height: 1.6; border-top: 1px solid var(--border); padding-top: 8px; }
</style>

<div style="display:grid;grid-template-columns:1fr 1.3fr;gap:16px;align-items:start">
  <div class="card" style="animation:none;opacity:1;transform:none">
    <div class="tcalc-h">保障缺口試算</div>
    <div class="tins-sec">個人資訊</div>

    <div class="tins-field">
      <label>年齡<span class="val"><span id="ins-age-val">45</span> 歲</span></label>
      <input type="range" id="ins-age" min="20" max="70" value="45">
    </div>
    <div class="tins-field">
      <label>年收入<span class="val"><span id="ins-income-val">120</span> 萬</span></label>
      <input type="range" id="ins-income" min="30" max="1000" value="120" step="10">
    </div>
    <div class="tins-field">
      <label>保障需求年數<span class="val"><span id="ins-years-val">20</span> 年</span></label>
      <input type="range" id="ins-years" min="5" max="40" value="20">
    </div>

    <div class="tins-sec">家庭負債與需求</div>
    <div class="tins-field">
      <label>未償債務（萬元）</label>
      <input type="number" id="ins-debt" value="500" min="0" step="50">
    </div>
    <div class="tins-field">
      <label>子女教育基金需求（萬元）</label>
      <input type="number" id="ins-edu" value="200" min="0" step="50">
    </div>
    <div class="tins-field">
      <label>喪葬費用準備（萬元）</label>
      <input type="number" id="ins-funeral" value="100" min="0" step="10">
    </div>

    <div class="tins-sec">現有壽險保障</div>
    <div class="tins-field">
      <label>現有壽險保額（萬元）</label>
      <input type="number" id="ins-life-cur" value="300" min="0" step="100">
    </div>
    <div class="tins-field">
      <label>勞保死亡給付（萬元）</label>
      <input type="number" id="ins-labor-death" value="50" min="0" step="10">
    </div>

    <div class="tins-sec">醫療保障</div>
    <div class="tins-field">
      <label>目標醫療準備（萬元）</label>
      <input type="number" id="ins-med-target" value="500" min="100" step="50">
    </div>
    <div class="tins-field">
      <label>現有醫療險估計給付（萬元）</label>
      <input type="number" id="ins-med-cur" value="150" min="0" step="50">
    </div>

    <div class="tins-sec">失能保障</div>
    <div class="tins-field">
      <label>失能保障需求年數<span class="val"><span id="ins-dis-yrs-val">5</span> 年</span></label>
      <input type="range" id="ins-dis-yrs" min="1" max="15" value="5">
    </div>
    <div class="tins-field">
      <label>現有失能/長照保險年給付（萬元）</label>
      <input type="number" id="ins-dis-cur" value="0" min="0" step="10">
    </div>

    <button class="tins-btn" id="ins-calc-btn">試算保障缺口</button>
  </div>

  <div class="card" style="animation:none;opacity:1;transform:none">
    <div class="tcalc-h">試算結果</div>
    <div id="ins-result" style="color:var(--text-mute);font-size:13px;padding:20px 0;text-align:center">填入資料後按「試算保障缺口」</div>
  </div>
</div>
`;
}

function wireInsuranceGapTab() {
  const sliders = [
    ["ins-age", "ins-age-val", v => v],
    ["ins-income", "ins-income-val", v => v],
    ["ins-years", "ins-years-val", v => v],
    ["ins-dis-yrs", "ins-dis-yrs-val", v => v],
  ];
  sliders.forEach(([id, valId, fmt]) => {
    const el = document.getElementById(id);
    const val = document.getElementById(valId);
    if (!el || !val) return;
    el.addEventListener("input", () => { val.textContent = fmt(el.value); });
  });

  const btn = document.getElementById("ins-calc-btn");
  if (btn) btn.addEventListener("click", () => {
    const g = id => parseFloat(document.getElementById(id)?.value || 0);

    const age = g("ins-age");
    const annualIncomeWan = g("ins-income");
    const protectYears = g("ins-years");
    const debtWan = g("ins-debt");
    const eduWan = g("ins-edu");
    const funeralWan = g("ins-funeral");
    const lifeCurWan = g("ins-life-cur");
    const laborDeathWan = g("ins-labor-death");
    const medTargetWan = g("ins-med-target");
    const medCurWan = g("ins-med-cur");
    const disYrs = g("ins-dis-yrs");
    const disCurWan = g("ins-dis-cur");

    // --- 壽險缺口（遺族需求法）---
    // 需求 = 收入替代 + 未償債務 + 教育費 + 喪葬費
    const incomeReplaceWan = annualIncomeWan * protectYears * 0.7;  // 70% 替代率
    const lifeNeedWan = incomeReplaceWan + debtWan + eduWan + funeralWan;
    const lifeHaveWan = lifeCurWan + laborDeathWan;
    const lifeGapWan = Math.max(0, lifeNeedWan - lifeHaveWan);

    // --- 醫療缺口（重大疾病準備）---
    const medGapWan = Math.max(0, medTargetWan - medCurWan);

    // --- 失能缺口（薪資替代）---
    const monthlyIncomeWan = annualIncomeWan / 12;
    const disNeedWan = monthlyIncomeWan * disYrs * 12;
    const disGapWan = Math.max(0, disNeedWan - disCurWan);

    // --- 總缺口 ---
    const totalGapWan = lifeGapWan + medGapWan + disGapWan;

    // --- 優先順序 ---
    const priorities = [];
    if (lifeGapWan > 0) priorities.push({ label: `壽險補足 ${lifeGapWan.toFixed(0)} 萬`, level: "high", reason: "身故風險影響遺族生活最大" });
    if (medGapWan > 0) priorities.push({ label: `醫療準備補足 ${medGapWan.toFixed(0)} 萬`, level: "high", reason: "重大疾病自費支出高" });
    if (disGapWan > 0) priorities.push({ label: `失能/長照保障補足 ${disGapWan.toFixed(0)} 萬`, level: age >= 50 ? "high" : "mid", reason: "長期失能致收入中斷風險" });
    if (!priorities.length) priorities.push({ label: "各項保障均已充足", level: "low", reason: "建議每3年定期複審" });

    const fmtW = v => `${v.toFixed(0)} 萬`;
    const gapColor = v => v <= 0 ? "pos" : "neg";

    document.getElementById("ins-result").innerHTML = `
<div class="tins-gsec">
  <h4>壽險缺口（遺族需求法）</h4>
  <div class="tins-grow"><span>收入替代需求（年收 × ${protectYears}年 × 70%）</span><span>${fmtW(incomeReplaceWan)}</span></div>
  <div class="tins-grow"><span>未償債務</span><span>${fmtW(debtWan)}</span></div>
  <div class="tins-grow"><span>教育費 + 喪葬費</span><span>${fmtW(eduWan + funeralWan)}</span></div>
  <div class="tins-grow" style="font-weight:600;color:var(--text)"><span>壽險總需求</span><span>${fmtW(lifeNeedWan)}</span></div>
  <div class="tins-grow"><span>現有壽險 + 勞保給付</span><span style="color:var(--down)">− ${fmtW(lifeHaveWan)}</span></div>
  <div class="tins-gtotal"><span>壽險缺口</span><span style="color:${lifeGapWan > 0 ? 'var(--up)' : 'var(--down)'}">${lifeGapWan > 0 ? '缺 ' + fmtW(lifeGapWan) : '充足 ✓'}</span></div>
</div>
<div class="tins-gsec">
  <h4>醫療缺口（重大疾病準備）</h4>
  <div class="tins-grow"><span>目標醫療準備</span><span>${fmtW(medTargetWan)}</span></div>
  <div class="tins-grow"><span>現有醫療保障估值</span><span style="color:var(--down)">− ${fmtW(medCurWan)}</span></div>
  <div class="tins-gtotal"><span>醫療缺口</span><span style="color:${medGapWan > 0 ? 'var(--up)' : 'var(--down)'}">${medGapWan > 0 ? '缺 ' + fmtW(medGapWan) : '充足 ✓'}</span></div>
</div>
<div class="tins-gsec">
  <h4>失能 / 長照缺口</h4>
  <div class="tins-grow"><span>失能收入替代需求（${disYrs}年）</span><span>${fmtW(disNeedWan)}</span></div>
  <div class="tins-grow"><span>現有失能 / 長照年給付</span><span style="color:var(--down)">− ${fmtW(disCurWan)}</span></div>
  <div class="tins-gtotal"><span>失能缺口</span><span style="color:${disGapWan > 0 ? 'var(--up)' : 'var(--down)'}">${disGapWan > 0 ? '缺 ' + fmtW(disGapWan) : '充足 ✓'}</span></div>
</div>
<div style="background:var(--brand-primary);color:white;border-radius:8px;padding:12px;text-align:center;margin:8px 0">
  <div style="font-size:12px;opacity:.85">三大保障總缺口</div>
  <div style="font-size:24px;font-weight:700;margin:4px 0">${totalGapWan > 0 ? '缺 ' + fmtW(totalGapWan) : '各項均充足 ✓'}</div>
</div>
<div style="background:var(--bg-alt);border:1px solid var(--border);border-radius:6px;padding:10px;margin-top:8px">
  <div style="font-size:11px;font-weight:700;color:var(--text-mute);margin-bottom:6px">補強優先順序</div>
  ${priorities.map((p, i) => `
  <div class="tins-pitem">
    <span class="tins-badge ${p.level}">${p.level === 'high' ? '優先' : p.level === 'mid' ? '次優先' : '充足'}</span>
    <span>${i + 1}. ${p.label}（${p.reason}）</span>
  </div>`).join("")}
</div>
<p class="tins-note"><strong>計算基礎：</strong>壽險缺口採「遺族需求法」，以年收入 × 年數 × 70% 替代率為基礎；醫療缺口參照台灣重大疾病平均自費 300–500 萬，建議目標 500 萬；失能缺口以月薪替代計算需求年數。勞保死亡給付（一次金）依年資實際不同，此處以輸入值為準。本工具僅供規劃參考，實際保額建議請洽持牌保險業務員進行完整需求分析。</p>
`;
  });
}

// ===== 理財聊聊（關鍵字智慧回應，不需 API Key、可離線）=====
// 人設：小幫手。知識庫四類：理財觀念 / App導覽 / 傳承稅務 / 市場名詞。
const LICAI_KB = [
  // ── 理財觀念教學 ──
  { keys: ["複利", "利滾利", "複利效果"], reply: "複利就是「利息再賺利息」🌱\n\n本金產生的利息，下一期會一起再生利息，時間越久滾得越快。\n\n例：100 萬、年報酬 6%\n• 第 1 年 → 106 萬\n• 第 12 年 → 約 200 萬（翻倍）\n\n口訣「72 法則」：72 ÷ 年報酬率 ≈ 翻倍年數（72÷6=12 年）。複利最大的朋友是「時間」，越早開始越有利。" },
  { keys: ["定期定額", "定額", "扣款", "微笑曲線"], reply: "定期定額＝每月固定金額買進同一標的 📅\n\n好處：\n• 自動分散買進時點，不用猜高低點\n• 下跌時買到更多單位，平均成本降低（微笑曲線）\n• 強迫儲蓄、紀律投資\n\n適合長期、波動較大的標的（如股票型基金、ETF）。重點是「不要中途因為下跌就停扣」，跌的時候正是累積便宜單位的時候。" },
  { keys: ["etf", "指數型", "被動"], reply: "ETF＝指數股票型基金 📊\n\n一籃子股票打包成一檔，在證交所像股票一樣買賣。\n\n特色：\n• 分散風險（一次買進整個指數）\n• 費用低（被動追蹤，不用養經理人）\n• 透明、好交易\n\n常見：追蹤大盤的市值型、追高股息的高股息型、追產業的主題型。適合想長期參與市場、又不想選個股的人。" },
  { keys: ["資產配置", "配置", "股債", "再平衡"], reply: "資產配置＝把錢分散到不同性質的資產 🧩\n\n核心是「不要把雞蛋放同一個籃子」：\n• 股票：追求成長，但波動大\n• 債券：相對穩、領息，降低整體波動\n• 現金：保留彈性與安全感\n\n比例看年齡與風險承受度（年輕可多股、近退休多債）。每年「再平衡」一次，把漲多的賣一點、補進跌的，自動高賣低買。\n\n👉 App 的「資產配置」分頁有試算工具可以玩玩看。" },
  { keys: ["風險分散", "分散風險", "雞蛋"], reply: "分散風險有三個方向 🎯\n\n1️⃣ 標的分散：不同公司、不同產業\n2️⃣ 地區分散：台股、美股、新興市場\n3️⃣ 時間分散：定期定額分批買進\n\n分散不會讓報酬變高，但能讓「波動」變小、避免單一事件重傷。穩穩走比較久遠 🌿" },
  { keys: ["停利", "停損", "獲利了結"], reply: "停利停損是紀律，不是預測 ⚖️\n\n• 停利：漲到設定目標就分批落袋，落袋為安\n• 停損：跌破設定點就認賠出場，保住本金\n\n重點是「事先設好、確實執行」，避免被情緒綁架（賺了想再多賺、賠了凹單）。長期投資（如定期定額 ETF）則可不設停損，靠時間與紀律。" },
  { keys: ["緊急預備金", "預備金", "急用金", "備用金"], reply: "緊急預備金＝先存好的「安全氣囊」🛟\n\n建議準備 3～6 個月的生活費，放在隨時可動用的地方（活存、貨幣基金）。\n\n用途：失業、生病、突發大支出時不用被迫賣股、不用借錢。\n\n先把這筆存夠，再開始投資，心理會穩很多。投資的錢應該是「短期內用不到」的閒錢。" },
  { keys: ["通膨怎麼辦", "對抗通膨", "錢變薄"], reply: "對抗通膨，重點是讓錢「會長大」💰\n\n錢放定存，利率常追不上通膨，購買力會悄悄縮水。\n\n抗通膨方向：\n• 股票 / 股票型 ETF（長期報酬通常勝通膨）\n• 部分配置抗通膨資產（如不動產、原物料）\n\n不是要你冒大風險，而是「至少別讓錢躺著貶值」。穩健配置＋長期持有是常見解法。" },
  // ── App 功能導覽 ──
  { keys: ["怎麼用", "功能", "有什麼", "教學", "導覽", "怎麼看"], reply: "理財小幫手主要分頁 🧭\n\n• 全球市場：台美股、匯率、債券行情\n• 重要新聞：每日財經重點 TLDR\n• 精選基金：單筆 / 定期定額 / 績效比較\n• 精選海外債：債券清單與換券試算\n• 海外股票：精選與熱門美股\n• 資產配置：投組分析、配置試算\n• 精選保險：保障缺口試算\n• 小學堂：理財知識課程\n\n想了解哪一個？直接問我「基金在哪」「投組分析怎麼用」都可以 🌸" },
  { keys: ["基金在哪", "看基金", "基金", "申購"], reply: "基金資訊在「精選基金」分頁 📊\n\n裡面有三個次分頁：\n• 單筆投資：精選一次買進的基金\n• 定期定額：適合月扣的標的\n• 績效比較：把幾檔基金擺一起比報酬\n\n每檔都有一句話重點（tagline）。記得：基金有手續費與風險，過去績效不代表未來喔。" },
  { keys: ["海外債", "債券在哪", "換券"], reply: "海外債在「精選海外債」分頁 📑\n\n可以看到債券清單、發行人、殖利率、重點摘要，還有「換券試算」可以比較兩檔債券。\n\n小提醒：不同申購代碼多半代表不同債券，少數舊碼對現行檔為同一檔，試算時兩碼都留、用 index 比對最保險。" },
  { keys: ["投組", "投組分析", "組合分析", "配置試算"], reply: "投組分析在「資產配置」分頁裡 🧩\n\n你可以選預設組合、或自訂組合，系統會算出：\n• 配置比例、集中度（HHI）\n• 標的重疊、配息、風險、費用\n\n屬於教育示範用途，幫你「看懂」一個組合的體質，不是買賣建議。" },
  { keys: ["保險在哪", "保障", "保額", "缺口"], reply: "保險在「精選保險」分頁 🛡️\n\n有「保障缺口試算」：輸入收入、年數等，會算出壽險／醫療／失能三大缺口，給補強優先順序。\n\n計算僅供規劃參考，正式保額建議請洽持牌保險業務員做完整需求分析。" },
  { keys: ["小學堂", "課程", "想學", "學習"], reply: "想打基礎就去「小學堂」📚\n\n那裡有理財知識課程（含財富傳承等主題），用比較有系統的方式帶你認識觀念。\n\n當然，臨時有疑問也可以直接問我，我先幫你白話解釋一輪 🌸" },
  { keys: ["安裝", "加到主畫面", "下載", "app"], reply: "想把理財小幫手放到手機主畫面？📲\n\n點導覽列的「安裝」分頁，照著步驟做：\n• iPhone：用 Safari 開 → 分享 → 加入主畫面\n• Android：Chrome 會跳出安裝提示\n\n裝好之後就像一般 App，可離線看，開啟更快。" },
  // ── 傳承 / 稅務常識 ──
  { keys: ["贈與稅", "贈與", "免稅額"], reply: "贈與稅重點（台灣現行）🎁\n\n• 每人每年贈與「免稅額」244 萬元（贈與人計算）\n• 超過部分課贈與稅，採累進稅率 10%～20%\n\n善用每年免稅額、夫妻間贈與免稅等規劃，可分年移轉資產。\n\n⚠️ 金額級距與規定可能調整，實際以個案及現行法令、國稅局公告為準，正式規劃建議洽專業人員。" },
  { keys: ["遺產稅", "繼承", "遺產"], reply: "遺產稅重點（台灣現行）⚖️\n\n• 有免稅額與多項扣除額（配偶、直系血親、喪葬費等）\n• 課稅級距採累進 10%～20%\n\n常見規劃工具：保險、信託、分年贈與、預立遺囑等，搭配運用可讓傳承更有秩序。\n\n⚠️ 各項金額與規定可能調整，實際以個案及現行法令為準。完整方案建議找傳承顧問評估。" },
  { keys: ["信託", "安養信託", "他益"], reply: "信託＝把財產交給受託人，按你的意願管理運用 🤝\n\n常見用途：\n• 安養信託：保障自己晚年照護金流\n• 子女教育金、特定目的給付\n• 預防失智、避免一次給付被揮霍\n\n優點是「照你設定的條件、時間分配」，多一層保護與彈性。實際架構與稅務影響需個案規劃，建議洽專業評估。" },
  { keys: ["保單規劃", "保險傳承", "保單"], reply: "保單在傳承裡常扮演「指定、即時、有槓桿」的角色 💡\n\n• 可指定受益人，理賠相對快速\n• 提供現金流支應稅源或遺族生活\n• 規劃得當有資產移轉效果\n\n但要注意實質課稅原則與相關規定，並非「買保單就一定免稅」。完整傳承架構建議搭配顧問做整體評估。" },
  { keys: ["二代健保", "補充保費"], reply: "二代健保補充保費小提醒 🏥\n\n單筆「股利、利息、租金」等所得達一定金額時，會被扣補充保費。\n\n領大額股息、配息前可留意門檻與級距，做基本的試算與安排。實際費率與門檻以健保署現行公告為準。" },
  // ── 市場名詞解釋 ──
  { keys: ["殖利率", "yield", "債券殖利率"], reply: "殖利率＝投資這筆錢，一年大約能領回多少比例 📈\n\n• 股票殖利率＝現金股利 ÷ 股價\n• 債券殖利率＝考慮票息與買進價格後的年化報酬\n\n債券價格漲，殖利率就降；價格跌，殖利率就升（兩者反向）。殖利率高不一定好，要一起看風險與品質。" },
  { keys: ["本益比", "pe", "p/e", "本益比是"], reply: "本益比（P/E）＝股價 ÷ 每股盈餘（EPS）💹\n\n白話：用現在股價買，幾年的獲利能回本。\n\n• 本益比高：市場願意給較高評價（期待成長）或偏貴\n• 本益比低：相對便宜，或市場不看好\n\n要跟「同產業」比才有意義，單看數字高低不準。" },
  { keys: ["通膨", "通貨膨脹", "cpi"], reply: "通膨＝物價普遍上漲、錢變薄 📉\n\n常用指標 CPI（消費者物價指數）。通膨溫和（約 2%）是健康的；太高則傷購買力。\n\n影響：\n• 央行可能升息抑制通膨\n• 現金、定存的實質購買力下降\n\n所以理財要讓資產「跑得贏通膨」。" },
  { keys: ["升息", "降息", "利率", "fed", "聯準會"], reply: "升降息是央行調控經濟的方向盤 🎚️\n\n• 升息：借錢變貴 → 抑制過熱與通膨；對股市、債券價格通常偏壓力\n• 降息：借錢變便宜 → 刺激景氣；對股市、債券價格通常偏利多\n\n美國由聯準會（Fed）決定，全球都會盯著。利率走向會影響股、債、匯各種資產。" },
  { keys: ["殖利率倒掛", "倒掛"], reply: "殖利率倒掛＝短天期利率比長天期還高 🔄\n\n正常情況是「借越久利率越高」。一旦短期反而比長期高（倒掛），常被視為市場擔心未來景氣的訊號，歷史上有時領先於經濟衰退。\n\n但它是「參考訊號」不是水晶球，倒掛後到實際衰退常有時間差，仍要綜合判斷。" },
  { keys: ["gdp", "國內生產毛額", "經濟成長"], reply: "GDP＝國內生產毛額，衡量一國一年的經濟產出 🏭\n\nGDP 成長率↑代表經濟擴張、↓代表趨緩。\n\n它是判斷景氣大方向的核心指標之一，常和就業、通膨一起看。投資時了解大環境，有助於設定合理的期待。" },
  // ── 鼓勵 / 通用 ──
  { keys: ["謝謝", "感謝", "你好棒", "厲害"], reply: "不客氣～能幫上忙我很開心 😊\n理財是長期的事，慢慢累積觀念就會越來越上手。有任何問題隨時來問我 🌸" },
  { keys: ["你好", "嗨", "哈囉", "hi", "hello"], reply: "嗨！我是你的理財小幫手 🌸\n可以問我理財觀念（複利、定期定額、ETF…）、App 怎麼用、傳承稅務常識，或財經名詞解釋。\n想從哪個開始呢？" },
];

// ── 今日數據：指數別名表（問哪個市場 → 對應 market.json 的 name）──
const LICAI_INDEX_ALIASES = [
  { match: ["標普", "s&p", "sp500", "史坦普", "美股", "美國股市"], name: "S&P 500" },
  { match: ["那斯達克", "納斯達克", "nasdaq", "那指"], name: "Nasdaq Composite" },
  { match: ["道瓊", "道指", "dow"], name: "Dow Jones" },
  { match: ["費半", "費城半導體", "半導體指數", "sox"], name: "PHLX Semiconductor" },
  { match: ["台股", "加權", "taiex", "大盤", "台積電指數"], name: "TAIEX 加權指數" },
  { match: ["櫃買", "otc", "櫃檯"], name: "OTC 櫃買加權" },
  { match: ["台指期", "期貨指數"], name: "台指期(近月)" },
  { match: ["日經", "日股", "nikkei", "日本股市"], name: "Nikkei 225" },
  { match: ["韓股", "kospi", "南韓股市"], name: "KOSPI" },
  { match: ["恆生", "港股", "hang seng", "香港股市"], name: "Hang Seng 恆生" },
  { match: ["上證", "陸股", "中國股市", "shanghai"], name: "Shanghai 上證" },
  { match: ["滬深", "csi 300", "csi300"], name: "CSI 300 滬深300" },
  { match: ["印度股", "nifty"], name: "Nifty 50" },
  { match: ["歐股", "歐洲股市", "stoxx"], name: "Euro Stoxx 50" },
  { match: ["德股", "dax", "德國股市"], name: "DAX" },
  { match: ["英股", "ftse", "英國股市"], name: "FTSE 100" },
  { match: ["法股", "cac", "法國股市"], name: "CAC 40" },
  { match: ["澳股", "asx", "澳洲股市"], name: "S&P/ASX 200" },
];
// 行情意圖詞：出現才回今日數據，避免「升息對美股影響」這種教學題被誤觸發
const LICAI_PRICE_INTENT = ["今天", "今日", "現在", "目前", "最近", "多少", "幾點", "漲", "跌", "行情", "盤", "表現", "收盤", "走勢", "報價", "怎樣", "如何", "幾%", "幾趴"];

function licaiFmtPct(p) {
  if (p == null || isNaN(p)) return "—";
  return (p > 0 ? "+" : "") + Number(p).toFixed(2) + "%";
}
function licaiFmtNum(n) {
  if (n == null || isNaN(n)) return "—";
  return Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 });
}
function licaiHasPriceIntent(t) {
  return LICAI_PRICE_INTENT.some(w => t.includes(w)) || t.length <= 6;
}
// 通用名稱比對：找名稱與提問「共同片段最長（≥2 字、非通用詞）」的那檔，不寫死檔名
const LICAI_NAME_STOP = ["基金", "債券", "美元", "台幣", "新台幣", "公司", "收益", "全球", "新興", "市場", "投資", "累積", "月配", "配息", "殖利", "利率", "怎樣", "表現", "現在", "今天", "今日", "多少", "績效", "淨值", "公司債", "主權債", "目前", "最近", "如何"];
function licaiStrip(s) {
  let r = s || "";
  for (const w of LICAI_NAME_STOP) r = r.split(w).join("");
  return r;
}
// 剝除通用詞＋標點，留下可辨識字元（避免「公司債」殘片、「-」斷字誤判）
function licaiClean(s) {
  return licaiStrip((s || "").toLowerCase()).replace(/[^一-龥a-z0-9]/g, "");
}
// 用 2-gram（相鄰字對）重疊計分挑最相符的一檔；回 {item, score}
function licaiFindScored(list, t) {
  const q = licaiClean(t);
  if (q.length < 2) return { item: null, score: 0 };
  const grams = [];
  for (let i = 0; i + 2 <= q.length; i++) grams.push(q.slice(i, i + 2));
  let best = null, bestScore = 0;
  for (const it of (list || [])) {
    const nm = licaiClean((it.name_zh || "") + (it.issuer || ""));
    if (!nm) continue;
    let sc = 0;
    for (const g of grams) if (nm.includes(g)) sc++;
    if (sc > bestScore) { bestScore = sc; best = it; }
  }
  return { item: best, score: bestScore };
}
function licaiFindByName(list, t) {
  const r = licaiFindScored(list, t);
  return r.score >= 1 ? r.item : null;
}
function licaiPerf1y(f) {
  const p = f.perf_single || f.perf || {};
  return p["1y"] != null ? p["1y"] : (p["6m"] != null ? p["6m"] : null);
}
// 今日數據回應：命中才回字串，否則回 null（讓後面的知識庫接手）
function licaiLiveReply(t) {
  try {
    const m = (typeof DATA !== "undefined" && DATA && DATA.market) ? DATA.market : null;
    if (!m) return null;
    const wantsPrice = licaiHasPriceIntent(t);

    // 1) 單一指數
    for (const a of LICAI_INDEX_ALIASES) {
      if (a.match.some(k => t.includes(k.toLowerCase()))) {
        if (!wantsPrice) return null; // 像「美股是什麼」就交給知識庫
        const idx = (m.indices || []).find(x => x.name === a.name);
        if (!idx) return null;
        const date = idx.closing_date || m.closing_date || "";
        const arrow = idx.daily_pct > 0 ? "📈" : (idx.daily_pct < 0 ? "📉" : "➡️");
        return `${a.name}（收盤 ${date}）${arrow}\n\n` +
          `• 收盤：${licaiFmtNum(idx.close)}\n` +
          `• 當日：${licaiFmtPct(idx.daily_pct)}\n` +
          `• 本月：${licaiFmtPct(idx.mtd_pct)}\n` +
          `• 今年來：${licaiFmtPct(idx.ytd_pct)}\n\n` +
          `數據為最近收盤，僅供參考、非投資建議 🌸`;
      }
    }
    // 2) 黃金 / 原油（金只認「黃金/金價」，避免吃到「基金」的金）
    if (/黃金|金價|gold|原油|油價|布蘭特|crude|wti|brent/.test(t) && wantsPrice) {
      const cs = m.commodities || [];
      let c = null;
      if (/黃金|金價|gold/.test(t)) c = cs.find(x => /金|gold/i.test(x.name));
      else c = cs.find(x => /油|oil|wti|brent/i.test(x.name));
      if (c) return `${c.name}（收盤 ${c.closing_date || m.closing_date || ""}）\n\n` +
        `• 收盤：${licaiFmtNum(c.close)}\n• 當日：${licaiFmtPct(c.daily_pct)}\n` +
        `• 本月：${licaiFmtPct(c.mtd_pct)}\n• 今年來：${licaiFmtPct(c.ytd_pct)}\n\n僅供參考、非投資建議 🌸`;
    }
    // 3) 美元 / 匯率 / 台幣
    if (/美元|匯率|台幣|新台幣|dxy|usd|twd|exchange/.test(t) && wantsPrice) {
      const fx = m.fx || [];
      const f = fx[0];
      if (f) {
        let s = `匯率與美元（收盤 ${m.closing_date || ""}）💱\n\n`;
        for (const x of fx.slice(0, 4)) s += `• ${x.name}：${licaiFmtNum(x.close)}（當日 ${licaiFmtPct(x.daily_pct)}）\n`;
        return s + `\n僅供參考 🌸`;
      }
    }
    // 4) 美債 / 公債殖利率（live；「殖利率是什麼」定義題交給知識庫）
    if (/美債|公債|十年期|10年|2年|兩年|國債/.test(t) && /殖利率|利率|yield/.test(t)) {
      const bs = m.bonds || [];
      if (bs.length) {
        let s = `美國公債殖利率（收盤 ${m.closing_date || ""}）📉\n\n`;
        for (const b of bs.slice(0, 4)) s += `• ${b.name}：${licaiFmtPct ? Number(b.yield_pct).toFixed(2) + "%" : b.yield_pct}（當日 ${b.daily_bps > 0 ? "+" : ""}${b.daily_bps} bps）\n`;
        const ro = m.rate_outlook;
        if (ro && ro.curve_shape) s += `\n殖利率曲線：${ro.curve_shape}（10Y-2Y 約 ${ro.yield_curve_10y2y_bps} bps）`;
        return s + `\n\n殖利率與價格反向，僅供參考 🌸`;
      }
    }
    // 5) 海外債（個別債券：依名稱／發行人比對）
    if (/債|bond|票息|到期|公司債|主權債/.test(t) || (/殖利率/.test(t) && licaiFindByName((DATA.obonds && DATA.obonds.bonds) || [], t))) {
      const b = licaiFindByName((DATA.obonds && DATA.obonds.bonds) || [], t);
      if (b) {
        const ytm = b.redeem_yield_pct != null ? b.redeem_yield_pct : b.bid_yield_pct;
        let s = `${b.name_zh}${b.code ? "（" + b.code + "）" : ""}　報價 ${b.price_date || ""} 📑\n\n`;
        if (b.issuer) s += `• 發行人：${b.issuer}\n`;
        if (b.coupon_pct != null) s += `• 票面利率：${b.coupon_pct}%\n`;
        if (b.maturity) s += `• 到期日：${b.maturity}\n`;
        if (b.rating) s += `• 信評：${b.rating}\n`;
        if (ytm != null) s += `• 參考殖利率(YTM)：${Number(ytm).toFixed(2)}%\n`;
        if (b.bid_price != null) s += `• 參考買價：${licaiFmtNum(b.bid_price)}（當日 ${licaiFmtPct(b.daily_change_pct)}）\n`;
        return licaiWithRefs(s + `\n債券價格與殖利率反向；數據為最近報價，僅供參考、非投資建議 🌸`, [LICAI_REF.obonds]);
      }
    }
    // 6) 基金（個別基金；或泛問「基金」給精選總覽）
    const fundKw = /基金|fund|淨值|nav|配息|月配|績效/.test(t);
    {
      const allF = [...(((DATA.funds && DATA.funds.funds)) || []), ...(((DATA.popular_funds && DATA.popular_funds.funds)) || [])];
      const fm = licaiFindScored(allF, t);
      const f = (fundKw && fm.score >= 1) || fm.score >= 2 ? fm.item : null; // 帶「基金」字弱配即可；否則需強配(≥2字對)
      if (f) {
        const y1 = licaiPerf1y(f);
        const p = f.perf_single || f.perf || {};
        let s = `${f.name_zh}　淨值 ${f.nav_date || ""} 📊\n\n`;
        if (f.nav != null) s += `• 淨值：${licaiFmtNum(f.nav)} ${f.currency || ""}\n`;
        if (f.change_pct != null) s += `• 當日：${licaiFmtPct(f.change_pct)}\n`;
        if (y1 != null) s += `• 近1年：${licaiFmtPct(y1)}${p["3m"] != null ? "（近3月 " + licaiFmtPct(p["3m"]) + "）" : ""}\n`;
        if (f.distribution_yield_pct != null) s += `• 配息率：${Number(f.distribution_yield_pct).toFixed(2)}%\n`;
        if (f.tagline) s += `• 特色：${f.tagline}\n`;
        let refs = [LICAI_REF.funds];
        if (f.source_url) refs.push(`[🔗 基金淨值/月報來源](${f.source_url})`);
        refs.push(LICAI_REF.sitca);
        return licaiWithRefs(s + `\n過去績效不代表未來；基金有手續費與風險，僅供參考 🌸`, refs);
      }
      // 沒指定具體基金、但有提「基金」字 → 精選基金總覽
      if (fundKw && wantsPrice) {
        const list = ((DATA.funds && DATA.funds.funds) || []).slice(0, 5);
        if (list.length) {
          let s = `精選基金（淨值 ${list[0].nav_date || ""}）📊\n\n`;
          for (const f of list) s += `• ${f.name_zh}｜近1年 ${licaiFmtPct(licaiPerf1y(f))}\n`;
          return licaiWithRefs(s + `\n想看某一檔，直接報名稱（如「聯博美國收益」「富蘭克林公司債」）我給你淨值與績效 🌸`, [LICAI_REF.funds, LICAI_REF.sitca]);
        }
      }
    }
    // 7) 大盤概況 / 今天行情總覽
    if (/行情|盤勢|大盤|今天市場|今日市場|市場概況|整體|總覽|概況/.test(t) && wantsPrice && m.summary) {
      return `市場概況（收盤 ${m.closing_date || ""}）📊\n\n${m.summary}\n\n想看單一市場，問我「台股」「美股」「費半」「日經」等，我給你當日/本月/今年漲跌 🌸`;
    }
    return null;
  } catch (e) { return null; }
}

// 計分配對：命中越精確（關鍵字越長）分數越高，挑最佳那則，解決「第一個命中就回」誤判
function licaiBestKB(t) {
  let best = null, bestScore = 0;
  for (const item of LICAI_KB) {
    let s = 0;
    for (const k of item.keys) {
      const kk = k.toLowerCase();
      if (t.includes(kk)) s += kk.length;
    }
    if (s > bestScore) { bestScore = s; best = item; }
  }
  return best;
}

// ── 參考連結（App 分頁用 tab: 開頭，外部用 https://）──
const LICAI_REF = {
  // App 內部分頁（點了會切過去）
  market: "[➡️ 全球市場分頁](tab:market)",
  funds: "[➡️ 精選基金分頁](tab:funds)",
  obonds: "[➡️ 精選海外債分頁](tab:obonds)",
  alloc: "[➡️ 資產配置分頁](tab:alloc)",
  insurance: "[➡️ 精選保險分頁](tab:insurance)",
  usstocks: "[➡️ 海外股票分頁](tab:usstocks)",
  academy: "[📚 小學堂課程](academy/)",
  // 外部權威網站
  edu: "[🔗 投資人教育網（證基會）](https://www.sfi.org.tw)",
  sitca: "[🔗 投信投顧公會](https://www.sitca.org.tw)",
  twse: "[🔗 臺灣證券交易所](https://www.twse.com.tw)",
  cbc: "[🔗 中央銀行](https://www.cbc.gov.tw)",
  etax: "[🔗 財政部稅務入口網](https://www.etax.nat.gov.tw)",
  trust: "[🔗 信託公會](https://www.trust.org.tw)",
  lia: "[🔗 人壽保險公會](https://www.lia-roc.org.tw)",
  nhi: "[🔗 衛生福利部](https://www.mohw.gov.tw)",
  dgbas: "[🔗 主計總處](https://www.dgbas.gov.tw)",
};
// 知識庫每則的延伸連結（key＝該則 keys[0]）
const LICAI_KB_REFS = {
  "複利": [LICAI_REF.academy, LICAI_REF.edu],
  "定期定額": [LICAI_REF.academy, LICAI_REF.edu],
  "etf": [LICAI_REF.funds, LICAI_REF.edu],
  "資產配置": [LICAI_REF.alloc, LICAI_REF.academy],
  "風險分散": [LICAI_REF.academy, LICAI_REF.edu],
  "停利": [LICAI_REF.academy, LICAI_REF.edu],
  "緊急預備金": [LICAI_REF.academy],
  "通膨怎麼辦": [LICAI_REF.academy, LICAI_REF.cbc],
  "基金在哪": [LICAI_REF.funds, LICAI_REF.sitca],
  "海外債": [LICAI_REF.obonds],
  "投組": [LICAI_REF.alloc],
  "保險在哪": [LICAI_REF.insurance, LICAI_REF.lia],
  "小學堂": [LICAI_REF.academy],
  "贈與稅": [LICAI_REF.etax],
  "遺產稅": [LICAI_REF.etax],
  "信託": [LICAI_REF.trust],
  "保單規劃": [LICAI_REF.lia],
  "二代健保": [LICAI_REF.nhi],
  "殖利率": [LICAI_REF.twse, LICAI_REF.edu],
  "本益比": [LICAI_REF.twse, LICAI_REF.edu],
  "通膨": [LICAI_REF.cbc, LICAI_REF.dgbas],
  "升息": [LICAI_REF.cbc],
  "殖利率倒掛": [LICAI_REF.edu],
  "gdp": [LICAI_REF.dgbas],
};
function licaiWithRefs(reply, refs) {
  if (!refs || !refs.length) return reply;
  return reply + "\n\n🔎 延伸參考：\n" + refs.join("\n");
}

function licaiReply(text) {
  const t = (text || "").toLowerCase().trim();
  if (!t) return "想問什麼都可以跟我說 🌸";

  // 1) 今日真實數據（讀 App 內的 market 資料；只在問行情時觸發）
  const live = licaiLiveReply(t);
  if (live) return live.includes("🔎 延伸參考") ? live : licaiWithRefs(live, [LICAI_REF.market, LICAI_REF.twse]);

  // 2) 知識庫：計分挑最精準的一則
  const hit = licaiBestKB(t);
  if (hit) return licaiWithRefs(hit.reply, LICAI_KB_REFS[hit.keys[0]]);

  // 3) 主題偵測 fallback（命中大方向、給明確去處）
  if (t.includes("基金")) return "想了解基金的話，可以去「精選基金」分頁看單筆、定期定額與績效比較。也可以問我「定期定額怎麼做」「ETF 是什麼」🌸";
  if (t.includes("債")) return "債券相關可以看「精選海外債」分頁，或問我「殖利率是什麼」「殖利率倒掛」，我來白話解釋 📑";
  if (t.includes("股") || t.includes("股票")) return "股票相關可以問我「本益比是什麼」「ETF」「資產配置」，問「今天台股」「美股表現」我給你當日數據，或去「海外股票」「全球市場」分頁看行情 📈";
  if (t.includes("稅") || t.includes("傳承") || t.includes("贈與") || t.includes("遺產")) return "傳承稅務的問題我可以幫你白話說明，例如「贈與稅免稅額」「遺產稅」「信託」「保單規劃」。詳細方案建議再找傳承顧問評估 ⚖️";
  if (t.includes("保險") || t.includes("保障")) return "保險可以去「精選保險」分頁做保障缺口試算，或問我相關概念。正式保額建議洽持牌業務員 🛡️";

  // 4) 沒收錄：明確告知＋給四大類方向（不再隨機丟引導語）
  return "這題我可能還沒收錄到 🙏 我比較拿手的是這四類：\n\n" +
    "1️⃣ 理財觀念｜複利、定期定額、ETF、資產配置…\n" +
    "2️⃣ App 怎麼用｜基金在哪、投組分析、保障缺口…\n" +
    "3️⃣ 傳承稅務｜贈與稅、遺產稅、信託、保單規劃…\n" +
    "4️⃣ 今日行情｜問「台股」「美股」「費半」「黃金」「美元」給你當日數據\n\n" +
    "換個說法或從這四類問我，我來幫你拆解 🌸";
}

function renderChatSheet() {
  return `
<style>
  #content[data-section="chat"] { height: calc(100dvh - var(--chat-top, 150px) - var(--chat-tabbar, 72px)); overflow: hidden; padding-bottom: 0; display: flex; flex-direction: column; }
  #content[data-section="chat"] ~ .home-fab { display: none !important; }
  .lc-chat-wrap { max-width: 640px; width: 100%; margin: 0 auto; height: 100%; display: flex; flex-direction: column; background: transparent; min-height: 0; }
  .lc-chat-header { flex: 0 0 auto; }
  .lc-suggest, .lc-input-row { flex: 0 0 auto; }
  .lc-chat-header { padding: 12px 4px 14px; background: transparent; color: var(--text); display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border); }
  .lc-chat-avatar { background: linear-gradient(135deg, #2aa6d6, var(--brand-deep)) !important; color: #fff; font-weight: 800; font-size: 22px; }
  .lc-chat-hname { color: var(--text) !important; }
  .lc-chat-hsub { color: var(--text-mute) !important; opacity: 1 !important; }
  .lc-chat-reset { background: var(--bg-alt) !important; color: var(--brand-deep) !important; border: 1px solid var(--border) !important; }
  .lc-chat-avatar { width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,.22); display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
  .lc-chat-hinfo { flex: 1; min-width: 0; }
  .lc-chat-hname { font-weight: 700; font-size: 15px; }
  .lc-chat-hsub { font-size: 12px; opacity: .9; }
  .lc-chat-reset { background: rgba(255,255,255,.25); border: none; border-radius: 18px; padding: 6px 12px; color: #fff; font-size: 12px; cursor: pointer; white-space: nowrap; }
  .lc-chat-msgs { flex: 1 1 auto; min-height: 0; overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 16px 2px; display: flex; flex-direction: column; gap: 12px; background: transparent; }
  .lc-row { display: flex; flex-direction: column; }
  .lc-row.me { align-items: flex-end; }
  .lc-row.bot { align-items: flex-start; }
  .lc-label { font-size: 11px; font-weight: 600; color: var(--text-mute); margin-bottom: 3px; }
  .lc-bubble { max-width: 80%; padding: 11px 14px; border-radius: 16px; font-size: 14px; line-height: 1.7; word-break: break-word; white-space: normal; }
  .lc-bubble.me { background: var(--brand-primary); color: #fff; border-bottom-right-radius: 4px; }
  .lc-bubble.bot { background: var(--surface); color: var(--text); border: 1px solid var(--border); border-bottom-left-radius: 4px; }
  .lc-bubble.bot .lc-link { display: inline-block; margin-top: 2px; color: var(--brand-deep); font-weight: 600; text-decoration: none; border-bottom: 1.5px solid var(--brand-primary); padding-bottom: 1px; }
  .lc-bubble.bot .lc-link:active { opacity: .6; }
  .lc-suggest { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px 2px; background: transparent; border-top: 1px solid var(--border); }
  .lc-chip { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 6px 12px; font-size: 12px; color: var(--brand-deep); cursor: pointer; }
  .lc-chip:active { background: var(--surface-hover); }
  .lc-input-row { display: flex; gap: 8px; padding: 12px 2px 4px; border-top: 1px solid var(--border); background: transparent; }
  .lc-input { flex: 1; border: 1.5px solid var(--border); border-radius: 20px; padding: 9px 14px; font-size: 14px; font-family: inherit; outline: none; background: var(--bg); color: var(--text); }
  .lc-input:focus { border-color: var(--brand-primary); }
  .lc-voice { background: var(--bg); border: 1.5px solid var(--border); border-radius: 50%; width: 40px; height: 40px; font-size: 18px; cursor: pointer; flex-shrink: 0; }
  .lc-voice.listening { border-color: var(--brand-primary); animation: lcpulse 1s infinite; }
  @keyframes lcpulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }
  .lc-send { background: var(--brand-primary); color: #fff; border: none; border-radius: 20px; padding: 9px 18px; font-size: 14px; font-weight: 600; cursor: pointer; white-space: nowrap; }
  .lc-send:disabled { opacity: .45; cursor: not-allowed; }
  .lc-typing { display: flex; gap: 4px; padding: 11px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; border-bottom-left-radius: 4px; width: fit-content; }
  .lc-typing span { width: 7px; height: 7px; background: var(--brand-secondary); border-radius: 50%; animation: lcbounce 1.2s infinite; }
  .lc-typing span:nth-child(2){animation-delay:.2s} .lc-typing span:nth-child(3){animation-delay:.4s}
  @keyframes lcbounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-6px)} }
  .lc-foot { flex: 0 0 auto; margin: 6px 2px 0; font-size: 10px; color: var(--text-mute); line-height: 1.5; text-align: center; }
</style>
<div class="lc-chat-wrap">
  <div class="lc-chat-msgs" id="lcMsgs">
    <div class="lc-row bot">
      <div class="lc-label">小幫手</div>
      <div class="lc-bubble bot">嗨！我是你的理財小幫手 🌸<br>可以問我理財觀念（複利、定期定額、ETF…）、這個 App 怎麼用、傳承稅務常識，或財經名詞解釋。<br>下面點一下，或直接打字問我都行！</div>
    </div>
  </div>
  <div class="lc-suggest" id="lcSuggest">
    <button class="lc-chip" type="button">複利是什麼</button>
    <button class="lc-chip" type="button">定期定額怎麼做</button>
    <button class="lc-chip" type="button">ETF 是什麼</button>
    <button class="lc-chip" type="button">殖利率是什麼</button>
    <button class="lc-chip" type="button">贈與稅免稅額</button>
    <button class="lc-chip" type="button">基金在哪</button>
  </div>
  <div class="lc-input-row">
    <button class="lc-voice" id="lcVoice" type="button" title="語音輸入">🎤</button>
    <input class="lc-input" id="lcInput" type="text" placeholder="問我理財問題…" autocomplete="off">
    <button class="lc-send" id="lcSend" type="button">送出</button>
  </div>
  <p class="lc-foot">本問答僅供理財教育與工具導覽參考，不構成投資建議；傳承稅務內容請以個案及現行法令為準。</p>
</div>
`;
}

// 把 [文字](網址) 轉成可點連結；tab:xxx＝切 App 分頁，其餘開新分頁
function chatRenderRich(text) {
  let h = escapeHtml(text);
  h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, url) => {
    if (/^tab:/.test(url)) {
      const tab = url.slice(4).replace(/[^a-z]/gi, "");
      return `<a href="#" class="lc-link" data-tab="${tab}">${label}</a>`;
    }
    const safe = /^(https?:\/\/|academy\/|\.?\/)/.test(url) ? url : "#";
    return `<a href="${safe}" class="lc-link" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });
  return h.replace(/\n/g, "<br>");
}

function chatAppendMsg(role, text) {
  const msgs = $("lcMsgs");
  if (!msgs) return;
  const isBot = role === "bot";
  const row = document.createElement("div");
  row.className = "lc-row " + (isBot ? "bot" : "me");
  const label = document.createElement("div");
  label.className = "lc-label";
  label.textContent = isBot ? "小幫手" : "我";
  const bubble = document.createElement("div");
  bubble.className = "lc-bubble " + (isBot ? "bot" : "me");
  bubble.innerHTML = isBot ? chatRenderRich(text) : escapeHtml(text).replace(/\n/g, "<br>");
  row.appendChild(label);
  row.appendChild(bubble);
  msgs.appendChild(row);
  msgs.scrollTop = msgs.scrollHeight;
}

function chatShowTyping() {
  const msgs = $("lcMsgs");
  if (!msgs) return;
  const row = document.createElement("div");
  row.className = "lc-row bot";
  row.id = "lcTyping";
  row.innerHTML = '<div class="lc-label">小幫手</div><div class="lc-typing"><span></span><span></span><span></span></div>';
  msgs.appendChild(row);
  msgs.scrollTop = msgs.scrollHeight;
}

function chatRemoveTyping() {
  const t = $("lcTyping");
  if (t) t.remove();
}

function chatSend(textArg) {
  const input = $("lcInput");
  const btn = $("lcSend");
  const text = (textArg != null ? textArg : (input ? input.value : "")).trim();
  if (!text) return;
  if (input) input.value = "";
  if (btn) btn.disabled = true;
  chatAppendMsg("me", text);
  chatShowTyping();
  const delay = 600 + Math.floor(Math.random() * 500);
  setTimeout(() => {
    chatRemoveTyping();
    chatAppendMsg("bot", licaiReply(text));
    if (btn) btn.disabled = false;
    if (input) input.focus();
  }, delay);
}

function chatStartVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const btn = $("lcVoice");
  if (!SR) {
    chatAppendMsg("bot", "這個瀏覽器不支援語音輸入，請改用文字輸入 🌸（建議用 Safari 或 Chrome）");
    return;
  }
  if (btn && btn.classList.contains("listening")) return;
  const recog = new SR();
  recog.lang = "zh-TW";
  recog.interimResults = false;
  recog.maxAlternatives = 1;
  if (btn) btn.classList.add("listening");
  recog.start();
  recog.onresult = (e) => {
    const text = e.results[0][0].transcript;
    if (btn) btn.classList.remove("listening");
    chatSend(text);
  };
  recog.onerror = () => { if (btn) btn.classList.remove("listening"); };
  recog.onend = () => { if (btn) btn.classList.remove("listening"); };
}

function chatLayout() {
  const c = $("content");
  if (!c || c.dataset.section !== "chat") return;
  const top = Math.max(0, Math.round(c.getBoundingClientRect().top));
  const tb = document.getElementById("tabbar");
  const tbh = (tb && getComputedStyle(tb).display !== "none") ? tb.offsetHeight : 0;
  c.style.setProperty("--chat-top", top + "px");
  c.style.setProperty("--chat-tabbar", (tbh + 10) + "px");
}

function wireChat() {
  chatLayout();
  if (!window._lcLayoutBound) {
    window._lcLayoutBound = true;
    window.addEventListener("resize", chatLayout);
    window.addEventListener("orientationchange", () => setTimeout(chatLayout, 200));
  }
  const send = $("lcSend");
  const input = $("lcInput");
  const voice = $("lcVoice");
  const reset = $("lcReset");
  const suggest = $("lcSuggest");
  if (send) send.addEventListener("click", () => chatSend());
  if (input) input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); chatSend(); } });
  if (voice) voice.addEventListener("click", chatStartVoice);
  if (reset) reset.addEventListener("click", () => switchTab("chat"));
  if (suggest) suggest.addEventListener("click", (e) => {
    const chip = e.target.closest(".lc-chip");
    if (chip) chatSend(chip.textContent);
  });
  // 訊息裡的「App 分頁」連結：切到該分頁並關閉聊聊彈窗
  const msgs = $("lcMsgs");
  if (msgs && !msgs._lcLinkBound) {
    msgs._lcLinkBound = true;
    msgs.addEventListener("click", (e) => {
      const a = e.target.closest("a.lc-link[data-tab]");
      if (!a) return;
      e.preventDefault();
      const popup = document.getElementById("chat-popup");
      if (popup && popup.classList.contains("open")) {
        popup.classList.remove("open");
        const fab = document.getElementById("chat-fab");
        if (fab) fab.setAttribute("aria-expanded", "false");
      }
      switchTab(a.getAttribute("data-tab"));
    });
  }
  if (input) setTimeout(() => input.focus(), 80);
}

init();
