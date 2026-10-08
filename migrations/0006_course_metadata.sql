-- Métadonnées catalogue des cours (description, vignette, catégorie, niveau,
-- attribution tuteur) + drapeau `is_public` pour le catalogue public (FR-catalogue).
-- `is_public` est indépendant de `visibility` : un cours doit être à la fois
-- `visible` et `is_public = 1` pour apparaître au public anonyme.

PRAGMA foreign_keys = ON;

ALTER TABLE courses ADD COLUMN description TEXT;
ALTER TABLE courses ADD COLUMN cover_image TEXT;
ALTER TABLE courses ADD COLUMN category TEXT;
ALTER TABLE courses ADD COLUMN level TEXT;
ALTER TABLE courses ADD COLUMN is_public INTEGER NOT NULL DEFAULT 0;
ALTER TABLE courses ADD COLUMN tutor_id TEXT REFERENCES users(id);
