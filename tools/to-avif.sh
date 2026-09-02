#!/usr/bin/env bash
#
# Convertit les img de véhicule en AVIF et régénère js/img.js.
#
#   tools/to-avif.sh                    # tout ce qui est nouveau ou modifié
#   tools/to-avif.sh tesla-model-y      # un ou plusieurs modèles seulement
#
# Déposez les img sources dans `img/<code-du-véhicule>/<vue>.jpg`, le nom
# du fichier donnant la vue. Les vues reconnues sont listées dans PHOTO_VIEWS
# (js/format.js) : avant, profil, arriere, coffre, tableau-de-bord,
# sieges-avant, sieges-arriere. Les noms anglais courants sont traduits au
# passage (front, side, back, trunk, dashboard, frontseats, backseats). Une vue
# hors liste est quand même publiée, légendée à partir de son nom de fichier et
# placée en fin de carrousel.
#
#   img/
#     tesla-model-y/profil.jpg
#     tesla-model-y/coffre.jpg
#     renault-scenic/profil.JPG
#
# Formats acceptés : jpg, jpeg, png, webp, avif. Sortie : img/<code>/<vue>.avif,
# largeur ramenée à 1600 px maximum (jamais agrandie), rapport d'origine
# conservé. Pourquoi AVIF : à qualité perçue équivalente il pèse 2 à 5 fois
# moins qu'un JPEG, et sur une page dont le poids est dominé par les images
# c'est le levier d'éco-conception le plus direct.
#
# Le script termine en réécrivant js/img.js à partir du contenu réel de
# `img/`. Aucun fichier n'est donc à modifier à la main : déposer les img,
# lancer le script, committer `img/` et `js/img.js`.
#
# Dépendance : ffmpeg (brew install ffmpeg), avec un encodeur AV1.
#   CRF=26   qualité (défaut 32, plus bas = meilleur et plus lourd)
#   PRESET=8 vitesse d'encodage (défaut 6, plus haut = plus rapide)
#   FORCE=1  réencode même si l'AVIF est déjà à jour

set -euo pipefail

readonly MAX_WIDTH=1600
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

