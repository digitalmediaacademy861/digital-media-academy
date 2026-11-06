// Digital Media Academy service worker.
// Network first, so visitors always get the latest page. The cache is only a fallback for when there is no internet.
var CACHE = 'dma-v6';
var FILES = ['./', 'index.html', 'menu.html', 'courses.html', 'scholarships.html', 'about.html', 'founders.html', 'login.html',
  'dma.css', 'dma.js', 'gate.js', 'pay.js', 'pay-config.js', 'auth.js', 'firebase-config.js', 'account.html', 'certificates.html', 'logo-mark.png', 'flyer.jpg', 'founder.jpg', 'daniel.jpg', 'icon-192.png', 'icon-512.png'];

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
  if (url.origin !== location.origin) return;   // leave Tally, fonts, WhatsApp and sign-in alone
  if (/(account|login|certificates)\.html$/.test(url.pathname)) return;   // never keep private pages offline
  e.respondWith(
    fetch(req).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
      return res;
