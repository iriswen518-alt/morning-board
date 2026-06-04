# 個股本益比 (P/E ratio) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show each individual stock's trailing 本益比 (P/E) in the ranking tables and the US (海外/熱門) stock tables; indices excluded.

**Architecture:** Enrich at the data layer (no fabrication, `null → —`). TW rankings P/E from TWSE `BWIBBU_ALL` bulk feed; US rankings P/E from the Yahoo screener payloads already fetched (trailing → forward fallback). US 海外/熱門 P/E (no screener there) from finnhub `/stock/metric` (peTTM). Frontend adds a sortable 本益比 column via a shared `fmtPE` helper.

**Tech Stack:** Python 3 (stdlib + `requests` shim already in repo), pytest, vanilla JS (`app.js`), CSS.

**⚠️ Canonical file locations (verified):**
- `fetch_rankings.py` runs **locally** from `~/scripts/morning_board/fetch_rankings.py`, writes `repo/data/rankings.json`. Tests: `~/scripts/morning_board/tests/test_rankings.py`. Cloud never touches rankings. **`~/scripts/morning_board` is NOT a git repo** — only `~/scripts/morning_board/repo/` is. So `fetch_rankings.py` and `tests/` are not version-controlled; edits just persist on disk and the local build runs them. No `git commit` for parent files.
- `fetch_stocks.py` / `fetch_popular_stocks.py` run in the **cloud** from `~/scripts/morning_board/repo/build/*.py` (workflow `morning-board-quotes.yml` copies `build/*.py → work/`). Edit the `build/` copies — they produce the live `stocks.json` / `popular_stocks.json`. (Parent + `repo/`-top duplicates are NOT run by the live pipeline.)
- Frontend: `~/scripts/morning_board/repo/app.js`, `style.css`. Deployed via the local build's commit/push; bump the `app.js?v=` cache-bust in `index.html`.

**Deviation from spec (noted):** Surface #3 (US 海外/熱門) sources P/E from **finnhub peTTM (trailing)**, not Yahoo — because those rows are built from finnhub `/quote`, not the screener. Forward fallback applies only to the screener-based rankings, as in the spec.

**Data shapes:**
- `rankings.json` rows gain `"pe": number|null`, `"pe_kind": "trailing"|"forward"|null`.
- `stocks.json` `us_stocks[]` and `popular_stocks.json` `stocks[]` rows gain `"per": number|null`, `"per_kind": "trailing"|null`.

---

## Task 1: TW rankings — fetch & attach trailing P/E (`fetch_rankings.py`)

**Files:**
- Modify: `~/scripts/morning_board/fetch_rankings.py`
- Test: `~/scripts/morning_board/tests/test_rankings.py`

- [ ] **Step 1: Write failing tests**

Add to `tests/test_rankings.py`:

```python
def test_clean_pe():
    assert R._clean_pe("27.18") == 27.18
    assert R._clean_pe("1,234.5") == 1234.5
    assert R._clean_pe("") is None
    assert R._clean_pe("-") is None
    assert R._clean_pe("0") is None        # 0 or negative = no meaningful P/E
    assert R._clean_pe("-5.2") is None
    assert R._clean_pe(None) is None


def test_apply_tw_pe_maps_by_code():
    universe = [
        {"symbol": "2330", "pe": None},
        {"symbol": "1101", "pe": None},
        {"symbol": "9999", "pe": None},
    ]
    pe_raw = [
        {"Code": "2330", "PEratio": "21.50"},
        {"Code": "1101", "PEratio": "-"},      # no P/E -> stays None
    ]
    R.apply_tw_pe(universe, pe_raw)
    assert universe[0]["pe"] == 21.50
    assert universe[1]["pe"] is None
    assert universe[2]["pe"] is None           # absent from feed -> None


def test_build_tw_universe_has_pe_field():
    rows = [{"Code": "2330", "Name": "台積電", "ClosingPrice": "1000",
             "Change": "10", "TradeValue": "5"}]
    uni = R.build_tw_universe(rows)
    assert "pe" in uni[0] and uni[0]["pe"] is None
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `cd ~/scripts/morning_board && python3 -m pytest tests/test_rankings.py -k "pe or clean_pe" -v`
Expected: FAIL (`AttributeError: module 'fetch_rankings' has no attribute '_clean_pe'`).

- [ ] **Step 3: Implement**

In `fetch_rankings.py`, add the pure helper near `twse_daily_pct` (after line 31):

```python
def _clean_pe(v):
    """TWSE/Yahoo P/E → float or None. '' / '-' / <=0 → None (虧損或無)."""
    try:
        f = float(str(v).replace(",", ""))
    except (ValueError, TypeError):
        return None
    return f if f > 0 else None
