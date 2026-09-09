const CACHE_NAME = 'gebouwenroute-v1';

// Bestanden die direct gecacht moeten worden bij installatie (App Shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
  // Voeg hier eventuele offline kaartbestanden of afbeeldingen toe
];

// 1. Installatie: Cache de essentiële bestanden
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Cachen van app shell');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activatie: Oude caches opruimen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Oude cache verwijderen:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch: Afhandelen van netwerkverzoeken met een Cache-First strategie
self.addEventListener('fetch', (event) => {
  // Sla niet-GET verzoeken over
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Als het bestand in de cache zit, geef het direct terug
      if (cachedResponse) {
        return cachedResponse;
      }

      // Zo niet, haal het op via het netwerk en sla het op in de cache
      return fetch(event.request).then((networkResponse) => {
        // Controleer op een geldige response
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Eventueel een offline-fallback tonen als het netwerk faalt
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});