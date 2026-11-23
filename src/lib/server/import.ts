import { and, eq, inArray } from 'drizzle-orm';
import type { DB } from './db';
import { courses, modules, lessons, resources, quizQuestions } from './db/schema';
import { parseCourseImport, ImportError, type CourseImport } from '$lib/domain/import';
import { ErrorCodes } from '$lib/domain/errors';

export type ImportMode = 'strict' | 'upsert';

export interface ImportResult {
  courseId: string;
  slug: string;
  modules: number;
  lessons: number;
}

function now(): string {
  return new Date().toISOString();
}

/**
 * Importe un cours complet depuis un JSON validé (FR-48).
 *
 * - `strict` (défaut) : refuse si le `slug` existe déjà.
 * - `upsert` : met à jour les métadonnées et réconcilie modules/leçons/ressources
 *   par `key` stable, en préservant les ids existants (donc la progression).
 *
 * Les écritures sont atomiques via `db.batch`.
 */
export async function importCourse(
  db: DB,
  raw: unknown,
  mode: ImportMode = 'strict',
): Promise<ImportResult> {
  const course: CourseImport = parseCourseImport(raw);

  // ── Phase lecture ────────────────────────────────────────────────────────
  const existingCourse = await db
    .select()
    .from(courses)
    .where(eq(courses.slug, course.slug))
    .get();

  if (existingCourse && mode === 'strict') {
    throw new ImportError(ErrorCodes.SLUG_TAKEN, 'Ce slug est déjà utilisé');
  }

  const courseId = existingCourse?.id ?? crypto.randomUUID();

  const existingModules = existingCourse
    ? await db.select().from(modules).where(eq(modules.courseId, courseId)).all()
    : [];
  const moduleIds = existingModules.map((m) => m.id);
  const existingLessons = moduleIds.length
    ? await db.select().from(lessons).where(inArray(lessons.moduleId, moduleIds)).all()
    : [];
  const lessonIds = existingLessons.map((l) => l.id);
  const existingResources = lessonIds.length
    ? await db.select().from(resources).where(inArray(resources.lessonId, lessonIds)).all()
    : [];

  const moduleByKey = new Map(existingModules.map((m) => [m.contentKey, m]));
  const lessonByKey = new Map(existingLessons.map((l) => [`${l.moduleId}:${l.contentKey}`, l]));
  const resourceByKey = new Map(existingResources.map((r) => [`${r.lessonId}:${r.contentKey}`, r]));

  // ── Phase écriture (opérations atomiques) ────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const writes: any[] = [];

  const courseValues = {
    title: course.title,
    language: course.language,
    priceCents: course.priceCents,
    description: course.description?.trim() || null,
    coverImage: course.thumbnailKey?.trim() || null,
    category: course.category?.trim() || null,
    level: course.level?.trim() || null,
    isPublic: course.isPublic,
    updatedAt: now(),
  };

  if (existingCourse) {
    writes.push(db.update(courses).set(courseValues).where(eq(courses.id, courseId)));
  } else {
    writes.push(
      db.insert(courses).values({
        id: courseId,
        slug: course.slug,
        ...courseValues,
        createdAt: now(),
      }),
    );
  }

  let moduleCount = 0;
  let lessonCount = 0;

  for (const m of course.modules) {
    const existingModule = moduleByKey.get(m.key);
    const moduleId = existingModule?.id ?? crypto.randomUUID();
    moduleCount += 1;

    if (existingModule) {
      writes.push(
        db.update(modules)
          .set({ title: m.title, position: m.position })
          .where(eq(modules.id, moduleId)),
      );
    } else {
      writes.push(
        db.insert(modules).values({
          id: moduleId,
          courseId,
          contentKey: m.key,
          title: m.title,
          position: m.position,
          createdAt: now(),
        }),
      );
    }

    for (const l of m.lessons) {
      const existingLesson = lessonByKey.get(`${moduleId}:${l.key}`);
      const lessonId = existingLesson?.id ?? crypto.randomUUID();
      lessonCount += 1;

      const contentRef =
        l.type === 'text' ? l.contentMarkdown : l.type === 'video' ? l.videoUrl : null;
      const passingScore = l.quizData?.passingScore ?? null;

      if (existingLesson) {
        writes.push(
          db.update(lessons)
            .set({ title: l.title, type: l.type, position: l.position, contentRef, passingScore })
            .where(eq(lessons.id, lessonId)),
        );
      } else {
        writes.push(
          db.insert(lessons).values({
            id: lessonId,
            moduleId,
            contentKey: l.key,
            title: l.title,
            type: l.type,
            position: l.position,
            contentRef,
            passingScore,
            createdAt: now(),
          }),
        );
      }

      // Quiz : remplace les questions de la leçon (pas de données apprenant).
      if (l.type === 'quiz' && l.quizData) {
        writes.push(db.delete(quizQuestions).where(eq(quizQuestions.lessonId, lessonId)));
        for (const [qi, q] of l.quizData.questions.entries()) {
          writes.push(
            db.insert(quizQuestions).values({
              id: crypto.randomUUID(),
              lessonId,
              position: qi,
              prompt: q.question,
              choices: JSON.stringify(q.options),
              correctIndex: q.correctIndex,
              points: 1,
              createdAt: now(),
            }),
          );
        }
      }

      for (const r of l.resources) {
        const existingResource = resourceByKey.get(`${lessonId}:${r.key}`);
        const resourceId = existingResource?.id ?? crypto.randomUUID();

        if (existingResource) {
          writes.push(
            db.update(resources)
              .set({ title: r.title, r2Key: r.r2Key ?? null })
              .where(eq(resources.id, resourceId)),
          );
        } else {
          writes.push(
            db.insert(resources).values({
              id: resourceId,
              lessonId,
              contentKey: r.key,
              title: r.title,
              r2Key: r.r2Key ?? null,
              createdAt: now(),
            }),
          );
        }
      }
    }
  }

  // Drizzle exige un tuple non vide pour `batch` ; on caste la liste dynamique.
  await (db.batch as (items: unknown[]) => Promise<unknown>)(writes);

  return { courseId, slug: course.slug, modules: moduleCount, lessons: lessonCount };
}
