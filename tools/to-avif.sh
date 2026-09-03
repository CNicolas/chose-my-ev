#!/usr/bin/env bash
#
# Convertit les photos de véhicule en AVIF multi-résolutions et régénère
# js/photos.js.
#
#   tools/to-avif.sh                    # tout ce qui est nouveau ou modifié
#   tools/to-avif.sh tesla-model-y      # un ou plusieurs modèles seulement
#
# Déposez les photos sources dans `photos/<code-du-véhicule>/<vue>.jpg`, le nom
# du fichier donnant la vue. Les vues reconnues sont listées dans PHOTO_VIEWS
# (js/format.js) : avant, profil, arriere, coffre, tableau-de-bord,
# sieges-avant, sieges-arriere. Les noms anglais courants sont traduits au
# passage (front, side, back, trunk, dashboard, frontseats, backseats). Une vue
# hors liste est quand même publiée, légendée à partir de son nom de fichier et
# placée en fin de carrousel.
#
#   photos/
#     tesla-model-y/profil.jpg
#     tesla-model-y/coffre.jpg
#     renault-scenic/profil.JPG
#
# Formats acceptés : jpg, jpeg, png, webp, avif.
#
# Sortie : `img/<code>/<vue>-<largeur>.avif`, une variante par largeur de
# WIDTHS, recadrée au format d'affichage (16/10). Pourquoi plusieurs largeurs :
# le carrousel s'affiche dans un cadre de 428 px CSS au maximum, soit 428 px
# sur un écran 1×, 856 px en 2× et 1284 px en 3×. Servir un seul fichier de
# 1600 px fait télécharger jusqu'à 13 fois trop de pixels, aussitôt jetés.
# `srcset` laisse le navigateur prendre la variante qui correspond à son écran.
#
# Pourquoi recadrer ici plutôt que de laisser faire le CSS : la diapositive
# applique `object-fit: cover` en 16/10 ; les pixels hors cadre sont
# téléchargés puis jetés. Recadrer à la source donne un rendu identique pour
# 10 à 25 % d'octets en moins.
#
# Pourquoi AVIF : à qualité perçue équivalente il pèse 2 à 5 fois moins qu'un
# JPEG, et sur une page dont le poids est dominé par les images c'est le levier
# d'éco-conception le plus direct.
#
# Le script termine en réécrivant js/photos.js à partir du contenu réel de
# `img/`. Aucun fichier n'est donc à modifier à la main : déposer les photos,
# lancer le script, committer `img/` et `js/photos.js`.
#
# Un modèle qui a un dossier source voit son dossier `img/<code>/` nettoyé :
# les AVIF qui ne viennent pas d'être produits sont supprimés (photo retirée,
# ancien nom de fichier, ancienne largeur). Les modèles dont les AVIF ont été
# déposés directement dans `img/` — sans dossier source — ne sont jamais
# touchés, mais doivent respecter la convention `<vue>-<largeur>.avif` pour
# entrer dans le manifeste.
#
# Dépendance : ffmpeg (brew install ffmpeg), avec un encodeur AV1.
#   CRF=26   qualité (défaut 32, plus bas = meilleur et plus lourd)
#   PRESET=8 vitesse d'encodage (défaut 6, plus haut = plus rapide)
#   FORCE=1  réencode même si les AVIF sont déjà à jour

set -euo pipefail

# Largeurs publiées : 1×, 2× et 3× la largeur d'affichage maximale (428 px),
# arrondies au multiple de 16 supérieur. Doivent rester synchronisées avec
# l'attribut `sizes` posé dans js/viewmodel.js.
WIDTHS=(448 896 1344)
WIDTHS_MAX=1344

# Format d'affichage du carrousel, identique à l'`aspect-ratio` de
# `.photo-slide__img` (css/styles.css) et à PHOTO_ASPECT (js/format.js).
readonly ASPECT_W=16
readonly ASPECT_H=10

readonly CRF="${CRF:-32}"
readonly PRESET="${PRESET:-6}"
readonly FORCE="${FORCE:-}"

# Le script vit dans tools/, tout le reste est relatif à la racine du dépôt.
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly SRC_ROOT="$root/photos"
readonly OUT_ROOT="$root/img"
readonly MANIFEST="$root/js/photos.js"

command -v ffmpeg >/dev/null 2>&1 || {
  echo "ffmpeg est introuvable. Installez-le avec : brew install ffmpeg" >&2
  exit 1
}

# Chaque encodeur AV1 nomme différemment son curseur vitesse / compression.
encoder=""
speed_opt=()
for candidate in libsvtav1 libaom-av1 librav1e; do
  if ffmpeg -hide_banner -encoders 2>/dev/null | grep -q " ${candidate} "; then
    encoder="$candidate"
    break
  fi
