// Minimal service worker to satisfy PWA installability requirements.
// It currently uses a network-first strategy and can be extended later.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Simple pass-through fetch handler to ensure the SW has a fetch event.
self.addEventListener('fetch', (event) => {
  // Explicitly proxy to network to avoid no-op warning; extend for caching if needed.
  event.respondWith(fetch(event.request));
});

