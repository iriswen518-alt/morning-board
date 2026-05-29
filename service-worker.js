// Network-first with cache fallback (v9)
// 永遠優先網路（拿最新），失敗時用上次成功的快取。
// 兼顧「總是新」+「網路 blip 時不爆」。
// v8（2026-05-27）：新增重要新聞 stale banner（news_date != today 時顯示警示）。
// v9（2026-05-29）：台股籌碼日期改 T86/MI_MARGN 各自獨立解析，清掉舊版鎖日的快取。
const CACHE = "morning-board-v9";

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

self.addEventListener("fetch", e => {
  const req = e.request;
  e.respondWith((async () => {
    try {
      const fresh = await fetch(req, { cache: "no-store" });
      if (fresh && fresh.ok) {
        const clone = fresh.clone();
        caches.open(CACHE).then(c => c.put(req, clone)).catch(() => {});
      }
      return fresh;
    } catch (err) {
      const cached = await caches.match(req);
      if (cached) return cached;
      return new Response("offline", { status: 503 });
    }
  })());
});