done
case "$encoder" in
  libsvtav1)  speed_opt=(-preset "$PRESET") ;;
  libaom-av1) speed_opt=(-cpu-used "$PRESET" -row-mt 1) ;;
  librav1e)   speed_opt=(-speed "$PRESET") ;;
  *)
    echo "Aucun encodeur AV1 dans ce ffmpeg (libsvtav1, libaom-av1 ou librav1e attendu)." >&2
    exit 1
    ;;
esac

# Nom de fichier -> identifiant de vue : accents aplatis, minuscules, tout ce
# qui n'est ni lettre ni chiffre devient un tiret. "Sièges Avant.JPG" -> "sieges-avant".
#
# Les accents sont remplacés un caractère à la fois : une classe comme [àâä] ne
# fonctionne pas en UTF-8, où chaque lettre accentuée occupe deux octets et où
# `à` et `â` partagent leur premier octet — la classe couperait la lettre en deux.
readonly ACCENTS="àa áa âa ãa äa åa ÀA ÁA ÂA ÃA ÄA ÅA \
                  èe ée êe ëe ÈE ÉE ÊE ËE ìi íi îi ïi ÌI ÍI ÎI ÏI \
                  òo óo ôo õo öo ÒO ÓO ÔO ÕO ÖO ùu úu ûu üu ÙU ÚU ÛU ÜU \
                  çc ÇC ñn ÑN ÿy ŸY"

# Noms de vue anglais rencontrés dans d'autres projets, traduits vers les
# identifiants attendus par PHOTO_VIEWS (js/format.js).
readonly VIEW_ALIASES="front:avant side:profil back:arriere trunk:coffre \
                       dashboard:tableau-de-bord boot:coffre \
                       frontseats:sieges-avant front-seats:sieges-avant \
                       backseats:sieges-arriere back-seats:sieges-arriere \
                       rearseats:sieges-arriere rear-seats:sieges-arriere"

translate_view() {
  local slug="$1" alias
  for alias in $VIEW_ALIASES; do
    [ "$slug" = "${alias%%:*}" ] && { printf '%s' "${alias#*:}"; return; }
  done
  printf '%s' "$slug"
}

slugify() {
  local text="$1" pair

  # Dans chaque paire, la cible est le dernier caractère (toujours ASCII, donc
  # un seul octet) et l'accentué est tout ce qui précède : ce découpage reste
  # juste même quand le script tourne hors d'une locale UTF-8.
  for pair in $ACCENTS; do
    text="${text//${pair%?}/${pair: -1}}"
  done

  text="$(printf '%s' "$text" | tr '[:upper:]' '[:lower:]' | tr -c 'a-z0-9' '-')"
  while [[ "$text" == *--* ]]; do text="${text//--/-}"; done
  text="${text#-}"; text="${text%-}"
  printf '%s' "$text"
}

# Dimensions d'une image, sous la forme "largeur,hauteur".
#
# ffprobe ajoute un champ vide quand le flux porte des données annexes
# ("1800,1200,") : on ne garde que la première ligne, sans virgule finale.
probe_dims() {
  local dims
  dims="$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "$1")"
  dims="${dims%%$'\n'*}"
  printf '%s' "${dims%,}"
}

