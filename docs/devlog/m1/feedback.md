# Feedback — Milestone m1

Retour d'expérience sur le milestone courant (GeberLMS v0.1.0).

## Points positifs

- Environnement prêt : base locale déjà migrée, `npm run dev` démarre sans l'erreur
  `CLOUDFLARE_API_TOKEN` (identifiants Cloudflare présents).
- Le test d'intégration `test_integration_manuel_dev_m1` automatise le parcours
  et évite de perdre du temps sur des bugs en test manuel.

## Points bloquants / à améliorer

- Le manuel **manquait un fil conducteur** (parcours de bout en bout) → ajouté en **§6.0**.
- Le manuel §6.5 annonce « activer/désactiver » les coupons, mais ce toggle n'est pas
  implémenté (écart audit §7.2).
- Migrations non idempotentes (écart audit §7.3, planifié en m8).

## Suggestions

- Ajouter un vrai test E2E navigateur (Playwright) en m9 pour couvrir le parcours §6.0.
- Corriger §6.5 du manuel (retirer « activer/désactiver » tant que le toggle n'existe pas).

## Questions ouvertes

-
