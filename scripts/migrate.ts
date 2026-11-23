/**
 * Runner de migrations idempotent pour D1 (audit §7.3).
 *
 * Trace les migrations appliquées dans `schema_migrations` et tolère une base
 * déjà migrée « à la main » : les migrations CREATE sont idempotentes
 * (`IF NOT EXISTS`), et les migrations `ALTER TABLE … ADD COLUMN` sont
 * détectées comme déjà appliquées via l'erreur « duplicate column ».
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
    stdio: ['ignore', 'pipe', 'pipe'],
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

/** Applique un fichier de migration, en tolérant qu'il soit déjà appliqué. */
function applyFile(file: string): boolean {
  try {
    exec(['--file', join(MIGRATIONS_DIR, file)]);
    return true;
  } catch (err) {
    const detail = `${(err as { stderr?: string }).stderr ?? ''} ${String(err)}`;
    if (/already exists|duplicate column/i.test(detail)) {
      return false; // déjà appliqué
    }
    throw err;
  }
}

function main(): void {
  command(
    `CREATE TABLE IF NOT EXISTS ${TRACKING_TABLE} ` +
      `(name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)`,
  );

  const applied = new Set(firstColumn(execJson(['--command', `SELECT name FROM ${TRACKING_TABLE}`])));

  let ran = 0;
  let skipped = 0;
  for (const file of migrationFiles()) {
    if (applied.has(file)) continue;
    const appliedNow = applyFile(file);
    command(
      `INSERT OR IGNORE INTO ${TRACKING_TABLE} (name, applied_at) ` +
        `VALUES ('${file}', datetime('now'))`,
    );
    if (appliedNow) {
      console.log(`→ ${file}`);
      ran += 1;
    } else {
      console.log(`· ${file} (déjà appliquée — marquée)`);
      skipped += 1;
    }
  }

  console.log(
    ran === 0 && skipped === 0
      ? 'Aucune migration à appliquer (base à jour).'
      : `${ran} appliquée(s), ${skipped} déjà présente(s).`,
  );
}

void main();
