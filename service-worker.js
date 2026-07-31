// Network-first with cache fallback (v11)
// 永遠優先網路（拿最新），失敗時用上次成功的快取。
// 兼顧「總是新」+「網路 blip 時不爆」。
// v8（2026-05-27）：新增重要新聞 stale banner（news_date != today 時顯示警示）。
// v9（2026-05-29）：台股籌碼日期改 T86/MI_MARGN 各自獨立解析，清掉舊版鎖日的快取。
// v10（2026-06-04）：修「網路瞬斷整頁空白」— app.js 抓 data/*.json 時帶 ?t=<時間戳> 破壞快取，
//   舊版 caches.match(req) 連 ?t= 一起比對，永遠對不上上次存的那筆，於是退路失效、整頁空。
//   改成 data/*.json 用「去掉 ?t= 的固定 key」存取，瞬斷時才能退回上次成功抓到的資料
//   （真正做到「顯示快取資料」），順帶解決舊版每抓一次就多存一筆、快取無限長大的問題。
// v11（2026-06-04）：市值欄取整數顯示（億整數、兆保留 1 位小數）＋不換行（.mcap nowrap，含手機）。
// v12（2026-06-04）：手機數據表（指數／股票／排行）整列不換行，靠水平捲動，避免表頭與日期被折成兩行。
// v13（2026-06-04）：海外債改為 indices 表格（白底表頭、整列不換行），並把基金比較／持股表頭統一白底；
//   bump 快取版本強制清掉舊的 cmp-table（青色表頭＋換行）快取。
// v14（2026-06-04）：海外債表格全欄位強制單行不換行（obond-table，含價格欄日期子元素），任何螢幕寬度皆不折行。
// v15（2026-06-04）：基金表格凍結名稱欄改為可換行，完整顯示基金商品全名。
// v16（2026-06-04）：股票價格欄一律不顯示 $ 符號（含美股），與台股一致。
// v17（2026-06-05）：配色還原回原本的青藍主題（撤掉 06-05 早上誤併入的暖色改版），bump 強制清掉暖色 CSS 快取。
// v18（2026-06-05）：海外債新增「換券試算」子分頁＋全清單資料 overseas_bonds_all.json。
// v19（2026-06-05）：標頭加「僅測試使用」警語標示。
// v20（2026-06-05）：換券試算選券卡片加走勢示意圖（依週/月/季報酬推估）。
// v21（2026-06-05）：走勢圖滑過/點選顯示各時點價格＋換券比較加兩檔重訂基準走勢對照。
// v22（2026-06-05）：雙向利率情境加「0%（利率不變）」列。
// v23（2026-06-05）：移除信評欄位（資料源無評等）。
// v24（2026-06-05）：精選海外債清單也移除信評欄。
// v25（2026-06-08）：股市新增「費城半導體」(^SOX) 指數列；商品期貨名稱加 Yahoo 連結＋即時行情。
// v26（2026-06-08）：費城半導體名稱改掛 MoneyDJ 走勢圖（AI000140），不再退回 Yahoo。
// v27（2026-06-10）：卡片盒清單檢視隱藏階層式編號（zk_id），符合卡片筆記精神；資料層 zk_id 保留供排序。
// v28（2026-06-11）：上次更新時間改取 max(本機 meta.built_at, 雲端 quotes_built_at)，Mac 關著時雲端報價刷新也會推進「上次更新」，避免標籤看起來卡住。
// v41（2026-06-26）：理財聊聊新增交易時間查詢（台指期/台股/美股），bump 快取版本讓 app.js 更新生效。
// v42（2026-06-26）：即時行情詳情頁「資料時間」改為同時顯示當地時間＋台灣時間。
// v43（2026-06-30）：理財聊聊知識庫大幅擴充（28→112 則，含海外債/傳承/結構商品/合規/總經專業深度），
//   補強換問法關鍵字命中，並把延伸參考深連結到小學堂對應的整門課程。
// v44（2026-06-30）：補上原有 28 則舊條目的延伸參考，全部接上小學堂內部課程深連結（先前只有外部連結）。
// v45（2026-07-02）：新聞排程提前到 05:00 起跑，過期橫幅文案改成「07:00 前更新完成」，bump 強制更新。
// v47（2026-07-11）：強制清掉手機上卡住的舊 app.js 快取（顯示 07-07 舊新聞、3 字「金融業」舊版面），
//   讓 PWA 拉回最新 news.json（07-11）＋四字區塊名（金融族群／國際要聞）與現行分類版面。
// v48（2026-07-11）：再 bump 一次觸發 SW 位元變更，確保裝置偵測到新版並立即接管（skipWaiting+claim），
//   讓一次關閉重開即生效、免等第二次。
// v49（2026-07-13）：手機又顯示舊新聞——裝置仍卡在改版前的 cache-first 舊 SW。
//   資料層本已 fresh（news.json 2026-07-13、fetch 帶 ?t=、SW 網路優先 no-store），純屬舊 SW 未升級。
//   再 bump 一次強制 skipWaiting+claim 接管，讓裝置關閉重開即拉回最新 news.json。
// v50（2026-07-18）：手機字級放大改用固定 px 覆寫（text-size-adjust 在 iOS PWA 會自行失效），
//   bump 強制裝置更新 style.css，避免卡舊快取「自行恢復原狀」。
// v51（2026-07-19）：聰明預設分頁——記住上次分頁（60 分內還原），否則盤前→盤勢、盤中→即時、晚間→新聞。
// v55（2026-07-21）：根治「每天早上看到昨天新聞」——iOS PWA 從背景喚醒只還原舊畫面不重抓資料，
//   app.js 回前景改為資料過期（>10 分或 news_date 非今天）就整包 refreshData()，不再只檢查改版。
// v57（2026-07-22）：超越ETF 表格下方新增資料日期註記（績效截至＝基金淨值日／ETF 收盤日，取自 beatetf.json stat_date）。
const CACHE = "morning-board-v60";

self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(k => k !== CACHE).map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

// 自家 data/*.json 的快取 key：去掉 ?t= 破壞快取參數，固定成同一個 key。
// 這樣每次抓成功都覆蓋同一筆（不會無限長大），網路失敗時也能比對到上次那筆。
// 其他請求（app shell、跨網域 API）維持原樣，避免誤把帶參數的 API 回應張冠李戴。
function cacheKeyFor(request) {
  const url = new URL(request.url);
  if (url.origin === self.location.origin
      && url.pathname.includes("/data/")
      && url.pathname.endsWith(".json")) {
    return new Request(url.origin + url.pathname); // 不含 query
  }
  return request;
}

self.addEventListener("fetch", e => {
  const req = e.request;
  const key = cacheKeyFor(req);
  e.respondWith((async () => {
    try {
      const fresh = await fetch(req, { cache: "no-store" });
      if (fresh && fresh.ok) {
        const clone = fresh.clone();
        caches.open(CACHE).then(c => c.put(key, clone)).catch(() => {});
      }
      return fresh;
    } catch (err) {
      const cached = await caches.match(key);
      if (cached) return cached;
      return new Response("offline", { status: 503 });
    }
  })());
});
