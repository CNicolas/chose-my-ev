# Choose my EV

Comparateur de voitures électriques : classez une sélection de modèles selon
**vos** priorités (prix, autonomie, recharge, coffre, encombrement, look…) et
comparez vos favoris critère par critère.

Générée par Claude à partir d'une maquette [Claude Design](https://claude.ai/),
l'application est une page web statique — **aucun framework, aucune étape de
build**, HTML/CSS/JS natif.

## Fonctionnalités

- **Classement pondéré** — chaque critère reçoit une importance de 0 à 10 ;
  le score sur 100 est recalculé en direct.
- **Filtres** — budget maximum, pays de la marque, lieu d'assemblage
  (France / UE / hors UE). Le score est toujours recalculé sur les seuls
  modèles visibles.
- **Fiche véhicule** — détail critère par critère avec le rang du modèle sur
  chaque critère, et emplacement prévu pour les photos.
- **Comparaison** — tableau de 2 à 3 véhicules côte à côte, la meilleure
  valeur de chaque ligne est marquée d'une ★.
- **Réglages persistants et partageables** — sauvegardés dans le
  `localStorage` et encodés dans le hash de l'URL : copiez le lien pour
  partager votre configuration.
- **Thème clair / sombre** suivant la préférence du système.
- Pensée pour l'accessibilité (navigation clavier, focus géré à chaque
  changement d'écran, libellés lecteur d'écran) et l'éco-conception (une
  seule police, pas d'images ni d'icônes, pas de dépendance).

## Lancer en local

Le code utilise les modules ES (`<script type="module">`), qui ne se chargent
pas via `file://`. Il faut servir le dossier avec un petit serveur HTTP :

```bash
python3 -m http.server 8000
```

Puis ouvrir <http://localhost:8000>. N'importe quel serveur statique fait
l'affaire (`npx serve`, l'aperçu intégré de WebStorm, etc.).

## Structure

```
index.html            Structure de la page, en-tête, conteneur des écrans
css/styles.css         Feuille de styles unique (variables CSS, thème clair/sombre)
js/
  app.js               État applicatif, actions, routage entre écrans, rendu
  data.js              Jeu de données véhicules + zones d'assemblage / marques
  scoring.js           Filtrage, normalisation, score pondéré (logique pure)
  viewmodel.js         Transforme l'état en données prêtes à afficher (pure)
  format.js            Formatage FR, définition des 11 critères
  persistence.js       Sauvegarde localStorage + hash d'URL (base64)
  dom.js               Micro-utilitaire de création de DOM + gestion du focus
  render/
    list.js            Écran classement (accordéon réglages, tri, liste)
    detail.js          Écran fiche véhicule
    compare.js         Écran tableau de comparaison
    shared.js          Petits fragments de rendu partagés
```

L'architecture sépare la **logique pure** (`scoring.js`, `viewmodel.js`,
`format.js` — aucune référence au DOM) du **rendu** (`render/*`). `app.js`
tient l'état, applique les patchs et redessine.

## Calcul du score

1. On filtre les véhicules par budget, marque et zone d'assemblage.
2. Pour chaque critère, on normalise la valeur sur `[0, 1]` parmi les modèles
   visibles (`1` = meilleur, en tenant compte du sens du critère — pour le
   prix ou la consommation, plus bas est mieux).
3. Le score est la moyenne des valeurs normalisées, pondérée par l'importance
   de chaque critère, ramenée sur 100. Un critère à `0` est ignoré.

Les 11 critères : prix, autonomie, consommation, temps de recharge 20‑80 %,
rythme de recharge, coffre, encombrement au sol, look, qualité perçue,
praticité, 0 à 100 km/h.

## Données

Le jeu de données (14 modèles) est codé en dur dans
[`js/data.js`](js/data.js). Les champs subjectifs (`look`, `quality`,
`practicality`) et les informations d'origine (`brand`, `factory`) ont été
renseignés manuellement à la conception et **restent à vérifier avant tout
usage réel**. Le `chargeRate` (km récupérés par minute) est dérivé de
l'autonomie et du temps de recharge.

## Crédits

Application et code générés par Claude (Claude Code) à partir d'une session
Claude Design.
