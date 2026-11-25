-- Cours Quran — Riwayat Warsh : métadonnées des sourates (pages du Mushaf).
-- Le texte du tafseer (volumineux) est stocké dans R2 (bucket FILES) sous
-- quran/tafseer/<surah_no>.md ; D1 ne garde que la clé.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS quran_surahs (
  surah_no       INTEGER PRIMARY KEY,
  name_ar        TEXT NOT NULL,
  name_en        TEXT NOT NULL,
  start_page     INTEGER NOT NULL,
  end_page       INTEGER NOT NULL,
  tafseer_r2_key TEXT
);
