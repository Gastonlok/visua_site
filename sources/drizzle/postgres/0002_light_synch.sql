CREATE TABLE "uploaded_images" (
	"id" text PRIMARY KEY NOT NULL,
	"mime_type" text NOT NULL,
	"data" "bytea" NOT NULL,
	"byte_size" integer NOT NULL,
	"fiche_id" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "uploaded_images" ADD CONSTRAINT "uploaded_images_fiche_id_fiches_id_fk" FOREIGN KEY ("fiche_id") REFERENCES "public"."fiches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uploaded_images" ADD CONSTRAINT "uploaded_images_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "uploaded_images_fiche" ON "uploaded_images" USING btree ("fiche_id");--> statement-breakpoint
CREATE INDEX "uploaded_images_created_at" ON "uploaded_images" USING btree ("created_at");