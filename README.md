# Slice Payment API

This repository contains the backend for Slice Payment API — a Node.js + TypeScript service built with Hono, Drizzle ORM and TypeScript. This README explains how to build and deploy the app using Docker. Postgres is provided externally via Supabase, so the database is not containerized here.

**Quick overview**
- Language: TypeScript
- Framework: Hono
- ORM: Drizzle
- Build: `tsup` (ESM output in `dist`)
- Package manager: `pnpm` (lockfile present)

**Ports**
- Default: `3000` (configurable via `PORT` env var)

Prerequisites
- Docker (Engine)

Environment
- Copy `env.example` to your `.env` (or create a production `.env.production`) and fill in values. Key variables:
  - `DATABASE_URL` (Supabase Postgres connection string)
  - `DNPAY_API_URL`, `DNPAY_API_KEY`, `DNPAY_API_SECRET`, `DNPAY_WEBHOOK_SECRET`
  - `ADMIN_PRIVATE_KEY`
  - `PORT` (optional)

Build & run with Docker

1. Build the image:

```powershell
docker build -t slice-payment-api:latest .
```

2. Run the container using an env file (recommended):

```powershell
docker run -d --name slice-payment \
  --env-file ./env.production \
  -p 3000:3000 \
  slice-payment-api:latest
```

Or pass individual env vars:

```powershell
docker run -d --name slice-payment -e DATABASE_URL="your_db_url" -e ADMIN_PRIVATE_KEY="0x..." -p 3000:3000 slice-payment-api:latest
```

Notes about build strategy
- The provided `Dockerfile` uses a multi-stage build:
  - `builder`: installs dependencies with `pnpm`, builds TypeScript into `dist` using `tsup`
  - `runner`: installs production dependencies and runs the built `dist/index.js`

Supabase
- Because you use Supabase for Postgres, you only need to provide the `DATABASE_URL` value that Supabase gives you.

Troubleshooting
- If you see issues with native modules or unexpected platform differences, you can build the image on a platform matching your deployment environment.
- Ensure your `.env` or `--env-file` contains all required env vars. Missing `ADMIN_PRIVATE_KEY` or DnPay credentials will cause runtime errors.

Optional: Docker Compose (example)

```yaml
version: '3.8'
services:
  app:
    image: slice-payment-api:latest
    build: .
    env_file:
      - ./env.production
    ports:
      - 3000:3000
    restart: unless-stopped

# Note: Database provided by Supabase externally, not included here.
```

Next steps & suggestions
- Add CI pipeline to build and push Docker image to your registry.
- Add health check endpoint for container orchestration.
- If you need migrations in deployment, run `pnpm run migrate:push` against your Supabase database (careful with production migrations).
```
npm install
npm run dev
```

```
open http://localhost:3000
```
