import { asc, eq } from 'drizzle-orm';
import type { R2Bucket } from '@cloudflare/workers-types';
import type { DB } from './db';
import { quranSurahs } from './db/schema';
import { ErrorCodes, type ErrorCode } from '$lib/domain/errors';

export class QuranServiceError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'QuranServiceError';
    this.code = code;
  }
}

export interface SurahRow {
  surahNo: number;
  nameAr: string;
  nameEn: string;
  startPage: number;
  endPage: number;
  tafseerR2Key: string | null;
  hasTafseer: boolean;
}

export interface SurahImport {
  surahNo: number;
  nameAr: string;
  nameEn: string;
  startPage: number;
  endPage: number;
  tafseerR2Key?: string | null;
}

function toRow(r: typeof quranSurahs.$inferSelect): SurahRow {
  return { ...r, hasTafseer: !!r.tafseerR2Key };
}

/** Toutes les sourates, ordonnées, avec un indicateur « tafseer présent ». */
export async function listQuranSurahs(db: DB): Promise<SurahRow[]> {
  const rows = await db.select().from(quranSurahs).orderBy(asc(quranSurahs.surahNo)).all();
  return rows.map(toRow);
}

export async function getQuranSurah(db: DB, surahNo: number): Promise<SurahRow | null> {
  const r = await db.select().from(quranSurahs).where(eq(quranSurahs.surahNo, surahNo)).get();
  return r ? toRow(r) : null;
}

/** Lit le tafseer (markdown) depuis R2. */
export async function getQuranTafseer(
  r2: R2Bucket | undefined,
  surah: SurahRow,
): Promise<string | null> {
  if (!r2 || !surah.tafseerR2Key) return null;
  const obj = await r2.get(surah.tafseerR2Key);
  return obj ? await obj.text() : null;
}

/** Écrit le tafseer (markdown) dans R2 — édition admin. */
export async function updateQuranTafseer(
  db: DB,
  r2: R2Bucket,
  surahNo: number,
  md: string,
): Promise<void> {
  const r = await db.select().from(quranSurahs).where(eq(quranSurahs.surahNo, surahNo)).get();
  if (!r) throw new QuranServiceError(ErrorCodes.SURAH_NOT_FOUND, 'Sourate introuvable');

  const key = r.tafseerR2Key ?? `quran/tafseer/${surahNo}.md`;
  await r2.put(key, md);
  if (!r.tafseerR2Key) {
    await db
      .update(quranSurahs)
      .set({ tafseerR2Key: key })
      .where(eq(quranSurahs.surahNo, surahNo))
      .run();
  }
}

/** Upsert en masse des métadonnées (script d'import). */
export async function upsertQuranSurahs(db: DB, surahs: SurahImport[]): Promise<void> {
  for (const s of surahs) {
    await db
      .insert(quranSurahs)
      .values({
        surahNo: s.surahNo,
        nameAr: s.nameAr,
        nameEn: s.nameEn,
        startPage: s.startPage,
        endPage: s.endPage,
        tafseerR2Key: s.tafseerR2Key ?? null,
      })
      .onConflictDoUpdate({
        target: quranSurahs.surahNo,
        set: {
          nameAr: s.nameAr,
          nameEn: s.nameEn,
          startPage: s.startPage,
          endPage: s.endPage,
          tafseerR2Key: s.tafseerR2Key ?? null,
        },
      })
      .run();
  }
}
