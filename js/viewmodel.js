// Calcule, à partir de l'état applicatif, toutes les données prêtes à
// afficher pour les trois écrans. Fonction pure : aucune référence au DOM, ce
// qui la rend vérifiable indépendamment de l'affichage.
import { CARS, BRANDS, ASSEMBLY_ZONES, PRICE_RANGE, PRICE_STEP } from "./data.js";
import { PHOTOS } from "./photos.js";
import { CRITERIA, PHOTO_ASPECT, PHOTO_SIZES, photoView, frPrice, frNumber, rawValue } from "./format.js";
import { filterCars, rankCars, criterionRank, computeBounds } from "./scoring.js";

export function buildViewModel(state) {
  const visibleCars = filterCars(CARS, { budget: state.budget, offBrands: state.offBrands, offZones: state.offZones });
  const ranked = rankCars(visibleCars, state.weights, CRITERIA);
  const bounds = computeBounds(visibleCars, CRITERIA);
  const total = ranked.length;
  const rankByCode = new Map(ranked.map((entry, i) => [entry.car.code, i + 1]));

  const displayOrder = state.sortKey === "score"
    ? ranked
    : [...ranked].sort((a, b) => {
        const c = CRITERIA.find(x => x.key === state.sortKey);
        return (a.car[c.key] - b.car[c.key]) * (c.dir === 1 ? -1 : 1);
      });

  const selectedCodes = state.selected.filter(code => rankByCode.has(code));
  const selectedEntries = selectedCodes.map(code => ranked.find(e => e.car.code === code));

  const currentCode = state.current && rankByCode.has(state.current) ? state.current : ranked[0]?.car.code;
  const currentEntry = ranked.find(e => e.car.code === currentCode) ?? null;

  const excludedCount = CARS.length - visibleCars.length;
  const activeFilterCount = state.offBrands.size + state.offZones.size;
  const priorityCount = CRITERIA.filter(c => (state.weights[c.key] ?? 5) >= 8).length;

  return {
    screen: state.screen,
    total,
    isEmpty: total === 0,

    accordionOpen: state.accordionOpen,
    weightSummary: `${priorityCount} prioritaires · ${activeFilterCount} filtres`,
    criteria: CRITERIA.map(c => ({ key: c.key, label: c.label, value: state.weights[c.key] ?? 5 })),
    budget: state.budget,
    budgetLabel: frPrice(state.budget),
    budgetMin: PRICE_RANGE.min,
    budgetMax: PRICE_RANGE.max,
    budgetStep: PRICE_STEP,
    brandFilters: BRANDS.map(b => ({ value: b, label: b, on: !state.offBrands.has(b) })),
    zoneFilters: ASSEMBLY_ZONES.map(z => ({ value: z, label: z, on: !state.offZones.has(z) })),

    sortKey: state.sortKey,
    sortOptions: [{ key: "score", label: "Score pondéré" }, ...CRITERIA.map(c => ({ key: c.key, label: c.label }))],
    countLabel: `${total} modèle${total > 1 ? "s" : ""}`,
    excludedLabel: excludedCount === 0
      ? `Les ${CARS.length} modèles du jeu de données sont affichés. Score calculé sur les modèles visibles uniquement.`
      : `${excludedCount} modèle(s) masqué(s) par le budget ou les filtres d'origine. Score recalculé sur les modèles visibles.`,

    rows: displayOrder.map(({ car, score }) => ({
      code: car.code,
      name: car.name,
      score: String(score),
      figures: `${frPrice(car.price)} · ${car.range} km · ${frNumber(car.surface, 2)} m² · ⚡︎ ${frNumber(car.chargeRate, 1)} km/min`,
      selected: selectedCodes.includes(car.code)
    })),

    current: currentEntry && {
      code: currentEntry.car.code,
      name: currentEntry.car.name,
      origin: `Marque ${currentEntry.car.brand} · Assemblage ${currentEntry.car.factory}`,
      score: String(currentEntry.score),
      rankLabel: `rang ${rankByCode.get(currentEntry.car.code)} sur ${total}`,
      selected: selectedCodes.includes(currentEntry.car.code),
      volume: `${frNumber(currentEntry.car.volume, 2)} m³`,
      photos: buildPhotos(currentEntry.car),
      bars: currentEntry.parts.map(({ criterion }) => {
        const rank = criterionRank(ranked, criterion, currentEntry.car);
        const weight = state.weights[criterion.key] ?? 5;
        const ignored = weight === 0;
        const tier = ignored ? "ignored" : rank <= total / 3 ? "good" : rank <= (2 * total) / 3 ? "mid" : "bad";
        const note = rank === 1 ? `meilleur des ${total} modèles affichés`
          : rank === total ? `dernier des ${total} modèles affichés`
          : `${rank}e sur ${total}`;
        const [min, max] = bounds[criterion.key];
        const rawFraction = max === min ? 1 : (currentEntry.car[criterion.key] - min) / (max - min);
        return {
          label: criterion.label,
          value: criterion.format(currentEntry.car[criterion.key]),
          pct: Math.round(6 + 94 * rawFraction),
          tier,
          note: ignored ? `${note} · critère ignoré` : note,
          aria: `${criterion.label} : ${note}${ignored ? ", critère ignoré" : `, poids ${weight}`}`
        };
      })
    },

    compare: buildCompareViewModel(selectedEntries)
  };
}


