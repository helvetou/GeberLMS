# Montée en niveau frontend & fonctionnel (blocs A→E)

**Statut** : ✅ livré · **Date** : 2026-11-25 · **Précédé par** : `frontend-pilote.md` (validé).

Objectif : après validation du pilote, livrer le fonctionnel manquant (reset de mot de
passe, tutelle, manuel) et généraliser le rendu « pro » (admin, lecteur, polish).

## Bloc A — Fonctionnel

- `scripts/reset-password.ts` + `npm run db:reset-password[::remote]` : réinitialise le
  mot de passe d'un compte par email (admin/tuteur/apprenant) — `UPDATE … WHERE email`.
- **Interface de tutelle** `/admin/guardianships` : `server/guardianship.ts`
  (`listGuardianships`, `linkGuardianship` idempotent, `unlinkGuardianship`), route
  gardée par `canManageGuardianship`, entrée dans la sidebar admin, i18n `guardianships.*`
  (4 locales) + code d'erreur `errors.tutor_not_found`.
- **Manuel** `howtos/comptes.md` : création/reset par rôle + tutelle + comptes démo.

## Bloc B — Socle UI

- **Composant `data-table.svelte`** : générique (colonnes + `format` + recherche +
  pagination + slot d'actions), bâti sur `table` shadcn.
- **Toasts `sonner`** : retours d'action (`form.error`/`form.ok`) affichés en toasts
  au lieu de `<p role="alert">`/`<p role="status">`.

## Bloc C — Admin « pro »

- Listes migrées vers `data-table` (recherche + pagination + actions) : **paiements**
  (inscriptions + factures), **coupons** (toggle activer/désactiver), **tutelles**
  (délier).
- Formulaires admin harmonisés (cartes + champs + boutons).

## Bloc D — Lecteur « pro »

- En-tête de progression (barre `Progress` + `x/y` + %).
- Curriculum en **accordéon shadcn** (compte de complétion par module), icônes par
  type de leçon, badges d'état.
- Quiz stylé (cartes de choix), bouton « marquer terminé » avec icône, toasts de
  correction.

## Bloc E — Polish

- États vides (composant `empty-state`) sur catalogue, tutelles, dashboard tuteur.
- Barres de progression unifiées (`Progress` shadcn) sur les deux dashboards.

## Décision technique (honnête)

**Superforms/formsnap/zod** n'ont **pas** été retenus pour les formulaires admin : les
formulaires natifs + validation serveur (codes d'erreur i18n, déjà en place) suffisent
et évitent une refonte large à faible gain visuel. `zod` reste utilisé pour l'import JSON.

## Vérifications

- `npm run check` : 0 erreur / 0 warning · `npm run build` : OK.
- `npm test` : **255 tests verts** (couverture domaine 98,79 % inchangée).
- Production : `npm run smoke` 3/3 à chaque bloc (déploiement effectué).

## Reste à faire (si souhaité)

- Lecteur « une leçon à la fois » avec sidebar de progression + prev/next (actuellement
  vue curriculum complète).
- Vraies vignettes de cours (R2) à la place des dégradés déterministes.
- Audit accessibilité complet (ARIA, focus) et pass RTL fin sur l'admin.
