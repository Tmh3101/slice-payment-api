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

- **For Docker deployment**: Docker Engine & Docker Compose
- **For Vercel deployment**: Vercel account & Vercel CLI (optional)
- **Database**: Supabase Postgres (external)
- **Cache**: Redis (local or Docker for dev, managed service for production)

---

## Environment Variables

Copy `.env.example` to your `.env` (local) or configure in your deployment platform. Key variables:

**Server Configuration:**
- `PORT` — Server port (optional, default: 3000)
- `NODE_ENV` — Environment mode (`production` / `development`)
- `LOG_LEVEL` — Log level (optional, default: `debug`)

**Database (Supabase):**
- `DATABASE_URL` — Supabase Postgres connection string
- `DB_SCHEMA` — Database schema (default: `public`)

**Redis (Token Price Caching):**
- `REDIS_HOST` — Redis server host (default: `localhost`, use `redis` for Docker Compose)
- `REDIS_PORT` — Redis server port (default: `6379`)

**Moralis API (Token Price):**
- `MORALIS_API_KEY` — Moralis API key for fetching token prices

**Token Limits:**
- `MAX_TOKEN_PER_PAYMENT` — Maximum tokens per payment (default: 1000)

**DNPay Payment Gateway:**
- `DNPAY_API_URL` — DNPay API endpoint
- `DNPAY_PARTNER_ID` — DNPay partner ID
- `DNPAY_API_KEY`, `DNPAY_API_SECRET`, `DNPAY_WEBHOOK_SECRET`

**Blockchain:**
- `ADMIN_PRIVATE_KEY` — Private key for on-chain operations

---

## Deployment Option 1: Docker

### Quick Start with Docker Compose (Recommended)

Docker Compose will set up both the API and Redis automatically:

```powershell
# 1. Create .env.production file
cp .env.example .env.production
# Edit .env.production with your actual values

# 2. Start all services (app + redis)
docker-compose up -d

# 3. Check logs
docker-compose logs -f app

# 4. Stop services
docker-compose down

# 5. Stop and remove volumes (clean slate)
docker-compose down -v
```

**What Docker Compose includes:**
- ✅ Redis container (port 6379) with persistent storage
- ✅ API container (port 3000)
- ✅ Automatic service dependency (API waits for Redis to be healthy)
- ✅ Health checks for both services
- ✅ Automatic restart on failure

### Manual Docker Build & Run

If you prefer to run Docker manually without Compose:

#### Option A: With External Redis

1. **Start Redis separately:**

```powershell
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

2. **Build and run the API:**

```powershell
# Build the image
docker build -t slice-payment-api:latest .

# Run with env file
docker run -d --name slice-payment-api `
  --env-file .env.production `
  --link redis:redis `
  -e REDIS_HOST=redis `
  -p 3000:3000 `
  slice-payment-api:latest
```

#### Option B: Standalone (without Redis)

For testing without Redis (will use Moralis API directly without caching):

```powershell
docker run -d --name slice-payment-api `
  --env-file .env.production `
  -e REDIS_HOST=localhost `
  -p 3000:3000 `
  slice-payment-api:latest
```

⚠️ **Note**: Without Redis, token prices will be fetched from Moralis on every request, which may hit rate limits.

### Build & Run

1. **Build the image:**

```powershell
docker build -t slice-payment-api:latest .
```

2. **Run the container** using an env file (recommended):

```powershell
docker run -d --name slice-payment-api `
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
  - **runner**: installs production dependencies and runs the built `dist/src/index.js`

**Note**: The build outputs to `dist/src/index.js` for local development and `dist/api/index.js` for Vercel serverless deployment.

### Docker Compose Architecture

```yaml
services:
  redis:
    - Port 6379
    - Persistent volume (redis-data)
    - Health check enabled
  
  app:
    - Port 3000
    - Depends on Redis
    - Auto-restart
    - Health check via HTTP
```

### Optional: Standalone Docker Compose

The project includes a `docker-compose.yml` file. You can customize it:

