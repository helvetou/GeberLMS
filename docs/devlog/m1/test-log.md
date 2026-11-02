# Test log — Milestone m1

Journal des sessions de test du milestone courant (GeberLMS v0.1.0).

## Modèle d'entrée

### [AAAA-MM-JJ] — <sujet testé>

- **Contexte** : …
- **Étapes** : …
- **Résultat attendu** : …
- **Résultat constaté** : …
- **Verdict** : PASS / FAIL / BLOQUÉ
- **Notes** : …

## Sessions

### [2026-11-02] — §1 Prérequis

- **Contexte** : vérifier l'environnement avant de commencer.
- **Étapes** : `node --version`, `npm --version`.
- **Résultat attendu** : Node ≥ 20, npm ≥ 9.
- **Résultat constaté** : Node v22.22.1, npm 9.2.0.
- **Verdict** : PASS
- **Notes** : —

### [2026-11-02] — §2 Mise en place de la base locale

- **Contexte** : appliquer les migrations + seeds.
- **Étapes** : boucle `for f in migrations/*.sql; do npx wrangler d1 execute DB --local --file "$f"; done`.
- **Résultat attendu** : 6 migrations appliquées.
- **Résultat constaté** : 6 erreurs `already exists` / `duplicate column` → base déjà migrée. seed-admin / seed-demo non rejoués (déjà faits).
- **Verdict** : PASS (base déjà à jour)
- **Notes** : non-idempotence des migrations = écart audit §7.3, corrigé en m8.

### [2026-11-02] — §3 Démarrage

- **Contexte** : lancer le serveur de dev.
- **Étapes** : `npm run dev`.
- **Résultat attendu** : serveur sur http://localhost:5173.
- **Résultat constaté** : Vite v6.4.3 « ready », `Local: http://localhost:5173/` ; « Establishing remote connection… » (proxy Cloudflare) sans erreur ; warning « AI bindings always access remote resources » ; `[404] GET /favicon.png` ; aucun échec `CLOUDFLARE_API_TOKEN`.
- **Verdict** : PASS
- **Notes** : démarre sans l'erreur `CLOUDFLARE_API_TOKEN` signalée par l'audit §7.1 (identifiants Cloudflare présents). Binding `AI` distant → coûts possibles (§6.7). Warning `punycode` déprécié (inoffensif). `favicon.png` absent (mineur).

### [2026-11-02] — Test d'intégration `test_integration_manuel_dev_m1`

- **Contexte** : automatiser le parcours du manuel (fil conducteur) pour éviter de perdre du temps sur des bugs en test manuel.
- **Étapes** : création de `tests/domain/integration-manuel-dev-m1.test.ts` ; exécution `npm test`.
- **Résultat attendu** : le nouveau test passe + la suite reste verte.
- **Résultat constaté** : 210 tests passés (206 existants + 4 nouveaux), 22 fichiers.
- **Verdict** : PASS
- **Notes** : test d'intégration **domaine** (pas E2E navigateur — prévu en m9). Explication : `howto/integration-test-manuel-dev-m1.md`.
