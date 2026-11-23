# Milestone m8 — v0.8.0 — Conformité & sécurité

**Version** : `0.8.0` · **Statut** : ✅ livré (local)

## Objectif
Durcir avant la pré-production : RGPD (consentement, export, effacement),
anti-copie avancé et suivi du budget LLM.

## Livrés

1. **RGPD (NFR-08)** — `domain/gdpr.ts` (anonymisation, export versionné, règle
   d'effacement) + `server/gdpr.ts` (consentement, export JSON, effacement par
   anonymisation) + page `/account` (consentement marketing, export, effacement).
   Migration `0008` (consentement utilisateur + table `llm_usage`).
2. **Anti-copie avancé (NFR-10)** — `domain/antipiracy.ts` (quota par fenêtre
   glissante) ; brique prête à brancher sur le lecteur.
3. **Budget LLM (NFR-06)** — `domain/llm-budget.ts` (seuils 80 €/100 € + disjoncteur)
   + `server/llm-budget.ts` (enregistrement de la consommation, état du budget),
   affiché dans `/admin/quizzes` et alimenté à chaque génération.

## Vérifications
- `npm test` : **255 tests verts** (26 fichiers).
- `npm run typecheck` : OK · `npm run check` : 0 erreur / 0 warning · `npm run build` : OK.
- Migration `0008` appliquée (local).

## Écart spec↔impl réduit
- **NFR-08** : consentement + portabilité + effacement — implémentés.
- **NFR-06** : suivi budget LLM + disjoncteur — implémentés.
- **NFR-10** : quota anti-aspiration — implémenté (domaine).

Voir `audit.md`.
