# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1: deps+build — install all dependencies, generate the Prisma
# client, and compile TypeScript to dist/.
# ---------------------------------------------------------------------------
FROM node:20-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2: runtime — slim image with only production dependencies and the
# compiled output, running as a non-root user.
# ---------------------------------------------------------------------------
FROM node:20-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
# Schema must exist before `npm ci` so @prisma/client's postinstall hook
# (which runs `prisma generate`) doesn't warn/fail on a missing schema.
COPY prisma ./prisma

RUN npm ci --omit=dev \
  && npm cache clean --force

# Overwrite with the exact generated client + engine binaries produced in
# the build stage, and bring in the compiled server.
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/dist ./dist

# prisma/seed.ts is run via `tsx` (kept as a production dependency, not
# tsc-compiled to dist/) so it needs its TypeScript sources + tsconfig
# available at runtime too — it imports from ../src/*.
COPY --from=build /app/src ./src
COPY tsconfig.json ./

# Non-root runtime user with a dedicated uploads directory it can write to.
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs appuser \
  && mkdir -p /app/uploads \
  && chown -R appuser:nodejs /app

USER appuser

ARG PORT=4000
ENV PORT=${PORT}
EXPOSE ${PORT}

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
