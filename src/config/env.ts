import dotenv from "dotenv";

if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env.production" });
} else {
  dotenv.config({ path: ".env" });
}

export const envConfig = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  IS_MAINNET: process.env.NODE_ENV === "production",

  DATABASE_URL: process.env.DATABASE_URL || '',
  DB_SCHEMA: process.env.DB_SCHEMA || 'public',

  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: process.env.REDIS_PORT
    ? parseInt(process.env.REDIS_PORT, 10)
    : 6379,

  MORALIS_API_KEY: process.env.MORALIS_API_KEY!,

  MAX_TOKEN_PER_PAYMENT: process.env.MAX_TOKEN_PER_PAYMENT
    ? parseInt(process.env.MAX_TOKEN_PER_PAYMENT, 10)
    : 1000,

  DNPAY_API_URL: process.env.DNPAY_API_URL,
  DNPAY_API_KEY: process.env.DNPAY_API_KEY,
  DNPAY_API_SECRET: process.env.DNPAY_API_SECRET,
  DNPAY_WEBHOOK_SECRET: process.env.DNPAY_WEBHOOK_SECRET,

  ADMIN_PRIVATE_KEY: process.env.ADMIN_PRIVATE_KEY!,
};