// Sauvegarde des réglages (pondérations, budget, filtres, sélection, tri) en
// local et dans le hash d'URL, pour un lien partageable.
import { currentPath, formatHash } from "./router.js";

const STORAGE_KEY = "ev-cfg";

function toBase64(json) {
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

function fromBase64(base64) {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// Réécrit les réglages dans le hash sans toucher au chemin — donc sans changer
// d'écran — et sans empiler d'entrée d'historique : régler un curseur n'est pas
// une navigation, le bouton « Précédent » ne doit pas avoir à les défaire une
// par une.
export function syncHash(config) {
  try {
    history.replaceState(null, "", formatHash(currentPath(), toBase64(JSON.stringify(config))));
  } catch { /* hash non modifiable */ }
}

export function saveConfig(config) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch { /* stockage indisponible (mode privé, quota) */ }
  syncHash(config);
}

// `cfg` vient de l'URL : un lien partagé l'emporte sur les réglages locaux du
// visiteur, sinon il n'ouvrirait pas la configuration qu'on lui a envoyée.
export function loadConfig(cfg) {
  if (cfg) {
    try { return JSON.parse(fromBase64(decodeURIComponent(cfg))); } catch { /* lien corrompu, on ignore */ }
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* stockage indisponible */ }
  return null;
}
