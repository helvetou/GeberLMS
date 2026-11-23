import type { PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { getPublicCourseBySlug } from '$lib/server/catalog';
import { ErrorCodes } from '$lib/domain/errors';

/** Détail public d'un cours (anonyme) : métadonnées + programme visible. */
export const load: PageServerLoad = async ({ params, platform }) => {
  const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
  if (!db) return { detail: null, error: ErrorCodes.DB_UNAVAILABLE };
  const detail = await getPublicCourseBySlug(db, params.slug);
  return { detail };
};
