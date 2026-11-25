/**
 * Quran — Riwayat Warsh : plages de pages du Mushaf par sourate.
 *
 * Pas de synchronisation au verset près : une sourate couvre une plage de
 * pages continue [start, end], calculée à partir des pages de départ.
 */
export interface SurahRef {
  surahNo: number;
  nameAr: string;
  nameEn: string;
  startPage: number;
}

export interface SurahPageRange {
  start: number;
  end: number;
}

export const QURAN_TOTAL_PAGES = 604;

/**
 * Calcule la plage de pages de chaque sourate : la page de fin est la page de
 * départ de la sourate suivante moins un (la dernière s'étend jusqu'à la fin).
 */
export function computePageRanges(
  surahs: readonly SurahRef[],
  totalPages: number = QURAN_TOTAL_PAGES,
): Map<number, SurahPageRange> {
  const sorted = [...surahs].sort((a, b) => a.surahNo - b.surahNo);
  const map = new Map<number, SurahPageRange>();
  sorted.forEach((s, i) => {
    const end = i + 1 < sorted.length ? sorted[i + 1]!.startPage - 1 : totalPages;
    map.set(s.surahNo, { start: s.startPage, end });
  });
  return map;
}

/** Liste des numéros de pages d'une plage (pour l'affichage/liens). */
export function pageNumbers(start: number, end: number): number[] {
  const out: number[] = [];
  for (let p = start; p <= end; p++) out.push(p);
  return out;
}
