CREATE TABLE "media_assets" (
 "id" text PRIMARY KEY NOT NULL,
 "name" text NOT NULL,
 "kind" text NOT NULL,
 "mime_type" text NOT NULL,
 "byte_size" integer NOT NULL,
 "category" text NOT NULL,
 "chunk_size" integer NOT NULL,
 "chunk_count" integer NOT NULL,
 "status" text DEFAULT 'uploading' NOT NULL,
 "created_by" text,
 "created_at" timestamp with time zone DEFAULT now() NOT NULL,
 CONSTRAINT "media_assets_kind_check" CHECK ("kind" IN ('video','document')),
 CONSTRAINT "media_assets_status_check" CHECK ("status" IN ('uploading','ready'))
);
--> statement-breakpoint
CREATE TABLE "media_asset_chunks" (
 "media_id" text NOT NULL,
 "position" integer NOT NULL,
 "data" bytea NOT NULL,
 "byte_size" integer NOT NULL,
 CONSTRAINT "media_asset_chunks_media_id_position_pk" PRIMARY KEY("media_id","position")
);
--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "media_asset_chunks" ADD CONSTRAINT "media_asset_chunks_media_id_media_assets_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media_assets"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "media_assets_kind_category" ON "media_assets" USING btree ("kind","category");
--> statement-breakpoint
CREATE INDEX "media_assets_created_at" ON "media_assets" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX "media_asset_chunks_media" ON "media_asset_chunks" USING btree ("media_id");
