// Network-only service worker v4
// 每次請求一律從網路抓，不快取任何資源。確保 PWA 開啟即拿最新版。
const CACHE_PREFIX = "morning-board-";

self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    // 清掉舊版的任何快取
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(k => k.startsWith(CACHE_PREFIX)).map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

// Network-only：永不從快取讀，永遠 fetch 新版
self.addEventListener("fetch", e => {
  e.respondWith(
    fetch(e.request, { cache: "no-store" }).catch(() => {
      // 離線時回 503，不退回快取（因為根本沒快取）
      return new Response("offline", { status: 503 });
    })
  );
});
