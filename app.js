// Morning Board app
const $ = (id) => document.getElementById(id);

const INDEX_NAMES = {
  "TAIEX": "加權指數",
  "S&P 500": "標普 500",
  "Nasdaq": "那斯達克",
  "Dow Jones": "道瓊",
  "Nikkei 225": "日經 225",
  "Hang Seng": "恆生",
  "恆生": "恆生",
  "KOSPI": "韓國 KOSPI",
  "Shanghai Composite": "上證",
  "上證": "上證",
  "Shenzhen": "深證",
  "滬深300": "滬深 300",
  "Nifty 50": "印度 Nifty 50",
  "ASX 200": "澳洲 ASX 200",
  "Euro Stoxx 50": "歐洲 STOXX 50",
  "DAX": "德國 DAX",
  "FTSE 100": "英國 FTSE 100",
  "CAC 40": "法國 CAC 40"
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
  "ASX 200": "AI000320"
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
    const [meta, market, news, tax, funds] = await Promise.all([
      load("meta"), load("market"), load("news"), load("tax"), load("funds"),
    ]);
    DATA = { meta, market, news, tax, funds };
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
      <span class="val ${pctClass(f.perf['1m'])}">${fmtPct(f.perf['1m'])} / 1M</span>
    </div>
  `).join("") || "<div class='row'>—</div>";
}

function openSheet(target) {
  const titles = { market: "全球股市", news: "重要新聞", funds: "推薦基金" };
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
  const rows = m.indices.map(i => `
    <tr>
      <td>${indexLink(i.name)}</td>
      <td>${fmtInt(i.close)}</td>
      <td class="${pctClass(i.daily_pct)}">${fmtPct(i.daily_pct)}</td>
      <td class="${pctClass(i.mtd_pct)}">${fmtPct(i.mtd_pct)}</td>
      <td class="${pctClass(i.ytd_pct)}">${fmtPct(i.ytd_pct)}</td>
    </tr>
  `).join("");
  return `
    <table class="indices">
      <thead><tr>
        <th>指數</th><th>收盤</th><th>日</th><th>MTD</th><th>YTD</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="margin-top:16px; font-size:14px; color:var(--text-mute); line-height:1.6">${escapeHtml(m.summary || "")}</p>
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
  return sections.map(s => `
    <h3 style="color:var(--brand-deep); margin-top:18px">${escapeHtml(s.section_zh || s.section)}</h3>
    ${s.items.map(it => `
      <div class="news-item">
        <h3>${escapeHtml(it.title_zh || it.title_en)}</h3>
        <div class="summary">${escapeHtml(it.summary_zh || it.summary_en || "")}</div>
        ${it.source_url ? `<a class="source" href="${it.source_url}" target="_blank" rel="noopener">${escapeHtml(it.source_name || "來源")} ↗</a>` : ""}
        ${it.title_en ? `<span class="toggle-en" data-toggle>展開英文</span><div class="en">
          <strong>${escapeHtml(it.title_en)}</strong><br>${escapeHtml(it.summary_en || "")}
        </div>` : ""}
      </div>
    `).join("")}
  `).join("");
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
        <div><label>NAV</label>${fmtNum(f.nav)} ${escapeHtml(f.currency || "")}</div>
        <div><label>日漲跌</label><span class="${pctClass(f.change_pct)}">${fmtPct(f.change_pct)}</span></div>
        <div><label>1M</label><span class="${pctClass(f.perf?.['1m'])}">${fmtPct(f.perf?.['1m'])}</span></div>
        <div><label>YTD</label><span class="${pctClass(f.perf?.ytd)}">${fmtPct(f.perf?.ytd)}</span></div>
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
  document.querySelectorAll("[data-toggle]").forEach(el => {
    el.addEventListener("click", () => {
      el.nextElementSibling.classList.toggle("show");
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
