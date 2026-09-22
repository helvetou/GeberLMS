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
