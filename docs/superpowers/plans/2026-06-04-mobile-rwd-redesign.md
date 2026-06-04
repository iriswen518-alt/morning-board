# 理財小幫手 手機版面改版 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the 小學堂 (academy) visual language across the 理財小幫手 PWA and fix three mobile pain points — small/dense type, hard tab switching, and cramped tables — without touching the data pipeline.

**Architecture:** Mostly a CSS rewrite in `repo/style.css` plus a new bottom tab bar (markup in `repo/index.html`, wiring in `repo/app.js`) and reformatting the market table renderers in `app.js` into cards. Desktop keeps the existing top nav; the bottom bar and card layouts are mobile-first with a `768px` breakpoint. Dark mode variants are added for every new component.

**Tech Stack:** Vanilla JS SPA (template-string rendering, no framework), plain CSS with custom properties, Playwright for visual verification, Python `http.server` for local serving.

**Spec:** `docs/superpowers/specs/2026-06-04-mobile-rwd-redesign-design.md`

**Working dir for all commands:** `/Users/iriswen/scripts/morning_board/repo`
**Branch:** `feat/mobile-rwd-redesign` (already created)

---

## Shared Verification Harness (set up once, used by every task)

- [ ] **Step S1: Start a local server (once, leave running)**

Run:
```bash
cd /Users/iriswen/scripts/morning_board/repo && (python3 -m http.server 8799 >/tmp/mb_serve.log 2>&1 &) && sleep 1 && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8799/index.html
```
Expected: `200`

- [ ] **Step S2: Create the screenshot helper**

Create: `/tmp/mb_shot.cjs`
```javascript
// Usage: node /tmp/mb_shot.cjs <tab> <outname> [width]
// tab: market|news|funds|obonds|usstocks|insurance|alloc  (or "_" to stay on default)
const { chromium } = require('/Users/iriswen/scripts/node_modules/playwright');
(async () => {
  const [,, tab='_', out='shot', width='390'] = process.argv;
  const w = parseInt(width, 10);
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport:{width:w,height:844}, deviceScaleFactor:2, isMobile:w<=768 });
  const p = await ctx.newPage();
  await p.goto('http://localhost:8799/index.html', {waitUntil:'networkidle'});
  await p.waitForTimeout(2000);
  if (tab !== '_') { await p.click(`[data-tab="${tab}"]`).catch(()=>{}); await p.waitForTimeout(1500); }
  await p.screenshot({path:`/tmp/${out}.png`, fullPage:false});
  await p.screenshot({path:`/tmp/${out}_full.png`, fullPage:true});
  await b.close();
  console.log('shot ->', `/tmp/${out}.png`);
})();
```

- [ ] **Step S3: Capture BEFORE baselines** (for side-by-side comparison while working)

Run:
```bash
node /tmp/mb_shot.cjs market before_market && node /tmp/mb_shot.cjs funds before_funds
```
Expected: `shot -> /tmp/before_market.png` etc. Open them with the Read tool to view.

> **Cache-busting note:** `index.html` references `style.css?v=...` and `app.js?v=...`. The Playwright helper requests `index.html` fresh each run, but to be safe after editing CSS/JS, bump the `?v=` query in `index.html` (Task 8 does this formally; during dev you can hard-reload because `networkidle` + new context avoids stale cache).

---

## Task 1: Design tokens + base typography

Adds the academy color tokens and bumps base font size / line-height. This is the foundation every later task builds on.

**Files:**
- Modify: `repo/style.css:1-24` (`:root` and dark `:root`)
- Modify: `repo/style.css:30-42` (`body`)

- [ ] **Step 1: Add academy tokens to `:root`**

