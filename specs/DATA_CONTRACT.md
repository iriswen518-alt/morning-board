# 理財小幫手 — 資料合約 (Data Contract)

> **單一真相來源 (single source of truth)。**
> fetch 腳本「生產者」與 `app.js`「消費者」之間的資料形狀，以此檔為準。
> 改了 fetch 腳本的輸出，或 app.js 改了讀法，**先改這份合約**，再跑 `python build/validate_contract.py` 驗證。
> 借自 Claude sub-agent dashboard 的「先寫合約再寫程式」紀律，專治「改了沒生效 / 補丁被覆蓋」這類 bug。

## 慣例 (conventions)

- 每個檔都帶時間戳記欄位：`generated_at` 或 `built_at`（ISO 8601，含 +08:00 或省略時區）。
- 百分比欄位（`*_pct`）一律是 number，**可為 `null`**（資料缺漏時），不可為字串。
- 個股／指數陣列每筆都帶 `error` 或 `ok` 欄位讓前端容錯。
- 數字若上游給字串（如 `tw_revenue_history` 的 `rev`/`yoy`），標註 `str-number` —— 前端需自行 parse。

## 核心檔合約

### data/stocks.json　（生產者：build/fetch_stocks.py）
- `generated_at`: str (ISO)
- `source`: str
- `us_stocks[]`, `tw_stocks[]`: 每筆物件
  - `symbol`: str　·　`name_zh`: str　·　`kind`: "US" | "TW"
  - `price`: number|null　·　`change_pct`: number|null
  - `mtd_pct`, `ytd_pct`, `perf_1y`, `perf_3y`, `perf_5y`: number|null
  - `market_date`: str (YYYY-MM-DD)　·　`source_url`: str
  - `per`: number|null　·　`per_kind`: str|null　·　`error`: str|null

### data/popular_stocks.json　（生產者：build/fetch_popular_stocks.py）
- `generated_at`: str　·　`source`: str
- `stocks[]`: `symbol, name_zh, kind, price, change_pct, mtd_pct, ytd_pct, market_date, per, per_kind, source_url, error`
  （型別同上）

### data/live_indices.json　（生產者：build/fetch_live_indices.py）
- `built_at`: str
- `indices[]`: 每筆
  - `ok`: bool　·　`symbol`: str　·　`name_zh`: str
  - `last`, `prev_close`, `change`, `change_pct`: number|null
  - `points[]`: number[]　（盤中自繪走勢用，至少 1 點）
  - `market_state`: str　·　`asof`: str　·　`tz`: str

### data/market.json　（生產者：build/fetch_market_data.py）
- `closing_date`: str
- `indices[]`: `name, name_zh, close, daily_pct, mtd_pct, ytd_pct, closing_date`
- 另含 `bonds, fx, commodities, bond_etfs, rate_outlook, fedwatch, summary`

### data/premarket.json　（生產者：build/fetch_premarket.py）
- `generated_at`: str
- `indicators[]`: `label`(str), `price`(number|null), `pct`(number|null)
- `analysis`: str|object　（盤前分析；明確日期、全列點，見 morning-board-premarket-format 記憶）

### data/meta.json
- `built_at`: str　·　`today`: str (YYYY-MM-DD)　·　`sources_status`: object

## 新增檔時

1. 在本檔加一段合約（top keys + 每筆欄位型別）。
2. 在 `build/validate_contract.py` 的 `CONTRACT` dict 加對應規則。
3. 跑 `python build/validate_contract.py`，綠燈才 push。
