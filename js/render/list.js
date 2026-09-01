import { h } from "../dom.js";
import { slugify, frPrice } from "../format.js";

// Met à jour l'affichage d'un slider en direct pendant le glissement, sans
// déclencher de nouveau rendu (coûteux et risqué pour le focus) : seul le
// relâchement (évènement "change") recalcule le classement.
function liveOutput(output) {
  return e => { output.textContent = e.target.value; };
}

function weightSlider(criterion, actions) {
  const id = `w-${criterion.key}`;
  const output = h("output", { for: id, class: "slider-row__value" }, String(criterion.value));
  const range = h("input", {
    type: "range", id, min: "0", max: "10", step: "1", value: String(criterion.value),
    oninput: liveOutput(output),
    onchange: e => actions.onWeightChange(criterion.key, Number(e.target.value))
  });
  return h("div", { class: "slider-row" }, [
    h("label", { for: id, class: "slider-row__label" }, criterion.label),
    output,
    range
  ]);
}

function budgetSlider(vm, actions) {
  const output = h("output", { for: "budget", class: "slider-row__value" }, vm.budgetLabel);
  const range = h("input", {
    type: "range", id: "budget",
    min: String(vm.budgetMin), max: String(vm.budgetMax), step: String(vm.budgetStep),
    value: String(vm.budget),
    oninput: e => { output.textContent = frPrice(Number(e.target.value)); },
    onchange: e => actions.onBudgetChange(Number(e.target.value))
  });
  return h("div", { class: "slider-row budget-row" }, [
    h("label", { for: "budget", class: "slider-row__label" }, "Budget maximum"),
    output,
    range
  ]);
}

function filterCheckbox(option, idPrefix, onChange) {
  const id = `${idPrefix}-${slugify(option.value)}`;
  return h("label", { for: id, class: "checkbox-row" }, [
    h("input", { type: "checkbox", id, checked: option.on, onchange: () => onChange(option.value) }),
    h("span", {}, option.label)
  ]);
}

function accordion(vm, actions) {
  const details = h("details", { class: "accordion", open: vm.accordionOpen });
  details.addEventListener("toggle", () => actions.onAccordionToggle(details.open));

  const summary = h("summary", { id: "accordion-summary", class: "accordion__summary" }, [
    h("span", { class: "accordion__summary-label" }, [
      h("span", { "aria-hidden": "true", class: "accordion__chevron" }, "▼"),
      "Régler les pondérations et filtres"
    ]),
    h("span", { "aria-hidden": "true", class: "accordion__badge" }, vm.weightSummary)
  ]);

  const criteriaField = h("fieldset", { class: "field-group" }, [
    h("legend", { class: "field-group__legend" }, "Importance des critères — 0 à 10"),
    h("div", { class: "criteria-list" }, vm.criteria.map(c => weightSlider(c, actions)))
  ]);

  const brandField = h("fieldset", { class: "field-group field-group--bordered" }, [
    h("legend", { class: "field-group__legend" }, "Pays de la marque"),
    h("div", { class: "checkbox-list" }, vm.brandFilters.map(o => filterCheckbox(o, "filter-brand", actions.onToggleBrand)))
  ]);

  const zoneField = h("fieldset", { class: "field-group field-group--bordered" }, [
    h("legend", { class: "field-group__legend" }, "Lieu d'assemblage"),
    h("div", { class: "checkbox-list" }, vm.zoneFilters.map(o => filterCheckbox(o, "filter-zone", actions.onToggleZone)))
  ]);

  const resetBtn = h("button", {
    type: "button", id: "reset-filters-btn", class: "btn btn--outline reset-btn", onclick: actions.onReset
  }, "Réinitialiser");

  const body = h("div", { class: "accordion__body" }, [criteriaField, budgetSlider(vm, actions), brandField, zoneField, resetBtn]);
  details.append(summary, body);
  return details;
}

function sortBar(vm, actions) {
  return h("div", { class: "sort-bar" }, [
    h("label", { for: "tri", class: "sort-bar__label" }, "Trier par"),
    h("select", {
      id: "tri", class: "sort-bar__select",
      onchange: e => actions.onSortChange(e.target.value)
    }, vm.sortOptions.map(o => h("option", { value: o.key, selected: o.key === vm.sortKey }, o.label))),
    h("p", { class: "sort-bar__count", "aria-live": "polite" }, vm.countLabel)
  ]);
}

function vehicleRow(row, actions) {
  const checkboxId = `toggle-${row.code}`;
  const openBtn = h("button", {
    type: "button", id: `open-${row.code}`, class: "vehicle-list__open",
    "aria-label": `Voir la fiche de ${row.name}, score ${row.score} sur 100`,
    onclick: () => actions.onOpenCar(row.code)
  }, [
    h("span", { class: "vehicle-list__name" }, row.name),
    h("span", { class: "vehicle-list__score" }, row.score),
    h("span", { class: "vehicle-list__figures" }, row.figures)
  ]);
  const checkboxLabel = h("label", { for: checkboxId, class: "vehicle-list__compare" }, [
    h("input", {
      type: "checkbox", id: checkboxId, checked: row.selected,
      "aria-label": `Comparer ${row.name}`,
      onchange: () => actions.onToggleCompare(row.code)
    })
  ]);
  return h("li", { class: "vehicle-list__item" }, [openBtn, checkboxLabel]);
}

export function renderListScreen(vm, actions) {
  const list = vm.isEmpty
    ? h("p", { class: "excluded-note" }, "Aucun véhicule ne correspond au budget et aux filtres sélectionnés.")
    : h("ol", { class: "vehicle-list" }, vm.rows.map(r => vehicleRow(r, actions)));

  return h("div", {}, [
    h("h2", { id: "list-heading", tabindex: "-1", class: "sr-only" }, "Classement des véhicules"),
    accordion(vm, actions),
    sortBar(vm, actions),
    list,
    h("p", { class: "excluded-note" }, vm.excludedLabel)
  ]);
}
