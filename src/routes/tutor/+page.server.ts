import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { getTutorDashboardView } from '$lib/server/dashboard';

export const load: PageServerLoad = async ({ locals, platform }) => {
  if (!locals.user) {
    throw redirect(303, '/login');
  }
  if (locals.user.role !== 'tutor') {
    throw redirect(303, '/');
  }

  const dbBinding = platform?.env?.DB;
  if (!dbBinding) {
    return { view: null, error: 'Base de données indisponible' };
  }

  const db = createDb(dbBinding);
  const view = await getTutorDashboardView(db, locals.user.id);
  return { view, userName: locals.user.name ?? locals.user.email };
};
