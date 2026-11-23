# Audit m4 — réduction de l'écart spec ↔ implémentation

**Audité** : GeberLMS v0.4.0 (post-m4) · **Référentiel** : `docs/spec/01-exigences.md`
(FR-catalogue), `docs/planning.md` (m4).

## Verdicts

| Domaine | Résultat |
|---------|----------|
| Tests automatisés | ✅ 237 verts |
| Typecheck / svelte-check / build | ✅ 0 erreur / 0 warning |
| Smoke production | ✅ 3/3 (`/login`, `/`, `/catalog`) |
| Catalogue + détail (prod) | ✅ `/catalog` et `/catalog/fr-demo` → 200 |
| Filtres/recherche | ✅ 7 tests domaine |

## Écart spec↔impl réduit
1. **FR-catalogue** : catalogue public anonyme (visibles + publics), recherche et
   filtres (catégorie/niveau/langue), détail + programme.
2. **404 Catalogue** : fermé (route `/catalog` + `/catalog/[slug]`).

## Anomalie corrigée (opérationnelle)
Le bootstrap du runner de migrations marquait à tort toutes les migrations comme
appliquées sur une base migrée « à la main » avant l'introduction du suivi. La base
distante était en réalité à la migration **0005**. Correction : application manuelle
de 0006/0007 + runner renforcé (détection « duplicate column » / « already exists »),
validée localement (drop de la table de suivi puis re-run → 4 migrations reconnues
comme déjà présentes).

## Points d'attention (assumés)
- **Anti-copie (NFR-10)** : → m5 (base) / m8 (avancé).
- **Lecteur de cours** : → m5.
- **`cover_image` / `tutor_id`** dans le formulaire admin : → m7.

## Décision
Continuer vers **m5** (lecteur de cours + anti-copie basique).
