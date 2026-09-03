import { h } from "../dom.js";
import { PHOTO_VIEWS } from "../format.js";
import { sectionTitle } from "./shared.js";

// Carrousel sans JavaScript : une liste défilable horizontalement avec
// `scroll-snap`. Le navigateur gère le défilement, le clavier et le tactile,
// et les images hors écran ne sont téléchargées que si l'utilisateur fait
// défiler jusqu'à elles (`loading="lazy"`). L'écran fiche n'étant construit
// qu'à l'ouverture d'un modèle, rien de tout cela n'est chargé au démarrage :
// une visite qui reste sur le classement ne télécharge aucune photo.
function photoSection(photos) {
  if (!photos.length) {
    return h("section", { "aria-label": "Photos", class: "photo-section" }, [
      h("div", { class: "photo-placeholder" }, [
        h("p", { class: "photo-placeholder__text" }, "pas encore de photos"),
        // Liste dérivée de PHOTO_VIEWS pour ne pas dériver de la convention
        // réellement appliquée par tools/to-avif.sh.
        h("p", { class: "photo-placeholder__hint" },
          `Vues attendues : ${PHOTO_VIEWS.map(v => v.label.toLowerCase()).join(", ")}`)
      ]),
      h("div", { class: "photo-dots", "aria-hidden": "true" }, PHOTO_VIEWS.map(() => h("span")))
    ]);
  }

  return h("section", { "aria-label": "Photos", class: "photo-section" }, [
    h("ul", {
      class: "photo-carousel", tabindex: "0",
      role: "group", "aria-roledescription": "carrousel",
      "aria-label": `${photos.length} photos, faites défiler horizontalement`
    }, photos.map((photo, i) => h("li", { class: "photo-slide" }, [
      // `srcset` et `sizes` sont posés avant `src` : le navigateur démarre le
      // téléchargement dès l'affectation de `src`, et les lire après le laisserait
      // partir sur la mauvaise variante.
      //
      // La première diapositive est la seule visible d'emblée : elle est chargée
      // en priorité haute, les suivantes attendent le défilement.
      h("img", {
        class: "photo-slide__img",
        srcset: photo.srcset, sizes: photo.sizes,
        src: photo.src, alt: photo.alt,
        width: photo.width, height: photo.height,
        loading: i === 0 ? "eager" : "lazy",
        fetchpriority: i === 0 ? "high" : "low",
        decoding: "async"
      }),
      h("p", { class: "photo-slide__label", "aria-hidden": "true" }, photo.label)
    ]))),
    h("div", { class: "photo-dots", "aria-hidden": "true" }, photos.map(() => h("span")))
  ]);
}

function criteriaBar(bar) {
  return h("li", { class: "criteria-bars__row" }, [
    h("span", { class: "criteria-bars__label" }, bar.label),
    h("span", { class: "criteria-bars__value" }, bar.value),
    h("div", { class: "criteria-bars__track" }, [
      h("div", {
        role: "progressbar", "aria-label": bar.aria,
        "aria-valuenow": String(bar.pct), "aria-valuemin": "0", "aria-valuemax": "100",
        class: "criteria-bars__fill", "data-tier": bar.tier,
        style: `width:${bar.pct}%`
      })
    ]),
    h("span", { class: "criteria-bars__note", "data-tier": bar.tier, "aria-hidden": "true" }, bar.note)
  ]);
}

export function renderDetailScreen(car, actions) {
  const heading = h("h2", { id: "detail-heading", tabindex: "-1", class: "detail__title" }, car.name);

  return h("article", {}, [
    h("div", { class: "detail__intro" }, [
      heading,
      h("p", { class: "detail__origin" }, car.origin)
    ]),

    photoSection(car.photos ?? []),

    h("div", { class: "score-row" }, [
      h("p", { class: "score-row__value" }, car.score),
      h("p", { class: "score-row__caption" }, `score pondéré sur 100 · ${car.rankLabel}`)
    ]),

    h("section", { class: "criteria-bars-section" }, [
      sectionTitle("Détail par critère"),
      h("ul", { class: "criteria-bars" }, car.bars.map(criteriaBar))
    ]),

    h("section", { class: "specs-section" }, [
      sectionTitle("Autres informations"),
      h("dl", { class: "specs-list" }, [
        h("div", { class: "specs-list__row" }, [
          h("dt", { class: "specs-list__label" }, "Volume intérieur"),
          h("dd", { class: "specs-list__value" }, car.volume)
        ])
      ]),
      h("button", {
        type: "button", id: "compare-toggle-btn", class: "btn btn--primary compare-toggle-btn",
        onclick: () => actions.onToggleCompare(car.code)
      }, car.selected ? "Retirer de la comparaison" : "Ajouter à la comparaison")
    ])
  ]);
}

export function focusDetailHeading(root) {
  root.querySelector("#detail-heading")?.focus({ preventScroll: false });
}
