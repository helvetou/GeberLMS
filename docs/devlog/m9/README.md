# Milestone m9 — v0.9.0 — Tests E2E & audit

**Version** : `0.9.0` · **Statut** : ✅ livré (local + production)

## Objectif
Validation globale pré-lancement : suite E2E, couverture du domaine et performance.

## Livrés

1. **Couverture** — `npm run coverage` (v8) sur `src/lib/domain` : **98,79 %**
   (statements/lines), 90,98 % branches, 99,19 % fonctions — objectif ≥ 80 % dépassé.
2. **Suite E2E Playwright** — 3 scénarios contre la production :
   page de connexion, catalogue public, connexion apprenant → tableau de bord.
   **3/3 verts** (Chromium installé).
3. **Smoke test production étendu** — mesure de latence : max 572 ms, moyenne 354 ms
   (seuil p95 < 1500 ms respecté).
4. **Vérification import** — `importCourse` en strict puis upsert sur D1 locale :
   réconciliation par clé confirmée (même `courseId`).

## Vérifications
- `npm test` : **255 tests verts** (26 fichiers).
- `npm run coverage` : 98,79 % (domaine).
- `npx playwright test` (prod) : 3/3.
- `npm run smoke` (prod) : 3/3, latence max 572 ms.

Voir `audit.md`.
