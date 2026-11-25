#!/usr/bin/env bash
# Nettoie input/forcastedcourses/qurandb des fichiers non nécessaires :
#   - outils Python/JS de génération/OCR (reconstruct, generateTafseer, main, …)
#   - sorties intermédiaires (out/, out_txt/, out604/ hors pages.json)
#   - sources d'entrée (tafseerinput/, inputdata/ hors police + warshData_v2-1.json)
#   - doublons Word/PDF du contenu (.docx/.pdf, le .md est la version canonique)
#   - environnement virtuel et tests
#
# Conserve :
#   - le viewer (index.html, viewer.js, thumn.html, out604/pages.json,
#     inputdata/uthmanic_warsh_v21.ttf, inputdata/warshData_v2-1.json) — déjà copié
#     dans static/quran/
#   - le contenu tafseer : *_*.md et *TafseerMTN.json
#   - les enregistrements audio : recordings/
#   - README.md
#
# Usage :
#   bash scripts/clean-qurandb.sh            # dry-run : liste ce qui serait supprimé
#   bash scripts/clean-qurandb.sh --apply    # supprime réellement
set -euo pipefail

Q="input/forcastedcourses/qurandb"
APPLY=0
for a in "$@"; do
  [[ "$a" == "--apply" ]] && APPLY=1
done

# 1) Dossiers entiers à supprimer
dirs=(
  "$Q/.venv"
  "$Q/out"
  "$Q/out_txt"
  "$Q/tafseerinput"
  "$Q/tests"
  "$Q/inputdata/uthmanic_warsh_v21.fld"
)

# 2) Fichiers racine : outils + doublons + notes dev
root_globs=(
  "$Q"/*.py
  "$Q"/_tmp_verify.js
  "$Q"/*.docx
  "$Q"/*.pdf
  "$Q"/CONTEXT.md
  "$Q"/HANDOFF.md
)

# 3) out604/* sauf pages.json ; inputdata/* sauf 2 fichiers nécessaires
kept_out604=("$Q/out604/pages.json")
kept_inputdata=("$Q/inputdata/uthmanic_warsh_v21.ttf" "$Q/inputdata/warshData_v2-1.json")

# Construit la liste (bash 4+ : mapfile ; sinon via find)
declare -a TARGETS=()

for d in "${dirs[@]}"; do
  [[ -e "$d" ]] && TARGETS+=("$d")
done

for g in "${root_globs[@]}"; do
  for f in $g; do
    [[ -e "$f" ]] && TARGETS+=("$f")
  done
done

# out604 : tout sauf pages.json
while IFS= read -r f; do
  [[ "$f" == *"/pages.json" ]] && continue
  TARGETS+=("$f")
done < <(find "$Q/out604" -type f 2>/dev/null | sort)

# inputdata : tout sauf la police et warshData_v2-1.json
while IFS= read -r f; do
  case "$f" in
    *"/uthmanic_warsh_v21.ttf"|*"/warshData_v2-1.json") continue ;;
  esac
  TARGETS+=("$f")
done < <(find "$Q/inputdata" -type f 2>/dev/null | sort)

TOTAL=0
if [[ "$APPLY" == "1" ]]; then
  for t in "${TARGETS[@]}"; do
    rm -rf "$t"
    echo "supprimé : $t"
  done
  # nettoie les dossiers vides restants
  find "$Q" -type d -empty -delete 2>/dev/null || true
  echo "✅ Nettoyage terminé (${#TARGETS[@]} éléments supprimés)."
else
  echo "DRY-RUN — rien n'est supprimé. Relancer avec --apply pour supprimer."
  echo "-----------------------------------------------"
  for t in "${TARGETS[@]}"; do
    echo "  $t"
    TOTAL=$((TOTAL + 1))
  done
  echo "-----------------------------------------------"
  echo "Total : $TOTAL éléments."
fi
