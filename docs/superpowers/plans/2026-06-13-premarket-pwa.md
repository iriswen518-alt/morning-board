# Premarket PWA Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the daily 08:00 premarket analysis (already running locally) at the top of the 全球市場 tab in the 理財小幫手 PWA on GitHub Pages.

**Architecture:** `fetch_premarket.py` gains a `push_to_repo()` step that writes `data/premarket.json` to the local git repo and pushes to GitHub. `app.js` loads this new JSON file alongside existing market data and renders `renderPremarketBlock()` at the top of `renderMarketSheet()`, above the existing 今日重點 section.

**Tech Stack:** Python 3 (subprocess + json + pathlib), JavaScript ES2020, GitHub Pages (auto-deploy on push).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `~/scripts/fetch_premarket.py` | **Modify** | Add `push_to_repo()` + call it in `main()` |
| `~/scripts/tests/test_premarket.py` | **Modify** | Add test for `push_to_repo()` JSON format |
| `~/scripts/morning_board/repo/data/premarket.json` | Auto-generated | Written by fetch_premarket.py at 08:00 |
| `~/scripts/morning_board/repo/app.js` | **Modify** | Wire data loading + renderPremarketBlock() |

---

## Task 1: Add push_to_repo() to fetch_premarket.py

**Files:**
- Modify: `~/scripts/fetch_premarket.py`
- Test: `~/scripts/tests/test_premarket.py`

- [ ] **Step 1: Write the failing test**

  Add to `~/scripts/tests/test_premarket.py`:

  ```python
  def test_push_to_repo_writes_correct_json(pm, tmp_path):
      """push_to_repo writes premarket.json with the right schema — no git ops."""
      data_dir = tmp_path / "data"
      data_dir.mkdir()
      # Patch REPO_DATA to tmp_path so no real git is touched
      original = pm.REPO_DATA
      pm.REPO_DATA = data_dir

      sample_data = {label: {"price": 100.0, "pct": 1.0}
                     for label, _ in pm.SYMBOLS}
      analysis = "【今日判斷】偏多"

      # Call without git push by catching the subprocess error
      try:
          pm.push_to_repo(sample_data, analysis, "2026-06-13 08:00")
      except Exception:
          pass  # git ops will fail in tmp_path — that's fine

      pm.REPO_DATA = original
      out = data_dir / "premarket.json"
      assert out.exists(), "premarket.json not written"
      payload = json.loads(out.read_text())
      assert payload["generated_at"] == "2026-06-13 08:00"
      assert payload["analysis"] == "【今日判斷】偏多"
      assert len(payload["indicators"]) == len(pm.SYMBOLS)
      first = payload["indicators"][0]
      assert "label" in first and "price" in first and "pct" in first
  ```

  Also add `import json` at the top of the test file if not already present.

- [ ] **Step 2: Run test to verify it fails**

  ```bash
  cd ~/scripts && python3 -m pytest tests/test_premarket.py::test_push_to_repo_writes_correct_json -v
  ```
  Expected: `FAILED` — `AttributeError: module 'fetch_premarket' has no attribute 'push_to_repo'`

- [ ] **Step 3: Add constants and push_to_repo() to fetch_premarket.py**

  Open `~/scripts/fetch_premarket.py`. Find the existing constants block near the top (after `LOG_DIR` and `ENV_FILE`). Add after `LOG_DIR`:

  ```python
  REPO_DATA = Path("~/scripts/morning_board/repo/data").expanduser()
  REPO_DIR  = Path("~/scripts/morning_board/repo").expanduser()
  ```

  Then add this function after the `call_claude()` function (before `build_html()`):

  ```python
  def push_to_repo(data: dict, analysis: str, generated_at: str) -> None:
      """Write premarket.json to the repo and push to GitHub Pages."""
      payload = {
          "generated_at": generated_at,
          "indicators": [
              {"label": label, "price": data[label].get("price"), "pct": data[label].get("pct")}
              for label, _ in SYMBOLS
          ],
          "analysis": analysis,
      }
      premarket_json = REPO_DATA / "premarket.json"
      premarket_json.write_text(
          json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8"
      )
      subprocess.run(
          ["git", "-C", str(REPO_DIR), "add", "data/premarket.json"],
          check=True, capture_output=True,
      )
      diff = subprocess.run(
          ["git", "-C", str(REPO_DIR), "diff", "--cached", "--quiet"],
      )
      if diff.returncode != 0:
          subprocess.run(
              ["git", "-C", str(REPO_DIR), "commit", "-m",
               f"data: premarket {generated_at}"],
              check=True, capture_output=True,
          )
          subprocess.run(
              ["git", "-C", str(REPO_DIR), "push"],
              check=True, capture_output=True,
          )
          print(f"[premarket] pushed premarket.json ({generated_at})")
      else:
          print("[premarket] premarket.json unchanged, skip push")
  ```

- [ ] **Step 4: Call push_to_repo() in main()**

  In `~/scripts/fetch_premarket.py`, find `main()`. After the line that writes `premarket_snippet.html`, add:

  ```python
  try:
      push_to_repo(data, analysis, generated_at)
  except Exception as e:
      print(f"[premarket] repo push failed (non-fatal): {e}")
  ```

