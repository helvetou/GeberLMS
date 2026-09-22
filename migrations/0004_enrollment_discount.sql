-- Remise appliquée à l'inscription (coupon), en centimes (BR-01).
-- `net_cents` porte désormais le net après remise ; `total_cents` reste le TTC.

PRAGMA foreign_keys = ON;

ALTER TABLE enrollments ADD COLUMN discount_cents INTEGER NOT NULL DEFAULT 0;
