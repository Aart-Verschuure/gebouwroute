// Verhoog dit versienummer als je bestanden aanpast, dan halen telefoons de nieuwe versie op
const CACHE_NAME = 'gebouwroute-v2';

// Gebruik './' in plaats van absolute paden met '/'
const FILES_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './internet.js',
  './manifest.json',
  './data.js',
  './route.js',
  './kaart.js',
  './gps.js',
  './stem.js',
  './editor.js',
  './app.js',
  './images/icon-192.png',
  './images/icon-512.png',
  './images/plattegrond/kelder.webp',
  './images/plattegrond/verdieping_0.webp',
  './images/plattegrond/verdieping_1.webp',
  './images/plattegrond/verdieping_2.webp',
  './images/plattegrond/verdieping_3.webp',
  './images/plattegrond/verdieping_4.webp',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Eerst uit de cache (werkt offline), anders van het netwerk
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).catch(() => {
        // Offline en niet in de cache: toon de app als het om een pagina ging
        if (event.request.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      });
    })
  );
});
