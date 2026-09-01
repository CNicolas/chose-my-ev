import { CARS, BRANDS, ASSEMBLY_ZONES } from "./data.js";
import { CRITERIA } from "./format.js";
import { defaultWeights } from "./scoring.js";
import { buildViewModel } from "./viewmodel.js";
import { replaceContentPreservingFocus } from "./dom.js";
import { loadConfig, saveConfig } from "./persistence.js";
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
  const budget = Number.isFinite(raw?.budget) ? Math.min(70000, Math.max(45000, raw.budget)) : 70000;
  const offBrands = new Set(Array.isArray(raw?.offBrands) ? raw.offBrands.filter(b => BRANDS.includes(b)) : []);
  const offZones = new Set(Array.isArray(raw?.offZones) ? raw.offZones.filter(z => ASSEMBLY_ZONES.includes(z)) : []);
  const selected = Array.isArray(raw?.selected) ? raw.selected.filter(c => KNOWN_CAR_CODES.has(c)).slice(-3) : [];
  const sortKey = raw?.sortKey === "score" || CRITERIA.some(c => c.key === raw?.sortKey) ? raw.sortKey : "score";
  return { weights, budget, offBrands, offZones, selected, sortKey };
}

const state = {
  screen: "list",
  current: null,
  accordionOpen: false,
  scrolled: false,
  ...sanitizeConfig(loadConfig())
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
    weights: defaultWeights(CRITERIA), budget: 70000, offBrands: new Set(), offZones: new Set(), selected: []
  }, { persist: true }),
  // Recréer le <details> à chaque rendu avec `open` déjà positionné déclenche
  // un évènement "toggle" synthétique (même détaché du DOM) : sans ce garde,
  // il relance un rendu qui recrée un <details>, qui redéclenche l'évènement,
  // en boucle infinie.
  onAccordionToggle: open => { if (open !== state.accordionOpen) apply({ accordionOpen: open }); },
  onSortChange: key => apply({ sortKey: key }, { persist: true }),
  onOpenCar: code => apply({ screen: "detail", current: code }, { navigation: true }),
  onToggleCompare: code => apply({ selected: toggleSelected(state.selected, code) }, { persist: true }),
  onClearSelection: () => apply({ selected: [] }, { persist: true }),
  onGoList: () => apply({ screen: "list" }, { navigation: true }),
  onGoCompare: () => apply({ screen: "compare" }, { navigation: true })
};

const main = document.getElementById("contenu");
const homeBtn = document.getElementById("home-btn");
const compareTabBtn = document.getElementById("compare-tab-btn");
const fabWrapper = document.getElementById("fab");
const fabBtn = document.getElementById("fab-btn");

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

render();
