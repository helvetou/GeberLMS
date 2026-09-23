import { describe, it, expect } from 'vitest';
import { validateUpload, UploadError, MAX_UPLOAD_BYTES } from '../../src/lib/domain/upload';

describe('validateUpload (FR-24)', () => {
  it('accepts a valid upload', () => {
    expect(() =>
      validateUpload({ filename: 'devoir.pdf', contentType: 'application/pdf', sizeBytes: 1024 }),
    ).not.toThrow();
  });

  it('accepts a file at exactly the size limit', () => {
    expect(() => validateUpload({ filename: 'a.txt', sizeBytes: MAX_UPLOAD_BYTES })).not.toThrow();
  });

  it('rejects an empty filename', () => {
    expect(() => validateUpload({ filename: '   ', sizeBytes: 10 })).toThrow(UploadError);
  });

  it('rejects a negative size', () => {
    expect(() => validateUpload({ filename: 'a.txt', sizeBytes: -1 })).toThrow(UploadError);
  });

  it('rejects a file above the size limit', () => {
    expect(() =>
      validateUpload({ filename: 'a.txt', sizeBytes: MAX_UPLOAD_BYTES + 1 }),
    ).toThrow(UploadError);
  });
});
