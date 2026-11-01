# SBOM — Milestone m9 (v0.9.0)

Software Bill of Materials du milestone **m9** — GeberLMS v0.9.0.

## Métadonnées

- **Milestone** : m9
- **Version** : 0.9.0
- **Tag** : v0.9.0 (à poser à la livraison)
- **Date** : —
- **Statut** : planifié

## Base héritée

Le SBOM de référence est celui de m1 : [`../m1/SBOM.md`](../m1/SBOM.md).
Ce milestone hérite de cette base et ajoute ou modifie les composants ci-dessous.

## Composants anticipés (à confirmer à la livraison)

- **Routes** : —
- **Composants UI** : —
- **Dépendances** : @playwright/test
- **Notes** : tests navigateur E2E, audit de conformité, couverture ≥ 80 %, perf p95 < 1,5 s

## À compléter à la livraison

Renseigner les versions exactes des dépendances, lister les nouveaux modules
premier-party (`src/lib/domain`, `src/lib/server`, `src/lib/components`)
et re-vérifier l'ensemble du SBOM après implémentation.
