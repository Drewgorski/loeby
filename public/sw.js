/**
 * Offline cache. She uses this on a gym floor and on walks, so it has to work
 * with no signal.
 *
 * Strategy: cache-first for the app shell and hashed build assets (Vite
 * fingerprints them, so a cached asset is never stale), network-first for
 * navigations so a redeploy is picked up on the next online visit.
 *
 * Her data lives in IndexedDB and is never touched here — clearing this cache
 * loses nothing but the offline copy of the app itself.
 */
// Replaced at build time with the bundle's content hash, so every deploy gets a
// brand-new cache and `activate` deletes the previous one. A fixed name meant
// the offline shell kept pointing at assets that no longer exist on the server.
const VERSION = 'loeby-__BUILD_ID__';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(['./', './index.html', './manifest.webmanifest'])),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Never serve the worker itself from cache — that can strand a device on an
  // old worker forever.
  if (url.pathname.endsWith('/sw.js')) return;

  // Navigations: try the network so a new deploy lands, fall back to the shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // Only cache a real shell. GitHub Pages answers deep links with a
          // 404 status whose body is the shell, so caching blindly would
          // enshrine an error response as the offline page.
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put('./index.html', copy));
          }
          return res;
        })
        .catch(() => caches.match('./index.html').then((r) => r ?? caches.match('./'))),
    );
    return;
  }

  // Everything else: serve from cache, and fill the cache on first miss.
  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ??
        fetch(request).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(request, copy));
          }
          return res;
        }),
    ),
  );
});
