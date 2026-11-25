/**
 * Réinitialise le mot de passe d'un compte par email (tout rôle : admin,
 * tuteur, apprenant).
 *
 * Usage :
 *   RESET_EMAIL=tuteur@x.fr RESET_PASSWORD=NouveauPass123! \
 *     npx tsx scripts/reset-password.ts            # locale
 *   RESET_EMAIL=… RESET_PASSWORD=… \
 *     npx tsx scripts/reset-password.ts --remote   # distante (D1 « geberlms »)
 *
 * Réutilise le hachage du domaine (src/lib/domain/password.ts).
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { hashPassword } from '../src/lib/domain/password';

async function main(): Promise<void> {
  const email = process.env.RESET_EMAIL;
  const password = process.env.RESET_PASSWORD;

  if (!email || !password) {
    console.error('Définir RESET_EMAIL et RESET_PASSWORD.');
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();

  const sql = [
    'UPDATE users',
    `SET password_hash = '${escapeSql(passwordHash)}', updated_at = '${now}'`,
    `WHERE email = '${escapeSql(email)}';`,
  ].join(' ');

  const dir = mkdtempSync(join(tmpdir(), 'geberlms-reset-'));
  const file = join(dir, 'reset.sql');
  writeFileSync(file, sql + '\n');

  const remote = process.argv.includes('--remote');
  const target = remote ? 'geberlms' : 'DB';
  const mode = remote ? '--remote' : '--local';

  execFileSync('npx', ['wrangler', 'd1', 'execute', target, mode, '--file', file], {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  console.log(
    `Mot de passe réinitialisé${remote ? ' (distant)' : ''} pour ${email}. ` +
      `(si l'email n'existe pas, aucune ligne n'a été modifiée)`,
  );
}

function escapeSql(value: string): string {
  return value.replaceAll("'", "''");
}

void main();
