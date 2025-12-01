import { uuid, text, bigint, varchar, numeric, timestamp, unique, index } from "drizzle-orm/pg-core";
import { paymentDB } from "./utils"

export enum OrderStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED"
}

export enum PaymentProvider {
  DNPAY = 'DNPAY',
}

export const orderSchema = paymentDB.table("order", {
  id: varchar("id", { length: 15 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),

  tokenAddress: varchar("token_address", { length: 42 }).notNull(), // RYF Address
  amount: numeric("amount", { precision: 78, scale: 0 }).notNull(), // Amount of RYF in smallest unit
  status: text("status").notNull().default(OrderStatus.PENDING),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date())
}, (table) => {
  return {
    emailIdx: index("order_email_idx").on(table.email),
  };
});

export const paymentSchema = paymentDB.table("payment", {
  id: varchar("id", { length: 36 }).primaryKey(), // DNPAY Payment Intent ID
  provider: text("provider").default(PaymentProvider.DNPAY),

  appSessionId: uuid("app_session_id").notNull(), // // Session ID from provider app
  currency: varchar("currency", { length: 10 }).notNull(), // VNDC or USDT
  amount: numeric("amount", { precision: 78, scale: 0 }).notNull(), // Amount to pay in smallest unit of the currency
  status: text("status").notNull(),
  clientSecret: text("client_secret").notNull(),
  expiresAt: timestamp("expires_at").notNull(),

  transactionHash: varchar("transaction_hash", { length: 66 }),

  orderId: varchar("order_id", { length: 15 })
    .notNull()
    .references(() => orderSchema.id, { onDelete: 'cascade' }),

  createdAt: timestamp("created_at").notNull(),
}, (table) => {
  return {
    orderIdx: index("payment_order_idx").on(table.orderId),
    txHashIdx: index("payment_tx_hash_idx").on(table.transactionHash),
  };
})

export type Order = typeof orderSchema.$inferSelect;
export type Payment = typeof paymentSchema.$inferSelect;