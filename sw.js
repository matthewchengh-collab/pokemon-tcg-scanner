// Service worker: offline support without serving stale app code.
// - App shell / navigation + API JSON: network-first (fresh when online, cached when offline)
// - Card images: cache-first (they never change)
const CACHE = 'ptcg-cache-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function isImage(url) {
  return url.hostname.includes('assets.tcgdex.net') ||
         (url.hostname.includes('pokemontcg.io') && /\.(png|jpe?g|webp)$/i.test(url.pathname)) ||
         /\.(png|jpe?g|webp|svg)$/i.test(url.pathname);
}

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Cache-first for immutable images
  if (isImage(url)) {
    e.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(e.request).then(hit =>
          hit || fetch(e.request).then(res => { if (res.ok) cache.put(e.request, res.clone()); return res; })
                       .catch(() => hit)
        )
      )
    );
    return;
  }

  // Network-first for everything else (HTML, API JSON) — fall back to cache offline
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) { const c = res.clone(); caches.open(CACHE).then(cache => cache.put(e.request, c)); }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
