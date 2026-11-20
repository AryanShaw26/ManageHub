# Implementation Guide

## ManageHub --- V1 Build Order

**Purpose:** Give the AI coding agent a strict, dependency-aware order

**Product naming requirement:** The product is named **ManageHub**. Use this exact name in the UI, page titles, app metadata, README, and user-facing copy.
for building and validating the V1 application described in `PRD.md` and
styled in `design.md`.

------------------------------------------------------------------------

## 1. Build Rules

-   Read `PRD.md` and `design.md` completely before changing files.
-   Build the specified V1 only. Do not add attendance, fees, student
    portals, AI, or other future modules.
-   Use React + Vite + JavaScript, Tailwind CSS, Node.js, Express,
    PostgreSQL, and Prisma.
-   Use a modular monolith, not microservices.
-   Use real API/database integration. Do not leave core screens
    connected to mock data.
-   Do not weaken tenant isolation to make a feature work.
-   Keep the application runnable after each major phase.
-   Do not leave placeholder buttons, dead links, fake success messages,
    or TODO-only implementations in core flows.
-   Add clear loading, empty, validation, and error states.
-   Run relevant tests and builds after each phase; fix failures before
    proceeding.

------------------------------------------------------------------------

## 2. Phase 0 --- Repository and Project Setup

### Tasks

1.  Inspect the repository. If it already contains code, understand it
    before replacing anything.
2.  Create `client/` and `server/` folders if they do not exist.
3.  Initialize the React/Vite frontend.
4.  Initialize the Node/Express backend.
5.  Configure JavaScript ES modules consistently.
6.  Add `.gitignore`, root scripts where useful, and `.env.example`
    files.
7.  Install and configure Tailwind CSS, React Router, Lucide React,
    Prisma, and the chosen validation/authentication dependencies.
8.  Add a backend `/health` endpoint.
9.  Add basic linting/formatting if it can be configured without
    disrupting delivery.

### Exit criteria

-   Frontend starts locally.
-   Backend starts locally.
-   `/health` returns a successful JSON response.
-   No secrets are committed.

------------------------------------------------------------------------

## 3. Phase 1 --- Database Schema and Prisma

### Tasks

1.  Configure Prisma to connect to PostgreSQL.
2.  Implement the models from `PRD.md`:
    -   Institution
    -   User
    -   InstitutionMember
    -   Program
    -   AcademicClass
    -   ClassFaculty
    -   Student
    -   Semester
    -   Subject
    -   StudentMark
3.  Add enums for membership roles and any controlled status values.
4.  Add primary keys, foreign keys, unique constraints, indexes,
    timestamps, and archive fields.
5.  Ensure the schema expresses tenant ownership clearly.
6.  Add service-level checks for same-institution relationships that
    cannot be fully expressed in Prisma's schema.
7.  Create the initial migration.
8.  Add an optional development seed script using obviously synthetic
    demo records. Never seed production with fake real-looking student
    data by default.

### Exit criteria

-   `prisma validate` succeeds.
-   Migration applies to a clean database.
-   Prisma Client generates successfully.
-   Unique constraints behave as intended.

------------------------------------------------------------------------

## 4. Phase 2 --- Backend Foundation

### Tasks

1.  Create Express app and server entry points.
2.  Configure JSON parsing, Helmet, CORS, cookie parsing if using
    cookies, and rate limiting.
3.  Configure environment validation at startup.
4.  Add centralized error handling and a not-found handler.
5.  Define a consistent JSON response/error format.
6.  Create reusable authentication, role, and institution-context
    middleware.
7.  Ensure production errors do not expose stack traces or secrets.
8.  Add request validation schemas.

### Exit criteria

-   Backend starts only with valid required configuration.
-   CORS permits the local frontend origin in development.
-   Invalid requests return consistent errors.
-   Unknown routes return 404.

------------------------------------------------------------------------

## 5. Phase 3 --- Authentication and Multi-Tenant Security

Build this before any student/program CRUD.

### Tasks

1.  Implement `POST /api/v1/auth/register-institution`.
2.  Validate institution and first administrator details.
3.  Normalize email addresses.
4.  Hash the password using Argon2id or bcrypt.
5.  Generate a unique institution code safely.
6.  In one database transaction, create:
    -   Institution
    -   User
    -   InstitutionMember with role ADMIN
7.  Implement login.
8.  Implement secure browser authentication using HttpOnly cookies or a
    properly implemented session.
9.  Implement logout and `GET /auth/me`.
10. Add authentication middleware.
11. Add active institution membership resolution.
12. Add ADMIN/FACULTY role checks.
13. Add tenant-scoped query helpers or consistent service patterns.
14. Never accept a client-provided institution ID as proof of access.
15. Test cross-tenant ID guessing and unauthorized access.

