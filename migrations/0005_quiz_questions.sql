-- Questions de quiz (FR-30).
-- `choices` est un tableau JSON de chaînes ; `correct_index` est 0-based.

PRAGMA foreign_keys = ON;

CREATE TABLE quiz_questions (
  id            TEXT PRIMARY KEY,
  lesson_id     TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  position      INTEGER NOT NULL DEFAULT 0,
  prompt        TEXT NOT NULL,
  choices       TEXT NOT NULL,
  correct_index INTEGER NOT NULL,
  points        INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_quiz_questions_lesson ON quiz_questions (lesson_id);
