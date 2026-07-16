每日財經新聞（雲端版 v2）：分階段產出＋檢查點 push，先求有再求好

你在 iriswen518-alt/morning-board repo 的 checkout 裡執行。（**繁體中文思考、不要問任何問題、直接做到底**）

## ⚠️ 為什麼是 v2（執行策略，最優先遵守）

雲端 session 執行時間有限。v1 要求一次寫完 22~30 則長摘要，多次因超時中斷、**什麼都沒存下來**，PWA 整天開天窗。v2 鐵則：

1. **每完成一個階段就立刻 commit + push**。寧可先推出半份今日新聞，也絕不可整批白跑。
2. **時間預算**：階段 0 心跳 ≤2 分鐘、階段 1 骨架 ≤3 分鐘、階段 2 前半 ≤12 分鐘、階段 3 後半 ≤12 分鐘。任一階段快超時就縮減該階段內容、直接進 push 步驟。
3. 抓取來源逾時或被擋，**立刻換下一個來源**，不糾結重試同一個。

## 階段 0：心跳 push（開場先做，測試 push 權限）

```
TODAY=$(TZ=Asia/Taipei date +%Y-%m-%d)
echo "cloud news run started $(TZ=Asia/Taipei date '+%Y-%m-%d %H:%M')" > data/.cloud_heartbeat
git add data/.cloud_heartbeat
git commit -m "chore: news heartbeat $TODAY"
git pull --rebase origin main && git push origin main
```

push 被拒就重新 `pull --rebase` 再 push，最多 3 次。**若心跳 push 最終失敗：不要再做任何抓取，直接在最終回覆完整貼出 git 錯誤訊息後結束**（這是唯一允許提前放棄的情況）。

## 階段 1：骨架

立刻寫出**完整可解析**的 md 骨架到 `data/news_md/市場日誌_{YYYYMMDD}_每日新聞.md`（YYYYMMDD＝輸出日；檔案已存在則整份覆寫）：

- frontmatter（見下方格式，date＝輸出日）
- 大標題與來源列
- TL;DR 區：先放 3 點中性摘要（之後會改寫）
- **全部八個區塊標題**，每區先放一行 `- — 本日無重大新聞 —`
- Related Notes 與頁尾

跑 `python3 build/parse_news.py "data/news_md/市場日誌_{YYYYMMDD}_每日新聞.md" data/news.json` 確認骨架可解析（sections 應為 8）。**骨架先不 push**（避免讀者看到空報告），直接進階段 2。

## 階段 2：前四區＋檢查點 push

### 抓取（總時間上限 8 分鐘）

- 鉅亨網 API（最穩，優先）：`https://api.cnyes.com/media/api/v1/newslist/category/headline?limit=25`（帶 Origin: https://www.cnyes.com）
- 經濟日報要聞：`https://money.udn.com/money/cate/10846`
- 工商時報財經：`https://www.ctee.com.tw/category/%E8%B2%A1%E7%B6%93`
- 金管會新聞稿：`https://www.fsc.gov.tw/ch/home.jsp?id=96&parentpath=0,2`

新聞抓取範圍：**當日**（近 24 小時）。週末跑則抓前一交易日收盤後至今的要聞。

### 填入前四區

1. **股市行情 / Taiwan Equities**（禁國旗 emoji）
2. **🏭 產業動態 / Industry**
3. **🏦 金融業 / Financial Sector**（通用金融政策面；商品/客戶端放第 4 類）
4. **💎 Wealth Management / 財富管理**（高資產、信託、私銀、結構型商品、海外債、基金、ETF、保險、傳承）

每區**正好 2 則**（當日真的沒有就保留「— 本日無重大新聞 —」）。摘要精簡版：**中文 80~140 字、英文 50~90 words**，結構「事件→影響」。同步把 TL;DR 改成當前內容的 3 點。

### 檢查點 push（此階段的重點，不可跳過）

```
python3 build/parse_news.py "data/news_md/市場日誌_{YYYYMMDD}_每日新聞.md" data/news.json
python3 -c "import json; d=json.load(open('data/news.json')); assert d['news_date']=='{YYYY-MM-DD}', d.get('news_date')"
git add data/news_md/市場日誌_{YYYYMMDD}_每日新聞.md data/news.json   # 只 add 這兩檔
git commit -m "data: daily news {YYYY-MM-DD} (cloud, part 1/2)"
git pull --rebase origin main && git push origin main   # 被拒重試 3 次
```

