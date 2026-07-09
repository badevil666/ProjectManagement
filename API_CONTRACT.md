# Client Portal — API Contract

This is the single source of truth for REST endpoints shared between the
`backend` and `frontend` codebases. Both must conform to this contract.
Base path for all admin/authenticated + public JSON endpoints: `/api`.

Data model reference: `backend/prisma/schema.prisma`.

Conventions:
- All request/response bodies are JSON unless noted (file upload is
  `multipart/form-data`).
- Dates are ISO-8601 strings.
- IDs are UUID strings.
- Money (`budget`) is a string decimal (e.g. `"1200.00"`) to avoid float
  precision issues; `currency` is a 3-letter ISO code (default `"USD"`).
- Paginated list endpoints accept `?page=1&limit=20` and return
  `{ data: T[], meta: { page, limit, total, totalPages } }`.
- Errors are always `{ error: { message: string, code?: string, details?: any } }`
  with an appropriate HTTP status (400/401/403/404/409/422/500).
- Admin routes require `Authorization: Bearer <jwt>`. Public share routes
  require no auth — access is gated by an unguessable token in the URL path.

---

## Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | none | `{ email, password }` → `{ token, user }` |
| GET | `/api/auth/me` | admin | current user profile |

`user` shape: `{ id, name, email, role, createdAt }` (never includes passwordHash).

---

## Dashboard

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/dashboard/stats` | admin | counts: totalClients, totalProjects, activeProjects, completedProjects, totalOverdue |
| GET | `/api/dashboard/activity?limit=20` | admin | recent activity across all projects, newest first |

---

## Clients

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/clients?page=&limit=&search=` | admin | list clients (search matches companyName/contactPerson/email) |
| GET | `/api/clients/:id` | admin | client detail incl. `projects` summary array |
| POST | `/api/clients` | admin | create client |
| PUT | `/api/clients/:id` | admin | update client |
| DELETE | `/api/clients/:id` | admin | delete client (blocked with 409 if active projects exist unless `?force=true`) |

Create/update body: `{ companyName, contactPerson, email, phone?, address?, industry?, notes? }`

---

## Projects

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/projects?page=&limit=&status=&clientId=&search=` | admin | list projects with client summary + computed `overallProgress` |
| GET | `/api/projects/:id` | admin | full project detail: client, modules (with features), files, shareLinks (active only), comment count |
| POST | `/api/projects` | admin | create project. Body: `{ clientId, title, description?, status?, priority?, startDate?, expectedEndDate?, budget?, currency? }` |
| PUT | `/api/projects/:id` | admin | update project fields (same shape as create, all optional). Setting `status: "COMPLETED"` sets `actualEndDate` if not provided and triggers `PROJECT_COMPLETED` notification. |
| DELETE | `/api/projects/:id` | admin | delete project (cascades modules/features/files/comments/shareLinks/activities) |
| GET | `/api/projects/:id/timeline` | admin | chronological `Activity[]` for the project (newest first) |

Project response includes computed `overallProgress` (0-100, integer) derived
from feature completion (see "Progress calculation" below) — persisted on
write-paths that change completion state, recomputed and returned on read.

---

## Modules

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/projects/:projectId/modules` | admin | create module. Body: `{ title, description?, estimatedHours? }`. `orderNumber` auto-assigned as `max+1`. |
| PUT | `/api/modules/:id` | admin | update module fields |
| DELETE | `/api/modules/:id` | admin | delete module (cascades features/files) |
| PATCH | `/api/modules/:id/status` | admin | `{ status }`. Setting `COMPLETED` sets `completedAt=now()`, cascades: if all features aren't complete, also marks them complete; recomputes project progress; logs activity; emails client. |
| PATCH | `/api/projects/:projectId/modules/reorder` | admin | `{ order: string[] }` (module ids in new order) → reassigns `orderNumber` 0..n-1 |

---

