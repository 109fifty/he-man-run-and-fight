const CACHE = "heman-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./js/main.js",
  "./js/game.js",
  "./js/input.js",
  "./js/player.js",
  "./js/enemy.js",
  "./js/level.js",
  "./js/physics.js",
  "./js/renderer.js",
  "./icons/apple-touch-icon.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/favicon-32.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetched = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});
