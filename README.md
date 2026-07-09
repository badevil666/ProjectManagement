# Client Portal

A production-quality MVP for a freelance software developer to manage
projects and let clients track progress via secure, token-based share
links — no client login required.

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + React Router +
  TanStack Query + Axios
- **Backend**: Node.js + Express + TypeScript + PostgreSQL + Prisma ORM +
  JWT auth + Multer
- **Deployment**: Docker Compose locally; Vercel (frontend) + Render
  (backend) + Neon (Postgres) in production

Full REST API reference: **[`API_CONTRACT.md`](./API_CONTRACT.md)**.
Data model / feature checklist: **[`PROJECT_SPEC.md`](./PROJECT_SPEC.md)**
and `backend/prisma/schema.prisma`.

---

## Architecture

```
                                   Admin (browser)
                                        │
                                        │ HTTPS, JWT bearer token
                                        ▼
                          ┌──────────────────────────┐
                          │        frontend           │
                          │  React SPA (Vite build)   │
                          │  served by nginx :80       │
                          │  (host :5173 in compose)   │
                          └─────────────┬──────────────┘
                                        │
                          same-origin  │  /api/*  (nginx proxy_pass in
                          in compose;  │  compose) — or a fully-qualified
                          VITE_API_URL │  VITE_API_URL for split hosting
                          for split    │  (e.g. Vercel → Render)
                          hosting      ▼
                          ┌──────────────────────────┐
                          │         backend            │
    Client (browser) ───▶│   Express + TypeScript      │
    GET /share/:token     │   PORT 4000, routes /api/*  │
    (no auth, token in    │                             │
     the URL is the only  │  controllers → services     │
     secret)              │            → repositories   │
                          │  middlewares: requireAuth,   │
                          │  requireAdmin,               │
                          │  resolveShareLink,           │
                          │  rate-limit on /api/share/*  │
                          └───────┬──────────────┬───────┘
                                  │              │
                     Prisma ORM   │              │  Nodemailer / Gmail SMTP
                                  ▼              ▼  (module/feature/project
                          ┌──────────────┐   completed, admin comment —
                          │  PostgreSQL   │   fire-and-forget, never blocks
                          │  "client_     │   the request; no-op-safe if
                          │   portal" db  │   SMTP_* env vars are absent)
                          │  (Neon in     │
                          │   prod)       │
                          └──────────────┘
                                  ▲
                                  │  named volume `backend_uploads`
                                  │  mounted at /app/uploads inside the
                                  │  backend container; files are only
                                  │  ever served back out through the API
                                  │  (GET /api/files/:id/download and the
                                  │  /api/share/:token equivalent) — never
                                  │  as a static directory.
                                  └──────────────
```

**Share-link flow**: an admin generates a share link for a project
(`POST /api/projects/:id/share-links`) → the backend mints a
`crypto.randomBytes(32)` base64url token, stores it on a `ShareLink` row,
and returns `/share/:token`. The admin sends that URL to the client. The
client opens it with **no login** — the frontend's `PublicLayout` route
`/share/:token` calls `GET /api/share/:token`, which passes through the
`resolveShareLink` middleware: 404 if the token doesn't exist, **410 Gone**
if `revoked` or past `expiresAt` (rendered as an "expired/revoked" state on
the frontend, never project data), otherwise it increments
`accessCount`/`lastAccessedAt` and serves the same project detail shape the
admin sees (modules, features, files, timeline, comments), read-only, plus
a comment form (`POST /api/share/:token/comments`) — enforced server-side,
not just hidden in the UI.

---

## Local development (without Docker)

Requires Node.js ≥ 20 and a running PostgreSQL 16 instance.

### 1. Backend

```bash
cd backend
cp .env.example .env         # edit DATABASE_URL etc. if not using the defaults
npm install
npx prisma migrate deploy    # applies backend/prisma/migrations
npm run prisma:seed          # admin user + demo clients/projects/share link
npm run dev                  # tsx watch — http://localhost:4000, health at /api/health
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env         # VITE_API_URL defaults to http://localhost:4000/api
npm install
npm run dev                  # Vite dev server — http://localhost:5173
```

