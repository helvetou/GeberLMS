import { and, eq, inArray } from 'drizzle-orm';
import type { DB } from './db';
import { courses, modules, lessons, resources, enrollments, progress } from './db/schema';
import { isContentType, isLanguage, isVisibility, type Visibility } from '$lib/domain/content';
import { nestCatalog, publicCourses, visibleSyllabus, type Course, type CourseNode, type PublicSyllabusModule } from '$lib/domain/catalog';
import { ErrorCodes, type ErrorCode } from '$lib/domain/errors';

export class CatalogServiceError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'CatalogServiceError';
    this.code = code;
  }
}

function now(): string {
  return new Date().toISOString();
}

function assertNonEmpty(value: string, label: string): string {
  const v = value.trim();
  if (!v) {
    const code = label === 'Slug' ? ErrorCodes.SLUG_REQUIRED : ErrorCodes.TITLE_REQUIRED;
    throw new CatalogServiceError(code, `${label} requis`);
  }
  return v;
}

function parsePriceCents(raw: string): number {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0) {
    throw new CatalogServiceError(ErrorCodes.PRICE_INVALID, 'Prix invalide (entier positif en centimes)');
  }
  return n;
}

function parsePosition(raw: string): number {
  if (!raw.trim()) return 0;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0) {
    throw new CatalogServiceError(ErrorCodes.POSITION_INVALID, 'Position invalide (entier ≥ 0)');
  }
  return n;
}

/** Vue arborescente complète (admin) : cours → modules → leçons → ressources. */
export function listAdminCatalog(db: DB): Promise<CourseNode[]> {
  return Promise.all([
    db.select().from(courses).all(),
    db.select().from(modules).all(),
    db.select().from(lessons).all(),
    db.select().from(resources).all(),
  ]).then(([courseRows, moduleRows, lessonRows, resourceRows]) =>
    nestCatalog({
      courses: courseRows,
      modules: moduleRows,
      lessons: lessonRows,
      resources: resourceRows,
    }),
  );
}

// ─── Cours ────────────────────────────────────────────────────────────────

export interface CreateCourseInput {
  title: string;
  slug: string;
  language: string;
  priceCents: string;
  description?: string;
  coverImage?: string;
  category?: string;
  level?: string;
  isPublic?: boolean;
  tutorId?: string;
}

export async function createCourse(
  db: DB,
  input: CreateCourseInput,
): Promise<string> {
  const title = assertNonEmpty(input.title, 'Titre');
  const slug = assertNonEmpty(input.slug, 'Slug');
  if (!isLanguage(input.language)) {
    throw new CatalogServiceError(ErrorCodes.LANGUAGE_INVALID, 'Langue invalide');
  }
  const priceCents = parsePriceCents(input.priceCents);

  const existing = await db.select({ id: courses.id }).from(courses).where(eq(courses.slug, slug)).get();
  if (existing) {
    throw new CatalogServiceError(ErrorCodes.SLUG_TAKEN, 'Ce slug est déjà utilisé');
  }

  const id = crypto.randomUUID();
  const t = now();
  await db.insert(courses).values({
    id,
    slug,
    title,
    language: input.language as 'fr' | 'en' | 'ar' | 'de',
    priceCents,
    description: input.description?.trim() || null,
    coverImage: input.coverImage?.trim() || null,
    category: input.category?.trim() || null,
    level: input.level?.trim() || null,
    isPublic: input.isPublic === true,
    tutorId: input.tutorId?.trim() || null,
    createdAt: t,
    updatedAt: t,
  });
  return id;
}

export async function renameCourse(db: DB, id: string, title: string): Promise<void> {
  const t = assertNonEmpty(title, 'Titre');
  const row = await db.select({ id: courses.id }).from(courses).where(eq(courses.id, id)).get();
  if (!row) throw new CatalogServiceError(ErrorCodes.COURSE_NOT_FOUND, 'Cours introuvable');
  await db.update(courses).set({ title: t, updatedAt: now() }).where(eq(courses.id, id)).run();
}

