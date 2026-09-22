import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  role: text('role', { enum: ['admin', 'learner', 'tutor'] }).notNull(),
  selfPayer: integer('self_payer', { mode: 'boolean' }).notNull().default(false),
  email: text('email').notNull().unique(),
  name: text('name'),
  locale: text('locale').notNull().default('fr'),
  passwordHash: text('password_hash'),
  status: text('status').notNull().default('active'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const sessions = sqliteTable('sessions', {
  token: text('token').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: integer('created_at', { mode: 'number' }).notNull(),
  expiresAt: integer('expires_at', { mode: 'number' }).notNull(),
});

export const guardianships = sqliteTable(
  'guardianships',
  {
    tutorId: text('tutor_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    learnerId: text('learner_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: text('created_at').notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.tutorId, t.learnerId] }) }),
);

export const courses = sqliteTable('courses', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  language: text('language', { enum: ['fr', 'en', 'ar', 'de'] }).notNull(),
  visibility: text('visibility', { enum: ['visible', 'hidden'] }).notNull().default('visible'),
  priceCents: integer('price_cents').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const modules = sqliteTable('modules', {
  id: text('id').primaryKey(),
  courseId: text('course_id')
    .notNull()
    .references(() => courses.id, { onDelete: 'cascade' }),
  position: integer('position').notNull().default(0),
  title: text('title').notNull(),
  visibility: text('visibility', { enum: ['visible', 'hidden'] }).notNull().default('visible'),
  createdAt: text('created_at').notNull(),
});

export const lessons = sqliteTable('lessons', {
  id: text('id').primaryKey(),
  moduleId: text('module_id')
    .notNull()
    .references(() => modules.id, { onDelete: 'cascade' }),
  position: integer('position').notNull().default(0),
  title: text('title').notNull(),
  type: text('type', { enum: ['video', 'text', 'quiz'] }).notNull(),
  visibility: text('visibility', { enum: ['visible', 'hidden'] }).notNull().default('visible'),
  contentRef: text('content_ref'),
  createdAt: text('created_at').notNull(),
});

export const resources = sqliteTable('resources', {
  id: text('id').primaryKey(),
  lessonId: text('lesson_id')
    .notNull()
    .references(() => lessons.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  r2Key: text('r2_key'),
  visibility: text('visibility', { enum: ['visible', 'hidden'] }).notNull().default('visible'),
  createdAt: text('created_at').notNull(),
});

export const coupons = sqliteTable('coupons', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  type: text('type', { enum: ['percent', 'amount'] }).notNull(),
  value: integer('value').notNull(),
  scope: text('scope'),
  expiresAt: text('expires_at'),
  maxUses: integer('max_uses'),
  usedCount: integer('used_count').notNull().default(0),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
});

export const enrollments = sqliteTable('enrollments', {
  id: text('id').primaryKey(),
  learnerId: text('learner_id')
    .notNull()
    .references(() => users.id),
  courseId: text('course_id')
    .notNull()
    .references(() => courses.id),
  payerId: text('payer_id')
    .notNull()
    .references(() => users.id),
  couponId: text('coupon_id').references(() => coupons.id),
  discountCents: integer('discount_cents').notNull().default(0),
  status: text('status', { enum: ['pending', 'active', 'expired', 'revoked'] })
    .notNull()
    .default('pending'),
  netCents: integer('net_cents').notNull(),
  vatRatePercent: real('vat_rate_percent').notNull(),
  vatCents: integer('vat_cents').notNull(),
  totalCents: integer('total_cents').notNull(),
  createdAt: text('created_at').notNull(),
});

export const progress = sqliteTable('progress', {
  id: text('id').primaryKey(),
  enrollmentId: text('enrollment_id')
    .notNull()
    .references(() => enrollments.id, { onDelete: 'cascade' }),
  lessonId: text('lesson_id')
    .notNull()
    .references(() => lessons.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['not_started', 'in_progress', 'completed'] })
    .notNull()
    .default('not_started'),
  score: real('score'),
  completedAt: text('completed_at'),
  updatedAt: text('updated_at').notNull(),
});

export type UserRow = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type SessionRow = typeof sessions.$inferSelect;
