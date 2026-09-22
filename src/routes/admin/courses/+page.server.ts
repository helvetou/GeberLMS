import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { createDb, type DB } from '$lib/server/db';
import {
  listAdminCatalog,
  createCourse,
  renameCourse,
  setCourseVisibility,
  deleteCourse,
  createModule,
  renameModule,
  setModuleVisibility,
  deleteModule,
  createLesson,
  renameLesson,
  setLessonVisibility,
  deleteLesson,
  createResource,
  renameResource,
  setResourceVisibility,
  deleteResource,
  CatalogServiceError,
} from '$lib/server/catalog';

function getDb(platform: App.Platform | undefined): DB | null {
  return platform?.env?.DB ? createDb(platform.env.DB) : null;
}

export const load: PageServerLoad = async ({ locals, platform }) => {
  if (locals.user?.role !== 'admin') {
    throw redirect(303, '/login');
  }
  const db = getDb(platform);
  if (!db) {
    return { catalog: [], error: 'Base de données indisponible' };
  }
  return { catalog: await listAdminCatalog(db) };
};

async function run(
  platform: App.Platform | undefined,
  fn: (db: DB) => Promise<unknown>,
): Promise<{ ok: true } | { error: string }> {
  const db = getDb(platform);
  if (!db) return { error: 'Base de données indisponible' };
  try {
    await fn(db);
    return { ok: true };
  } catch (err) {
    if (err instanceof CatalogServiceError) {
      return { error: err.message };
    }
    throw err;
  }
}

export const actions: Actions = {
  createCourse: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: 'Accès refusé' });
    const data = await request.formData();
    const res = await run(platform, (db) =>
      createCourse(db, {
        title: String(data.get('title') ?? ''),
        slug: String(data.get('slug') ?? ''),
        language: String(data.get('language') ?? ''),
        priceCents: String(data.get('priceCents') ?? '0'),
      }),
    );
    if ('error' in res) return fail(400, res);
    throw redirect(303, '/admin/courses');
  },

  renameCourse: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: 'Accès refusé' });
    const data = await request.formData();
    const res = await run(platform, (db) =>
      renameCourse(db, String(data.get('id') ?? ''), String(data.get('title') ?? '')),
    );
    if ('error' in res) return fail(400, res);
    throw redirect(303, '/admin/courses');
  },

  toggleCourse: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: 'Accès refusé' });
    const data = await request.formData();
    const res = await run(platform, (db) =>
      setCourseVisibility(db, String(data.get('id') ?? ''), String(data.get('visibility') ?? '')),
    );
    if ('error' in res) return fail(400, res);
    throw redirect(303, '/admin/courses');
  },

  deleteCourse: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: 'Accès refusé' });
    const data = await request.formData();
    const res = await run(platform, (db) => deleteCourse(db, String(data.get('id') ?? '')));
    if ('error' in res) return fail(400, res);
    throw redirect(303, '/admin/courses');
  },

  createModule: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: 'Accès refusé' });
    const data = await request.formData();
    const res = await run(platform, (db) =>
      createModule(db, {
        courseId: String(data.get('courseId') ?? ''),
        title: String(data.get('title') ?? ''),
        position: String(data.get('position') ?? '0'),
      }),
    );
    if ('error' in res) return fail(400, res);
    throw redirect(303, '/admin/courses');
  },

  renameModule: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: 'Accès refusé' });
    const data = await request.formData();
    const res = await run(platform, (db) =>
      renameModule(db, String(data.get('id') ?? ''), String(data.get('title') ?? '')),
    );
    if ('error' in res) return fail(400, res);
    throw redirect(303, '/admin/courses');
  },

  toggleModule: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: 'Accès refusé' });
    const data = await request.formData();
    const res = await run(platform, (db) =>
      setModuleVisibility(db, String(data.get('id') ?? ''), String(data.get('visibility') ?? '')),
    );
    if ('error' in res) return fail(400, res);
    throw redirect(303, '/admin/courses');
  },

  deleteModule: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: 'Accès refusé' });
    const data = await request.formData();
    const res = await run(platform, (db) => deleteModule(db, String(data.get('id') ?? '')));
    if ('error' in res) return fail(400, res);
    throw redirect(303, '/admin/courses');
  },

  createLesson: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: 'Accès refusé' });
    const data = await request.formData();
    const res = await run(platform, (db) =>
      createLesson(db, {
        moduleId: String(data.get('moduleId') ?? ''),
        title: String(data.get('title') ?? ''),
        type: String(data.get('type') ?? ''),
        position: String(data.get('position') ?? '0'),
      }),
    );
    if ('error' in res) return fail(400, res);
    throw redirect(303, '/admin/courses');
  },

  renameLesson: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: 'Accès refusé' });
    const data = await request.formData();
    const res = await run(platform, (db) =>
      renameLesson(db, String(data.get('id') ?? ''), String(data.get('title') ?? '')),
    );
    if ('error' in res) return fail(400, res);
    throw redirect(303, '/admin/courses');
  },

  toggleLesson: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: 'Accès refusé' });
    const data = await request.formData();
    const res = await run(platform, (db) =>
      setLessonVisibility(db, String(data.get('id') ?? ''), String(data.get('visibility') ?? '')),
    );
    if ('error' in res) return fail(400, res);
    throw redirect(303, '/admin/courses');
  },

  deleteLesson: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: 'Accès refusé' });
    const data = await request.formData();
    const res = await run(platform, (db) => deleteLesson(db, String(data.get('id') ?? '')));
    if ('error' in res) return fail(400, res);
    throw redirect(303, '/admin/courses');
  },

  createResource: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: 'Accès refusé' });
    const data = await request.formData();
    const res = await run(platform, (db) =>
      createResource(db, {
        lessonId: String(data.get('lessonId') ?? ''),
        title: String(data.get('title') ?? ''),
      }),
    );
    if ('error' in res) return fail(400, res);
    throw redirect(303, '/admin/courses');
  },

  renameResource: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: 'Accès refusé' });
    const data = await request.formData();
    const res = await run(platform, (db) =>
      renameResource(db, String(data.get('id') ?? ''), String(data.get('title') ?? '')),
    );
    if ('error' in res) return fail(400, res);
    throw redirect(303, '/admin/courses');
  },

  toggleResource: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: 'Accès refusé' });
    const data = await request.formData();
    const res = await run(platform, (db) =>
      setResourceVisibility(db, String(data.get('id') ?? ''), String(data.get('visibility') ?? '')),
    );
    if ('error' in res) return fail(400, res);
    throw redirect(303, '/admin/courses');
  },

  deleteResource: async ({ request, locals, platform }) => {
    if (locals.user?.role !== 'admin') return fail(403, { error: 'Accès refusé' });
    const data = await request.formData();
    const res = await run(platform, (db) => deleteResource(db, String(data.get('id') ?? '')));
    if ('error' in res) return fail(400, res);
    throw redirect(303, '/admin/courses');
  },
};