```yaml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - 6379:6379
    volumes:
      - redis-data:/data
    restart: unless-stopped

  app:
    image: slice-payment-api:latest
    build: .
    env_file:
      - ./.env.production
    environment:
      - REDIS_HOST=redis
    ports:
      - 3000:3000
    depends_on:
      - redis
    restart: unless-stopped

volumes:
  redis-data:

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
   - **For Redis**: Use [Upstash Redis](https://upstash.com) (free tier available)
     - Create Upstash Redis database
     - Add `REDIS_HOST` and `REDIS_PORT` from Upstash dashboard
     - Or use Vercel KV (built-in Redis alternative)
5. **Deploy** — Vercel will auto-deploy on every push to `main`

**Note on Redis for Vercel:**
- Vercel serverless functions are stateless, so you need external Redis
- Recommended: [Upstash Redis](https://upstash.com) (serverless, free tier)
- Alternative: Vercel KV (but requires code changes to use `@vercel/kv`)
- For hobby projects: Can work without Redis (will fetch prices from Moralis each time)

### Vercel Configuration

The `vercel.json` file is already configured:

```json
{
  "buildCommand": "pnpm run build",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/dist/api/index.js"
    }
  ]
}
```

**How it works:**
- Vercel runs `pnpm run build` which bundles everything into `dist/api/index.js` (single file ~650KB)
- All dependencies and path aliases are resolved at build time
- The bundled file is deployed as a serverless function

### API Routes on Vercel

After deployment, your API will be available at:

```
https://your-project.vercel.app/api/
https://your-project.vercel.app/api/orders
https://your-project.vercel.app/api/dnpay-payment
```

### Local Development

**Prerequisites:**
- Node.js 18+
- Redis (running locally or via Docker)

**Option 1: With local Redis**

```powershell
# Start Redis (if not already running)
# Windows: Download Redis from https://github.com/tporadowski/redis/releases
# Or use Docker:
docker run -d -p 6379:6379 redis:7-alpine

# Install dependencies
pnpm install

# Run dev server
pnpm run dev
```

**Option 2: Without Redis (for quick testing)**

```powershell
pnpm install
pnpm run dev
```

Open `http://localhost:3000`

**API Endpoints:**
- `GET /` — Health check
- `POST /api/orders` — Create order
- `POST /api/dnpay-payment/confirm` — Confirm payment

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
- **Redis on Vercel**: Use Upstash Redis (serverless Redis) or Vercel KV for production
  - Add to Vercel project: `REDIS_HOST` and `REDIS_PORT` pointing to Upstash

### Redis Issues
- **Connection failed**: Ensure Redis is running (`docker ps` or check local Redis service)
- **Cache not working**: Check Redis connection in logs
- **Port conflict**: Redis default port 6379 might be in use, change `REDIS_PORT`

### Common Errors
- `ADMIN_PRIVATE_KEY` missing → Add to env vars
- `DATABASE_URL` not set → Check Supabase connection string
- `MORALIS_API_KEY` invalid → Verify Moralis API key from dashboard
- DNPAY credentials invalid → Verify API keys
- Redis connection refused → Ensure Redis is running and `REDIS_HOST` is correct

---

## Next Steps & Suggestions

- ✅ Add health check endpoint (`/health`) for monitoring
- ✅ Set up CI/CD pipeline (GitHub Actions)
- ✅ Configure custom domain in Vercel
- ✅ Add rate limiting middleware
- ✅ Set up error tracking (Sentry, LogRocket)
- ✅ Add API documentation (Swagger/OpenAPI)
- ✅ Use managed Redis for production (Upstash, Redis Cloud, AWS ElastiCache)
- ✅ Monitor Redis memory usage and set eviction policies
- ✅ Add Redis connection pooling for better performance

---

## Features

### Token Price Caching

This API uses **Redis** to cache token prices fetched from **Moralis API**:

- **Cache TTL**: 5 minutes (300 seconds)
- **Fallback prices**: If Moralis API fails, uses hardcoded fallback prices
- **Supported tokens**: RYF, VNDC, USDT
- **Cache key format**: `price:{tokenAddress}`

**Benefits:**
- ⚡ Faster response times (cache hit ~1ms vs API call ~200ms)
- 💰 Reduced Moralis API costs
- 🛡️ Resilience against API rate limits
- 📊 Automatic price updates every 5 minutes

**Monitoring Redis:**

```powershell
# Connect to Redis CLI (Docker)
docker exec -it slice-payment-redis redis-cli

# Check cached prices
KEYS price:*
GET price:0x...

# Monitor commands in real-time
MONITOR

# Check Redis info
INFO
```

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
