const CACHE = "heman-v15";
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
  "./js/fullscreen.js",
  "./js/ship.js",
  "./js/flight.js",
  "./js/stage2.js",
  "./js/difficulty.js",
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

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  const isNav = req.mode === "navigate";
  const isCode =
    sameOrigin &&
    (url.pathname.endsWith(".html") ||
      url.pathname.endsWith(".js") ||
      url.pathname.endsWith(".css") ||
      url.pathname.endsWith("/") ||
      url.pathname.endsWith("webmanifest"));

  // HTML/JS/CSS: network-first, damit iPad nicht auf altem Stand hängt
  if (isNav || isCode) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() =>
          caches.match(req, { ignoreSearch: true }).then((cached) => cached || caches.match("./index.html"))
        )
    );
    return;
  }

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
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
