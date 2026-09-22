import {
  isContentType,
  isLanguage,
  type ContentType,
  type Language,
  type Visibility,
} from './content';

export interface Course {
  id: string;
  slug: string;
  title: string;
  language: Language;
  visibility: Visibility;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  visibility: Visibility;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  type: ContentType;
  visibility: Visibility;
}

export interface Resource {
  id: string;
  lessonId: string;
  title: string;
  visibility: Visibility;
}

export interface Catalog {
  courses: readonly Course[];
  modules: readonly Module[];
  lessons: readonly Lesson[];
  resources: readonly Resource[];
}

export class CatalogError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CatalogError';
  }
}

export function emptyCatalog(): Catalog {
  return { courses: [], modules: [], lessons: [], resources: [] };
}

export function addCourse(catalog: Catalog, course: Course): Catalog {
  if (!isLanguage(course.language)) {
    throw new CatalogError('Langue de cours invalide');
  }
  if (catalog.courses.some((c) => c.id === course.id)) {
    throw new CatalogError('Cours déjà présent');
  }
  return { ...catalog, courses: [...catalog.courses, course] };
}

export function addModule(catalog: Catalog, module: Module): Catalog {
  if (!catalog.courses.some((c) => c.id === module.courseId)) {
    throw new CatalogError('Cours parent inexistant');
  }
  if (catalog.modules.some((m) => m.id === module.id)) {
    throw new CatalogError('Module déjà présent');
  }
  return { ...catalog, modules: [...catalog.modules, module] };
}

export function addLesson(catalog: Catalog, lesson: Lesson): Catalog {
  if (!isContentType(lesson.type)) {
    throw new CatalogError('Type de leçon invalide');
  }
  if (!catalog.modules.some((m) => m.id === lesson.moduleId)) {
    throw new CatalogError('Module parent inexistant');
  }
  if (catalog.lessons.some((l) => l.id === lesson.id)) {
    throw new CatalogError('Leçon déjà présente');
  }
  return { ...catalog, lessons: [...catalog.lessons, lesson] };
}

export function addResource(catalog: Catalog, resource: Resource): Catalog {
  if (!catalog.lessons.some((l) => l.id === resource.lessonId)) {
    throw new CatalogError('Leçon parente inexistante');
  }
  if (catalog.resources.some((r) => r.id === resource.id)) {
    throw new CatalogError('Ressource déjà présente');
  }
  return { ...catalog, resources: [...catalog.resources, resource] };
}

export function setCourseVisibility(catalog: Catalog, id: string, v: Visibility): Catalog {
  return { ...catalog, courses: catalog.courses.map((c) => (c.id === id ? { ...c, visibility: v } : c)) };
}

export function setModuleVisibility(catalog: Catalog, id: string, v: Visibility): Catalog {
  return { ...catalog, modules: catalog.modules.map((m) => (m.id === id ? { ...m, visibility: v } : m)) };
}

export function setLessonVisibility(catalog: Catalog, id: string, v: Visibility): Catalog {
  return { ...catalog, lessons: catalog.lessons.map((l) => (l.id === id ? { ...l, visibility: v } : l)) };
}

export function setResourceVisibility(catalog: Catalog, id: string, v: Visibility): Catalog {
  return { ...catalog, resources: catalog.resources.map((r) => (r.id === id ? { ...r, visibility: v } : r)) };
}

export function removeCourse(catalog: Catalog, id: string): Catalog {
  const moduleIds = catalog.modules.filter((m) => m.courseId === id).map((m) => m.id);
  const lessonIds = catalog.lessons.filter((l) => moduleIds.includes(l.moduleId)).map((l) => l.id);
  return {
    courses: catalog.courses.filter((c) => c.id !== id),
    modules: catalog.modules.filter((m) => m.courseId !== id),
    lessons: catalog.lessons.filter((l) => !moduleIds.includes(l.moduleId)),
    resources: catalog.resources.filter((r) => !lessonIds.includes(r.lessonId)),
  };
}

export function removeModule(catalog: Catalog, id: string): Catalog {
  const lessonIds = catalog.lessons.filter((l) => l.moduleId === id).map((l) => l.id);
  return {
    courses: catalog.courses,
    modules: catalog.modules.filter((m) => m.id !== id),
    lessons: catalog.lessons.filter((l) => l.moduleId !== id),
    resources: catalog.resources.filter((r) => !lessonIds.includes(r.lessonId)),
  };
}

export function removeLesson(catalog: Catalog, id: string): Catalog {
  return {
    courses: catalog.courses,
    modules: catalog.modules,
    lessons: catalog.lessons.filter((l) => l.id !== id),
    resources: catalog.resources.filter((r) => r.lessonId !== id),
  };
}

export function removeResource(catalog: Catalog, id: string): Catalog {
  return { ...catalog, resources: catalog.resources.filter((r) => r.id !== id) };
}

export function modulesOfCourse(catalog: Catalog, courseId: string): Module[] {
  return catalog.modules.filter((m) => m.courseId === courseId);
}

export function lessonsOfModule(catalog: Catalog, moduleId: string): Lesson[] {
  return catalog.lessons.filter((l) => l.moduleId === moduleId);
}

export function resourcesOfLesson(catalog: Catalog, lessonId: string): Resource[] {
  return catalog.resources.filter((r) => r.lessonId === lessonId);
}

/** Leçons visibles d'un cours : module visible ET leçon visible (FR-12). */
export function visibleLessonsOfCourse(catalog: Catalog, courseId: string): Lesson[] {
  const visibleModuleIds = new Set(
    catalog.modules
      .filter((m) => m.courseId === courseId && m.visibility === 'visible')
      .map((m) => m.id),
  );
  return catalog.lessons.filter(
    (l) => visibleModuleIds.has(l.moduleId) && l.visibility === 'visible',
  );
}
