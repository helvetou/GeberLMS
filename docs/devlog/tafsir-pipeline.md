# Pipeline de génération du tafsir (Google Doc source de vérité)

**Statut** : ✅ livré — 79 sourates (36→114) · **Date** : 2026-11-27

## Objectif
Produire le tafsir des sourates de `vol4MTN.rtf` en deux formats, à partir de deux
sources :

- **Sources** :
  - `quran_hafs_alignedwithTafseer.json` → **versets Hafs** (par sourate/ayah).
  - `vol4MTN.rtf` (texte brut arabe) → **explication** + **notes de bas de page**
    (sourates **36 → 114**, en ordre).
- **Formats générés** :
  - **`.docx`** — importable dans Google Docs (source de vérité pour correction).
  - **`.html`** — autonome, **Noto Naskh Arabic 14 pt**, accessible navigateur, qui
    **remplace** le tafseer markdown dans le cours Quran Warsh.

## Règles de mise en forme
- **Verset** → **gras** (Hafs, depuis le JSON).
- **Explication** → noir (normal).
- **Notes de bas de page** → **inline, entre parenthèses, en gris**, à la place des
  renvois `(١)`/`(1)` (chiffres arabes/persans normalisés).

## Script CLI

```bash
python3 scripts/generate-tafsir.py --list                          # liste les 79 sourates détectées
python3 scripts/generate-tafsir.py --surah 114 --out output/tafsir # une sourate (.docx + .html)
python3 scripts/generate-tafsir.py --all --out output/tafsir       # les 79 sourates 36→114
python3 scripts/generate-tafsir.py --all --upload --remote         # + upload des .html vers R2
```

- `getQuranTafseerHtml` (serveur) lit `quran/tafseer/<n>.html` dans R2 ; la route
  `/quran/tafseer/[surah]` sert cette version en `<iframe>` (sinon repli markdown).
- Le lien « Tafsir » du viewer Mushaf s'affiche pour les sourates **36 → 114**
  (`static/quran/viewer.js`), i.e. celles présentes dans `vol4MTN.rtf`.

## Normalisation du texte (matching versets RTF ↔ Hafs JSON)
Le texte de verset du RTF (orthographe courante) diffère du JSON (orthographe du
moushaf de Médine). Pour reconnaître le bloc de verset (et l'ignorer, car les versets
proviennent du JSON), `normalize_verse` réduit les deux à leurs consonnes :

- retire les diacritiques, le tatweel et l'alef suscrit `ٰ` (catégorie Mn) ;
- **supprime toutes les formes d'alef** (`أ إ آ ٱ ا`) — absorbe `منٰفقون` vs `منافقون` ;
- **supprime les hamza** (`ء` isolée, `ئ` sur ya, `ؤ` sur waw) et les petits `ۥ ۦ` ;
- unifie `ى/ي → ي`, `و → و`.

## Détection des sourates (`find_surah_starts`)
Le repère fiable de début de sourate est la ligne `سورة <nom>` (nom seul, sans plage
de versets) ; les en-têtes `سورة <nom> X-Y` sont des en-têtes de page. Le mapping est
positionnel (36 + rang), la validation se fait par le nom normalisé.

Anomalies OCR gérées :
- `سورة غافر (۱)` — marqueur de note OCR `(۱)` collé au nom (retiré avant le test de chiffres) ;
- `سورة الممتحنة` en doublon (lignes consécutives) — dédupliqué ;
- `سورة محمد ﷺ` — honorifique `ﷺ` (U+FDFA) retiré (`header_probe`) pour reconnaître
  les en-têtes de page `سورة محمد ﷺ ۹-۱۳` et ne pas fusionner les pages ;
- notes en format `۲) texte` (parenthèse ouvrante perdue) — `FOOTNOTE_START` accepte
  `n) texte` et le préfixe `. `.

## Workflow « Google Doc = source de vérité »
1. Corriger le **Google Doc** (importé depuis le `.docx`).
2. Relancer `generate-tafsir.py --all --upload --remote` pour **régénérer les HTML** à
   partir du contenu à jour (l'export Google Doc peut remplacer la source texte).

## Fichiers versionnés
- `scripts/generate-tafsir.py` + `output/tafsir/<n>.html` (36→114) sont versionnés.
- `output/tafsir/<n>.docx` **hors dépôt** (`.gitignore` `output/tafsir/*.docx`) : ce
  sont les sources Google Doc locales.

## Vérifications
- `npm test` 259/259 · `npm run build` OK · `npm run smoke` 3/3 (flaky « fetch failed »
  transitoire sur le 1er `/login`, indépendant de ce travail).
- `/quran/tafseer/<n>` (36→114) sert l'HTML généré (Noto Naskh 14 pt, versets gras,
  notes grises inline).

## Limites connues (OCR du RTF)
- Marqueurs d'ayah et numéros de notes mélangent chiffres arabes/persans/latins.
- Le tafseer suit l'orthographe du livre (pas de synchro verset-à-verset).
- Le découpage par page s'appuie sur les en-têtes `سورة <nom> X-Y` ; quelques
  faux positifs (`سورة الأعراف]…`, `سورة الرحمن فقال…`) sont filtrés par les motifs
  `،]` et `فقال`.
