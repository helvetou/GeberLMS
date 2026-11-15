# Q&A — Milestone m1

Questions asked while applying the test manual, with answers.
Living journal: completed over the session.

## §1 — Prerequisites

**Q** — "Explain in a few words node and npm."
**A** — **Node.js**: a runtime that executes JavaScript outside the browser (build, scripts, tests). **npm**: Node's package manager (installs dependencies, runs the project's scripts).

## §2 — Local database setup

**Q** — "What is Wrangler? Link the explanation to *data wrangling* and to the etymology of *wrangle*."
**A** — **Wrangler**: Cloudflare's CLI (develop/test/deploy Workers, D1, R2, KV). Etymology: *wrangle* = to struggle / tame / master; a *horse wrangler* rounds up and controls horses. *Data wrangling* = cleaning/organizing raw data. Cloudflare named the tool by this metaphor: it "tames" Cloudflare resources and puts them in order.

## Domain vocabulary

**Q** — "What does *guardianships* mean?"
**A** — *guardian* = tutor (the person responsible for watching over someone); *guardianship* = guardianship/tutelage. In GeberLMS, it is the **tutor ↔ learner link**: a `{ tutorId, learnerId }` pair. Used for FR-04 (link), FR-06 (payer validation) and FR-07 (a tutor sees only their linked learners). Tutelage metaphor: the tutor "watches over" the learner (funds + tracks their progress).

**Q** — "What does *prompt* mean in the definition of a quiz question?"
**A** — *prompt* (from *to prompt* = to incite, to elicit a response) = the **question statement**: the `prompt` field of `QuizQuestion`, shown under the "Énoncé" label in the UI. ⚠️ Not to be confused with the **AI prompt** (the instruction sent to the LLM by `buildQuizPrompt` to generate questions).
