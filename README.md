# LMS Helveticore

Learning Management System pour vendre les cours produits par Helveticore OÜ (Estonie).

## Statut

- Socle TDD en place : logique métier pure testée (prix/TVA/coupons, rôles, guardianship,
  inscriptions, catalogue de cours, auth).
- Application SvelteKit scaffoldée (adapter-cloudflare), schéma D1 et auth serveur en place.

## Prérequis

- Node ≥ 20, npm ≥ 9

## Commandes

```bash
npm install        # installer les dépendances
npm run dev        # serveur de dev
npm run build      # build SvelteKit (adapter-cloudflare)
npm run check      # svelte-check (typage de l'app et du serveur)
npm test           # tests Vitest (logique métier)
npm run test:watch
npm run typecheck  # typage de la logique métier (tsc)
```

## Base de données locale (D1)

```bash
npx wrangler d1 execute DB --local --file migrations/0001_init.sql
npx wrangler d1 execute DB --local --file migrations/0002_sessions.sql
SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD=changeme npx tsx scripts/seed-admin.ts
```

## Structure

```
docs/spec/           Spécifications (CMMI L3)
migrations/          Migrations SQL D1
src/lib/domain/      Logique métier pure (testée)
src/lib/server/      Couche serveur (D1/Drizzle, auth)
src/routes/          Pages SvelteKit (login, admin…)
tests/domain/        Tests Vitest
```

## Documentation

- `docs/spec/01-exigences.md` — exigences fonctionnelles et non fonctionnelles
- `docs/spec/02-architecture.md` — architecture technique et décisions
- `docs/spec/03-processus-cmmi3.md` — processus, TDD, revues, risques, traçabilité
