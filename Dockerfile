# --- Builder stage ---
FROM node:22-alpine AS builder
WORKDIR /app

# Enable pnpm via corepack and pin version
RUN corepack enable \
 && corepack prepare pnpm@10.18.2 --activate

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build TypeScript
COPY tsconfig.json ./
COPY src ./src
COPY @types ./@types
RUN pnpm run build

# --- Runtime stage ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable \
 && corepack prepare pnpm@10.18.2 --activate

# Install only production deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy built output
COPY --from=builder /app/dist ./dist

EXPOSE 8080
CMD ["pnpm", "start"]
