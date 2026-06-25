# 即時行情分頁 設計

日期：2026-06-25

## 目標
在理財小幫手新增「即時行情」分頁，以迷你圖卡網格顯示全球主要指數的**即時**走勢圖。

## 背景與限制
理財小幫手是 GitHub Pages 靜態網站，資料由排程 Python 腳本抓取後存成 JSON 提交。沒有即時後端。
因此「即時」走勢圖採用 **TradingView 免費 widget（iframe）嵌入**，圖在使用者瀏覽器自行即時更新，無需後端或新排程。

## 範圍

### 1. 分頁
- 新增 `data-tab="live"`，名稱「即時行情」。
- 加入上方 `main-nav` 與底部 `tabbar` 的「更多」選單可達。
- 圖示沿用線圖風格 SVG。

### 2. 資料來源
- 每個指數嵌入一個 TradingView mini-symbol-overview widget。
- 真・即時：widget 在瀏覽器自更新，網站不抓資料、不需後端。

### 3. 版面
- 迷你圖卡網格：每張卡 = 指數名稱 + 即時現價 + 即時走勢線（widget 內含）。
- 響應式：手機 1 欄、平板 2 欄、桌面 3 欄；沿用現有 1200px 內容寬與卡片樣式。
- 指數順序對齊「全球市場」分頁的 `market.json` indices：
  S&P 500、Nasdaq、Dow、PHLX 費半、Euro Stoxx 50、DAX、FTSE 100、CAC 40、
  Nikkei 225、台股加權、櫃買、台指期、KOSPI、恆生、上證、滬深300、Nifty 50、ASX 200。

### 4. TradingView 代碼對應（取捨）
- TradingView 用自家 symbol（exchange:ticker），與現有 Yahoo 代碼不同，需建一份對應表。
- 冷門指數（上證、滬深、台指期、KOSPI 等）代碼於實作時逐一在瀏覽器驗證。
- 無法載入者：該卡降級為「點此看即時行情」外部連結（沿用既有 indexQuoteUrl / TradingView 頁）。

### 5. 合規
- 沿用既有測試／免責語。
- 圖卡區下方加一行「行情由 TradingView 提供，僅供參考」。

## 不做（YAGNI）
- 不加自選清單。
- 不加新的 Python 抓取腳本。
- 不改現有「全球市場」分頁。

## 驗證
- 本機開啟，逐一確認每個 widget 是否正確顯示指數與走勢；抓不到的確認降級連結生效。
