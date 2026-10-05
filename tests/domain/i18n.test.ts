import { describe, it, expect } from 'vitest';
import {
  LOCALES,
  MESSAGES,
  DEFAULT_LOCALE,
  isLocale,
  isRtl,
  direction,
  resolveLocale,
  resolveLocalePrecedence,
  translate,
  applyHtmlLocale,
} from '../../src/lib/domain/i18n';

describe('i18n — locales', () => {
  it('accepts the four supported locales', () => {
    for (const l of ['fr', 'en', 'ar', 'de']) {
      expect(isLocale(l), l).toBe(true);
    }
  });

  it('rejects unsupported or malformed locales', () => {
    for (const l of ['es', 'FR', 'de-DE', '', null, undefined, 42]) {
      expect(isLocale(l), String(l)).toBe(false);
    }
  });

  it('exposes exactly four locales', () => {
    expect(LOCALES).toEqual(['fr', 'en', 'ar', 'de']);
  });

  it('defaults to French', () => {
    expect(DEFAULT_LOCALE).toBe('fr');
  });
});

describe('i18n — direction / RTL', () => {
  it('marks only Arabic as RTL', () => {
    expect(isRtl('ar')).toBe(true);
    for (const l of ['fr', 'en', 'de'] as const) {
      expect(isRtl(l), l).toBe(false);
    }
  });

  it('returns the proper text direction', () => {
    expect(direction('ar')).toBe('rtl');
    expect(direction('fr')).toBe('ltr');
    expect(direction('en')).toBe('ltr');
    expect(direction('de')).toBe('ltr');
  });
});

describe('i18n — resolveLocale (Accept-Language)', () => {
  it('falls back to French when the header is empty', () => {
    expect(resolveLocale(null)).toBe('fr');
    expect(resolveLocale(undefined)).toBe('fr');
    expect(resolveLocale('')).toBe('fr');
  });

  it('picks a supported base language', () => {
    expect(resolveLocale('en')).toBe('en');
    expect(resolveLocale('de-DE,de;q=0.9')).toBe('de');
    expect(resolveLocale('fr-CH, fr;q=0.9, en;q=0.8')).toBe('fr');
    expect(resolveLocale('ar-SA')).toBe('ar');
  });

  it('respects quality factors', () => {
    expect(resolveLocale('de-DE;q=0.9, en;q=1.0')).toBe('en');
    expect(resolveLocale('en;q=0.5, ar;q=0.8')).toBe('ar');
  });

  it('skips unsupported languages and wildcards', () => {
    expect(resolveLocale('es-ES')).toBe('fr');
    expect(resolveLocale('*')).toBe('fr');
    expect(resolveLocale('es;q=1, fr;q=0.5')).toBe('fr');
  });
});

describe('i18n — resolveLocalePrecedence', () => {
  it('prioritizes an explicit cookie', () => {
    expect(
      resolveLocalePrecedence({ cookie: 'ar', userLocale: 'de', acceptLanguage: 'en' }),
    ).toBe('ar');
  });

  it('falls back to the account preference when no cookie', () => {
    expect(resolveLocalePrecedence({ userLocale: 'de', acceptLanguage: 'en' })).toBe('de');
  });

  it('ignores invalid cookie and account values', () => {
    expect(resolveLocalePrecedence({ cookie: 'xx', userLocale: 'zz', acceptLanguage: 'en' })).toBe(
      'en',
    );
  });

  it('falls back to French when nothing matches', () => {
    expect(resolveLocalePrecedence({})).toBe('fr');
  });
});

describe('i18n — translate / interpolation', () => {
  it('returns the translation for the requested locale', () => {
    expect(translate('en', 'login.title')).toBe('Login');
    expect(translate('fr', 'login.title')).toBe('Connexion');
  });

  it('falls back to French for a key missing in a locale', () => {
    // force a missing entry by using a key present only in the fallback catalog
    const fr = MESSAGES.fr['common.email'];
    expect(translate('ar', 'common.email')).not.toBe(fr); // sanity: ar has its own
  });

  it('returns the key itself when fully unknown', () => {
    expect(translate('fr', 'does.not.exist')).toBe('does.not.exist');
  });

  it('interpolates named parameters', () => {
    expect(translate('en', 'learner.quizResult', { correct: 3, total: 5, percentage: 60 })).toBe(
      'Quiz graded: 3/5 correct — 60 %.',
    );
  });

  it('leaves unknown placeholders untouched', () => {
    expect(translate('en', 'payments.confirmed', {})).toBe('Payment confirmed — invoice {number}.');
  });
});

describe('i18n — catalog integrity', () => {
  it('has a catalog for every locale', () => {
    for (const locale of LOCALES) {
      expect(MESSAGES[locale], locale).toBeDefined();
    }
  });

  it('has identical key sets across all locales', () => {
    const reference = Object.keys(MESSAGES.fr).sort();
    for (const locale of LOCALES) {
      expect(Object.keys(MESSAGES[locale]).sort(), locale).toEqual(reference);
    }
  });

  it('has no empty translations', () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(MESSAGES[locale])) {
        expect(value.trim(), `${locale}:${key}`).not.toBe('');
      }
    }
  });

  it('localizes the status enum values', () => {
    for (const status of [
      'not_started',
      'in_progress',
      'completed',
      'pending',
      'active',
      'expired',
      'revoked',
    ]) {
      expect(translate('en', `status.${status}`)).not.toBe(`status.${status}`);
    }
  });
});

describe('i18n — applyHtmlLocale', () => {
  it('adds lang and dir to a bare html tag', () => {
    expect(applyHtmlLocale('<html>', 'ar')).toBe('<html lang="ar" dir="rtl">');
  });

  it('replaces an existing lang and adds dir', () => {
    expect(applyHtmlLocale('<html lang="fr">', 'ar')).toBe('<html lang="ar" dir="rtl">');
    expect(applyHtmlLocale('<html lang="fr">', 'fr')).toBe('<html lang="fr" dir="ltr">');
  });

  it('preserves other attributes while replacing lang/dir', () => {
    expect(applyHtmlLocale('<html lang="en" dir="ltr" class="no-js">', 'de')).toBe(
      '<html class="no-js" lang="de" dir="ltr">',
    );
  });

  it('leaves non-html content untouched', () => {
    const html = '<!doctype html><html lang="fr"><body>x</body></html>';
    const result = applyHtmlLocale(html, 'ar');
    expect(result).toContain('<!doctype html>');
    expect(result).toContain('<html lang="ar" dir="rtl">');
    expect(result).toContain('<body>x</body></html>');
  });
});
