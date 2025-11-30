import dotenv from "dotenv";

if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env.production" });
} else {
  dotenv.config({ path: ".env" });
}

export const envConfig = {
    IS_MAINNET: process.env.NODE_ENV === "production",

    DATABASE_URL: process.env.DATABASE_URL || '',
    DB_SCHEMA: process.env.DB_SCHEMA || 'public',
};