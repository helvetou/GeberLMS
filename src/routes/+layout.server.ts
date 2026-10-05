import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { DEFAULT_LOCALE, isLocale, type Locale } from '$lib/domain/i18n';

const LOCALE_COOKIE = 'locale';

/**
 * Layout racine : expose la locale et persiste le choix de langue (?locale=…)
 * dans un cookie, puis redirige pour nettoyer la chaîne de requête.
 */
export const load: LayoutServerLoad = async ({ locals, url, cookies }) => {
  const requested = url.searchParams.get('locale');
  if (requested && isLocale(requested)) {
    cookies.set(LOCALE_COOKIE, requested, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: false,
      sameSite: 'lax',
    });
    throw redirect(303, url.pathname || '/');
  }

  const locale: Locale = locals.locale ?? DEFAULT_LOCALE;
  return { locale };
};