convert_one() {
  local src="$1" code="$2"
  local ext base slug out dims in_w in_h out_w out_h log

  ext="$(printf '%s' "${src##*.}" | tr '[:upper:]' '[:lower:]')"
  case "$ext" in
    jpg|jpeg|png|webp|avif) ;;
    *) echo "  format ignoré (jpg, jpeg, png, webp, avif attendus) : $(basename "$src")" >&2; return ;;
  esac

  base="$(basename "$src")"
  slug="$(translate_view "$(slugify "${base%.*}")")"
  [ -n "$slug" ] || { echo "  nom de fichier inexploitable, ignoré : $base" >&2; return; }
  out="$OUT_ROOT/$code/$slug.avif"

  # Rien à faire si la sortie est déjà plus récente que sa source.
  if [ -z "$FORCE" ] && [ -f "$out" ] && [ "$out" -nt "$src" ]; then
    echo "  à jour        $slug.avif"
    return
  fi

  dims="$(probe_dims "$src")"
  in_w="${dims%%,*}"
  in_h="${dims##*,}"
  case "$in_w" in ''|*[!0-9]*) echo "  image illisible, ignorée : $base" >&2; return ;; esac
  case "$in_h" in ''|*[!0-9]*) echo "  image illisible, ignorée : $base" >&2; return ;; esac

  mkdir -p "$OUT_ROOT/$code"

  # Une source déjà en AVIF et déjà à la bonne taille est copiée telle quelle :
  # la réencoder ne ferait que lui faire subir une seconde compression avec
  # pertes, pour un gain de poids nul.
  if [ "$ext" = avif ] && [ "$in_w" -le "$MAX_WIDTH" ]; then
    cp "$src" "$out"
    printf '  %-24s %5s Ko  copié tel quel   (%s×%s)\n' \
      "$slug.avif" "$(( $(wc -c < "$src") / 1024 ))" "$in_w" "$in_h"
    return
  fi

  if [ "$in_w" -gt "$MAX_WIDTH" ]; then
    out_w=$MAX_WIDTH
    out_h=$(( in_h * MAX_WIDTH / in_w ))
  else
    out_w=$in_w
    out_h=$in_h
  fi
  # AV1 en 4:2:0 exige des dimensions paires.
  out_w=$(( out_w - out_w % 2 ))
  out_h=$(( out_h - out_h % 2 ))

  # La bibliothèque AV1 écrit sa bannière sur stderr quel que soit -loglevel :
  # on la met de côté et on ne l'affiche qu'en cas d'échec réel.
  log="$(mktemp)"
  if ! ffmpeg -y -hide_banner -loglevel error \
      -i "$src" \
      -vf "scale=${out_w}:${out_h}:flags=lanczos,format=yuv420p" \
      -c:v "$encoder" -crf "$CRF" "${speed_opt[@]}" -frames:v 1 \
      "$out" 2>"$log"; then
    echo "  ÉCHEC         $base" >&2
    cat "$log" >&2
    rm -f "$log"
    return
  fi
  rm -f "$log"

  # Une source AVIF déjà très compressée peut ressortir plus lourde qu'elle
  # n'entrait, malgré la réduction de dimensions : dans ce cas on garde
  # l'originale, qui pèse moins et n'a subi qu'une seule compression.
  if [ "$ext" = avif ] && [ "$(wc -c < "$out")" -ge "$(wc -c < "$src")" ]; then
    cp "$src" "$out"
    printf '  %-24s %5s Ko  original conservé (déjà plus léger que le réencodage)\n' \
      "$slug.avif" "$(( $(wc -c < "$src") / 1024 ))"
    return
  fi

  printf '  %-24s %5s Ko → %4s Ko  (%s×%s)\n' \
    "$slug.avif" "$(( $(wc -c < "$src") / 1024 ))" "$(( $(wc -c < "$out") / 1024 ))" "$out_w" "$out_h"
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
  for src in "${files[@]}"; do
    [ -f "$src" ] && convert_one "$src" "$code"
  done
done

# --- manifeste --------------------------------------------------------------
#
# Reconstruit intégralement à partir de `img/`, jamais du dossier des sources :
# une photo supprimée de `img/` disparaît donc aussi du manifeste.

{
  cat <<'HEADER'
// FICHIER GÉNÉRÉ — ne pas modifier à la main.
//
// Produit par `tools/to-avif.sh`, qui parcourt `img/<code>/` et relève les
// dimensions réelles de chaque AVIF. Pour ajouter des photos : déposez-les
// dans `photos/<code>/<vue>.jpg`, lancez le script, committez. Aucun autre
// fichier n'est à toucher.
//
// Les dimensions sont posées sur le `<img>` : elles réservent la place avant
// le chargement et évitent tout décalage de mise en page.
export const PHOTOS = {
HEADER

  shopt -s nullglob
  entries=()
  for dir in "$OUT_ROOT"/*/; do
    code="$(basename "$dir")"
    rows=()
    for avif in "$dir"*.avif; do
      dims="$(probe_dims "$avif")"
      rows+=("        { file: \"$(basename "$avif")\", w: ${dims%%,*}, h: ${dims##*,} }")
    done
    [ ${#rows[@]} -gt 0 ] || continue
    joined="$(printf '%s,\n' "${rows[@]}")"   # une ligne par photo, virgule finale
    joined="${joined%,}"                        # sauf la dernière
    entries+=("    \"$code\": ["$'\n'"$joined"$'\n'"    ]")
  done
  shopt -u nullglob

  [ ${#entries[@]} -eq 0 ] || printf '%s,\n' "${entries[@]}" | sed '$ s/,$//'

  echo "};"
} > "$MANIFEST"

photo_count=$(find "$OUT_ROOT" -name '*.avif' 2>/dev/null | wc -l | tr -d ' ')
echo
echo "js/photos.js régénéré — $photo_count photo(s). Committez img/ et js/photos.js."
