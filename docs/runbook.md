# Runbook — GeberLMS (opérations)

Manuel d'exploitation pour l'opérateur Helveticore OÜ.

## Environnement

- **Production** : https://geberlms.haroudm.workers.dev (Worker Cloudflare `geberlms`).
- **Bindings** : `DB` (D1 `geberlms`), `FILES` (R2 `geberlms-files`), `AI` (Workers AI), `ASSETS`.
- **Compte** : `haroudm@gmail.com` (`npx wrangler whoami` pour vérifier).

## Prérequis

```bash
node --version   # ≥ 20
npx wrangler login   # ou CLOUDFLARE_API_TOKEN
```

## Vérifications qualité

```bash
npm test          # 255 tests métier (Vitest)
npm run coverage  # couverture du domaine (≥ 80 %)
npm run typecheck # typage métier
npm run check     # svelte-check
npm run build     # build SvelteKit (adapter-cloudflare)
```

## Migrations

```bash
npm run db:migrate         # locale (idempotent)
npm run db:migrate:remote  # production (idempotent)
```

## Seeds

```bash
SEED_ADMIN_EMAIL=… SEED_ADMIN_PASSWORD=… npx tsx scripts/seed-admin.ts --remote
npx tsx scripts/seed-demo.ts --remote
```

## Publication d'un cours

1. Rédiger le cours en JSON (voir `content/verilog-debutants.json` comme modèle).
2. Via l'UI admin : `/admin/courses` → section « Import JSON de cours », coller le JSON,
   mode `strict` (refus si le slug existe) ou `upsert` (réconciliation par clé).
3. Ou par API (avec session admin) :

```bash
curl -c c.txt -X POST https://geberlms.haroudm.workers.dev/login \
  -H "Origin: https://geberlms.haroudm.workers.dev" \
  -d "email=admin@example.com&password=…"
curl -b c.txt -X POST "https://geberlms.haroudm.workers.dev/admin/courses?/importCourse" \
  -H "Origin: https://geberlms.haroudm.workers.dev" \
  --data-urlencode "json@content/mon-cours.json" -d "mode=strict"
```

## Déploiement

```bash
npm run deploy   # = npm run build && npx wrangler deploy
```

## Tests de production

```bash
npm run smoke                       # smoke HTTP + latence
E2E_BASE_URL=https://geberlms.haroudm.workers.dev npx playwright test
```

## Points de vigilance

- **Binding AI distant** : la génération de quiz facture les Workers AI ; budget seuil
  80 € / disjoncteur 100 € (suivi dans `/admin/quizzes`).
- **Taux TVA** : re-valider `src/lib/domain/vat.ts` contre la Commission européenne avant
  chaque changement de taux.
- **RGPD** : export/effacement via `/account` ; l'effacement anonymise (jamais de
  suppression physique des factures).
- **Secrets** : jamais de `.dev.vars`/token commité (`.gitignore`).
