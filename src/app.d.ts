import type { D1Database, R2Bucket, Ai } from '@cloudflare/workers-types';

declare global {
  namespace App {
    interface Locals {
      user?: {
        id: string;
        role: 'admin' | 'learner' | 'tutor';
        email: string;
        name?: string | null;
      };
      sessionToken?: string;
    }
    interface Platform {
      env?: {
        DB: D1Database;
        FILES?: R2Bucket;
        AI?: Ai;
      };
    }
  }
}

export {};
