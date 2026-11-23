/* 離線快取：網頁本體每次先抓最新版（改版會自動更新），抓不到才用快取；其他檔案先用快取，背景更新。 */
const CACHE = "paoche-v1";
const SHELL = ["./", "index.html", "geo.js", "areas.json", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const isPage = req.mode === "navigate" || url.pathname.endsWith("/") || url.pathname.endsWith(".html");
  if (isPage){
    e.respondWith(
      fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
        .catch(() => caches.match(req).then(r => r || caches.match("index.html")))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(cached => {
      const net = fetch(req).then(res => { if (res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; }).catch(() => cached);
      return cached || net;
    })
  );
});
