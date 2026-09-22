import { describe, it, expect } from 'vitest';
import {
  CatalogError,
  emptyCatalog,
  addCourse,
  addModule,
  addLesson,
  addResource,
  setResourceVisibility,
  setModuleVisibility,
  removeCourse,
  removeModule,
  removeLesson,
  removeResource,
  modulesOfCourse,
  lessonsOfModule,
  resourcesOfLesson,
  visibleLessonsOfCourse,
  nestCatalog,
  renameCourse,
  renameModule,
  renameLesson,
  renameResource,
  type Catalog,
  type Course,
  type Module,
  type Lesson,
  type Resource,
} from '../../src/lib/domain/catalog';

const course: Course = {
  id: 'c1',
  slug: 'fr-debutant',
  title: 'Français débutant',
  language: 'fr',
  visibility: 'visible',
};
const module: Module = { id: 'm1', courseId: 'c1', title: 'Module 1', visibility: 'visible' };
const lesson: Lesson = { id: 'l1', moduleId: 'm1', title: 'Leçon 1', type: 'text', visibility: 'visible' };
const resource: Resource = { id: 'r1', lessonId: 'l1', title: 'Support', visibility: 'visible' };

describe('addCourse (FR-14)', () => {
  it('adds a course with a valid language', () => {
    expect(addCourse(emptyCatalog(), course).courses).toEqual([course]);
  });

  it('rejects an invalid language', () => {
    expect(() =>
      addCourse(emptyCatalog(), { ...course, language: 'es' as Course['language'] }),
    ).toThrow(CatalogError);
  });

  it('rejects a duplicate course id', () => {
    const cat = addCourse(emptyCatalog(), course);
    expect(() => addCourse(cat, { ...course, title: 'Autre' })).toThrow(CatalogError);
  });
});

describe('structure — intégrité des parents', () => {
  const catWithCourse = addCourse(emptyCatalog(), course);

  it('adds a module when the course exists', () => {
    expect(addModule(catWithCourse, module).modules).toEqual([module]);
  });

  it('rejects a module whose course is missing', () => {
    expect(() => addModule(catWithCourse, { ...module, courseId: 'nope' })).toThrow(CatalogError);
  });

  it('rejects a lesson whose module is missing', () => {
    const cat = addModule(catWithCourse, module);
    expect(() => addLesson(cat, { ...lesson, moduleId: 'nope' })).toThrow(CatalogError);
  });

  it('rejects a lesson with an invalid type', () => {
    const cat = addModule(catWithCourse, module);
    expect(() => addLesson(cat, { ...lesson, type: 'audio' as Lesson['type'] })).toThrow(CatalogError);
  });

  it('rejects a resource whose lesson is missing', () => {
    expect(() => addResource(catWithCourse, resource)).toThrow(CatalogError);
  });
});

describe('visibilité (FR-12)', () => {
  const cat: Catalog = {
    courses: [course],
    modules: [module],
    lessons: [lesson],
    resources: [resource],
  };

  it('hides a resource without removing it', () => {
    const next = setResourceVisibility(cat, 'r1', 'hidden');
    expect(next.resources[0]?.visibility).toBe('hidden');
    expect(next.resources).toHaveLength(1);
  });

  it('re-shows a hidden resource (reversible)', () => {
    const hidden = setResourceVisibility(cat, 'r1', 'hidden');
    const shown = setResourceVisibility(hidden, 'r1', 'visible');
    expect(shown.resources[0]?.visibility).toBe('visible');
  });

  it('hiding a module removes its lessons from the visible view', () => {
    const hidden = setModuleVisibility(cat, 'm1', 'hidden');
    expect(visibleLessonsOfCourse(hidden, 'c1')).toEqual([]);
  });
});

describe('suppression (FR-11) — cascade', () => {
  const cat: Catalog = {
    courses: [course],
    modules: [module],
    lessons: [lesson],
    resources: [resource],
  };

  it('removing a course cascades to modules, lessons and resources', () => {
    const next = removeCourse(cat, 'c1');
    expect(next.courses).toEqual([]);
    expect(next.modules).toEqual([]);
    expect(next.lessons).toEqual([]);
    expect(next.resources).toEqual([]);
  });

  it('removing a module cascades to lessons and resources', () => {
    const next = removeModule(cat, 'm1');
    expect(next.modules).toEqual([]);
    expect(next.lessons).toEqual([]);
    expect(next.resources).toEqual([]);
    expect(next.courses).toEqual([course]);
  });

  it('removing a lesson cascades to resources', () => {
    const next = removeLesson(cat, 'l1');
    expect(next.lessons).toEqual([]);
    expect(next.resources).toEqual([]);
    expect(next.modules).toEqual([module]);
  });

  it('removing a resource only removes that resource', () => {
    const next = removeResource(cat, 'r1');
    expect(next.resources).toEqual([]);
    expect(next.lessons).toEqual([lesson]);
  });
});