Open `http://localhost:5173`, log in with the seeded admin credentials
(`ADMIN_EMAIL` / `ADMIN_PASSWORD` from `backend/.env`, defaults
`admin@example.com` / `ChangeMe123!`), and the demo share link printed by
the seed script (`Demo share link: /share/<token>`) works at
`http://localhost:5173/share/<token>`.

---

## Docker

```bash
docker compose up --build
```

This one command:
- starts **Postgres 16** (`postgres:16-alpine`) with a healthcheck
  (`pg_isready`) and a named volume for its data directory,
- builds and starts the **backend** once Postgres is healthy — its
  container `CMD` runs `prisma migrate deploy` automatically before
  starting the server, so the schema is always up to date,
- builds and starts the **frontend** (Vite build served by nginx),
  proxying `/api/*` to the backend inside the compose network.

**Seeding is a separate, manual step** (the backend image intentionally
does *not* auto-seed on every container start, since the same image/CMD is
also what gets deployed to Render in production — auto-seeding there would
insert demo data into a real database). Once the stack is up and the
backend is healthy, run:

```bash
docker compose exec backend npm run prisma:seed
```

This creates the single admin user, 2–3 demo clients/projects with
modules/features in varying completion states, a sample active share
link, and sample comments/activity. It's safe to re-run — it upserts by
unique fields (email, project title, etc.) instead of duplicating rows.

Then visit:
- Admin app: `http://localhost:5173`
- Backend health check: `http://localhost:4000/api/health`
- The demo share link printed by the seed command, at
  `http://localhost:5173/share/<token>`

To stop and remove containers (keeping the named volumes / data):
`docker compose down`. To also wipe the database and uploaded files:
`docker compose down -v`.

---

## Environment variables

### `backend/.env.example`

| Variable | Default | Read by | Notes |
|---|---|---|---|
| `NODE_ENV` | `development` | server | `development` \| `production` \| `test` |
| `PORT` | `4000` | server | Express listen port; all routes under `/api` |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/client_portal?schema=public` | server, Prisma | Postgres connection string; db name must be `client_portal` |
| `CORS_ORIGIN` | `http://localhost:5173` | server | Comma-separated CORS allow-list; must include the Vite dev origin |
| `JWT_SECRET` | `change-me-to-a-long-random-string` | server | JWT signing secret — use a long random value in production |
| `JWT_EXPIRES_IN` | `7d` | server | JWT expiry |
| `UPLOAD_DIR` | `./uploads` | server | Directory `LocalStorageService` writes to; mounted as a Docker volume at `/app/uploads` |
| `SMTP_HOST` | `smtp.gmail.com` | server (Nodemailer) | Optional — if any of the 5 SMTP vars are missing, emails are logged instead of sent (never blocks the API) |
| `SMTP_PORT` | `587` | server (Nodemailer) | Optional |
| `SMTP_USER` | — | server (Nodemailer) | Optional |
| `SMTP_PASS` | — | server (Nodemailer) | Optional — Gmail App Password, not your account password |
| `SMTP_FROM` | `Client Portal <no-reply@example.com>` | server (Nodemailer) | Optional |
| `ADMIN_EMAIL` | `admin@example.com` | `prisma/seed.ts` only | Not read by the running server |
| `ADMIN_PASSWORD` | `ChangeMe123!` | `prisma/seed.ts` only | Not read by the running server |
| `ADMIN_NAME` | `Admin User` | `prisma/seed.ts` only | Not read by the running server |

### `frontend/.env.example`

| Variable | Default | Read by | Notes |
|---|---|---|---|
| `VITE_API_URL` | `http://localhost:4000/api` | `services/api/client.ts` (build-time, `import.meta.env.VITE_API_URL`) | Local dev: point at the backend directly. Docker Compose: leave unset — nginx proxies same-origin `/api/*` to the `backend` service instead. Split hosting (Vercel + Render): set to the fully-qualified backend URL, e.g. `https://client-portal-api.onrender.com/api` |

### `.env.example` (repo root — Docker Compose only)

