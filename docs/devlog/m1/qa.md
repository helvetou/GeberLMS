# Q&A — Milestone m1

Questions posées pendant l'application du manuel de test, avec les réponses.
Journal vivant : complété au fil de la session.

## §1 — Prérequis

**Q** — « Explique en quelques mots node et npm. »
**R** — **Node.js** : runtime qui exécute du JavaScript hors navigateur (build, scripts, tests). **npm** : gestionnaire de paquets de Node (installe les dépendances, lance les scripts du projet).

## §2 — Mise en place de la base locale

**Q** — « Qu'est-ce que Wrangler ? Lie l'explication à *data wrangling* et à l'étymologie de *wrangle*. »
**R** — **Wrangler** : CLI de Cloudflare (développer/tester/déployer Workers, D1, R2, KV). Étymologie : *wrangle* = se débattre / dompter / maîtriser ; un *horse wrangler* rassemble et contrôle les chevaux. Le *data wrangling* = nettoyer/organiser des données brutes. Cloudflare a nommé l'outil par cette métaphore : il « dompte » les ressources Cloudflare et les met en ordre.

## Vocabulaire du domaine

**Q** — « Que veut dire *guardianships* ? »
**R** — *guardian* = tuteur (celui qui a la responsabilité de veiller sur quelqu'un) ; *guardianship* = tutelle. Dans GeberLMS, c'est le **lien tuteur ↔ apprenant** : une paire `{ tutorId, learnerId }`. Utilisée pour FR-04 (associer), FR-06 (validation du payeur) et FR-07 (le tuteur ne voit que ses apprenants liés). Métaphore de la tutelle : le tuteur « veille sur » l'apprenant (finance + suit sa progression).

**Q** — « Que veut dire *prompt* dans la définition d'une question quiz ? »
**R** — *prompt* (de *to prompt* = inciter, solliciter une réponse) = l'**énoncé de la question** : le champ `prompt` de `QuizQuestion`, affiché sous le libellé « Énoncé » dans l'UI. ⚠️ À ne pas confondre avec le **prompt-IA** (l'instruction envoyée au LLM par `buildQuizPrompt` pour générer des questions).