## Features

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/modules/:moduleId/features` | admin | create feature. Body: `{ title, description?, priority?, estimatedHours? }` |
| PUT | `/api/features/:id` | admin | update feature fields |
| DELETE | `/api/features/:id` | admin | delete feature |
| PATCH | `/api/features/:id/status` | admin | `{ status }`. Setting `COMPLETED` sets `completedAt=now()`, recomputes parent module status/completion + project progress, logs activity, emails client. If it makes the module 100% complete, module is auto-marked `COMPLETED` too. |
| PATCH | `/api/modules/:moduleId/features/reorder` | admin | `{ order: string[] }` (feature ids in new order) |

### Progress calculation

- Module completion % = `completedFeatures / totalFeatures` (0 if no features).
- Module auto-transitions to `COMPLETED` when 100% of its features are
  completed; auto-transitions out of `COMPLETED` back to `IN_PROGRESS` if a
  feature is reopened.
- Project `overallProgress` = average of module completion % across all
  modules in the project (0 if no modules), rounded to nearest integer.

---

## Files

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/projects/:projectId/files` | admin | `multipart/form-data`, field `file`, optional field `moduleId`. Stores via storage service abstraction. Logs `FILE_UPLOADED` activity. |
| GET | `/api/projects/:projectId/files` | admin | list files for project (optionally `?moduleId=`) |
| GET | `/api/files/:id/download` | admin | streams/redirects to file content |
| DELETE | `/api/files/:id` | admin | deletes file record + underlying storage object |

Share-link equivalents (see below) mirror GET/download but are read-only and
scoped to the token's project.

---

## Share Links

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/projects/:projectId/share-links` | admin | body `{ expiresAt? }`. Generates a cryptographically random token (32+ bytes, base64url), returns `{ shareLink, url }` where `url` is the full client-facing path `/share/:token`. |
| GET | `/api/projects/:projectId/share-links` | admin | list all share links for the project (active + revoked) with access stats |
| PATCH | `/api/share-links/:id/revoke` | admin | sets `revoked = true` |

---

## Comments

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/projects/:projectId/comments` | admin | list comments for project, chronological |
| POST | `/api/projects/:projectId/comments` | admin | `{ message }` → creates comment with `authorType: ADMIN`, logs activity, does NOT email (admin's own comment) |

---

## Public Share Routes (token-gated, no JWT)

All routes below are prefixed `/api/share/:token`. Middleware
`resolveShareLink` looks up the token, 404s if not found, 410 (Gone) if
revoked or expired, else increments `accessCount`/`lastAccessedAt` and
attaches `req.project` (the linked project id) for downstream handlers.

| Method | Path | Description |
|---|---|---|
| GET | `/api/share/:token` | full read-only project detail (client, modules+features, files, comments, timeline) — same shape as admin project detail minus internal fields (`createdBy`, budget optionally included since client should see budget per spec — **include budget**) |
| GET | `/api/share/:token/timeline` | activity timeline for the project |
| GET | `/api/share/:token/files/:fileId/download` | download a file that belongs to this project |
| POST | `/api/share/:token/comments` | `{ authorName, message }` → creates comment with `authorType: CLIENT`, logs activity, emails the admin is NOT required (spec only requires client-facing notifications), but this DOES trigger the `COMMENT_ADDED` client notification path is skipped (client is the one posting) — instead notify admin via console/log only in MVP (no admin email in scope). |

Client-facing frontend route: `/share/:token` (React Router), fully separate
layout from the admin app (no sidebar, no auth), read-only + comment form.

---

## Notifications (internal, not directly exposed as CRUD)

Triggered server-side (see `NotificationService`) on:
- Module → `COMPLETED` (`MODULE_COMPLETED`)
- Feature → `COMPLETED` (`FEATURE_COMPLETED`)
- Project → `COMPLETED` (`PROJECT_COMPLETED`)
- Client posts a comment via share link → admin-side awareness only (no
  outbound client email, see above). Admin posts a comment → email to client
  (`COMMENT_ADDED`).

Each triggers: create a `Notification` row (`status: PENDING`), attempt send
via Nodemailer/Gmail SMTP, update `status` to `SENT` or `FAILED` +
`errorMessage`. Notification failures must never fail the parent request
(fire-and-forget with logging) — e.g. marking a feature complete must
succeed even if the email send throws.

No `GET /api/notifications` endpoint is required for the MVP UI, but the
admin project detail response may include a `notifications` count/list for
visibility (optional stretch — not required for frontend to consume).

---

## HTTP status conventions

- 200 OK — successful GET/PUT/PATCH
- 201 Created — successful POST creating a resource
- 204 No Content — successful DELETE
- 400 — validation error (body: `{ error: { message, details } }` with
  per-field zod issues in `details`)
- 401 — missing/invalid JWT
- 403 — valid JWT but insufficient role, or share link resolved but revoked/expired context misuse
- 404 — resource / token not found
- 409 — conflict (e.g. deleting a client with active projects)
- 410 — share link revoked or expired
- 500 — unhandled server error (never leaks stack trace in production)
