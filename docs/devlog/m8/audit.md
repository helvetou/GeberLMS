# Audit m8 — réduction de l'écart spec ↔ implémentation

**Audité** : GeberLMS v0.8.0 (post-m8) · **Référentiel** : `docs/spec/01-exigences.md`
(NFR-08, NFR-06, NFR-10).

## Verdicts

| Domaine | Résultat |
|---------|----------|
| Tests automatisés | ✅ 255 verts |
| Typecheck / svelte-check / build | ✅ 0 erreur / 0 warning |
| RGPD / budget / anti-copie (domaine) | ✅ 8 tests |

## Écart spec↔impl réduit
1. **NFR-08** : consentement, portabilité (export JSON), effacement (anonymisation) — opérationnels.
2. **NFR-06** : suivi du budget LLM + disjoncteur (blocage à ≥ 100 €) — opérationnels.
3. **NFR-10** : quota anti-aspiration par fenêtre glissante — prêt (domaine testé).

## Points d'attention (assumés)
- **Quota anti-copie non encore branché sur le lecteur** (le domaine est prêt) ; le
  branchement serveur (journal des accès + blocage) peut être finalisé en m9.
- **Anonymisation** : l'email est remplacé par `anonymized-<id>@invalid.local` ; les
  factures restent référencées par `enrollment_id` (obligation comptable).
- **Budget LLM** : cumulé (pas encore filtré par mois) ; estimation de coût approximative.
- **Sanitisation markdown** : toujours à renforcer (content-admin de confiance).

## Décision
Continuer vers **m9** (tests E2E Playwright + audit complet, couverture ≥ 80 %).
