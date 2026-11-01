# Planning — GeberLMS · 10 milestones (m1 → m10)

Plan de fin d'implémentation en **10 milestones**. Chaque milestone : un répertoire
`docs/devlog/mN/`, une version `0.N.0`, un tag `v0.N.0`, une doc (manuel versionné),
un feedback et un SBOM (`SBOM.md`) dans le devlog.

> Convention : version sémantique — m1 = v0.1.0 … m10 = v1.0.0.
> m1 est **livré** ; m2 → m10 sont planifiés.

## Vue d'ensemble

| Milestone | Version | Tag | Statut | Scope |
|-----------|---------|-----|--------|-------|
| m1 | 0.1.0 | v0.1.0 | ✅ livré | Socle backend + domaine TDD + auth + routes + i18n/RTL + Payoneer + quiz + uploads R2 + app shell |
| m2 | 0.2.0 | v0.2.0 | ⬜ planifié | Catalogue public — route `/catalog`, champs 0006, visibilité publique |
| m3 | 0.3.0 | v0.3.0 | ⬜ planifié | Lecteur de cours — lesson-player, curriculum, resource-sheet, quiz-player, progression, anti-copie de base |
| m4 | 0.4.0 | v0.4.0 | ⬜ planifié | Dashboards redesign — apprenant + tuteur |
| m5 | 0.5.0 | v0.5.0 | ⬜ planifié | Admin contenu — tables + formulaires, CRUD cours/modules/leçons/ressources |
| m6 | 0.6.0 | v0.6.0 | ⬜ planifié | Admin comptes & monétisation — utilisateurs, inscriptions, coupons (toggle), paiements, quizzes |
| m7 | 0.7.0 | v0.7.0 | ⬜ planifié | Conformité & sécurité — RGPD, anti-copie avancé, budget LLM |
| m8 | 0.8.0 | v0.8.0 | ⬜ planifié | Qualité & reproductibilité — migrations/seeds idempotents, localisation, prérequis dev |
| m9 | 0.9.0 | v0.9.0 | ⬜ planifié | Tests E2E & audit — Playwright, audit complet, couverture ≥ 80 %, perf |
| m10 | 1.0.0 | v1.0.0 | ⬜ planifié | Lancement — déploiement prod, premiers cours, facturation/OSS, doc finale |

## Détail par milestone

### m1 — v0.1.0 (livré)
Socle : domaine TDD (prix/TVA/coupons, rôles, guardianship, inscriptions, catalogue,
progression, quiz, paiement, facturation), auth serveur, routes admin/tuteur/apprenant,
i18n/RTL (FR/EN/AR/DE), paiement Payoneer + facturation TVA, génération de quiz LLM,
uploads R2, app shell (sidebar/topbar).
- Doc : `docs/manual-dev-v0.1.0-m1.md`
- SBOM : `docs/devlog/m1/SBOM.md`
- Devlog : `docs/devlog/m1/`

### m2 — v0.2.0 — Catalogue public
Route publique `/catalog` (anonyme) consommant `listPublicCatalog` : liste (course-card,
recherche, filtres) + fiche détail. Exposer les champs 0006 (description, vignette,
catégorie, niveau, `is_public`). Ferme le 404 « Catalogue ».

### m3 — v0.3.0 — Lecteur de cours
Lecture d'un cours inscrit : lesson-player, curriculum-accordion, resource-sheet,
quiz-player, progression (« marquer terminé »), upload apprenant. Anti-copie de base
(rendu à la volée, pas d'export massif, filigrane).

### m4 — v0.4.0 — Dashboards redesign
Redesign shadcn des dashboards apprenant (stat-card, continue-learning, progress-list,
activity-feed) et tuteur (apprenants financés + progression).

### m5 — v0.5.0 — Admin contenu
Tables + composant `form` (formsnap/superforms/zod). CRUD complet cours/modules/leçons/
ressources avec les champs 0006 + visibilité publique.

### m6 — v0.6.0 — Admin comptes & monétisation
Formulaires admin : utilisateurs, inscriptions, coupons (avec toggle activer/désactiver —
corrige l'écart audit §7.2), paiements, quizzes.

### m7 — v0.7.0 — Conformité & sécurité
RGPD (consentement, droit à l'effacement), anti-copie avancé (quotas + journalisation),
budget LLM (suivi + alerte 80/100 €).

### m8 — v0.8.0 — Qualité & reproductibilité
Migrations idempotentes, seeds idempotents, localisation des messages serveur/domaine,
prérequis `CLOUDFLARE_API_TOKEN` documenté + dev local sans binding AI distant
(corrige audit §7.1/7.3/7.4/7.5).

### m9 — v0.9.0 — Tests E2E & audit
Tests navigateur (Playwright), audit de conformité complet rejoué, couverture domaine
≥ 80 %, performance p95 < 1,5 s.

### m10 — v1.0.0 — Lancement
Déploiement production final, premiers cours réels validés, facturation/OSS validée
comptable, documentation finale (rapport technique + manuel), tag `v1.0.0`.

## Input drone

Les propositions de cours/projets du job-market drone arrivent dans
`input-job-market-survey-drone/` (voir `docs/sharedDirwithDrone.md`) et alimentent
le contenu du catalogue et la priorisation des milestones.
