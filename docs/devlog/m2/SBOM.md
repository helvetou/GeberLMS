# SBOM — Milestone m2 (v0.2.0)

Software Bill of Materials du milestone **m2** — GeberLMS v0.2.0.

## Métadonnées

- **Milestone** : m2
- **Version** : 0.2.0
- **Tag** : v0.2.0 (à poser à la livraison)
- **Date** : —
- **Statut** : planifié

## Base héritée

Le SBOM de référence est celui de m1 : [`../m1/SBOM.md`](../m1/SBOM.md).
Ce milestone hérite de cette base et ajoute ou modifie les composants ci-dessous.

## Composants anticipés (à confirmer à la livraison)

- **Routes** : route publique /catalog (liste) + /catalog/[slug] (détail)
- **Composants UI** : course-card, catalog-search, catalog-filters, course-detail
- **Dépendances** : aucune nouvelle (réutilise shadcn-svelte)
- **Notes** : expose les champs 0006 ; ferme le 404 Catalogue

## À compléter à la livraison

Renseigner les versions exactes des dépendances, lister les nouveaux modules
premier-party (`src/lib/domain`, `src/lib/server`, `src/lib/components`)
et re-vérifier l'ensemble du SBOM après implémentation.
