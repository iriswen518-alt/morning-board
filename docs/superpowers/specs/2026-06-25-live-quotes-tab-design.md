# 即時行情分頁 設計

日期：2026-06-25

## 目標
在理財小幫手新增「即時行情」分頁，以迷你圖卡網格顯示全球主要指數的盤中走勢圖。

## 背景與限制
理財小幫手是 GitHub Pages 靜態網站，無即時後端。市場數值已由雲端 GitHub Actions
（morning-board-quotes.yml）定時抓取後提交 JSON，前端讀同源 JSON 顯示。

## 方案演進（重要）
原構想為「嵌 TradingView 即時 widget」。**實測證實 TradingView 免費嵌入無法顯示主要
指數圖表**（SPX、NI225、台股 2330 等皆回「此商品僅在 TradingView 上可用」，僅美股
ETF 如 SPY 可用）。瀏覽器端直接抓 Yahoo 又被 CORS／429 擋。

故改採**自繪準即時**：伺服器端（雲端 Actions）定時抓 Yahoo intraday → 提交
`data/live_indices.json` → 前端自繪 SVG 走勢圖。顯示的是指數本人、跨時區皆正確、
風格與全站一致。更新頻率為排程節奏（準即時，非秒級）。

## 範圍

### 1. 分頁
- `data-tab="live"`，名稱「即時行情」，置於「全球市場」之後，並可由底部「更多」進入。

### 2. 資料抓取 — `fetch_live_indices.py`
- 來源：Yahoo Finance chart API（range=1d, interval=5m），與 fetch_market_data 同端點/UA。
- 17 檔指數（順序對齊 market.json）。每檔輸出：中文名、最新值、昨收、漲跌、漲跌%、
  盤中點位序列（≤80 點）、市場狀態（由 currentTradingPeriod 推算 盤中/盤前/收盤）、
  當地資料時間。
- 韌性：單檔失敗只標 ok=False（前端顯示後備連結）；全失敗（多為限流）不覆蓋舊檔、回非零碼。
- 雲端版置於 `build/fetch_live_indices.py`（輸出寫 repo/data），與既有 build/ 慣例一致。

### 3. 前端渲染
- `renderLiveSheet` 讀 `DATA.live`，迷你圖卡網格（手機 1 欄、平板 2、桌面 3）。
- 每卡：中文名 + 狀態標籤 + 最新值 + 漲跌%（紅漲綠跌）+ 自繪面積走勢圖（含昨收虛線）+ 資料時間。
- 無資料/抓取失敗 → 後備「點此看即時行情」連結（Yahoo 個股頁）。
- 整合進 init 與下拉刷新的 JSON 載入（safe load，壞一個不拖垮全頁）。

### 4. 排程 — `.github/workflows/morning-board-live.yml`
- 雲端 cron 平日每 20 分鐘跑 fetch_live_indices.py，提交 data/live_indices.json。
- 電腦關機也會更新（符合上雲方向）。GitHub 排程 best-effort，高負載會延遲。
- 頻率可調；待用戶確認後才推送啟用。

### 5. 合規
- 沿用既有測試／免責語；圖卡區下加「資料來源 Yahoo Finance，盤中定時更新；僅供參考」。

## 不做（YAGNI）
- 不加自選清單。
- 不改現有「全球市場」分頁。
- 不做秒級即時（靜態站不可行）。

## 已知限制
- 尚未開盤市場（如歐洲/印度於台北早上）顯示「盤前」+ 前一段走勢，漲跌%為前一交易日；
  狀態標籤與資料時間已揭露。
- 櫃買加權（^TWOII）Yahoo 無 intraday → 顯示後備連結。

## 驗證
- 本機 http server + Playwright：17 卡渲染、無 console error、桌機/手機版面正常。
- 真資料抽驗：美股收盤值與 market.json 一致；亞洲顯今日盤中；狀態標籤正確。
