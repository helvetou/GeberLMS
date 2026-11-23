/**
 * Runner de migrations idempotent pour D1 (audit §7.3).
 *
 * Contrairement à un `for f in migrations/*.sql; do wrangler d1 execute …; done`,
 * ce runner trace les migrations déjà appliquées dans une table
 * `schema_migrations`, ce qui rend le re-jeu sans effet et sans erreur
 * (notamment pour les migrations `ALTER TABLE`, qui ne supportent pas
 * `IF NOT EXISTS` en SQLite).
 *
 * Usage :
 *   npx tsx scripts/migrate.ts            # base locale (binding DB)
 *   npx tsx scripts/migrate.ts --remote   # base distante (d1 « geberlms »)
 */
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const MIGRATIONS_DIR = join(process.cwd(), 'migrations');
const TRACKING_TABLE = 'schema_migrations';

const remote = process.argv.includes('--remote');
const target = remote ? 'geberlms' : 'DB';
const mode = remote ? '--remote' : '--local';

interface WranglerResult {
  results: Array<Record<string, unknown>>;
  success: boolean;
}

function exec(args: string[]): string {
  return execFileSync('npx', ['wrangler', 'd1', 'execute', target, mode, ...args], {
    stdio: ['ignore', 'pipe', 'inherit'],
    encoding: 'utf8',
    cwd: process.cwd(),
  });
}

function execJson(args: string[]): WranglerResult[] {
  const out = exec([...args, '--json']);
  const trimmed = out.trim();
  if (!trimmed) return [];
  return JSON.parse(trimmed) as WranglerResult[];
}

function firstColumn(rows: WranglerResult[]): string[] {
  const values: string[] = [];
  for (const block of rows) {
    for (const row of block.results) {
      for (const value of Object.values(row)) {
        if (typeof value === 'string') values.push(value);
      }
    }
  }
  return values;
}

function command(sql: string): void {
  exec(['--command', sql]);
}

function migrationFiles(): string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();
}

function main(): void {
  command(
    `CREATE TABLE IF NOT EXISTS ${TRACKING_TABLE} ` +
      `(name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)`,
  );

  let applied = firstColumn(
    execJson(['--command', `SELECT name FROM ${TRACKING_TABLE}`]),
  );

  // Bootstrap : une base déjà migrée à la main (sans table de suivi) est
  // considérée comme à jour pour toutes les migrations existantes.
  if (applied.length === 0) {
    const users = firstColumn(
      execJson([
        '--command',
        `SELECT name FROM sqlite_master WHERE type='table' AND name='users'`,
      ]),
    );
    if (users.length > 0) {
      for (const file of migrationFiles()) {
        command(
          `INSERT INTO ${TRACKING_TABLE} (name, applied_at) ` +
            `VALUES ('${file}', datetime('now'))`,
        );
      }
      console.log(
        `Base déjà migrée : ${migrationFiles().length} migration(s) marquée(s) comme appliquée(s).`,
      );
      return;
    }
  }

  const appliedSet = new Set(applied);
  let ran = 0;
  for (const file of migrationFiles()) {
    if (appliedSet.has(file)) continue;
    console.log(`→ ${file}`);
    exec(['--file', join(MIGRATIONS_DIR, file)]);
    command(
      `INSERT INTO ${TRACKING_TABLE} (name, applied_at) ` +
        `VALUES ('${file}', datetime('now'))`,
    );
    ran += 1;
  }

  console.log(
    ran === 0
      ? 'Aucune migration à appliquer (base à jour).'
      : `${ran} migration(s) appliquée(s).`,
  );
}

void main();
