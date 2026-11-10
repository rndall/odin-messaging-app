CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar(128) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"content" varchar(250) NOT NULL,
	"sender_id" integer NOT NULL,
	"conversation_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"edited_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "profile_info" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "profile_info_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"display_name" varchar(128),
	"avatar_url" text,
	"bio" varchar(250),
	"user_id" integer NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"username" varchar(32) NOT NULL UNIQUE,
	"password_hash" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users_to_conversations" (
	"user_id" integer,
	"conversation_id" uuid,
	CONSTRAINT "users_to_conversations_pkey" PRIMARY KEY("user_id","conversation_id")
);
--> statement-breakpoint
CREATE INDEX "messages_conversation_id_idx" ON "messages" ("conversation_id","created_at");--> statement-breakpoint
CREATE INDEX "profile_info_user_id_idx" ON "profile_info" ("user_id");--> statement-breakpoint
CREATE INDEX "users_to_conversations_user_id_idx" ON "users_to_conversations" ("user_id");--> statement-breakpoint
CREATE INDEX "users_to_conversations_conversation_id_idx" ON "users_to_conversations" ("conversation_id");--> statement-breakpoint
CREATE INDEX "users_to_conversations_composite_idx" ON "users_to_conversations" ("user_id","conversation_id");--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_users_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id");--> statement-breakpoint
ALTER TABLE "profile_info" ADD CONSTRAINT "profile_info_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "users_to_conversations" ADD CONSTRAINT "users_to_conversations_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id");--> statement-breakpoint
ALTER TABLE "users_to_conversations" ADD CONSTRAINT "users_to_conversations_conversation_id_conversations_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id");