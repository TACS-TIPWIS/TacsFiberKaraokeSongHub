const CACHE_NAME = 'karaokehub-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://google.com',
  'https://google.com',
  'https://cloudflare.com',
  'https://jsdelivr.net'
];

// 1. Install Event - Pre-caches all essential structural application shells
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event - Purges outdated cache structures immediately on engine updates
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

// 3. Fetch Event - Custom network interception routing optimized for Supabase API layers
self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // CRITICAL BYPASS: Let the network handle live database, authentication, and large media streams directly
  if (
    url.includes('supabase.co') || 
    url.includes('/rest/v1/') || 
    url.includes('/auth/v1/') || 
    url.includes('/storage/v1/object/public/') ||
    url.includes('googleapis.com')
  ) {
    return; // Completely exits service worker cache routing to prevent media freeze issues
  }

  // Only handle standard GET requests for the static interface wrapper
  if (event.request.method !== 'GET') {
    return;
  }

  // Network-First, Falling Back to Cache strategy for core UI components
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache successful responses dynamically
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Serve cached file if network drops entirely offline
        return caches.match(event.request);
      })
  );
});
