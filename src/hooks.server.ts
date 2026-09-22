import type { Handle } from '@sveltejs/kit';
import { createDb } from '$lib/server/db';
import { getSessionWithUser } from '$lib/server/auth';
import { isSessionActive } from '$lib/domain/session';

export const handle: Handle = async ({ event, resolve }) => {
  const dbBinding = event.platform?.env?.DB;
  if (!dbBinding) {
    return resolve(event);
  }

  const db = createDb(dbBinding);
  const token = event.cookies.get('session');
  if (token) {
    const found = await getSessionWithUser(db, token);
    if (
      found &&
      isSessionActive({
        token: found.session.token,
        userId: found.session.userId,
        createdAt: found.session.createdAt,
        expiresAt: found.session.expiresAt,
      })
    ) {
      event.locals.user = {
        id: found.user.id,
        role: found.user.role,
        email: found.user.email,
        name: found.user.name,
      };
      event.locals.sessionToken = token;
    } else {
      event.cookies.delete('session', { path: '/' });
    }
  }

  return resolve(event);
};
