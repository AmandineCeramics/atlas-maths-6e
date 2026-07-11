/* Service worker Atlas des 6 Royaumes — cache-first : 100 % offline après la 1re visite. */
const CACHE = "atlas6e-v17";
const FICHIERS = ["./", "./index.html", "./icon-180.png", "./icon-512.png", "./manifest.webmanifest"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(cles => Promise.all(cles.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(rep => {
      // servi depuis le cache ; mise à jour silencieuse en arrière-plan si en ligne
      const maj = fetch(e.request)
        .then(fraiche => {
          if (fraiche && fraiche.ok) {
            const clone = fraiche.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
          return fraiche;
        })
        .catch(() => rep);
      return rep || maj;
    })
  );
});
