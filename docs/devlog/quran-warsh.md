# Cours « Quran — Riwayat Warsh » (viewer + tafseer)

**Statut** : ✅ livré (production) · **Date** : 2026-11-25

## Objectif
Cours de Mushaf (Warsh) avec viewer 604 pages, **tafseer éditable par l'admin** et
**affichage des pages du Mushaf** contenant chaque sourate (pas de synchro au verset près).

## Architecture

- **Viewer** : `static/quran/` (index.html + viewer.js + thumn.html + `out604/pages.json`
  + police + `warshData_v2-1.json`), servi à `/quran/` (RTL).
- **D1** (`quran_surahs`, migration `0009`) : métadonnées des 114 sourates (noms,
  `start_page`, `end_page`, clé R2 du tafseer).
- **R2** (`geberlms-files`) : texte du tafseer (markdown) sous `quran/tafseer/<n>.md`
  — choisi car le tafseer dépasse la limite de taille des statements SQL D1
  (ex. Al-Baqarah ≈ 576 Ko).
- **Domaine** `src/lib/domain/quran.ts` : `computePageRanges` (plages de pages par
  sourate) + `pageNumbers` — testé (259 tests au total).

## Fonctionnalités

1. **Tafseer public** : `/quran/tafseer` (liste des sourates) et
   `/quran/tafseer/[n]` (tafseer rendu + bouton « Ouvrir le Mushaf » + **grille des
   pages** `quran/#p=N` qui contiennent la sourate).
2. **Édition admin** : `/admin/quran` (liste) et `/admin/quran/[n]` (éditeur markdown,
   sauvegarde vers R2). Entrée « Quran » dans la sidebar admin.
3. **Cours catalogue** : `content/quran-warsh.json` importé → cours public
   « القرآن الكريم — رواية ورش » (module Mushaf + module Tafseer, liens vers le viewer).

## Import

```bash
npx tsx scripts/import-quran.ts [--remote]   # D1 (sourates) + R2 (tafseer)
```

Idempotent (upsert + ré-upload R2). Source : `input/forcastedcourses/qurandb/`.

## Vérifications

- `npm run check` 0/0 · `npm test` 259 verts · `npm run build` OK · `npm run smoke` 3/3.
- Production : `/quran/`, `/quran/tafseer`, `/quran/tafseer/1`, éditeur admin vérifiés
  (lecture/écriture R2 bout en bout).

## Reste possible

- 18 sourates ont un tafseer (1-3 + 100-114) ; les autres à compléter par l'admin.
- Les enregistrements audio (`recordings/`) ne sont pas encore intégrés.
- Vraie vignette de couverture (`thumbnail_key` à déposer dans R2).
