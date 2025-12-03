import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

export const client = postgres(
    process.env.DATABASE_URL!,
    {
        ssl: "require" as any
    }
);

export const db = drizzle(client);

export * from "./utils.js";