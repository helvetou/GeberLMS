-- Conformité RGPD (NFR-08) + suivi du budget LLM (NFR-06).

PRAGMA foreign_keys = ON;

ALTER TABLE users ADD COLUMN consent_at TEXT;
ALTER TABLE users ADD COLUMN consent_marketing INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS llm_usage (
  id            TEXT PRIMARY KEY,
  model         TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_llm_usage_created ON llm_usage (created_at);
