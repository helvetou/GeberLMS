# Convention — Shared directory with the Job Market Survey Drone

> Prompt / instruction set for the **`job-market-survey-drone`** project agent.
> Purpose: define the exchange convention between the two projects.

Concerned projects:

- **`job-market-survey-drone`** — the job-market survey drone (**writer**).
- **`geberstealth`** — the Helveticore LMS (**reader**).

## 1. Shared directory

All your outputs go into the **single** shared directory, located **inside** the LMS repo:

```
geberstealth/input-job-market-survey-drone/
```

(relative path from the repo root: `./input-job-market-survey-drone/`)

It is the **only exchange point** between the two projects.

## 2. Roles (strictly enforced)

- **You (the drone)**: the **only writer** of this directory. You deposit all your proposals (new projects, training, forecasted courses, skill rankings…).
- **The LMS (`geberstealth`)**: **reader only**. It consumes your proposals as *input* (milestone planning, catalog content), but never writes into this directory.

## 3. Writing rules

1. Never write elsewhere in the `geberstealth/` repo — neither `docs/` nor the root. Everything goes through `input-job-market-survey-drone/`.
2. The `geberstealth/docs/` repo stays **exclusively** dedicated to LMS development. No drone content belongs there.
3. Organize your outputs by nature, in dedicated subfolders:

```
input-job-market-survey-drone/
├── roadmap/             ← project proposals + training plan
│   ├── README.md        ← index (undated)
│   ├── new-projects-<YYYY-MM-DD>.md
│   └── training-to-prepare-<YYYY-MM-DD>.md
├── forecastedCourses/   ← forecasted course plans (one file per course)
│   ├── embedded-software-design-<YYYY-MM-DD>.md
│   ├── embedded-systems-<YYYY-MM-DD>.md
│   └── iot-<YYYY-MM-DD>.md
└── generated/           ← raw survey outputs (skills_demand.md, missing_skills.md…)
```

4. **Naming**: `kebab-case`, Markdown files, production date as a `-<YYYY-MM-DD>` suffix on content files. Index `README.md` files are **not** dated.
5. **Status & source**: at the top of each file, indicate `Status: planning | draft | ready` and the source (the survey that produced it).

## 4. What the LMS does with it (expected input)

- `roadmap/` → project proposals to integrate into milestone planning.
- `forecastedCourses/` → future GeberLMS catalog content.
- `generated/` → skill-gap ranking, used for prioritization.

The LMS never modifies these files. If an adjustment is needed, it records it in its own `devlog` and it is **you** (the drone) who rewrites.

## 5. Lifecycle

1. You produce a proposal (project / course / training).
2. You write it into `input-job-market-survey-drone/<category>/`.
3. The LMS reads it to plan a milestone.
4. In case of feedback, the LMS notes it outside the shared directory, and you come back to re-synchronize.
