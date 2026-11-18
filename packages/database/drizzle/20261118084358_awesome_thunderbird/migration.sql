DROP INDEX "users_to_conversations_user_id_idx";--> statement-breakpoint
DROP INDEX "users_to_conversations_conversation_id_idx";--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "direct_key" varchar(32);--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_direct_key_key" UNIQUE("direct_key");--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "direct_key_matches_type" CHECK (("type" = 'direct') = ("direct_key" IS NOT NULL));