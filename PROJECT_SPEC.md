# Client Portal — Project Spec

Production-quality MVP for a freelance software developer to manage projects
and let clients track progress via secure share links, no client login
required.

Companion documents (read these too, they are authoritative):
- `backend/prisma/schema.prisma` — data model
- `API_CONTRACT.md` — REST endpoints, request/response shapes, business rules

## Tech stack

**Frontend**: React + TypeScript + Vite + TailwindCSS + React Router +
TanStack Query + Axios.

**Backend**: Node.js + Express + TypeScript + PostgreSQL + Prisma ORM + JWT
auth + Multer for uploads.

**Deployment target**: Docker + Docker Compose locally; Vercel (frontend),
Render (backend), Neon Postgres (db) in production. Fully configurable via
environment variables — no hardcoded hosts/ports/secrets.

## Auth model

- Exactly one admin account, seeded (email/password from env / seed script).
  Login via `POST /api/auth/login` → JWT bearer token, used on all admin
  routes via `Authorization: Bearer <token>`.
- Clients have NO login accounts. They access a project via a share link:
  `/share/:token` on the frontend, backed by `GET /api/share/:token` etc. on
  the backend.
- Share link tokens must be cryptographically secure random values (use
  Node's `crypto.randomBytes`, base64url-encoded, 32+ bytes of entropy — not
  UUID, not sequential, not derived from project id).
- Admin can revoke a share link at any time (`revoked` flag) — revoked and
  expired links must return 410 Gone from the API and render an
  "expired/revoked" state on the frontend, never project data.

## Feature checklist (must all be implemented)

Admin dashboard:
- View all projects, all clients, recent activity (cross-project).
- Full CRUD on clients and projects; assign project to a client.
- Add/reorder modules; add/reorder features within a module.
- Mark feature/module completed (with cascading recompute — see
  API_CONTRACT.md "Progress calculation").
- Automatic module completion % and project overall progress calculation.
- Upload files scoped to a whole project or to a specific module.
- Generate and revoke share links.
- Post comments on a project.
- View a chronological project timeline (created, module/feature completed,
  files uploaded, comments) backed by the `Activity` table — every
  significant action writes an `Activity` row.

Client view (`/share/:token`, no auth):
- View project, progress, modules, features, files, timeline.
- Post comments (with a display name).
- Zero edit/delete capability anywhere in this view — enforce server-side,
  not just hidden in the UI.

Email notifications (Gmail SMTP via Nodemailer, HTML templates):
- Sent to the client's email when: a module completes, a feature completes,
  the project completes, or the admin posts a comment.