describe('requêtes', () => {
  const cat: Catalog = {
    courses: [course],
    modules: [module, { id: 'm2', courseId: 'c1', title: 'Module 2', visibility: 'visible' }],
    lessons: [lesson],
    resources: [resource],
  };

  it('lists modules of a course', () => {
    expect(modulesOfCourse(cat, 'c1').map((m) => m.id)).toEqual(['m1', 'm2']);
  });

  it('lists lessons of a module', () => {
    expect(lessonsOfModule(cat, 'm1').map((l) => l.id)).toEqual(['l1']);
  });

  it('lists resources of a lesson', () => {
    expect(resourcesOfLesson(cat, 'l1').map((r) => r.id)).toEqual(['r1']);
  });

  it('lists only visible lessons of a course', () => {
    expect(visibleLessonsOfCourse(cat, 'c1').map((l) => l.id)).toEqual(['l1']);
  });
});

describe('nestCatalog (FR-10)', () => {
  const cat: Catalog = {
    courses: [
      { id: 'c1', slug: 'fr', title: 'Français', language: 'fr', visibility: 'visible' },
      { id: 'c2', slug: 'de', title: 'Allemand', language: 'de', visibility: 'hidden' },
    ],
    modules: [
      { id: 'm2', courseId: 'c1', title: 'Module 2', visibility: 'visible', position: 1 },
      { id: 'm1', courseId: 'c1', title: 'Module 1', visibility: 'hidden', position: 0 },
    ],
    lessons: [
      { id: 'l2', moduleId: 'm1', title: 'Leçon 2', type: 'text', visibility: 'visible', position: 1 },
      { id: 'l1', moduleId: 'm1', title: 'Leçon 1', type: 'video', visibility: 'visible', position: 0 },
    ],
    resources: [{ id: 'r1', lessonId: 'l1', title: 'Support', visibility: 'visible' }],
  };

  it('nests modules, lessons and resources under courses', () => {
    const nodes = nestCatalog(cat);
    const c1 = nodes.find((n) => n.course.id === 'c1')!;
    expect(c1.modules.map((m) => m.module.id)).toEqual(['m1', 'm2']);

    const m1 = c1.modules[0]!;
    expect(m1.lessons.map((l) => l.lesson.id)).toEqual(['l1', 'l2']);
    expect(m1.lessons[0]!.resources.map((r) => r.id)).toEqual(['r1']);
  });

  it('includes hidden entities (admin view shows everything)', () => {
    const nodes = nestCatalog(cat);
    expect(nodes.find((n) => n.course.id === 'c2')?.course.visibility).toBe('hidden');
    expect(nodes.find((n) => n.course.id === 'c1')!.modules.find((m) => m.module.id === 'm1')?.module.visibility).toBe('hidden');
  });

  it('returns an empty list for an empty catalog', () => {
    expect(nestCatalog(emptyCatalog())).toEqual([]);
  });
});

describe('rename (FR-11)', () => {
  const cat = addCourse(emptyCatalog(), course);
  const withModule = addModule(cat, module);
  const withLesson = addLesson(withModule, lesson);
  const withResource = addResource(withLesson, resource);

  it('renames an existing course', () => {
    expect(renameCourse(cat, 'c1', 'Nouveau titre').courses[0]?.title).toBe('Nouveau titre');
  });

  it('rejects renaming a missing course', () => {
    expect(() => renameCourse(cat, 'nope', 'X')).toThrow(CatalogError);
  });

  it('rejects an empty title', () => {
    expect(() => renameCourse(cat, 'c1', '   ')).toThrow(CatalogError);
  });

  it('renames a module', () => {
    expect(renameModule(withModule, 'm1', 'Module renommé').modules[0]?.title).toBe('Module renommé');
  });

  it('rejects renaming a missing module', () => {
    expect(() => renameModule(withModule, 'nope', 'X')).toThrow(CatalogError);
  });

  it('renames a lesson', () => {
    expect(renameLesson(withLesson, 'l1', 'Leçon renommée').lessons[0]?.title).toBe('Leçon renommée');
  });

  it('renames a resource', () => {
    expect(renameResource(withResource, 'r1', 'Ressource renommée').resources[0]?.title).toBe('Ressource renommée');
  });
});
