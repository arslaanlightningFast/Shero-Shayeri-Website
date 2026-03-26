/* Sher-o-Shayari Service Worker
   - Pre-caches the core pages/assets for faster repeat loads
   - Runtime-caches same-origin GET requests (images, etc.)
   - Keeps caches versioned so updates replace old files safely
*/

const VERSION = "2026-03-26-01";
const CACHE_STATIC = `sher-static-${VERSION}`;
const CACHE_RUNTIME = `sher-runtime-${VERSION}`;

const toURL = (path) => new URL(path, self.location).toString();

const STATIC_URLS = [
  toURL("./"),
  toURL("./index.html"),
  toURL("./famous.html"),
  toURL("./style.css"),
  toURL("./script.js"),
  toURL("./sw.js"),
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_STATIC)
      .then((cache) => cache.addAll(STATIC_URLS))
      .catch(() => {
        // If any single asset fails, installation may fail; ignore to be resilient.
      })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.map((key) => {
            if (key !== CACHE_STATIC && key !== CACHE_RUNTIME) return caches.delete(key);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  // Only cache same-origin resources (prevents caching third-party images).
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      // Network-first for HTML so navigation keeps up with latest content.
      const accept = req.headers.get("accept") || "";
      const isHtml = accept.includes("text/html");

      const fetchPromise = fetch(req)
        .then((res) => {
          if (!res || res.status !== 200) return res;

          // Only cache basic responses (simple safety check).
          const shouldCache = res.type === "basic";
          if (!shouldCache) return res;

          const copy = res.clone();
          caches.open(CACHE_RUNTIME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => null);

      if (!isHtml) {
        // For non-HTML, cache-first after network success (fallback to cache miss).
        return fetchPromise || cached;
      }

      return fetchPromise || caches.match(req) || caches.match(toURL("./index.html"));
    })
  );
});

