# Convention — Répertoire partagé avec le Job Market Survey Drone

> Prompt / jeu d'instructions destiné à l'agent du projet **`job-market-survey-drone`**.
> Objet : définir la convention d'échange entre les deux projets.

Projets concernés :

- **`job-market-survey-drone`** — le drone d'enquête du marché de l'emploi (**écrivain**).
- **`geberstealth`** — le LMS Helveticore (**lecteur**).

---

## 1. Répertoire partagé

Toutes tes sorties vont dans le répertoire partagé **unique**, situé **dans** le repo
du LMS :

```
geberstealth/input-job-market-survey-drone/
```

(chemin relatif depuis la racine du repo : `./input-job-market-survey-drone/`)

C'est le **seul point d'échange** entre les deux projets.

## 2. Rôles (à respecter strictement)

- **Toi (le drone)** : tu es le **seul écrivain** de ce répertoire. Tu y déposes
  toutes tes propositions (nouveaux projets, formations, cours prévisionnels,
  classements de compétences…).
- **Le LMS (`geberstealth`)** : **lecteur seul**. Il consomme tes propositions
  comme *input* (planning des milestones, contenu du catalogue), mais n'écrit
  **jamais** dans ce répertoire.

## 3. Règles d'écriture

1. N'écris **jamais** ailleurs dans le repo `geberstealth/` — ni dans `docs/`, ni
   à la racine. Tout passe par `input-job-market-survey-drone/`.
2. Le repo `geberstealth/docs/` reste **exclusivement** consacré au développement
   du LMS. Aucun contenu drone n'y a sa place.
3. Organise tes sorties par nature, dans des sous-dossiers dédiés :

```
input-job-market-survey-drone/
├── roadmap/             ← propositions de projets + plan de formation
│   ├── README.md        ← index (non daté)
│   ├── new-projects-<AAAA-MM-JJ>.md
│   └── training-to-prepare-<AAAA-MM-JJ>.md
├── forecastedCourses/   ← plans de cours prévisionnels (un fichier par cours)
│   ├── embedded-software-design-<AAAA-MM-JJ>.md
│   ├── embedded-systems-<AAAA-MM-JJ>.md
│   └── iot-<AAAA-MM-JJ>.md
└── generated/           ← sorties brutes d'enquête (skills_demand.md, missing_skills.md…)
```

4. **Nommage** : `kebab-case`, fichiers Markdown, date de production en suffixe
   `-<AAAA-MM-JJ>` sur les fichiers de contenu. Les `README.md` d'index ne sont
   **pas** datés.
5. **Statut & source** : en tête de chaque fichier, indique
   `Status: planning | draft | ready` et la source (l'enquête qui l'a produit).

## 4. Ce que le LMS en fait (input attendu)

- `roadmap/` → propositions de projets à intégrer au planning des milestones.
- `forecastedCourses/` → futurs contenus du catalogue GeberLMS.
- `generated/` → classement des lacunes de compétences, utilisé pour prioriser.

Le LMS ne modifie jamais ces fichiers. Si un ajustement est nécessaire, il le
consigne dans son propre `devlog` et c'est **toi** (le drone) qui réécris.

## 5. Cycle de vie

1. Tu produis une proposition (projet / cours / formation).
2. Tu l'écris dans `input-job-market-survey-drone/<catégorie>/`.
3. Le LMS la lit pour planifier un milestone.
4. En cas de retour, le LMS le note hors du répertoire partagé, et toi tu
   reviens re-synchroniser.
