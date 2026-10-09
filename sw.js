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

// Install Event - Caches essential core assets immediately
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

// Fetch Event - Intercepts requests with custom bypass rules for Supabase
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // 1. CRITICAL: Completely skip intercepting Supabase API requests, 
  // auth flows, and media storage streaming bucket links.
  if (
    url.includes('supabase.co') || 
    url.includes('/rest/v1/') || 
    url.includes('/auth/v1/') || 
    url.includes('/storage/v1/object/public/') ||
    url.includes('googleapis.com')
  ) {
    return; // Allow network to handle directly without Service Worker interference
  }

  // 2. Only intercept standard GET requests for local app shell assets
  if (event.request.method !== 'GET') {
    return;
  }

  // 3. Network-First, fallback to Cache strategy for standard application files
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If online and fetch succeeds, clone it and update the local app shell cache
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if the user loses connection or drops offline
        return caches.match(event.request);
      })
  );
});
