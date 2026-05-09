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

async function init() {
  try {
    const [meta, market, news, tax, funds, stocks] = await Promise.all([
      load("meta"), load("market"), load("news"), load("tax"), load("funds"),
      load("stocks").catch(() => ({ us_stocks: [], tw_stocks: [] })),
    ]);
    DATA = { meta, market, news, tax, funds, stocks };
  } catch (e) {
    $("updated").textContent = `載入失敗：${e.message}`;
    return;
  }

  $("updated").textContent = `上次更新：${DATA.meta.built_at.replace("T", " ").slice(0, 16)}`;

  renderMarketPreview();
  renderNewsPreview();
  renderFundsPreview();

  document.querySelectorAll(".expand-btn").forEach(btn => {
    btn.addEventListener("click", () => openSheet(btn.dataset.target));
  });
  $("back").addEventListener("click", closeSheet);
  $("mask").addEventListener("click", closeSheet);

  // Temporarily disabled until kill-switch SW (v3) wipes old caches everywhere.
  // Re-enable in a future commit once we confirm clients are clean.
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(r => r.unregister());
    }).catch(() => {});
  }
}

function renderMarketPreview() {
  const m = DATA.market;
  $("market-date").textContent = `收盤日 ${shortDate(m.closing_date)}`;
  const top = ["TAIEX", "S&P 500", "Nikkei 225"]
    .map(name => m.indices.find(i => i.name === name))
    .filter(Boolean);
  $("market-preview").innerHTML = top.map(i => `
    <div class="row">
      <span class="name">${indexLink(i.name)}</span>
      <span class="val">${fmtInt(i.close)} <span class="${pctClass(i.daily_pct)}">${fmtPct(i.daily_pct)}</span></span>
    </div>
  `).join("");
}

function renderNewsPreview() {
  const tldr = (DATA.news.tldr || []).slice(0, 3);
  $("news-date").textContent = shortDate(DATA.news.news_date);
  $("news-preview").innerHTML = tldr.map(t =>
    `<div class="row">• ${escapeHtml(t)}</div>`
  ).join("") || "<div class='row'>—</div>";
}

function renderFundsPreview() {
  const funds = (DATA.funds.funds || [])
    .filter(f => f.perf && f.perf["1m"] !== null && f.perf["1m"] !== undefined)
    .sort((a, b) => b.perf["1m"] - a.perf["1m"])
    .slice(0, 3);
  if (funds.length) {
    $("funds-date").textContent = `淨值 ${shortDate(funds[0].nav_date)}`;
  }
  $("funds-preview").innerHTML = funds.map(f => `
    <div class="row">
      <span class="name">${escapeHtml(f.name_zh)}</span>
      <span class="val ${pctClass(f.perf['1m'])}">${fmtPct(f.perf['1m'])} / 近1月</span>
    </div>
  `).join("") || "<div class='row'>—</div>";
}

function openSheet(target) {
  const titles = { market: "全球市場", news: "重要新聞", funds: "精選基金" };
  $("sheet-title").textContent = titles[target];
  $("mask").hidden = false;
  $("sheet").hidden = false;

  const body = $("sheet-body");
  if (target === "market") body.innerHTML = renderMarketSheet();
  else if (target === "news") body.innerHTML = renderNewsSheet();
  else if (target === "funds") body.innerHTML = renderFundsSheet();

  if (target === "news") wireNewsTabs();
}