In `repo/style.css`, replace the `:root` block at lines 1-13 with (keeps existing vars, adds new ones):
```css
:root {
  --brand-primary: #019AB3;
  --brand-secondary: #17B5AD;
  --brand-deep: #003D91;
  --up: #d62828;
  --down: #2a9d8f;
  --bg: #ffffff;
  --bg-alt: #f5f8fa;
  --text: #1a1a1a;
  --text-mute: #6b7280;
  --border: #e5e7eb;
  --shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  /* === academy (小學堂) design tokens === */
  --soft: #f5fafb;
  --soft-border: #e2e8ee;
  --muted: #6b7785;
  --radius-card: 16px;
  --tap: 44px;
}
```

- [ ] **Step 2: Add dark variants for the new tokens**

In `repo/style.css`, inside the dark `:root` block (lines 15-24), add three lines before the closing `}` at line 23:
```css
    --soft: #18212b;
    --soft-border: #2d3748;
    --muted: #9ca3af;
```

- [ ] **Step 3: Bump base typography on `body`**

In `repo/style.css`, in the `body` rule (around line 30-42), add these two declarations after `color: var(--text);`:
```css
  font-size: 16px;
  line-height: 1.6;
```

- [ ] **Step 4: Verify**

Run:
```bash
node /tmp/mb_shot.cjs market t1_market
```
Then Read `/tmp/t1_market.png`. Expected: text noticeably larger/looser than `/tmp/before_market.png`; no layout breakage.

- [ ] **Step 5: Commit**

```bash
cd /Users/iriswen/scripts/morning_board/repo && git add style.css && git commit -m "style: academy design tokens + 16px base typography"
```

---

## Task 2: Gradient hero header

Restyle the existing `.topbar` into the academy gradient hero with rounded bottom corners and the search box visually inside it. The markup already has `header.topbar > h1 + .updated + .search-wrap` (index.html:15-22), so this is CSS-only.

**Files:**
- Modify: `repo/style.css:78-139` (`.topbar` and `.search-wrap`)

- [ ] **Step 1: Round the hero bottom + add safe-area padding**

In `repo/style.css`, in the `.topbar` rule (line 78-87), change `padding: 14px 18px 12px;` to:
```css
  padding: calc(env(safe-area-inset-top, 0px) + 16px) 20px 18px;
  border-radius: 0 0 22px 22px;
  box-shadow: 0 6px 18px rgba(1, 154, 179, 0.22);
```
(Keep the existing `background:` gradient — it already matches the academy palette.)

- [ ] **Step 2: Soften the search box to sit inside the hero**

In `repo/style.css`, in `.search-wrap input` (line 126-137), change `border-radius: 8px;` to `border-radius: 14px;` and `padding: 9px 12px;` to `padding: 11px 14px;`.

- [ ] **Step 3: Verify (light + dark)**

Run:
```bash
node /tmp/mb_shot.cjs market t2_hero
```
Read `/tmp/t2_hero.png`. Expected: teal→deep-blue gradient hero with rounded bottom corners, search box with rounder corners inside it.

- [ ] **Step 4: Commit**

```bash
cd /Users/iriswen/scripts/morning_board/repo && git add style.css && git commit -m "style: gradient hero header (rounded, safe-area aware)"
```

---

## Task 3: Index cards — replace cramped market tables

Add a reusable `renderIndexCards()` helper and swap the four `.indices` tables in `renderMarketSheet` (股市/債市/匯率/商品期貨) for un-crammed cards. Each card: name + close on top, then 2-3 labeled stats split evenly. No horizontal scroll.

**Files:**
- Modify: `repo/app.js:2008-2157` (`renderMarketSheet`)
- Modify: `repo/style.css` (append new `.idx-card` block near the `.indices` rules, ~line 412)

- [ ] **Step 1: Add the `.idx-card` CSS**

