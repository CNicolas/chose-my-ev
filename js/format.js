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

// Format d'affichage du carrousel. `tools/to-avif.sh` recadre toutes les
// variantes à ce ratio et le CSS l'applique via `aspect-ratio` : la hauteur
// d'une photo se déduit donc de sa largeur, sans avoir à la stocker dans le
// manifeste, et la place est réservée avant le chargement — aucun décalage de
// mise en page.
export const PHOTO_ASPECT = { w: 16, h: 10 };

// Largeur réelle d'une diapositive, décrite au navigateur pour qu'il choisisse
// la variante du `srcset` dès l'analyse du HTML, avant même d'avoir appliqué le
// CSS. Le cadre `.app-frame` est capé à 460 px et `.photo-section` retire 16 px
// de marge de chaque côté : 428 px au maximum, 100vw - 32px en dessous.
// À garder synchronisé avec css/styles.css et WIDTHS dans tools/to-avif.sh.
export const PHOTO_SIZES = "(max-width: 460px) calc(100vw - 32px), 428px";

// Vues de photo reconnues, dans l'ordre d'affichage du carrousel. Le nom du
// fichier source donne la vue : `profil.jpg` -> `profil`. C'est la seule
// convention à respecter en déposant les photos ; tout le reste (conversion
// AVIF, dimensions, manifeste) est produit par `tools/to-avif.sh`.
//
// `alt` est la description lue par les lecteurs d'écran ; elle est préfixée du
// nom du modèle au moment du rendu. Une vue hors de cette liste reste affichée,
// légendée à partir de son nom de fichier.
export const PHOTO_VIEWS = [
  { view: "avant", label: "Vue de face", alt: "vu de face, calandre et optiques avant." },
  { view: "profil", label: "Vue de côté", alt: "vu de profil, côté conducteur." },
  { view: "arriere", label: "Vue arrière", alt: "vu de l'arrière, hayon fermé et feux." },
  { view: "coffre", label: "Coffre ouvert", alt: "coffre arrière ouvert, plancher de chargement." },
  { view: "tableau-de-bord", label: "Tableau de bord", alt: "planche de bord, écran central et volant." },
  { view: "sieges-avant", label: "Sièges avant", alt: "sièges avant et console centrale." },
  { view: "sieges-arriere", label: "Sièges arrière", alt: "banquette arrière et accoudoir central." }
];

// Retrouve la vue correspondant à un identifiant du manifeste. Une vue inconnue
// est légendée à partir de son nom ("prise-de-charge" -> "Prise de charge") et
// classée après les vues connues, plutôt que d'être ignorée.
export function photoView(view) {
  const known = PHOTO_VIEWS.findIndex(v => v.view === view);
  if (known !== -1) return { order: known, ...PHOTO_VIEWS[known] };

  const label = view.replace(/-/g, " ");
  return {
    order: PHOTO_VIEWS.length,
    view,
    label: label.charAt(0).toUpperCase() + label.slice(1),
    alt: `vue « ${label} ».`
  };
}
