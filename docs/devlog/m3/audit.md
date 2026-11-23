# Audit m3 — réduction de l'écart spec ↔ implémentation

**Audité** : GeberLMS v0.3.0 (post-m3) · **Référentiel** : `docs/spec/01-exigences.md`
(FR-48, FR-11), `docs/planning.md` (§ Import).

## Verdicts

| Domaine | Résultat |
|---------|----------|
| Tests automatisés | ✅ 230 verts (24 fichiers) |
| Typecheck / svelte-check / build | ✅ 0 erreur / 0 warning |
| Import domaine (parse/validation) | ✅ 13 tests (structure, slug, polymorphisme, bornes, clés) |
| Migration 0007 | ✅ appliquée, colonnes vérifiées |
| Import serveur (transactionnel) | ⚠️ compilé + typé ; exécution HTTP vérifiée en m4 |

## Écart spec↔impl réduit

1. **FR-48** — import JSON complet : validation stricte, insertion transactionnelle,
   réconciliation par `key` stable, réordonnancement (`position`), préservation de la
   progression (ids conservés en `upsert`).
2. **FR-11** — champs 0006 (`description`, `category`, `level`, `is_public`) désormais
   exposés dans le formulaire admin de création de cours.

## Points d'attention (assumés)

- **`cover_image` / `tutor_id`** : non exposés dans le formulaire texte (couverture via
  `thumbnail_key` de l'import ; `tutor_id` via import/schema). À compléter en m7.
- **Suppression d'entités supprimées de l'import** : l'upsert crée/met à jour mais ne
  supprime pas les éléments absents (conservation prudente de la progression). Documenté.
- **Quiz** : les questions sont remplacées à l'import (pas de clé stable par question) —
  sans impact sur la progression (granularité leçon).

## Décision

Continuer vers **m4** (catalogue public `/catalog`), en vérifiant l'import bout-en-bout
dans le smoke test de production.
