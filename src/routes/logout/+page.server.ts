import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { deleteSession } from '$lib/server/auth';
import { logActivity } from '$lib/server/activity';
import { ACTIONS as ACTIVITY_ACTIONS } from '$lib/domain/activity';

export const load: PageServerLoad = async ({ cookies, locals, platform }) => {
  const token = cookies.get('session');
  if (token) {
    const dbBinding = platform?.env?.DB;
    if (dbBinding) {
      const db = createDb(dbBinding);
      await logActivity(db, { actorId: locals.user?.id, action: ACTIVITY_ACTIONS.logout });
      await deleteSession(db, token);
    }
    cookies.delete('session', { path: '/' });
  }
  throw redirect(303, '/login');
};
