import { fail, redirect, type Actions } from '@sveltejs/kit';
import { createDb } from '$lib/server/db';
import { verifyLogin, issueSession } from '$lib/server/auth';
import { logActivity } from '$lib/server/activity';
import { ACTIONS as ACTIVITY_ACTIONS } from '$lib/domain/activity';

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
      await logActivity(db, { action: ACTIVITY_ACTIONS.loginFailed });
      return fail(400, { error: 'Identifiants invalides' });
    }

    await logActivity(db, { actorId: user.id, action: ACTIVITY_ACTIONS.login });
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
