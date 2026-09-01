import { h } from "../dom.js";

export function sectionTitle(text) {
  return h("h3", { class: "section-title" }, text);
}

export function srOnly(text) {
  return h("span", { class: "sr-only" }, text);
}