In `repo/style.css`, after line 412 (end of `table.indices th.sortable-th`), insert:
```css
/* === 指數卡（取代手機上擁擠的 indices 表）=== */
.idx-cards { display: flex; flex-direction: column; gap: 11px; margin-top: 4px; }
.idx-card {
  background: var(--soft);
  border: 1px solid var(--soft-border);
  border-radius: var(--radius-card);
  padding: 14px 16px;
}
.idx-card .idx-top {
  display: flex; justify-content: space-between; align-items: baseline;
  gap: 10px; margin-bottom: 10px;
}
.idx-card .idx-nm { font-size: 16px; font-weight: 700; color: var(--brand-deep); }
.idx-card .idx-nm a { color: inherit; text-decoration: none; }
.idx-card .idx-px { font-size: 18px; font-weight: 800; font-variant-numeric: tabular-nums; }
.idx-card .idx-stats { display: flex; }
.idx-card .idx-st { flex: 1; text-align: center; min-width: 0; }
.idx-card .idx-st + .idx-st { border-left: 1px solid var(--soft-border); }
.idx-card .idx-st .k { font-size: 11.5px; color: var(--muted); font-weight: 600; margin-bottom: 2px; }
.idx-card .idx-st .v { font-size: 15px; font-weight: 700; font-variant-numeric: tabular-nums; }
/* 桌面維持表格；手機才用卡片 */
@media (min-width: 769px) { .idx-cards { display: none; } }
@media (max-width: 768px) { table.indices.has-cards { display: none; } }
```

- [ ] **Step 2: Add the `renderIndexCards` helper in app.js**

In `repo/app.js`, immediately before `function renderMarketSheet() {` (line 2008), insert:
```javascript
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
```

- [ ] **Step 3: Emit cards alongside the 股市 table**

In `repo/app.js`, in `renderMarketSheet`, find the `stocksTab` template literal (line 2093-2105). Add `has-cards` to the table class and append a cards block. Replace `<table class="indices">` on line 2094 with `<table class="indices has-cards">`, and immediately before the closing `${commoditiesBlock}`​` add a cards render. Concretely, build the cards from `m.indices` right after `const rows = ...` (line 2020). Insert after line 2020:
```javascript
  const indexCards = renderIndexCards(m.indices.map(i => ({
    nameHtml: `${indexLink(i.name)}${indexQuoteLink(i.name)}`,
    priceHtml: fmtInt(i.close),
    stats: [
      { k: "日", v: fmtPct(i.daily_pct), cls: pctClass(i.daily_pct) },
      { k: "本月", v: fmtPct(i.mtd_pct), cls: pctClass(i.mtd_pct) },
      { k: "今年", v: fmtPct(i.ytd_pct), cls: pctClass(i.ytd_pct) },
    ],
  })));
```
Then in the `stocksTab` literal (line 2093), change the opening to render both (table for desktop, cards for mobile):
```javascript
  const stocksTab = `
    <table class="indices has-cards">
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
    ${indexCards}
    ${commoditiesBlock}`;
```

- [ ] **Step 4: Repeat for 匯率 (fx) and 商品期貨 (commodities)**

In `repo/app.js`: after the `fxRows` definition (line 2053), add:
```javascript
  const fxCards = renderIndexCards((m.fx || []).map(f => ({
    nameHtml: `${fxLink(f.name)}${fxQuoteLink(f.name)}`,
    priceHtml: f.close != null ? f.close.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—",
    stats: [
      { k: "日", v: fmtPct(f.daily_pct), cls: pctClass(f.daily_pct) },
      { k: "本月", v: fmtPct(f.mtd_pct), cls: pctClass(f.mtd_pct) },
      { k: "今年", v: fmtPct(f.ytd_pct), cls: pctClass(f.ytd_pct) },
    ],
  })));
