// Digital Media Academy service worker.
// Network first, so visitors always get the latest page (the class date and countdown change).
// The cache is only a fallback for when there is no internet.
var CACHE = 'dma-v1';
var FILES = ['./', 'index.html', 'logo.png', 'flyer.jpg', 'founder.jpg', 'daniel.jpg', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // Cache each file separately so one missing file doesn't break the install
      return Promise.all(FILES.map(function (f) { return c.add(f).catch(function () {}); }));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;   // leave Tally, fonts and WhatsApp alone
  e.respondWith(
    fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
      return res;
    }).catch(function () {
      return caches.match(req).then(function (hit) { return hit || caches.match('index.html'); });
    })
  );
});
