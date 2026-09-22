/**
 * Seed de démonstration dans la D1 locale : un tuteur, un apprenant financé,
 * un cours, une leçon, une inscription et une progression.
 *
 * Usage :
 *   npx tsx scripts/seed-demo.ts
 *   # mot de passe tuteur : SEED_DEMO_TUTOR_PASSWORD (défaut DemoTutor123!)
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { hashPassword } from '../src/lib/domain/password';

async function main(): Promise<void> {
  const password = process.env.SEED_DEMO_TUTOR_PASSWORD ?? 'DemoTutor123!';
  const tutorHash = await hashPassword(password);
  const now = new Date().toISOString();

  const sql = `
DELETE FROM progress WHERE id = 'demo-progress';
DELETE FROM enrollments WHERE id = 'demo-enroll';
DELETE FROM guardianships WHERE tutor_id = 'demo-tutor';
DELETE FROM lessons WHERE id = 'demo-lesson';
DELETE FROM modules WHERE id = 'demo-module';
DELETE FROM courses WHERE id = 'demo-course';
DELETE FROM users WHERE id IN ('demo-tutor', 'demo-learner');

INSERT INTO users (id, role, self_payer, email, name, locale, password_hash, status, created_at, updated_at)
VALUES ('demo-tutor', 'tutor', 0, 'tutor@demo.ee', 'Tuteur Démo', 'fr', '${tutorHash}', 'active', '${now}', '${now}');

INSERT INTO users (id, role, self_payer, email, name, locale, password_hash, status, created_at, updated_at)
VALUES ('demo-learner', 'learner', 0, 'learner@demo.ee', 'Élève Démo', 'fr', NULL, 'active', '${now}', '${now}');

INSERT INTO guardianships (tutor_id, learner_id, created_at)
VALUES ('demo-tutor', 'demo-learner', '${now}');

INSERT INTO courses (id, slug, title, language, visibility, created_at, updated_at)
VALUES ('demo-course', 'fr-demo', 'Français débutant', 'fr', 'visible', '${now}', '${now}');

INSERT INTO modules (id, course_id, position, title, visibility, created_at)
VALUES ('demo-module', 'demo-course', 0, 'Module 1', 'visible', '${now}');

INSERT INTO lessons (id, module_id, position, title, type, visibility, created_at)
VALUES ('demo-lesson', 'demo-module', 0, 'Leçon 1', 'text', 'visible', '${now}');

INSERT INTO enrollments (id, learner_id, course_id, payer_id, status, net_cents, vat_rate_percent, vat_cents, total_cents, created_at)
VALUES ('demo-enroll', 'demo-learner', 'demo-course', 'demo-tutor', 'active', 10000, 20, 2000, 12000, '${now}');

INSERT INTO progress (id, enrollment_id, lesson_id, status, updated_at)
VALUES ('demo-progress', 'demo-enroll', 'demo-lesson', 'completed', '${now}');
`;

  const dir = mkdtempSync(join(tmpdir(), 'geberlms-demo-'));
  const file = join(dir, 'seed.sql');
  writeFileSync(file, sql);

  execFileSync('npx', ['wrangler', 'd1', 'execute', 'DB', '--local', '--file', file], {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  console.log(`Demo seedée. Tuteur : tutor@demo.ee / ${password}`);
}

void main();
