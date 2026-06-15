// Morning Board app
const $ = (id) => document.getElementById(id);

const INDEX_NAMES = {
  "TAIEX": "加權指數",
  "TAIEX 加權指數": "加權指數",
  "S&P 500": "標普 500",
  "Nasdaq": "那斯達克",
  "Nasdaq Composite": "那斯達克",
  "Dow Jones": "道瓊",
  "PHLX Semiconductor": "費城半導體",
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
  "CAC 40": "^FCHI"
};

function quoteSuffix(url) {
  if (!url) return "";
  return ` <a href="${url}" target="_blank" rel="noopener" class="quote-link" title="開啟即時行情頁">即時行情</a>`;
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
  funds: ["funds", "dca", "beatetf", "fund_compare"],
  obonds: ["overseas_bonds", "overseas_bonds_all"],
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
    idx.push({ tab: "targets", tabLabel: "主題市場", title: t.name || t.key, text: txt });
  }
  // 主題相關基金
  for (const f of (DATA.targets?.theme_funds || [])) {
    idx.push({ tab: "targets", tabLabel: `主題市場 · ${f.theme || ""}`, title: f.bop_name_zh || f.name_zh || "", text: f.tagline || "" });
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
    panel.style.top = (r.bottom + 4) + "px";
    panel.style.left = r.left + "px";
    panel.style.width = r.width + "px";
  };
  const doSearch = (q) => {
    if (!q.trim()) { panel.hidden = true; panel.innerHTML = ""; return; }
    if (!SEARCH_INDEX || !SEARCH_INDEX.length) {
      // 首次輸入時若 index 還空，現場建一次
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
  // 視窗/捲動時若面板開著就重算位置
  const repositionIfOpen = () => { if (!panel.hidden) positionPanel(); };
  window.addEventListener("resize", repositionIfOpen);
  window.addEventListener("scroll", repositionIfOpen, true);
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
  const [meta, market, news, tax, funds, stocks, popular, stock_brief, insurance, obonds, obonds_all, targets, allocation, dca, wealth, beatetf, presets, fund_compare, tw_stocks, rankings, quotes_built_at, premarket] = await Promise.all([
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
  ]);
  DATA = { meta, market, news, tax, funds, stocks, popular, stock_brief, insurance, obonds, obonds_all, targets, allocation, dca, wealth, beatetf, presets, fund_compare, tw_stocks, rankings, quotes_built_at, premarket };
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
  else if (name === "news") body.innerHTML = renderNewsSheet();
  else if (name === "funds") body.innerHTML = renderFundsSheet();
  else if (name === "insurance") body.innerHTML = renderInsuranceSheet();
  else if (name === "obonds") body.innerHTML = renderObondsSheet();
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
  else if (name === "calc") body.innerHTML = renderCalcSheet();
  else if (name === "twstock") body.innerHTML = renderTwStockSheet();
  if (name === "news") wireNewsTabs();
  if (name === "market") { wireMarketViewTabs(); wireMarketTabs(); wireTwStock(); }
  if (name === "funds") { wireFundsTabs(); wireFundCompare(); }
  if (name === "alloc") wireAllocTabs();
  if (name === "wealth") wireWealthTabs();
  if (name === "calc") wireCalcTabs();
  if (name === "twstock") wireTwStock();
  if (name === "obonds") { SWAP_PICK = { old: null, new: null }; wireObondsTabs(); }
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
    if (e.target.closest(".main-tab") && document.body.classList.contains("nav-open")) {
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
  const [meta, market, news, tax, funds, stocks, popular, stock_brief, insurance, obonds, obonds_all, targets, allocation, dca, wealth, beatetf, presets, fund_compare, tw_stocks, rankings, quotes_built_at, premarket] = await Promise.all([
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
  ]);
  DATA = { meta, market, news, tax, funds, stocks, popular, stock_brief, insurance, obonds, obonds_all, targets, allocation, dca, wealth, beatetf, presets, fund_compare, tw_stocks, rankings, quotes_built_at, premarket };
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
  const isTargets = !isPortfolio && !isAssist;
  const inner = isPortfolio ? renderPortfolioSheet()
    : isAssist ? renderAssistSheet()
    : renderTargetsSheet();
  return `
    <div class="tabs alloc-sec-tabs">
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
  // 連動目前選取 section 內層的次分頁事件
  if (ALLOC_SUBTAB === "portfolio") wirePortfolioTabs();
  else if (ALLOC_SUBTAB === "assist") wireAssistTab();
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

  // Tab buttons（不顯示編號）
  const tabBtns = list.map((t, i) => `
    <button class="tab ${i === 0 ? "active" : ""}" data-ttab="${escapeHtml(t.key)}">
      ${escapeHtml(t.name)}
    </button>
  `).join("");

  // Tab panes（不顯示編號）
  const panes = list.map((t, i) => {
    return `
    <div class="t-pane ${i === 0 ? "active" : ""}" id="t-pane-${escapeHtml(t.key)}">
      <div class="t-head">
        <div>
          <div class="t-name">${escapeHtml(t.name)}</div>
          <div class="t-tagline">${escapeHtml(t.tagline || "")}</div>
        </div>
      </div>

      <div class="t-stats">
        ${(t.stats || []).map(s => {
          const valTxt = escapeHtml(s.v);
          const val = s.url
            ? `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">${valTxt}</a>`
            : valTxt;
          return `
          <div class="t-stat">
            <div class="t-stat-k">${escapeHtml(s.k)}</div>
            <div class="t-stat-v ${signClassFromStr(s.v)}">${val}</div>
            <div class="t-stat-sub">${escapeHtml(s.sub || "")}</div>
          </div>
        `;
        }).join("")}
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
    <div class="tabs tabs-wrap tabs-left">${tabBtns}</div>
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
  const buttons = document.querySelectorAll(".tab[data-ttab]");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.ttab;
      buttons.forEach(b => b.classList.toggle("active", b.dataset.ttab === key));
      document.querySelectorAll(".t-pane").forEach(p => {
        p.classList.toggle("active", p.id === `t-pane-${key}`);
      });
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
        <ul style="margin:10px 0 0; padding-left:18px; font-size:14px; line-height:1.7">
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

function renderMarketSheet() {
  const m = DATA.market;
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

  const bondsTab = bondRows ? `
    <table class="indices freeze-col1">
      <thead><tr>
        <th title="點名稱可開 MoneyDJ 圖表頁驗證">債別</th>
        <th class="sortable-th" title="到期殖利率（YTM, %）｜來源：FRED (US) / 各國央行 / Yahoo Finance；點選排序">殖利率</th>
        <th class="sortable-th" title="日變動 bps｜定義：今日 yield − 昨日 yield｜來源：FRED；點選排序">日變動</th>
        <th class="sortable-th" title="MTD 變動 bps｜定義：當月首交易日 yield → 最新 yield｜來源：FRED；點選排序">本月變動</th>
        <th class="date-col" title="債券殖利率公告日">收盤日</th>
      </tr></thead>
      <tbody>${bondRows}</tbody>
    </table>` : `<p style="color:var(--text-mute); padding:20px 0">尚未提供公債資料</p>`;

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
    <div class="tabs">
      <button class="tab active" data-mvtab="premarket">盤前分析</button>
      <button class="tab" data-mvtab="overview">市場一覽</button>
    </div>
    <div id="mvtab-premarket">
      ${renderPremarketBlock()}
    </div>
    <div id="mvtab-overview" hidden>
      ${renderMarketHighlights(m)}

      <div class="tabs">
        <button class="tab active" data-mtab="indices">全球</button>
        <button class="tab" data-mtab="bonds">債券</button>
        <button class="tab" data-mtab="fx">匯率</button>
        <button class="tab" data-mtab="us">美股</button>
        <button class="tab" data-mtab="tw">台股</button>
        <button class="tab" data-mtab="twstock">台股（個股）</button>
      </div>
      <div id="mtab-indices">${stocksTab}</div>
      <div id="mtab-bonds" hidden>${bondsTab}</div>
      <div id="mtab-fx" hidden>${fxTab}</div>
      <div id="mtab-us" hidden>${usTab}</div>
      <div id="mtab-tw" hidden>${twPresetTable}</div>
      <div id="mtab-twstock" hidden>${renderTwStockSheet()}${renderRankingsBlock("tw")}</div>
    </div>
  `;
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
    ${renderStocksTable("", curated)}
  ` : "";
  const popularBlock = popular.length ? `
    <h2 style="font-size:16px; margin:18px 0 8px;">熱門海外股票</h2>
    <p style="color:var(--text-mute); font-size:12px; margin:0 0 8px;">資料來源：Yahoo Finance trending（流動性過低個股已過濾），每次 build 重抓。</p>
    ${renderStocksTable("", popular)}
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
  return note + curatedBlock + popularBlock + renderStockBriefBlock() + moreSection;
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
    <table class="tw-quote-table" style="width:100%;border-collapse:collapse;font-size:13.5px;min-width:520px">
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
    <table class="tw-quote-table" style="width:100%;border-collapse:collapse;font-size:13.5px;min-width:520px">
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
    <table class="tw-quote-table" style="width:100%;border-collapse:collapse;font-size:13.5px;min-width:520px">
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
      <table style="width:100%;border-collapse:collapse;font-size:13.5px">
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
      <table style="width:100%;border-collapse:collapse;font-size:13.5px">
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
    <table class="tw-quote-table" style="width:100%;border-collapse:collapse;font-size:13.5px;min-width:520px">
      <tr style="background:#F2F8FA"><td style="padding:8px 12px;width:30%"><b>MOPS</b></td><td style="padding:8px 12px">${lnk("https://mops.twse.com.tw", "mops.twse.com.tw")} — 第一手揭露</td></tr>
      <tr><td style="padding:8px 12px"><b>TWSE</b></td><td style="padding:8px 12px">${lnk("https://www.twse.com.tw", "www.twse.com.tw")} — 行情、籌碼</td></tr>
      <tr style="background:#F2F8FA"><td style="padding:8px 12px"><b>Goodinfo!</b></td><td style="padding:8px 12px">${lnk("https://goodinfo.tw", "goodinfo.tw")} — 個股資料總覽（二手，僅供發現）</td></tr>
      <tr><td style="padding:8px 12px"><b>財報狗</b></td><td style="padding:8px 12px">${lnk("https://statementdog.com", "statementdog.com")} — 財報視覺化</td></tr>
      <tr style="background:#F2F8FA"><td style="padding:8px 12px"><b>CMoney</b></td><td style="padding:8px 12px">${lnk("https://cmoney.tw", "cmoney.tw")} — 法人籌碼</td></tr>
    </table>
    </div>
    <p style="color:var(--text-mute);font-size:12.5px;margin:10px 0 4px">二手網站只用來「快速發現」，最終決策必回 MOPS／TWSE 對原始資料。</p>

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

function renderStocksTable(title, list) {
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
      <td>${fmtPE(s.per, s.per_kind)}</td>
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
      <colgroup><col class="c-name"><col class="c-num"><col class="c-num"><col class="c-num"><col class="c-num"><col class="c-num"><col class="c-num"></colgroup>
      <thead><tr>
        <th>名稱</th>
        <th class="sortable-th" title="收盤價，來源見名稱欄連結；點選排序">收盤</th>
        <th class="sortable-th" title="本益比（近四季 trailing，來源：finnhub）；點選排序">本益比</th>
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
    </tr>`).join("");

  return `
    <table class="indices ranking-table">
      ${showPE
        ? `<colgroup><col style="width:7%"><col style="width:22%"><col style="width:14%"><col style="width:11%"><col style="width:11%"><col style="width:11%"><col style="width:11%"><col style="width:13%"></colgroup>`
        : `<colgroup><col style="width:8%"><col style="width:30%"><col style="width:18%"><col style="width:14%"><col style="width:14%"><col style="width:16%"></colgroup>`}
      <thead><tr>
        <th style="text-align:center">排名</th><th style="text-align:left">名稱</th>
        <th class="sortable-th" title="收盤價；點選排序">收盤</th>
        ${showPE ? `<th class="sortable-th" title="本益比（近四季 trailing；「預」=預估 forward）；點選排序">本益比</th>` : ""}
        <th class="sortable-th" title="當日漲跌；點選排序">日</th>
        <th class="sortable-th" title="本月至今(MTD)；點選排序">本月</th>
        <th class="sortable-th" title="今年至今(YTD)；點選排序">本年</th>
        ${showCap ? `<th class="sortable-th mcap" title="市值；點選排序">市值</th>` : ""}
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
          ${renderRankingTable(items, { showMarketCap: cap, showPE: pe })}
        `).join("")}
      <p style="color:var(--text-mute);font-size:12px;margin:10px 0 0">
        當日全市場掃描；點名稱可至 Yahoo／TWSE 驗證。本月=MTD，本年=YTD。本益比為近四季（trailing），「預」=預估值（forward）。</p>
    </div>`;
}

function renderPremarketBlock() {
  const p = DATA.premarket;
  if (!p) return `<p style="color:var(--text-mute);padding:32px 0;text-align:center">今日尚無盤前分析資料</p>`;

  const pmDate = shortDate((p.generated_at || "").slice(0, 10));
  const indicatorRows = (p.indicators || []).map(ind => {
    const price = ind.price;
    const pct   = ind.pct;
    const priceStr = price == null || isNaN(price) ? "—"
      : ind.label === "VIX"                              ? price.toFixed(1)
      : ind.label === "DXY" || ind.label === "USD/TWD"  ? price.toFixed(2)
      : Math.round(price).toLocaleString("en-US");
    const pctStr = pct == null || isNaN(pct) ? "—" :
      (pct >= 0 ? `+${pct.toFixed(2)}%` : `${pct.toFixed(2)}%`);
    const cls = pct == null ? "" : pct >= 0 ? "up" : "down";
    return `
      <tr>
        <td>${escapeHtml(ind.label)}</td>
        <td style="font-variant-numeric:tabular-nums">${escapeHtml(priceStr)}</td>
        <td class="${cls}" style="font-variant-numeric:tabular-nums">${escapeHtml(pctStr)}</td>
        <td class="date-col">${escapeHtml(ind.date ? shortDate(ind.date) : pmDate)}</td>
      </tr>`;
  }).join("");
  const indicatorTable = `
    <table class="indices" style="margin-top:4px;table-layout:fixed;width:100%">
      <colgroup>
        <col style="width:38%">
        <col style="width:24%">
        <col style="width:22%">
        <col style="width:16%">
      </colgroup>
      <thead><tr>
        <th>指數</th>
        <th>收盤</th>
        <th>日漲跌</th>
        <th class="date-col">收盤日</th>
      </tr></thead>
      <tbody>${indicatorRows}</tbody>
    </table>`;


  // Split analysis: first paragraph = 今日判斷 summary, rest = detail
  const analysisParts = (() => {
    const lines = (p.analysis || "").split("\n").filter(l => l.trim() && l.trim() !== "---");
    let summaryEnd = 0;
    for (let i = 0; i < lines.length; i++) {
      if (i > 0 && lines[i].startsWith("【") && lines[i].includes("】")) { summaryEnd = i; break; }
      summaryEnd = i + 1;
    }
    return { summary: lines.slice(0, summaryEnd), detail: lines.slice(summaryEnd) };
  })();

  const renderLines = lines => {
    const out = [];
    let i = 0;
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
        out.push(`<p style="margin:10px 0 2px;line-height:1.8"><strong style="color:var(--brand)">${tag}</strong></p>${body ? `<p style="margin:0 0 6px;line-height:1.8">${escapeHtml(body)}</p>` : ""}`);
      } else {
        out.push(`<p style="margin:6px 0;line-height:1.8">${escapeHtml(l)}</p>`);
      }
      i++;
    }
    return out.join("");
  };

  const summaryHtml = renderLines(analysisParts.summary);
  const detailHtml = analysisParts.detail.length ? renderLines(analysisParts.detail) : "";

  return `
    <div class="fund-card" style="margin-bottom:8px">
      ${indicatorTable}
    </div>
    ${summaryHtml ? `<div class="fund-card" style="margin-bottom:8px">${summaryHtml}</div>` : ""}
    ${detailHtml ? `<div class="fund-card">${detailHtml}</div>` : ""}
  `;
}

function renderMarketHighlights(m) {
  const ix = (m.indices || []).filter(i => i.daily_pct !== null && i.daily_pct !== undefined);
  if (!ix.length) return "";
  const fmt = i => `${escapeHtml(indexLabel(i.name))} ${fmtPct(i.daily_pct)}`;
  const ups = ix.slice().sort((a, b) => b.daily_pct - a.daily_pct).filter(i => i.daily_pct > 0).slice(0, 3);
  const downs = ix.slice().sort((a, b) => a.daily_pct - b.daily_pct).filter(i => i.daily_pct < 0).slice(0, 3);
  const tldr = (DATA.news && DATA.news.tldr) ? DATA.news.tldr.slice(0, 5) : [];

  return `
    <h3>今日重點</h3>
    <div class="fund-card">
      <ul style="font-size:14px; line-height:1.8; padding-left:20px; margin:0">
        ${ups.length ? `<li><strong class="up">領漲</strong>：${ups.map(fmt).join("、")}</li>` : ""}
        ${downs.length ? `<li><strong class="down">領跌</strong>：${downs.map(fmt).join("、")}</li>` : ""}
      </ul>
    </div>

    ${tldr.length ? `
      <div class="fund-card">
        <ul style="font-size:14px; line-height:1.7; padding-left:20px; margin:0">
          ${tldr.map(t => `<li>${escapeHtml(t)}</li>`).join("")}
        </ul>
      </div>` : ""}
  `;
}

function renderNewsSheet() {
  const today = (DATA.meta && DATA.meta.today) || "";
  const newsDate = (DATA.news && DATA.news.news_date) || "";
  const isStale = today && newsDate && newsDate !== today;
  const staleBanner = isStale ? `
    <div style="background:#fff4e6; border:1px solid #ffb74d; border-radius:6px; padding:10px 14px; margin-bottom:12px; color:#5a3a00; font-size:14px; line-height:1.5">
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
  const sections = (DATA.news.sections || [])
    .filter(s => sectionCategory(s) === cat);
  let html = sections.map(s => {
    const items = (s.items || []).filter(it => it.title_zh);
    if (!items.length) return "";
    const sectionTitle = s.section_zh || s.section;
    return `
      <h3 style="color:var(--brand-deep); margin-top:18px">${escapeHtml(sectionTitle)}</h3>
      ${items.map(it => `
        <div class="news-item">
          <h3>${escapeHtml(it.title_zh)}</h3>
          ${newsBodyHtml(it)}
          ${it.source_url ? `<a class="source" href="${it.source_url}" target="_blank" rel="noopener">${escapeHtml(it.source_name || "來源")}</a>` : ""}
        </div>
      `).join("")}
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
            <h3>${escapeHtml(it.title)}</h3>
            <div class="summary">${escapeHtml(it.summary)}</div>
            ${it.source_url ? `<a class="source" href="${it.source_url}" target="_blank" rel="noopener">${escapeHtml(it.source_name || "來源")}</a>` : ""}
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
      <button class="tab" data-ftab="compare">基金績效比較</button>
    </div>
    <div id="ftab-lump">${renderLumpFundCards()}</div>
    <div id="ftab-dca" hidden>${renderDcaFundCards()}</div>
    <div id="ftab-beatetf" hidden>${renderBeatEtfCards()}</div>
    <div id="ftab-compare" hidden>${renderFundCompare()}</div>
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
  document.querySelectorAll(".tab").forEach(t => {
    t.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
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
.assist-wrap { max-width: 1100px; margin: 0 auto; padding: 16px; }
.assist-banner {
  background: linear-gradient(90deg, #019AB3, #17B5AD);
  color: white; padding: 14px 18px; border-radius: 8px; margin-bottom: 16px;
}
.assist-banner h2 { margin: 0 0 4px; font-size: 17px; font-weight: 600; }
.assist-banner p { margin: 0; font-size: 12px; opacity: 0.9; }
.assist-compliance {
  background: #fff7ed; border-left: 4px solid #f97316;
  padding: 12px 16px; margin-bottom: 16px; border-radius: 6px;
  font-size: 12px; color: #7c2d12;
}
.assist-compliance strong { display: block; margin-bottom: 6px; color: #c2410c; font-size: 13px; }
.assist-compliance ul { margin: 0; padding-left: 18px; line-height: 1.7; }
.assist-prompt-out {
  background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px;
  padding: 12px; font-family: ui-monospace, "SF Mono", Consolas, monospace;
  font-size: 11px; line-height: 1.5; white-space: pre-wrap; word-break: break-word;
  max-height: 240px; overflow-y: auto; margin: 8px 0;
}
.assist-btn-row { display: flex; gap: 8px; flex-wrap: wrap; margin: 8px 0; }
.assist-btn-row button, .assist-btn-row a {
  padding: 10px 14px; border-radius: 4px; font-size: 13px; font-weight: 600;
  cursor: pointer; border: 0; text-decoration: none; text-align: center; display: inline-block;
}
.assist-btn-primary { background: #019AB3; color: white; flex: 1; }
.assist-btn-primary:hover { background: #017d92; }
.assist-btn-secondary { background: white; color: #019AB3; border: 1px solid #019AB3 !important; flex: 1; }
.assist-btn-secondary:hover { background: #f0fdfa; }
.assist-step-num {
  display: inline-block; background: #019AB3; color: white;
  width: 22px; height: 22px; line-height: 22px; text-align: center;
  border-radius: 50%; font-size: 12px; margin-right: 6px; font-weight: 600;
}
.assist-step-title { font-size: 13px; font-weight: 600; color: #1e293b; margin: 14px 0 6px; }
.assist-paste-area {
  width: 100%; min-height: 140px; padding: 10px; border: 1px solid #cbd5e1;
  border-radius: 4px; font-family: ui-monospace, "SF Mono", Consolas, monospace;
  font-size: 11px; line-height: 1.5; box-sizing: border-box; resize: vertical;
}
.assist-dev-badge {
  display: inline-block; background: #fbbf24; color: #78350f; padding: 2px 8px;
  border-radius: 3px; font-size: 10px; margin-left: 8px; font-weight: 600;
}
.assist-grid { display: grid; grid-template-columns: 1fr 1.4fr; gap: 16px; }
@media (max-width: 900px) { .assist-grid { grid-template-columns: 1fr; } }
.assist-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; }
.assist-card h3 { margin: 0 0 12px; font-size: 14px; color: #019AB3; border-bottom: 2px solid #019AB3; padding-bottom: 6px; }
.assist-field { margin-bottom: 10px; }
.assist-field label { display: block; font-size: 12px; color: #475569; margin-bottom: 4px; font-weight: 500; }
.assist-field select, .assist-field input, .assist-field textarea {
  width: 100%; padding: 7px 10px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 13px; font-family: inherit; box-sizing: border-box;
}
.assist-field textarea { resize: vertical; min-height: 60px; }
.assist-existing { display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; }
.assist-existing label { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 400; cursor: pointer; }
.assist-submit {
  background: #019AB3; color: white; border: 0; padding: 10px 18px; border-radius: 4px;
  font-size: 14px; font-weight: 600; cursor: pointer; width: 100%; margin-top: 8px;
}
.assist-submit:hover { background: #017d92; }
.assist-submit:disabled { background: #94a3b8; cursor: wait; }
.assist-status { text-align: center; padding: 20px; color: #64748b; font-size: 13px; }
.assist-status .spinner { font-size: 24px; animation: spin 1.5s linear infinite; display: inline-block; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.assist-section { margin-bottom: 16px; }
.assist-section h4 { margin: 0 0 6px; font-size: 13px; color: #1e293b; }
.assist-section p { margin: 4px 0; font-size: 12px; line-height: 1.6; }
.assist-product { border-left: 3px solid #019AB3; padding: 6px 10px; margin: 6px 0; background: #f8fafc; font-size: 12px; }
.assist-product .name { font-weight: 600; }
.assist-product .reason { color: #475569; margin-top: 2px; }
.assist-script-block { background: #f1f5f9; padding: 8px 12px; border-radius: 4px; margin: 6px 0; font-size: 12px; line-height: 1.6; }
.assist-script-block .label { font-weight: 600; color: #019AB3; font-size: 11px; margin-bottom: 2px; }
.assist-list { margin: 0; padding-left: 18px; font-size: 12px; line-height: 1.7; }
.assist-disclaimer { background: #fffbe6; border-left: 3px solid #ffc107; padding: 8px 12px; margin: 12px 0; font-size: 11px; color: #856404; }
.assist-feedback { margin-top: 16px; padding-top: 12px; border-top: 1px dashed #cbd5e1; }
.assist-feedback button { margin-right: 8px; padding: 6px 14px; border: 1px solid #cbd5e1; background: white; border-radius: 4px; cursor: pointer; font-size: 12px; }
.assist-feedback button:hover { background: #f1f5f9; }
.assist-feedback button.adopted { background: #d1fae5; border-color: #2a9d8f; }
.assist-feedback button.modified { background: #fef3c7; border-color: #f59e0b; }
.assist-feedback button.rejected { background: #fee2e2; border-color: #d62828; }
.assist-error { color: #d62828; background: #fee2e2; padding: 10px; border-radius: 4px; font-size: 12px; }
.assist-meta { font-size: 10px; color: #94a3b8; margin-top: 8px; }
</style>

<div class="assist-wrap">
  <div class="assist-banner">
    <h2>📊 專屬規劃（個人 PoC）</h2>
    <p>填表單 → 自動組合給 claude.ai 用的 Prompt → 你貼到自己的 claude.ai 跑 → 把結果貼回看美化版。</p>
  </div>
  <div class="assist-compliance">
    <strong>⚠️ 使用須知</strong>
    <ul>
      <li>此為個人試作工具，僅供工作流概念驗證；正式上線需走機構 IT/法遵程序</li>
      <li><strong>禁止輸入客戶實名、身分證、帳號、地址等任何 PII</strong>；只填代稱與結構化欄位</li>
      <li>輸出僅為理財顧問參考草稿，正式商品銷售須完成 KYC、適合度評估、商品說明書揭露等法定程序</li>
      <li>商品建議只給通用類別（如「投資等級債」），實際選品請依任職機構商品池與適合度評估</li>
    </ul>
  </div>

  <div class="assist-grid">
    <!-- 左：input form -->
    <div class="assist-card">
      <h3>客戶情境輸入</h3>
      <form id="assist-form">
        <div class="assist-field">
          <label>客戶代稱（永不填本名）</label>
          <input type="text" name="client_code" value="A" maxlength="20" required>
        </div>

        <div class="assist-field">
          <label>年齡區間</label>
          <select name="age_band" required>
            ${opt(["<40", "40-55", "55-65", "65-75", ">75"])}
          </select>
        </div>

        <div class="assist-field">
          <label>總資產區間</label>
          <select name="asset_band" required>
            ${opt(["<500萬", "500-3000萬", "3000萬-1億", ">1億"])}
          </select>
        </div>

        <div class="assist-field">
          <label>月可投資額</label>
          <select name="investable_monthly" required>
            ${opt(["<5萬", "5-20萬", "20-50萬", ">50萬"])}
          </select>
        </div>

        <div class="assist-field">
          <label>風險承受度</label>
          <select name="risk_tolerance" required>
            ${opt(["保守", "穩健", "積極"])}
          </select>
        </div>

        <div class="assist-field">
          <label>投資年期</label>
          <select name="horizon" required>
            ${opt(["<3年", "3-5年", "5-10年", ">10年"])}
          </select>
        </div>

        <div class="assist-field">
          <label>主要目標</label>
          <select name="goal" required>
            ${opt(["退休", "教育金", "傳承", "增值", "保本"])}
          </select>
        </div>

        <div class="assist-field">
          <label>既有部位類型（複選）</label>
          <div class="assist-existing">
            ${["定存","股票","基金","保險","信託","海外債","房產","其他"].map(v =>
              `<label><input type="checkbox" name="existing" value="${v}"> ${v}</label>`).join("")}
          </div>
        </div>

        <div class="assist-field">
          <label>自由補充（選填）</label>
          <textarea name="free_text" placeholder="例：客戶剛賣掉一間公寓..." maxlength="500"></textarea>
        </div>

        <button type="submit" class="assist-submit" id="assist-submit-btn">${ASSIST_DEV_MODE ? "本機 API 跑（dev）" : "組 Prompt"}</button>
      </form>
    </div>

    <!-- 右：output area -->
    <div class="assist-card">
      <h3>輸出${ASSIST_DEV_MODE ? `<span class="assist-dev-badge">DEV MODE → localhost:8766</span>` : ""}</h3>
      <div id="assist-output">
        <div class="assist-status">${ASSIST_DEV_MODE ? "填左側 → 按「本機 API 跑」直接出結果" : "填左側 → 按「組 Prompt」→ 拿到完整 prompt → 自己貼到 claude.ai 跑"}</div>
      </div>
    </div>
  </div>
</div>
`;
}

let ASSIST_CURRENT_REQUEST_ID = null;

function wireAssistTab() {
  const form = document.getElementById("assist-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (ASSIST_DEV_MODE) {
      await assistSubmitDev(form);
    } else {
      await assistBuildPrompt(form);
    }
  });
}

