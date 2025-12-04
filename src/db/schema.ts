import { uuid, text, varchar, numeric, timestamp, index, primaryKey } from "drizzle-orm/pg-core";
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
  userWalletAddress: varchar("user_wallet_address", { length: 42 }).notNull(), // User's wallet address

  tokenAddress: varchar("token_address", { length: 42 }).notNull(), // RYF Address
  amount: numeric("amount", { precision: 78, scale: 18 }).notNull(), // Amount of RYF in smallest unit
  status: text("status").notNull().default(OrderStatus.PENDING),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date())
}, (table) => {
  return {
    emailIdx: index("order_email_idx").on(table.email),
  };
});

export const transferSchema = paymentDB.table("transfer", {
  orderId: varchar("order_id", { length: 15 })
    .notNull()
    .references(() => orderSchema.id, { onDelete: 'cascade' }),
  txHash: varchar("tx_hash", { length: 66 }).notNull(),
  blockNumber: numeric("block_number", { precision: 78, scale: 0 }).notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.orderId, table.txHash] }),
  };
});

export const paymentSchema = paymentDB.table("payment", {
  id: varchar("id", { length: 36 }).primaryKey(), // DNPAY Payment Intent ID
  provider: text("provider").default(PaymentProvider.DNPAY),

  appSessionId: uuid("app_session_id").notNull(), // // Session ID from provider app
  currency: varchar("currency", { length: 10 }).notNull(), // VNDC or USDT
  amount: numeric("amount", { precision: 78, scale: 18 }).notNull(), // Amount to pay in smallest unit of the currency
  status: text("status").notNull(),

  orderId: varchar("order_id", { length: 15 })
    .notNull()
    .references(() => orderSchema.id, { onDelete: 'cascade' }),

  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull(),
}, (table) => {
  return {
    orderIdx: index("payment_order_idx").on(table.orderId),
  };
})

export type Order = typeof orderSchema.$inferSelect;
export type Transfer = typeof transferSchema.$inferSelect;
export type Payment = typeof paymentSchema.$inferSelect;