import { describe, it, expect } from 'vitest';
import {
  isLanguage,
  isContentType,
  isVisibility,
  LANGUAGES,
  CONTENT_TYPES,
  VISIBILITIES,
} from '../../src/lib/domain/content';

describe('content — langues (FR-14)', () => {
  it('accepts the four supported languages', () => {
    for (const l of ['fr', 'en', 'ar', 'de']) {
      expect(isLanguage(l), l).toBe(true);
    }
  });

  it('rejects unsupported languages', () => {
    for (const l of ['es', 'FR', 'de-DE', '']) {
      expect(isLanguage(l), l).toBe(false);
    }
  });

  it('exposes exactly four languages', () => {
    expect(LANGUAGES).toEqual(['fr', 'en', 'ar', 'de']);
  });
});

describe('content — types (FR-13)', () => {
  it('accepts video, text and quiz', () => {
    for (const t of ['video', 'text', 'quiz']) {
      expect(isContentType(t), t).toBe(true);
    }
  });

  it('rejects unknown types', () => {
    for (const t of ['audio', 'pdf', '']) {
      expect(isContentType(t), t).toBe(false);
    }
  });
});

describe('content — visibilité (FR-12)', () => {
  it('accepts visible and hidden', () => {
    expect(isVisibility('visible')).toBe(true);
    expect(isVisibility('hidden')).toBe(true);
  });

  it('rejects unknown values', () => {
    for (const v of ['draft', 'public', '']) {
      expect(isVisibility(v), v).toBe(false);
    }
  });

  it('exposes exactly two visibilities', () => {
    expect(VISIBILITIES).toEqual(['visible', 'hidden']);
  });
});