export async function setCourseVisibility(db: DB, id: string, visibility: string): Promise<void> {
  if (!isVisibility(visibility)) throw new CatalogServiceError(ErrorCodes.VISIBILITY_INVALID, 'Visibilité invalide');
  const row = await db.select({ id: courses.id }).from(courses).where(eq(courses.id, id)).get();
  if (!row) throw new CatalogServiceError(ErrorCodes.COURSE_NOT_FOUND, 'Cours introuvable');
  await db
    .update(courses)
    .set({ visibility: visibility as Visibility, updatedAt: now() })
    .where(eq(courses.id, id))
    .run();
}

export async function setCoursePublic(db: DB, id: string, isPublic: boolean): Promise<void> {
  const row = await db.select({ id: courses.id }).from(courses).where(eq(courses.id, id)).get();
  if (!row) throw new CatalogServiceError(ErrorCodes.COURSE_NOT_FOUND, 'Cours introuvable');
  await db
    .update(courses)
    .set({ isPublic, updatedAt: now() })
    .where(eq(courses.id, id))
    .run();
}

/** Cours listés dans le catalogue public (anonyme) : visibles ET publics. */
export async function listPublicCatalog(db: DB): Promise<Course[]> {
  const courseRows = await db.select().from(courses).all();
  return publicCourses({ courses: courseRows, modules: [], lessons: [], resources: [] });
}

export interface PublicCourseDetail {
  course: Course;
  syllabus: PublicSyllabusModule[];
}

/** Détail public d'un cours (anonyme) : métadonnées + plan de cours visible. */
export async function getPublicCourseBySlug(
  db: DB,
  slug: string,
): Promise<PublicCourseDetail | null> {
  const course = await db.select().from(courses).where(eq(courses.slug, slug)).get();
  if (!course || course.visibility !== 'visible' || !course.isPublic) return null;

  const moduleRows = await db.select().from(modules).where(eq(modules.courseId, course.id)).all();
  const moduleIds = moduleRows.map((m) => m.id);
  const lessonRows = moduleIds.length
    ? await db.select().from(lessons).where(inArray(lessons.moduleId, moduleIds)).all()
    : [];

  const syllabus = visibleSyllabus(
    { courses: [course], modules: moduleRows, lessons: lessonRows, resources: [] },
    course.id,
  );
  return { course, syllabus };
}

/** Détail admin d'un cours (lecture) : arbre complet modules → leçons →
 *  ressources, éléments cachés inclus, ordonné par position. */
export async function getAdminCourseDetail(db: DB, courseId: string): Promise<CourseNode | null> {
  const course = await db.select().from(courses).where(eq(courses.id, courseId)).get();
  if (!course) return null;

  const moduleRows = await db.select().from(modules).where(eq(modules.courseId, courseId)).all();
  const moduleIds = moduleRows.map((m) => m.id);
  const lessonRows = moduleIds.length
    ? await db.select().from(lessons).where(inArray(lessons.moduleId, moduleIds)).all()
    : [];
  const lessonIds = lessonRows.map((l) => l.id);
  const resourceRows = lessonIds.length
    ? await db.select().from(resources).where(inArray(resources.lessonId, lessonIds)).all()
    : [];

  const [node] = nestCatalog({
    courses: [course],
    modules: moduleRows,
    lessons: lessonRows,
    resources: resourceRows,
  });
  return node ?? null;
}

