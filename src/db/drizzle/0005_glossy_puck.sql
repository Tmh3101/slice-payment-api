DROP INDEX "payment_dev"."payment_tx_hash_idx";--> statement-breakpoint
ALTER TABLE "payment_dev"."order" ADD COLUMN "user_wallet_address" varchar(42) NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_dev"."payment" DROP COLUMN "transaction_hash";