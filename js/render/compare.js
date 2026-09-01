import { h } from "../dom.js";
import { srOnly } from "./shared.js";

function headerCell(name) {
  return name == null ? null : h("th", { scope: "col" }, name);
}

function valueCell(cell, name) {
  if (!cell) return null;
  const mark = cell.best ? h("span", { "aria-hidden": "true", class: "compare-table__mark" }, " ★") : null;
  const srNote = cell.best ? srOnly(`meilleur sur ce critère (${name})`) : null;
  return h("td", {}, [cell.text, mark, srNote].filter(Boolean));
}

function compareRow(row, columns) {
  const rowHeader = h("th", { scope: "row" }, [
    h("span", { class: "compare-table__label" }, row.label),
    h("span", { class: "compare-table__unit" }, row.unit)
  ]);
  const cells = [
    valueCell(row.a, columns.a),
    valueCell(row.b, columns.b),
    columns.c == null ? null : valueCell(row.c, columns.c)
  ].filter(Boolean);
  return h("tr", {}, [rowHeader, ...cells]);
}

export function renderCompareScreen(vm, actions) {
  const { columns } = vm;
  const headerCells = [headerCell(columns.a), headerCell(columns.b), headerCell(columns.c)].filter(Boolean);

  const table = h("table", { class: "compare-table" }, [
    h("caption", { class: "sr-only" }, "Comparaison de trois véhicules critère par critère"),
    h("thead", {}, h("tr", {}, [h("th", { scope: "col", class: "sr-only" }, "Critère"), ...headerCells])),
    h("tbody", {}, vm.rows.map(row => compareRow(row, columns)))
  ]);

  return h("section", {}, [
    h("div", { class: "compare__header" }, [
      h("h2", { id: "compare-heading", tabindex: "-1", class: "compare__title" }, "Comparaison"),
      h("p", { class: "compare__hint" }, vm.hint)
    ]),
    h("div", { class: "compare__scroll" }, table),
    h("div", { class: "compare__footer" }, [
      h("button", { type: "button", id: "clear-selection-btn", class: "btn btn--outline", onclick: actions.onClearSelection }, "Vider la sélection")
    ])
  ]);
}
