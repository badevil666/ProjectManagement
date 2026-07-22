# Rona Employee LMS — Project Plan (Modules → Features)

Structured for a project-management board. Top level = **Stage (milestone)** so client-visible
progress maps directly to the 4-stage payment plan. Under each stage are **Modules**, and each
module lists its **Features** (tasks). Import-ready version: `project_plan.csv`.

---

## PHASE 1 — Internal Training App (35 working days)

### 🏁 Stage 1 · Foundation — *8 days*
**Module: Project Setup & Infrastructure**
- Git repo + branching + CI/CD pipeline
- Cloud infra provisioning (server + storage)
- Database schema (23 tables) + migrations
- Backend API scaffold (REST + auth middleware)
- Mobile app scaffold (Flutter — Android & iOS)
- Web admin scaffold

**Module: Authentication & Access Control**
- Registration & login (JWT)
- Password reset / forgot password
- Role-based access control (7 roles)
- Multi-role support per user
- Session management & token refresh

**Module: User & Department Management**
- Department CRUD
- User CRUD (internal & external)
- Role assignment to users
- Bulk employee import (Excel / CSV)
- Profile management & profile picture

> **Milestone test:** log in, add users/departments, assign roles, import employees.

### 🏁 Stage 2 · Courses & Learning — *10 days*
**Module: Course Authoring**
- Course CRUD (difficulty / duration / thumbnail)
- Mandatory / free / paid course flags
- Module CRUD + ordering
- Lesson CRUD + ordering
- Publish / unpublish course

**Module: Media & Content**
- Video upload + format validation
- Video transcoding / adaptive streaming (HLS)
- PDF upload & in-app viewer
- Multi-language subtitles (uploaded)
- AI-generated subtitles (from English track)

**Module: Catalogue & Discovery**
- Course catalogue browse
- Search & filters
- Free-courses section

**Module: Enrolment & Progress**
- Assign courses to staff / departments
- Self-enrol (free courses)
- Lesson player (speed / skip / fullscreen / subtitles / resume)
- Progress tracking (watch % + last position)

> **Milestone test:** build a course, upload lessons, learner watches & progress records.

### 🏁 Stage 3 · Quiz, Certificates & Dashboards — *9 days*
**Module: Quizzes & Assessment**
- Quiz builder (questions / options / marks)
- Question pool + randomisation
- Configurable attempts / time limit / passing %
- Auto-grading & quiz attempts record

**Module: Certificates**
- Certificate generation on completion
- Types (Certificate / Badge / Award)
- Validity period & expiry
- Certificate wallet & download

**Module: Dashboards**
- Employee dashboard (my courses / progress / certificates)
- Department / Manager dashboard
- Admin dashboard

**Module: Notifications**
- In-app notifications
- Email notifications
- Notification preferences & cadence

> **Milestone test:** take a quiz, pass, receive certificate, view dashboards.

### 🏁 Stage 4 · Reporting & Go-Live — *8 days*
**Module: Reporting & Export**
- Completion / score reports
- Excel export
- Department-wise analytics

**Module: Deadlines & Compliance**
- Due dates on enrolments
- Overdue reminders & escalation
- Mandatory course enforcement

**Module: Feedback & Requests**
- Course ratings & reviews
- Course requests (submit / approve)
- Help & Support tickets

**Module: Audit & Security**
- Audit log
- Security hardening pass

**Module: QA & Launch**
- Cross-device QA (Android & iOS)
- Bug-fix & polish
- App Store submission
- Play Store submission
- UAT sign-off

> **Milestone test:** export report, full end-to-end run, live on both stores.

---

## PHASE 2 — Commercial (30 working days, on Rona's confirmation)

**Module: Payments**
- Payment gateway integration (Razorpay / Stripe / PayU)
- Paid course purchase flow
- Transactions & refunds

**Module: External Users**
- External learner self-registration
- External trainer onboarding
- Trainer create & price own courses
- Admin approval of external-trainer courses

**Module: Sponsors & Ads**
- Sponsor portal
- Advertisement submission & scheduling
- Ad approval & display

**Module: Commercial Admin**
- Revenue / sales reporting
- Payout / settlement management
