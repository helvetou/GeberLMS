-- Import JSON de cours (FR-48, m3).
-- Clés stables de réconciliation par parent (jamais par titre/position),
-- et seuil de réussite des leçons de type quiz.

PRAGMA foreign_keys = ON;

ALTER TABLE modules ADD COLUMN content_key TEXT;
ALTER TABLE lessons ADD COLUMN content_key TEXT;
ALTER TABLE lessons ADD COLUMN passing_score INTEGER;
ALTER TABLE resources ADD COLUMN content_key TEXT;

CREATE INDEX IF NOT EXISTS idx_modules_course_key ON modules (course_id, content_key);
CREATE INDEX IF NOT EXISTS idx_lessons_module_key ON lessons (module_id, content_key);
