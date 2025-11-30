CREATE TABLE "payment_dev"."order" (
	"id" varchar(15) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"token_address" varchar(42) NOT NULL,
	"amount" numeric(78, 0) NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payment_dev"."payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"app_session_id" uuid NOT NULL,
	"order_id" varchar(15) NOT NULL,
	"provider" text DEFAULT 'DNPAY',
	"currency" varchar(10) NOT NULL,
	"amount" numeric(78, 0) NOT NULL,
	"transaction_hash" varchar(66),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "payment_dev"."payment" ADD CONSTRAINT "payment_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "payment_dev"."order"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_email_idx" ON "payment_dev"."order" USING btree ("email");--> statement-breakpoint
CREATE INDEX "payment_order_idx" ON "payment_dev"."payment" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "payment_tx_hash_idx" ON "payment_dev"."payment" USING btree ("transaction_hash");