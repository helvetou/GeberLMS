# Audit m5 — réduction de l'écart spec ↔ implémentation

**Audité** : GeberLMS v0.5.0 (post-m5) · **Référentiel** : `docs/spec/01-exigences.md`
(FR-20, FR-30, FR-24, NFR-10), `docs/planning.md` (m5).

## Verdicts

| Domaine | Résultat |
|---------|----------|
| Tests automatisés | ✅ 242 verts |
| Typecheck / svelte-check / build | ✅ 0 erreur / 0 warning |
| Lecteur (domaine) | ✅ 5 tests |
| Lecteur (serveur) | ✅ compilé + typé (exécution HTTP en prod au déploiement) |

## Écart spec↔impl réduit
1. **FR-20** : progression par leçon dans le lecteur (statut + pourcentage).
2. **FR-30** : quiz intégré au lecteur (correction auto + score).
3. **FR-24** : ressources listées par leçon.
4. **NFR-10 (anti-copie basique)** : filigrane identifiant + `select-none` + pas d'export.

## Points d'attention (assumés)
- **Sanitisation markdown** : le contenu est rédigé par l'admin (frontière de confiance) ;
  la sanitisation HTML sera renforcée en m8.
- **Anti-copie avancé** (quotas, journalisation des comportements suspects) : m8.
- **Vidéo** : `contentRef` attend une URL ; l'intégration R2 (clé relative → URL signée)
  sera affinée en m8.

## Décision
Continuer vers **m6** (refonte des tableaux de bord, alimentés par les données réelles
du lecteur).
