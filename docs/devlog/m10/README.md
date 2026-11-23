# Milestone m10 — v1.0.0 — Lancement

**Version** : `1.0.0` · **Tag** : `v1.0.0` · **Statut** : ✅ livré

## Objectif
Mise en production finale, publication du premier cours réel et documentation d'exploitation.

## Livrés

1. **Version 1.0.0** + tag `v1.0.0`.
2. **Premier cours réel publié** — `Verilog pour débutants` (2 modules, 5 leçons,
   contenu markdown + vidéo + quiz) importé via le pipeline JSON (FR-48) **en production**,
   visible dans `/catalog` et `/catalog/verilog-debutants` (200).
3. **Runbook d'exploitation** — `docs/runbook.md` (migrations, seeds, publication,
   déploiement, tests production, vigilances).

## Vérifications
- `npm test` : **255 tests verts** · couverture domaine **98,79 %**.
- `npm run check` / `typecheck` / `build` : OK.
- **Production** : smoke 3/3 (latence max 572 ms) · E2E Playwright 3/3 ·
  catalogue + cours publiés accessibles.

## État final
- 26 fichiers de test, 255 tests ; domaine couvert à 98,79 %.
- 10 milestones livrés (v0.1.0 → v1.0.0), chacun audité.

Voir `audit.md` et `docs/runbook.md`.
