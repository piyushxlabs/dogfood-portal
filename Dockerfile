# ==============================================================================
# Dockerfile for Dogfood 2026 Hackathon Portal
# Architecture: Next.js 15 App Router Standalone on Port 8080
# Air-gap Compliance: 100% offline, zero runtime network calls, $0.00 cloud cost
# ==============================================================================

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Stage 2: Build the Next.js standalone application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Stage 3: Production runner image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Create non-root system user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static assets and standalone bundle
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy scripts and fixtures for offline database migration and seeding
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nextjs:nodejs /app/fixtures.json ./fixtures.json
COPY --from=builder --chown=nextjs:nodejs /app/docs ./docs

# Ensure postgres driver is accessible to scripts/migrate.mjs and scripts/seed.mjs
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/postgres ./node_modules/postgres

USER nextjs

EXPOSE 8080

CMD ["sh", "-c", "node scripts/migrate.mjs && node scripts/seed.mjs && node server.js"]