**push 成功後**才進階段 3。此時 PWA 已有半份今日新聞，之後就算超時也不會開天窗。

## 階段 3：後四區＋最終 push

5. **💰 稅務法規 / Tax & Regulations** — 2 則
6. **📜 總經政策 / Macro & Policy** — 2 則
7. **🌏 國際財經 / Global Markets**（台灣媒體報導的國際新聞）— 2 則
8. **🗞 International / 國際**（一手外電）— **4 則**，規則見下方「International 防杜撰」

TL;DR 改寫成最終 3~5 點；補齊頁尾 Sources。然後照檢查點相同流程 parse → 驗證 → 只 add 兩檔 → commit `data: daily news {YYYY-MM-DD} (cloud, final)` → pull --rebase → push（重試 3 次）。

## 完成條件

- data/news.json 的 news_date == 台北今日，且**至少完成一次**內容 push（part 1/2 或 final）。
- 最終回覆簡短回報：各階段是否完成、push 幾次、若有失敗貼出錯誤訊息。

---

## 內容規則（沿用 v1，違反即為嚴重錯誤）

### 輸出規則

這份日報是**給讀者看的最終成品**，直接呈現在「理財小幫手」PWA。**嚴禁**在 md 任何位置出現內部運作/除錯/資料流程/工具狀態的文字：「彙整提醒」「預抓」「管線失效」「重跑」「pre-fetch」「fallback」「WebSearch/WebFetch」「blocked」「crawler」「pipeline」等一律禁止。抓資料遇到困難自行換路徑，過程不寫進報告。唯一例外：資料不足時可用一句讀者導向中性提醒（例：「部分國際新聞為近期（非當日）內容」）。

### 日期

**輸出日＝台北時間今天**：`TZ=Asia/Taipei date +%Y-%m-%d`（雲端主機是 UTC，不可用未帶 TZ 的 date）。

### International 防杜撰（第 8 類）

1. **嚴禁憑記憶或訓練知識生出國際新聞**；只能用當次 WebSearch 實際抓到、可確認近 24~48 小時內發布的文章。搜尋帶當日日期與 today/latest 關鍵字，優先 CNBC / WSJ / MarketWatch / Reuters / Bloomberg。
2. 每則必附**真實可驗證的文章 URL**（指向該篇報導本身，非首頁/live-updates 通用頁）；拿不到真實 URL 的那則不要放。
3. 每則標題後標註實際日期 `(YYYY-MM-DD)`。
4. 抓不到當日外電：此區只輸出一行 `> — 本日暫無可確認的當日國際外電。 / No same-day international wires confirmed today.`。**寧缺勿假。**
5. 此區摘要：中文 60~120 字、英文 40~80 words，只依實際抓到的內容改寫，嚴禁杜撰數字/引述。

### 每則新聞格式（英文在前、中文在後，不加 EN:/ZH: 標籤）

```
- **[English headline]** — 50~90 words English summary (what happened / why it matters).
  **[中文標題]** — 80~140 字中文摘要（事件→影響）。
  - 來源 / Source：[媒體名稱](URL)
```

TL;DR 每點兩行：英文一句在前、中文一句在後，不加標籤。同一事件多家報導只留最完整一則；英中摘要必須對應同一則新聞。

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

### 版型（區塊標題不可改字，下游 PWA 靠標題歸類）

```markdown
## 📰 Daily Financial News / 每日財經新聞 · {YYYY-MM-DD}

> Sources / 來源：經濟日報 / 工商日報 / 鉅亨網 / 金管會 / WSJ / CNBC / MarketWatch
> Generated / 產出時間：{台北時間 YYYY-MM-DD HH:MM}

### 🎯 TL;DR / 今日摘要

### Taiwan Equities / 股市行情

### 🏭 Industry / 產業動態

### 🏦 Financial Sector / 金融業

### 💎 Wealth Management / 財富管理

### 💰 Tax & Regulations / 稅務法規

### 📜 Macro & Policy / 總經政策

### 🌏 Global Markets / 國際財經

### 🗞 International / 國際

### 🔗 Related Notes / 相關筆記

- [[市場日誌_{前1日}_台股盤後]]
- [[市場日誌_{前1日}_每日新聞]]

---

> *Sources 資料來源：{所有實際用到的 URL markdown 連結}*
```