```

In `build_tw_universe`, add `"pe": None,` to the appended dict (next to `"market_cap": None,`).

Add the BWIBBU source + apply/fetch functions after `fetch_tw_shares` (after line 131):

```python
TWSE_BWIBBU = "https://openapi.twse.com.tw/v1/exchangeReport/BWIBBU_ALL"


def apply_tw_pe(universe, pe_raw):
    pe = {}
    for r in pe_raw:
        code = str(r.get("Code", "")).strip()
        if code:
            pe[code] = _clean_pe(r.get("PEratio"))
    for u in universe:
        if u["symbol"] in pe:
            u["pe"] = pe[u["symbol"]]


def fetch_tw_pe(warnings):
    try:
        return json.loads(fmd.http_get(TWSE_BWIBBU).decode("utf-8"))
    except Exception as e:  # noqa: BLE001
        warnings.append(f"TW P/E (BWIBBU_ALL): {e}")
        return []
```

- [ ] **Step 4: Run tests, verify they pass**

Run: `cd ~/scripts/morning_board && python3 -m pytest tests/test_rankings.py -k "pe or clean_pe" -v`
Expected: PASS.

- [ ] **Step 5: No commit (parent dir is not git)**

`fetch_rankings.py` and `tests/` live outside any git repo — the edits persist on disk and the local build runs them. Nothing to commit here. (The committed artifact is `repo/data/rankings.json`, handled in Task 3.)

---

## Task 2: US rankings — trailing→forward P/E from screener (`fetch_rankings.py`)

**Files:**
- Modify: `~/scripts/morning_board/fetch_rankings.py`
- Test: `~/scripts/morning_board/tests/test_rankings.py`

- [ ] **Step 1: Write failing tests**

```python
def test_parse_yahoo_screener_pe_trailing_then_forward():
    payload = {"finance": {"result": [{"quotes": [
        {"symbol": "AAA", "shortName": "A", "regularMarketPrice": 10,
         "regularMarketChangePercent": 1, "marketCap": 1e9,
         "trailingPE": 18.0, "forwardPE": 15.0},
        {"symbol": "BBB", "shortName": "B", "regularMarketPrice": 20,
         "regularMarketChangePercent": 2, "marketCap": 2e9,
         "trailingPE": None, "forwardPE": 12.5},   # gainer with no trailing earnings
        {"symbol": "CCC", "shortName": "C", "regularMarketPrice": 30,
         "regularMarketChangePercent": 3, "marketCap": 3e9,
         "trailingPE": -4.0, "forwardPE": None},    # negative -> None, no forward
    ]}]}}
    out = R.parse_yahoo_screener(payload)
    assert (out[0]["pe"], out[0]["pe_kind"]) == (18.0, "trailing")
    assert (out[1]["pe"], out[1]["pe_kind"]) == (12.5, "forward")
    assert (out[2]["pe"], out[2]["pe_kind"]) == (None, None)
