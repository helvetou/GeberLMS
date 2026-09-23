import { eq } from 'drizzle-orm';
import type { R2Bucket } from '@cloudflare/workers-types';
import type { DB } from './db';
import { uploads } from './db/schema';
import { validateUpload } from '$lib/domain/upload';

export class UploadServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UploadServiceError';
  }
}

export interface UploadFile {
  filename: string;
  contentType?: string;
  data: ArrayBuffer;
}

export function listUploads(db: DB, learnerId: string) {
  return db.select().from(uploads).where(eq(uploads.learnerId, learnerId)).all();
}

/** Dépose un document dans R2 et enregistre la métadonnée en D1 (FR-24). */
export async function createUpload(
  db: DB,
  r2: R2Bucket,
  learnerId: string,
  file: UploadFile,
  lessonId?: string,
): Promise<string> {
  validateUpload({
    filename: file.filename,
    contentType: file.contentType,
    sizeBytes: file.data.byteLength,
  });

  const id = crypto.randomUUID();
  const safeName = file.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const r2Key = `${learnerId}/${id}-${safeName}`;

  await r2.put(r2Key, file.data);

  await db
    .insert(uploads)
    .values({
      id,
      learnerId,
      lessonId: lessonId || null,
      r2Key,
      filename: file.filename,
      contentType: file.contentType ?? null,
      createdAt: new Date().toISOString(),
    })
    .run();

  return id;
}
