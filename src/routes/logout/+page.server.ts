import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { deleteSession } from '$lib/server/auth';

export const load: PageServerLoad = async ({ cookies, platform }) => {
  const token = cookies.get('session');
  if (token) {
    const dbBinding = platform?.env?.DB;
    if (dbBinding) {
      await deleteSession(createDb(dbBinding), token);
    }
    cookies.delete('session', { path: '/' });
  }
  throw redirect(303, '/login');
};
