import { CARS, BRANDS, ASSEMBLY_ZONES, PRICE_RANGE } from "./data.js";
import { CRITERIA } from "./format.js";
import { defaultWeights } from "./scoring.js";
import { buildViewModel } from "./viewmodel.js";
import { replaceContentPreservingFocus } from "./dom.js";
import { loadConfig, saveConfig, syncHash } from "./persistence.js";
import { parseRoute, pathFor, formatHash, currentPath, currentCfg } from "./router.js";
import { renderListScreen } from "./render/list.js";
import { renderDetailScreen } from "./render/detail.js";
import { renderCompareScreen } from "./render/compare.js";

const KNOWN_CAR_CODES = new Set(CARS.map(c => c.code));
const SCROLL_FAB_THRESHOLD = 240;

function sanitizeConfig(raw) {
  const weights = defaultWeights(CRITERIA);
  if (raw?.weights && typeof raw.weights === "object") {
    for (const c of CRITERIA) {
      const v = raw.weights[c.key];
      if (Number.isInteger(v) && v >= 0 && v <= 10) weights[c.key] = v;
    }
  }
  const budget = Number.isFinite(raw?.budget)
    ? Math.min(PRICE_RANGE.max, Math.max(PRICE_RANGE.min, raw.budget))
    : PRICE_RANGE.max;
  const offBrands = new Set(Array.isArray(raw?.offBrands) ? raw.offBrands.filter(b => BRANDS.includes(b)) : []);
  const offZones = new Set(Array.isArray(raw?.offZones) ? raw.offZones.filter(z => ASSEMBLY_ZONES.includes(z)) : []);
  const selected = Array.isArray(raw?.selected) ? raw.selected.filter(c => KNOWN_CAR_CODES.has(c)).slice(-3) : [];
  const sortKey = raw?.sortKey === "score" || CRITERIA.some(c => c.key === raw?.sortKey) ? raw.sortKey : "score";
  return { weights, budget, offBrands, offZones, selected, sortKey };
}

// Traduit une route en état d'écran. Un code de modèle inconnu — lien périmé,
// modèle retiré du jeu de données — retombe sur le classement plutôt que
// d'afficher la fiche d'un autre véhicule.
function routeToState(route) {
  if (route.screen === "detail" && KNOWN_CAR_CODES.has(route.code)) {
    return { screen: "detail", current: route.code };
  }
  return { screen: route.screen === "compare" ? "compare" : "list", current: null };
}

const bootRoute = parseRoute();

const state = {
  ...routeToState(bootRoute),
  accordionOpen: false,
  scrolled: false,
  ...sanitizeConfig(loadConfig(currentCfg()))
};

function persistableConfig() {
  return {
    weights: state.weights,
    budget: state.budget,
    offBrands: [...state.offBrands],
    offZones: [...state.offZones],
    selected: state.selected,
    sortKey: state.sortKey
  };
}

function toggledSet(set, value) {
  const next = new Set(set);
  next.has(value) ? next.delete(value) : next.add(value);
  return next;
}

function toggleSelected(list, code) {
  return list.includes(code) ? list.filter(c => c !== code) : [...list, code].slice(-3);
}

// Applique un changement d'état puis redessine. `persist` sauvegarde en local
// et dans l'URL (réglages utilisateur) ; `navigation` indique un changement
// d'écran, qui déplace le focus clavier vers le titre du nouvel écran.
function apply(patch, { persist = false, navigation = false } = {}) {
  Object.assign(state, patch);
  if (persist) saveConfig(persistableConfig());
  render({ focusHeading: navigation });
}

const actions = {
  onWeightChange: (key, value) => apply({ weights: { ...state.weights, [key]: value } }, { persist: true }),
  onBudgetChange: value => apply({ budget: value }, { persist: true }),
  onToggleBrand: brand => apply({ offBrands: toggledSet(state.offBrands, brand) }, { persist: true }),
  onToggleZone: zone => apply({ offZones: toggledSet(state.offZones, zone) }, { persist: true }),
  onReset: () => apply({
    weights: defaultWeights(CRITERIA), budget: PRICE_RANGE.max, offBrands: new Set(), offZones: new Set(), selected: []
  }, { persist: true }),
  // Recréer le <details> à chaque rendu avec `open` déjà positionné déclenche
  // un évènement "toggle" synthétique (même détaché du DOM) : sans ce garde,
  // il relance un rendu qui recrée un <details>, qui redéclenche l'évènement,
  // en boucle infinie.
  onAccordionToggle: open => { if (open !== state.accordionOpen) apply({ accordionOpen: open }); },
  onSortChange: key => apply({ sortKey: key }, { persist: true }),
  onOpenCar: code => navigate("detail", code),
  onToggleCompare: code => apply({ selected: toggleSelected(state.selected, code) }, { persist: true }),
  onClearSelection: () => apply({ selected: [] }, { persist: true }),
  onGoList: () => navigate("list"),
  onGoCompare: () => navigate("compare")
};

