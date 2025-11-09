const CACHE_NAME = 'ss-iptv-amorim-v1';
const ASSETS = [
  '.',
  'index.html',
  'manifest.json',
  'assets/logo.png',
  'assets/icon-192.png',
  'assets/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  event.respondWith(
    caches.match(req).then(resp => resp || fetch(req).then(fetchResp => {
      return caches.open(CACHE_NAME).then(cache => {
        try { cache.put(req, fetchResp.clone()); } catch(e) {}
        return fetchResp;
      })
    })).catch(()=>caches.match('index.html'))
  );
});