// Service worker : cache hors-ligne des photos et de la coquille applicative.
//
// Pourquoi : le site est publié sur GitHub Pages, qui impose
// `Cache-Control: max-age=600` sur tous les fichiers et ne se configure pas.
// Passé dix minutes, le navigateur revalide donc chaque photo — un aller-retour
// réseau par image, même quand la réponse est un 304 vide. Le service worker
// est le seul moyen, sur cet hébergement, de rendre une seconde visite
// réellement gratuite. Et il fait fonctionner l'application hors ligne.
//
// Deux régimes :
//
//   img/**   cache d'abord, sans revalidation. Le nom de fichier porte la
//            largeur (`avant-896.avif`) : une photo remplacée à la même
//            largeur ne changerait pas de nom, d'où le numéro de version
//            ci-dessous — l'incrémenter jette l'ancien cache.
//
//   le reste cache d'abord, mise à jour en arrière-plan (« stale while
//            revalidate »). La page s'affiche instantanément depuis le cache,
//            et la version fraîche est prête au chargement suivant. Un déploiement
//            met donc au plus une visite à apparaître, ce qui est le bon
//            compromis pour un comparateur : rien ici ne justifie de faire
//            attendre le réseau.
//
// Les ressources externes (Google Fonts) ne sont pas touchées : elles sont
// servies avec un cache d'un an, le navigateur s'en occupe déjà mieux que nous.

const VERSION = "v1";
const SHELL_CACHE = `shell-${VERSION}`;
const PHOTO_CACHE = `photos-${VERSION}`;
const CACHES = [SHELL_CACHE, PHOTO_CACHE];

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(n => !CACHES.includes(n)).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

// Une réponse partielle (206) ou en erreur n'a rien à faire en cache : la
// remettre plus tard donnerait une image tronquée ou une page d'erreur figée.
function isCacheable(response) {
  return response && response.ok && response.type === "basic";
}

async function cacheFirst(event) {
  const { request } = event;
  const cache = await caches.open(PHOTO_CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;

  const response = await fetch(request);
  if (isCacheable(response)) event.waitUntil(cache.put(request, response.clone()));
  return response;
}

// `event` sert à retenir le worker le temps que la mise à jour en arrière-plan
// aboutisse : sans `waitUntil`, le navigateur est libre de l'arrêter dès la
// réponse rendue, et le cache ne serait jamais rafraîchi.
async function staleWhileRevalidate(event) {
  const { request } = event;
  const cache = await caches.open(SHELL_CACHE);
  const hit = await cache.match(request);

  const fetched = fetch(request)
    .then(response => {
      if (isCacheable(response)) return cache.put(request, response.clone()).then(() => response);
      return response;
    })
    // Hors ligne sans copie en cache : on laisse remonter l'échec réseau
    // habituel plutôt que d'inventer une réponse.
    .catch(error => { if (!hit) throw error; return hit; });

  if (hit) {
    event.waitUntil(fetched);
    return hit;
  }
  return fetched;
}

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(url.pathname.includes("/img/") ? cacheFirst(event) : staleWhileRevalidate(event));
});