### Security test scenarios

-   Anonymous request to a protected endpoint → 401.
-   Logged-in faculty attempts an ADMIN-only action → 403.
-   Institution A requests a student belonging to Institution B → 404 or
    403 without leaking data.
-   Institution A attempts to update Institution B's student using a
    guessed ID → rejected; no mutation.
-   Duplicate email or institution registration → controlled conflict
    response.
-   Logout invalidates/clears the authentication session.

### Exit criteria

Authentication works end-to-end, and tenant isolation is verified before
proceeding.

------------------------------------------------------------------------

## 6. Phase 4 --- Backend Core Modules

Implement modules in this order.

### 4A. Institution

-   Get current institution.
-   Update institution profile.
-   All operations scoped to the authenticated institution.

### 4B. Users and faculty

-   List institution members (ADMIN).
-   Create/invite faculty account (ADMIN).
-   Assign a faculty member to a class.
-   Prevent assigning users who are not faculty members of the same
    institution.
-   Do not expose password hashes or permanent credentials.

### 4C. Programs

-   Create, list, retrieve, update, and archive programs.
-   Automatically create semester records 1--8 when a program is
    created, using a transaction.
-   Prevent duplicate/invalid program data.

### 4D. Classes

-   Create, list, retrieve, update, and archive classes.
-   Validate that the selected program belongs to the current
    institution.
-   Support batch year and optional section.
-   List faculty assignments and students where appropriate.

### 4E. Students

-   Create, list, retrieve, update, and archive students.
-   Add search, class filtering, pagination, and maximum page-size
    enforcement.
-   Enforce institution-scoped enrollment uniqueness.
-   Enforce class-scoped roll-number uniqueness.
-   Validate the class belongs to the active institution.
-   Do not hard-delete academic records.

### 4F. Semesters, subjects, and marks

-   List semesters for a program.
-   Create/list/update subjects for a semester.
-   Validate the semester's program belongs to the active institution.
-   Upsert a student's marks for a subject.
-   Validate student and subject belong to the same institution/program
    context.
-   Validate `0 <= marksObtained <= subject.maxMarks`.
-   Return student marks grouped by semester.
-   Prevent duplicate student-subject marks.

### Exit criteria

Every endpoint has validation, authentication, authorization, tenant
scoping, and error handling. Test endpoints with at least two separate
institutions.

------------------------------------------------------------------------

## 7. Phase 5 --- Frontend Foundation and Public Pages

### Tasks

1.  Set up React Router.
2.  Configure Tailwind CSS using the yellow/white design system in
    `design.md`.
3.  Add typography, color tokens, spacing, radius, shadows, and reusable
    button/input/card components.
4.  Build responsive public navigation.
5.  Build the landing page:
    -   Hero section
    -   Primary CTA to register
    -   Secondary CTA to login
    -   Product feature bento grid
    -   How-it-works section
    -   Footer
6.  Build institution registration form.
7.  Build login form.
8.  Connect both forms to the backend.
9.  Display server validation and conflict errors accessibly.
10. Do not show a success state until the API confirms success.

### Exit criteria

Landing page is responsive and both authentication flows use the real
API.

------------------------------------------------------------------------

## 8. Phase 6 --- Protected Application Shell

### Tasks

1.  Build an authentication provider/context that loads the current user
    from `/auth/me`.
2.  Build protected routes.
3.  Build the dashboard shell:
    -   Sidebar navigation on desktop
    -   Collapsible/mobile navigation
    -   Top header
    -   Current institution identity
    -   User profile/logout menu
4.  Display navigation according to role.
5.  Handle expired sessions and API errors.
6.  Add reusable page headers, breadcrumbs, cards, tables, modals,
    forms, and confirmation dialogs.

### Exit criteria

Unauthenticated users cannot access protected screens. Authenticated
users see the correct institution and role.

------------------------------------------------------------------------

## 9. Phase 7 --- Dashboard and Management Screens

Implement in this order:

### 7A. Dashboard

-   Fetch actual counts from backend.
-   Show total students, classes, programs, and faculty.
-   Show useful recent records if supported.
-   Include meaningful empty states and quick actions.

### 7B. Programs

-   Program list.
-   Create/edit form.
-   Program details with semester overview.
-   Archive confirmation.

### 7C. Classes

-   Class list with program/batch/section.
-   Create/edit form.
-   Class detail page with student list.
-   Faculty assignment UI for ADMIN.
-   Archive confirmation.

### 7D. Students

-   Student list with search, class filter, and pagination.
-   Add student form.
-   Edit student form.
-   Student profile page.
-   Archive confirmation.
-   Clear validation for duplicate enrollment and roll numbers.

