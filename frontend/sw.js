const CACHE = 'kidapp-v1';
const toCache = [
  '/kidapp/frontend/index.html',
  '/kidapp/frontend/css/styles.css',
  '/kidapp/frontend/js/app.js'
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(toCache))
  );
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(resp => resp || fetch(evt.request))
  );
});
