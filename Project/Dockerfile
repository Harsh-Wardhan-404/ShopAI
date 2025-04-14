FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build the source code only when needed
FROM deps AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Set build flag to use mock Prisma client
ENV IS_BUILD=true

# Build with Next.js
RUN NEXT_PRIVATE_STANDALONE=true npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Clear build flag for runtime
ENV IS_BUILD=false

# Add runtime dependencies if needed
RUN apk add --no-cache ca-certificates

# Copy necessary files from builder
# COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy production environment variables for runtime
COPY .env.production .env

EXPOSE 3000

CMD ["node", "server.js"]