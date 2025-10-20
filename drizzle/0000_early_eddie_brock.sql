CREATE TABLE "urls" (
	"id" serial PRIMARY KEY NOT NULL,
	"short_code" varchar(7) NOT NULL,
	"target_url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "urls_short_code_unique" UNIQUE("short_code")
);
