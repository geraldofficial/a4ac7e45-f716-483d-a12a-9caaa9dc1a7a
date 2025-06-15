
const CACHE_NAME = 'flickpick-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache.filter(url => {
          // Only cache HTTP/HTTPS URLs
          return url.startsWith('/') || url.startsWith('http');
        }));
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle HTTP/HTTPS requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch((error) => {
        console.error('Fetch failed:', error);
        return new Response('Network error', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' },
        });
      })
  );
});
