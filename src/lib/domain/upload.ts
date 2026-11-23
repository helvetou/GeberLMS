/**
 * Dépôt de documents par l'apprenant (FR-24).
 */
import { ErrorCodes, type ErrorCode } from './errors';

/** Taille maximale d'un dépôt : 10 Mo. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export interface UploadInput {
  filename: string;
  contentType?: string;
  sizeBytes: number;
}

export class UploadError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = 'UploadError';
    this.code = code;
  }
}

/** Valide un dépôt avant enregistrement dans R2. */
export function validateUpload(input: UploadInput): void {
  if (!input.filename.trim()) {
    throw new UploadError(ErrorCodes.UPLOAD_FILENAME_REQUIRED, 'Nom de fichier requis');
  }
  if (!Number.isFinite(input.sizeBytes) || input.sizeBytes < 0) {
    throw new UploadError(ErrorCodes.UPLOAD_SIZE_INVALID, 'Taille invalide');
  }
  if (input.sizeBytes > MAX_UPLOAD_BYTES) {
    throw new UploadError(ErrorCodes.UPLOAD_TOO_LARGE, 'Fichier trop volumineux (max 10 Mo)');
  }
}
