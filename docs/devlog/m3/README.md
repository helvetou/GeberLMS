# Milestone m3 — v0.3.0 — Admin contenu + import JSON de cours

**Version** : `0.3.0` · **Statut** : ✅ livré (local)

## Objectif
Alimenter la plateforme en cours réels dès le départ : CRUD enrichi des champs
0006 + **import JSON transactionnel** (FR-48) avec réconciliation par clé stable.

## Livrés

1. **Import JSON (FR-48)** — `src/lib/domain/import.ts` : schéma Zod + règles
   métier (slug kebab-case, cohérence polymorphique `text→content_markdown`,
   `video→video_url`, `quiz→quiz_data`, bornes `correct_index`, unicité des clés,
   normalisation des positions). 13 tests.
2. **Import serveur transactionnel** — `src/lib/server/import.ts` : mode
   `strict` (refus si slug existe) / `upsert` (réconciliation par `key`, ids
   préservés → progression conservée), écritures atomiques via `db.batch`.
3. **Migration `0007_course_import`** — colonnes `content_key` (modules/leçons/
   ressources) + `passing_score` (leçons) + index.
4. **Admin CRUD enrichi** — formulaire de création exposant `description`,
   `category`, `level`, `is_public` (champs 0006) + formulaire d'import JSON
   (textarea + mode strict/upsert) dans `/admin/courses`.

## Vérifications
- `npm test` : **230 tests verts** (24 fichiers).
- `npm run typecheck` : OK · `npm run check` : 0 erreur / 0 warning · `npm run build` : OK.
- `npm run db:migrate` : applique `0007` sur la base existante (idempotent).
- Schéma D1 vérifié : `lessons.content_key` + `lessons.passing_score` présents.

## Écart spec↔impl réduit
- **FR-48** implémenté (parse + upsert + reordering) ; **FR-11** enrichi (champs 0006).

## À vérifier en production
- Import bout-en-bout via HTTP (smoke test étendu en m4).

Voir `audit.md`.
