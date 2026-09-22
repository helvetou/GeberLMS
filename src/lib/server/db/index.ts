import { drizzle } from 'drizzle-orm/d1';
import type { DrizzleD1Database } from 'drizzle-orm/d1';
import type { D1Database } from '@cloudflare/workers-types';
import * as schema from './schema';

export type DB = DrizzleD1Database<typeof schema>;

export function createDb(d1: D1Database): DB {
  return drizzle(d1, { schema });
}
