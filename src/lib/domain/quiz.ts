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
