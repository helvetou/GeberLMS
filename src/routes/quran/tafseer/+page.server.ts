import type { PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { listQuranSurahs } from '$lib/server/quran';
import { ErrorCodes } from '$lib/domain/errors';

/** Liste des sourates avec leur tafseer (cours Quran — Warsh). */
export const load: PageServerLoad = async ({ platform }) => {
  const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
  if (!db) return { surahs: [], error: ErrorCodes.DB_UNAVAILABLE };
  return { surahs: await listQuranSurahs(db) };
};
