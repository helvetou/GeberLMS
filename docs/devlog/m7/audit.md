# Audit m7 — réduction de l'écart spec ↔ implémentation

**Audité** : GeberLMS v0.7.0 (post-m7) · **Référentiel** : `docs/spec/01-exigences.md`
(FR-44, FR-47, FR-30), audit §7.2.

## Verdicts

| Domaine | Résultat |
|---------|----------|
| Tests automatisés | ✅ 247 verts |
| Typecheck / svelte-check / build | ✅ 0 erreur / 0 warning |

## Écart spec↔impl réduit
1. **Audit §7.2** : toggle activate/désactive coupon — **fermé**.
2. **FR-47** : factures listées pour la validation comptable OSS (numérotation séquentielle
   déjà garantie par `nextInvoiceNumber`, cohérence par `validateInvoice`).
3. **FR-11** : `tutor_id` attribuable à la création d'un cours.
4. **FR-30** : modération des questions de quiz (édition).

## Points d'attention (assumés)
- **Validation comptable formelle** : à réaliser avec l'expert-comptable (mentions légales,
  taux OSS à jour) avant v1.0.0 — le tableau des factures est prêt pour cet audit.
- **`cover_image`** : via `thumbnail_key` de l'import JSON ; upload R2 dédié non branché.
- **Formulaires admin (formsnap/superforms/zod)** : toujours en HTML natif (migration
  progressive, non bloquante).

## Décision
Continuer vers **m8** (conformité & sécurité : RGPD, anti-copie avancé, budget LLM).
