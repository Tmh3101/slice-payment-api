FROM node:20-bullseye AS builder
WORKDIR /app

# Enable corepack and use pnpm for reproducible installs
RUN corepack enable \
  && corepack prepare pnpm@latest --activate

# Install dependencies based on lockfile
COPY package.json pnpm-lock.yaml tsconfig.json tsup.config.ts ./
RUN pnpm install --frozen-lockfile

# Copy source and build
COPY . .
RUN pnpm run build

FROM node:20-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=development

# Enable pnpm in the runner image
RUN corepack enable \
  && corepack prepare pnpm@latest --activate

# Install production dependencies only
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy built artifacts and any runtime assets
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/certs ./certs

EXPOSE 3000

CMD ["node", "dist/src/index.js"]
