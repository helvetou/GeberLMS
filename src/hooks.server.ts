import type { Handle } from '@sveltejs/kit';
import { createDb } from '$lib/server/db';
import { getSessionWithUser } from '$lib/server/auth';
import { isSessionActive } from '$lib/domain/session';
import {
  applyHtmlLocale,
  resolveLocalePrecedence,
  type Locale,
} from '$lib/domain/i18n';

const LOCALE_COOKIE = 'locale';

export const handle: Handle = async ({ event, resolve }) => {
  let userLocale: string | null = null;

  const dbBinding = event.platform?.env?.DB;
  if (dbBinding) {
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
        userLocale = found.user.locale;
      } else {
        event.cookies.delete('session', { path: '/' });
      }
    }
  }

  const locale: Locale = resolveLocalePrecedence({
    cookie: event.cookies.get(LOCALE_COOKIE),
    userLocale,
    acceptLanguage: event.request.headers.get('accept-language'),
  });
  event.locals.locale = locale;

  return resolve(event, {
    transformPageChunk: ({ html }) => applyHtmlLocale(html, locale),
  });
};