- Credentials from env vars (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`,
  `SMTP_PASS`, `SMTP_FROM`). Must be mockable/no-op-safe in dev if SMTP env
  vars are absent (log instead of throwing, never block the API response).

## Backend architecture requirements

Layered, in `backend/src/`:
- `controllers/` — thin, parse req → call service → shape response.
- `services/` — business logic (progress calculation, notification
  triggers, share token generation, activity logging).
- `repositories/` — all Prisma queries live here; services depend on
  repository interfaces, not on `PrismaClient` directly, so storage/db
  access is swappable and unit-testable.
- `middlewares/` — `requireAuth` (JWT verify), `requireAdmin`,
  `resolveShareLink` (token → project, 404/410 handling, access counting),
  `validate` (zod schema middleware), centralized error handler (last app.use).
  `upload` (multer config).
  - `routes/` — one router file per resource, mounted under `/api` in a
  single `routes/index.ts`.
- `utils/` — `asyncHandler` wrapper, `AppError` class hierarchy, logger.
- `config/` — env loading/validation (fail fast on missing required vars),
  constants.
- storage abstraction: `services/storage/StorageService` interface with a
  `LocalStorageService` implementation (saves under `/uploads`, returns a
  served URL) — designed so an `S3StorageService`/`R2StorageService` could
  implement the same interface later without touching callers.
- Validation with `zod` on every mutating endpoint; reject unknown fields.
- Consistent error handling: never leak stack traces in prod; `AppError`
  subclasses map to HTTP status codes via the central error middleware.
- Use dependency injection (constructor injection is fine — no need for a
  DI framework) so services/controllers are unit-testable in isolation.
- CORS configured from an env var allow-list (frontend origin(s)).
- Helmet + basic rate limiting on public `/api/share/*` routes (brute-force
  protection against token guessing) — e.g. `express-rate-limit`.

## Frontend architecture requirements

In `frontend/src/`:
- `components/` — reusable, presentational + a few compound components
  (ProgressBar, StatusBadge, Card, Sidebar, Timeline, CommentThread,
  FileList, Modal, DataTable, etc). No duplicated JSX for the same concept.
- `pages/` — route-level components (admin: Login, Dashboard, Clients,
  ClientDetail, Projects, ProjectDetail, admin layout; public: SharedProject).
- `layouts/` — `AdminLayout` (sidebar + topbar, dark-mode toggle),
  `PublicLayout` (minimal header, no nav).
- `hooks/` — TanStack Query hooks per resource (`useProjects`, `useProject`,
  `useCreateModule`, etc.), each wrapping an `services/api/*` function.
- `services/` — one Axios-based module per resource matching
  `API_CONTRACT.md` 1:1; a single configured Axios instance
  (`services/api/client.ts`) with a request interceptor attaching the JWT and
  a response interceptor normalizing `{ error }` shapes and handling 401 by
  redirecting to `/login`.
- `contexts/` — `AuthContext` (token/user, login/logout, persisted in
  localStorage), `ThemeContext` (light/dark, persisted, respects
  `prefers-color-scheme` initially).
- `types/` — TypeScript interfaces mirroring backend DTOs (mirror
  `API_CONTRACT.md` response shapes exactly — this is the contract).
- Route protection: an admin route guard component redirects to `/login`
  when unauthenticated; public `/share/:token` route has no guard.
- Modern SaaS look: minimal, professional, responsive, sidebar nav for
  admin, cards + progress bars + timeline UI, full dark mode (class-based
  Tailwind dark mode, toggle in topbar, persisted).

## Docker & deployment

- `backend/Dockerfile` — multi-stage (build TS → slim runtime image), runs
  `prisma migrate deploy` then starts the server; healthcheck endpoint
  `GET /api/health`.
- `frontend/Dockerfile` — multi-stage (vite build → nginx serving static
  assets), nginx config that supports SPA client-side routing (fallback to
  `index.html`) and proxies `/api` to the backend service in compose
  (configurable via build-time `VITE_API_URL` for non-compose/prod use where
  frontend and backend are on different hosts, e.g. Vercel → Render).
- Root `docker-compose.yml`: `postgres` (with a named volume + healthcheck),
  `backend` (depends_on postgres healthy, env vars, healthcheck, volume for
  `/uploads`), `frontend` (depends_on backend). One command:
  `docker compose up` starts everything, runs migrations, seeds if empty.
- `.env.example` at repo root and/or per-service, documenting every env var
  actually read by the code — no undocumented env vars.

## Code quality bar

TypeScript everywhere (`strict: true`), no `any` used to paper over real
types, no duplicated logic, async/await (no raw `.then` chains except where
idiomatic), SOLID (especially single-responsibility for
controllers/services/repositories and dependency inversion for storage),
reusable components on the frontend, ESLint + Prettier configured on both
sides.

## Fixed conventions (do not deviate — both sides depend on these)

- Backend listens on `PORT` env var, default **4000**, all routes under
  `/api`, health check at `GET /api/health` (no `/api` auth needed, returns
  `{ status: "ok" }`).
- Postgres on port **5432**, database name `client_portal`.
- Frontend Vite dev server on port **5173**. In dev, the frontend talks to
  the backend via `VITE_API_URL` (e.g. `http://localhost:4000/api`), read
  through `import.meta.env.VITE_API_URL` with that exact fallback default.
- In Docker Compose: service names are `postgres`, `backend`, `frontend`.
  Frontend's nginx container listens on port 80 (mapped to host `5173`) and
  proxies `location /api/ { proxy_pass http://backend:4000/api/; }` so the
  built frontend can call same-origin `/api` in the compose network without
  needing `VITE_API_URL` baked in (but still supports it as a build-time
  override for split hosting like Vercel+Render where the frontend calls a
  fully-qualified backend URL instead of a relative path).
- CORS allow-list on the backend via `CORS_ORIGIN` env var (comma-separated
  origins), must include `http://localhost:5173` by default in `.env.example`.
- JWT secret via `JWT_SECRET` env var, JWT expiry via `JWT_EXPIRES_IN`
  (default `7d`).
- Uploaded files persist at `/uploads` inside the backend container, backed
  by a named Docker volume; served back to clients via
  `GET /api/files/:id/download` and the share-link equivalent — never serve
  `/uploads` as a static directory directly (files must stay
  access-controlled through the API).

## Deliverables

- Seed script (`backend/prisma/seed.ts`): one admin user, 2-3 demo clients,
  2-3 demo projects with modules/features in varying completion states, a
  sample share link, sample comments/activity — enough to demo the whole UI
  immediately after `docker compose up`.
- Root `README.md`: overview, architecture diagram (ASCII is fine),
  installation guide (local + Docker), environment variable reference table,
  API documentation (can point to `API_CONTRACT.md`), deployment notes for
  Vercel/Render/Neon.
