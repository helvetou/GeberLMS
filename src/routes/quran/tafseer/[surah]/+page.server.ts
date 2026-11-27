import type { PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { getQuranSurah, getQuranTafseer, getQuranTafseerHtml } from '$lib/server/quran';
import { renderMarkdown } from '$lib/server/reader';
import { pageNumbers } from '$lib/domain/quran';
import { ErrorCodes } from '$lib/domain/errors';

/** Tafseer d'une sourate + pages du Mushaf (Warsh) qui la contiennent. */
export const load: PageServerLoad = async ({ params, platform }) => {
  const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
  if (!db) return { surah: null, pages: [], tafseerHtml: null, error: ErrorCodes.DB_UNAVAILABLE };

  const n = Number(params.surah);
  const surah = Number.isInteger(n) && n >= 1 && n <= 114 ? await getQuranSurah(db, n) : null;
  if (!surah) return { surah: null, pages: [], tafseerHtml: null };

  const pages = pageNumbers(surah.startPage, surah.endPage);
  const htmlVersion = await getQuranTafseerHtml(platform?.env?.FILES, n);
  const md = htmlVersion ? null : await getQuranTafseer(platform?.env?.FILES, surah);
  const tafseerHtml = md ? renderMarkdown(md) : null;
  return { surah, pages, tafseerHtml, tafseerHtmlRaw: htmlVersion };
};
