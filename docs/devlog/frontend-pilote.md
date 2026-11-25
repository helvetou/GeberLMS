# Pilote frontend « super pro » — écrans de référence

**Statut** : ✅ livré (production) · **Date** : 2026-11-25

## Objectif

Livrer 4 écrans de référence pour valider la direction visuelle « super pro »
avant de lancer la montée en niveau complète (blocs A→E : admin superforms/data-tables,
lecteur enrichi, polish responsive/accessibilité).

## Écrans redessinés

1. **`/login`** — split layout : panneau de marque (dégradé indigo→violet, lead,
   tagline) + formulaire centré, état « connexion… » (spinner) via `use:enhance`.
2. **`/catalog`** — hero (titre + sous-titre), barre de filtres dans une carte
   (recherche avec icône + sélecteurs), grille de **cartes de cours enrichies**
   (vignette dégradée, badges, prix, « en savoir plus » au survol), état vide.
3. **`/catalog/[slug]`** — détail cours : couverture dégradée, badges, prix,
   programme en **accordéon** avec icônes par type de leçon.
4. **`/learner`** (dashboard) — en-tête de bienvenue, **stat-cards avec icônes**
   et tons colorés, carte « reprendre » avec **anneau de progression** (SVG),
   liste de cours avec **barres de progression** (composant shadcn `Progress`),
   fil d'activité avec icônes, section dépôt en carte.

## Composants partagés créés (`src/lib/components/`)

- `page-header.svelte` — titre + sous-titre + emplacement d'actions.
- `empty-state.svelte` — icône + titre + description (état vide).
- `stat-card.svelte` — icône + libellé + valeur + ton (primary/success/warning/default).
- `course-card.svelte` — carte de cours du catalogue (vignette dégradée déterministe,
  badges, prix, affordance au survol).

## Direction visuelle retenue

- Typographie : **Sora** (titres) + **Inter Variable** (corps).
- Couleurs : base `stone`, primaire indigo, succès emerald — conservées (`app.css`).
- Cartes : bordures fines, élévation au survol (`-translate-y` + ombre).
- Micro-interactions : spinner de soumission, transitions hover, `backdrop-blur` sur l'en-tête.
- **RTL** : vérifié sur `/login` et `/catalog` en arabe.

## Vérifications

- `npm run check` : **0 erreur / 0 warning** · `npm run build` : OK.
- `npm test` : **255 tests verts** (couverture domaine inchangée 98,79 % — aucun
  changement de logique métier).
- **Production** : déployé ; `npm run smoke` 3/3 (latence max 249 ms).
- Captures Playwright (desktop / mobile / arabe) : `test-results/pilote/` (8 fichiers).

## Décisions / points d'attention

- **Skeletons** non introduits ici (SSR = données présentes au rendu) ; prévus pour
  les écrans à navigation client (admin → data-tables) dans le bloc B/C.
- **Vignettes de couverture** : dégradé déterministe par catégorie (les `cover_image`
  sont des clés R2, pas des URL publiques) ; vraies images R2 à brancher ultérieurement.
- **Local dev lent** : le binding `AI` distant fait traîner `npm run dev` (getPlatformProxy)
  ; les captures ont donc été prises sur la production déployée.

## Prochaine étape

Validation utilisateur du pilote → puis lancement des blocs **A → B → C → D → E**
(reset-password, tutelle, manuel, admin pro, lecteur pro, polish).
