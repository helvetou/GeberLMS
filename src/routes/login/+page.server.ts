import { fail, redirect, type Actions } from '@sveltejs/kit';
import { createDb } from '$lib/server/db';
import { verifyLogin, issueSession } from '$lib/server/auth';

export const actions: Actions = {
  default: async ({ request, cookies, platform }) => {
    const dbBinding = platform?.env?.DB;
    if (!dbBinding) {
      return fail(503, { error: 'Base de données indisponible' });
    }

    const data = await request.formData();
    const email = String(data.get('email') ?? '').trim();
    const password = String(data.get('password') ?? '');

    if (!email || !password) {
      return fail(400, { error: 'Email et mot de passe requis' });
    }

    const db = createDb(dbBinding);
    const user = await verifyLogin(db, email, password);
    if (!user) {
      return fail(400, { error: 'Identifiants invalides' });
    }

    const session = await issueSession(db, user.id);
    cookies.set('session', session.token, {
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      expires: new Date(session.expiresAt),
    });

    throw redirect(303, '/');
  },
};
