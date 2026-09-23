import { eq } from 'drizzle-orm';
import type { DB } from './db';
import { lessons, modules, courses, quizQuestions } from './db/schema';
import {
  gradeQuiz,
  validateQuizQuestion,
  buildQuizPrompt,
  parseGeneratedQuiz,
  type AnswerSelection,
  type QuizQuestion,
  type QuizResult,
} from '$lib/domain/quiz';
import { recordLessonProgress } from './progress';

export class QuizServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuizServiceError';
  }
}

export interface CreateQuizQuestionInput {
  lessonId: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
  points?: number;
}

function toQuestion(row: typeof quizQuestions.$inferSelect): QuizQuestion {
  return {
    id: row.id,
    lessonId: row.lessonId,
    position: row.position,
    prompt: row.prompt,
    choices: JSON.parse(row.choices) as string[],
    correctIndex: row.correctIndex,
    points: row.points,
  };
}

export async function listQuizQuestions(db: DB, lessonId: string): Promise<QuizQuestion[]> {
  const rows = await db
    .select()
    .from(quizQuestions)
    .where(eq(quizQuestions.lessonId, lessonId))
    .all();
  return rows
    .map(toQuestion)
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

export async function createQuizQuestion(
  db: DB,
  input: CreateQuizQuestionInput,
): Promise<string> {
  const lesson = await db
    .select({ id: lessons.id, type: lessons.type })
    .from(lessons)
    .where(eq(lessons.id, input.lessonId))
    .get();
  if (!lesson) {
    throw new QuizServiceError('Leçon introuvable');
  }
  if (lesson.type !== 'quiz') {
    throw new QuizServiceError('Cette leçon n\u2019est pas un quiz');
  }

  const question: QuizQuestion = {
    id: '',
    lessonId: input.lessonId,
    prompt: input.prompt,
    choices: input.choices,
    correctIndex: input.correctIndex,
    points: input.points ?? 1,
  };
  try {
    validateQuizQuestion(question);
  } catch (err) {
    if (err instanceof Error) {
      throw new QuizServiceError(err.message);
    }
    throw err;
  }

  const id = crypto.randomUUID();
  await db.insert(quizQuestions).values({
    id,
    lessonId: input.lessonId,
    prompt: question.prompt,
    choices: JSON.stringify(question.choices),
    correctIndex: question.correctIndex,
    points: question.points ?? 1,
    createdAt: new Date().toISOString(),
  });
  return id;
}

export async function deleteQuizQuestion(db: DB, id: string): Promise<void> {
  const row = await db.select({ id: quizQuestions.id }).from(quizQuestions).where(eq(quizQuestions.id, id)).get();
  if (!row) {
    throw new QuizServiceError('Question introuvable');
  }
  await db.delete(quizQuestions).where(eq(quizQuestions.id, id)).run();
}

export interface QuizLessonView {
  lessonId: string;
  title: string;
  courseTitle: string;
  moduleTitle: string;
  questions: QuizQuestion[];
}

/** Liste les leçons de type quiz avec leur contexte et leurs questions. */
export async function listQuizLessons(db: DB): Promise<QuizLessonView[]> {
  const lessonRows = await db
    .select()
    .from(lessons)
    .where(eq(lessons.type, 'quiz'))
    .all();
  const moduleRows = await db.select().from(modules).all();
  const courseRows = await db.select().from(courses).all();
  const moduleById = new Map(moduleRows.map((m) => [m.id, m]));
  const courseById = new Map(courseRows.map((c) => [c.id, c]));

  const views: QuizLessonView[] = [];
  for (const lesson of lessonRows) {
    const module = moduleById.get(lesson.moduleId);
    const course = module ? courseById.get(module.courseId) : undefined;
    views.push({
      lessonId: lesson.id,
      title: lesson.title,
      courseTitle: course?.title ?? '—',
      moduleTitle: module?.title ?? '—',
      questions: await listQuizQuestions(db, lesson.id),
    });
  }
  return views;
}

/**
 * Corrige un quiz soumis, puis enregistre la progression de la leçon
 * (statut « completed » et score en pourcentage) — FR-30.
 */
export async function gradeQuizForLesson(
  db: DB,
  input: { learnerId: string; enrollmentId: string; lessonId: string; answers: AnswerSelection[] },
): Promise<QuizResult> {
  const questions = await listQuizQuestions(db, input.lessonId);
  if (questions.length === 0) {
    throw new QuizServiceError('Ce quiz ne contient aucune question');
  }

  const result = gradeQuiz(questions, input.answers);

  await recordLessonProgress(db, {
    learnerId: input.learnerId,
    enrollmentId: input.enrollmentId,
    lessonId: input.lessonId,
    status: 'completed',
    score: result.percentage,
  });

  return result;
}

/** Abstraction minimale d'un LLM de génération de questions. */
export interface QuizLlm {
  generate(prompt: string): Promise<string>;
}

/**
 * Génère des questions de quiz via un LLM, parse/valide la réponse et
 * les enregistre (FR-31).
 */
export async function generateQuizQuestions(
  db: DB,
  llm: QuizLlm,
  input: { lessonId: string; topic: string; count: number },
): Promise<number> {
  const lesson = await db
    .select({ id: lessons.id, type: lessons.type })
    .from(lessons)
    .where(eq(lessons.id, input.lessonId))
    .get();
  if (!lesson) {
    throw new QuizServiceError('Leçon introuvable');
  }
  if (lesson.type !== 'quiz') {
    throw new QuizServiceError('Cette leçon n\u2019est pas un quiz');
  }
  if (!input.topic.trim()) {
    throw new QuizServiceError('Sujet requis');
  }

  const raw = await llm.generate(buildQuizPrompt(input.topic, input.count));
  const questions = parseGeneratedQuiz(raw);

  for (const q of questions) {
    await createQuizQuestion(db, {
      lessonId: input.lessonId,
      prompt: q.prompt,
      choices: q.choices,
      correctIndex: q.correctIndex,
    });
  }

  return questions.length;
}
