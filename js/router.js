// Routage par hash d'URL. Le hash — et non le chemin — parce que le site est
// publié sur GitHub Pages : un serveur de fichiers statiques répondrait 404 sur
// `/voiture/tesla-model-y`, faute de pouvoir réécrire vers index.html. Le hash
// n'est jamais envoyé au serveur, donc F5 recharge toujours index.html, qui
// relit la route et redessine le bon écran.
//
//   #/                              classement
//   #/voiture/<code>                fiche d'un modèle
//   #/comparer                      tableau de comparaison
//
// Les réglages voyagent dans la partie requête du hash, pour rester
// partageables quel que soit l'écran : `#/voiture/kia-ev6?cfg=<base64>`.

const CAR_SEGMENT = "voiture";
const COMPARE_SEGMENT = "comparer";

// Sépare chemin et requête. Tolère l'ancien format de lien partagé
// (`#cfg=...`, sans chemin), qui circule déjà : il est lu comme le classement.
function splitHash(hash) {
  const raw = hash.replace(/^#/, "");
  if (raw.startsWith("cfg=")) return { path: "/", query: raw };
  const mark = raw.indexOf("?");
  if (mark === -1) return { path: raw || "/", query: "" };
  return { path: raw.slice(0, mark) || "/", query: raw.slice(mark + 1) };
}

// Chemin actuel, sans les réglages : ce que `saveConfig` doit préserver en
// réécrivant le hash.
export function currentPath() {
  return splitHash(location.hash).path;
}

// Réglages encodés présents dans l'URL, ou null.
//
// Lus à la main plutôt qu'avec URLSearchParams : celui-ci applique les règles
// des formulaires HTML et transforme tout `+` en espace. Or `+` appartient à
// l'alphabet base64 — la configuration serait silencieusement corrompue dès
// qu'elle en contient un.
export function currentCfg() {
  const match = splitHash(location.hash).query.match(/(?:^|&)cfg=([^&]*)/);
  return match ? match[1] : null;
}

export function parseRoute(hash = location.hash) {
  const segments = splitHash(hash).path.split("/").filter(Boolean);
  if (segments[0] === CAR_SEGMENT && segments[1]) {
    return { screen: "detail", code: decodeURIComponent(segments[1]) };
  }
  if (segments[0] === COMPARE_SEGMENT) return { screen: "compare", code: null };
  return { screen: "list", code: null };
}

export function pathFor(screen, code) {
  if (screen === "detail" && code) return `/${CAR_SEGMENT}/${encodeURIComponent(code)}`;
  if (screen === "compare") return `/${COMPARE_SEGMENT}`;
  return "/";
}

export function formatHash(path, cfg) {
  return cfg ? `#${path}?cfg=${cfg}` : `#${path}`;
}
