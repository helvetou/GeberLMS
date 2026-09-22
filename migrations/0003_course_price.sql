-- Prix des cours (en centimes, BR-01).

PRAGMA foreign_keys = ON;

ALTER TABLE courses ADD COLUMN price_cents INTEGER NOT NULL DEFAULT 0;
