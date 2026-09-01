// Petit utilitaire de construction du DOM ("hyperscript" minimal, sans
// dépendance) : crée de vrais nœuds, jamais de innerHTML avec du contenu
// dynamique, et attache les écouteurs directement comme des fonctions.
export function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === "class") {
      el.className = value;
    } else if (key in el) {
      // Propriétés IDL (checked, disabled, open, selected, hidden, value…) :
      // reflètent correctement les attributs booléens, contrairement à setAttribute.
      el[key] = value;
    } else {
      // Pas de propriété JS correspondante (tabindex, for, role, aria-*, data-*…) : attribut brut.
      el.setAttribute(key, value);
    }
  }
  for (const child of [].concat(children)) {
    if (child == null || child === false) continue;
    el.append(child.nodeType ? child : document.createTextNode(String(child)));
  }
  return el;
}

// Remplace le contenu de `container` par `node`, en conservant le focus
// clavier : si l'élément actif possède un id et qu'un élément portant le même
// id existe après le remplacement, le focus lui est rendu. Indispensable ici
// car un simple ajustement de curseur (slider, case à cocher) reconstruit une
// partie de l'arbre DOM.
export function replaceContentPreservingFocus(container, node) {
  const activeId = document.activeElement && document.activeElement.id;
  container.replaceChildren(node);
  if (activeId) {
    const restored = document.getElementById(activeId);
    if (restored) restored.focus({ preventScroll: true });
  }
}
