-- Schéma initial D1 (SQLite) — aligné sur le domaine (src/lib/domain).
-- Les montants sont en centimes entiers (BR-01).
-- Les clés étrangères avec ON DELETE CASCADE nécessitent PRAGMA foreign_keys = ON.

PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  role          TEXT NOT NULL CHECK (role IN ('admin', 'learner', 'tutor')),
  self_payer    INTEGER NOT NULL DEFAULT 0,
  email         TEXT NOT NULL UNIQUE,
  name          TEXT,
  locale        TEXT NOT NULL DEFAULT 'fr',
  password_hash TEXT,
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE guardianships (
  tutor_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  learner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (tutor_id, learner_id)
);

CREATE TABLE courses (
  id         TEXT PRIMARY KEY,
  slug       TEXT NOT NULL UNIQUE,
  title      TEXT NOT NULL,
  language   TEXT NOT NULL CHECK (language IN ('fr', 'en', 'ar', 'de')),
  visibility TEXT NOT NULL DEFAULT 'visible' CHECK (visibility IN ('visible', 'hidden')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE modules (
  id         TEXT PRIMARY KEY,
  course_id  TEXT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  position   INTEGER NOT NULL DEFAULT 0,
  title      TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'visible' CHECK (visibility IN ('visible', 'hidden')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE lessons (
  id          TEXT PRIMARY KEY,
  module_id   TEXT NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  position    INTEGER NOT NULL DEFAULT 0,
  title       TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('video', 'text', 'quiz')),
  visibility  TEXT NOT NULL DEFAULT 'visible' CHECK (visibility IN ('visible', 'hidden')),
  content_ref TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE resources (
  id         TEXT PRIMARY KEY,
  lesson_id  TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  r2_key     TEXT,
  visibility TEXT NOT NULL DEFAULT 'visible' CHECK (visibility IN ('visible', 'hidden')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE coupons (
  id          TEXT PRIMARY KEY,
  code        TEXT NOT NULL UNIQUE,
  type        TEXT NOT NULL CHECK (type IN ('percent', 'amount')),
  value       INTEGER NOT NULL,
  scope       TEXT,
  expires_at  TEXT,
  max_uses    INTEGER,
  used_count  INTEGER NOT NULL DEFAULT 0,
  enabled     INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE enrollments (
  id               TEXT PRIMARY KEY,
  learner_id       TEXT NOT NULL REFERENCES users(id),
  course_id        TEXT NOT NULL REFERENCES courses(id),
  payer_id         TEXT NOT NULL REFERENCES users(id),
  coupon_id        TEXT REFERENCES coupons(id),
  status           TEXT NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'active', 'expired', 'revoked')),
  net_cents        INTEGER NOT NULL,
  vat_rate_percent REAL NOT NULL,
  vat_cents        INTEGER NOT NULL,
  total_cents      INTEGER NOT NULL,
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (learner_id, course_id)
);

CREATE TABLE payments (
  id            TEXT PRIMARY KEY,
  enrollment_id TEXT REFERENCES enrollments(id),
  provider      TEXT NOT NULL DEFAULT 'payoneer',
  provider_ref  TEXT,
  amount_cents  INTEGER NOT NULL,
  currency      TEXT NOT NULL DEFAULT 'EUR',
  status        TEXT NOT NULL DEFAULT 'pending',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE invoices (
  id               TEXT PRIMARY KEY,
  enrollment_id    TEXT NOT NULL REFERENCES enrollments(id),
  number           TEXT NOT NULL UNIQUE,
  pdf_ref          TEXT,
  net_cents        INTEGER NOT NULL,
  vat_rate_percent REAL NOT NULL,
  vat_cents        INTEGER NOT NULL,
  total_cents      INTEGER NOT NULL,
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE progress (
  id            TEXT PRIMARY KEY,
  enrollment_id TEXT NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  lesson_id     TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'not_started',
  score         REAL,
  completed_at  TEXT,
  updated_at    TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (enrollment_id, lesson_id)
);

CREATE TABLE uploads (
  id           TEXT PRIMARY KEY,
  learner_id   TEXT NOT NULL REFERENCES users(id),
  lesson_id    TEXT REFERENCES lessons(id),
  r2_key       TEXT NOT NULL,
  filename     TEXT,
  content_type TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE activity_logs (
  id          TEXT PRIMARY KEY,
  actor_id    TEXT REFERENCES users(id),
  action      TEXT NOT NULL,
  target_type TEXT,
  target_id   TEXT,
  meta        TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_modules_course       ON modules (course_id);
CREATE INDEX idx_lessons_module       ON lessons (module_id);
CREATE INDEX idx_resources_lesson     ON resources (lesson_id);
CREATE INDEX idx_enrollments_learner  ON enrollments (learner_id);
CREATE INDEX idx_enrollments_payer    ON enrollments (payer_id);
CREATE INDEX idx_progress_enrollment  ON progress (enrollment_id);
CREATE INDEX idx_activity_actor       ON activity_logs (actor_id);
