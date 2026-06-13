# Premarket PWA Integration — Design Spec

**Date:** 2026-06-13
**Status:** Approved

---

## Overview

Add the daily premarket analysis (already running locally via `fetch_premarket.py`) to the 理財小幫手 PWA (GitHub Pages). The analysis appears at the top of the 全球市場 tab, above the existing 今日重點 section.

---

## Architecture & Data Flow

```
fetch_premarket.py (launchd Mon–Fri 08:00)
  ├── [existing] fetch 7 indicators from Yahoo Finance
  ├── [existing] call Claude CLI → analysis text
  ├── [existing] write ~/scripts/logs/premarket_snippet.html
  └── [NEW] write repo/data/premarket.json → git commit → git push

GitHub Pages auto-deploys (~30s after push)
  └── PWA fetches data/premarket.json on market tab open
      └── renderPremarketBlock() renders at top of market sheet
```

---

## premarket.json Schema

```json
{
  "generated_at": "2026-06-13 08:00",
  "indicators": [
    {"label": "S&P 500",  "price": 7431,    "pct": 0.64},
    {"label": "NASDAQ",   "price": 25879,   "pct": 0.66},
    {"label": "道瓊",      "price": 51303,   "pct": 0.86},
    {"label": "VIX",      "price": 19.1,    "pct": 1.22},
    {"label": "DXY",      "price": 99.77,   "pct": -0.28},
    {"label": "USD/TWD",  "price": 31.60,   "pct": 0.04},
    {"label": "台股加權",  "price": 44169,   "pct": 1.53}
  ],
  "analysis": "【今日判斷】偏多...\n\n【美股摘要】...\n\n【台股展望】...\n\n【今日注意】..."
}
```

`price: null` and `pct: null` are valid (shown as "—").

---

## UI Layout

```
全球市場 tab
┌─────────────────────────────────────────────┐
│ 盤前分析  2026-06-13 08:00         [NEW]     │
│  S&P 500   7,431  ▲ +0.64%                 │
│  NASDAQ   25,879  ▲ +0.66%                 │
│  道瓊     51,303  ▲ +0.86%                 │
│  VIX        19.1  ▲ +1.22%                 │
│  DXY        99.8  ▼ -0.28%                 │
│  USD/TWD    31.60  ▲ +0.04%                │
│  台股加權  44,169  ▲ +1.53%                │
│                                             │
│  【今日判斷】偏多，主因美股三大指數齊漲       │
│  【美股摘要】…                              │
│  【台股展望】…                              │
│  【今日注意】…                              │
├─────────────────────────────────────────────┤
│ 今日重點 (existing — 領漲/領跌 + TLDR)      │
├─────────────────────────────────────────────┤
│ 股市 | 債券 | 匯率 | 美股 | 台股            │
└─────────────────────────────────────────────┘
```

Styling follows existing PWA design tokens (`--brand`, `var(--text-mute)`, `fund-card` class).

---

## Files to Create / Modify

| File | Action | Notes |
|---|---|---|
| `~/scripts/fetch_premarket.py` | **Modify** | Add `push_to_repo()` function after analysis |
| `~/scripts/morning_board/repo/data/premarket.json` | Auto-generated | Written by fetch_premarket.py at 08:00 |
| `~/scripts/morning_board/repo/app.js` | **Modify** | Add load dep, safe default, renderPremarketBlock() |

---

## fetch_premarket.py Changes

Add `push_to_repo()` at the end of `main()`:

```python
REPO_DATA = Path("~/scripts/morning_board/repo/data").expanduser()
REPO_DIR  = Path("~/scripts/morning_board/repo").expanduser()

def push_to_repo(data: dict, analysis: str, generated_at: str) -> None:
    payload = {
        "generated_at": generated_at,
        "indicators": [
            {"label": label, "price": data[label]["price"], "pct": data[label]["pct"]}
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
        check=True
    )
    result = subprocess.run(
        ["git", "-C", str(REPO_DIR), "diff", "--cached", "--quiet"],
    )
    if result.returncode != 0:  # changes staged
        subprocess.run(
            ["git", "-C", str(REPO_DIR), "commit", "-m",
             f"data: premarket {generated_at}"],
            check=True
        )
        subprocess.run(
            ["git", "-C", str(REPO_DIR), "push"],
            check=True
        )
        print(f"[premarket] pushed premarket.json ({generated_at})")
    else:
        print("[premarket] premarket.json unchanged, skip push")
```