Only variables not already covered by the two files above. Not read by any
application code directly — only used by `docker compose` for variable
substitution in `docker-compose.yml`, and only if you create a root `.env`
(compose auto-loads it; everything has a working default without one).

| Variable | Default | Notes |
|---|---|---|
| `POSTGRES_USER` | `postgres` | Feeds both the `postgres` service and the backend's assembled `DATABASE_URL` |
| `POSTGRES_PASSWORD` | `postgres` | Same as above |

(`POSTGRES_DB` is hardcoded to `client_portal` in `docker-compose.yml` per
the project's fixed convention, not configurable.) The root `.env.example`
also documents optional overrides for `CORS_ORIGIN`, `JWT_SECRET`,
`JWT_EXPIRES_IN`, the seed-only `ADMIN_*` vars, and `SMTP_*` (to enable real
Gmail SMTP sending from the Compose stack), for the Compose flow
specifically — see the file for details.

---

## API documentation

All endpoints, request/response shapes, auth rules, status codes, and the
progress-calculation business rules are documented in
**[`API_CONTRACT.md`](./API_CONTRACT.md)**.

---

## Deployment

Production topology: **Vercel** (frontend) → **Render** (backend) →
**Neon** (Postgres). No hardcoded hosts/ports/secrets — everything is
environment-variable driven, same as local dev.

### Neon (Postgres)

1. Create a Neon project and database named `client_portal`.
2. Copy the pooled connection string Neon gives you and append
   `?sslmode=require` (Neon requires TLS):
   ```
   postgresql://<user>:<password>@<neon-host>/client_portal?sslmode=require
   ```
3. Use this as `DATABASE_URL` on Render (below).

### Render (backend)

1. Create a new Web Service from this repo, root directory `backend/`
   (or point it at the `backend/Dockerfile` if using Render's Docker
   runtime — recommended, since it reuses the exact multi-stage build
   verified locally).
2. Set environment variables: `DATABASE_URL` (the Neon string above),
   `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN` (your Vercel frontend
   URL, e.g. `https://client-portal.vercel.app`), `UPLOAD_DIR`
   (`/app/uploads` — note Render's disks are ephemeral unless you attach a
   persistent disk; attach one at `/app/uploads` for uploaded files to
   survive redeploys), and optionally `SMTP_*` for real email sending.
3. Release command / startup: the Dockerfile's `CMD` already runs
   `npx prisma migrate deploy` before starting the server, so no separate
   release-phase configuration is required — every deploy re-applies any
   new migrations automatically before serving traffic.
4. Seed the production database once, manually, the same way as Docker
   Compose: `ADMIN_EMAIL`/`ADMIN_PASSWORD`/`ADMIN_NAME` env vars set, then
   run `npm run prisma:seed` via Render's shell/one-off job — do this
   deliberately, not automatically, so demo data is never inserted
   unintentionally.

### Vercel (frontend)

1. Import this repo, set the project root to `frontend/`.
2. Build command: `npm run build` (Vercel auto-detects Vite). Output
   directory: `dist`.
3. Set the build-time environment variable `VITE_API_URL` to the Render
   backend URL with the `/api` suffix, e.g.
   `https://client-portal-api.onrender.com/api`.
4. Add a rewrite/fallback for client-side routing (`/share/:token`,
   `/projects/:id`, etc.) — Vercel's static hosting needs an SPA fallback
   to `index.html` equivalent to the `nginx.conf` `try_files` rule used in
   Docker (Vercel's default Vite/SPA framework preset handles this
   automatically; if deploying as a plain static export, add a
   `vercel.json` rewrite of `/(.*)`→`/index.html`).

---

## Known gaps / notes for review

- The backend Docker image does not auto-seed on container start (see
  "Docker" above for why and the manual command) — this is a deliberate
  design choice for this integration pass, not an oversight, but flagging
  it since `PROJECT_SPEC.md` phrases the target UX as "seeds if empty".
- No CI pipeline is configured in this MVP; `npm run lint` / `npx tsc
  --noEmit` / `npm run build` are available in both `backend/` and
  `frontend/` for manual/pre-commit verification.
