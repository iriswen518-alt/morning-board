// Morning Board app
const $ = (id) => document.getElementById(id);

const INDEX_NAMES = {
  "TAIEX": "加權指數",
  "TAIEX 加權指數": "加權指數",
  "S&P 500": "標普 500",
  "Nasdaq": "那斯達克",
  "Nasdaq Composite": "那斯達克",
  "Dow Jones": "道瓊",
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
  "S&P 500": "SPY.US",
  "Nasdaq": "AI000020",
  "Nasdaq Composite": "AI000020",
  "Dow Jones": "AI000010",
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
  const url = indexUrl(name);
  const label = escapeHtml(indexLabel(name));
  return url
    ? `<a href="${url}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">${label}</a>`
    : label;
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
  return `${sign}${n.toFixed(2)}%`;
}

function pctClass(n) {
  if (n === null || n === undefined) return "";
  return n > 0 ? "up" : (n < 0 ? "down" : "");
}

// 把績效數字包成連到該檔績效來源頁的連結，供使用者點開驗證數值。
// color:inherit 保留紅漲綠跌染色；無 url 或無資料（—）時回傳純文字。
function perfLink(text, url) {
  if (!url || text === "—" || text === "") return text;
  return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener" class="perf-link" style="color:inherit;text-decoration:underline">${text}</a>`;
}

function fmtNum(n) {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
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

// init 時 fetch 失敗（伺服器重啟瞬間／網路 blip）的 data 名稱會被記下，
// 使用者切到對應 tab 時背景重試一次再重畫，避免長期卡在 fallback 空狀態。
const FAILED_LOADS = new Set();
const LOAD_NAME_TO_DATA_KEY = {
  meta: "meta", market: "market", news: "news", tax: "tax",
  funds: "funds", stocks: "stocks", popular_stocks: "popular",
  stock_brief: "stock_brief", insurances: "insurance",
  overseas_bonds: "obonds", targets: "targets",
  allocation: "allocation", dca: "dca", wealth_transfer: "wealth",
  beatetf: "beatetf", presets: "presets", fund_compare: "fund_compare",
  tw_stocks: "tw_stocks",
};
const TAB_LOAD_DEPS = {
  market: ["market", "stocks"],
  news: ["news"],
  funds: ["funds", "dca", "beatetf", "fund_compare"],
  obonds: ["overseas_bonds"],
  usstocks: ["stocks", "popular_stocks", "stock_brief"],
  insurance: ["insurances"],
  targets: ["targets"],
  portfolio: ["presets", "allocation", "targets"],
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

async function init() {
  // 每個來源各自有 fallback：一個壞不拖垮全頁
  // 失敗時記到 FAILED_LOADS，使用者切到對應 tab 時會背景重試
  const safe = (name, fallback) => load(name).catch(() => { FAILED_LOADS.add(name); return fallback; });
  const [meta, market, news, tax, funds, stocks, popular, stock_brief, insurance, obonds, targets, allocation, dca, wealth, beatetf, presets, fund_compare, tw_stocks] = await Promise.all([
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
    safe("targets", { targets: [], summary: {}, entry_sequence: [] }),
    safe("allocation", { profiles: [], references: [] }),
    safe("dca", { funds: [] }),
    safe("wealth_transfer", { topics: [] }),
    safe("beatetf", { funds: [], benchmark: null }),
    safe("presets", { presets: [] }),
    safe("fund_compare", { funds: [], categories: [] }),
    safe("tw_stocks", []),
  ]);
  DATA = { meta, market, news, tax, funds, stocks, popular, stock_brief, insurance, obonds, targets, allocation, dca, wealth, beatetf, presets, fund_compare, tw_stocks };
  if (!meta.built_at) {
    $("updated").textContent = `載入部分失敗（顯示快取資料）`;
  } else {
    $("updated").textContent = `上次更新：${DATA.meta.built_at.replace("T", " ").slice(0, 16)}`;
  }

  document.querySelectorAll(".main-tab").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  SEARCH_INDEX = buildSearchIndex();
  wireSearch();

  const hashTab = location.hash.replace(/^#/, "");
  if (hashTab) CURRENT_TAB = hashTab;
  switchTab(CURRENT_TAB);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js?v=20260513-1510").catch(() => {});
  }

  setupPullToRefresh();

  // 進入畫面/從背景回到前景時自動檢查新版
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkForNewVersion();
  });
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) checkForNewVersion();
  });
}

