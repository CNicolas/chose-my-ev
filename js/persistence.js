// Sauvegarde des réglages (pondérations, budget, filtres, sélection, tri) en
// local et dans le hash d'URL, pour un lien partageable.
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

export function saveConfig(config) {
  const json = JSON.stringify(config);
  try { localStorage.setItem(STORAGE_KEY, json); } catch { /* stockage indisponible (mode privé, quota) */ }
  try { history.replaceState(null, "", `#cfg=${toBase64(json)}`); } catch { /* hash non modifiable */ }
}

export function loadConfig() {
  const match = location.hash.match(/cfg=([^&]+)/);
  if (match) {
    try { return JSON.parse(fromBase64(decodeURIComponent(match[1]))); } catch { /* lien corrompu, on ignore */ }
  }
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* stockage indisponible */ }
  return null;
}
