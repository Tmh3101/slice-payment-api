CREATE TABLE "payment_dev"."transfer" (
	"order_id" varchar(15) NOT NULL,
	"tx_hash" varchar(66) NOT NULL,
	"block_number" numeric(78, 0) NOT NULL,
	CONSTRAINT "transfer_order_id_tx_hash_pk" PRIMARY KEY("order_id","tx_hash")
);
--> statement-breakpoint
ALTER TABLE "payment_dev"."transfer" ADD CONSTRAINT "transfer_order_id_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "payment_dev"."order"("id") ON DELETE cascade ON UPDATE no action;