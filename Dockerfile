# Multi-stage Dockerfile for Next.js (3-universal)
# Optimized for production deployment
# Platform: linux/amd64 | Port: 80 | User: non-root

# ===== STAGE 1: Dependencies =====
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files
COPY 3-universal/package*.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# ===== STAGE 2: Builder =====
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY 3-universal/package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy application source
COPY 3-universal/ ./

# Build Next.js application
RUN npm run build

# ===== STAGE 3: Runner =====
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=80
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set proper permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port 80
EXPOSE 80

# Start the application
CMD ["node", "server.js"]