```

- [ ] **Step 2: Run, verify fail**

Run: `cd ~/scripts/morning_board && python3 -m pytest tests/test_rankings.py -k screener_pe -v`
Expected: FAIL (`KeyError: 'pe'`).

- [ ] **Step 3: Implement**

In `fetch_rankings.py`, extend `_us_item` signature and body (currently lines 223-234) to accept P/E:

```python
def _us_item(symbol, name, price, daily_pct, market_cap=None, pe=None, pe_kind=None):
    return {
        "symbol": symbol,
        "name": name,
        "price": price,
        "daily_pct": _round2(daily_pct),
        "market_cap": market_cap,
        "pe": pe,
        "pe_kind": pe_kind,
        "mtd_pct": None,
        "ytd_pct": None,
        "yahoo": symbol,
        "source_url": f"https://finance.yahoo.com/quote/{symbol}",
    }
```

In `parse_yahoo_screener` (lines 237-253), compute P/E before building the item and pass it in:

```python
def parse_yahoo_screener(payload):
    quotes = payload.get("finance", {}).get("result", [{}])[0].get("quotes", [])
    out = []
    for q in quotes:
        price = q.get("regularMarketPrice")
        if price is None or price < 2:  # 濾雜訊低價股
            continue
        pe = _clean_pe(q.get("trailingPE"))
        pe_kind = "trailing" if pe is not None else None
        if pe is None:
            pe = _clean_pe(q.get("forwardPE"))
            pe_kind = "forward" if pe is not None else None
        out.append(
            _us_item(
                q.get("symbol"),
                q.get("shortName") or q.get("symbol"),
                price,
                q.get("regularMarketChangePercent"),
                q.get("marketCap"),
                pe,
                pe_kind,
            )
        )
    return out
```

- [ ] **Step 4: Run, verify pass**

Run: `cd ~/scripts/morning_board && python3 -m pytest tests/test_rankings.py -v`
Expected: PASS (all tests, including pre-existing).

- [ ] **Step 5: No commit (parent dir is not git)** — edits persist on disk; continue.

---

## Task 3: Wire TW P/E into the section, add validation, regenerate data

**Files:**
- Modify: `~/scripts/morning_board/fetch_rankings.py`
- Test: `~/scripts/morning_board/tests/test_rankings.py`

- [ ] **Step 1: Write failing test for validation**

```python
def _ranking_payload(pe_value):
    row = {"symbol": "2330", "daily_pct": 1.0, "market_cap": 1, "pe": pe_value}
    sec = {"top_marketcap": [row], "top_gainers": [row],
           "top_losers": [row], "top_etf": [row]}
    return {"tw": {"as_of": "2026-06-04", **sec},
            "us": {"as_of": "2026-06-04", **sec}}


def test_validate_warns_when_all_pe_none():
    warns = R.validate(_ranking_payload(None))
    assert any("P/E 全 None" in w and "[tw] top_marketcap" in w for w in warns)


def test_validate_no_pe_warning_when_present():
    warns = R.validate(_ranking_payload(20.0))
    assert not any("P/E 全 None" in w for w in warns)
```

- [ ] **Step 2: Run, verify fail**

Run: `cd ~/scripts/morning_board && python3 -m pytest tests/test_rankings.py -k validate -v`
Expected: FAIL.

- [ ] **Step 3: Implement**

In `fetch_tw_section` (lines 175-184), add the P/E enrichment right after the market-cap line:

```python
    apply_tw_market_cap(uni, fetch_tw_shares(warnings))
    apply_tw_pe(uni, fetch_tw_pe(warnings))
```

In `validate` (lines 322-338), add a P/E check inside the per-list loop — after the existing `top_marketcap` / `daily_pct` branches, append:

```python
            if lst in ("top_marketcap", "top_gainers", "top_losers") and rows and all(
                r.get("pe") is None for r in rows
            ):
                warnings.append(f"[{mkt}] {lst} P/E 全 None")
