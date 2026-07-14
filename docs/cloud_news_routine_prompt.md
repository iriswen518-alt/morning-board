每日財經新聞（雲端版）：抓取 → 產 md → parse_news.py → news.json → push

你在 iriswen518-alt/morning-board repo 的 checkout 裡執行。請執行以下工作（**繁體中文思考、不要問任何問題、直接做到底**）：

## 0. ⚠️ 輸出規則（最優先，違反即為嚴重錯誤）

這份新聞日報是**給讀者看的最終成品**，會直接呈現在「理財小幫手」PWA 上。**嚴禁**在產出的 .md 任何位置（TL;DR、區塊說明、區塊內、frontmatter、頁尾）出現任何**內部運作 / 除錯 / 資料流程 / 工具狀態**的文字。明確禁止字眼與概念包括但不限於：

- 「彙整提醒」「預抓」「管線失效」「資料源修復」「重跑」「校核」「即時搜尋重建」
- 「pre-fetch」「fallback」「WebSearch / WebFetch」「爬蟲被封鎖 / blocked」「crawler」「pipeline」「本期改以…重建」「建議…後重跑」
- 任何說明「這次用哪條抓取路徑」「哪個來源失敗」「資料怎麼來的」的句子

抓資料遇到困難就自行重試/換路徑，**過程不要寫進報告**。**唯一允許的例外**：若當日資料確實不足，只能用**一句讀者導向、不含任何技術原因**的中性提醒，例如「部分國際新聞為近期（非當日）內容」。報告（含 TL;DR）開頭直接進入新聞內容。

## 1. 決定日期

- **輸出日 = 台北時間的今天**：用 `TZ=Asia/Taipei date +%Y-%m-%d` 取得（雲端主機是 UTC，**不可**用未帶 TZ 的 date）。檔名 YYYYMMDD 一律用輸出日。
- 新聞抓取範圍：**當日**（近 24 小時內發布）。
- 若週末跑，抓前一個交易日收盤後至今的要聞（經濟數據/政策仍可能發布）。

## 2. 抓取新聞（WebFetch / WebSearch）

用 WebFetch / WebSearch 抓下列來源的當日新聞列表，再視需要點進個別文章：

- 經濟日報要聞：`https://money.udn.com/money/cate/10846`
- 工商時報財經：`https://www.ctee.com.tw/category/%E8%B2%A1%E7%B6%93`
- 鉅亨網頭條：`https://news.cnyes.com/news/cat/headline`
- 鉅亨網 API（較穩，優先試）：`https://api.cnyes.com/media/api/v1/newslist/category/headline?limit=25`（需帶 Origin: https://www.cnyes.com）
- 金管會新聞稿：`https://www.fsc.gov.tw/ch/home.jsp?id=96&parentpath=0,2`

**國際外電（第 8 類專用）**：用 WebSearch 即時抓當日國際財經新聞，查詢帶當日日期與 `today` / `latest` 等關鍵字（例如 `CNBC stock market today {YYYY-MM-DD}`、`Fed / S&P 500 / market news {Month DD, YYYY}`），優先取 CNBC / WSJ / MarketWatch / Reuters / Bloomberg。**每則務必確認文章實際發布日期在近 24~48 小時內，並記下真實文章 URL**（不是首頁/live-updates 通用頁）。抓不到就依 §3 第 8 類的「無資料處理」辦理，**不得改用記憶補洞**。

## 3. 挑選與分類

挑 **22~30 則**真正重要的新聞，依以下主題分類。**產業/金融/財富管理/稅務四類為必備**，每類至少 2 則；若當日實在沒有就標註「— 本日無重大新聞 —」：

1. **股市行情 / Taiwan Equities**：台股大盤、個股重大消息、法人動向、IPO（**禁止使用國旗 emoji**，分類標題只用文字）
2. **🏭 產業動態 / Industry**：半導體/AI/電子/傳產/生技重大新聞、併購、財報、重大投資
3. **🏦 金融業 / Financial Sector**：銀行/保險/證券/信託/金控，金管會、銀行局、保險局政策與裁罰（**通用金融政策面**；客戶端/商品端的財管新聞放第 4 類）
4. **💎 Wealth Management / 財富管理**：高資產客戶、家族信託、私人銀行、財富管理 2.0、結構型商品、海外債/境外債、基金、ETF、保險商品、信託商品、AUM、財管手續費、競業財管動態、傳承規劃實務
5. **💰 稅務法規 / Tax & Regulations**：財政部/國稅局、所得稅、遺贈稅、房地合一、最低稅負、CRS、境外所得、信託課稅、CFC、PEM、海外金融帳戶申報
6. **📜 總經政策 / Macro & Policy**：央行/Fed、CPI/GDP/利率、匯率政策、兩岸、能源政策
7. **🌏 國際財經 / Global Markets**：美股、歐股、原物料、地緣政治、國際財經大事（**台灣媒體所報導的國際新聞**放這類）

### 第 8 類：International / 國際（一手外電，獨立成區）

WSJ / CNBC / MarketWatch / Reuters / Bloomberg 等國際財經一手外電，**全部歸入此區**，與上述 1~7 類分開、不互相混入。挑 **6~10 則**當日最重要者。

