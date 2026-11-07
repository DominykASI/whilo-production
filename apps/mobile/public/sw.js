/* Whilo web service worker.
 *
 * Cache strategy (same-origin only):
 * - Navigations: network-first, falling back to the cached shell, then offline.html.
 * - Hashed / versioned static assets (/_expo/, .js, .css, fonts, images, manifest,
 *   icons): cache-first, then network and populate the cache. Expo/Metro emits
 *   content-hashed filenames, so a cached entry never goes stale.
 * - Everything else (API, auth, account): network-only, never cached. This covers
 *   /v1/* (mobile-auth, me, agent-templates, ...), any cross-origin request, and
 *   WebSocket upgrades — auth tokens and realtime sessions must never be served
 *   from cache.
 *
 * The cache name is versioned with the app version from app.json (1.4.5). Bump
 * CACHE_VERSION on every release so old shells are purged on activation.
 */

const CACHE_VERSION = "whilo-v1.4.5";
const PRECACHE = [CACHE_VERSION + "-precache", CACHE_VERSION + "-runtime"];
const SHELL = "./";
const OFFLINE = "./offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE[0])
      .then((cache) => cache.addAll([SHELL, OFFLINE, "./site.webmanifest", "./icon-192.png"]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => !PRECACHE.includes(key)).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isHashedAsset(url) {
  return (
    url.pathname.includes("/_expo/") ||
    /\.(?:js|css|woff2?|ttf|otf|png|jpe?g|gif|webp|svg|ico|webmanifest|json)$/i.test(url.pathname)
  );
}

function isApiOrAuth(url) {
  return url.pathname.startsWith("/v1/") || url.pathname.includes("/auth/") || url.pathname.includes("/mobile-auth/");
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  // WebSocket upgrades are not fetch events in most browsers, but never cache
  // anything that looks like one if it arrives here.
  if (request.headers.get("upgrade")?.toLowerCase() === "websocket") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // cross-origin API/analytics: network-only
  if (isApiOrAuth(url)) return; // auth + API: network-only, never cached

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(PRECACHE[1]).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request, { ignoreSearch: true }).then(
            (cached) =>
              cached ??
              caches.match(SHELL).then((shell) => shell ?? caches.match(OFFLINE)),
          ),
        ),
    );
    return;
  }

  if (isHashedAsset(url)) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(PRECACHE[1]).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
  }
  // All other same-origin GETs: network-only (no caching).
});