```

(Place this as an independent `if` after the existing `if/elif` chain so it can co-fire.)

- [ ] **Step 4: Run all tests, verify pass**

Run: `cd ~/scripts/morning_board && python3 -m pytest tests/test_rankings.py -v`
Expected: PASS.

- [ ] **Step 5: Regenerate rankings.json and eyeball P/E**

Run: `cd ~/scripts/morning_board && python3 fetch_rankings.py && python3 -c "import json; d=json.load(open('repo/data/rankings.json')); [print(m, [(r['symbol'], r.get('pe'), r.get('pe_kind')) for r in d[m]['top_marketcap'][:3]]) for m in ('tw','us')]"`
Expected: prints real P/E numbers (e.g. `('2330', 21.x, ...)`); some `None` acceptable, but not all-None per market.

- [ ] **Step 6: Commit the regenerated data (this lives in the git repo)**

```bash
cd ~/scripts/morning_board/repo && git add data/rankings.json && \
git commit -m "data(rankings): add per-stock P/E" || true
```
(Only `repo/data/rankings.json` is in git. The local build will also commit/push it on its next scheduled run if you skip this.)

---

## Task 4: Frontend — `fmtPE` + 本益比 column in ranking tables (`app.js`)

**Files:**
- Modify: `~/scripts/morning_board/repo/app.js` (renderRankingTable ~4249, renderRankingsBlock ~4288, fmtMarketCapZh ~4281)
- Modify: `~/scripts/morning_board/repo/index.html` (cache-bust)

- [ ] **Step 1: Add `fmtPE` helper**

Immediately after `fmtMarketCapZh` (after its closing `}`, ~line 4286), add:

```javascript
function fmtPE(pe, kind) {
  if (pe == null) return "—";
  const s = Number(pe).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return kind === "forward" ? `${s} 預` : s;
}
```

- [ ] **Step 2: Add P/E to `renderRankingTable`**

Change `const showCap = opts && opts.showMarketCap;` to also read `showPE`:

```javascript
  const showCap = opts && opts.showMarketCap;
  const showPE = opts && opts.showPE;
```

In the row template, insert a P/E cell right after the 收盤 `<td>` (the `Number(r.price)...` line):

```javascript
      ${showPE ? `<td>${fmtPE(r.pe, r.pe_kind)}</td>` : ""}
```

Update the `<colgroup>` ternary to choose by `showPE` (8-col) vs not (6-col):

```javascript
      ${showPE
        ? `<colgroup><col style="width:7%"><col style="width:22%"><col style="width:14%"><col style="width:11%"><col style="width:11%"><col style="width:11%"><col style="width:11%"><col style="width:13%"></colgroup>`
        : `<colgroup><col style="width:8%"><col style="width:30%"><col style="width:18%"><col style="width:14%"><col style="width:14%"><col style="width:16%"></colgroup>`}
```

In the `<thead>`, insert a P/E header right after the 收盤 `<th>`:

```javascript
        ${showPE ? `<th class="sortable-th" title="本益比（近四季 trailing；「預」=預估 forward）；點選排序">本益比</th>` : ""}
```

- [ ] **Step 3: Pass `showPE` from `renderRankingsBlock`**

Replace the `blocks` array and the `.map` call (lines ~4291-4302):

```javascript
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
```

- [ ] **Step 4: Syntax check**

Run: `cd ~/scripts/morning_board/repo && node --check app.js && echo OK`
Expected: `app.js syntax OK` / `OK`.

- [ ] **Step 5: Manual visual verify**

Run: `cd ~/scripts/morning_board/repo && python3 -m http.server 8765 &` then open `http://localhost:8765/` → 全球市場/台股 tab → scroll to 排行榜.
Expected: 市值前十大/漲幅/跌幅 show a **本益比** column after 收盤, aligned across all three; values 2dp; some `—`; any forward shows `27.18 預`. ETF 榜 has no 本益比 column. Click the 本益比 header → sorts. Kill server: `kill %1`.

- [ ] **Step 6: Bump cache-bust, commit, deploy**

```bash
cd ~/scripts/morning_board/repo && VBUST=$(date '+%Y%m%d-%H%M') && \
/usr/bin/sed -i '' -E "s|app\.js\?v=[0-9-]+|app.js?v=${VBUST}|" index.html && \
git add app.js index.html && \
git commit -m "feat(rankings): 本益比 column + fmtPE in ranking tables" && \
git push origin main
```

- [ ] **Step 7: Verify Pages build**

