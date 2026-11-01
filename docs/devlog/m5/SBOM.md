# SBOM — Milestone m5 (v0.5.0)

Software Bill of Materials du milestone **m5** — GeberLMS v0.5.0.

## Métadonnées

- **Milestone** : m5
- **Version** : 0.5.0
- **Tag** : v0.5.0 (à poser à la livraison)
- **Date** : —
- **Statut** : planifié

## Base héritée

Le SBOM de référence est celui de m1 : [`../m1/SBOM.md`](../m1/SBOM.md).
Ce milestone hérite de cette base et ajoute ou modifie les composants ci-dessous.

## Composants anticipés (à confirmer à la livraison)

- **Routes** : — (refonte admin/courses)
- **Composants UI** : form (formulaire), data-table (table + pagination)
- **Dépendances** : formsnap, sveltekit-superforms, zod
- **Notes** : CRUD cours/modules/leçons/ressources (champs 0006 + visibilité publique)

## À compléter à la livraison

Renseigner les versions exactes des dépendances, lister les nouveaux modules
premier-party (`src/lib/domain`, `src/lib/server`, `src/lib/components`)
et re-vérifier l'ensemble du SBOM après implémentation.
