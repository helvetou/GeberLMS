# LMS Helveticore

Learning Management System pour vendre les cours produits par Helveticore OÜ (Estonie).

## Statut

Socle TDD initialisé — logique métier (prix, TVA, coupons) en place et testée.

## Prérequis

- Node ≥ 20, npm ≥ 9

## Commandes

```bash
npm install      # installer les dépendances
npm test         # exécuter la suite de tests (Vitest)
npm run test:watch
npm run typecheck
```

## Structure

```
docs/spec/        Spécifications (CMMI L3)
src/lib/domain/   Logique métier pure (testée)
tests/domain/     Tests Vitest
```

## Documentation

- `docs/spec/01-exigences.md` — exigences fonctionnelles et non fonctionnelles
- `docs/spec/02-architecture.md` — architecture technique et décisions
- `docs/spec/03-processus-cmmi3.md` — processus, TDD, revues, risques, traçabilité