Run: `sleep 12 && gh api repos/iriswen518-alt/morning-board/pages/builds --jq '.[0]|{status,error:.error.message,commit:.commit[0:7]}'`
Expected: `status: built` (or `building`), `error: null`.

---

## Task 5: US 海外股票 — finnhub P/E in `build/fetch_stocks.py`

**Files:**
- Modify: `~/scripts/morning_board/repo/build/fetch_stocks.py`
- Test: `~/scripts/morning_board/tests/test_stocks_pe.py` (new)

- [ ] **Step 1: Write failing test (pure parse helper)**

Create `~/scripts/morning_board/tests/test_stocks_pe.py`:

```python
import importlib.util, pathlib

spec = importlib.util.spec_from_file_location(
    "fetch_stocks",
    pathlib.Path(__file__).parent.parent / "repo" / "build" / "fetch_stocks.py",
)
S = importlib.util.module_from_spec(spec)
spec.loader.exec_module(S)


def test_pe_from_finnhub_metric():
    assert S.pe_from_finnhub_metric({"metric": {"peTTM": 28.5}}) == 28.5
    assert S.pe_from_finnhub_metric({"metric": {"peTTM": 0}}) is None
    assert S.pe_from_finnhub_metric({"metric": {"peTTM": -3.1}}) is None
    assert S.pe_from_finnhub_metric({"metric": {}}) is None
    assert S.pe_from_finnhub_metric({}) is None
    assert S.pe_from_finnhub_metric(None) is None
```

- [ ] **Step 2: Run, verify fail**

Run: `cd ~/scripts/morning_board && python3 -m pytest tests/test_stocks_pe.py -v`
Expected: FAIL (`AttributeError: ... has no attribute 'pe_from_finnhub_metric'`).

- [ ] **Step 3: Implement**

In `repo/build/fetch_stocks.py`, near `fetch_finnhub_quote` (line 69), add:

```python
def pe_from_finnhub_metric(data):
    """finnhub /stock/metric JSON → trailing P/E (peTTM) float or None."""
    if not isinstance(data, dict):
        return None
    v = (data.get("metric") or {}).get("peTTM")
    try:
        f = float(v)
    except (ValueError, TypeError):
        return None
    return f if f > 0 else None


def fetch_finnhub_pe(symbol):
    """Trailing P/E via finnhub /stock/metric. Returns float or None."""
    if not FINNHUB_KEY:
        return None
    try:
        r = requests.get(
            "https://finnhub.io/api/v1/stock/metric",
            params={"symbol": symbol, "metric": "all", "token": FINNHUB_KEY},
            timeout=10,
        )
        r.raise_for_status()
        return pe_from_finnhub_metric(r.json())
    except Exception as e:  # noqa: BLE001
        print(f"   ! finnhub PE {symbol}: {e}")
        return None
```

(Verified: this file already defines `FINNHUB_KEY` and uses `requests.get(url, params=..., timeout=10)` + `r.json()` in `fetch_finnhub_quote` — match that exactly. No `json`/`http_get` import needed.)

In the US-stock build loop, where each `rec` is finalized before `out["us_stocks"].append(rec)` (~line 386), set:

```python
        rec["per"] = fetch_finnhub_pe(rec["symbol"]) if rec.get("price") is not None else None
        rec["per_kind"] = "trailing" if rec["per"] is not None else None
```

- [ ] **Step 4: Run, verify pass**

Run: `cd ~/scripts/morning_board && python3 -m pytest tests/test_stocks_pe.py -v`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
cd ~/scripts/morning_board/repo && git add build/fetch_stocks.py && \
git commit -m "feat(stocks): US trailing P/E via finnhub peTTM" || true
```
(`tests/test_stocks_pe.py` is in the non-git parent — it just stays on disk for `pytest`.)

---

## Task 6: 熱門海外股票 — P/E in `build/fetch_popular_stocks.py`

**Files:**
- Modify: `~/scripts/morning_board/repo/build/fetch_popular_stocks.py`

- [ ] **Step 1: Implement (reuses `fetch_finnhub_pe` from fetch_stocks)**

`fetch_popular_stocks.py` already imports helpers from `fetch_stocks` (see its top-of-file import of `fetch_finnhub_quote, fetch_yahoo_history, compute_mtd_ytd, UA, ...`). Add `fetch_finnhub_pe` to that import list.

In `build_record`, add `"per": None,` and `"per_kind": None,` to the initial `rec` dict, and just before `return rec, True` set:

```python
    rec["per"] = fetch_finnhub_pe(symbol)
    rec["per_kind"] = "trailing" if rec["per"] is not None else None