# Largeurs à produire pour une source donnée, de la plus petite à la plus
# grande. On ne dépasse jamais ce que la source contient réellement :
# agrandir n'ajoute aucun détail et ne fait que gonfler le fichier.
#
# Une source trop petite pour la plus petite largeur est publiée à sa taille
# réelle ; une source qui tombe entre deux paliers ajoute un dernier fichier à
# sa taille réelle, pour ne pas priver les écrans denses des pixels
# disponibles.
pick_widths() {
  local usable="$1" w picked=() largest=0
  for w in "${WIDTHS[@]}"; do
    [ "$w" -le "$usable" ] && { picked+=("$w"); largest="$w"; }
  done
  if [ ${#picked[@]} -eq 0 ]; then
    picked=("$usable")
  elif [ "$usable" -gt "$largest" ] && [ "$usable" -lt "$WIDTHS_MAX" ]; then
    picked+=("$usable")
  fi
  printf '%s\n' "${picked[@]}"
}

# Largeurs reçues en arguments -> "448, 896, 1344" : triées par valeur, jamais
# par ordre alphabétique.
sorted_csv() {
  printf '%s\n' "$@" | sort -n | paste -sd, - | sed 's/,/, /g'
}

# Toutes les sorties d'une vue sont-elles plus récentes que la source ?
outputs_fresh() {
  local src="$1" dir="$2" slug="$3" w
  shift 3
  for w in "$@"; do
    [ -f "$dir/$slug-$w.avif" ] && [ "$dir/$slug-$w.avif" -nt "$src" ] || return 1
  done
  return 0
}

# Liste des fichiers produits pour le modèle en cours, pour le nettoyage final.
produced=()

convert_one() {
  local src="$1" code="$2"
  local ext base slug dir dims in_w in_h usable widths=() w out_w out_h log

  ext="$(printf '%s' "${src##*.}" | tr '[:upper:]' '[:lower:]')"
  case "$ext" in
    jpg|jpeg|png|webp|avif) ;;
    *) echo "  format ignoré (jpg, jpeg, png, webp, avif attendus) : $(basename "$src")" >&2; return ;;
  esac

  base="$(basename "$src")"
  slug="$(translate_view "$(slugify "${base%.*}")")"
  [ -n "$slug" ] || { echo "  nom de fichier inexploitable, ignoré : $base" >&2; return; }
  dir="$OUT_ROOT/$code"

  dims="$(probe_dims "$src")"
  in_w="${dims%%,*}"
  in_h="${dims##*,}"
  case "$in_w" in ''|*[!0-9]*) echo "  image illisible, ignorée : $base" >&2; return ;; esac
  case "$in_h" in ''|*[!0-9]*) echo "  image illisible, ignorée : $base" >&2; return ;; esac

  # Largeur réellement exploitable une fois la source recadrée en 16/10 : une
  # photo 4/3 perd de la hauteur, une photo panoramique perd de la largeur.
  usable=$(( in_h * ASPECT_W / ASPECT_H ))
  [ "$usable" -le "$in_w" ] || usable="$in_w"
  usable=$(( usable - usable % 2 ))
  [ "$usable" -ge 2 ] || { echo "  image trop petite, ignorée : $base" >&2; return ; }

  widths=($(pick_widths "$usable"))
  for w in "${widths[@]}"; do produced+=("$slug-$w.avif"); done

  if [ -z "$FORCE" ] && outputs_fresh "$src" "$dir" "$slug" "${widths[@]}"; then
    printf '  %-24s à jour (%s)\n' "$slug" "$(IFS=/; echo "${widths[*]}")"
    return
  fi

  mkdir -p "$dir"

  for w in "${widths[@]}"; do
    out_w="$w"
    out_h=$(( w * ASPECT_H / ASPECT_W ))
    # AV1 en 4:2:0 exige des dimensions paires.
    out_w=$(( out_w - out_w % 2 ))
    out_h=$(( out_h - out_h % 2 ))

    # `force_original_aspect_ratio=increase` puis `crop` : la source est
    # agrandie jusqu'à couvrir le cadre, puis rognée au centre — exactement ce
    # que fait `object-fit: cover`, mais avant le transfert réseau.
    #
    # La bibliothèque AV1 écrit sa bannière sur stderr quel que soit -loglevel :
    # on la met de côté et on ne l'affiche qu'en cas d'échec réel.
    log="$(mktemp)"
    if ! ffmpeg -y -hide_banner -loglevel error \
        -i "$src" \
        -vf "scale=${out_w}:${out_h}:force_original_aspect_ratio=increase:flags=lanczos,crop=${out_w}:${out_h},format=yuv420p" \
        -c:v "$encoder" -crf "$CRF" "${speed_opt[@]}" -frames:v 1 \
        "$dir/$slug-$w.avif" 2>"$log"; then
      echo "  ÉCHEC         $base ($w px)" >&2
      cat "$log" >&2
      rm -f "$log"
      continue
    fi
    rm -f "$log"
  done

  # Bilan par vue : poids source -> somme des variantes publiées.
  local total=0 f
  for w in "${widths[@]}"; do
    f="$dir/$slug-$w.avif"
    [ -f "$f" ] && total=$(( total + $(wc -c < "$f") ))
  done
  printf '  %-24s %5s Ko → %4s Ko en %s variante(s)  (%s)\n' \
    "$slug" "$(( $(wc -c < "$src") / 1024 ))" "$(( total / 1024 ))" \
    "${#widths[@]}" "$(IFS=/; echo "${widths[*]}")"
}