function closeSheet() {
  $("sheet").hidden = true;
  $("mask").hidden = true;
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
      <td class="date-col">${escapeHtml(date)}</td>
    </tr>
  `).join("");
  const bondRows = (m.bonds || []).map(b => `
    <tr>
      <td>${bondLink(b.name)}</td>
      <td>${b.yield_pct != null ? b.yield_pct.toFixed(2) + "%" : "—"}</td>
      <td class="${bpsClass(b.daily_bps)}">${fmtBps(b.daily_bps)}</td>
      <td class="${bpsClass(b.mtd_bps)}">${fmtBps(b.mtd_bps)}</td>
      <td class="date-col">${escapeHtml(date)}</td>
    </tr>
  `).join("");

  const fxRows = (m.fx || []).map(f => `
    <tr>
      <td>${fxLink(f.name)}</td>
      <td>${f.close != null ? f.close.toLocaleString("en-US", { maximumFractionDigits: 4 }) : "—"}</td>
      <td class="${pctClass(f.daily_pct)}">${fmtPct(f.daily_pct)}</td>
      <td class="${pctClass(f.mtd_pct)}">${fmtPct(f.mtd_pct)}</td>
      <td class="${pctClass(f.ytd_pct)}">${fmtPct(f.ytd_pct)}</td>
      <td class="date-col">${escapeHtml(date)}</td>
    </tr>
  `).join("");

  return `
    <h3 style="color:var(--brand-deep); margin:0 0 8px">股市指數</h3>
    <table class="indices">
      <thead><tr>
        <th>指數</th><th>收盤</th><th>日</th><th>本月</th><th>今年</th><th class="date-col">收盤日</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>

    ${bondRows ? `
    <h3 style="color:var(--brand-deep); margin:24px 0 8px">公債殖利率</h3>
    <table class="indices">
      <thead><tr>
        <th>債別</th><th>殖利率</th><th>日變動</th><th>本月變動</th><th class="date-col">收盤日</th>
      </tr></thead>
      <tbody>${bondRows}</tbody>
    </table>` : ""}

    ${fxRows ? `
    <h3 style="color:var(--brand-deep); margin:24px 0 8px">匯率</h3>
    <table class="indices">
      <thead><tr>
        <th>幣別</th><th>收盤</th><th>日</th><th>本月</th><th>今年</th><th class="date-col">收盤日</th>
      </tr></thead>
      <tbody>${fxRows}</tbody>
    </table>` : ""}

    ${renderStocksTable("美股", DATA.stocks?.us_stocks)}
    ${renderStocksTable("台股", DATA.stocks?.tw_stocks)}

    ${renderMarketHighlights(m)}
  `;
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
      <td style="color:var(--text-mute); font-size:12px">${escapeHtml(s.symbol)}</td>
      <td>${fmtPrice(s.price, s.kind)}</td>
      <td class="${pctClass(s.change_pct)}">${fmtPct(s.change_pct)}</td>
      <td class="date-col">${escapeHtml(shortDate(s.market_date))}</td>
    </tr>
  `).join("");
  return `
    <h3 style="color:var(--brand-deep); margin:24px 0 8px">${title}</h3>
    <table class="indices">
      <thead><tr>
        <th>名稱</th><th>代碼</th><th>收盤</th><th>日</th><th class="date-col">收盤日</th>
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
    <h3 style="color:var(--brand-deep); margin:24px 0 8px">今日重點</h3>
    <ul style="font-size:14px; line-height:1.8; padding-left:20px; margin:0">
      ${ups.length ? `<li><strong class="up">領漲</strong>：${ups.map(fmt).join("、")}</li>` : ""}
      ${downs.length ? `<li><strong class="down">領跌</strong>：${downs.map(fmt).join("、")}</li>` : ""}
    </ul>

    ${tldr.length ? `
      <h3 style="color:var(--brand-deep); margin:20px 0 8px">影響因素</h3>
      <ul style="font-size:14px; line-height:1.7; padding-left:20px; margin:0; color:var(--text)">
        ${tldr.map(t => `<li>${escapeHtml(t)}</li>`).join("")}
      </ul>` : ""}
  `;
}

function renderNewsSheet() {
  return `
    <div class="tabs">
      <button class="tab active" data-tab="fin">財經</button>
      <button class="tab" data-tab="tax">稅務</button>
    </div>
    <div id="tab-fin">${renderFinNews()}</div>
    <div id="tab-tax" hidden>${renderTaxNews()}</div>
  `;
}

function renderFinNews() {
  const sections = DATA.news.sections || [];
  return sections.map(s => {
    // 只渲染有中文標題的條目；無中文則整則跳過
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
}

function renderTaxNews() {
  const items = DATA.tax.items || [];
  if (!items.length) return "<p style='color:var(--text-mute)'>今日無稅務新聞</p>";
  return items.map(it => `
    <div class="news-item">
      <h3>${escapeHtml(it.title)}</h3>
      <div class="summary">${escapeHtml(it.summary)}</div>
      ${it.source_url ? `<a class="source" href="${it.source_url}" target="_blank" rel="noopener">${escapeHtml(it.source_name || "來源")} ↗</a>` : ""}
    </div>
  `).join("");
}

function renderFundsSheet() {
  const funds = DATA.funds.funds || [];
  return funds.map(f => `
    <div class="fund-card">
      <h3>${escapeHtml(f.name_zh)}</h3>
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
      ${f.source_url ? `<a class="source" href="${f.source_url}" target="_blank" rel="noopener" style="display:block;margin-top:8px">板信基金頁 ↗</a>` : ""}
    </div>
  `).join("");
}

function wireNewsTabs() {
  document.querySelectorAll(".tab").forEach(t => {
    t.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
      t.classList.add("active");
      const which = t.dataset.tab;
      $("tab-fin").hidden = which !== "fin";
      $("tab-tax").hidden = which !== "tax";
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