// Le manifeste est généré en parcourant un dossier : il arrive donc dans
// l'ordre alphabétique des vues. L'ordre d'affichage voulu (extérieur puis
// intérieur) vit dans PHOTO_VIEWS, côté code, et est appliqué ici.
//
// Chaque vue existe en plusieurs largeurs (448 / 896 / 1344 px selon ce que la
// source permet). On les décrit toutes dans un `srcset` et on laisse le
// navigateur n'en télécharger qu'une : celle qui correspond à la taille réelle
// de la diapositive sur son écran, densité de pixels comprise. Servir la plus
// grande à tout le monde ferait télécharger jusqu'à treize fois trop de pixels.
//
// `src` porte la plus petite variante : c'est le repli des navigateurs sans
// `srcset`, et à ce titre il vaut mieux qu'il soit léger — tous ceux qui
// savent lire l'AVIF savent lire un `srcset`, il ne sera en pratique jamais
// téléchargé.
function buildPhotos(car) {
  return (PHOTOS[car.code] ?? [])
    .map(photo => ({ photo, view: photoView(photo.view) }))
    .sort((a, b) => a.view.order - b.view.order || a.photo.view.localeCompare(b.photo.view, "fr"))
    .map(({ photo, view }) => {
      const widths = [...photo.w].sort((a, b) => a - b);
      const largest = widths[widths.length - 1];
      const url = w => `img/${car.code}/${photo.view}-${w}.avif`;
      return {
        src: url(widths[0]),
        srcset: widths.map(w => `${url(w)} ${w}w`).join(", "),
        sizes: PHOTO_SIZES,
        // Dimensions de la plus grande variante : seul leur rapport compte,
        // le CSS impose la largeur. Elles réservent la place avant le
        // chargement et évitent tout décalage de mise en page.
        width: String(largest),
        height: String(Math.round(largest * PHOTO_ASPECT.h / PHOTO_ASPECT.w)),
        label: view.label,
        alt: `${car.name} — ${view.alt}`
      };
    });
}

function buildCompareViewModel(selectedEntries) {
  const defs = [...CRITERIA, { key: "score", label: "Score", unit: "sur 100", dir: 1 }];
  const nameAt = i => selectedEntries[i]?.car.name ?? (i < 2 ? "—" : null);

  return {
    count: selectedEntries.length,
    disabled: selectedEntries.length < 2,
    hint: selectedEntries.length < 2
      ? "Cochez au moins deux véhicules dans le classement (trois maximum)."
      : `${selectedEntries.length} véhicules comparés · ★ marque la meilleure valeur`,
    columns: { a: nameAt(0), b: nameAt(1), c: nameAt(2) },
    rows: defs.map(def => {
      const valueOf = entry => (def.key === "score" ? entry.score : entry.car[def.key]);
      const values = selectedEntries.map(valueOf);
      const best = values.length ? (def.dir === 1 ? Math.max(...values) : Math.min(...values)) : null;
      const cellAt = i => {
        const entry = selectedEntries[i];
        if (!entry) return i < 2 ? { text: "—", best: false } : null;
        const value = valueOf(entry);
        return {
          text: def.key === "score" ? String(value) : rawValue(def, value),
          best: selectedEntries.length > 1 && value === best
        };
      };
      return { label: def.label, unit: def.unit, a: cellAt(0), b: cellAt(1), c: cellAt(2) };
    })
  };
}