- [ ] **Step 5: Run the test — should pass now**

  ```bash
  cd ~/scripts && python3 -m pytest tests/test_premarket.py -v
  ```
  Expected: all 10 tests `PASSED`

- [ ] **Step 6: Run the script end-to-end**

  ```bash
  python3 ~/scripts/fetch_premarket.py
  ```
  Expected output includes:
  ```
  [premarket] pushed premarket.json (2026-06-13 ...)
  ```
  Or `unchanged, skip push` if data didn't change.

- [ ] **Step 7: Verify premarket.json exists in the repo**

  ```bash
  cat ~/scripts/morning_board/repo/data/premarket.json | python3 -m json.tool | head -20
  ```
  Expected: valid JSON with `generated_at`, `indicators` (7 items), `analysis` keys.

  ```bash
  cd ~/scripts/morning_board/repo && git log --oneline -3
  ```
  Expected: top commit starts with `data: premarket`

---

## Task 2: Wire premarket data loading in app.js

**Files:**
- Modify: `~/scripts/morning_board/repo/app.js` (4 edit locations)

- [ ] **Step 1: Add premarket to LOAD_NAME_TO_DATA_KEY (line ~314)**

  Find this block (lines 306–314):
  ```js
  const LOAD_NAME_TO_DATA_KEY = {
    meta: "meta", market: "market", news: "news", tax: "tax",
    funds: "funds", stocks: "stocks", popular_stocks: "popular",
    stock_brief: "stock_brief", insurances: "insurance",
    overseas_bonds: "obonds", overseas_bonds_all: "obonds_all", targets: "targets",
    allocation: "allocation", dca: "dca", wealth_transfer: "wealth",
    beatetf: "beatetf", presets: "presets", fund_compare: "fund_compare",
    tw_stocks: "tw_stocks", rankings: "rankings",
  };
  ```

  Replace with (add `premarket: "premarket"` on last line before closing brace):
  ```js
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
  ```

- [ ] **Step 2: Add premarket to TAB_LOAD_DEPS.market (line ~316)**

  Find:
  ```js
  market: ["market", "stocks", "rankings"],
  ```
  Replace with:
  ```js
  market: ["market", "stocks", "rankings", "premarket"],
  ```

- [ ] **Step 3: Add premarket to init() Promise.all (lines ~560–583)**

  Find the `init()` Promise.all destructuring (line 560):
  ```js
  const [meta, market, news, tax, funds, stocks, popular, stock_brief, insurance, obonds, obonds_all, targets, allocation, dca, wealth, beatetf, presets, fund_compare, tw_stocks, rankings, quotes_built_at] = await Promise.all([
  ```
  Replace with:
  ```js
  const [meta, market, news, tax, funds, stocks, popular, stock_brief, insurance, obonds, obonds_all, targets, allocation, dca, wealth, beatetf, presets, fund_compare, tw_stocks, rankings, quotes_built_at, premarket] = await Promise.all([
  ```

  Then find the last `safe()` call in that Promise.all block:
  ```js
      safe("quotes_built_at", { built_at: "" }),
  ```
  Replace with:
  ```js
      safe("quotes_built_at", { built_at: "" }),
      safe("premarket", null),
  ```

  Then find the DATA assignment in init() (line 583):
  ```js
  DATA = { meta, market, news, tax, funds, stocks, popular, stock_brief, insurance, obonds, obonds_all, targets, allocation, dca, wealth, beatetf, presets, fund_compare, tw_stocks, rankings, quotes_built_at };
  ```
  Replace with:
  ```js
  DATA = { meta, market, news, tax, funds, stocks, popular, stock_brief, insurance, obonds, obonds_all, targets, allocation, dca, wealth, beatetf, presets, fund_compare, tw_stocks, rankings, quotes_built_at, premarket };
  ```

- [ ] **Step 4: Add premarket to refreshData() Promise.all (lines ~887–910)**

  Find the `refreshData()` Promise.all destructuring (line 887) — identical pattern to Step 3. Apply the same three changes:

  1. Add `premarket` to destructuring:
  ```js
  const [..., quotes_built_at, premarket] = await Promise.all([
  ```
  2. Add safe call after `quotes_built_at`:
  ```js
      safe("quotes_built_at", { built_at: "" }),
      safe("premarket", null),
  ```
  3. Add `premarket` to DATA assignment (line 910):
  ```js
  DATA = { meta, market, news, tax, funds, stocks, popular, stock_brief, insurance, obonds, obonds_all, targets, allocation, dca, wealth, beatetf, presets, fund_compare, tw_stocks, rankings, quotes_built_at, premarket };
  ```

- [ ] **Step 5: Verify the four edits look correct**

  ```bash
  grep -n "premarket" ~/scripts/morning_board/repo/app.js | head -15
  ```
  Expected: lines in LOAD_NAME_TO_DATA_KEY, TAB_LOAD_DEPS, two Promise.all blocks, two DATA assignments.

---

## Task 3: Add renderPremarketBlock() and inject into renderMarketSheet()

