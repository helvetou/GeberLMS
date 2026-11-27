# Pipeline de génération du tafsir (Google Doc source de vérité)

**Statut** : ✅ test validé sur An-Nas (114) · **Date** : 2026-11-27

## Objectif
Produire le tafsir d'une sourate en deux formats, à partir de deux sources :

- **Sources** :
  - `quran_hafs_alignedwithTafseer.json` → **versets Hafs** (par sourate/ayah).
  - `vol4MTN.rtf` (texte brut arabe) → **explication** + **notes de bas de page**.
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
python3 scripts/generate-tafsir.py --surah 114 --out output/tafsir            # génère .docx + .html
python3 scripts/generate-tafsir.py --surah 114 --upload --remote              # + upload HTML vers R2
```

- `getQuranTafseerHtml` (serveur) lit `quran/tafseer/<n>.html` dans R2 ; la route
  `/quran/tafseer/[surah]` sert cette version en `<iframe>` (sinon repli markdown).

## Workflow « Google Doc = source de vérité »
1. Corriger le **Google Doc** (importé depuis le `.docx`).
2. Relancer `generate-tafsir.py --upload --remote` pour **régénérer l'HTML** à partir
   du contenu à jour (le script lit les sources `json`/`rtf` ; l'export Google Doc
   peut remplacer la source texte).

## Vérifications
- `npm run check` 0/0 · `npm run build` OK · `npm run smoke` 3/3.
- `/quran/tafseer/114` sert l'HTML généré (Noto Naskh 14 pt, versets gras, 13 notes grises).

## Limites connues (OCR du RTF)
- Marqueurs d'ayah et numéros de notes mélangent chiffres arabes/persans/latins.
- Lignes de verset du RTF ignorées (les versets proviennent du JSON, Hafs).
- Le tafseer suit l'orthographe du livre (pas de synchro verset-à-verset).