```

- [ ] **Step 2: Smoke test the script (network)**

Run: `cd ~/scripts/morning_board/repo/build && python3 fetch_popular_stocks.py && python3 -c "import json; d=json.load(open('../data/popular_stocks.json')); print([(s['symbol'], s.get('per')) for s in d['stocks'][:5]])"`
Expected: prints symbols with some numeric `per` values (blue-chips populated; small caps may be `None`).
(If finnhub rate-limits, P/E may be sparse — acceptable, shows `—`.)

- [ ] **Step 3: Commit**

```bash
cd ~/scripts/morning_board/repo && git add build/fetch_popular_stocks.py data/popular_stocks.json && \
git commit -m "feat(popular): US trailing P/E via finnhub" || true
```

---

## Task 7: Frontend — 本益比 column in `renderStocksTable` (`app.js`)

**Files:**
- Modify: `~/scripts/morning_board/repo/app.js` (renderStocksTable ~4126-4150)
- Modify: `~/scripts/morning_board/repo/index.html` (cache-bust)

- [ ] **Step 1: Add P/E cell to the row template**

In the `rows = list.map(...)` return (after the 收盤 `<td>` at line 4129), insert:

```javascript
      <td>${fmtPE(s.per, s.per_kind)}</td>
```

- [ ] **Step 2: Add P/E header**

In the `<thead>`, after the 收盤 `<th>` (line 4142), insert:

```javascript
        <th class="sortable-th" title="本益比（近四季 trailing，來源：finnhub）；點選排序">本益比</th>
```

- [ ] **Step 3: Syntax check**

Run: `cd ~/scripts/morning_board/repo && node --check app.js && echo OK`
Expected: `OK`.

- [ ] **Step 4: Manual visual verify**

Serve locally (as Task 4 Step 5) → 海外股票 tab → 熱門海外股票 / curated tables.
Expected: a **本益比** column after 收盤; numeric where available, `—` otherwise; header sorts. (Data may be `—` everywhere until the cloud rebuild runs the updated `build/` scripts — that's expected; the column structure is correct.)

- [ ] **Step 5: Bump cache-bust, commit, deploy**

```bash
cd ~/scripts/morning_board/repo && VBUST=$(date '+%Y%m%d-%H%M') && \
/usr/bin/sed -i '' -E "s|app\.js\?v=[0-9-]+|app.js?v=${VBUST}|" index.html && \
git add app.js index.html && \
git commit -m "feat(stocks): 本益比 column in 海外/熱門股票表" && \
git push origin main
```

- [ ] **Step 6: Verify Pages build**

Run: `sleep 12 && gh api repos/iriswen518-alt/morning-board/pages/builds --jq '.[0]|{status,error:.error.message,commit:.commit[0:7]}'`
Expected: `status: built`/`building`, `error: null`.

---

## Final verification

- [ ] All Python tests pass: `cd ~/scripts/morning_board && python3 -m pytest tests/test_rankings.py tests/test_stocks_pe.py -v`
- [ ] `rankings.json` has non-all-None `pe` per market (Task 3 Step 5).
- [ ] PWA hard-refresh: 本益比 visible & sortable in 排行榜 (3 tables, ETF excluded) and 海外/熱門 tables; `—` for missing; `預` for forward.
- [ ] Indices (全球股市) unchanged — no P/E column.
- [ ] Note for user: US 海外/熱門 P/E values populate after the next **cloud** run of `morning-board-quotes.yml` (the frontend column ships immediately, showing `—` until then).
