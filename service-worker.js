const CACHE_NAME = 'memo-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.js',
  '/manifest.json'
  // 必要に応じて CSS、アイコンなども追加してください
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュが見つかれば返し、なければネットワークから取得
        return response || fetch(event.request);
      })
  );
});
