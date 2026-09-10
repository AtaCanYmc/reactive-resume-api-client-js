# ==========================================
# Stage 1: Build Client SDK & Prepare Demo
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies needed for build
COPY package*.json tsconfig.json tsup.config.ts ./
RUN npm ci

# Copy source and demo assets
COPY src/ ./src/
COPY demo/ ./demo/

# Build SDK and copy bundle into demo/web/vendor
RUN npm run build:demo

# ==========================================
# Stage 2: Minimal Production Runner
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000

# Copy root package.json for ESM module metadata
COPY --chown=node:node --from=builder /app/package.json ./package.json

# ponytail: copies full node_modules (includes dev deps); upgrade to 3-stage build if image size matters
COPY --chown=node:node --from=builder /app/node_modules ./node_modules

# Copy demo directory (contains demo/backend and demo/web with compiled vendor bundle)
COPY --chown=node:node --from=builder /app/demo ./demo

# Run as unprivileged node user
USER node

# Expose unified demo port
EXPOSE 3000 3001

# Health check using native Node.js fetch
HEALTHCHECK --interval=20s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:' + (process.env.PORT || 3000) + '/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start the unified demo server (serves both REST API and Web GUI)
CMD ["node", "demo/backend/server.js"]
