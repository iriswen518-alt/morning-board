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

async function init() {
  // 每個來源各自有 fallback：一個壞不拖垮全頁
  const safe = (name, fallback) => load(name).catch(() => fallback);
  const [meta, market, news, tax, funds, stocks, insurance, obonds, targets] = await Promise.all([
    safe("meta", { built_at: "", today: "", sources_status: {} }),
    safe("market", { closing_date: "", indices: [], bonds: [], fx: [], summary: "" }),
    safe("news", { news_date: "", tldr: [], sections: [] }),
    safe("tax", { tax_date: "", items: [] }),
    safe("funds", { funds: [] }),
    safe("stocks", { us_stocks: [], tw_stocks: [] }),
    safe("insurances", { insurances: [] }),
    safe("overseas_bonds", { bonds: [] }),
    safe("targets", { targets: [], summary: {}, entry_sequence: [] }),
  ]);
  DATA = { meta, market, news, tax, funds, stocks, insurance, obonds, targets };
  if (!meta.built_at) {
    $("updated").textContent = `載入部分失敗（顯示快取資料）`;
  } else {
    $("updated").textContent = `上次更新：${DATA.meta.built_at.replace("T", " ").slice(0, 16)}`;
  }

  document.querySelectorAll(".main-tab").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  switchTab(CURRENT_TAB);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js?v=20260513-1320").catch(() => {});
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
  else if (name === "targets") body.innerHTML = renderTargetsSheet();
  if (name === "news") wireNewsTabs();
  if (name === "market") wireMarketTabs();
  if (name === "targets") wireTargetsTabs();
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
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
  const [meta, market, news, tax, funds, stocks, insurance, obonds, targets] = await Promise.all([
    safe("meta", { built_at: "", today: "", sources_status: {} }),
    safe("market", { closing_date: "", indices: [], bonds: [], fx: [], summary: "" }),
    safe("news", { news_date: "", tldr: [], sections: [] }),
    safe("tax", { tax_date: "", items: [] }),
    safe("funds", { funds: [] }),
    safe("stocks", { us_stocks: [], tw_stocks: [] }),
    safe("insurances", { insurances: [] }),
    safe("overseas_bonds", { bonds: [] }),
    safe("targets", { targets: [], summary: {}, entry_sequence: [] }),
  ]);
  DATA = { meta, market, news, tax, funds, stocks, insurance, obonds, targets };
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
      <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:6px; font-size:15px; margin-top:8px; text-align:center; padding-top:8px; border-top:1px dashed var(--border)">
        <div>
          <label style="display:block; font-size:13px; color:var(--text-mute); margin-bottom:2px">申購參考殖利率</label>
          <span class="up">${fmtPctNum(b.bid_yield_pct)}</span>
        </div>
        <div>
          <label style="display:block; font-size:13px; color:var(--text-mute); margin-bottom:2px">贖回參考價</label>
          ${fmtPrice(b.ask_price)}
          ${priceDate}
        </div>
      </div>
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; font-size:14px; margin-top:6px; text-align:center">
        <div><label style="display:block; font-size:12px; color:var(--text-mute); margin-bottom:2px">週%</label><span class="${pctClass(b.perf_1w)}">${fmtPctNum(b.perf_1w)}</span></div>
        <div><label style="display:block; font-size:12px; color:var(--text-mute); margin-bottom:2px">月%</label><span class="${pctClass(b.perf_1m)}">${fmtPctNum(b.perf_1m)}</span></div>
        <div><label style="display:block; font-size:12px; color:var(--text-mute); margin-bottom:2px">季%</label><span class="${pctClass(b.perf_3m)}">${fmtPctNum(b.perf_3m)}</span></div>
      </div>
    </div>
  `;
  }).join("");
}

function stanceChip(stance) {
  const label = stance === "OW" ? "加碼" : (stance === "UW" ? "減碼" : "中立");
  const cls = stance === "OW" ? "stance-ow" : (stance === "UW" ? "stance-uw" : "stance-nt");
  return `<span class="stance-pill ${cls}">${label}</span>`;
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

  // KPI strip
  const kpiHtml = `
    <div class="targets-kpi">
      <div class="t-kpi"><div class="t-kpi-label">主題覆蓋</div><div class="t-kpi-value">${summary.themes ?? list.length}</div></div>
      <div class="t-kpi"><div class="t-kpi-label">加碼</div><div class="t-kpi-value t-up">${summary.overweight ?? 0}</div></div>
      <div class="t-kpi"><div class="t-kpi-label">中立</div><div class="t-kpi-value t-mute">${summary.neutral ?? 0}</div></div>
      <div class="t-kpi"><div class="t-kpi-label">資料基準</div><div class="t-kpi-value" style="font-size:14px">${escapeHtml(data.quote_basis || data.updated || "—")}</div></div>
    </div>
  `;

  // Tab buttons
  const tabBtns = list.map((t, i) => `
    <button class="t-tab ${i === 0 ? "active" : ""}" data-ttab="${escapeHtml(t.key)}">
      <span>${escapeHtml(t.num || "")} ${escapeHtml(t.name)}</span>
      ${stanceChip(t.stance)}
    </button>
  `).join("");

  // Tab panes
  const panes = list.map((t, i) => `
    <div class="t-pane ${i === 0 ? "active" : ""}" id="t-pane-${escapeHtml(t.key)}">
      <div class="t-head">
        <div>
          <div class="t-name">${escapeHtml(t.num || "")} ${escapeHtml(t.name)}　<span class="t-alloc">${escapeHtml(t.alloc || "")}</span></div>
          <div class="t-tagline">${escapeHtml(t.tagline || "")}</div>
        </div>
        ${stanceChip(t.stance)}
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

      <div class="t-section t-status">
        <div class="t-section-head"><span class="t-section-icon">📊</span><span>市場現況</span></div>
        <div class="t-section-body">${escapeHtml(t.market_status || t.view || "—")}</div>
      </div>

      <div class="t-section t-opp">
        <div class="t-section-head"><span class="t-section-icon">💡</span><span>投資機會</span></div>
        <div class="t-section-body">${escapeHtml(t.opportunity || t.reason || "—")}</div>
      </div>

      <div class="t-section t-pitch">
        <div class="t-section-head"><span class="t-section-icon">🎯</span><span>行銷話術</span></div>
        <div class="t-section-body">${escapeHtml(t.pitch || t.action || "—")}</div>
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
  `).join("");

  // Entry sequence
  const seqHtml = seq.length ? `
    <h3>建議進場順序</h3>
    <ol class="t-seq">
      ${seq.map(s => {
        const d = byKey[s.key] || {};
        return `<li><span class="t-seq-num">${s.num}</span><strong>${escapeHtml(d.name || s.key)}</strong>　<span class="t-seq-note">${escapeHtml(s.note)}</span></li>`;
      }).join("")}
    </ol>` : "";

  return `
    ${kpiHtml}
    <div class="t-tab-row">${tabBtns}</div>
    <div class="t-panes">${panes}</div>
    ${seqHtml}
  `;
}

function wireTargetsTabs() {
  const buttons = document.querySelectorAll(".t-tab[data-ttab]");
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
