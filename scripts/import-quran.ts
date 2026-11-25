/**
 * Importe le cours Quran (Warsh) :
 *   - métadonnées des sourates + plages de pages → D1 (quran_surahs)
 *   - texte du tafseer (markdown) → R2 (quran/tafseer/<n>.md)
 *
 * Sources (répertoire qurandb) :
 *   - out604/pages.json  → sourates (numéro, noms, page de départ)
 *   - <N>_*.md           → tafseer markdown (ex. 1_Al-Fatihah.md)
 *
 * Usage :
 *   npx tsx scripts/import-quran.ts            # locale
 *   npx tsx scripts/import-quran.ts --remote   # distante (D1 + R2 « geberlms-files »)
 */
import { readFileSync, readdirSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { computePageRanges, type SurahRef } from '../src/lib/domain/quran';

const QURAN_DIR = join(process.cwd(), 'input', 'forcastedcourses', 'qurandb');
const PAGES_JSON = join(QURAN_DIR, 'out604', 'pages.json');
const R2_BUCKET = 'geberlms-files';

function main(): void {
  const bundle = JSON.parse(readFileSync(PAGES_JSON, 'utf8')) as {
    suras: Record<string, { sura_no: number; sura_name_ar: string; sura_name_en: string; start_page: number }>;
  };

  const surahs: SurahRef[] = Object.values(bundle.suras).map((s) => ({
    surahNo: Number(s.sura_no),
    nameAr: String(s.sura_name_ar ?? '').trim(),
    nameEn: String(s.sura_name_en ?? '').trim(),
    startPage: Number(s.start_page),
  }));

  const ranges = computePageRanges(surahs);

  const tafseerFiles = new Map<number, string>();
  for (const f of readdirSync(QURAN_DIR)) {
    const m = f.match(/^(\d+)_.*\.md$/);
    if (m) tafseerFiles.set(Number(m[1]), join(QURAN_DIR, f));
  }

  const remote = process.argv.includes('--remote');
  const target = remote ? 'geberlms' : 'DB';
  const d1Mode = remote ? '--remote' : '--local';
  const r2Mode = remote ? '--remote' : '--local';

  // 1) Métadonnées → D1 (petites lignes, pas de limite de statement)
  const sql = surahs.map((s) => {
    const range = ranges.get(s.surahNo)!;
    const key = tafseerFiles.has(s.surahNo) ? `quran/tafseer/${s.surahNo}.md` : null;
    return (
      `INSERT INTO quran_surahs (surah_no, name_ar, name_en, start_page, end_page, tafseer_r2_key) VALUES (` +
      `${s.surahNo}, '${esc(s.nameAr)}', '${esc(s.nameEn)}', ${range.start}, ${range.end}, ` +
      `${key ? `'${key}'` : 'NULL'}) ` +
      `ON CONFLICT(surah_no) DO UPDATE SET name_ar=excluded.name_ar, name_en=excluded.name_en, ` +
      `start_page=excluded.start_page, end_page=excluded.end_page, tafseer_r2_key=excluded.tafseer_r2_key;`
    );
  });

  const dir = mkdtempSync(join(tmpdir(), 'geberlms-quran-'));
  const file = join(dir, 'quran.sql');
  writeFileSync(file, sql.join('\n') + '\n');
  execFileSync('npx', ['wrangler', 'd1', 'execute', target, d1Mode, '--file', file], {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  // 2) Tafseer → R2 (fichiers, pas de limite SQL)
  for (const [surahNo, path] of tafseerFiles) {
    const key = `quran/tafseer/${surahNo}.md`;
    execFileSync(
      'npx',
      ['wrangler', 'r2', 'object', 'put', `${R2_BUCKET}/${key}`, '--file', path, r2Mode],
      { stdio: 'inherit', cwd: process.cwd() },
    );
  }

  console.log(
    `Quran importé${remote ? ' (distant)' : ''} : ${surahs.length} sourates, ` +
      `${tafseerFiles.size} tafseer dans R2.`,
  );
}

function esc(value: string): string {
  return value.replaceAll("'", "''");
}

void main();
