# Créer et réinitialiser les comptes, gérer les tutelles

Manuel opérateur : comment créer un compte pour chaque type d'utilisateur
(admin, tuteur, apprenant), comment le réinitialiser, et comment lier un
tuteur à un apprenant (tutelle).

## Prérequis

- Node ≥ 20, npm ≥ 9.
- `npx wrangler login` (ou `CLOUDFLARE_API_TOKEN`).
- Base migrée : `npm run db:migrate` (locale) ou `npm run db:migrate:remote` (production).

> `--remote` agit sur la base de production (`geberlms`) ; sans `--remote`,
> c'est la base locale de développement.

---

## 1. Compte admin

L'admin est le compte opérateur. Il ne se crée **pas** via l'interface
(pas d'auto-inscription) mais via le script :

```bash
SEED_ADMIN_EMAIL=admin@example.com \
SEED_ADMIN_PASSWORD=changeme \
npx tsx scripts/seed-admin.ts --remote
```

**Réinitialiser** l'admin : relancer la même commande avec le nouveau mot de
passe (le script est idempotent — il met à jour le mot de passe en place).

---

## 2. Compte tuteur

Via l'interface admin **`/admin/users`** (connecté en admin) :

1. Rôle → **Tuteur**.
2. Email (obligatoire).
3. Nom (facultatif).
4. Mot de passe (facultatif — si vide, le compte ne peut pas se connecter).
5. Cliquer **Créer**.

---

## 3. Compte apprenant

Via l'interface admin **`/admin/users`** :

1. Rôle → **Apprenant**.
2. Email (obligatoire).
3. Nom (facultatif).
4. **Auto-payeur** : cocher si l'apprenant se finance lui-même ; sinon il est
   financé par un tuteur (voir §5 Tutelle).
5. Mot de passe (facultatif).
6. Cliquer **Créer**.

---

## 4. Réinitialiser un mot de passe (tout rôle)

```bash
RESET_EMAIL=tuteur@exemple.fr \
RESET_PASSWORD=NouveauMotDePasse123! \
npx tsx scripts/reset-password.ts --remote
```

Ou via npm : `npm run db:reset-password:remote` (et `db:reset-password` en local).
Fonctionne pour **admin, tuteur et apprenant** (par email). Si l'email n'existe
pas, aucune ligne n'est modifiée.

---

## 5. Tutelle (tuteur ↔ apprenant)

Une tutelle lie un tuteur à un apprenant qu'il finance. Sans ce lien, un
apprenant **non auto-payeur** ne peut pas être inscrit (l'inscription exige un
payeur unique).

Via l'interface admin **`/admin/guardianships`** :

- **Lier** : sélectionner un tuteur et un apprenant, cliquer **Lier**.
- **Délier** : cliquer **Délier** sur la tutelle existante.

---

## 6. Comptes de démonstration

```bash
npx tsx scripts/seed-demo.ts --remote
```

Recrée (et donc **réinitialise**) les comptes de démo :
- Tuteur : `tutor@demo.ee` / `DemoTutor123!`
- Apprenant : `learner@demo.ee` / `DemoLearner123!`

---

## Récapitulatif

| Type | Création | Réinitialisation |
|------|----------|------------------|
| Admin | `seed-admin.ts` | relancer `seed-admin.ts` |
| Tuteur | `/admin/users` | `reset-password.ts` |
| Apprenant | `/admin/users` | `reset-password.ts` |
| Démo | `seed-demo.ts` | relancer `seed-demo.ts` |

> Note de sécurité : les mots de passe de démo (`DemoTutor123!`,
> `DemoLearner123!`) sont publics — ne les utiliser qu'en démonstration.
