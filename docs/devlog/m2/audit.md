# Audit m2 — réduction de l'écart spec ↔ implémentation

**Audité** : GeberLMS v0.2.0 (post-m2) · **Référentiel** : `docs/spec/01-exigences.md`,
`docs/spec/02-architecture.md`, `docs/spec/03-processus-cmmi3.md`, `docs/planning.md`.
**Méthode** : TDD + vérification automatique + inspection statique. **Pas de verdict sans preuve.**

## Verdicts

| Domaine | Résultat |
|---------|----------|
| Tests automatisés | ✅ 217 verts (23 fichiers) |
| Typecheck / svelte-check / build | ✅ 0 erreur / 0 warning |
| Migrations idempotentes | ✅ re-jeu sans effet (vérifié) |
| Seeds idempotents | ✅ `seed-admin` 2e run sans erreur |
| Localisation erreurs | ✅ 56 codes × 4 locales (test de non-fuite de clé) |
| Mock LLM local | ✅ `mockQuizQuestions` testé (déterminisme, bornes) |
| Smoke production | ⚠️ script prêt, exécution reportée au déploiement |

## Écart spec↔impl réduit ce milestone

1. **NFR-05 (maintenabilité)** : erreurs applicatives clés stabilisées (codes), plus de
   chaînes françaises éparses dans les routes.
2. **NFR-04 (testabilité)** : +4 tests (catalogue d'erreurs, mock LLM).
3. **Écarts d'audit m1** (§7.1, §7.3, §7.4, §7.5) : tous fermés.
4. **Bugs latents corrigés** : erreurs de domaine non interceptées (→ 500) converties en
   `fail(400)` avec code : `enrollment` (payer/coupon), `payment` (activation/paiement/facture),
   `progress` (score), `quiz` (parse LLM), `upload` (validation), `gradeQuizForLesson`
   (propagation `ProgressServiceError`).

## Écart restant (assumé, planifié)

- **NFR-08 (RGPD)** : consentement / export / effacement → m8.
- **NFR-10 (anti-copie)** : → m5 (base) puis m8 (avancé).
- **NFR-06 (budget LLM)** : → m8.
- **FR-48 (import JSON)** : → m3.
- **Catalogue public `/catalog`** : → m4.
- **Smoke test production** : exécuté au premier déploiement de cette branche (m4).

## Décision

Continuer vers **m3** (admin contenu + import JSON), le socle de qualité m2 étant en place.