# Supprime d'un dossier de sortie les AVIF qui ne viennent pas d'être produits :
# photo retirée des sources, vue renommée, largeur qui a disparu de WIDTHS.
prune_stale() {
  local dir="$1" avif name keep produced_name
  [ -d "$dir" ] || return 0
  shopt -s nullglob
  for avif in "$dir"/*.avif; do
    name="$(basename "$avif")"
    keep=""
    for produced_name in ${produced[@]+"${produced[@]}"}; do
      [ "$name" = "$produced_name" ] && { keep=1; break; }
    done
    [ -n "$keep" ] || { rm -f "$avif"; echo "  supprimé      $name"; }
  done
  shopt -u nullglob
}

# --- conversion -------------------------------------------------------------

# Un dossier de sources absent ou vide n'est pas une erreur : le manifeste est
# quand même régénéré, ce qui permet de reprendre la main après avoir déposé ou
# retiré des AVIF directement dans img/.
codes=()
if [ ! -d "$SRC_ROOT" ]; then
  echo "Pas de dossier $SRC_ROOT : rien à convertir." >&2
  echo "Pour en ajouter, rangez vos photos par modèle : photos/<code-du-véhicule>/<vue>.jpg" >&2
elif [ $# -gt 0 ]; then
  codes=("$@")
else
  shopt -s nullglob
  for dir in "$SRC_ROOT"/*/; do
    codes+=("$(basename "$dir")")
  done
  shopt -u nullglob
  [ ${#codes[@]} -gt 0 ] || echo "Aucun modèle dans $SRC_ROOT : rien à convertir." >&2
fi

for code in ${codes[@]+"${codes[@]}"}; do
  dir="$SRC_ROOT/$code"
  [ -d "$dir" ] || { echo "$code : pas de dossier $dir, ignoré" >&2; continue; }
  echo "$code"
  shopt -s nullglob
  files=("$dir"/*)
  shopt -u nullglob
  [ ${#files[@]} -gt 0 ] || { echo "  (dossier vide)"; continue; }
  produced=()
  for src in "${files[@]}"; do
    [ -f "$src" ] && convert_one "$src" "$code"
  done
  prune_stale "$OUT_ROOT/$code"
done

# --- manifeste --------------------------------------------------------------
#
# Reconstruit intégralement à partir de `img/`, jamais du dossier des sources :
# une photo supprimée de `img/` disparaît donc aussi du manifeste.
#
# Les fichiers sont regroupés par vue : `avant-448.avif` et `avant-896.avif`
# donnent une seule entrée `{ view: "avant", w: [448, 896] }`. Les hauteurs ne
# sont pas relevées — toutes les variantes sont en 16/10, ratio porté une seule
# fois par PHOTO_ASPECT (js/format.js).

{
  cat <<'HEADER'
// FICHIER GÉNÉRÉ — ne pas modifier à la main.
//
// Produit par `tools/to-avif.sh`, qui parcourt `img/<code>/` et regroupe les
// variantes de chaque vue. Pour ajouter des photos : déposez-les dans
// `photos/<code>/<vue>.jpg`, lancez le script, committez. Aucun autre fichier
// n'est à toucher.
//
// `w` liste les largeurs publiées d'une même vue, de la plus petite à la plus
// grande : elles alimentent le `srcset` du carrousel, qui laisse le navigateur
// télécharger la seule variante adaptée à son écran. Toutes sont recadrées au
// format PHOTO_ASPECT (16/10), qui fournit la hauteur et réserve la place
// avant le chargement — donc aucun décalage de mise en page.
export const PHOTOS = {
HEADER

  shopt -s nullglob
  entries=()
  for dir in "$OUT_ROOT"/*/; do
    code="$(basename "$dir")"

    # Un passage unique sur les fichiers du dossier : le glob les trie par nom,
    # donc les variantes d'une même vue se suivent et le groupe se ferme au
    # changement de vue. Les largeurs, elles, sont retriées numériquement — le
    # tri du glob est alphabétique et placerait "1344" avant "448".
    rows=()
    view=""
    widths_list=""
    for avif in "$dir"*.avif; do
      name="$(basename "$avif" .avif)"
      width="${name##*-}"
      case "$width" in
        ''|*[!0-9]*)
          echo "  $code/$name.avif ne suit pas la convention <vue>-<largeur>.avif, ignoré" >&2
          continue ;;
      esac
      if [ "${name%-*}" != "$view" ]; then
        [ -z "$view" ] || rows+=("        { view: \"$view\", w: [$(sorted_csv $widths_list)] }")
        view="${name%-*}"
        widths_list="$width"
      else
        widths_list="$widths_list $width"
      fi
    done
    [ -z "$view" ] || rows+=("        { view: \"$view\", w: [$(sorted_csv $widths_list)] }")

    [ ${#rows[@]} -gt 0 ] || continue
    joined="$(printf '%s,\n' "${rows[@]}")"   # une ligne par vue, virgule finale
    joined="${joined%,}"                        # sauf la dernière
    entries+=("    \"$code\": ["$'\n'"$joined"$'\n'"    ]")
  done
  shopt -u nullglob

  [ ${#entries[@]} -eq 0 ] || printf '%s,\n' "${entries[@]}" | sed '$ s/,$//'

  echo "};"
} > "$MANIFEST"

photo_count=$(find "$OUT_ROOT" -name '*.avif' 2>/dev/null | wc -l | tr -d ' ')
echo
echo "js/photos.js régénéré — $photo_count fichier(s) AVIF. Committez img/ et js/photos.js."
