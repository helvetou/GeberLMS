import type { DB } from './db';
import { activityLogs } from './db/schema';
import { createActivityEntry } from '$lib/domain/activity';

export interface LogActivityInput {
  actorId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  meta?: Record<string, unknown>;
}

/** Écrit une entrée du journal d'audit (FR-23). */
export async function logActivity(db: DB, input: LogActivityInput): Promise<void> {
  const entry = createActivityEntry({
    id: crypto.randomUUID(),
    actorId: input.actorId,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    meta: input.meta ? JSON.stringify(input.meta) : undefined,
  });

  await db
    .insert(activityLogs)
    .values({
      id: entry.id,
      actorId: entry.actorId ?? null,
      action: entry.action,
      targetType: entry.targetType ?? null,
      targetId: entry.targetId ?? null,
      meta: entry.meta ?? null,
      createdAt: entry.createdAt,
    })
    .run();
}
