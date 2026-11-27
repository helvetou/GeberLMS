import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { getAdminCourseDetail } from '$lib/server/catalog';
import { ErrorCodes } from '$lib/domain/errors';

/** Détail d'un cours en lecture (admin) : métadonnées + programme complet. */
export const load: PageServerLoad = async ({ locals, params, platform }) => {
  if (locals.user?.role !== 'admin') {
    throw redirect(303, '/login');
  }
  const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
  if (!db) return { detail: null, error: ErrorCodes.DB_UNAVAILABLE };
  const detail = await getAdminCourseDetail(db, params.id);
  return { detail };
};
