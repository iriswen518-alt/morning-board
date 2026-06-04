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
const CACHE = "morning-board-v15";

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