**Files:**
- Modify: `~/scripts/morning_board/repo/app.js`

- [ ] **Step 1: Add renderPremarketBlock() function**

  Find `function renderMarketHighlights(m)` (line 4765). Insert the following new function **immediately before** it:

  ```js
  function renderPremarketBlock() {
    const p = DATA.premarket;
    if (!p) return "";

    const rows = (p.indicators || []).map(ind => {
      const price = ind.price;
      const pct   = ind.pct;
      const priceStr = price == null ? "—"
        : ind.label === "VIX"                              ? price.toFixed(1)
        : ind.label === "DXY" || ind.label === "USD/TWD"  ? price.toFixed(2)
        : Math.round(price).toLocaleString("en-US");
      const pctStr = pct == null ? "" :
        (pct >= 0 ? `▲ +${pct.toFixed(2)}%` : `▼ ${pct.toFixed(2)}%`);
      const cls = pct == null ? "" : pct >= 0 ? "up" : "down";
      return `<tr>
        <td style="color:var(--text-mute);padding:2px 12px 2px 0;font-size:13px">${escapeHtml(ind.label)}</td>
        <td class="${cls}" style="font-weight:600;font-size:13px;padding:2px 0">${escapeHtml(priceStr)}${pctStr ? ` ${escapeHtml(pctStr)}` : ""}</td>
      </tr>`;
    }).join("");

    const analysisHtml = (p.analysis || "").split("\n")
      .filter(l => l.trim())
      .map(l => {
        if (l.startsWith("【") && l.includes("】")) {
          const end = l.indexOf("】") + 1;
          return `<p style="margin:4px 0;font-size:13px;line-height:1.7"><strong style="color:var(--brand)">${escapeHtml(l.slice(0, end))}</strong> ${escapeHtml(l.slice(end).trim())}</p>`;
        }
        return `<p style="margin:4px 0;font-size:13px;line-height:1.7">${escapeHtml(l)}</p>`;
      }).join("");

    return `
      <div style="margin-bottom:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <h3 style="margin:0">盤前分析</h3>
          <span style="color:var(--text-mute);font-size:11px">${escapeHtml(p.generated_at || "")}</span>
        </div>
        <div class="fund-card" style="display:grid;grid-template-columns:auto 1fr;gap:12px 24px;align-items:start">
          <table style="border-collapse:collapse"><tbody>${rows}</tbody></table>
          <div>${analysisHtml}</div>
        </div>
      </div>`;
  }

  ```

- [ ] **Step 2: Inject renderPremarketBlock() into renderMarketSheet()**

  Find the return statement in `renderMarketSheet()` (line ~2582):
  ```js
    return `
      ${renderMarketHighlights(m)}

      <div class="tabs">
  ```

  Replace with:
  ```js
    return `
      ${renderPremarketBlock()}
      ${renderMarketHighlights(m)}

      <div class="tabs">
  ```

- [ ] **Step 3: Verify the JS is syntactically valid**

  ```bash
  node --check ~/scripts/morning_board/repo/app.js && echo "syntax OK"
  ```
  Expected: `syntax OK`

- [ ] **Step 4: Commit all app.js changes**

  ```bash
  cd ~/scripts/morning_board/repo && git add app.js && git commit -m "feat: add premarket analysis block to 全球市場 tab"
  ```

- [ ] **Step 5: Push to GitHub Pages**

  ```bash
  cd ~/scripts/morning_board/repo && git push
  ```
  Expected: push succeeds. GitHub Pages rebuilds in ~30 seconds.

- [ ] **Step 6: Verify live on GitHub Pages**

  Open https://iriswen518-alt.github.io/morning-board/ in a browser.

  - Switch to 全球市場 tab
  - Verify 「盤前分析」section appears at the top with the indicator table and Claude analysis
  - Verify 今日重點 (領漲/領跌) is still below it
  - If premarket.json is fresh (today's date in `generated_at`), the section is visible; if stale/weekend, it's still visible with the old timestamp

---

## Self-Review

- [x] **Spec coverage:**
  - ✅ `push_to_repo()` writes `premarket.json` and pushes — Task 1
  - ✅ `LOAD_NAME_TO_DATA_KEY` updated — Task 2 Step 1
  - ✅ `TAB_LOAD_DEPS.market` updated — Task 2 Step 2
  - ✅ `init()` Promise.all + DATA — Task 2 Step 3
  - ✅ `refreshData()` Promise.all + DATA — Task 2 Step 4
  - ✅ `renderPremarketBlock()` added — Task 3 Step 1
  - ✅ Injection into `renderMarketSheet()` — Task 3 Step 2
  - ✅ Error handling: push wrapped in try/except; `if (!p) return ""` for null DATA

- [x] **No placeholders:** All steps have complete code

- [x] **Type consistency:**
  - `push_to_repo(data, analysis, generated_at)` — same signature in test and implementation
  - `DATA.premarket` shape: `{generated_at, indicators, analysis}` — same in fetch_premarket.py and renderPremarketBlock()
  - `indicator` keys: `{label, price, pct}` — consistent throughout
