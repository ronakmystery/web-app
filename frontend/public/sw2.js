const CACHE_VERSION = "v3.2.1";
const CACHE_NAME = `my-cache-${CACHE_VERSION}`;

self.addEventListener("install", (event) => {
  console.log("Service worker: installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
      await clients.claim();
      console.log("Service worker: activated");
    })()
  );
});

// Optional cache logic
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
