# Audit m6 — réduction de l'écart spec ↔ implémentation

**Audité** : GeberLMS v0.6.0 (post-m6) · **Référentiel** : `docs/spec/01-exigences.md`
(FR-21, FR-22, FR-23), `docs/planning.md` (m6).

## Verdicts

| Domaine | Résultat |
|---------|----------|
| Tests automatisés | ✅ 247 verts |
| Typecheck / svelte-check / build | ✅ 0 erreur / 0 warning |
| Stats & « reprendre » (domaine) | ✅ 5 tests |

## Écart spec↔impl réduit
1. **FR-22** : tableau de bord apprenant complet (stats, progression, activité, dépôts).
2. **FR-21** : tableau de bord tuteur détaillé (apprenants financés + progression).
3. **FR-23** : fil d'activité exposé à l'apprenant (`listRecentActivity`).

## Points d'attention (assumés)
- **Activité tuteur** : fil d'activité non encore exposé côté tuteur (ajout possible en m7).
- **Composant `form` (formsnap/superforms/zod)** : formulaires admin encore en HTML natif ;
  migration progressive prévue (m7).

## Décision
Continuer vers **m7** (comptes admin, monétisation & validation comptable OSS :
toggle coupons, modération quiz, validation des factures).
