# Statut du projet — 21 septembre 2026

## Résumé

Socle TDD posé et documenté (CMMI L3). La logique métier de base (prix/TVA/coupons,
rôles, liaison tuteur ↔ apprenant) est implémentée et testée. Le dépôt GitHub est créé
et poussé. La plateforme applicative (app, base, auth, paiement, contenu) reste à construire.

## Dépôt

- **GitHub** : https://github.com/helvetou/GeberLMS (privé)
- **Branche** : `master`
- **5 commits poussés** (`c430e20` → `f375ba3`)
- **`.gitignore`** : `node_modules/`, `.env`, `.codewhale/`, et les documents sensibles
  (PDF registre Helveticore, capture Payoneer→Revolut).

## Ce qui est fait

### Processus & spécifications

- Specs CMMI L3 : exigences (`01-exigences.md`), architecture (`02-architecture.md`),
  processus/TDD/risques/traçabilité (`03-processus-cmmi3.md`).
- Méthodologie TDD (rouge → vert → refactor) + typecheck strict.

### Socle technique

- TypeScript strict, Vitest, scripts npm (`test`, `test:watch`, `typecheck`).
- **41 tests verts**, typecheck propre.

### Logique métier (domaine pur, testé)

- `vat.ts` — taux de TVA UE, règle « hors UE = 0 % ».
- `coupon.ts` — coupons % / montant, gratuité totale (100 %), expiration, plafond d'usages.
- `pricing.ts` — prix final : remise sur le net, puis TVA au pays de l'acheteur (OSS).
- `roles.ts` — rôles (`admin`, `learner`, `tutor`) et permissions.
- `user.ts` — flag `self_payer`.
- `guardianship.ts` — liaison tuteur ↔ apprenant + contrôle de visibilité (FR-07).

### Décisions actées

- **Stack** : SvelteKit + Cloudflare (D1, R2, Workers AI), TypeScript strict.
- **Paiement** : Payoneer (compte Helveticore déjà validé) + retrait Revolut — **pas Stripe**.
- **TVA** : taux du pays de l'acheteur (régime OSS), facture générée par le système.
- **Comptes** : apprenants créés par l'admin après paiement (pas de self-signup).
- **Budget LLM** : ≤ 100 € / mois.

## Ce qui reste à faire

### Prochaine brique (immédiate)

- **FR-05 / FR-06** : inscription (`Enrollment`) financée par un unique payeur
  (tuteur ou l'apprenant lui-même), en réutilisant `isSelfPayer` et `guardianship`.

### Domaine (logique métier)

- **FR-10 → FR-14** : structure de cours (modules / leçons / ressources, cacher / modifier).
- **FR-20 → FR-24** : progression académique, journalisation, uploads, tableaux de bord.
- **FR-30 / FR-31** : e-testing + génération de quiz LLM (abstraction Workers AI / DeepSeek).

### Infrastructure / application

- Scaffold SvelteKit (adapter-cloudflare).
- Schéma D1 + migrations (Drizzle) : users, courses, enrollments, coupons, invoices, logs…
- Auth : sessions + comptes (création par l'admin uniquement).
- R2 : uploads apprenants + ressources.
- Intégration Payoneer (mode à confirmer) + activation à l'encaissement.
- Facturation TVA/OSS + génération des factures.
- i18n (FR puis EN / AR / DE), support RTL pour l'arabe.
- Anti-copie : rendu à la volée, pas d'export massif, filigrane, quotas.
- Déploiement Cloudflare (Workers/Pages, D1, R2, Workers AI).

### Conformité / points d'attention

- **Token `HELVETO_PAT`** : expire le **2026-10-21** — à renouveler.
- **Payoneer** : mode d'intégration à confirmer (demande de paiement semi-manuelle vs checkout).
- **TVA** : taux à re-valider contre une source officielle avant mise en production.
- **OSS** : enregistrement TVA UE à valider avec un comptable estonien.
- **RGPD** : consentement, minimisation, droit à l'effacement.
- **`npm audit`** : 5 vulnérabilités dans les dépendances de dev (à nettoyer).

## Commandes

```bash
npm install       # installer les dépendances
npm test          # exécuter la suite de tests
npm run typecheck # vérifier le typage
```
