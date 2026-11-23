# Milestone m2 — v0.2.0 — Qualité, outillage & reproductibilité

**Version** : `0.2.0` · **Statut** : ✅ livré (local)

## Objectif
Stabiliser l'environnement de développement avant les fonctionnalités UI : rendre
les migrations et seeds idempotents, localiser les messages serveur/domaine,
permettre le dev local sans binding IA distant, et poser la base Playwright.

## Livrés

1. **Migrations idempotentes** — runner `scripts/migrate.ts` traçant les
   migrations dans une table `schema_migrations` (avec bootstrap des bases déjà
   migrées) ; `npm run db:migrate` / `db:migrate:remote`. Les fichiers
   `0001`/`0002`/`0005` utilisent désormais `IF NOT EXISTS`.
2. **Seeds idempotents** — `seed-admin.ts` en `ON CONFLICT(email) DO UPDATE`
   (audit §7.4) ; `seed-demo.ts` corrige l'état initial de progression
   `completed` → `not_started` (audit §7.5).
3. **Localisation des erreurs** — catalogue `src/lib/domain/errors.ts`
   (56 codes stables) + traductions FR/EN/AR/DE ; les couches serveur renvoient
   des codes, l'UI les traduit via `tError()`. Au passage, **correction de bugs
   latents** : les erreurs de domaine (coupon, inscription, paiement, facture,
   progression, quiz, upload) sont désormais interceptées et converties en
   codes au lieu de provoquer des 500.
4. **Mock LLM local** — `mockQuizQuestions()` (domaine, testé) ; la génération de
   quiz fonctionne hors ligne quand le binding `AI` est absent.
5. **Smoke test production** — `scripts/smoke-production.ts` (`npm run smoke`),
   requis par la DoD.
6. **Fondation Playwright** — `playwright.config.ts` + `e2e/smoke.spec.ts` +
   `npm run test:e2e` (prérequis : `npx playwright install chromium`).

## Vérifications
- `npm test` : **217 tests verts** (23 fichiers).
- `npm run typecheck` : OK · `npm run check` : 0 erreur / 0 warning · `npm run build` : OK.
- `npm run db:migrate` : idempotent (2e exécution = « base à jour »).
- `seed-admin.ts` : idempotent (2e exécution sans erreur d'unicité).

## Écarts d'audit m1 fermés
| Gap | Résolution |
|-----|-----------|
| §7.1 dev local exige `CLOUDFLARE_API_TOKEN` | Documenté dans le README + mock LLM local |
| §7.3 migrations non idempotentes | runner `schema_migrations` |
| §7.4 `seed-admin.ts` non idempotent | upsert `ON CONFLICT` |
| §7.5 progression initiale `completed` | `not_started` |

Voir `audit.md` pour le détail.
