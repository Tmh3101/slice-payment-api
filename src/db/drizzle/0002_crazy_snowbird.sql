ALTER TABLE "payment_dev"."payment" ADD COLUMN "status" text NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_dev"."payment" ADD COLUMN "client_secret" text NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_dev"."payment" ADD COLUMN "expires_at" timestamp NOT NULL;