function collectAssistPayload(form) {
  const fd = new FormData(form);
  return {
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
}

// === 公開模式：組 prompt 給同事自己用 ===
async function assistBuildPrompt(form) {
  const payload = collectAssistPayload(form);
  const out = document.getElementById("assist-output");
  const btn = document.getElementById("assist-submit-btn");

  // PII 防呆：自由補充欄位含明顯姓名/身分證/電話 patterns 就攔
  const pii = detectPII(payload.free_text);
  if (pii.length) {
    out.innerHTML = `<div class="assist-error">
      自由補充欄位疑似含 PII（${pii.join("、")}）。請改用代稱、移除電話/身分證號後再試。
    </div>`;
    return;
  }

  btn.disabled = true;
  btn.textContent = "組合中…";
  try {
    const systemPrompt = await loadAssistSystemPrompt();
    const userMsg = `客戶情境輸入：\n\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\`\n\n請直接輸出 JSON。`;
    const fullPrompt = `${systemPrompt}\n\n---\n\n${userMsg}`;
    out.innerHTML = renderAssistPromptBuilder(fullPrompt);
    wireAssistPromptActions(fullPrompt);
  } catch (e) {
    out.innerHTML = `<div class="assist-error">載入 system prompt 失敗：${escapeHtml(e.message)}</div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = "重新組 Prompt";
  }
}

// 偵測自由文字裡常見 PII pattern（粗略防呆，不是完整 DLP）
function detectPII(text) {
  if (!text) return [];
  const hits = [];
  if (/[A-Z]\d{9}/.test(text)) hits.push("身分證號");
  if (/09\d{2}[\s-]?\d{3}[\s-]?\d{3}/.test(text)) hits.push("手機");
  if (/0\d{1,2}[\s-]?\d{6,8}/.test(text)) hits.push("市話");
  if (/\d{10,16}/.test(text)) hits.push("疑似帳號");
  return hits;
}

function renderAssistPromptBuilder(fullPrompt) {
  const chars = fullPrompt.length;
  return `
<div class="assist-step-title"><span class="assist-step-num">1</span>複製下面這段 Prompt</div>
<div class="assist-prompt-out" id="assist-prompt-text">${escapeHtml(fullPrompt)}</div>
<div class="assist-meta">總長 ${chars.toLocaleString()} 字</div>

<div class="assist-btn-row">
  <button class="assist-btn-primary" id="assist-copy-btn">📋 複製 Prompt 到剪貼簿</button>
  <a class="assist-btn-secondary" href="https://claude.ai/new" target="_blank" rel="noopener">在新分頁開啟 claude.ai →</a>
</div>

<div class="assist-step-title"><span class="assist-step-num">2</span>到 claude.ai 貼上送出 → 把回傳 JSON 貼回下面</div>
<textarea class="assist-paste-area" id="assist-response-paste" placeholder="把 claude.ai 回應的 JSON 整段貼這裡（含 { } 大括號）"></textarea>

<div class="assist-btn-row">
  <button class="assist-btn-primary" id="assist-parse-btn">解析顯示美化版 ↓</button>
</div>

<div id="assist-parsed-output"></div>

<div class="assist-meta" style="margin-top:16px;">
  💡 使用提示：claude.ai 免費版每日有訊息額度；若超量可改用 Pro 或其他 AI。Prompt 也適用於 ChatGPT、Gemini。
</div>
`;
}

function wireAssistPromptActions(fullPrompt) {
  const copyBtn = document.getElementById("assist-copy-btn");
  const parseBtn = document.getElementById("assist-parse-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(fullPrompt);
        copyBtn.textContent = "✓ 已複製";
        setTimeout(() => { copyBtn.textContent = "📋 複製 Prompt 到剪貼簿"; }, 2000);
      } catch (e) {
        // fallback：選取 textarea 內容讓使用者手動複製
        const ta = document.createElement("textarea");
        ta.value = fullPrompt;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        copyBtn.textContent = "✓ 已複製（fallback）";
        setTimeout(() => { copyBtn.textContent = "📋 複製 Prompt 到剪貼簿"; }, 2000);
      }
    });
  }
  if (parseBtn) {
    parseBtn.addEventListener("click", () => {
      const raw = document.getElementById("assist-response-paste").value.trim();
      const target = document.getElementById("assist-parsed-output");
      if (!raw) {
        target.innerHTML = `<div class="assist-error">請先貼上 JSON 內容</div>`;
        return;
      }
      // 嘗試剝除 ```json ... ``` 包裝
      let cleaned = raw;
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.split("\n").slice(1).join("\n");
        if (cleaned.endsWith("```")) cleaned = cleaned.slice(0, cleaned.lastIndexOf("```"));
        cleaned = cleaned.trim();
      }
      let data;
      try {
        data = JSON.parse(cleaned);
      } catch (e) {
        target.innerHTML = `<div class="assist-error">
          JSON 解析失敗：${escapeHtml(e.message)}<br>
          請確認貼上的內容是純 JSON（含 { 與 }）。
        </div>`;
        return;
      }
      target.innerHTML = renderAssistResult(data);
    });
  }
}

// === Dev 模式：直接打本機 server（Iris 自己用）===
async function assistSubmitDev(form) {
  const payload = collectAssistPayload(form);
  const btn = document.getElementById("assist-submit-btn");
  const out = document.getElementById("assist-output");
  btn.disabled = true;
  btn.textContent = "生成中…";
  const startedAt = Date.now();
  let elapsed = 0;
  const timer = setInterval(() => {
    elapsed = Math.floor((Date.now() - startedAt) / 1000);
    out.innerHTML = `<div class="assist-status">
      <div class="spinner">⏳</div>
      <p>本機 API 跑中… 已等 ${elapsed} 秒</p>
    </div>`;
  }, 1000);

  try {
    const r = await fetch(`${ASSIST_API}/api/assist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    clearInterval(timer);

    if (!r.ok) {
      const err = await r.json().catch(() => ({}));
      out.innerHTML = `<div class="assist-error">伺服器回應 ${r.status}：${escapeHtml(err.error || "未知錯誤")}</div>`;
      return;
    }

    const data = await r.json();
    if (data.error) {
      out.innerHTML = `<div class="assist-error">
        <strong>LLM 回應錯誤：</strong>${escapeHtml(data.error)}
        ${data.raw_preview ? `<details style="margin-top:8px;"><summary>raw preview</summary><pre style="font-size:10px;white-space:pre-wrap;">${escapeHtml(data.raw_preview)}</pre></details>` : ""}
      </div>`;
      return;
    }

    ASSIST_CURRENT_REQUEST_ID = data.request_id;
    out.innerHTML = renderAssistResult(data);
    wireAssistFeedback();
  } catch (err) {
    clearInterval(timer);
    out.innerHTML = `<div class="assist-error">
      無法連到本機 server：${escapeHtml(String(err))}<br>
      請確認 <code>~/scripts/client_assist_server.py</code> 已啟動（port 8766）。
    </div>`;
  } finally {
    btn.disabled = false;
    btn.textContent = "本機 API 跑（dev）";
  }
}

function renderAssistResult(d) {
  const products = (d.products || []).map(p => `
    <div class="assist-product">
      <div class="name">${escapeHtml(p.rating || "")} ${escapeHtml(p.name || "")}</div>
      <div class="reason">${escapeHtml(p.reason || "")}</div>
    </div>`).join("");

  const scripts = d.scripts || {};
  const scriptBlock = (label, text) => text ? `
    <div class="assist-script-block">
      <div class="label">${escapeHtml(label)}</div>
      ${escapeHtml(text)}
    </div>` : "";

  const list = (items) => `<ul class="assist-list">${(items || []).map(x => `<li>${escapeHtml(x)}</li>`).join("")}</ul>`;

  const warn = d._post_audit_warning
    ? `<div class="assist-error">⚠️ 後置稽核警告：${escapeHtml(d._post_audit_warning)}</div>`
    : "";

  return `
${warn}

<div class="assist-section">
  <h4>① 適合度評估</h4>
  <p>${escapeHtml(d.suitability || "")}</p>
</div>

<div class="assist-section">
  <h4>② 商品配適</h4>
  ${products}
</div>

<div class="assist-section">
  <h4>③ 話術建議</h4>
  ${scriptBlock("開場", scripts.opening)}
  ${scriptBlock("痛點", scripts.pain_point)}
  ${scriptBlock("解方", scripts.solution)}
  ${scriptBlock("收尾", scripts.closing)}
</div>

<div class="assist-section">
  <h4>④ 風險警示</h4>
  ${list(d.risks)}
</div>

<div class="assist-section">
  <h4>⑤ 法規提醒</h4>
  ${list(d.regulations)}
</div>

<div class="assist-section">
  <h4>⑥ 後續追問</h4>
  ${list(d.followup_questions)}
</div>

<div class="assist-disclaimer">${escapeHtml(d.disclaimer || "本建議由 AI 依輸入情境產出，僅供理財顧問參考。")}</div>

${ASSIST_DEV_MODE ? `
<div class="assist-feedback">
  <strong style="font-size:12px;">這次回應你會：</strong><br><br>
  <button class="assist-fb-btn" data-verdict="採用">✅ 採用</button>
  <button class="assist-fb-btn" data-verdict="修改後採用">✏️ 修改後採用</button>
  <button class="assist-fb-btn" data-verdict="不採用">❌ 不採用</button>
  <span id="assist-fb-status" style="margin-left:12px; font-size:11px; color:#64748b;"></span>
</div>

<div class="assist-meta">
  request_id: ${escapeHtml(d.request_id || "")} · latency: ${d.latency_ms || 0}ms
</div>
` : `
<div class="assist-feedback" style="border-top: 1px dashed #cbd5e1; padding-top: 10px; margin-top: 12px;">
  <strong style="font-size:11px; color:#64748b;">💡 使用後請記得：</strong>
  <ul style="margin: 6px 0 0; padding-left: 18px; font-size: 11px; color:#64748b; line-height: 1.6;">
    <li>到 claude.ai 對話列表 → 刪除這則對話（避免留底）</li>
    <li>若採用建議，請依任職機構商品池 + KYC + 適合度評估再次確認</li>
  </ul>
</div>
`}
`;
}

function wireAssistFeedback() {
  document.querySelectorAll(".assist-fb-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const verdict = btn.dataset.verdict;
      let reject_reason = null;
      let modified_version = null;
      if (verdict === "不採用") {
        reject_reason = prompt("不採用原因（資訊錯誤 / 不適合場景 / 話術不自然 / 法規偏差 / 其他）：", "其他");
        if (reject_reason === null) return;
      }
      if (verdict === "修改後採用") {
        modified_version = prompt("貼修改後的版本（給未來迭代參考）：", "");
        if (modified_version === null) return;
      }
      const status = document.getElementById("assist-fb-status");
      try {
        const r = await fetch(`${ASSIST_API}/api/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            request_id: ASSIST_CURRENT_REQUEST_ID,
            verdict,
            reject_reason,
            modified_version,
          }),
        });
        if (r.ok) {
          status.textContent = "✓ 已記錄";
          btn.classList.add(
            verdict === "採用" ? "adopted" :
            verdict === "修改後採用" ? "modified" : "rejected"
          );
        } else {
          status.textContent = "記錄失敗";
        }
      } catch (e) {
        status.textContent = "記錄失敗：" + e.message;
      }
    });
  });
}

init();
