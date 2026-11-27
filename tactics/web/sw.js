// Toy Wars offline copy. The game is one page: keep the last copy and open it straight away, online or not.
// The game itself checks version.json and fetches new versions into this cache (68-app.js).
const CACHE = 'toy-wars';
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'].map(u => new Request(u, {cache: 'reload'})))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url); if (url.origin !== location.origin || url.pathname.endsWith('version.json')) return;
  // the game's own update check asks for a fresh copy (cache: 'reload'): let it reach the network, not this cache
  if (req.cache === 'reload' || req.cache === 'no-store') return;
  const key = req.mode === 'navigate' ? './' : req;
  e.respondWith(caches.open(CACHE).then(async c => (await c.match(key)) || fetch(req).then(r => { if (r.ok) c.put(key, r.clone()); return r; })));
});