```
Then change the `fxTab` literal (line 2119) `<table class="indices">` → `<table class="indices has-cards">` and add `${fxCards}` right after the closing `</table>` (before the `` : `<p>... `` fallback). The full edit for `fxTab`:
```javascript
  const fxTab = fxRows ? `
    <table class="indices has-cards">
      <thead><tr>
        <th title="點名稱可開 MoneyDJ 圖表頁驗證">幣別</th>
        <th class="sortable-th" title="收盤匯率｜來源：Yahoo Finance；點選排序">收盤</th>
        <th class="sortable-th" title="日報酬率｜定義：今日收盤 vs 昨日收盤｜來源：Yahoo Finance；點選排序">日</th>
        <th class="sortable-th" title="MTD｜定義：當月首交易日收盤 → 最新收盤｜來源：Yahoo Finance；點選排序">本月</th>
        <th class="sortable-th" title="YTD｜定義：去年最後交易日收盤 → 最新收盤｜來源：Yahoo Finance；點選排序">今年</th>
        <th class="date-col" title="收盤日：最新交易日 ET 收盤後 build">收盤日</th>
      </tr></thead>
      <tbody>${fxRows}</tbody>
    </table>
    ${fxCards}` : `<p style="color:var(--text-mute); padding:20px 0">尚未提供匯率資料</p>`;
```

- [ ] **Step 5: Bonds — cards with 殖利率 / 日變動 / 本月變動**

