const CACHE_NAME = 'prologix-gps-v1';
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first: does not intercept API requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Pass cross-origin requests (e.g. API calls to Railway) directly to the network
  if (url.hostname !== self.location.hostname) return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
