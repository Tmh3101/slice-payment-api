import { pgSchema } from "drizzle-orm/pg-core";
import { envConfig } from "@/config/env";

export const paymentDB = pgSchema(envConfig.DB_SCHEMA);

export const checkConnection = async (client: any) => {
    await client`SELECT 1`;
};