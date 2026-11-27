import { ErrorCodes } from '$lib/domain/errors';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb, type DB } from '$lib/server/db';
import { listAdminCatalog, createCourse, CatalogServiceError } from '$lib/server/catalog';
import { importCourse } from '$lib/server/import';
import { ImportError } from '$lib/domain/import';
import { listTutors } from '$lib/server/auth';

function getDb(platform: App.Platform | undefined): DB | null {
  return platform?.env?.DB ? createDb(platform.env.DB) : null;
}

export const load: PageServerLoad = async ({ locals, platform }) => {
  if (locals.user?.role !== 'admin') {
    throw redirect(303, '/login');
  }
  const db = getDb(platform);
  if (!db) {
    return { catalog: [], tutors: [], error: ErrorCodes.DB_UNAVAILABLE };
  }
  return { catalog: await listAdminCatalog(db), tutors: await listTutors(db) };
};

async function run(
  platform: App.Platform | undefined,
  fn: (db: DB) => Promise<unknown>,
): Promise<{ ok: true } | { error: string }> {
  const db = getDb(platform);
  if (!db) return { error: ErrorCodes.DB_UNAVAILABLE };
  try {
    await fn(db);
    return { ok: true };
  } catch (err) {
    if (err instanceof CatalogServiceError) {
      return { error: err.code };
    }
    throw err;
  }
}

export const actions: Actions = {
  createCourse: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: ErrorCodes.ACCESS_DENIED });
    const data = await request.formData();
    const res = await run(platform, (db) =>
      createCourse(db, {
        title: String(data.get('title') ?? ''),
        slug: String(data.get('slug') ?? ''),
        language: String(data.get('language') ?? ''),
        priceCents: String(data.get('priceCents') ?? '0'),
        description: String(data.get('description') ?? '') || undefined,
        category: String(data.get('category') ?? '') || undefined,
        level: String(data.get('level') ?? '') || undefined,
        isPublic: data.get('isPublic') === 'on',
        tutorId: String(data.get('tutorId') ?? '') || undefined,
      }),
    );
    if ('error' in res) return fail(400, res);
    throw redirect(303, '/admin/courses');
  },

  importCourse: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: ErrorCodes.ACCESS_DENIED });
    const data = await request.formData();
    const jsonText = String(data.get('json') ?? '').trim();
    const mode = String(data.get('mode') ?? 'strict') === 'upsert' ? 'upsert' : 'strict';
    if (!jsonText) return fail(400, { error: ErrorCodes.PARAMS_REQUIRED });

    let raw: unknown;
    try {
      raw = JSON.parse(jsonText);
    } catch {
      return fail(400, { error: ErrorCodes.IMPORT_INVALID });
    }

    const db = getDb(platform);
    if (!db) return fail(503, { error: ErrorCodes.DB_UNAVAILABLE });

    try {
      const result = await importCourse(db, raw, mode);
      return { ok: true, slug: result.slug, modules: result.modules, lessons: result.lessons };
    } catch (err) {
      if (err instanceof ImportError) return fail(400, { error: err.code });
      throw err;
    }
  },
};