export async function deleteCourse(db: DB, id: string): Promise<void> {
  const row = await db.select({ id: courses.id }).from(courses).where(eq(courses.id, id)).get();
  if (!row) throw new CatalogServiceError(ErrorCodes.COURSE_NOT_FOUND, 'Cours introuvable');

  const linked = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(eq(enrollments.courseId, id))
    .all();
  if (linked.length > 0) {
    throw new CatalogServiceError(ErrorCodes.COURSE_HAS_ENROLLMENTS, 'Cours avec inscriptions — suppression refusée');
  }

  const moduleRows = await db
    .select({ id: modules.id })
    .from(modules)
    .where(eq(modules.courseId, id))
    .all();
  const moduleIds = moduleRows.map((m) => m.id);
  const lessonRows = moduleIds.length
    ? await db.select({ id: lessons.id }).from(lessons).where(inArray(lessons.moduleId, moduleIds)).all()
    : [];
  const lessonIds = lessonRows.map((l) => l.id);

  if (lessonIds.length) {
    await db.delete(resources).where(inArray(resources.lessonId, lessonIds)).run();
    await db.delete(lessons).where(inArray(lessons.id, lessonIds)).run();
  }
  if (moduleIds.length) {
    await db.delete(modules).where(inArray(modules.id, moduleIds)).run();
  }
  await db.delete(courses).where(eq(courses.id, id)).run();
}

// ─── Modules ──────────────────────────────────────────────────────────────

export async function createModule(
  db: DB,
  input: { courseId: string; title: string; position: string },
): Promise<string> {
  const title = assertNonEmpty(input.title, 'Titre');
  const course = await db.select({ id: courses.id }).from(courses).where(eq(courses.id, input.courseId)).get();
  if (!course) throw new CatalogServiceError(ErrorCodes.COURSE_NOT_FOUND, 'Cours parent introuvable');

  const id = crypto.randomUUID();
  await db.insert(modules).values({
    id,
    courseId: input.courseId,
    title,
    position: parsePosition(input.position),
    createdAt: now(),
  });
  return id;
}

export async function renameModule(db: DB, id: string, title: string): Promise<void> {
  const t = assertNonEmpty(title, 'Titre');
  const row = await db.select({ id: modules.id }).from(modules).where(eq(modules.id, id)).get();
  if (!row) throw new CatalogServiceError(ErrorCodes.MODULE_NOT_FOUND, 'Module introuvable');
  await db.update(modules).set({ title: t }).where(eq(modules.id, id)).run();
}

export async function setModuleVisibility(db: DB, id: string, visibility: string): Promise<void> {
  if (!isVisibility(visibility)) throw new CatalogServiceError(ErrorCodes.VISIBILITY_INVALID, 'Visibilité invalide');
  const row = await db.select({ id: modules.id }).from(modules).where(eq(modules.id, id)).get();
  if (!row) throw new CatalogServiceError(ErrorCodes.MODULE_NOT_FOUND, 'Module introuvable');
  await db.update(modules).set({ visibility: visibility as Visibility }).where(eq(modules.id, id)).run();
}

export async function deleteModule(db: DB, id: string): Promise<void> {
  const row = await db.select({ id: modules.id }).from(modules).where(eq(modules.id, id)).get();
  if (!row) throw new CatalogServiceError(ErrorCodes.MODULE_NOT_FOUND, 'Module introuvable');

  const lessonRows = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.moduleId, id)).all();
  const lessonIds = lessonRows.map((l) => l.id);
  if (lessonIds.length) {
    await db.delete(resources).where(inArray(resources.lessonId, lessonIds)).run();
    await db.delete(progress).where(inArray(progress.lessonId, lessonIds)).run();
    await db.delete(lessons).where(inArray(lessons.id, lessonIds)).run();
  }
  await db.delete(modules).where(eq(modules.id, id)).run();
}

// ─── Leçons ───────────────────────────────────────────────────────────────

