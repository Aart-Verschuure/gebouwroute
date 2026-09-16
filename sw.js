const CACHE_NAME = 'gebouwroute-v1';

// Vul hier alle bestanden in die lokaal opgeslagen moeten worden
const FILES_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './internet.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
  // Voeg hier eventueel het pad naar je vereenvoudigde plattegronden toe, bijv:
  // './Plattegronden/alleen_muren_en_lokalen/plattegrond1.png'
];

// 1. Installeren van de Service Worker en bestanden opslaan in cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Bestanden worden gecached...');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Oude caches opruimen bij updates
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Oude cache verwijderen:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Verzoeken afvangen: laad uit cache als er geen netwerk is
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Geef het bestand uit de cache als het bestaat, anders ophalen via het netwerk
      return cachedResponse || fetch(event.request);
    })
  );
});