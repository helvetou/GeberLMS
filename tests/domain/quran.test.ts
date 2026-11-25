import { describe, it, expect } from 'vitest';
import { computePageRanges, pageNumbers, QURAN_TOTAL_PAGES } from '../../src/lib/domain/quran';

const suras = [
  { surahNo: 1, nameAr: 'الفاتحة', nameEn: 'Al-Fatihah', startPage: 1 },
  { surahNo: 2, nameAr: 'البقرة', nameEn: 'Al-Baqarah', startPage: 2 },
  { surahNo: 3, nameAr: 'آل عمران', nameEn: 'Ali Imran', startPage: 50 },
  { surahNo: 114, nameAr: 'الناس', nameEn: 'An-Nas', startPage: 604 },
];

describe('computePageRanges (quran, m11)', () => {
  it('computes end page from the next surah start page', () => {
    const ranges = computePageRanges(suras);
    expect(ranges.get(1)).toEqual({ start: 1, end: 1 });
    expect(ranges.get(2)).toEqual({ start: 2, end: 49 });
    expect(ranges.get(3)).toEqual({ start: 50, end: 603 });
  });

  it('last surah ends at the total page count', () => {
    const ranges = computePageRanges(suras);
    expect(ranges.get(114)).toEqual({ start: 604, end: QURAN_TOTAL_PAGES });
  });

  it('works regardless of input order', () => {
    const shuffled = [suras[2]!, suras[0]!, suras[3]!, suras[1]!];
    const ranges = computePageRanges(shuffled);
    expect(ranges.get(2)).toEqual({ start: 2, end: 49 });
  });
});

describe('pageNumbers', () => {
  it('lists inclusive page numbers', () => {
    expect(pageNumbers(2, 4)).toEqual([2, 3, 4]);
    expect(pageNumbers(1, 1)).toEqual([1]);
  });
});