> **⚠️ 國際外電時效與防杜撰（最重要，違反即為嚴重錯誤）**
> 1. **嚴禁憑記憶或訓練知識生出國際新聞。** 所有國際新聞**只能來自當次實際搜尋/抓取到、且能確認近 24~48 小時內發布的文章**。
> 2. **每則必須附真實且可驗證的文章 URL**（指向該篇報導本身），**嚴禁捏造、猜測或重複套用通用頁的 URL**。無法取得真實文章 URL 的那一則就不要放。
> 3. **每則標題後標註該則新聞的實際日期**（格式 `(YYYY-MM-DD)`）。
> 4. **若即時搜尋抓不到可確認當日的國際外電**：此區**只輸出一行**中性說明（不得含任何技術原因）：`> — 本日暫無可確認的當日國際外電。 / No same-day international wires confirmed today.`。**寧可留此說明，也絕不可用舊聞或記憶補滿。**

- 這些來源多只有標題＋短摘要（付費牆/反爬）。中文摘要 **60~120 字**，**只依實際抓到的內容改寫翻譯**，**嚴禁杜撰**沒提到的數字、引述或細節；英文摘要 40~80 words。每則標來源媒體名與原始 URL。

每則新聞格式（**英文在前、中文在後**；英文標題若來源為中文可自行翻譯；**不要加「EN:」「ZH:」標籤**）：

```
- **[English headline]** — 120~160 words English summary covering "what happened / why it matters / who it impacts".
  **[中文標題]** — 150~220 字中文摘要，點出「發生什麼、為什麼重要、影響誰」，並補足背景脈絡。
  - 來源 / Source：[媒體名稱](URL)
```

**詳細度一致**：每一則中文摘要長度落在 150~220 字、結構一致（事件→原因/影響→後續觀察）。（第 8 類例外：60~120 字。）

TL;DR 雙語 bullet 格式（同一點兩行，英文先、中文後，**不要加標籤**）：

```
- English one-sentence summary of the theme.
  中文一句話主題摘要。
```

**規則**：同一事件多家報導只保留最完整的一則；英中摘要必須對應同一則新聞；每則務必附原始 URL；**禁止 `**EN:**` / `**ZH:**` 標籤**。

## 4. 產出 Markdown

**儲存路徑（repo 相對路徑）**：`data/news_md/市場日誌_{YYYYMMDD}_每日新聞.md`

**務必覆寫**：若當日檔案已存在，一律依本規格重新產出並完整覆寫。每次執行都必須確保最終檔含全部八個**區塊標題**（含第 8 類 International / 國際）。任何一區當日若無真實、可驗證、夠新的新聞，就標示「— 本日無重大新聞 —」。**留空說明永遠優於用舊聞或憑記憶杜撰填滿。**

### Frontmatter

```yaml
---
date: {輸出日 YYYY-MM-DD}
type: 市場日誌
market: 每日新聞
lang: en+zh
sources:
  - 經濟日報
  - 工商日報
  - 鉅亨網
  - 金管會
  - WSJ
  - CNBC
  - MarketWatch
tags:
  - 市場日誌
  - 每日新聞
  - 財經彙整
  - bilingual
---
```

### 版型

```markdown
## 📰 Daily Financial News / 每日財經新聞 · {YYYY-MM-DD}

> Sources / 來源：經濟日報 / 工商日報 / 鉅亨網 / 金管會 / WSJ / CNBC / MarketWatch
> Generated / 產出時間：{台北時間 YYYY-MM-DD HH:MM}

### 🎯 TL;DR / 今日摘要

3~5 bullets，每點兩行：英文一句在前、中文一句在後。

### Taiwan Equities / 股市行情

### 🏭 Industry / 產業動態

### 🏦 Financial Sector / 金融業

### 💎 Wealth Management / 財富管理

### 💰 Tax & Regulations / 稅務法規

### 📜 Macro & Policy / 總經政策

### 🌏 Global Markets / 國際財經

### 🗞 International / 國際

{**section 標題務必照寫成 `International / 國際`，不可改字**，下游 PWA 靠它歸入「國際」分頁}

### 🔗 Related Notes / 相關筆記

- [[市場日誌_{前1日}_台股盤後]]
- [[市場日誌_{前1日}_每日新聞]]

---

> *Sources 資料來源：{所有實際用到的 URL markdown 連結}*
```

## 5. 解析成 news.json 並 push

md 寫好後，在 repo 根目錄執行：

1. `python3 build/parse_news.py "data/news_md/市場日誌_{YYYYMMDD}_每日新聞.md" data/news.json`
2. 驗證：`python3 -c "import json; d=json.load(open('data/news.json')); assert d['news_date']=='{YYYY-MM-DD}', d.get('news_date'); print('sections:', len(d.get('sections',[])))"` — news_date 必須等於輸出日；不符就回頭檢查 md frontmatter 的 date 再重跑 parse。
3. `git add data/news_md/市場日誌_{YYYYMMDD}_每日新聞.md data/news.json`（**只 add 這兩個檔**，不要 `git add -A`）
4. `git commit -m "data: daily news {YYYY-MM-DD} (cloud routine)"`
5. `git pull --rebase origin main` 之後 `git push origin main`。**push 被拒（quotes workflow 每 20 分鐘也在 push）就重新 pull --rebase 再 push，最多重試 3 次。**

## 6. 完成條件

- data/news.json 的 news_date == 台北今日，且已成功 push。
- 過程中任何來源抓不到就換路徑重試，**不要**因單一來源失敗而放棄整份報告。