In `repo/app.js`, after the `bondRows` definition (ends line 2042), add a cards block that reuses the existing `dailyCell`/`mtdCell` logic. Because bond cells are already HTML strings, rebuild per-bond inline:
```javascript
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
      priceHtml: b.yield_pct != null ? b.yield_pct.toFixed(2) + "%" : "—",
      stats: [ { k: "日變動", v: dailyV }, { k: "本月變動", v: mtdV } ],
    };
  }));
```
Then in `bondsTab` (line 2107) change `<table class="indices">` → `<table class="indices has-cards">` and add `${bondCards}` after the closing `</table>` (before the fallback `` : `<p>... ``):
```javascript
  const bondsTab = bondRows ? `
    <table class="indices has-cards">
      <thead><tr>
        <th title="點名稱可開 MoneyDJ 圖表頁驗證">債別</th>
        <th class="sortable-th" title="到期殖利率（YTM, %）｜來源：FRED (US) / 各國央行 / Yahoo Finance；點選排序">殖利率</th>
        <th class="sortable-th" title="日變動 bps｜定義：今日 yield − 昨日 yield｜來源：FRED；點選排序">日變動</th>
        <th class="sortable-th" title="MTD 變動 bps｜定義：當月首交易日 yield → 最新 yield｜來源：FRED；點選排序">本月變動</th>
        <th class="date-col" title="債券殖利率公告日">收盤日</th>
      </tr></thead>
      <tbody>${bondRows}</tbody>
    </table>
    ${bondCards}` : `<p style="color:var(--text-mute); padding:20px 0">尚未提供公債資料</p>`;
```

- [ ] **Step 6: Verify all four market sub-tabs**

Run:
```bash
node /tmp/mb_shot.cjs market t3_market
```
Read `/tmp/t3_market_full.png`. Expected: 股市 shows index cards (no horizontal scroll); the table is hidden at 390px. Then in `/tmp/mb_shot.cjs` temporarily click 債市/匯率 (or manually verify in a browser). Confirm red=漲 green=跌 coloring preserved.

- [ ] **Step 7: Verify desktop still uses tables**

Run:
```bash
node /tmp/mb_shot.cjs market t3_market_desktop 1280
```
Read `/tmp/t3_market_desktop.png`. Expected: at 1280px the original `.indices` table shows, cards hidden.

- [ ] **Step 8: Commit**

```bash
cd /Users/iriswen/scripts/morning_board/repo && git add style.css app.js && git commit -m "feat(market): index cards replace cramped tables on mobile"
```

---

## Task 4: Fund-card polish (academy soft style)

The fund detail blocks already use `.fund-card` (style.css:605+). Give them the academy soft background, border, and radius so they match the new language. CSS-only — no JS change.

**Files:**
- Modify: `repo/style.css:605-650` (`.fund-card`)

- [ ] **Step 1: Read the current `.fund-card` rule**

Run:
```bash
cd /Users/iriswen/scripts/morning_board/repo && sed -n '605,650p' style.css
```
Note the existing `background`, `border`, `border-radius`, `padding` declarations so the next edit replaces (not duplicates) them.

- [ ] **Step 2: Apply academy surface to `.fund-card`**

In `repo/style.css`, in the main `.fund-card` rule (starts line 605), set these properties (edit existing declarations in place; add any that are missing):
```css
  background: var(--soft);
  border: 1px solid var(--soft-border);
  border-radius: var(--radius-card);
```
Leave the existing `border-left` override rules (lines 617-618) and hover (619) as-is.

- [ ] **Step 3: Verify (light + dark)**

Run:
```bash
node /tmp/mb_shot.cjs funds t4_funds
```
Read `/tmp/t4_funds_full.png`. Expected: fund cards have the soft `#f5fafb` surface and rounded corners, consistent with the market cards.

- [ ] **Step 4: Commit**

```bash
cd /Users/iriswen/scripts/morning_board/repo && git add style.css && git commit -m "style(funds): academy soft surface for fund cards"
```

---

## Task 5: Bottom tab bar (the navigation win)

Add a fixed iOS-style bottom bar: 市場 / 新聞 / 基金 / 海外債 / 更多. 「更多」reuses the existing full-screen nav overlay (`body.nav-open` → `.main-nav` grid). Mobile-only; desktop keeps top nav. Remove the old `.nav-toggle` and `.home-fab` on mobile.

**Files:**
- Modify: `repo/index.html` (add `<nav class="tabbar">` before `</body>`; remove nothing — hide via CSS)
- Modify: `repo/style.css` (append `.tabbar` block; adjust mobile `#content` bottom padding; hide `.nav-toggle`/`.home-fab` on mobile)
- Modify: `repo/app.js` (`switchTab` active-state sync; wire bottom bar + 更多)

- [ ] **Step 1: Add the bottom bar markup**

In `repo/index.html`, immediately before `<footer class="disclaimer">` (line 108), insert:
```html
<nav class="tabbar" id="tabbar" aria-label="主導覽">
  <button class="tabbar-item active" data-tab="market" type="button">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18"/></svg>
    <span>市場</span>
  </button>
  <button class="tabbar-item" data-tab="news" type="button">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5h13a2 2 0 0 1 2 2v11a2 2 0 0 0 2-2V8"/><path d="M4 5v13a2 2 0 0 0 2 2h13"/><path d="M8 9h7M8 13h7M8 17h5"/></svg>
    <span>新聞</span>
  </button>
  <button class="tabbar-item" data-tab="funds" type="button">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20h18"/><rect x="5" y="13" width="3" height="7" rx=".5"/><rect x="10.5" y="9" width="3" height="11" rx=".5"/><rect x="16" y="5" width="3" height="15" rx=".5"/></svg>
    <span>基金</span>
  </button>
  <button class="tabbar-item" data-tab="obonds" type="button">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h9l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M14 3v5h5"/><path d="M8 13h8M8 17h5"/></svg>
    <span>海外債</span>
  </button>
  <button class="tabbar-item" data-action="more" id="tabbar-more" type="button" aria-expanded="false">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg>
    <span>更多</span>
  </button>
</nav>
```

- [ ] **Step 2: Add the `.tabbar` CSS (with dark variant)**

In `repo/style.css`, append at end of file:
```css
/* === 底部分頁列（手機限定）=== */
.tabbar { display: none; }
@media (max-width: 768px) {
  .tabbar {
    display: flex;
    position: fixed; left: 0; right: 0; bottom: 0; z-index: 95;
    background: rgba(255,255,255,0.96);
    -webkit-backdrop-filter: saturate(180%) blur(12px);
    backdrop-filter: saturate(180%) blur(12px);
    border-top: 1px solid var(--soft-border);
    padding: 6px 4px calc(env(safe-area-inset-bottom, 0px) + 6px);
    box-shadow: 0 -3px 14px rgba(0,0,0,0.05);
  }
  .tabbar-item {
    flex: 1; min-height: var(--tap);
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
    background: none; border: 0; font-family: inherit; cursor: pointer;
    color: var(--muted); font-size: 10.5px; font-weight: 600; padding: 4px 0;
  }
  .tabbar-item svg { width: 23px; height: 23px; }
  .tabbar-item.active { color: var(--brand-primary); }
  /* 內容區底部留白，避免被底部列遮住 */
  #content { padding-bottom: calc(var(--tap) + 44px + env(safe-area-inset-bottom, 0px)); }
  /* 舊的頂部下拉鈕與回首頁 FAB 由底部列取代 */
  .nav-toggle { display: none !important; }
  body.show-home-fab .home-fab { display: none !important; }
}
@media (prefers-color-scheme: dark) and (max-width: 768px) {
  .tabbar { background: rgba(26,33,42,0.96); border-top-color: var(--soft-border); }
}
```

- [ ] **Step 3: Sync bottom-bar active state in `switchTab`**

In `repo/app.js`, in `switchTab` (line 603), right after the existing `.main-tab` loop (lines 605-607), add:
```javascript
  document.querySelectorAll(".tabbar-item[data-tab]").forEach(b => {
    b.classList.toggle("active", b.dataset.tab === name);
  });
```

- [ ] **Step 4: Wire the bottom bar (tabs + 更多) — extend `wireNavToggle`**

In `repo/app.js`, at the END of `wireNavToggle` (just before its closing `}` at line 704), add:
```javascript
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
```
(`toggle` and `nav` are already in scope from the top of `wireNavToggle`.)

- [ ] **Step 5: Verify bottom bar + 更多 overlay**

Run:
```bash
node /tmp/mb_shot.cjs market t5_bar
```
Read `/tmp/t5_bar.png`. Expected: fixed bottom bar with 市場/新聞/基金/海外債/更多; 市場 highlighted; content not hidden behind it. Then verify 更多 opens the grid:
```bash
cat > /tmp/t5_more.cjs <<'EOF'
const { chromium } = require('/Users/iriswen/scripts/node_modules/playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true});const p=await ctx.newPage();await p.goto('http://localhost:8799/index.html',{waitUntil:'networkidle'});await p.waitForTimeout(2000);await p.click('#tabbar-more');await p.waitForTimeout(400);await p.screenshot({path:'/tmp/t5_more.png'});await b.close();console.log('ok');})();
EOF
node /tmp/t5_more.cjs
```
Read `/tmp/t5_more.png`. Expected: full-screen 3-col icon grid overlay (海外股票/保險/資產配置/小學堂 reachable). Tapping a tab switches and closes the overlay.

- [ ] **Step 6: Verify desktop hides the bottom bar**

Run:
```bash
node /tmp/mb_shot.cjs market t5_desktop 1280
```
Read `/tmp/t5_desktop.png`. Expected: no bottom bar; top `.main-nav` intact.

- [ ] **Step 7: Commit**

```bash
cd /Users/iriswen/scripts/morning_board/repo && git add index.html style.css app.js && git commit -m "feat(nav): mobile bottom tab bar (市場/新聞/基金/海外債/更多)"
```

---

## Task 6: Stock-table column alignment (folded-in 「對齊欄寬」task)

The 美股/台股 tables (`renderStocksTable`, app.js:4071) stay tabular but need fixed column widths + right-aligned numeric columns so rows line up. Follows the existing `table.ranking-table { table-layout: fixed; }` pattern (style.css:392).

**Files:**
- Modify: `repo/style.css` (append `.indices.has-cards` is for market; here target the stock tables — they also render as `table.indices` via `renderStocksTable`, so scope with a wrapper class)
- Modify: `repo/app.js:4126-4130` area (add a class to the stock table for scoping) — confirm in Step 1

- [ ] **Step 1: Find the stock table's opening tag**

Run:
```bash
cd /Users/iriswen/scripts/morning_board/repo && sed -n '4126,4160p' app.js
```
Locate the `<table class="indices ...">` that wraps the `${rows}` built at line 4114-4130. Note its exact current class list.

- [ ] **Step 2: Tag the stock table**

In `repo/app.js`, in `renderStocksTable`, add `stock-cols` to the table's class (e.g. `class="indices stock-cols"`). Use the exact opening tag found in Step 1 as the `old_string` for the edit.

- [ ] **Step 3: Add fixed-column CSS**

In `repo/style.css`, append:
```css
/* === 股票表格欄寬對齊（美股/台股；本益比欄）=== */
table.indices.stock-cols { table-layout: fixed; width: 100%; }
table.indices.stock-cols th, table.indices.stock-cols td {
  text-align: right; font-variant-numeric: tabular-nums;
  overflow: hidden; text-overflow: ellipsis;
}
table.indices.stock-cols th:first-child, table.indices.stock-cols td:first-child {
  text-align: left; white-space: nowrap;
}
table.indices.stock-cols col.c-name { width: 34%; }
table.indices.stock-cols col.c-num { width: 16.5%; }
```

- [ ] **Step 4: Add a `<colgroup>` to fix the widths**

In `repo/app.js`, in `renderStocksTable`, immediately after the `<table ...>` opening tag, add a colgroup matching the column count. First confirm the column count by reading the `<thead>` of this table (continue the `sed` from Step 1). For the known columns (名稱 / 價格 / 本益比 / 日 / 本月 / 今年 — 6 cols; adjust if Step 1 shows more):
```html
<colgroup><col class="c-name"><col class="c-num"><col class="c-num"><col class="c-num"><col class="c-num"><col class="c-num"></colgroup>
```
Insert this as the first child of the `<table>`. If the real column count differs, emit one `<col class="c-num">` per non-name column and keep `c-name` as the first.

- [ ] **Step 5: Verify alignment on 美股 + 台股**

Run:
```bash
cat > /tmp/t6_stock.cjs <<'EOF'
const { chromium } = require('/Users/iriswen/scripts/node_modules/playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true});const p=await ctx.newPage();await p.goto('http://localhost:8799/index.html',{waitUntil:'networkidle'});await p.waitForTimeout(2000);await p.click('[data-tab="market"]');await p.waitForTimeout(800);await p.click('[data-mtab="us"]');await p.waitForTimeout(800);await p.screenshot({path:'/tmp/t6_us.png',fullPage:true});await p.click('[data-mtab="tw"]');await p.waitForTimeout(800);await p.screenshot({path:'/tmp/t6_tw.png',fullPage:true});await b.close();console.log('ok');})();
EOF
node /tmp/t6_stock.cjs
```
Read `/tmp/t6_us.png` and `/tmp/t6_tw.png`. Expected: columns are evenly fixed-width, numbers right-aligned and vertically aligned across rows; long names truncate with ellipsis instead of widening columns.

- [ ] **Step 6: Commit**

```bash
cd /Users/iriswen/scripts/morning_board/repo && git add style.css app.js && git commit -m "style(stocks): fixed column widths so 美股/台股 tables align (folded-in 對齊欄寬)"
```

---

## Task 7: Dark-mode + cross-tab sweep

Verify every new component (hero, index cards, fund cards, bottom bar, stock tables) in dark mode and across all tabs; fix any contrast/spacing issues found.

**Files:**
- Modify: `repo/style.css` (only if issues found)

- [ ] **Step 1: Capture dark-mode screenshots**

Run:
```bash
cat > /tmp/t7_dark.cjs <<'EOF'
const { chromium } = require('/Users/iriswen/scripts/node_modules/playwright');
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,colorScheme:'dark'});const p=await ctx.newPage();await p.goto('http://localhost:8799/index.html',{waitUntil:'networkidle'});await p.waitForTimeout(2000);for(const t of ['market','news','funds','obonds']){await p.click(`[data-tab="${t}"]`).catch(()=>{});await p.waitForTimeout(1200);await p.screenshot({path:`/tmp/t7_dark_${t}.png`,fullPage:true});}await b.close();console.log('ok');})();
EOF
node /tmp/t7_dark.cjs
```
Read `/tmp/t7_dark_market.png`, `/tmp/t7_dark_funds.png`, `/tmp/t7_dark_obonds.png`, `/tmp/t7_dark_news.png`.

- [ ] **Step 2: Check each tab against a checklist**

For each screenshot confirm: hero readable; index/fund cards use dark `--soft` (#18212b) not white; bottom bar dark; text contrast adequate; no white flashes. If any component is still light-on-light or dark-on-dark, add the missing dark override under `@media (prefers-color-scheme: dark)` and re-run Step 1.

- [ ] **Step 3: Light-mode sweep of remaining tabs**

Run:
```bash
node /tmp/mb_shot.cjs usstocks t7_usstocks && node /tmp/mb_shot.cjs insurance t7_insurance && node /tmp/mb_shot.cjs alloc t7_alloc
```
Read each `_full.png`. Expected: consistent academy styling, no horizontal scroll, content clears the bottom bar.

- [ ] **Step 4: Commit (only if fixes were made)**

```bash
cd /Users/iriswen/scripts/morning_board/repo && git add style.css && git commit -m "style: dark-mode + cross-tab consistency fixes"
```
If no fixes were needed, skip this commit.

---

## Task 8: Cache-bust version bump + final verification

Bump the `?v=` query strings so phones load the new CSS/JS, then do a final before/after comparison.

**Files:**
- Modify: `repo/index.html:11` (`style.css?v=...`) and `repo/index.html:112` (`app.js?v=...`)

- [ ] **Step 1: Bump versions**

In `repo/index.html`, update line 11 `href="style.css?v=20260604-0918"` → `href="style.css?v=20260604-rwd"` and line 112 `src="app.js?v=20260604-0928"` → `src="app.js?v=20260604-rwd"`.

- [ ] **Step 2: Final side-by-side**

Run:
```bash
node /tmp/mb_shot.cjs market final_market && node /tmp/mb_shot.cjs funds final_funds
```
Read `/tmp/before_market.png` vs `/tmp/final_market.png` and `/tmp/before_funds.png` vs `/tmp/final_funds.png`. Confirm the three pain points are resolved: bigger type, bottom tab bar present, no cramped tables/horizontal scroll.

- [ ] **Step 3: Sanity-check the existing Python tests are unaffected**

Run:
```bash
cd /Users/iriswen/scripts/morning_board && python3 -m pytest tests/ -q 2>&1 | tail -15
```
Expected: same pass/fail status as before this branch (front-end changes don't touch Python). If the suite was green on `main`, it stays green.

- [ ] **Step 4: Commit + stop the dev server**

```bash
cd /Users/iriswen/scripts/morning_board/repo && git add index.html && git commit -m "chore: bump style/app cache version for RWD redesign"
pkill -f "http.server 8799" || true
```

- [ ] **Step 5: Finish the branch**

Use the `superpowers:finishing-a-development-branch` skill to decide merge / PR / cleanup. Deployment is via the existing GitHub Pages flow (push to `origin`); confirm with the user before pushing.

---

## Self-Review notes (author check)

- **Spec coverage:** §3.1 hero → Task 2; §3.2 type/spacing → Task 1; §3.3 bottom bar → Task 5; §3.4 index cards → Task 3, fund cards → Task 4, stock-table alignment → Task 6; §3.5 dark mode untouched + verified → Task 7; cache-bust (§4) → Task 8. All covered.
- **Naming consistency:** helper `renderIndexCards`/`renderIndexCard`, class `.idx-card`/`.idx-cards`, table scope class `has-cards` (market) and `stock-cols` (stock tables), bottom-bar `.tabbar`/`.tabbar-item` — used identically across CSS, HTML, and JS tasks.
- **Known unknowns flagged for the implementer to confirm at runtime (not guessed):** exact column count of `renderStocksTable` (Task 6 Step 1 reads it before adding the colgroup); exact existing declarations inside `.fund-card` (Task 4 Step 1 reads before replacing). These are read-first steps, not placeholders.