function switchTab(name) {
  CURRENT_TAB = name;
  document.querySelectorAll(".main-tab").forEach(b => {
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
  else if (name === "targets") body.innerHTML = renderTargetsSheet();
  else if (name === "position" || name === "allocation") {
    // 舊「部位分析」「資產配置」分頁已併入「投組分析」（預設組合）
    PORTFOLIO_SUBTAB = "preset";
    body.innerHTML = renderPortfolioSheet();
    PENDING_SUBTAB = "preset";
    name = "portfolio";
    CURRENT_TAB = "portfolio";
    body.dataset.section = "portfolio";
    document.querySelectorAll(".main-tab").forEach(b => {
      b.classList.toggle("active", b.dataset.tab === "portfolio");
    });
  }
  else if (name === "portfolio") body.innerHTML = renderPortfolioSheet();
  else if (name === "wealth") body.innerHTML = renderWealthSheet();
  else if (name === "calc") body.innerHTML = renderCalcSheet();
  else if (name === "assist") body.innerHTML = renderAssistSheet();
  else if (name === "twstock") body.innerHTML = renderTwStockSheet();
  if (name === "assist") wireAssistTab();
  if (name === "news") wireNewsTabs();
  if (name === "market") wireMarketTabs();
  if (name === "funds") { wireFundsTabs(); wireFundCompare(); }
  if (name === "targets") wireTargetsTabs();
  if (name === "portfolio") wirePortfolioTabs();
  if (name === "wealth") wireWealthTabs();
  if (name === "calc") wireCalcTabs();
  if (name === "twstock") wireTwStock();
  if (PENDING_SUBTAB) {
    const sub = PENDING_SUBTAB;
    PENDING_SUBTAB = null;
    const sel = ["mtab", "atab", "ttab", "ctab", "wtab", "ntab", "ftab", "prtab"]
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

  // 背景重試 init 時失敗的資料；成功就重畫一次（避免 fallback 空狀態卡住）
  retryFailedForTab(name).then(updated => {
    if (updated && CURRENT_TAB === name) {
      SEARCH_INDEX = buildSearchIndex();
      switchTab(name);
    }
  });
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
  const [meta, market, news, tax, funds, stocks, popular, stock_brief, insurance, obonds, targets, allocation, dca, wealth, beatetf, presets, fund_compare, tw_stocks] = await Promise.all([
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
    safe("targets", { targets: [], summary: {}, entry_sequence: [] }),
    safe("allocation", { profiles: [], references: [] }),
    safe("dca", { funds: [] }),
    safe("wealth_transfer", { topics: [] }),
    safe("beatetf", { funds: [], benchmark: null }),
    safe("presets", { presets: [] }),
    safe("fund_compare", { funds: [], categories: [] }),
    safe("tw_stocks", []),
  ]);
  DATA = { meta, market, news, tax, funds, stocks, popular, stock_brief, insurance, obonds, targets, allocation, dca, wealth, beatetf, presets, fund_compare, tw_stocks };
  SEARCH_INDEX = buildSearchIndex();
  if (DATA.meta && DATA.meta.built_at) {
    $("updated").textContent =
      `上次更新：${DATA.meta.built_at.replace("T", " ").slice(0, 16)}`;
  }
  switchTab(CURRENT_TAB);
}

function bondUrl(b) {
  if (!b.isin || !b.code) return null;
  return `https://bopfund.moneydj.com/b2bbond/BondBasic/Basic01?id=${encodeURIComponent(b.isin)}&bid=${encodeURIComponent(b.code)}`;
}

function renderObondsSheet() {
  const list = (DATA.obonds && DATA.obonds.bonds) || [];
  if (!list.length) {
    return "<p style='color:var(--text-mute); padding:20px 0'>尚未提供海外債清單</p>";
  }
  const fmtCoupon = c => (c === null || c === undefined) ? "—"
    : (c === 0 ? "零息" : `${c.toFixed(2)}%`);
  const fmtPctNum = p => (p === null || p === undefined) ? "—" : fmtPct(p);
  const fmtPrice = p => (p === null || p === undefined) ? "—" : Number(p).toFixed(2);
  return list.map(b => {
    const url = bondUrl(b);
    const nameHtml = url
      ? `<a href="${url}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">${escapeHtml(b.name_zh)}</a>`
      : escapeHtml(b.name_zh);
    const chips = [currencyChip(b.currency), typeChip(b.type)].join("");
    const meta = [b.issuer, b.code, b.isin].filter(Boolean).map(escapeHtml).join("・");
    const priceDate = b.price_date ? `<div style="font-size:11px;color:var(--text-mute);margin-top:2px">${escapeHtml(shortDate(b.price_date))}</div>` : "";
    return `
    <div class="fund-card">
      <h3>${nameHtml}</h3>
      <div style="margin-bottom:6px">${chips}</div>
      <p class="tagline">${meta}</p>
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:6px; font-size:15px; margin-top:8px; text-align:center">
        <div><label style="display:block; font-size:13px; color:var(--text-mute); margin-bottom:2px">幣別</label>${escapeHtml(b.currency || "—")}</div>
        <div><label style="display:block; font-size:13px; color:var(--text-mute); margin-bottom:2px">票面利率</label>${fmtCoupon(b.coupon_pct)}</div>
        <div><label style="display:block; font-size:13px; color:var(--text-mute); margin-bottom:2px">到期日</label>${escapeHtml(b.maturity || "—")}</div>
        <div><label style="display:block; font-size:13px; color:var(--text-mute); margin-bottom:2px">信評</label><span>${escapeHtml(b.rating || "—")}</span></div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:6px; font-size:14px; margin-top:8px; text-align:center; padding-top:8px; border-top:1px dashed var(--border)">
        <div>
          <label style="display:block; font-size:12px; color:var(--text-mute); margin-bottom:2px">申購參考殖利率</label>
          <span class="up">${fmtPctNum(b.bid_yield_pct)}</span>
        </div>
        <div>
          <label style="display:block; font-size:12px; color:var(--text-mute); margin-bottom:2px">贖回參考價</label>
          ${fmtPrice(b.ask_price)}
          ${priceDate}
        </div>
        <div><label style="display:block; font-size:12px; color:var(--text-mute); margin-bottom:2px">週%</label><span class="${pctClass(b.perf_1w)}">${fmtPctNum(b.perf_1w)}</span></div>
        <div><label style="display:block; font-size:12px; color:var(--text-mute); margin-bottom:2px">月%</label><span class="${pctClass(b.perf_1m)}">${fmtPctNum(b.perf_1m)}</span></div>
        <div><label style="display:block; font-size:12px; color:var(--text-mute); margin-bottom:2px">季%</label><span class="${pctClass(b.perf_3m)}">${fmtPctNum(b.perf_3m)}</span></div>
      </div>
    </div>
  `;
  }).join("");
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
          ${f.nav_date ? `<div class="cell-sub">${escapeHtml(shortDate(f.nav_date))}</div>` : ""}
        </div>
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
            <th>指數</th><th>收盤</th><th>日</th><th>本月</th><th>今年</th><th class="date-col">收盤日</th>
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
        ${(t.stats || []).map(s => `
          <div class="t-stat">
            <div class="t-stat-k">${escapeHtml(s.k)}</div>
            <div class="t-stat-v">${escapeHtml(s.v)}</div>
            <div class="t-stat-sub">${escapeHtml(s.sub || "")}</div>
          </div>
        `).join("")}
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
    <div class="tabs tabs-wrap">${tabBtns}</div>
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
      <button class="position-preset-card ${isSel ? "selected" : ""}" data-preset="${escapeHtml(p.id)}" style="border-top-color:${p.color || "#019AB3"}">
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
                <td class="${covCls}">${cov.toFixed(0)}%${cov < 100 ? "（其餘以 0 計入）" : ""}</td>
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
            <p>配息部位加權平均殖利率：<b>${income.avgYield.toFixed(2)}%</b>（佔組合 ${income.yWeight}%）</p>
            <p>估算 1 年配息（以該部位 NT$ 100 萬本金）：<b>${Math.round(income.avgYield * 10000).toLocaleString("en-US")} 元</b></p>
            <table class="position-perf" style="margin-top:8px">
              <thead><tr><th>標的</th><th>類別</th><th style="text-align:right">權重</th><th style="text-align:right">年化殖利率</th></tr></thead>
              <tbody>
                ${income.breakdown.map(b => `
                  <tr>
                    <td>${positionLinkName(b.meta)}</td>
                    <td>${b.kind === "bond" ? "海外債（YTM）" : "配息型基金"}</td>
                    <td style="text-align:right">${b.weight}%</td>
                    <td style="text-align:right" class="up">${b.yield.toFixed(2)}%</td>
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
  $("content").innerHTML = renderPortfolioSheet();
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

function renderMarketSheet() {
  const m = DATA.market;
  const date = shortDate(m.closing_date);
  const rows = m.indices.map(i => `
    <tr>
      <td>${indexLink(i.name)}</td>
      <td>${fmtInt(i.close)}</td>
      <td class="${pctClass(i.daily_pct)}">${fmtPct(i.daily_pct)}</td>
      <td class="${pctClass(i.mtd_pct)}">${fmtPct(i.mtd_pct)}</td>
      <td class="${pctClass(i.ytd_pct)}">${fmtPct(i.ytd_pct)}</td>
      <td class="date-col">${escapeHtml(shortDate(i.closing_date) || date)}</td>
    </tr>
  `).join("");
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
      <td>${bondLink(b.name)}</td>
      <td>${b.yield_pct != null ? b.yield_pct.toFixed(2) + "%" : "—"}</td>
      <td>${dailyCell}</td>
      <td>${mtdCell}</td>
      <td class="date-col">${escapeHtml(shortDate(b.closing_date) || date)}</td>
    </tr>
  `;}).join("");

  const fxRows = (m.fx || []).map(f => `
    <tr>
      <td>${fxLink(f.name)}</td>
      <td>${f.close != null ? f.close.toLocaleString("en-US", { maximumFractionDigits: 4 }) : "—"}</td>
      <td class="${pctClass(f.daily_pct)}">${fmtPct(f.daily_pct)}</td>
      <td class="${pctClass(f.mtd_pct)}">${fmtPct(f.mtd_pct)}</td>
      <td class="${pctClass(f.ytd_pct)}">${fmtPct(f.ytd_pct)}</td>
      <td class="date-col">${escapeHtml(shortDate(f.closing_date) || date)}</td>
    </tr>
  `).join("");

  const usStocks = DATA.stocks?.us_stocks || [];
  const twStocks = DATA.stocks?.tw_stocks || [];

  const stocksTab = `
    <table class="indices">
      <thead><tr>
        <th title="點名稱可開 MoneyDJ 圖表頁驗證">指數</th>
        <th title="收盤價（來源：Yahoo Finance）">收盤</th>
        <th title="日報酬率｜定義：今日收盤 vs 昨日收盤｜來源：Yahoo Finance / FRED">日</th>
        <th title="MTD｜定義：當月首交易日收盤 → 最新收盤｜來源：Yahoo Finance">本月</th>
        <th title="YTD｜定義：去年最後交易日收盤 → 最新收盤｜來源：Yahoo Finance">今年</th>
        <th class="date-col" title="收盤日：最新交易日；US ET 收盤後 build；TW TWSE 公告日">收盤日</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;

  const bondsTab = bondRows ? `
    <table class="indices">
      <thead><tr>
        <th title="點名稱可開 MoneyDJ 圖表頁驗證">債別</th>
        <th title="到期殖利率（YTM, %）｜來源：FRED (US) / 各國央行 / Yahoo Finance">殖利率</th>
        <th title="日變動 bps｜定義：今日 yield − 昨日 yield｜來源：FRED">日變動</th>
        <th title="MTD 變動 bps｜定義：當月首交易日 yield → 最新 yield｜來源：FRED">本月變動</th>
        <th class="date-col" title="債券殖利率公告日">收盤日</th>
      </tr></thead>
      <tbody>${bondRows}</tbody>
    </table>` : `<p style="color:var(--text-mute); padding:20px 0">尚未提供公債資料</p>`;

  const fxTab = fxRows ? `
    <table class="indices">
      <thead><tr>
        <th title="點名稱可開 MoneyDJ 圖表頁驗證">幣別</th>
        <th title="收盤匯率｜來源：Yahoo Finance">收盤</th>
        <th title="日報酬率｜定義：今日收盤 vs 昨日收盤｜來源：Yahoo Finance">日</th>
        <th title="MTD｜定義：當月首交易日收盤 → 最新收盤｜來源：Yahoo Finance">本月</th>
        <th title="YTD｜定義：去年最後交易日收盤 → 最新收盤｜來源：Yahoo Finance">今年</th>
        <th class="date-col" title="收盤日：最新交易日 ET 收盤後 build">收盤日</th>
      </tr></thead>
      <tbody>${fxRows}</tbody>
    </table>` : `<p style="color:var(--text-mute); padding:20px 0">尚未提供匯率資料</p>`;

  const usTab = renderStocksTable("", usStocks) || `<p style="color:var(--text-mute); padding:20px 0">尚未提供美股資料</p>`;
  const twTab = renderStocksTable("", twStocks) || `<p style="color:var(--text-mute); padding:20px 0">尚未提供台股資料</p>`;

  return `
    ${renderMarketHighlights(m)}

    <div class="tabs">
      <button class="tab active" data-mtab="indices">股市</button>
      <button class="tab" data-mtab="bonds">債券</button>
      <button class="tab" data-mtab="fx">匯率</button>
      <button class="tab" data-mtab="us">美股</button>
      <button class="tab" data-mtab="tw">台股</button>
    </div>
    <div id="mtab-indices">${stocksTab}</div>
    <div id="mtab-bonds" hidden>${bondsTab}</div>
    <div id="mtab-fx" hidden>${fxTab}</div>
    <div id="mtab-us" hidden>${usTab}</div>
    <div id="mtab-tw" hidden>${twTab}</div>
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
  return note + curatedBlock + popularBlock + renderStockBriefBlock();
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
const TW_INDUSTRY_ORDER = [
  "半導體業", "電子零組件", "電腦及週邊", "光電業", "通信網路業", "其他電子業",
  "電子通路業", "資訊服務業", "電子商務", "數位雲端",
  "金融保險", "航運業", "建材營造", "鋼鐵工業", "汽車工業", "電機機械", "化學工業",
  "生技醫療", "食品工業", "塑膠工業", "紡織纖維", "貿易百貨", "觀光餐旅",
  "油電燃氣", "綠能環保", "運動休閒", "居家生活", "文化創意業", "農業科技",
  "水泥工業", "電器電纜", "玻璃陶瓷", "造紙工業", "橡膠工業", "其他", "ETF",
];
function twIndustryList() {
  const list = DATA?.tw_stocks || [];
  const counts = {};
  for (const s of list) {
    const ind = s.industry || "其他";
    counts[ind] = (counts[ind] || 0) + 1;
  }
  const orderIdx = (name) => {
    const i = TW_INDUSTRY_ORDER.indexOf(name);
    return i === -1 ? 999 : i;
  };
  return Object.entries(counts)
    .sort((a, b) => orderIdx(a[0]) - orderIdx(b[0]))
    .map(([name, n]) => ({ name, count: n }));
}

const TW_STOCK_SNAPSHOT_CACHE = {};
function twYahooSuffix(market) {
  return market === "上櫃" ? ".TWO" : ".TW";
}
function fmtNum(n, d) {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const opts = d != null ? { minimumFractionDigits: d, maximumFractionDigits: d } : {};
  return Number(n).toLocaleString("zh-TW", opts);
}
function fmtVolume(v) {
  if (v == null || Number.isNaN(v)) return "—";
  const k = v / 1000;
  if (k >= 10000) return `${(k / 10000).toFixed(2)} 億股`;
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

async function fetchTwStockSnapshot(code, market) {
  const key = `${code}|${market}`;
  if (TW_STOCK_SNAPSHOT_CACHE[key]) return TW_STOCK_SNAPSHOT_CACHE[key];
  const primary = market === "上櫃" ? () => fetchYahooSnapshot(code, market) : () => fetchTwseSnapshot(code);
  const fallback = market === "上櫃" ? () => fetchTwseSnapshot(code) : () => fetchYahooSnapshot(code, market);
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
      <div class="tw-snap-foot">資料源：${escapeHtml(snap.source || "Yahoo Finance")}（瀏覽器直接抓取，無中介伺服器、無 API 金鑰）${snap.fallbackFrom ? `<span class="tw-snap-fallback"> · 主源失敗已自動切換</span>` : ""}</div>
    </div>`;
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
    bits.push(`<div class="tw-sum-row"><span class="tw-sum-k">今日報價</span><span class="tw-sum-v">${fmtNum(c.snap.price, 2)} ${c.snap.currency || "TWD"}　<span class="${cls}">${chgTxt}(${sign}${pct.toFixed(2)}%)</span></span></div>`);
  }
  if (c.rev) {
    const yoy = fmtPct(c.rev.yoy_pct);
    const cls = pctClass(c.rev.yoy_pct);
    bits.push(`<div class="tw-sum-row"><span class="tw-sum-k">${fmtYyyymmFromRoc(c.rev.ym)} 月營收</span><span class="tw-sum-v">${fmtRevenue(c.rev.current)}　YoY <span class="${cls}">${yoy}</span></span></div>`);
  }
  if (c.fin) {
    const yr = parseInt(c.fin.year) + 1911;
    bits.push(`<div class="tw-sum-row"><span class="tw-sum-k">${yr}Q${c.fin.quarter} 獲利率</span><span class="tw-sum-v">毛利 ${c.fin.gpm || "—"}%　營益 ${c.fin.opm || "—"}%　純益 ${c.fin.npm || "—"}%</span></div>`);
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
  if (Math.abs(n) >= 1e8) return `${(n / 1e8).toFixed(2)} 億元`;
  if (Math.abs(n) >= 1e4) return `${(n / 1e4).toFixed(0)} 萬元`;
  return `${n.toLocaleString("zh-TW")} 元`;
}
function fmtRevenue(s) {  // 月營收單位為千元
  const n = parseTwseNum(s);
  if (n == null) return "—";
  const val = n * 1000;
  if (Math.abs(val) >= 1e8) return `${(val / 1e8).toFixed(2)} 億元`;
  return `${(val / 1e4).toFixed(0)} 萬元`;
}
function fmtPct(s) {
  const n = parseTwseNum(s);
  if (n == null) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}
function pctClass(s) {
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
  const isOtc = market === "上櫃";
  const result = { ok: true, info: null, revenue: null, finance: null };
  const promises = [
    loadTwBulkLocal("tw_company_info")
      .then(arr => {
        result.info = arr.find(r => r.code === code && r.market === market) || null;
      })
      .catch(e => { result.infoErr = e.message; }),
    loadTwBulkLocal("tw_revenue")
      .then(arr => {
        result.revenue = arr.find(r => r.code === code && r.market === market) || null;
      })
      .catch(e => { result.revenueErr = e.message; }),
  ];
  if (!isOtc) {
    promises.push(
      loadTwBulkLocal("tw_finance")
        .then(arr => {
          const rows = arr.filter(r => r.code === code);
          rows.sort((a, b) => `${b.year}${b.quarter}`.localeCompare(`${a.year}${a.quarter}`));
          result.finance = rows[0] || null;
        })
        .catch(e => { result.financeErr = e.message; })
    );
  }
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

function renderFinanceBody(fin) {
  if (!fin) return `<div class="tw-data-card-hint">查無季營益</div>`;
  const yr = parseInt(fin.year) + 1911;
  return `
    <div class="tw-data-card-sub-inline">${yr}Q${escapeHtml(String(fin.quarter))}</div>
    <div><span class="tw-basic-k">營業收入</span><span class="tw-basic-v">${escapeHtml(fin.revenue_m || "—")} 百萬</span></div>
    <div><span class="tw-basic-k">毛利率</span><span class="tw-basic-v">${escapeHtml(fin.gpm || "—")}%</span></div>
    <div><span class="tw-basic-k">營益率</span><span class="tw-basic-v">${escapeHtml(fin.opm || "—")}%</span></div>
    <div><span class="tw-basic-k">稅後純益率</span><span class="tw-basic-v">${escapeHtml(fin.npm || "—")}%</span></div>`;
}

async function loadTwStockBasic(code, market) {
  let data;
  try {
    data = await fetchTwStockBasic(code, market);
  } catch (e) {
    console.error("[twstock] basic fetch threw:", e);
    fillCardSlot(code, "company", `<div class="tw-data-card-hint">載入失敗</div>`);
    fillCardSlot(code, "revenue", `<div class="tw-data-card-hint">載入失敗</div>`);
    if (market !== "上櫃") fillCardSlot(code, "finance", `<div class="tw-data-card-hint">載入失敗</div>`);
    return;
  }
  const isOtc = market === "上櫃";
  fillCardSlot(code, "company", renderCompanyBody(data.info, isOtc));
  fillCardSlot(code, "revenue", renderRevenueBody(data.revenue));
  if (!isOtc) fillCardSlot(code, "finance", renderFinanceBody(data.finance));
  updateTwSummary(code, { info: data.info, rev: data.revenue, fin: isOtc ? null : data.finance });
}

const TW_CHIPS_CACHE = {};
function fmtTwseDateYmd(d) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}
function fmtShareLots(s) {
  const n = parseTwseNum(s);
  if (n == null) return "—";
  const lots = n / 1000;
  if (Math.abs(lots) >= 10000) return `${(lots / 10000).toFixed(2)} 萬張`;
  return `${Math.round(lots).toLocaleString("zh-TW")} 張`;
}
function fmtChipChange(s) {
  const n = parseTwseNum(s);
  if (n == null) return { txt: "—", cls: "tw-flat" };
  const lots = n / 1000;
  const abs = Math.abs(lots);
  const txt = abs >= 10000
    ? `${n > 0 ? "+" : n < 0 ? "−" : ""}${(abs / 10000).toFixed(2)} 萬張`
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

async function fetchTwStockChips(code) {
  if (TW_CHIPS_CACHE[code]) return TW_CHIPS_CACHE[code];
  // 從 snapshot 拿到最近交易日（snapshot cache 內已記錄 dateStr）；否則退到今日
  const snapKey = Object.keys(TW_STOCK_SNAPSHOT_CACHE).find(k => k.startsWith(`${code}|`));
  const snap = snapKey ? TW_STOCK_SNAPSHOT_CACHE[snapKey] : null;
  let targetDate;
  if (snap?.dateStr && /^\d{4}-\d{2}-\d{2}$/.test(snap.dateStr)) {
    targetDate = snap.dateStr.replace(/-/g, "");
  } else {
    targetDate = fmtTwseDateYmd(new Date());
  }
  // 嘗試 targetDate；若不存在則退到前一日（重試 3 次涵蓋週末/假日）
  const tryDates = [targetDate];
  let cursor = targetDate;
  for (let i = 0; i < 3; i++) {
    const y = +cursor.slice(0, 4), m = +cursor.slice(4, 6), d = +cursor.slice(6, 8);
    const prev = new Date(y, m - 1, d - 1);
    cursor = fmtTwseDateYmd(prev);
    tryDates.push(cursor);
  }
  let t86 = null, margn = null, usedDate = null;
  for (const date of tryDates) {
    try {
      const [a, b] = await Promise.all([fetchT86ForDate(date), fetchMargnForDate(date)]);
      t86 = a;
      margn = b;
      usedDate = date;
      break;
    } catch (e) {
      // try previous date
    }
  }
  if (!t86 || !margn) throw new Error("近 4 日皆無籌碼資料");
  const t86Row = (t86.data || []).find(r => String(r[0]).trim() === code);
  const margnRow = (margn.tables?.[1]?.data || []).find(r => String(r[0]).trim() === code);
  const result = {
    ok: true,
    date: `${usedDate.slice(0, 4)}-${usedDate.slice(4, 6)}-${usedDate.slice(6, 8)}`,
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
  fillCardSlot(code, "inst", renderInstBody(data.date, data.t86Row));
  fillCardSlot(code, "margin", renderMarginBody(data.date, data.margnRow));
  updateTwSummary(code, { t86Row: data.t86Row, margnRow: data.margnRow, chipsDate: data.date });
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
  const inFilter = (s) => TW_INDUSTRY_FILTER === "全部" || s.industry === TW_INDUSTRY_FILTER;
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

function twIndustryQuickPicks(industry, limit = 12) {
  const list = DATA?.tw_stocks || [];
  if (industry === "全部") return TW_STOCK_QUICKPICK;
  // 取該產業前 N 檔（按代號排序）
  return list.filter(s => s.industry === industry).slice(0, limit).map(s => ({ code: s.code, name: s.name }));
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
  const dataCard = (slotId, title, sub, linkHref, linkLabel = "查詳細") => `
    <div class="tw-data-card">
      <div class="tw-data-card-title">${escapeHtml(title)}${sub ? ` <span class="tw-data-card-sub">${escapeHtml(sub)}</span>` : ""}</div>
      <div class="tw-data-card-body" id="${slotId}">
        <div class="tw-data-card-loading">載入中…</div>
      </div>
      <a class="tw-data-card-link" href="${escapeHtml(linkHref)}" target="_blank" rel="noopener">${escapeHtml(linkLabel)} →</a>
    </div>`;
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
  // PASS 1 卡片：3 張 data card + 5 張 plain card
  const pass1Cards = [
    dataCard(`tw-card-${code}-company`, "公司資料", "", `${yh}/profile`, "查 Yahoo"),
    dataCard(`tw-card-${code}-revenue`, "月營收", "", `${yh}/revenue`, "查 Yahoo"),
    isOtc
      ? noDataCard("損益表（季）", `${yh}/income-statement`, "上櫃股 TWSE OpenAPI 未提供，請至 Yahoo")
      : dataCard(`tw-card-${code}-finance`, "季營益", "", `${yh}/income-statement`, "查 Yahoo"),
    noDataCard("資產負債表", `${yh}/balance-sheet`),
    noDataCard("現金流量表", `${yh}/cash-flow-statement`),
    noDataCard("重大訊息／新聞", `${yh}/news`),
    noDataCard("MOPS 公司資料（原始揭露）", `${mops}/t05st01?co_id=${code}`),
    noDataCard("MOPS 月營收（原始揭露）", `${mops}/t146sb05?co_id=${code}`),
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
      ${linkSection("即時報價", "#019AB3", groups.realtime)}
      <div class="tw-res-section">
        <div class="tw-res-title" style="color:#017A8F">綜合小結</div>
        <div class="tw-summary" id="tw-summary-${escapeHtml(code)}"><div class="tw-sum-loading">資料載入中…</div></div>
      </div>
      <div class="tw-res-section">
        <div class="tw-res-title" style="color:#019AB3">1. 基本面</div>
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
  const industries = twIndustryList();
  if (!industries.length) return "";
  const all = DATA?.tw_stocks?.length || 0;
  const items = [{ name: "全部", count: all }, ...industries];
  return `<div class="tw-ind-tabs" id="tw-ind-tabs">${
    items.map(it => `
      <button class="tw-ind-tab ${TW_INDUSTRY_FILTER === it.name ? "active" : ""}" type="button" onclick="setTwIndustry('${escapeHtml(it.name)}')">
        ${escapeHtml(it.name)}<span class="tw-ind-tab-n">${it.count}</span>
      </button>
    `).join("")
  }</div>`;
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
        <input id="tw-stock-input" type="text" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(TW_STOCK_QUERY)}" autocomplete="off" />
        <button class="tw-search-btn" type="button" onclick="doTwStockSearch()">搜尋</button>
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
      if (e.key === "Enter") {
        e.preventDefault();
        doTwStockSearch();
      }
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

function renderTwStockSheet() {
  const lnk = (href, text) => `<a href="${href}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">${text}</a>`;
  return `
    <div style="background:linear-gradient(135deg,#019AB3,#003D91);color:#fff;padding:22px 24px;border-radius:10px;margin-bottom:20px">
      <h2 style="margin:0;color:#fff;border:none;font-size:22px">台股資訊</h2>
    </div>

    ${renderTwStockSearch()}

    <h3 style="font-size:16px;margin:18px 0 8px">檢視流程</h3>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:18px">
      <div style="background:#CCE8ED;padding:14px;border-radius:8px;text-align:center">
        <div style="font-size:16px;font-weight:bold;color:#003D91;margin:0 0 6px">MOPS 基本面</div>
        <div style="font-size:12px;color:#444">5 個必看頁面</div>
      </div>
      <div style="background:#E5F2F5;padding:14px;border-radius:8px;text-align:center">
        <div style="font-size:16px;font-weight:bold;color:#003D91;margin:0 0 6px">TWSE 籌碼</div>
        <div style="font-size:12px;color:#444">3 項關鍵指標</div>
      </div>
      <div style="background:#CCE8ED;padding:14px;border-radius:8px;text-align:center">
        <div style="font-size:16px;font-weight:bold;color:#003D91;margin:0 0 6px">產業／競爭</div>
        <div style="font-size:12px;color:#444">3 個檢核點</div>
      </div>
    </div>

    <h3 style="font-size:16px;margin:24px 0 8px">1. MOPS 看公司基本面</h3>
    <div style="background:#E5F2F5;padding:12px 16px;border-radius:6px;margin:10px 0;font-size:13px">
      入口：<b>${lnk("https://mops.twse.com.tw", "mops.twse.com.tw")}</b> → 上方搜尋輸入股票代號或公司名
    </div>
    <div style="overflow-x:auto">
    <table style="width:100%;border-collapse:collapse;font-size:13.5px;min-width:520px">
      <tr style="background:#019AB3;color:#fff">
        <th style="padding:10px;text-align:left;width:32px">#</th>
        <th style="padding:10px;text-align:left;width:38%">看什麼</th>
        <th style="padding:10px;text-align:left">記下什麼</th>
      </tr>
      <tr style="background:#F2F8FA"><td style="padding:8px 12px;text-align:center"><b>1</b></td><td style="padding:8px 12px"><b>公司治理一覽表</b></td><td style="padding:8px 12px">資本額、員工數、董事長、產業別、實收資本</td></tr>
      <tr><td style="padding:8px 12px;text-align:center"><b>2</b></td><td style="padding:8px 12px"><b>月營收</b>（每月 10 日後）</td><td style="padding:8px 12px">最近 12 個月趨勢、年增率、累計年增率</td></tr>
      <tr style="background:#F2F8FA"><td style="padding:8px 12px;text-align:center"><b>3</b></td><td style="padding:8px 12px"><b>最新季財報</b></td><td style="padding:8px 12px">三表 + 毛利率／營益率／EPS 三大關鍵</td></tr>
      <tr><td style="padding:8px 12px;text-align:center"><b>4</b></td><td style="padding:8px 12px"><b>重大訊息</b>（過去 3 個月）</td><td style="padding:8px 12px">併購、買回庫藏股、業績預警、董監異動</td></tr>
      <tr style="background:#F2F8FA"><td style="padding:8px 12px;text-align:center"><b>5</b></td><td style="padding:8px 12px"><b>法說會簡報</b></td><td style="padding:8px 12px">公司怎麼講自己（管理層敘事 vs 數字）</td></tr>
    </table>
    </div>

    <h3 style="font-size:16px;margin:24px 0 8px">2. TWSE 看籌碼</h3>
    <div style="background:#E5F2F5;padding:12px 16px;border-radius:6px;margin:10px 0;font-size:13px">
      入口：<b>${lnk("https://www.twse.com.tw", "www.twse.com.tw")}</b> → 交易資訊
    </div>
    <div style="overflow-x:auto">
    <table style="width:100%;border-collapse:collapse;font-size:13.5px;min-width:520px">
      <tr style="background:#017A8F;color:#fff">
        <th style="padding:10px;text-align:left;width:32px">#</th>
        <th style="padding:10px;text-align:left;width:38%">指標</th>
        <th style="padding:10px;text-align:left">看什麼</th>
      </tr>
      <tr style="background:#F2F8FA"><td style="padding:8px 12px;text-align:center"><b>1</b></td><td style="padding:8px 12px"><b>三大法人買賣超</b>（最近 5 日）</td><td style="padding:8px 12px">外資、投信、自營商各別買賣超；連買連賣天數</td></tr>
      <tr><td style="padding:8px 12px;text-align:center"><b>2</b></td><td style="padding:8px 12px"><b>融資融券餘額變化</b></td><td style="padding:8px 12px">融資增 = 散戶看好；融券增 = 看空或避險</td></tr>
      <tr style="background:#F2F8FA"><td style="padding:8px 12px;text-align:center"><b>3</b></td><td style="padding:8px 12px"><b>借券賣出餘額</b></td><td style="padding:8px 12px">外資／法人放空指標；快速攀升警訊</td></tr>
    </table>
    </div>

    <h3 style="font-size:16px;margin:24px 0 8px">3. 產業／競爭</h3>
    <div style="overflow-x:auto">
    <table style="width:100%;border-collapse:collapse;font-size:13.5px;min-width:520px">
      <tr style="background:#17B5AD;color:#fff">
        <th style="padding:10px;text-align:left;width:32px">#</th>
        <th style="padding:10px;text-align:left;width:38%">資料</th>
        <th style="padding:10px;text-align:left">用途</th>
      </tr>
      <tr style="background:#F2F8FA"><td style="padding:8px 12px;text-align:center"><b>1</b></td><td style="padding:8px 12px"><b>公司年報「行業狀況」章節</b></td><td style="padding:8px 12px">產業地位、市佔、上下游、技術門檻</td></tr>
      <tr><td style="padding:8px 12px;text-align:center"><b>2</b></td><td style="padding:8px 12px"><b>最近一次法說會 Q&amp;A</b></td><td style="padding:8px 12px">分析師問什麼 = 市場關注點</td></tr>
      <tr style="background:#F2F8FA"><td style="padding:8px 12px;text-align:center"><b>3</b></td><td style="padding:8px 12px"><b>同業比較表</b>（找 3 家競品）</td><td style="padding:8px 12px">營收成長、毛利率、PE、ROE 對比</td></tr>
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
    <table style="width:100%;border-collapse:collapse;font-size:13.5px;min-width:520px">
      <tr style="background:#F2F8FA"><td style="padding:8px 12px;width:30%"><b>MOPS</b></td><td style="padding:8px 12px">${lnk("https://mops.twse.com.tw", "mops.twse.com.tw")} — 第一手揭露</td></tr>
      <tr><td style="padding:8px 12px"><b>TWSE</b></td><td style="padding:8px 12px">${lnk("https://www.twse.com.tw", "www.twse.com.tw")} — 行情、籌碼</td></tr>
      <tr style="background:#F2F8FA"><td style="padding:8px 12px"><b>Goodinfo!</b></td><td style="padding:8px 12px">${lnk("https://goodinfo.tw", "goodinfo.tw")} — 個股資料總覽（二手，僅供發現）</td></tr>
      <tr><td style="padding:8px 12px"><b>財報狗</b></td><td style="padding:8px 12px">${lnk("https://statementdog.com", "statementdog.com")} — 財報視覺化</td></tr>
      <tr style="background:#F2F8FA"><td style="padding:8px 12px"><b>CMoney</b></td><td style="padding:8px 12px">${lnk("https://cmoney.tw", "cmoney.tw")} — 法人籌碼</td></tr>
    </table>
    </div>
    <p style="color:var(--text-mute);font-size:12.5px;margin:10px 0 4px">二手網站只用來「快速發現」，最終決策必回 MOPS／TWSE 對原始資料。</p>

    <p class="a-note" style="margin-top:24px;font-size:12px;color:var(--text-mute)">個人研究 SOP v1.0 · 2026-05-08 建立</p>
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
    ? `${st.weekly_change_pct >= 0 ? "+" : ""}${st.weekly_change_pct.toFixed(2)}%`
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
    const prefix = kind === "TW" ? "" : "$";
    return prefix + p.toLocaleString("en-US", { maximumFractionDigits: 2 });
  };
  // 來源驗證 URL：美股優先 Yahoo Finance 歷史頁（使用者偏好），台股優先 Yahoo TW
  const verifyUrl = (s) => {
    if (s.kind === "TW") return `https://tw.stock.yahoo.com/quote/${s.symbol}.TW/history`;
    return `https://finance.yahoo.com/quote/${encodeURIComponent(s.symbol)}/history`;
  };
  const srcLabel = (s) => s.kind === "TW"
    ? "原始來源：TWSE；驗證：Yahoo TW 歷史頁"
    : "原始來源：finnhub /quote（價/日%）+ Yahoo（MTD/YTD）；驗證：Yahoo Finance 歷史頁";
  const rows = list.map(s => `
    <tr>
      <td>${s.source_url
        ? `<a href="${s.source_url}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline" title="${escapeHtml(srcLabel(s))}">${escapeHtml(s.name_zh)}</a>`
        : escapeHtml(s.name_zh)}</td>
      <td>${fmtPrice(s.price, s.kind)}</td>
      <td class="${pctClass(s.change_pct)}">${fmtPct(s.change_pct)}</td>
      <td class="${pctClass(s.mtd_pct)}">${fmtPct(s.mtd_pct)}</td>
      <td class="${pctClass(s.ytd_pct)}">${fmtPct(s.ytd_pct)}</td>
      <td class="date-col"><a href="${verifyUrl(s)}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline; text-decoration-style:dotted;" title="${escapeHtml(srcLabel(s))}">${escapeHtml(shortDate(s.market_date))}</a></td>
    </tr>
  `).join("");
  return `
    ${title ? `<h3>${title}</h3>` : ""}
    <table class="indices">
      <thead><tr>
        <th>名稱</th>
        <th title="收盤價，來源見名稱欄連結">收盤</th>
        <th title="日報酬率，定義：今日收盤 vs 昨日收盤；來源：finnhub /quote (US) 或 TWSE (TW)">日</th>
        <th title="月初到今報酬率（MTD），來源：Yahoo (US) 或 TWSE (TW)">本月</th>
        <th title="年初到今報酬率（YTD），來源：Yahoo (US) 或 TWSE (TW)">今年</th>
        <th class="date-col" title="收盤日：finnhub quote 的 timestamp（ET 時區）轉日期，或 TWSE 公告日">收盤日</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
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
      <h3>影響因素</h3>
      <div class="fund-card">
        <ul style="font-size:14px; line-height:1.7; padding-left:20px; margin:0">
          ${tldr.map(t => `<li>${escapeHtml(t)}</li>`).join("")}
        </ul>
      </div>` : ""}
  `;
}

function renderNewsSheet() {
  return `
    <div class="tabs">
      <button class="tab active" data-tab="market">市場</button>
      <button class="tab" data-tab="wm">財管</button>
      <button class="tab" data-tab="tax">稅務</button>
    </div>
    <div id="tab-market">${renderNewsByCategory("market")}</div>
    <div id="tab-wm" hidden>${renderNewsByCategory("wm")}</div>
    <div id="tab-tax" hidden>${renderNewsByCategory("tax")}</div>
  `;
}

// 把 news.json 的 sections 名稱對應到 3 大類
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
};

function sectionCategory(section) {
  const en = section.section || "";
  const zh = section.section_zh || "";
  return SECTION_TO_CATEGORY[en] || SECTION_TO_CATEGORY[zh] || "market";
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
          <div class="summary">${escapeHtml(it.summary_zh || "")}</div>
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
  return "NT$ " + Math.round(n).toLocaleString("en-US");
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
    <div class="kv"><span>實質稅率</span><b>${income > 0 ? (tax / income * 100).toFixed(2) : 0}%</b></div>`;
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
  return funds.map(f => {
    const nameHtml = f.source_url
      ? `<a href="${f.source_url}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">${escapeHtml(f.name_zh)}</a>`
      : escapeHtml(f.name_zh);
    const chips = currencyChip(f.currency);
    return `
    <div class="fund-card">
      <h3>${nameHtml}</h3>
      ${chips ? `<div style="margin-bottom:6px">${chips}</div>` : ""}
      <p class="tagline">${escapeHtml(f.tagline || "")}</p>
      <div class="grid">
        <div>
          <label>淨值</label>
          ${fmtNum(f.nav)} ${escapeHtml(f.currency || "")}
          ${f.nav_date ? `<div class="cell-sub">${escapeHtml(shortDate(f.nav_date))}</div>` : ""}
        </div>
        <div><label>日漲跌</label><span class="${pctClass(f.change_pct)}">${fmtPct(f.change_pct)}</span></div>
        <div><label>近1月</label><span class="${pctClass(f.perf?.['1m'])}">${perfLink(fmtPct(f.perf?.['1m']), f.source_url)}</span></div>
        <div><label>近3月</label><span class="${pctClass(f.perf?.['3m'])}">${perfLink(fmtPct(f.perf?.['3m']), f.source_url)}</span></div>
        <div><label>今年來</label><span class="${pctClass(f.perf?.ytd)}">${perfLink(fmtPct(f.perf?.ytd), f.source_url)}</span></div>
      </div>
    </div>`;
  }).join("");
}

function renderDcaFundCards() {
  const list = ((DATA.dca || {}).funds) || [];
  if (!list.length) {
    return "<p style='color:var(--text-mute); padding:20px 0'>尚未提供定期定額清單</p>";
  }
  return list.map(f => {
    const nameHtml = f.source_url
      ? `<a href="${f.source_url}" target="_blank" rel="noopener">${escapeHtml(f.name_zh)}</a>`
      : escapeHtml(f.name_zh);
    const catChip = f.category
      ? `<span class="chip chip-default" style="background:#E5F2F5;color:var(--brand-deep);margin-left:4px">${escapeHtml(f.category)}</span>`
      : "";
    return `
    <div class="fund-card">
      <h3>${nameHtml}</h3>
      <div style="margin-bottom:6px">${currencyChip(f.currency)}${catChip}</div>
      <p class="tagline">${escapeHtml(f.tagline || "")}</p>
      <div class="grid">
        <div>
          <label>淨值</label>
          ${fmtNum(f.nav)} ${escapeHtml(f.currency || "")}
          ${f.nav_date ? `<div class="cell-sub">${escapeHtml(shortDate(f.nav_date))}</div>` : ""}
        </div>
        <div><label>日漲跌</label><span class="${pctClass(f.change_pct)}">${fmtPct(f.change_pct)}</span></div>
        <div><label>近1月</label><span class="${pctClass(f.perf?.['1m'])}">${perfLink(fmtPct(f.perf?.['1m']), f.source_url)}</span></div>
        <div><label>近3月</label><span class="${pctClass(f.perf?.['3m'])}">${perfLink(fmtPct(f.perf?.['3m']), f.source_url)}</span></div>
        <div><label>今年來</label><span class="${pctClass(f.perf?.ytd)}">${perfLink(fmtPct(f.perf?.ytd), f.source_url)}</span></div>
      </div>
    </div>`;
  }).join("");
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
  const thBase = "padding:6px 8px;border-bottom:1px solid var(--border);background:#CCE8ED";

  const headerCells = periods.map(p =>
    `<th style="${thBase};text-align:right">${p.label}</th>`
  ).join("");

  const groupHeader = (title, bg) => `<tr>
    <td colspan="${periods.length + 1}" style="padding:10px 8px;font-weight:600;color:var(--brand-deep);background:${bg};border-bottom:1px solid var(--border)">${escapeHtml(title)}</td>
  </tr>`;

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
    return `<tr><td style="${tdBase};white-space:nowrap">${nameHtml}</td>${cells}</tr>`;
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
    <div style="overflow-x:auto">
      <table style="width:100%;border-collapse:collapse;font-size:13px">
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
    : `${Number(s.aum_twd_yi).toLocaleString("zh-TW", { maximumFractionDigits: 0 })} 億元`;
  const foreignNote = (s.aum_twd_yi != null && s.aum_ccy && s.aum_ccy !== "台幣" && s.aum_ccy !== "新台幣")
    ? `<span class="cmp-basics-note">（${escapeHtml(s.aum_ccy)}規模匯率換算）</span>` : "";
  const aumDate = s.aum_date ? `<span class="cmp-basics-note">${escapeHtml(s.aum_date)}</span>` : "";
  const exp = (s.expense_ratio === null || s.expense_ratio === undefined)
    ? "—" : `${Number(s.expense_ratio).toFixed(2)}%`;
  const dy = (s.distribution_yield === null || s.distribution_yield === undefined)
    ? "—" : `${Number(s.distribution_yield).toFixed(2)}%`;
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
  const fmtV = (v, suffix) => (v === null || v === undefined) ? "—" : `${Number(v).toFixed(2)}${suffix || ""}`;

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
  const tabIds = ["tab-market", "tab-wm", "tab-tax"];
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

// ============ 資產規劃 (Asset Planning) ============
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
    <h2>📊 資產規劃（個人 PoC）</h2>
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
