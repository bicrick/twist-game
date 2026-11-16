// Offline support. Pages (navigations) are NETWORK-FIRST so a redeploy shows up on the very next load (cache is only the
// offline fallback); hashed assets are cache-first (their names change when their content does). Bump CACHE to reset.
const CACHE = 'twist-v4';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const req = e.request, u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== location.origin) return;
  // Unhashed OST beds: leave them off the SW cache so a new deploy isn't stuck with stale files.
  if (u.pathname.includes('/music/')) return;
  const put = (c, key, r) => { if (r.ok && !r.redirected) c.put(key, r.clone()).catch(() => {}); };
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => put(c, './', copy)).catch(() => {}); return r; })
      .catch(() => caches.match('./').then(r => r || caches.match(req))));
    return;
  }
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(req); if (hit) return hit;
    const r = await fetch(req); put(c, req, r); return r;
  }).catch(() => fetch(req)));
});
