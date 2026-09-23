/**
 * Seed du premier admin dans la D1 (locale par défaut, distante avec --remote).
 *
 * Usage :
 *   SEED_ADMIN_EMAIL=admin@example.com SEED_ADMIN_PASSWORD=changeme \
 *     npx tsx scripts/seed-admin.ts            # locale
 *   SEED_ADMIN_EMAIL=… SEED_ADMIN_PASSWORD=… \
 *     npx tsx scripts/seed-admin.ts --remote   # distante (D1 « geberlms »)
 *
 * Réutilise le hachage du domaine (src/lib/domain/password.ts).
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { hashPassword } from '../src/lib/domain/password';

async function main(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? 'Admin';

  if (!email || !password) {
    console.error('Définir SEED_ADMIN_EMAIL et SEED_ADMIN_PASSWORD.');
    process.exit(1);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const passwordHash = await hashPassword(password);

  const sql = [
    'INSERT INTO users',
    '(id, role, self_payer, email, name, locale, password_hash, status, created_at, updated_at)',
    'VALUES',
    `('${id}', 'admin', 0, '${escapeSql(email)}', '${escapeSql(name)}', 'fr', '${escapeSql(passwordHash)}', 'active', '${now}', '${now}');`,
  ].join(' ');

  const dir = mkdtempSync(join(tmpdir(), 'geberlms-seed-'));
  const file = join(dir, 'seed.sql');
  writeFileSync(file, sql + '\n');

  const remote = process.argv.includes('--remote');
  const target = remote ? 'geberlms' : 'DB';
  const mode = remote ? '--remote' : '--local';

  execFileSync('npx', ['wrangler', 'd1', 'execute', target, mode, '--file', file], {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  console.log(`Admin seedé${remote ? ' (distant)' : ''} : ${email} (id ${id})`);
}

function escapeSql(value: string): string {
  return value.replaceAll("'", "''");
}

void main();
