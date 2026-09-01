// Logique pure de filtrage, normalisation et score pondéré.
// Aucune dépendance au DOM : facilement vérifiable de manière isolée.

export function defaultWeights(criteria) {
  return Object.fromEntries(criteria.map(c => [c.key, 5]));
}

export function filterCars(cars, { budget, offBrands, offZones }) {
  return cars.filter(c =>
    c.price <= budget &&
    !offBrands.has(c.brand) &&
    !offZones.has(c.fz)
  );
}

export function computeBounds(cars, criteria) {
  const bounds = {};
  for (const c of criteria) {
    const values = cars.map(car => car[c.key]);
    bounds[c.key] = [Math.min(...values), Math.max(...values)];
  }
  return bounds;
}

// Normalise une valeur sur [0,1], 1 = meilleur, en tenant compte du sens du critère.
function normalize(criterion, value, bounds) {
  const [min, max] = bounds[criterion.key];
  if (max === min) return 1;
  const n = (value - min) / (max - min);
  return criterion.dir === 1 ? n : 1 - n;
}

// Calcule, pour chaque véhicule visible, son score pondéré (0-100) et le détail
// normalisé par critère. Le tri par score décroissant est appliqué ici.
export function rankCars(cars, weights, criteria) {
  const bounds = computeBounds(cars, criteria);
  const weightOf = key => weights[key] ?? 5;
  const totalWeight = criteria.reduce((sum, c) => sum + weightOf(c.key), 0) || 1;

  return cars
    .map(car => {
      const parts = criteria.map(c => ({ criterion: c, normalized: normalize(c, car[c.key], bounds) }));
      const score = Math.round(parts.reduce((sum, p) => sum + p.normalized * weightOf(p.criterion.key), 0) / totalWeight * 100);
      return { car, score, parts };
    })
    .sort((a, b) => b.score - a.score);
}

// Rang (1 = meilleur) d'un véhicule pour un critère donné, parmi la liste visible.
export function criterionRank(ranked, criterion, car) {
  const better = ranked.filter(({ car: other }) =>
    criterion.dir === 1 ? other[criterion.key] > car[criterion.key] : other[criterion.key] < car[criterion.key]
  ).length;
  return better + 1;
}
