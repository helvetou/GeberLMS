/**
 * Import JSON de cours (FR-48) — authoring externe, sans LLM interne.
 *
 * Un cours complet (ou un module) est décrit en JSON, validé (Zod + règles
 * métier), puis injecté transactionnellement. La réconciliation se fait par
 * `key` stable (jamais par titre/position) pour préserver la progression.
 */
import { z } from 'zod';
import { ErrorCodes, type ErrorCode } from './errors';

// ─── Schémas Zod (structure) ──────────────────────────────────────────────

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const ResourceSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  r2_key: z.string().optional(),
  position: z.number().int().min(0).optional(),
});

const QuizQuestionSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string()).min(2),
  correct_index: z.number().int().min(0),
  explanation: z.string().optional(),
});

const LessonSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  position: z.number().int().min(0).optional(),
  type: z.enum(['text', 'video', 'quiz']),
  content_markdown: z.string().optional(),
  video_url: z.string().optional(),
  duration_seconds: z.number().int().min(0).optional(),
  quiz_data: z
    .object({
      passing_score: z.number().int().min(0).max(100).optional(),
      questions: z.array(QuizQuestionSchema).min(1),
    })
    .optional(),
  resources: z.array(ResourceSchema).optional(),
});

const ModuleSchema = z.object({
  key: z.string().min(1),
  title: z.string().min(1),
  position: z.number().int().min(0).optional(),
  lessons: z.array(LessonSchema).min(1),
});

const CourseSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  language: z.enum(['fr', 'en', 'ar', 'de']),
  description: z.string().optional(),
  thumbnail_key: z.string().optional(),
  category: z.string().optional(),
  level: z.string().optional(),
  is_public: z.boolean().optional(),
  price_cents: z.number().int().min(0),
  modules: z.array(ModuleSchema).min(1),
});

// ─── Types de sortie (camelCase) ──────────────────────────────────────────

export interface ResourceImport {
  key: string;
  title: string;
  r2Key?: string;
  position: number;
}

export interface QuizQuestionImport {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface QuizDataImport {
  passingScore?: number;
  questions: QuizQuestionImport[];
}

export interface LessonImport {
  key: string;
  title: string;
  position: number;
  type: 'text' | 'video' | 'quiz';
  contentMarkdown?: string;
  videoUrl?: string;
  durationSeconds?: number;
  quizData?: QuizDataImport;
  resources: ResourceImport[];
}

export interface ModuleImport {
  key: string;
  title: string;
  position: number;
  lessons: LessonImport[];
}

export interface CourseImport {
  title: string;
  slug: string;
  language: 'fr' | 'en' | 'ar' | 'de';
  description?: string;
  thumbnailKey?: string;
  category?: string;
  level?: string;
  isPublic: boolean;
  priceCents: number;
  modules: ModuleImport[];
}

export class ImportError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'ImportError';
    this.code = code;
  }
}

function assertUniqueKeys(items: { key: string }[], label: string): void {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.key)) {
      throw new ImportError(
        ErrorCodes.IMPORT_DUPLICATE_KEY,
        `Clé « ${item.key} » dupliquée parmi les ${label}`,
      );
    }
    seen.add(item.key);
  }
}

/**
 * Parse et valide un cours importé : structure (Zod), format du slug,
 * cohérence polymorphique des leçons, bornes des quiz, unicité des clés et
 * normalisation des positions (ordre du tableau si absentes).
 */
export function parseCourseImport(raw: unknown): CourseImport {
  const result = CourseSchema.safeParse(raw);
  if (!result.success) {
    throw new ImportError(ErrorCodes.IMPORT_INVALID, 'Import invalide');
  }
  const data = result.data;

  if (!SLUG_REGEX.test(data.slug)) {
    throw new ImportError(ErrorCodes.IMPORT_SLUG_FORMAT, 'Slug invalide (kebab-case)');
  }

  assertUniqueKeys(data.modules, 'modules');

  const modules: ModuleImport[] = data.modules.map((m, mi) => {
    assertUniqueKeys(m.lessons, 'leçons');
    const lessons: LessonImport[] = m.lessons.map((l, li) => {
      assertUniqueKeys(l.resources ?? [], 'ressources');

      // Cohérence polymorphique (FR-48) : chaque type exige son contenu.
      if (l.type === 'text' && !l.content_markdown?.trim()) {
        throw new ImportError(
          ErrorCodes.IMPORT_LESSON_CONTENT,
          `Leçon « ${l.key} » : type texte exige content_markdown`,
        );
      }
      if (l.type === 'video' && !l.video_url?.trim()) {
        throw new ImportError(
          ErrorCodes.IMPORT_LESSON_CONTENT,
          `Leçon « ${l.key} » : type vidéo exige video_url`,
        );
      }
      if (l.type === 'quiz' && !l.quiz_data) {
        throw new ImportError(
          ErrorCodes.IMPORT_LESSON_CONTENT,
          `Leçon « ${l.key} » : type quiz exige quiz_data`,
        );
      }

      let quizData: QuizDataImport | undefined;
      if (l.quiz_data) {
        const questions: QuizQuestionImport[] = l.quiz_data.questions.map((q, qi) => {
          if (q.correct_index < 0 || q.correct_index >= q.options.length) {
            throw new ImportError(
              ErrorCodes.IMPORT_QUIZ_INVALID,
              `Quiz « ${l.key} » : correct_index hors bornes (question ${qi + 1})`,
            );
          }
          return {
            question: q.question,
            options: q.options,
            correctIndex: q.correct_index,
            explanation: q.explanation,
          };
        });
        quizData = { passingScore: l.quiz_data.passing_score, questions };
      }

      return {
        key: l.key,
        title: l.title,
        position: l.position ?? li,
        type: l.type,
        contentMarkdown: l.content_markdown,
        videoUrl: l.video_url,
        durationSeconds: l.duration_seconds,
        quizData,
        resources: (l.resources ?? []).map((r, ri) => ({
          key: r.key,
          title: r.title,
          r2Key: r.r2_key,
          position: r.position ?? ri,
        })),
      };
    });

    return { key: m.key, title: m.title, position: m.position ?? mi, lessons };
  });

  return {
    title: data.title,
    slug: data.slug,
    language: data.language,
    description: data.description,
    thumbnailKey: data.thumbnail_key,
    category: data.category,
    level: data.level,
    isPublic: data.is_public ?? false,
    priceCents: data.price_cents,
    modules,
  };
}

/** Ordre des positions pour un réordonnancement (pas de doublons). */
export function normalizedPositions<T extends { position: number }>(items: T[]): T[] {
  return [...items]
    .sort((a, b) => a.position - b.position)
    .map((item, index) => ({ ...item, position: index }));
}
