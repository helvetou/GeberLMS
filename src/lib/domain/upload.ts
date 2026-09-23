/**
 * Dépôt de documents par l'apprenant (FR-24).
 */

/** Taille maximale d'un dépôt : 10 Mo. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export interface UploadInput {
  filename: string;
  contentType?: string;
  sizeBytes: number;
}

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadError';
  }
}

/** Valide un dépôt avant enregistrement dans R2. */
export function validateUpload(input: UploadInput): void {
  if (!input.filename.trim()) {
    throw new UploadError('Nom de fichier requis');
  }
  if (!Number.isFinite(input.sizeBytes) || input.sizeBytes < 0) {
    throw new UploadError('Taille invalide');
  }
  if (input.sizeBytes > MAX_UPLOAD_BYTES) {
    throw new UploadError('Fichier trop volumineux (max 10 Mo)');
  }
}
