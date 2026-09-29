import { pgTable, pgEnum, text, integer, timestamp, jsonb, index, uniqueIndex, real, customType } from 'drizzle-orm/pg-core';
import type { Experience } from '../lib/models';
export const userRole = pgEnum('user_role', ['admin', 'editor', 'viewer']);
export const userStatus = pgEnum('user_status', ['active', 'disabled']);
export const ficheStatus = pgEnum('fiche_status', ['draft', 'review', 'verified', 'published', 'archived']);
export const ficheType = pgEnum('fiche_type', ['metier', 'destination', 'demo', 'projet']);
export const requestStatus = pgEnum('request_status', ['new', 'contacted', 'quoted', 'closed']);
const date = (name: string) => timestamp(name, { withTimezone: true, mode: 'string' }).notNull().defaultNow();
const bytea = customType<{ data: Buffer }>({ dataType: () => 'bytea' });
export const users = pgTable('users', {
 id: text('id').primaryKey(), email: text('email').notNull(), name: text('name').notNull(),
 role: userRole('role').notNull().default('viewer'), status: userStatus('status').notNull().default('active'),
 passwordHash: text('password_hash').notNull(), createdAt: date('created_at'), updatedAt: date('updated_at'),
}, t => [uniqueIndex('users_email_unique').on(t.email)]);
export const sessions = pgTable('sessions', {
 tokenHash: text('token_hash').primaryKey(), userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
 expiresAt: date('expires_at'), createdAt: date('created_at'),
}, t => [index('sessions_user').on(t.userId), index('sessions_expiry').on(t.expiresAt)]);
export const fiches = pgTable('fiches', {
 id: text('id').primaryKey(), slug: text('slug').notNull().unique(), type: ficheType('type').notNull(),
 title: text('title').notNull(), summary: text('summary').notNull(), body: text('body').notNull(),
 status: ficheStatus('status').notNull().default('draft'), authorId: text('author_id').references(() => users.id, { onDelete: 'set null' }),
 seoTitle: text('seo_title').notNull().default(''), seoDescription: text('seo_description').notNull().default(''),
 metadata: jsonb('metadata').$type<Partial<Experience>>().notNull().default({}), version: integer('version').notNull().default(1),
 createdAt: date('created_at'), updatedAt: date('updated_at'),
}, t => [index('fiches_status_type').on(t.status, t.type)]);
export const media = pgTable('media', {
 id: text('id').primaryKey(), ficheId: text('fiche_id').notNull().references(() => fiches.id, { onDelete: 'cascade' }),
 url: text('url').notNull(), type: text('type').notNull(), credits: text('credits').notNull(), source: text('source').notNull(),
 alt: text('alt').notNull().default(''), position: integer('position').notNull().default(0),
}, t => [index('media_fiche').on(t.ficheId)]);
export const uploadedImages = pgTable('uploaded_images', {
 id: text('id').primaryKey(), mimeType: text('mime_type').notNull(), data: bytea('data').notNull(), byteSize: integer('byte_size').notNull(),
 ficheId: text('fiche_id').references(() => fiches.id, { onDelete: 'cascade' }),
 createdBy: text('created_by').references(() => users.id, { onDelete: 'set null' }), createdAt: date('created_at'),
}, t => [index('uploaded_images_fiche').on(t.ficheId), index('uploaded_images_created_at').on(t.createdAt)]);
export const pointsOfInterest = pgTable('points_of_interest', {
 id: text('id').primaryKey(), ficheId: text('fiche_id').notNull().references(() => fiches.id, { onDelete: 'cascade' }),
 label: text('label').notNull(), description: text('description').notNull(), yaw: real('yaw').notNull(), pitch: real('pitch').notNull(),
 position: integer('position').notNull().default(0),
}, t => [index('poi_fiche').on(t.ficheId)]);
export const requests = pgTable('requests', {
 id: text('id').primaryKey(), ficheId: text('fiche_id').references(() => fiches.id, { onDelete: 'set null' }),
 userId: text('user_id').references(() => users.id, { onDelete: 'set null' }), name: text('name').notNull(),
 email: text('email').notNull(), organization: text('organization').notNull().default(''), intent: text('intent').notNull(),
 message: text('message').notNull(), status: requestStatus('status').notNull().default('new'),
 fingerprint: text('fingerprint').notNull(), createdAt: date('created_at'), updatedAt: date('updated_at'),
}, t => [index('requests_user').on(t.userId), index('requests_fiche').on(t.ficheId), index('requests_date').on(t.createdAt)]);
export const auditLog = pgTable('audit_log', {
 id: text('id').primaryKey(), userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
 action: text('action').notNull(), target: text('target').notNull(), metadata: jsonb('metadata').notNull().default({}), createdAt: date('created_at'),
});
export const settings = pgTable('settings', { key: text('key').primaryKey(), value: jsonb('value').notNull(), updatedAt: date('updated_at') });
export const rateLimits = pgTable('rate_limits', { key: text('key').primaryKey(), count: integer('count').notNull(), expiresAt: date('expires_at') });
