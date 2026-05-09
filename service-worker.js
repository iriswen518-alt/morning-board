// Kill-switch SW v3 — wipe all caches, unregister self, force reload all clients.
// Once everyone has run this, replace with a real SW again.
self.addEventListener("install", e => {
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: "window" });
    for (const c of clients) {
      try { c.navigate(c.url); } catch {}
    }
  })());
});

self.addEventListener("fetch", e => {
  // Always go to network, never cache.
  e.respondWith(fetch(e.request).catch(() => new Response("offline", { status: 503 })));
});
