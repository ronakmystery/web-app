const CACHE_NAME = "v3.1.0"; // Increment this to force update

self.addEventListener("install", (event) => {
  self.skipWaiting(); // Immediately activate
});

self.addEventListener("activate", (event) => {
  clients.claim(); // Take control right away
});

self.addEventListener("fetch", (event) => {
  // 🚫 No caching — always go to network
  event.respondWith(fetch(event.request));
});
