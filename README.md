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
- **Chaque écran a son adresse** — `#/`, `#/voiture/<code>`, `#/comparer`.
  F5 sur une fiche rouvre cette fiche, les flèches Précédent / Suivant du
  navigateur fonctionnent, et un lien pointe sur un modèle précis.
- **Fonctionne hors ligne** après la première visite, via un service worker.
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
sw.js                 Service worker : cache des photos et de la coquille
css/styles.css         Feuille de styles unique (variables CSS, thème clair/sombre)
photos/<code>/        Photos sources (hors dépôt), converties par le script
img/<code>/           Photos publiées, en AVIF (voir « Photos »)
tools/to-avif.sh       Conversion vers AVIF + génération de js/photos.js
js/
  app.js               État applicatif, actions, rendu
  router.js            Lecture et écriture de la route dans le hash d'URL
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

## URL et navigation

Chaque écran a son adresse, portée par le **hash** :

```
#/                        classement
#/voiture/tesla-model-y   fiche d'un modèle
#/comparer                tableau de comparaison
```

Le hash plutôt que le chemin, parce que le site est publié sur GitHub Pages :
un serveur de fichiers statiques répondrait 404 sur `/voiture/tesla-model-y`,
faute de pouvoir réécrire vers `index.html`. Le hash n'étant jamais envoyé au
serveur, F5 recharge toujours `index.html`, qui relit la route et redessine le
bon écran.

Les réglages voyagent dans la partie requête du hash, donc un lien partagé
transporte l'écran **et** la configuration :

```
#/voiture/kia-ev6?cfg=<base64>
```

Ils ne sont lus qu'au démarrage : ensuite ils vivent dans l'état et le
`localStorage`, et le hash n'en est qu'un reflet, réécrit avec
`history.replaceState` — bouger un curseur n'empile donc pas d'entrée
d'historique, seul un changement d'écran en crée une. Les anciens liens
`#cfg=...`, sans chemin, restent compris et sont normalisés au chargement.

Un `code` de modèle inconnu (lien périmé, véhicule retiré du jeu de données)
retombe sur le classement et disparaît de la barre d'adresse, plutôt que
d'afficher la fiche d'un autre véhicule.

## Photos

Les photos de fiche véhicule sont servies **uniquement en AVIF**. À qualité
perçue équivalente, le format pèse 2 à 5 fois moins qu'un JPEG : sur une page
dont le poids est dominé par les images, c'est le levier d'éco-conception le
plus direct. Le carrousel n'utilise aucun JavaScript (défilement natif avec
`scroll-snap`).

Trois mécanismes se complètent pour ne transférer que le strict nécessaire.

**Rien au démarrage.** L'écran fiche n'est construit qu'à l'ouverture d'un
modèle : une visite qui reste sur le classement ne télécharge aucune photo. Sur
une fiche, seule la première vue est chargée (`fetchpriority="high"`) ; les
cinq autres attendent qu'on fasse défiler jusqu'à elles (`loading="lazy"`).

**Plusieurs largeurs, une seule téléchargée.** Le carrousel s'affiche dans un
cadre de 428 px CSS au maximum, soit 428 px sur un écran 1×, 856 px en 2×. Une
photo unique de 1600 px fait donc télécharger jusqu'à treize fois trop de
pixels, aussitôt jetés. Chaque vue est publiée en 448 / 896 / 1344 px (selon ce
que la source permet) et décrite dans un `srcset` ; le navigateur n'en prend
qu'une, celle qui correspond à son écran. Toutes sont recadrées en 16/10 à la
génération : le CSS applique de toute façon `object-fit: cover`, autant ne pas
transférer les pixels hors cadre. Pour une fiche complète de 6 vues :

| | avant | après |
| --- | --- | --- |
| écran 1× | 494 Ko | 92 Ko |
| écran 2× | 494 Ko | 252 Ko |

**Cache hors ligne.** GitHub Pages impose `Cache-Control: max-age=600` sur tous
les fichiers et ne se configure pas : passé dix minutes, le navigateur revalide
chaque photo, soit un aller-retour réseau par image même quand la réponse est
un 304 vide. [`sw.js`](sw.js) est le seul moyen, sur cet hébergement, de rendre
une seconde visite réellement gratuite — les photos y sont mises en cache sans
revalidation, le reste en « cache d'abord, mise à jour en arrière-plan ». Un
déploiement met donc au plus une visite à apparaître. Le nom de fichier porte
la largeur (`avant-896.avif`) : une photo remplacée à la même largeur garderait
son nom, d'où le numéro de version en tête de `sw.js`, à incrémenter dans ce
cas.

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
- **Largeurs produites** : 448, 896 et 1344 px, recadrées en 16/10. Une source
  trop petite pour un palier ne le produit pas — agrandir n'ajoute aucun détail
  et ne fait que gonfler le fichier ; une source qui tombe entre deux paliers
  ajoute un dernier fichier à sa taille réelle, pour ne pas priver les écrans
  denses des pixels disponibles. Une photo de 640 px donne donc `448` et `640`.
- **Nettoyage** : un modèle qui a un dossier source voit son dossier
  `img/<code>/` nettoyé — les AVIF qui ne viennent pas d'être produits sont
  supprimés (photo retirée, vue renommée, largeur disparue). Les modèles dont
  les AVIF ont été déposés directement dans `img/`, sans dossier source, ne
  sont jamais touchés, mais doivent suivre la convention
  `<vue>-<largeur>.avif` pour entrer dans le manifeste.
- **Noms de vue anglais** traduits au passage : `front`, `side`, `back`,
  `trunk`, `dashboard`, `frontseats`, `backseats`. Un fichier
  `dashboard.jpg` devient donc `tableau-de-bord-896.avif` et ses variantes.
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
