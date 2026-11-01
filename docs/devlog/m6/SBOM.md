# SBOM — Milestone m6 (v0.6.0)

Software Bill of Materials du milestone **m6** — GeberLMS v0.6.0.

## Métadonnées

- **Milestone** : m6
- **Version** : 0.6.0
- **Tag** : v0.6.0 (à poser à la livraison)
- **Date** : —
- **Statut** : planifié

## Base héritée

Le SBOM de référence est celui de m1 : [`../m1/SBOM.md`](../m1/SBOM.md).
Ce milestone hérite de cette base et ajoute ou modifie les composants ci-dessous.

## Composants anticipés (à confirmer à la livraison)

- **Routes** : — (refonte admin/users, enroll, coupons, payments, quizzes)
- **Composants UI** : formulaires (réutilise m5)
- **Dépendances** : réutilise m5 (formsnap/superforms/zod)
- **Notes** : toggle activer/désactiver des coupons (corrige audit §7.2)

## À compléter à la livraison

Renseigner les versions exactes des dépendances, lister les nouveaux modules
premier-party (`src/lib/domain`, `src/lib/server`, `src/lib/components`)
et re-vérifier l'ensemble du SBOM après implémentation.
