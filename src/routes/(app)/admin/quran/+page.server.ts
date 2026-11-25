import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { listQuranSurahs } from '$lib/server/quran';
import { ErrorCodes } from '$lib/domain/errors';

/** Administration du tafseer du Quran (liste des sourates). */
export const load: PageServerLoad = async ({ locals, platform }) => {
  if (locals.user?.role !== 'admin') throw redirect(303, '/login');
  const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
  if (!db) return { surahs: [], error: ErrorCodes.DB_UNAVAILABLE };
  return { surahs: await listQuranSurahs(db) };
};
