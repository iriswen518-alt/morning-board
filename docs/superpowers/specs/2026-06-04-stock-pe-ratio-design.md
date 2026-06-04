# 個股本益比 (P/E ratio) — Design Spec

- **Date:** 2026-06-04
- **Scope:** Add trailing 本益比 (P/E) to individual-stock surfaces. **Indices excluded** (no clean daily index-level P/E source).
- **Status:** Approved design → ready for implementation plan.

## Goal

Show each individual stock's **本益比 (trailing, 近四季)** across the app's stock-listing surfaces, sourced from official feeds, never fabricated (`—` when unavailable, per the app's 不臆測 rule).

## Surfaces

| # | Surface | Render fn | Current | Action |
|---|---------|-----------|---------|--------|
| 1 | 排行榜 (市值前十大 / 最大漲幅 / 最大跌幅) | `renderRankingTable` | no P/E | **Add column + data** |
| 2 | 個股查詢基本面 (TW single stock) | `renderValuationGrid` ← `loadTwStockValuation` | **already shows 本益比** (BWIBBU 上市 / 櫃買 OpenAPI 上櫃) | none |
| 3 | 熱門海外股票 + curated 海外股票 (US) | `renderStocksTable` | no P/E | **Add column + data** |

ETF 排行榜 (`top_etf`) gets **no** P/E column — ETFs have no P/E. An ETF that lands in 漲幅/跌幅 shows `—`.

## Data sources

### TW stocks (rankings universe = 上市 / `STOCK_DAY_ALL`)
- **`https://openapi.twse.com.tw/v1/exchangeReport/BWIBBU_ALL`** — per-stock daily 本益比 (`PEratio`), 殖利率, 股價淨值比. Verified: 1078 rows; fields `Code, Name, PEratio, DividendYield, PBratio`.
- `PEratio` is trailing (近四季). Empty string `""` or `"-"` (虧損/無) → `null`.
- Attach via a new `apply_tw_pe(universe, pe_raw)` that mirrors the existing `apply_tw_market_cap` (build `code → pe` map, set `u["pe"]`). One extra bulk HTTP call; no per-symbol calls.

### US stocks (Yahoo screeners, already fetched)
- Read `trailingPE` from existing screener payloads (`day_gainers`, `day_losers`, `most_actives`). **Zero extra calls.**
- If `trailingPE` is missing/None, fall back to `forwardPE` and set `pe_kind: "forward"`; otherwise `pe_kind: "trailing"`.
- ETF pool (`yahoo_quote`) — no reliable P/E; leave `pe: null`.

### US popular/curated (`fetch_popular_stocks.py`, `fetch_stocks.py`)
- Populate `per` (and `per_kind`) from Yahoo `trailingPE → forwardPE` for each stock, so `renderStocksTable` can display it.

## Data shape

`rankings.json` rows gain:
```json
{ "pe": 27.18, "pe_kind": "trailing" }   // pe: number | null ; pe_kind: "trailing" | "forward"
```
`popular.json` / `stocks.json` rows gain `per` (number|null) and `per_kind` ("trailing"|"forward"), matching the field name `renderValuationGrid`/`renderStocksTable` already use (`per`).

## Rendering

### Rankings (`renderRankingTable`)
- New column **本益比** inserted **right after 收盤**:
  `排名 · 名稱 · 收盤 · 本益比 · 日 · 本月 · 本年 · 市值`
- Sortable (`sortable-th`), numeric.
- Recompute `<colgroup>` for the now-8-column tables so 市值前十大 / 漲幅 / 跌幅 stay aligned. Proposed widths (%): `排名 7 · 名稱 22 · 收盤 14 · 本益比 11 · 日 11 · 本月 11 · 本年 11 · 市值 13` = 100. ETF table (no 本益比, no 市值) keeps its own 6-col group.

### Display rules (shared helper)
- `pe == null` → `—`.
- trailing → plain number, **2 decimals** (`27.18`).
- forward fallback → `27.18 預` (small「預」tag) + a footnote「預＝預估 forward；其餘為近四季 trailing」.
- Negative trailing P/E (虧損) → treated as `null` → `—`.

### US tables (`renderStocksTable`)
- Add **本益比** column using the same display rules and `per` / `per_kind` fields. Applies to both 熱門 and curated US tables (shared render).

## Validation (`fetch_rankings.py` `validate()`)
- Add a soft warning when a 個股 ranking list (`top_marketcap` / `top_gainers` / `top_losers`) has **all** `pe == null` (signals BWIBBU fetch failure or field rename). Non-fatal — pipeline still writes the file.

## Out of scope
- Index-level (指數 / 全球股市) P/E — no clean daily source; explicitly dropped.
- Surface #2 (TW 個股查詢) — already implemented; untouched.
- ETF P/E.

## Testing
- Unit: `apply_tw_pe` maps codes correctly, parses `""`/`"-"`/negative → `null`; US `pe_kind` falls back to forward when trailing missing. Extend `tests/test_rankings.py`.
- Manual: rebuild `rankings.json`, hard-refresh PWA, confirm the 本益比 column renders, sorts, aligns across the three tables, and shows `—`/`預` correctly.