export async function createLesson(
  db: DB,
  input: { moduleId: string; title: string; type: string; position: string },
): Promise<string> {
  const title = assertNonEmpty(input.title, 'Titre');
  if (!isContentType(input.type)) throw new CatalogServiceError(ErrorCodes.LESSON_TYPE_INVALID, 'Type de leçon invalide');
  const module = await db.select({ id: modules.id }).from(modules).where(eq(modules.id, input.moduleId)).get();
  if (!module) throw new CatalogServiceError(ErrorCodes.MODULE_NOT_FOUND, 'Module parent introuvable');

  const id = crypto.randomUUID();
  await db.insert(lessons).values({
    id,
    moduleId: input.moduleId,
    title,
    type: input.type as 'video' | 'text' | 'quiz',
    position: parsePosition(input.position),
    createdAt: now(),
  });
  return id;
}

export async function renameLesson(db: DB, id: string, title: string): Promise<void> {
  const t = assertNonEmpty(title, 'Titre');
  const row = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.id, id)).get();
  if (!row) throw new CatalogServiceError(ErrorCodes.LESSON_NOT_FOUND, 'Leçon introuvable');
  await db.update(lessons).set({ title: t }).where(eq(lessons.id, id)).run();
}

export async function setLessonVisibility(db: DB, id: string, visibility: string): Promise<void> {
  if (!isVisibility(visibility)) throw new CatalogServiceError(ErrorCodes.VISIBILITY_INVALID, 'Visibilité invalide');
  const row = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.id, id)).get();
  if (!row) throw new CatalogServiceError(ErrorCodes.LESSON_NOT_FOUND, 'Leçon introuvable');
  await db.update(lessons).set({ visibility: visibility as Visibility }).where(eq(lessons.id, id)).run();
}

export async function deleteLesson(db: DB, id: string): Promise<void> {
  const row = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.id, id)).get();
  if (!row) throw new CatalogServiceError(ErrorCodes.LESSON_NOT_FOUND, 'Leçon introuvable');

  await db.delete(resources).where(eq(resources.lessonId, id)).run();
  await db.delete(progress).where(eq(progress.lessonId, id)).run();
  await db.delete(lessons).where(eq(lessons.id, id)).run();
}

// ─── Ressources ───────────────────────────────────────────────────────────

export async function createResource(
  db: DB,
  input: { lessonId: string; title: string },
): Promise<string> {
  const title = assertNonEmpty(input.title, 'Titre');
  const lesson = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.id, input.lessonId)).get();
  if (!lesson) throw new CatalogServiceError(ErrorCodes.LESSON_NOT_FOUND, 'Leçon parente introuvable');

  const id = crypto.randomUUID();
  await db.insert(resources).values({
    id,
    lessonId: input.lessonId,
    title,
    createdAt: now(),
  });
  return id;
}

export async function renameResource(db: DB, id: string, title: string): Promise<void> {
  const t = assertNonEmpty(title, 'Titre');
  const row = await db.select({ id: resources.id }).from(resources).where(eq(resources.id, id)).get();
  if (!row) throw new CatalogServiceError(ErrorCodes.RESOURCE_NOT_FOUND, 'Ressource introuvable');
  await db.update(resources).set({ title: t }).where(eq(resources.id, id)).run();
}

export async function setResourceVisibility(db: DB, id: string, visibility: string): Promise<void> {
  if (!isVisibility(visibility)) throw new CatalogServiceError(ErrorCodes.VISIBILITY_INVALID, 'Visibilité invalide');
  const row = await db.select({ id: resources.id }).from(resources).where(eq(resources.id, id)).get();
  if (!row) throw new CatalogServiceError(ErrorCodes.RESOURCE_NOT_FOUND, 'Ressource introuvable');
  await db.update(resources).set({ visibility: visibility as Visibility }).where(eq(resources.id, id)).run();
}

export async function deleteResource(db: DB, id: string): Promise<void> {
  const row = await db.select({ id: resources.id }).from(resources).where(eq(resources.id, id)).get();
  if (!row) throw new CatalogServiceError(ErrorCodes.RESOURCE_NOT_FOUND, 'Ressource introuvable');
  await db.delete(resources).where(eq(resources.id, id)).run();
}
