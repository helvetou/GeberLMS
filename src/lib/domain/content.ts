/**
 * Vocabulaire du contenu pédagogique (FR-13, FR-14).
 */

export type Language = 'fr' | 'en' | 'ar' | 'de';
export const LANGUAGES = ['fr', 'en', 'ar', 'de'] as const;

export type ContentType = 'video' | 'text' | 'quiz';
export const CONTENT_TYPES = ['video', 'text', 'quiz'] as const;

export type Visibility = 'visible' | 'hidden';

export function isLanguage(value: string): value is Language {
  return (LANGUAGES as readonly string[]).includes(value);
}

export function isContentType(value: string): value is ContentType {
  return (CONTENT_TYPES as readonly string[]).includes(value);
}