// Changer d'écran, c'est écrire la route dans le hash et laisser l'évènement
// `hashchange` redessiner. Un seul chemin de code sert donc les boutons de
// l'application et les flèches Précédent / Suivant du navigateur — et un F5
// sur une fiche rouvre cette fiche, puisque tout l'état d'écran est dans l'URL.
function navigate(screen, code = null) {
  const hash = formatHash(pathFor(screen, code), currentCfg());
  if (location.hash === hash) return;
  location.hash = hash;
}

function applyRoute(route, { navigation = true } = {}) {
  apply(routeToState(route), { navigation });

  // Réaligne l'URL sur l'écran réellement affiché, sans empiler d'historique :
  // un code inconnu doit disparaître de la barre d'adresse, et un ancien lien
  // `#cfg=...` prendre la forme `#/?cfg=...`.
  const path = pathFor(state.screen, state.current);
  if (currentPath() !== path) history.replaceState(null, "", formatHash(path, currentCfg()));

  // Les réglages ne sont lus dans l'URL qu'au démarrage : ils vivent ensuite
  // dans l'état et le localStorage, le hash n'en est qu'un reflet. On le
  // réécrit ici pour qu'un retour arrière ne laisse pas une configuration
  // périmée dans une URL qu'on partagerait ensuite. Une première visite, elle,
  // garde une URL nue tant que rien n'a été réglé.
  if (location.hash) syncHash(persistableConfig());
}

window.addEventListener("hashchange", () => applyRoute(parseRoute()));

const main = document.getElementById("contenu");
const homeBtn = document.getElementById("home-btn");
const compareTabBtn = document.getElementById("compare-tab-btn");
const fabWrapper = document.getElementById("fab");
const fabBtn = document.getElementById("fab-btn");

// Le lien d'évitement pointe sur `#contenu` : le laisser écrire dans le hash
// écraserait la route. On déplace le focus nous-mêmes.
document.querySelector(".skip-link").addEventListener("click", event => {
  event.preventDefault();
  main.focus();
});

homeBtn.addEventListener("click", actions.onGoList);
compareTabBtn.addEventListener("click", actions.onGoCompare);
fabBtn.addEventListener("click", actions.onGoCompare);

function compareLabel(count) {
  return count ? `Comparer (${count})` : "Comparer";
}

function syncHeader(vm) {
  const onCompareScreen = vm.screen === "compare";
  if (onCompareScreen) homeBtn.removeAttribute("aria-current"); else homeBtn.setAttribute("aria-current", "page");
  if (onCompareScreen) compareTabBtn.setAttribute("aria-current", "page"); else compareTabBtn.removeAttribute("aria-current");
  compareTabBtn.textContent = compareLabel(vm.compare.count);
  compareTabBtn.disabled = vm.compare.disabled;
}

function syncFab(vm) {
  const visible = state.scrolled && vm.screen !== "compare";
  fabWrapper.hidden = !visible;
  fabBtn.textContent = compareLabel(vm.compare.count);
  fabBtn.disabled = vm.compare.disabled;
}

function resolveScreenNode(vm) {
  if (vm.screen === "detail" && vm.current) return renderDetailScreen(vm.current, actions);
  if (vm.screen === "compare") return renderCompareScreen(vm.compare, actions);
  return renderListScreen(vm, actions);
}

function titleFor(vm) {
  const base = "Choose my EV";
  if (vm.screen === "detail" && vm.current) return `${vm.current.name} — ${base}`;
  if (vm.screen === "compare") return `Comparaison — ${base}`;
  return `${base} — Comparateur de voitures électriques`;
}

let lastViewModel = null;

function render({ focusHeading = false } = {}) {
  const vm = buildViewModel(state);
  lastViewModel = vm;
  document.title = titleFor(vm);
  syncHeader(vm);
  syncFab(vm);
  replaceContentPreservingFocus(main, resolveScreenNode(vm));
  if (focusHeading) {
    const headingId = vm.screen === "detail" && vm.current ? "detail-heading"
      : vm.screen === "compare" ? "compare-heading" : "list-heading";
    document.getElementById(headingId)?.focus({ preventScroll: false });
    window.scrollTo(0, 0);
  }
}

let scrollTicking = false;
window.addEventListener("scroll", () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    scrollTicking = false;
    const scrolled = window.scrollY > SCROLL_FAB_THRESHOLD;
    if (scrolled !== state.scrolled) {
      state.scrolled = scrolled;
      syncFab(lastViewModel);
    }
  });
}, { passive: true });

applyRoute(bootRoute, { navigation: false });
