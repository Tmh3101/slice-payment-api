ALTER TABLE "payment_dev"."payment" ALTER COLUMN "id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "payment_dev"."payment" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "payment_dev"."payment" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "payment_dev"."payment" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_dev"."payment" DROP COLUMN "updated_at";