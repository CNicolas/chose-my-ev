// Formatage numérique en français (virgule décimale) dans toute l'application.
const integerFormatter = new Intl.NumberFormat("fr-FR");

// Identifiant HTML sûr à partir d'un libellé accentué (ex. "Corée du Sud" -> "coree-du-sud").
export function slugify(label) {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function frNumber(value, decimals) {
  const text = decimals === undefined ? String(value) : value.toFixed(decimals);
  return text.replace(".", ",");
}

export function frPrice(value) {
  return `${integerFormatter.format(value)} €`;
}

export const CRITERIA = [
  { key: "price", label: "Prix", unit: "€", dir: -1, format: v => frPrice(v) },
  { key: "range", label: "Autonomie", unit: "km", dir: 1, format: v => `${v} km` },
  { key: "consumption", label: "Consommation", unit: "kWh/100 km", dir: -1, format: v => `${frNumber(v, 1)} kWh/100 km` },
  { key: "supercharge", label: "Recharge 20-80 %", unit: "min", dir: -1, format: v => `${v} min` },
  { key: "chargeRate", label: "Rythme de recharge", unit: "km/min", dir: 1, format: v => `${frNumber(v, 1)} km/min` },
  { key: "trunk", label: "Coffre", unit: "L", dir: 1, format: v => `${v} L` },
  { key: "surface", label: "Encombrement", unit: "m²", dir: -1, format: v => `${frNumber(v, 2)} m²` },
  { key: "look", label: "Look", unit: "sur 5", dir: 1, format: v => `${frNumber(v)} sur 5` },
  { key: "quality", label: "Qualité perçue", unit: "sur 5", dir: 1, format: v => `${frNumber(v)} sur 5` },
  { key: "practicality", label: "Praticité", unit: "sur 5", dir: 1, format: v => `${frNumber(v)} sur 5` },
  { key: "power", label: "0 à 100 km/h", unit: "s", dir: -1, format: v => `${frNumber(v, 1)} s` }
];

// Valeur nue (sans unité), utilisée dans les colonnes du tableau de comparaison
// où l'unité est déjà affichée une fois dans la première colonne.
export function rawValue(criterion, value) {
  switch (criterion.key) {
    case "price": return integerFormatter.format(value);
    case "range": case "supercharge": case "trunk": return String(value);
    case "consumption": case "chargeRate": return frNumber(value, 1);
    case "surface": return frNumber(value, 2);
    default: return frNumber(value, criterion.key === "power" ? 1 : undefined);
  }
}