### 7E. Academic records

-   Display semesters 1--8 for the student's program.
-   Display subjects within each semester.
-   Add/edit subject UI.
-   Enter/update marks for each student-subject pair.
-   Show maximum marks and validation feedback.
-   Show semester-wise academic record.
-   Do not invent an SGPA/CGPA formula. Show only values explicitly
    stored or computed from a documented institution-approved rule.

### Exit criteria

All primary management flows work against the production-shaped API and
database.

------------------------------------------------------------------------

## 10. Phase 8 --- Faculty Permissions

### Tasks

1.  Ensure faculty sees only assigned classes.
2.  Restrict faculty student lists and student detail access to assigned
    classes.
3.  Restrict marks entry to assigned classes and permitted operations.
4.  Keep institution-wide settings and member management ADMIN-only.
5.  Verify these restrictions on the backend, not just in the UI.

If fine-grained faculty permissions are not ready, default to read-only
faculty access rather than granting broad access.

### Exit criteria

ADMIN and FACULTY accounts have demonstrably different access.

------------------------------------------------------------------------

## 11. Phase 9 --- Quality Assurance

### Functional test checklist

-   [ ] Register Institution A and its first admin.
-   [ ] Log in and log out.
-   [ ] Create a program and verify semesters 1--8.
-   [ ] Create multiple classes/batches.
-   [ ] Add a student to a class.
-   [ ] Reject duplicate enrollment number in the same institution.
-   [ ] Reject duplicate roll number in the same class.
-   [ ] Search and filter students.
-   [ ] Edit and archive a student.
-   [ ] Add subjects to a semester.
-   [ ] Enter marks for a student.
-   [ ] Reject marks below zero or above maximum marks.
-   [ ] Update an existing student-subject mark without creating a
    duplicate.
-   [ ] View academic records grouped by semester.
-   [ ] Create a faculty member and assign a class.
-   [ ] Verify faculty cannot access unassigned classes.
-   [ ] Register Institution B.
-   [ ] Verify Institution B cannot access Institution A's data and vice
    versa.

### UI test checklist

-   [ ] Desktop layout works.
-   [ ] Tablet layout works.
-   [ ] Mobile navigation works.
-   [ ] Forms have labels and inline errors.
-   [ ] Loading states are visible.
-   [ ] Empty states are useful.
-   [ ] API failures are handled gracefully.
-   [ ] Destructive actions require confirmation.
-   [ ] Keyboard focus is visible.

### Technical checks

-   [ ] Prisma migration works from a clean database.
-   [ ] Frontend production build succeeds.
-   [ ] Backend starts in production mode.
-   [ ] No secrets appear in Git or frontend build output.
-   [ ] No critical browser console errors.
-   [ ] No unhandled backend promise rejections.
-   [ ] Health endpoint works.

------------------------------------------------------------------------

## 12. Phase 10 --- Deployment

### Backend

1.  Create a managed PostgreSQL database.
2.  Configure production environment variables on the backend host.
3.  Set `NODE_ENV=production`.
4.  Set `DATABASE_URL`, session/auth secret, and exact `CLIENT_ORIGIN`.
5.  Configure secure cookie settings and CSRF protection if cookies are
    used.
6.  Run Prisma production migrations using the deployment/release
    command.
7.  Deploy the API.
8.  Verify `/health` and authentication endpoints.

### Frontend

1.  Configure `VITE_API_BASE_URL` to the deployed API base.
2.  Configure Vercel build settings.
3.  Deploy the frontend.
4.  Verify the exact frontend origin is allowed by backend CORS.
5.  Verify cookie/session behavior in the real deployed browser
    environment.

### Production smoke test

Use a test institution and synthetic student data: 1. Register. 2. Log
in. 3. Create a program. 4. Create a class. 5. Add a student. 6. Add a
subject and marks. 7. Log out. 8. Log back in and confirm persistence.
9. Test tenant isolation with a second institution.

Do not upload actual student records until the institution has approved
the system and backups/security settings are in place.

------------------------------------------------------------------------

## 13. Phase 11 --- Handover

The agent must update `README.md` with: - Product summary. - Technology
stack. - Repository structure. - Prerequisites. - Local setup
instructions. - Environment variable descriptions. - Database migration
and seed commands. - Development and production commands. - API base URL
and route overview. - Deployment steps. - Known limitations and deferred
V2 ideas.

At completion, report: 1. What was implemented. 2. What was tested and
the result. 3. How to run locally. 4. Required environment variables. 5.
Deployment status and URLs, if actually deployed. 6. Any incomplete
requirements or known issues.

Never claim deployment or tests succeeded unless they were actually
performed.
