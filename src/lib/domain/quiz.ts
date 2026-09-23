/**
 * E-testing / quiz (FR-30) : questions à choix, correction automatique.
 */
export interface QuizQuestion {
  id: string;
  lessonId: string;
  position?: number;
  prompt: string;
  choices: string[];
  /** Index (0-based) de la bonne réponse parmi `choices`. */
  correctIndex: number;
  /** Points attribués en cas de bonne réponse (défaut : 1). */
  points?: number;
}

export interface AnswerSelection {
  questionId: string;
  /** Index choisi, absent si la question n'a pas été répondue. */
  selectedIndex?: number;
}

export interface QuizResult {
  correct: number;
  total: number;
  /** Points obtenus. */
  score: number;
  /** Points maximum possibles. */
  maxScore: number;
  /** Pourcentage arrondi (0–100). */
  percentage: number;
}

export class QuizError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuizError';
  }
}

/** Valide la structure d'une question. Lève QuizError si invalide. */
export function validateQuizQuestion(q: QuizQuestion): void {
  if (!q.prompt.trim()) {
    throw new QuizError('Énoncé requis');
  }
  if (q.choices.length < 2) {
    throw new QuizError('Au moins deux choix requis');
  }
  if (!Number.isInteger(q.correctIndex) || q.correctIndex < 0 || q.correctIndex >= q.choices.length) {
    throw new QuizError('Index de bonne réponse hors bornes');
  }
}

/** Corrige automatiquement un quiz et calcule le score (FR-30). */
export function gradeQuiz(
  questions: readonly QuizQuestion[],
  answers: readonly AnswerSelection[],
): QuizResult {
  const total = questions.length;
  const maxScore = questions.reduce((sum, q) => sum + (q.points ?? 1), 0);

  let correct = 0;
  let score = 0;
  for (const q of questions) {
    const answer = answers.find((a) => a.questionId === q.id);
    if (answer?.selectedIndex !== undefined && answer.selectedIndex === q.correctIndex) {
      correct += 1;
      score += q.points ?? 1;
    }
  }

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  return { correct, total, score, maxScore, percentage };
}

/** Question générée par un LLM, avant affectation d'un id et d'une leçon. */
export interface GeneratedQuestion {
  prompt: string;
  choices: string[];
  correctIndex: number;
}

/**
 * Construit le prompt de génération d'un quiz (FR-31).
 */
export function buildQuizPrompt(topic: string, count: number): string {
  const n = Number.isInteger(count) && count > 0 ? count : 5;
  return (
    `Génère ${n} questions de quiz à choix multiples sur le sujet suivant : « ${topic} ». ` +
    `Réponds uniquement avec un tableau JSON, sans texte autour, au format exact : ` +
    `[{"prompt":"...","choices":["...","..."],"correctIndex":0}]. ` +
    `correctIndex est l'index (0-based) de la bonne réponse dans choices.`
  );
}

/**
 * Parse et valide la sortie JSON d'un LLM (FR-31). Accepte le JSON brut,
 * les blocs de code markdown ou le JSON noyé dans du texte.
 */
export function parseGeneratedQuiz(raw: string): GeneratedQuestion[] {
  const text = raw.trim();

  let json = text;
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    json = fence[1]!.trim();
  }

  const start = json.indexOf('[');
  const end = json.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) {
    throw new QuizError('Réponse JSON introuvable');
  }
  json = json.slice(start, end + 1);

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new QuizError('JSON invalide dans la réponse du modèle');
  }
  if (!Array.isArray(parsed)) {
    throw new QuizError('Format attendu : tableau JSON');
  }

  const result = parsed.map((item, index) => {
    if (typeof item !== 'object' || item === null) {
      throw new QuizError(`Question ${index + 1} invalide`);
    }
    const o = item as Record<string, unknown>;
    const prompt = typeof o.prompt === 'string' ? o.prompt.trim() : '';
    const choices = Array.isArray(o.choices)
      ? o.choices.filter((c): c is string => typeof c === 'string')
      : [];
    const correctIndex = typeof o.correctIndex === 'number' ? o.correctIndex : NaN;

    validateQuizQuestion({ id: `gen-${index}`, lessonId: '', prompt, choices, correctIndex });
    return { prompt, choices, correctIndex };
  });

  if (result.length === 0) {
    throw new QuizError('Aucune question générée');
  }
  return result;
}
