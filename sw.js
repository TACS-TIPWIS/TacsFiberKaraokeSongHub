const CACHE_NAME = 'karaokehub-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://apis.google.com/js/api.js',
  'https://accounts.google.com/gsi/client',
  'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.39/Tone.js',
  'https://cdn.jsdelivr.net/npm/midiconvert@0.4.4/build/MidiConvert.min.js'
];

// Install Event - Caches essential assets immediately
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - Instantly purges outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Network-First strategy for dynamic updates
self.addEventListener('fetch', (event) => {
  // Skip intercepting Google Drive API or external media streams
  if (event.request.url.includes('googleapis.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If online and fetch succeeds, clone it and update the cache dynamically
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if the user is offline
        return caches.match(event.request);
      })
  );
});
