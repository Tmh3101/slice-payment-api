# Slice Payment API

This repository contains the backend for Slice Payment API — a Node.js + TypeScript service built with Hono, Drizzle ORM and TypeScript. This README explains how to build and deploy the app using **Docker** or **Vercel**. Postgres is provided externally via Supabase, so the database is not containerized here.

**Quick overview**
- Language: TypeScript
- Framework: Hono
- ORM: Drizzle
- Build: `tsup` (ESM output in `dist`)
- Package manager: `pnpm` (lockfile present)

**Ports**
- Default: `3000` (configurable via `PORT` env var)

---

## Prerequisites

- **For Docker deployment**: Docker Engine
- **For Vercel deployment**: Vercel account & Vercel CLI (optional)
- **Database**: Supabase Postgres (external)

---

## Environment Variables

Copy `.env.example` to your `.env` (local) or configure in your deployment platform. Key variables:

- `DATABASE_URL` — Supabase Postgres connection string
- `DB_SCHEMA` — Database schema (default: `public`)
- `DNPAY_API_URL`, `DNPAY_API_KEY`, `DNPAY_API_SECRET`, `DNPAY_WEBHOOK_SECRET`
- `ADMIN_PRIVATE_KEY` — Private key for on-chain operations
- `PORT` — Server port (optional, default: 3000)
- `NODE_ENV` — Environment mode (`production` / `development`)
- `LOG_LEVEL` — Log level (optional, default: `debug`)

---

## Deployment Option 1: Docker

### Build & Run

1. **Build the image:**

```powershell
docker build -t slice-payment-api:latest .
```

2. **Run the container** using an env file (recommended):

```powershell
docker run -d --name slice-payment `
  --env-file ./.env.production `
  -p 3000:3000 `
  slice-payment-api:latest
```

Or pass individual env vars:

```powershell
docker run -d --name slice-payment `
  -e DATABASE_URL="your_db_url" `
  -e ADMIN_PRIVATE_KEY="0x..." `
  -p 3000:3000 `
  slice-payment-api:latest
```

### Docker Build Strategy

- The `Dockerfile` uses a multi-stage build:
  - **builder**: installs dependencies with `pnpm`, builds TypeScript into `dist` using `tsup`
  - **runner**: installs production dependencies and runs the built `dist/index.js`

### Optional: Docker Compose

```yaml
version: '3.8'
services:
  app:
    image: slice-payment-api:latest
    build: .
    env_file:
      - ./.env.production
    ports:
      - 3000:3000
    restart: unless-stopped

# Note: Database provided by Supabase externally, not included here.
```

---

## Deployment Option 2: Vercel (Serverless)

Vercel supports serverless deployment for Hono apps. This project is configured to deploy as a Vercel Function.

### Project Structure for Vercel

```
slice-payment-api/
├── api/
│   └── index.ts          # Vercel serverless entry point
├── src/
│   ├── index.ts          # Local dev entry (with serve)
│   ├── routes/
│   ├── controllers/
│   └── ...
├── vercel.json           # Vercel configuration
└── package.json
```

### Deploy Steps

#### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not installed):

```powershell
pnpm add -g vercel
```

2. **Login to Vercel:**

```powershell
vercel login
```

3. **Deploy to Vercel:**

```powershell
vercel
```

- First time: Vercel will ask you to link/create a project
- Follow prompts to configure your project
- Vercel will detect `pnpm` and use it automatically

4. **Deploy to Production:**

```powershell
vercel --prod
```

#### Method 2: GitHub Integration (Automatic)

1. **Push your code to GitHub**
2. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
3. **Import your GitHub repository**
4. **Configure Environment Variables** in Vercel project settings:
   - Add all variables from `.env.example`
   - `DATABASE_URL`, `DNPAY_API_KEY`, `DNPAY_API_SECRET`, etc.
5. **Deploy** — Vercel will auto-deploy on every push to `main`

### Vercel Configuration

The `vercel.json` file is already configured:

```json
{
  "buildCommand": "pnpm run build",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install",
  "framework": null,
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api"
    }
  ]
}
```

### API Routes on Vercel

After deployment, your API will be available at:

```
https://your-project.vercel.app/api/
https://your-project.vercel.app/api/orders
https://your-project.vercel.app/api/dnpay-payment
```

### Local Development

```powershell
pnpm install
pnpm run dev
```

Open `http://localhost:3000`

---

## Database Migrations

If you need to run migrations against Supabase:

```powershell
# Generate migration files
pnpm run migrate:gen

# Push migrations to database
pnpm run migrate:push
```

⚠️ **Warning**: Be careful when running migrations on production databases!

---

## Troubleshooting

### Docker Issues
- If you see native module errors, ensure your build platform matches deployment
- Verify all required env vars are set in `.env` or `--env-file`

### Vercel Issues
- **Cold starts**: Serverless functions may have cold start delays
- **Timeout**: Vercel has execution time limits (10s for Hobby, 60s for Pro)
- **Environment variables**: Make sure all env vars are configured in Vercel dashboard
- **Import paths**: Ensure all imports use `.js` extensions for ESM compatibility

### Common Errors
- `ADMIN_PRIVATE_KEY` missing → Add to env vars
- `DATABASE_URL` not set → Check Supabase connection string
- DNPAY credentials invalid → Verify API keys

---

## Next Steps & Suggestions

- ✅ Add health check endpoint (`/health`) for monitoring
- ✅ Set up CI/CD pipeline (GitHub Actions)
- ✅ Configure custom domain in Vercel
- ✅ Add rate limiting middleware
- ✅ Set up error tracking (Sentry, LogRocket)
- ✅ Add API documentation (Swagger/OpenAPI)

---

## License

[Your License Here]

```
npm install
npm run dev
```

```
open http://localhost:3000
```
