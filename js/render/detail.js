import { h } from "../dom.js";
import { sectionTitle } from "./shared.js";

function photoSection() {
  return h("section", { "aria-label": "Photos", class: "photo-section" }, [
    h("div", { role: "group", "aria-roledescription": "carrousel", class: "photo-placeholder" }, [
      h("p", { class: "photo-placeholder__text" }, "pas encore de photos"),
      h("p", { class: "photo-placeholder__hint" }, "Vues attendues : avant, profil, coffre, tableau de bord, sièges avant, sièges arrière")
    ]),
    h("div", { class: "photo-dots", "aria-hidden": "true" }, Array.from({ length: 6 }, () => h("span")))
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

    photoSection(),

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