Wrapped in try/except — push failure prints warning but does not crash the script.

---

## app.js Changes

### 1. LOAD_NAME_TO_DATA_KEY
```js
// add entry (needed for retryFailedForTab to work):
premarket: "premarket",
```

### 2. TAB_LOAD_DEPS
```js
// before:
market: ["market", "stocks", "rankings"],
// after:
market: ["market", "stocks", "rankings", "premarket"],
```

### 3. init() Promise.all — three places
```js
// 1. add to Promise.all array:
safe("premarket", null),
// 2. add to destructuring:
const [..., premarket] = await Promise.all([...])
// 3. add to DATA assignment:
DATA = { ..., premarket };
```

### 3. renderPremarketBlock() — new function
```js
function renderPremarketBlock() {
  const p = DATA.premarket;
  if (!p) return "";

  const rows = (p.indicators || []).map(ind => {
    const price = ind.price;
    const pct   = ind.pct;
    const priceStr = price == null ? "—"
      : ind.label === "VIX"                     ? price.toFixed(1)
      : ind.label === "DXY" || ind.label === "USD/TWD" ? price.toFixed(2)
      : Math.round(price).toLocaleString("en-US");
    const pctStr = pct == null ? "" :
      (pct >= 0 ? `▲ +${pct.toFixed(2)}%` : `▼ ${pct.toFixed(2)}%`);
    const cls = pct == null ? "" : pct >= 0 ? "up" : "down";
    return `<tr>
      <td style="color:var(--text-mute);padding:2px 12px 2px 0;font-size:13px">${escapeHtml(ind.label)}</td>
      <td style="font-weight:600;font-size:13px;padding:2px 0" class="${cls}">${escapeHtml(priceStr)}${pctStr ? `  ${pctStr}` : ""}</td>
    </tr>`;
  }).join("");

  const analysisHtml = (p.analysis || "").split("\n")
    .filter(l => l.trim())
    .map(l => {
      if (l.startsWith("【") && l.includes("】")) {
        const end = l.indexOf("】") + 1;
        return `<p style="margin:4px 0;font-size:13px;line-height:1.7">
          <strong style="color:var(--brand)">${escapeHtml(l.slice(0, end))}</strong>
          ${escapeHtml(l.slice(end).trim())}
        </p>`;
      }
      return `<p style="margin:4px 0;font-size:13px;line-height:1.7">${escapeHtml(l)}</p>`;
    }).join("");

  return `
    <div style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <h3 style="margin:0">盤前分析</h3>
        <span style="color:var(--text-mute);font-size:11px">${escapeHtml(p.generated_at || "")}</span>
      </div>
      <div class="fund-card" style="display:grid;grid-template-columns:auto 1fr;gap:12px 24px">
        <table style="border-collapse:collapse;align-self:start"><tbody>${rows}</tbody></table>
        <div>${analysisHtml}</div>
      </div>
    </div>`;
}
```

### 4. renderMarketSheet() — inject at top
```js
// before:
return `
  ${renderMarketHighlights(m)}
  ...
// after:
return `
  ${renderPremarketBlock()}
  ${renderMarketHighlights(m)}
  ...
```

---

## Error Handling

| Situation | Behavior |
|---|---|
| `premarket.json` missing (weekend, first deploy) | `DATA.premarket = null` → block hidden, market tab unaffected |
| Claude analysis empty | `analysis: ""` → only indicator table shown |
| Any indicator `price: null` | Displays "—" |
| git push fails | Warning printed, script continues, local files written |
| `generated_at` stale | Timestamp shown as-is; user can see age |

---

## Service Worker Cache

`premarket.json` follows existing SW cache pattern: cache key uses `origin + pathname` (no query string), cache-busted via `?t=Date.now()` in `load()`. No special handling needed — it behaves identically to `market.json`, `news.json`, etc.
