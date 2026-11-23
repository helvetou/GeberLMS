import type { PageServerLoad } from './$types';
import { createDb } from '$lib/server/db';
import { listPublicCatalog } from '$lib/server/catalog';
import { filterCourses, type CatalogFilters } from '$lib/domain/catalog';
import { isLanguage, type Language } from '$lib/domain/content';
import { ErrorCodes } from '$lib/domain/errors';

/**
 * Catalogue public (anonyme) — FR-catalogue : cours visibles et marqués publics,
 * avec recherche et filtres (catégorie, niveau, langue) via chaîne de requête.
 */
export const load: PageServerLoad = async ({ url, platform }) => {
  const db = platform?.env?.DB ? createDb(platform.env.DB) : null;
  if (!db) {
    return { courses: [], categories: [], levels: [], error: ErrorCodes.DB_UNAVAILABLE };
  }

  const all = await listPublicCatalog(db);
  const langParam = url.searchParams.get('language') ?? '';
  const filters: CatalogFilters = {
    query: url.searchParams.get('q') ?? undefined,
    category: url.searchParams.get('category') ?? undefined,
    level: url.searchParams.get('level') ?? undefined,
    language: isLanguage(langParam) ? (langParam as Language) : undefined,
  };

  const courses = filterCourses(all, filters);
  const categories = [...new Set(all.map((c) => c.category).filter(Boolean))].sort();
  const levels = [...new Set(all.map((c) => c.level).filter(Boolean))].sort();

  return { courses, categories, levels, filters };
};
