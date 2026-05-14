// Morning Board app
const $ = (id) => document.getElementById(id);

const INDEX_NAMES = {
  "TAIEX": "加權指數",
  "S&P 500": "標普 500",
  "Nasdaq": "那斯達克",
  "Dow Jones": "道瓊",
  "Nikkei 225": "日經 225",
  "Hang Seng": "恆生指數",
  "恆生": "恆生指數",
  "KOSPI": "韓國綜合",
  "Shanghai Composite": "上證綜合",
  "上證": "上證綜合",
  "Shenzhen": "深證成指",
  "滬深300": "滬深 300",
  "Nifty 50": "印度 50",
  "ASX 200": "澳洲 200",
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
  "S&P 500": "SPY.US",
  "Nasdaq": "AI000020",
  "Dow Jones": "AI000010",
  "Nikkei 225": "AI000030",
  "KOSPI": "AI000070",
  "Hang Seng": "AI000040",
  "恆生": "AI000040",
  "Shanghai Composite": "AI000220",
  "上證": "AI000220",
  "滬深300": "AI000545",
  "Euro Stoxx 50": "AI001048",
  "ASX 200": "AI000320",
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

function flashFindInContent(needle) {
  if (!needle) return false;
  const root = $("content");
  if (!root) return false;
  const lower = needle.toLowerCase().trim();
  if (!lower) return false;
  // 取得所有葉節點（含文字的最內層 element）
  const all = root.querySelectorAll("h1, h2, h3, h4, p, td, li, span, div, button, a");
  let hit = null;
  for (const el of all) {
    // 跳過容器類元素（避免命中整個 pane）
    if (el.children.length > 3) continue;
    const text = (el.textContent || "").toLowerCase();
    if (text.includes(lower)) { hit = el; break; }
  }
  if (!hit) return false;
  hit.scrollIntoView({ behavior: "smooth", block: "center" });
  hit.classList.add("flash-hit");
  setTimeout(() => hit.classList.remove("flash-hit"), 2200);
  return true;
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
  // 精選基金
  for (const f of (DATA.funds?.funds || [])) {
    idx.push({ tab: "funds", tabLabel: "精選基金", title: f.name_zh || "", text: f.tagline || "" });
  }
  // 定期定額
  for (const f of (DATA.dca?.funds || [])) {
    idx.push({ tab: "dca", tabLabel: "定期定額", title: f.name_zh || "", text: f.tagline || "" });
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
    idx.push({ tab: "market", tabLabel: "全球市場 · 台股", title: `${s.symbol} ${s.name_zh || ""}`.trim(), text: "" });
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
  return idx;
}

function runSearch(q) {
  q = (q || "").trim().toLowerCase();
  if (!q) return [];
  const out = [];
  for (const item of SEARCH_INDEX) {
    const hay = ((item.title || "") + " " + (item.text || "")).toLowerCase();
    const pos = hay.indexOf(q);
    if (pos < 0) continue;
    const raw = (item.title || "") + " · " + (item.text || "");
    const before = Math.max(0, pos - 20);
    const after = Math.min(raw.length, pos + q.length + 40);
    const snippet = (before > 0 ? "…" : "") + raw.slice(before, after) + (after < raw.length ? "…" : "");
    out.push({ ...item, snippet });
    if (out.length >= 30) break;
  }
  return out;
}

function wireSearch() {
  const input = $("search-input");
  const panel = $("search-results");
  if (!input || !panel) { console.warn("[search] input/panel not found"); return; }
  console.log("[search] wired. SEARCH_INDEX size:", SEARCH_INDEX.length);
  let timer;
  const doSearch = (q) => {
    if (!q.trim()) { panel.hidden = true; panel.innerHTML = ""; return; }
    if (!SEARCH_INDEX || !SEARCH_INDEX.length) {
      // 首次輸入時若 index 還空，現場建一次
      try { SEARCH_INDEX = buildSearchIndex(); } catch(e) { console.error("[search] build idx fail:", e); }
    }
    const results = runSearch(q);
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
  // 阻止 main-nav 攔截搜尋 panel click
  panel.addEventListener("mousedown", e => e.stopPropagation());
  // 點外部關閉
  document.addEventListener("click", e => {
    if (!input.contains(e.target) && !panel.contains(e.target)) panel.hidden = true;
  });
}

async function init() {
  // 每個來源各自有 fallback：一個壞不拖垮全頁
  const safe = (name, fallback) => load(name).catch(() => fallback);
  const [meta, market, news, tax, funds, stocks, popular, insurance, obonds, targets, allocation, dca, wealth] = await Promise.all([
    safe("meta", { built_at: "", today: "", sources_status: {} }),
    safe("market", { closing_date: "", indices: [], bonds: [], fx: [], summary: "" }),
    safe("news", { news_date: "", tldr: [], sections: [] }),
    safe("tax", { tax_date: "", items: [] }),
    safe("funds", { funds: [] }),
    safe("stocks", { us_stocks: [], tw_stocks: [] }),
    safe("popular_stocks", { stocks: [] }),
    safe("insurances", { insurances: [] }),
    safe("overseas_bonds", { bonds: [] }),
    safe("targets", { targets: [], summary: {}, entry_sequence: [] }),
    safe("allocation", { profiles: [], references: [] }),
    safe("dca", { funds: [] }),
    safe("wealth_transfer", { topics: [] }),
  ]);
  DATA = { meta, market, news, tax, funds, stocks, popular, insurance, obonds, targets, allocation, dca, wealth };
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
  else if (name === "dca") body.innerHTML = renderDcaSheet();
  else if (name === "targets") body.innerHTML = renderTargetsSheet();
  else if (name === "allocation") body.innerHTML = renderAllocationSheet();
  else if (name === "wealth") body.innerHTML = renderWealthSheet();
  else if (name === "calc") body.innerHTML = renderCalcSheet();
  if (name === "news") wireNewsTabs();
  if (name === "market") wireMarketTabs();
  if (name === "targets") wireTargetsTabs();
  if (name === "allocation") wireAllocationTabs();
  if (name === "wealth") wireWealthTabs();
  if (name === "calc") wireCalcTabs();
  if (PENDING_HIGHLIGHT) {
    const target = PENDING_HIGHLIGHT;
    PENDING_HIGHLIGHT = null;
    setTimeout(() => flashFindInContent(target), 80);
  } else {
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }
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
  const safe = (name, fallback) => load(name).catch(() => DATA[name === "insurances" ? "insurance" : name] || fallback);
  const [meta, market, news, tax, funds, stocks, popular, insurance, obonds, targets, allocation, dca, wealth] = await Promise.all([
    safe("meta", { built_at: "", today: "", sources_status: {} }),
    safe("market", { closing_date: "", indices: [], bonds: [], fx: [], summary: "" }),
    safe("news", { news_date: "", tldr: [], sections: [] }),
    safe("tax", { tax_date: "", items: [] }),
    safe("funds", { funds: [] }),
    safe("stocks", { us_stocks: [], tw_stocks: [] }),
    safe("popular_stocks", { stocks: [] }),
    safe("insurances", { insurances: [] }),
    safe("overseas_bonds", { bonds: [] }),
    safe("targets", { targets: [], summary: {}, entry_sequence: [] }),
    safe("allocation", { profiles: [], references: [] }),
    safe("dca", { funds: [] }),
    safe("wealth_transfer", { topics: [] }),
  ]);
  DATA = { meta, market, news, tax, funds, stocks, popular, insurance, obonds, targets, allocation, dca, wealth };
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
        <div><label>近1月</label><span class="${pctClass(perf['1m'])}">${fmtPct(perf['1m'])}</span></div>
        <div><label>今年</label><span class="${pctClass(perf.ytd)}">${fmtPct(perf.ytd)}</span></div>
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

function renderAllocationSheet() {
  const data = DATA.allocation || {};
  const profiles = data.profiles || [];
  const refs = data.references || [];
  if (!profiles.length) {
    return "<p style='color:var(--text-mute); padding:20px 0'>尚未提供資產配置資料</p>";
  }

  const tabBtns = profiles.map((p, i) => `
    <button class="tab ${i === 0 ? "active" : ""}" data-atab="${escapeHtml(p.key)}">${escapeHtml(p.name)}</button>
  `).join("");

  const panes = profiles.map((p, i) => {
    const total = (p.allocations || []).reduce((s, a) => s + (a.pct || 0), 0);
    const rows = (p.allocations || []).map(a => `
      <div class="a-row">
        <div class="a-asset">
          <div class="a-asset-name">${escapeHtml(a.asset)}</div>
          <div class="a-asset-note">${escapeHtml(a.note || "")}</div>
        </div>
        <div class="a-bar-wrap">
          <div class="a-bar" style="width:${a.pct}%;background:${p.color || 'var(--brand-primary)'}"></div>
          <span class="a-pct">${a.pct}%</span>
        </div>
        <div class="a-panhsin">${escapeHtml(a.panhsin || "")}</div>
      </div>
    `).join("");

    return `
      <div class="t-pane ${i === 0 ? "active" : ""}" id="a-pane-${escapeHtml(p.key)}">
        <div class="a-head">
          <div>
            <div class="a-name">${escapeHtml(p.name)}<span class="a-sub">${escapeHtml(p.subtitle || "")}</span></div>
            <div class="a-stat-row">
              <span class="a-stat"><label>目標報酬</label>${escapeHtml(p.target_return || "—")}</span>
              <span class="a-stat"><label>最大回撤</label>${escapeHtml(p.max_drawdown || "—")}</span>
              <span class="a-stat"><label>合計</label>${total}%</span>
            </div>
          </div>
        </div>
        <div class="a-table">
          <div class="a-header">
            <div>資產類別</div>
            <div>比重</div>
            <div>板信對應商品</div>
          </div>
          ${rows}
        </div>
      </div>
    `;
  }).join("");

  const refsHtml = refs.length ? `
    <h3>市場參考資料來源</h3>
    <div class="a-refs">
      ${refs.map(r => `
        <a href="${r.url}" target="_blank" rel="noopener" class="a-ref">
          <div class="a-ref-name">${escapeHtml(r.name)} ↗</div>
          <div class="a-ref-note">${escapeHtml(r.note || "")}</div>
        </a>`).join("")}
    </div>` : "";

  const noteHtml = data.note ? `<p class="a-note">${escapeHtml(data.note)}</p>` : "";

  return `
    <div class="tabs">${tabBtns}</div>
    <div class="t-panes">${panes}</div>
    ${refsHtml}
    ${noteHtml}
  `;
}

function wireAllocationTabs() {
  const buttons = document.querySelectorAll(".tab[data-atab]");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.atab;
      buttons.forEach(b => b.classList.toggle("active", b.dataset.atab === key));
      document.querySelectorAll(".t-pane[id^='a-pane-']").forEach(p => {
        p.classList.toggle("active", p.id === `a-pane-${key}`);
      });
    });
  });
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
  const bondRows = (m.bonds || []).map(b => `
    <tr>
      <td>${bondLink(b.name)}</td>
      <td>${b.yield_pct != null ? b.yield_pct.toFixed(2) + "%" : "—"}</td>
      <td class="${bpsClass(b.daily_bps)}">${fmtBps(b.daily_bps)}</td>
      <td class="${bpsClass(b.mtd_bps)}">${fmtBps(b.mtd_bps)}</td>
      <td class="date-col">${escapeHtml(shortDate(b.closing_date) || date)}</td>
    </tr>
  `).join("");

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
        <th>指數</th><th>收盤</th><th>日</th><th>本月</th><th>今年</th><th class="date-col">收盤日</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;

  const bondsTab = bondRows ? `
    <table class="indices">
      <thead><tr>
        <th>債別</th><th>殖利率</th><th>日變動</th><th>本月變動</th><th class="date-col">收盤日</th>
      </tr></thead>
      <tbody>${bondRows}</tbody>
    </table>` : `<p style="color:var(--text-mute); padding:20px 0">尚未提供公債資料</p>`;

  const fxTab = fxRows ? `
    <table class="indices">
      <thead><tr>
        <th>幣別</th><th>收盤</th><th>日</th><th>本月</th><th>今年</th><th class="date-col">收盤日</th>
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
  const hasAny = curated.length || popular.length;
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
  return note + curatedBlock + popularBlock;
}

function renderStocksTable(title, list) {
  if (!list || !list.length) return "";
  const fmtPrice = (p, kind) => {
    if (p === null || p === undefined) return "—";
    const prefix = kind === "TW" ? "" : "$";
    return prefix + p.toLocaleString("en-US", { maximumFractionDigits: 2 });
  };
  const rows = list.map(s => `
    <tr>
      <td>${s.source_url
        ? `<a href="${s.source_url}" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline">${escapeHtml(s.name_zh)}</a>`
        : escapeHtml(s.name_zh)}</td>
      <td>${fmtPrice(s.price, s.kind)}</td>
      <td class="${pctClass(s.change_pct)}">${fmtPct(s.change_pct)}</td>
      <td class="${pctClass(s.mtd_pct)}">${fmtPct(s.mtd_pct)}</td>
      <td class="${pctClass(s.ytd_pct)}">${fmtPct(s.ytd_pct)}</td>
      <td class="date-col">${escapeHtml(shortDate(s.market_date))}</td>
    </tr>
  `).join("");
  return `
    ${title ? `<h3>${title}</h3>` : ""}
    <table class="indices">
      <thead><tr>
        <th>名稱</th><th>收盤</th><th>日</th><th>本月</th><th>今年</th><th class="date-col">收盤日</th>
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
          ${it.source_url ? `<a class="source" href="${it.source_url}" target="_blank" rel="noopener">${escapeHtml(it.source_name || "來源")} ↗</a>` : ""}
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
            ${it.source_url ? `<a class="source" href="${it.source_url}" target="_blank" rel="noopener">${escapeHtml(it.source_name || "來源")} ↗</a>` : ""}
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
            <span class="w-law-code">${escapeHtml(law.code || "")}</span>
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
  {key: "income",    name: "綜所稅"},
  {key: "amt",       name: "最低稅負制"},
  {key: "gift",      name: "贈與稅"},
  {key: "estate",    name: "遺產稅"},
  {key: "house",     name: "房地合一稅"},
  {key: "land",      name: "土地增值稅"},
  {key: "case_house",name: "案例：房產繼承 vs 贈與"},
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
    </div>
    <p class="a-note" style="margin-top:24px">本試算依 114 年度（2026 年申報）級距，僅供參考。實際以稅捐稽徵機關核定為準。</p>
  `;
}

function renderCalcCaseHouse() {
  return `
    <div class="calc-form">
      <h3>案例試算：房產繼承 vs 贈與比較</h3>
      <p style="font-size:13px; color:var(--text-sub); margin-bottom:14px">
        同一筆房地，比較「繼承」與「贈與」兩種傳承方式之稅負總成本（含本次傳承稅 ＋ 未來出售之房地合一稅）。
      </p>
      <h4 style="margin:8px 0 6px;font-size:14px;color:var(--brand-deep)">房產基本資料</h4>
      <div class="calc-row"><label>土地公告現值（取得時）</label><input type="number" id="cx-land-cur" placeholder="例：12000000"></div>
      <div class="calc-row"><label>房屋評定標準價格（取得時）</label><input type="number" id="cx-house-cur" placeholder="例：3000000"></div>
      <div class="calc-row"><label>土地原規定地價／前次移轉現值</label><input type="number" id="cx-land-ori" placeholder="例：5000000"></div>
      <div class="calc-row"><label>市價（預估出售金額）</label><input type="number" id="cx-market" placeholder="例：30000000"></div>
      <h4 style="margin:14px 0 6px;font-size:14px;color:var(--brand-deep)">家庭情況（影響遺產稅扣除額）</h4>
      <div class="calc-row"><label>被繼承人遺產總額（含本房產）</label><input type="number" id="cx-estate-total" placeholder="例：40000000"></div>
      <div class="calc-row"><label>有配偶？（有則扣 553 萬）</label>
        <select id="cx-spouse"><option value="0">無</option><option value="1" selected>有</option></select>
      </div>
      <div class="calc-row"><label>直系卑親屬人數（每人扣 56 萬）</label><input type="number" id="cx-children" value="2"></div>
      <div class="calc-row"><label>其他扣除額（喪葬 138 萬已預設）</label><input type="number" id="cx-other-deduct" value="1380000"></div>
      <h4 style="margin:14px 0 6px;font-size:14px;color:var(--brand-deep)">贈與情境</h4>
      <div class="calc-row"><label>受贈人為配偶？（土增稅不課徵）</label>
        <select id="cx-gift-spouse"><option value="0" selected>否（直系卑親屬）</option><option value="1">是</option></select>
      </div>
      <div class="calc-row"><label>當年度其他贈與（影響 244 萬免稅）</label><input type="number" id="cx-other-gift" value="0"></div>
      <h4 style="margin:14px 0 6px;font-size:14px;color:var(--brand-deep)">日後出售情境</h4>
      <div class="calc-row"><label>繼承後預計持有年數再出售</label><input type="number" id="cx-hold-inherit" value="11"></div>
      <div class="calc-row"><label>贈與後預計持有年數再出售</label><input type="number" id="cx-hold-gift" value="3"></div>
      <div class="calc-row"><label>是否符合自住 6 年條件再出售</label>
        <select id="cx-selfuse"><option value="0">否</option><option value="1">是</option></select>
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
      <h4>建議判斷原則</h4>
      <ul>
        <li>遺產 &lt; 1,333 萬免稅額：繼承幾乎零成本，明顯優於贈與</li>
        <li>遺產 1,471 萬 ~ 2,000 萬：繼承 10% 稅率，仍多優於贈與（贈與含土增＋契稅）</li>
        <li>遺產 ≥ 5,621 萬：邊際稅率 15-20%，可考慮分年贈與（每年 244 萬免稅額）攤平</li>
        <li>急需移轉控制權／怕保留遺產失敗：贈與雖貴但確定</li>
        <li>受贈後短期出售（&lt; 5 年）：贈與路徑房地合一 35-45%，總成本反而高，建議繼承</li>
        <li>受贈為配偶：土增稅不課徵、契稅減半，但仍須贈與稅；可作為配偶間財產移轉</li>
      </ul>
      <p class="calc-note-src">資料來源：遺贈稅法 §16-§22、§39；所得稅法 §14-4；土地稅法 §28-§39-1；契稅條例</p>
    </details>`;
}

function doCalcCaseHouse() {
  const landCur = +$("cx-land-cur").value || 0;       // 土地公告現值（取得時）
  const houseCur = +$("cx-house-cur").value || 0;     // 房屋評定價（取得時）
  const landOri = +$("cx-land-ori").value || 0;       // 土地原規定地價
  const market = +$("cx-market").value || 0;          // 市價
  const estateTotal = +$("cx-estate-total").value || 0;
  const hasSpouse = +$("cx-spouse").value === 1;
  const children = +$("cx-children").value || 0;
  const otherDeduct = +$("cx-other-deduct").value || 0;
  const giftSpouse = +$("cx-gift-spouse").value === 1;
  const otherGift = +$("cx-other-gift").value || 0;
  const holdInherit = +$("cx-hold-inherit").value || 0;
  const holdGift = +$("cx-hold-gift").value || 0;
  const selfUse = +$("cx-selfuse").value === 1;

  // 房地價值（公告現值總和，課稅基準）
  const declaredValue = landCur + houseCur;

  // ========== 繼承路徑 ==========
  const inheritDeductions = (hasSpouse ? 5530000 : 0) + children * 560000 + otherDeduct;
  const estateRes = calcEstateTax(estateTotal, inheritDeductions);
  // 房產佔遺產比例 → 攤分到本房產的遺產稅
  const houseShareInherit = estateTotal > 0 ? declaredValue / estateTotal : 0;
  const inheritEstateTax = estateRes.tax * houseShareInherit;
  // 繼承免徵土增稅、契稅
  // 未來出售房地合一：取得成本 = 公告現值 + 房屋評定價（繼承時）
  const inheritGain = Math.max(0, market - declaredValue);
  const inheritHL = calcHouseLandTax(inheritGain, holdInherit, selfUse);
  const inheritTotal = inheritEstateTax + inheritHL.tax;

  // ========== 贈與路徑 ==========
  const giftAmount = declaredValue + otherGift;
  const giftRes = calcGiftTax(giftAmount);
  // 攤分到本房產
  const houseShareGift = giftAmount > 0 ? declaredValue / giftAmount : 1;
  const giftTaxOnHouse = giftRes.tax * houseShareGift;
  // 土地增值稅（贈與須課，配偶間不課徵）
  let giftLVT = 0;
  if (!giftSpouse) {
    const incLand = landCur - landOri;
    const lvtRes = calcLandValueTax(incLand, landOri, false, 0);
    giftLVT = lvtRes.tax;
  }
  // 房屋契稅 6%
  const giftDeed = houseCur * 0.06;
  // 未來出售房地合一：取得成本 = 公告現值 + 房屋評定價（贈與時）
  const giftGain = Math.max(0, market - declaredValue);
  const giftHL = calcHouseLandTax(giftGain, holdGift, selfUse);
  const giftTotal = giftTaxOnHouse + giftLVT + giftDeed + giftHL.tax;

  const winner = inheritTotal < giftTotal ? "繼承" : "贈與";
  const diff = Math.abs(inheritTotal - giftTotal);

  $("cx-result").innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:10px">
      <div style="padding:10px;background:#fff;border-radius:6px;border-left:4px solid var(--brand-deep)">
        <div style="font-size:13px;color:var(--brand-deep);font-weight:700;margin-bottom:6px">🏛️ 繼承路徑</div>
        <div class="kv"><span>遺產稅（房產佔比）</span><b>${fmtMoney(inheritEstateTax)}</b></div>
        <div class="kv"><span>土地增值稅</span><b style="color:var(--down)">免徵</b></div>
        <div class="kv"><span>房屋契稅</span><b style="color:var(--down)">免徵</b></div>
        <div class="kv"><span>未來出售房地合一（${inheritHL.rate}）</span><b>${fmtMoney(inheritHL.tax)}</b></div>
        <div class="kv" style="border-top:1px solid var(--border);margin-top:6px;padding-top:6px"><span>合計</span><b style="color:var(--up);font-size:16px">${fmtMoney(inheritTotal)}</b></div>
      </div>
      <div style="padding:10px;background:#fff;border-radius:6px;border-left:4px solid #e08a3c">
        <div style="font-size:13px;color:#e08a3c;font-weight:700;margin-bottom:6px">🎁 贈與路徑</div>
        <div class="kv"><span>贈與稅（房產佔比）</span><b>${fmtMoney(giftTaxOnHouse)}</b></div>
        <div class="kv"><span>土地增值稅${giftSpouse?'（配偶不課徵）':''}</span><b>${fmtMoney(giftLVT)}</b></div>
        <div class="kv"><span>房屋契稅 6%</span><b>${fmtMoney(giftDeed)}</b></div>
        <div class="kv"><span>未來出售房地合一（${giftHL.rate}）</span><b>${fmtMoney(giftHL.tax)}</b></div>
        <div class="kv" style="border-top:1px solid var(--border);margin-top:6px;padding-top:6px"><span>合計</span><b style="color:var(--up);font-size:16px">${fmtMoney(giftTotal)}</b></div>
      </div>
    </div>
    <div style="padding:12px 14px;background:linear-gradient(135deg,#E5F2F5,#fff);border-radius:8px;border-left:5px solid var(--brand-primary)">
      <div style="font-size:15px;font-weight:700;color:var(--brand-deep);margin-bottom:4px">建議：${winner}路徑較划算</div>
      <div style="font-size:13px;color:var(--text-sub)">差額約 <b>${fmtMoney(diff)}</b>${winner === "繼承" ? "；惟須等待被繼承人離世，無立即移轉效果。" : "；可立即移轉房產控制權。"}</div>
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

function renderDcaSheet() {
  const dca = DATA.dca || {};
  const list = dca.funds || [];
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
        <div><label>近1月</label><span class="${pctClass(f.perf?.['1m'])}">${fmtPct(f.perf?.['1m'])}</span></div>
        <div><label>近3月</label><span class="${pctClass(f.perf?.['3m'])}">${fmtPct(f.perf?.['3m'])}</span></div>
        <div><label>今年來</label><span class="${pctClass(f.perf?.ytd)}">${fmtPct(f.perf?.ytd)}</span></div>
      </div>
    </div>`;
  }).join("");
}

function renderFundsSheet() {
  const funds = DATA.funds.funds || [];
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
        <div><label>近1月</label><span class="${pctClass(f.perf?.['1m'])}">${fmtPct(f.perf?.['1m'])}</span></div>
        <div><label>近3月</label><span class="${pctClass(f.perf?.['3m'])}">${fmtPct(f.perf?.['3m'])}</span></div>
        <div><label>今年來</label><span class="${pctClass(f.perf?.ytd)}">${fmtPct(f.perf?.ytd)}</span></div>
      </div>
    </div>
  `;
  }).join("");
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

init();
