/**
 * Catalogue des codes d'erreur applicatifs (stable, traduisible).
 *
 * Les couches serveur renvoient ces codes (plutôt que des messages figés en
 * français) ; l'interface les traduit via le catalogue i18n (`errors.*`).
 * Les erreurs de domaine conservent leur message interne (utilisé par les
 * tests) mais sont converties en codes à la frontière serveur.
 */
export const ErrorCodes = {
  DB_UNAVAILABLE: 'errors.db_unavailable',
  ACCESS_DENIED: 'errors.access_denied',
  INVALID_CREDENTIALS: 'errors.invalid_credentials',
  EMAIL_PASSWORD_REQUIRED: 'errors.email_password_required',
  ROLE_INVALID: 'errors.role_invalid',
  EMAIL_REQUIRED: 'errors.email_required',
  FILE_REQUIRED: 'errors.file_required',
  PARAMS_REQUIRED: 'errors.params_required',
  AI_UNAVAILABLE: 'errors.ai_unavailable',
  STORAGE_UNAVAILABLE: 'errors.storage_unavailable',

  // Catalogue & contenu
  TITLE_REQUIRED: 'errors.title_required',
  SLUG_REQUIRED: 'errors.slug_required',
  SLUG_TAKEN: 'errors.slug_taken',
  LANGUAGE_INVALID: 'errors.language_invalid',
  PRICE_INVALID: 'errors.price_invalid',
  POSITION_INVALID: 'errors.position_invalid',
  VISIBILITY_INVALID: 'errors.visibility_invalid',
  COURSE_NOT_FOUND: 'errors.course_not_found',
  MODULE_NOT_FOUND: 'errors.module_not_found',
  LESSON_NOT_FOUND: 'errors.lesson_not_found',
  RESOURCE_NOT_FOUND: 'errors.resource_not_found',
  COURSE_HAS_ENROLLMENTS: 'errors.course_has_enrollments',
  LESSON_TYPE_INVALID: 'errors.lesson_type_invalid',

  // Coupons
  COUPON_CODE_REQUIRED: 'errors.coupon_code_required',
  COUPON_TYPE_INVALID: 'errors.coupon_type_invalid',
  COUPON_EXISTS: 'errors.coupon_exists',
  COUPON_DISABLED: 'errors.coupon_disabled',
  COUPON_EXPIRED: 'errors.coupon_expired',
  COUPON_LIMIT_REACHED: 'errors.coupon_limit_reached',
  COUPON_PERCENT_RANGE: 'errors.coupon_percent_range',
  COUPON_AMOUNT_NEGATIVE: 'errors.coupon_amount_negative',
  COUPON_NOT_FOUND: 'errors.coupon_not_found',

  // Inscriptions
  LEARNER_NOT_FOUND: 'errors.learner_not_found',
  ALREADY_ENROLLED: 'errors.already_enrolled',
  PAYER_NOT_LINKED: 'errors.payer_not_linked',
  PAYER_AMBIGUOUS: 'errors.payer_ambiguous',
  NO_TUTOR_LINKED: 'errors.no_tutor_linked',
  SELF_PAYER_MUST_PAY_SELF: 'errors.self_payer_must_pay_self',

  // Paiement & facturation
  ENROLLMENT_NOT_FOUND: 'errors.enrollment_not_found',
  ENROLLMENT_NOT_ACTIVATABLE: 'errors.enrollment_not_activatable',
  PAYMENT_ALREADY_PROCESSED: 'errors.payment_already_processed',
  PAYMENT_AMOUNT_INVALID: 'errors.payment_amount_invalid',
  INVOICE_INVALID: 'errors.invoice_invalid',

  // Progression
  PROGRESS_STATUS_INVALID: 'errors.progress_status_invalid',
  ENROLLMENT_NOT_OWNED: 'errors.enrollment_not_owned',
  ENROLLMENT_NOT_ACTIVE: 'errors.enrollment_not_active',
  LESSON_OUT_OF_COURSE: 'errors.lesson_out_of_course',
  SCORE_OUT_OF_RANGE: 'errors.score_out_of_range',

  // Quiz
  LESSON_NOT_QUIZ: 'errors.lesson_not_quiz',
  QUIZ_EMPTY: 'errors.quiz_empty',
  TOPIC_REQUIRED: 'errors.topic_required',
  QUESTION_INVALID: 'errors.question_invalid',
  QUIZ_GENERATION_FAILED: 'errors.quiz_generation_failed',

  // Dépôts
  UPLOAD_FILENAME_REQUIRED: 'errors.upload_filename_required',
  UPLOAD_SIZE_INVALID: 'errors.upload_size_invalid',
  UPLOAD_TOO_LARGE: 'errors.upload_too_large',

  // Import JSON de cours (FR-48)
  IMPORT_INVALID: 'errors.import_invalid',
  IMPORT_SLUG_FORMAT: 'errors.import_slug_format',
  IMPORT_LESSON_CONTENT: 'errors.import_lesson_content',
  IMPORT_QUIZ_INVALID: 'errors.import_quiz_invalid',
  IMPORT_DUPLICATE_KEY: 'errors.import_duplicate_key',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

const ALL_CODES = Object.values(ErrorCodes) as readonly string[];

/** Vrai si la valeur est un code d'erreur connu (pour la traduction côté UI). */
export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && (ALL_CODES as readonly string[]).includes(value);
}
