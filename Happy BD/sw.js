// sw.js - Service Worker for 紫仙生日祝福页
const VERSION = 'v1.0';
const CACHE_NAME = 'zixian-bday-' + VERSION;
const CORE_ASSETS = ['.'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(k => k.startsWith('zixian-bday-') && k !== CACHE_NAME)
      .map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;

  if (req.mode === 'navigate') {
    e.respondWith((async () => {
      try {
        const net = await fetch(req);
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, net.clone());
        return net;
      } catch {
        return (await caches.match(req)) || (await caches.match('.'));
      }
    })());
    return;
  }

  const url = new URL(req.url);

  if (req.method === 'GET' && url.origin === self.location.origin) {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      const fetching = fetch(req)
        .then(r => { cache.put(req, r.clone()); return r; })
        .catch(() => cached);
      return cached || fetching;
    })());
    return;
  }

  if (req.destination === 'image') {
    e.respondWith((async () => {
      const cache = await caches.open('img-cache');
      const cached = await cache.match(req);
      if (cached) return cached;
      const net = await fetch(req);
      cache.put(req, net.clone());
      return net;
    })());
  }
});
