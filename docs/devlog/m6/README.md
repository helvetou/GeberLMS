# Milestone m6 — v0.6.0 — Refonte des tableaux de bord

**Version** : `0.6.0` · **Statut** : ✅ livré (local)

## Objectif
Refondre les tableaux de bord apprenant et tuteur avec shadcn, alimentés par les
données réelles de progression du lecteur.

## Livrés

1. **Domaine** — `buildLearnerStats` (cours, leçons terminées/en cours, score moyen)
   et `nextLesson` (prochaine leçon à reprendre). 5 tests.
2. **Serveur** — `listRecentActivity` (fil d'activité d'un acteur).
3. **Tableau de bord apprenant** — stat-cards, carte « reprendre », liste de cours
   avec barres de progression, fil d'activité récent, dépôt de documents.
4. **Tableau de bord tuteur** — stat-cards (apprenants, cours, progression) et
   cartes par apprenant avec barres de progression détaillées.

## Vérifications
- `npm test` : **247 tests verts** (25 fichiers).
- `npm run typecheck` : OK · `npm run check` : 0 erreur / 0 warning · `npm run build` : OK.

## Écart spec↔impl réduit
- **FR-21 / FR-22** : tableaux de bord tuteur/apprenant alimentés par la progression réelle.

Voir `audit.md`.
