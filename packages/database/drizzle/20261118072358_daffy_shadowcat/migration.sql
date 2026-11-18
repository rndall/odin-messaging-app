CREATE TYPE "conversation_type" AS ENUM('direct', 'group');--> statement-breakpoint
ALTER TABLE "profile_info" DROP CONSTRAINT "profile_info_user_id_key";--> statement-breakpoint
DROP INDEX "profile_info_user_id_idx";--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "type" "conversation_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_info" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "profile_info" ADD PRIMARY KEY ("user_id");--> statement-breakpoint
ALTER TABLE "conversations" ALTER COLUMN "name" DROP NOT NULL;