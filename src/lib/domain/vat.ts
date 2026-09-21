/**
 * Taux de TVA standard de l'UE (ISO 3166-1 alpha-2).
 *
 * IMPORTANT — ce tableau est un instantané de référence. Les taux évoluent
 * dans le temps (ex. Finlande 25,5 %, Luxembourg 17 %). Il DOIT être
 * re-validé contre une source officielle (Commission européenne / autorités
 * nationales) avant mise en production et à chaque changement de taux.
 */
export const EU_VAT_RATES: Readonly<Record<string, number>> = {
  AT: 20,
  BE: 21,
  BG: 20,
  HR: 25,
  CY: 19,
  CZ: 21,
  DK: 25,
  EE: 22,
  FI: 25.5,
  FR: 20,
  DE: 19,
  EL: 24,
  HU: 27,
  IE: 23,
  IT: 22,
  LV: 21,
  LT: 21,
  LU: 17,
  MT: 18,
  NL: 21,
  PL: 23,
  PT: 23,
  RO: 19,
  SK: 23,
  SI: 22,
  ES: 21,
  SE: 25,
};

/**
 * Taux standard de TVA UE pour un État membre, ou `null` si le code
 * n'est pas un État membre connu.
 */
export function euVatRate(countryCode: string): number | null {
  return EU_VAT_RATES[countryCode.toUpperCase()] ?? null;
}

/**
 * Taux de TVA applicable à un pays d'acheteur.
 * Hors UE => 0 (aucune TVA UE n'est facturée).
 */
export function vatRateForCountry(countryCode: string): number {
  return euVatRate(countryCode) ?? 0;
}
