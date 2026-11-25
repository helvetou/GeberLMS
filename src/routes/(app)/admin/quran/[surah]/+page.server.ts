import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { getQuranSurah, getQuranTafseer, updateQuranTafseer, QuranServiceError } from '$lib/server/quran';
import { ErrorCodes } from '$lib/domain/errors';

export const load: PageServerLoad = async ({ locals, params, platform }) => {
  if (locals.user?.role !== 'admin') throw redirect(303, '/login');
  const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
  if (!db) return { surah: null, tafseer: null, error: ErrorCodes.DB_UNAVAILABLE };

  const n = Number(params.surah);
  const surah = Number.isInteger(n) && n >= 1 && n <= 114 ? await getQuranSurah(db, n) : null;
  const tafseer = surah ? await getQuranTafseer(platform?.env?.FILES, surah) : null;
  return { surah, tafseer };
};

export const actions: Actions = {
  save: async ({ request, locals, params, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: ErrorCodes.ACCESS_DENIED });
    const dbBinding = platform?.env?.DB;
    const r2 = platform?.env?.FILES;
    if (!dbBinding) return fail(503, { error: ErrorCodes.DB_UNAVAILABLE });
    if (!r2) return fail(503, { error: ErrorCodes.STORAGE_UNAVAILABLE });

    const data = await request.formData();
    const tafseerMd = String(data.get('tafseerMd') ?? '');

    try {
      await updateQuranTafseer(createDb(dbBinding), r2, Number(params.surah), tafseerMd);
      return { ok: true, saved: true };
    } catch (err) {
      if (err instanceof QuranServiceError) return fail(400, { error: err.code });
      throw err;
    }
  },
};
