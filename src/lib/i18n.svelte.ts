import { getContext, setContext } from 'svelte';
import {
  direction,
  translate,
  type Direction,
  type Locale,
  type MessageParams,
} from '$lib/domain/i18n';

/**
 * Internationalisation de l'interface via contexte Svelte. Le layout racine
 * initialise le contexte à partir de la locale résolue côté serveur ; les pages
 * consomment `t` via `useI18n()`. La direction (LTR/RTL) est dérivée du même
 * contexte.
 */

export interface I18n {
  locale: Locale;
  dir: Direction;
  t(key: string, params?: MessageParams): string;
  tStatus(value: string): string;
}

export const I18N_KEY: symbol = Symbol('i18n');

export function initI18n(locale: Locale): I18n {
  const i18n: I18n = {
    locale,
    dir: direction(locale),
    t: (key, params) => translate(locale, key, params),
    tStatus: (value) => {
      const key = `status.${value}`;
      const result = translate(locale, key);
      return result === key ? value : result;
    },
  };
  setContext(I18N_KEY, i18n);
  return i18n;
}

export function useI18n(): I18n {
  return getContext<I18n>(I18N_KEY);
}
