# Milestone m7 — v0.7.0 — Monétisation & validation comptable OSS

**Version** : `0.7.0` · **Statut** : ✅ livré (local)

## Objectif
Finaliser l'administration financière : toggle des coupons, listage des factures
TVA pour validation comptable, attribution de tuteur et modération des quiz.

## Livrés

1. **Toggle coupon** (audit §7.2) — `setCouponEnabled` + action/UI « Activer/Désactiver ».
2. **Factures TVA** — `listInvoicesForAdmin` + tableau des factures (numéro, apprenant,
   cours, montant, TVA, date) dans `/admin/payments`.
3. **Attribution de tuteur** — `listTutors` + sélecteur de tuteur dans le formulaire de
   création de cours (`tutor_id`).
4. **Modération quiz** — `updateQuizQuestion` + formulaire d'édition de question
   (énoncé/choix/réponse/points) dans `/admin/quizzes`.

## Vérifications
- `npm test` : **247 tests verts** (25 fichiers).
- `npm run typecheck` : OK · `npm run check` : 0 erreur / 0 warning · `npm run build` : OK.

## Écart spec↔impl réduit
- **FR-44** (coupon limité : activer/désactiver) : fermé (audit §7.2).
- **FR-47** (facturation TVA) : factures exposées pour validation comptable.
- **FR-30** (quiz) : modération des questions.

Voir `audit.md`.
