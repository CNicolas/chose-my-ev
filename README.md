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
  chaque critère, et carrousel de photos (voir *Photos* plus bas). Tant qu'un
  modèle n'a pas de photos, la fiche affiche le gabarit prévu à cet effet.
- **Comparaison** — tableau de 2 à 3 véhicules côte à côte, la meilleure
  valeur de chaque ligne est marquée d'une ★.
- **Réglages persistants et partageables** — sauvegardés dans le
  `localStorage` et encodés dans le hash de l'URL : copiez le lien pour
  partager votre configuration.
- **Thème clair / sombre** suivant la préférence du système.
- Pensée pour l'accessibilité (navigation clavier, focus géré à chaque
  changement d'écran, libellés lecteur d'écran) et l'éco-conception (une
  seule police, pas d'icônes, pas de dépendance, photos en AVIF chargées à
  la demande).

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
photos/<code>/        Photos sources (hors dépôt), converties par le script
img/<code>/           Photos publiées, en AVIF (voir « Photos »)
tools/to-avif.sh       Conversion vers AVIF + génération de js/photos.js
js/
  app.js               État applicatif, actions, routage entre écrans, rendu
  data.js              Jeu de données véhicules + zones d'assemblage / marques
  photos.js            Manifeste des photos — GÉNÉRÉ, ne pas éditer
  scoring.js           Filtrage, normalisation, score pondéré (logique pure)
  viewmodel.js         Transforme l'état en données prêtes à afficher (pure)
  format.js            Formatage FR, les 11 critères, les vues de photo
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

## Photos

Les photos de fiche véhicule sont servies **uniquement en AVIF**. À qualité
perçue équivalente, le format pèse 2 à 5 fois moins qu'un JPEG : sur une page
dont le poids est dominé par les images, c'est le levier d'éco-conception le
plus direct. Le carrousel n'utilise aucun JavaScript (défilement natif avec
`scroll-snap`) et les vues hors écran ne sont téléchargées que si l'on fait
défiler jusqu'à elles (`loading="lazy"`).

Le dépôt contient les photos de 14 modèles (6 vues chacun), reprises du projet
[react-electric-vehicles](https://github.com/CNicolas/react-electric-vehicles).
Les autres modèles gardent le gabarit « pas encore de photos ». Veillez à
détenir les droits des photos que vous ajoutez.

### Ajouter des photos

Une seule convention à respecter : **un dossier par véhicule, nommé d'après son
`code` dans [`js/data.js`](js/data.js), et un fichier par vue**.

```
photos/
  tesla-model-y/
    avant.jpg
    profil.jpg
    coffre.jpg
    tableau-de-bord.jpg
    sieges-avant.jpg
    sieges-arriere.jpg
  kia-ev3/
    profil.png
    coffre.webp
```

Puis, une fois pour toutes les voitures :

```bash
tools/to-avif.sh
```

Le script convertit tout ce qui est nouveau ou modifié vers `img/<code>/`, puis
**régénère [`js/photos.js`](js/photos.js)** à partir du contenu réel de `img/`.
Il n'y a donc jamais de code à modifier à la main : déposer les photos, lancer
le script, committer `img/` et `js/photos.js`. Au déploiement suivant, les
photos apparaissent sur les fiches concernées.

Un modèle sans photo garde le gabarit « pas encore de photos », et un `code`
qui ne correspond à aucun véhicule est simplement ignoré à l'affichage.

**Vues reconnues**, dans l'ordre du carrousel : `avant`, `profil`, `arriere`,
`coffre`, `tableau-de-bord`, `sieges-avant`, `sieges-arriere`. C'est le nom du
fichier qui désigne la vue, et il en tire sa légende ainsi que la description
lue par les lecteurs d'écran — les deux vivent dans `PHOTO_VIEWS`
([`js/format.js`](js/format.js)), le seul endroit à toucher pour reformuler un
libellé. Une vue hors liste (`prise-de-charge.jpg`) reste publiée, légendée à
partir de son nom et placée en fin de carrousel.

Le nom du fichier est normalisé : `Sièges Avant.JPG` et `sieges_avant.jpeg`
donnent tous deux `sieges-avant.avif`.

### Détails utiles

- **Formats sources acceptés** : `jpg`, `jpeg`, `png`, `webp`, `avif`. Le reste
  est ignoré avec un message, ce qui permet de laisser traîner un `.txt` ou un
  `.HEIC` dans le dossier sans casser la conversion.
- **Sources déjà en AVIF** : copiées telles quelles si elles ne dépassent pas
  1600 px de large. Les réencoder leur ferait subir une seconde compression
  avec pertes pour un gain de poids nul. Si le réencodage d'une source AVIF
  trop large ressort malgré tout plus lourd que l'originale, c'est l'originale
  qui est conservée.
- **Redimensionnement** : largeur ramenée à 1600 px maximum, jamais agrandie,
  rapport d'origine conservé.
- **Noms de vue anglais** traduits au passage : `front`, `side`, `back`,
  `trunk`, `dashboard`, `frontseats`, `backseats`. Un fichier
  `dashboard.avif` devient donc `tableau-de-bord.avif`.
- **Relances** : une photo déjà convertie et inchangée est sautée
  (`à jour`). `FORCE=1` réencode tout.
- **Un seul modèle** : `tools/to-avif.sh tesla-model-y kia-ev3`.
- **Retirer une photo** : supprimez le `.avif` dans `img/<code>/` et relancez
  le script — le manifeste est reconstruit depuis `img/`, pas depuis `photos/`.
  Le script tourne même sans dossier `photos/` : il se contente alors de
  régénérer le manifeste à partir de `img/`.
- **Qualité et vitesse** : `CRF` (défaut `32`, plus bas = meilleur et plus
  lourd) et `PRESET` (défaut `6`, plus haut = plus rapide).

```bash
CRF=26 PRESET=8 tools/to-avif.sh
```

- **Dépendance** : `ffmpeg` avec un encodeur AV1 (`brew install ffmpeg`).
- `photos/` est dans `.gitignore` : seuls les AVIF sont poussés. Retirez la
  ligne si vous préférez versionner aussi les originaux.

## Crédits

Application et code générés par Claude (Claude Code) à partir d'une session
Claude Design.
