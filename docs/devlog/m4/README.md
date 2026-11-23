# Milestone m4 — v0.4.0 — Catalogue public `/catalog`

**Version** : `0.4.0` · **Statut** : ✅ livré (local + production)

## Objectif
Exposer le catalogue aux visiteurs anonymes et fermer le « 404 Catalogue » :
route publique `/catalog`, recherche/filtres, détail de cours + programme.

## Livrés

1. **Domaine** — `filterCourses` (recherche + filtres catégorie/niveau/langue) et
   `visibleSyllabus` (modules visibles + leçons visibles) dans `domain/catalog.ts`.
   7 nouveaux tests.
2. **Serveur** — `getPublicCourseBySlug` (détail public + programme visible).
3. **Routes publiques** — `/catalog` (liste + recherche/filtres) et
   `/catalog/[slug]` (détail + programme), hors du groupe `(app)` (sans auth).
4. **UI** — cartes de cours (shadcn Card/Badge), recherche, filtres, prix (gratuit
   si 0), lien vers le détail.
5. **Smoke test** étendu avec `/catalog` → 200.

## Vérifications
- `npm test` : **237 tests verts** (24 fichiers).
- `npm run typecheck` : OK · `npm run check` : 0 erreur / 0 warning · `npm run build` : OK.
- **Production** : déploiement OK ; `npm run smoke` → 3/3 ✅ ;
  `/catalog` → 200, `/catalog/fr-demo` → 200 (cours démo visible).
- Migrations distantes 0006/0007 appliquées ; runner de migrations renforcé
  (détection « duplicate column » pour les bases migrées à la main).

## Écart spec↔impl réduit
- **FR-catalogue / FR-48** : catalogue public fonctionnel, champs 0006 exposés.
- **Audit m1 « Catalogue 404 »** : fermé.

Voir `audit.md`.
