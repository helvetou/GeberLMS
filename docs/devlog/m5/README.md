# Milestone m5 — v0.5.0 — Lecteur de cours + anti-copie basique

**Version** : `0.5.0` · **Statut** : ✅ livré (local)

## Objectif
Permettre à un apprenant inscrit de lire un cours : curriculum, lecteur de leçon
(texte markdown / vidéo / quiz), progression et première mesure anti-copie.

## Livrés

1. **Domaine** — `buildCourseReader` (vue lecteur : modules/leçons visibles,
   ressources, statut/score, totaux). 5 tests.
2. **Serveur** — `getLearnerCourseReader` (vérifie l'inscription active) +
   `renderMarkdown` (marked) pour les leçons texte.
3. **Route lecteur** — `/learner/courses/[courseId]` : curriculum accordéon,
   lecteur (texte rendu, vidéo, quiz), bouton « marquer terminé », progression.
4. **Anti-copie basique (NFR-10)** — filigrane dynamique (identifiant apprenant),
   `select-none` sur le contenu, pas d'export en masse.
5. Lien « ouvrir le cours » depuis le tableau de bord apprenant.

## Vérifications
- `npm test` : **242 tests verts** (25 fichiers).
- `npm run typecheck` : OK · `npm run check` : 0 erreur / 0 warning · `npm run build` : OK.

## Écart spec↔impl réduit
- **FR-20** (progression), **FR-30** (quiz), **FR-24** (ressources) intégrés au lecteur.
- **NFR-10** : première brique anti-copie (filigrane + non-sélection).

Voir `audit.md`.
