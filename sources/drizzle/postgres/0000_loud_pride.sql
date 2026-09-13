CREATE TYPE "public"."fiche_status" AS ENUM('draft', 'review', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."fiche_type" AS ENUM('metier', 'destination', 'demo', 'projet');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('new', 'contacted', 'quoted', 'closed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'editor', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'disabled');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"target" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fiches" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"type" "fiche_type" NOT NULL,
	"title" text NOT NULL,
	"summary" text NOT NULL,
	"body" text NOT NULL,
	"status" "fiche_status" DEFAULT 'draft' NOT NULL,
	"author_id" text,
	"seo_title" text DEFAULT '' NOT NULL,
	"seo_description" text DEFAULT '' NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fiches_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" text PRIMARY KEY NOT NULL,
	"fiche_id" text NOT NULL,
	"url" text NOT NULL,
	"type" text NOT NULL,
	"credits" text NOT NULL,
	"source" text NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "points_of_interest" (
	"id" text PRIMARY KEY NOT NULL,
	"fiche_id" text NOT NULL,
	"label" text NOT NULL,
	"description" text NOT NULL,
	"yaw" real NOT NULL,
	"pitch" real NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer NOT NULL,
	"expires_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "requests" (
	"id" text PRIMARY KEY NOT NULL,
	"fiche_id" text,
	"user_id" text,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"organization" text DEFAULT '' NOT NULL,
	"intent" text NOT NULL,
	"message" text NOT NULL,
	"status" "request_status" DEFAULT 'new' NOT NULL,
	"fingerprint" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" "user_role" DEFAULT 'viewer' NOT NULL,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fiches" ADD CONSTRAINT "fiches_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media" ADD CONSTRAINT "media_fiche_id_fiches_id_fk" FOREIGN KEY ("fiche_id") REFERENCES "public"."fiches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_of_interest" ADD CONSTRAINT "points_of_interest_fiche_id_fiches_id_fk" FOREIGN KEY ("fiche_id") REFERENCES "public"."fiches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_fiche_id_fiches_id_fk" FOREIGN KEY ("fiche_id") REFERENCES "public"."fiches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fiches_status_type" ON "fiches" USING btree ("status","type");--> statement-breakpoint
CREATE INDEX "media_fiche" ON "media" USING btree ("fiche_id");--> statement-breakpoint
CREATE INDEX "poi_fiche" ON "points_of_interest" USING btree ("fiche_id");--> statement-breakpoint
CREATE INDEX "requests_user" ON "requests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "requests_fiche" ON "requests" USING btree ("fiche_id");--> statement-breakpoint
CREATE INDEX "requests_date" ON "requests" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "sessions_user" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_expiry" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");