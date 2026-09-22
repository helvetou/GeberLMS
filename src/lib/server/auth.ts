import { eq } from 'drizzle-orm';
import type { DB } from './db';
import { users, sessions, type UserRow, type SessionRow } from './db/schema';
import { hashPassword, verifyPassword } from '$lib/domain/password';
import { createSession as createDomainSession } from '$lib/domain/session';
import type { Role } from '$lib/domain/roles';

export interface CreateUserInput {
  role: Role;
  email: string;
  name?: string | null;
  selfPayer?: boolean;
  password?: string;
}

export async function createUser(db: DB, input: CreateUserInput): Promise<string> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const passwordHash = input.password ? await hashPassword(input.password) : null;

  await db.insert(users).values({
    id,
    role: input.role,
    email: input.email,
    name: input.name ?? null,
    selfPayer: input.selfPayer ?? false,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  });

  return id;
}

export async function getUserByEmail(db: DB, email: string): Promise<UserRow | undefined> {
  return db.select().from(users).where(eq(users.email, email)).get();
}

export async function verifyLogin(
  db: DB,
  email: string,
  password: string,
): Promise<UserRow | null> {
  const user = await getUserByEmail(db, email);
  if (!user || !user.passwordHash) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  return ok ? user : null;
}

export function issueSession(db: DB, userId: string) {
  const session = createDomainSession(userId);
  return db
    .insert(sessions)
    .values({
      token: session.token,
      userId: session.userId,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    })
    .run()
    .then(() => session);
}

export async function getSessionWithUser(
  db: DB,
  token: string,
): Promise<{ session: SessionRow; user: UserRow } | null> {
  const session = await db.select().from(sessions).where(eq(sessions.token, token)).get();
  if (!session) return null;

  const user = await db.select().from(users).where(eq(users.id, session.userId)).get();
  if (!user) return null;

  return { session, user };
}

export async function deleteSession(db: DB, token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.token, token)).run();
}
