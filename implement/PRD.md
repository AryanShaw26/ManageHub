# Product Requirements Document (PRD)

## ManageHub --- Version 1

**Document status:** Build specification\
**Release:** V1 MVP\
**Product type:** Multi-tenant web application\
**Primary users:** School/college administrators and faculty\
**Build objective:** Deliver a secure, deployable student-record

**Product name:** ManageHub. Use this exact name in the application UI, repository-facing documentation, metadata, and deployment-facing copy. Do not use an alternative product name.
management website. Future modules are explicitly out of scope for V1.

------------------------------------------------------------------------

## 1. Product Overview

The ManageHub is a web application that allows
educational institutions to manage student information and semester-wise
academic marks from a central dashboard.

Each institution registers its own workspace. Its administrators can
manage faculty access, programs, classes/batches, students, subjects,
and marks. Faculty members can sign in and work with the student records
they are authorized to manage.

The application must support multiple institutions on one deployment
while keeping each institution's data isolated.

### 1.1 V1 goals

1.  Present the product through a polished public landing page.
2.  Allow an institution administrator to register an institution and
    create the initial administrator account.
3.  Allow registered users to sign in securely.
4.  Provide an authenticated dashboard.
5.  Allow administrators to create programs and academic
    classes/batches.
6.  Allow authorized staff to create, view, update, and archive student
    records.
7.  Support up to eight semesters per program, with subjects and
    individual subject marks.
8.  Persist data in PostgreSQL.
9.  Deploy the frontend and backend and configure a production database.

### 1.2 Success criteria

V1 is successful when: - A new institution can register and sign in. -
An institution administrator can create a program, a class/batch,
semesters and subjects. - Staff can add and manage students in the
correct class. - Staff can record and update marks for a student in a
subject. - A user from Institution A cannot read or modify Institution
B's data, even by changing request IDs. - Core flows work in the
deployed production environment. - The application is usable on desktop,
tablet, and mobile layouts.

------------------------------------------------------------------------

## 2. Users, Roles, and Permissions

### 2.1 Roles

**ADMIN** - View the institution dashboard. - Manage institution
profile/settings. - Invite or add faculty members. - Assign faculty
access to classes. - Create and manage programs, classes, semesters, and
subjects. - Create, edit, view, and archive student records. - Enter,
edit, and view marks. - View all records belonging to their institution.

**FACULTY** - Sign in to the institution workspace. - View only classes
assigned to them. - View students in those classes. - Create or update
student records if the institution grants that permission. - Enter or
update marks for assigned classes if permitted. - Cannot manage
institution settings, administrators, or other faculty accounts.

V1 may initially expose faculty creation to ADMIN only. Do not provide
unrestricted public faculty registration. Faculty accounts should be
created/invited by an institution administrator.

### 2.2 Registration flow

1.  Visitor selects **Get started / Register institution**.
2.  Visitor submits institution name, institution email, administrator
    name, administrator email, and password.
3.  Backend validates the fields and checks uniqueness.
4.  Backend creates the institution, user, and ADMIN membership in one
    database transaction.
5.  User is signed in or redirected to the login page with a success
    message.
6.  The administrator completes initial setup by creating a program and
    class.

An institution's registration email and the administrator's login email
may initially be the same, but store them as separate fields.

------------------------------------------------------------------------

## 3. V1 Scope

### 3.1 Public website

-   Landing page with product overview.
-   Feature sections explaining institution, class, student, and
    academic-record management.
-   Clear navigation and calls to action.
-   Login and institution registration routes.
-   Footer with basic product/contact links. Do not invent legal claims
    or certifications.

### 3.2 Authentication and account management

-   Institution administrator registration.
-   Login and logout.
-   Password hashing using Argon2id or bcrypt.
-   Authenticated `/me` endpoint.
-   Protected frontend routes.
-   Role and institution authorization on every protected backend
    request.
-   Password reset and email verification can be deferred, but the
    architecture should not prevent adding them later.

### 3.3 Dashboard

-   Overview cards: total students, total classes, total programs, and
    faculty count.
-   Recently added students or a useful recent-activity panel if
    activity data is implemented.
-   Quick actions for adding a student and creating a class.
-   Empty states for a newly registered institution.

### 3.4 Program and class management

-   Create, list, view, update, and archive programs.
-   Create, list, view, update, and archive classes/batches.
-   A class belongs to one program and one institution.
-   Example class: B.Tech CSE, batch 2023--2027, section A.
-   Support multiple batches and sections for the same program.

### 3.5 Student management

-   Student list with search, pagination, and class filter.
-   Add student.
-   View student profile and academic record.
-   Edit student details.
-   Archive student instead of permanently deleting academic history.
-   Validate enrollment number uniqueness within an institution.
-   Validate roll number uniqueness within a class.
-   Store only necessary student data. Avoid collecting sensitive
    information that is not needed for V1.

### 3.6 Academic records

-   Programs can define semesters 1 through 8.
-   Each semester contains subjects.
-   Each subject stores a subject code, name, maximum marks, and
    credits.
-   Each student's marks are stored per subject.
-   Prevent duplicate marks for the same student and subject.
-   Validate that marks are between zero and the subject's maximum
    marks.
-   Display semester-wise subjects, marks, and grades/status where
    supplied.
-   Do not calculate CGPA/SGPA unless a documented grading rule is
    configured. Do not assume one universal grading formula.

------------------------------------------------------------------------

## 4. Explicitly Out of Scope for V1

Do not build these in the first release: - Student or parent login
portal. - Attendance management. - Fees, payments, or invoices. -
Timetable or classroom scheduling. - Library management. - Examination
scheduling. - Bulk Excel import/export unless it is trivial and does not
delay core delivery. - PDF report-card generation. - Notifications, SMS,
WhatsApp, or email campaigns. - AI features or predictive analytics. -
Mobile native applications. - Complex subscription billing. -
Microservices, Kafka, Redis, or event-driven infrastructure.

Keep the code modular enough to add these later, but do not implement
them now.

------------------------------------------------------------------------

## 5. Recommended Technology Stack

  -----------------------------------------------------------------------
  Layer                   Technology              Responsibility
  ----------------------- ----------------------- -----------------------
  Frontend                React + Vite            Single-page web
                                                  application

  Language                JavaScript (ES modules) Use JavaScript;
                                                  TypeScript is not
                                                  required for V1

  Styling                 Tailwind CSS            Responsive design
                                                  system

  Icons                   Lucide React            Consistent interface
                                                  icons

  Routing                 React Router            Public and protected
                                                  routes

  Server state            TanStack Query or a     API data fetching,
                          consistent              caching, loading/error
                          fetch/service layer     states

  Backend                 Node.js + Express.js    REST API and business
                                                  logic

  Database                PostgreSQL              Persistent relational
                                                  data

  ORM                     Prisma                  Schema, migrations, and
                                                  database access

  Authentication          JWT in secure HttpOnly  Authentication
                          cookie, or a            
                          well-implemented        
                          session approach        

  Password hashing        Argon2id (preferred) or Password storage
                          bcrypt                  

  Validation              Zod (or one consistent  Request validation
                          backend validation      
                          library)                

  Deployment              Vercel (frontend) +     Production hosting
                          Render (API) + managed  
                          PostgreSQL              

  Version control         Git + GitHub            Source control
  -----------------------------------------------------------------------

Use compatible stable versions at implementation time. Keep frontend and
backend in one repository unless there is a strong reason not to.

### 5.1 Suggested repository structure

``` text
managehub/
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── features/
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── programs/
│       │   ├── classes/
│       │   ├── students/
│       │   └── academics/
│       ├── layouts/
│       ├── pages/
│       ├── services/
│       ├── hooks/
│       ├── routes/
│       └── main.jsx
├── server/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── modules/
│       │   ├── auth/
│       │   ├── institutions/
│       │   ├── users/
│       │   ├── programs/
│       │   ├── classes/
│       │   ├── students/
│       │   └── academics/
│       ├── utils/
│       ├── app.js
│       └── server.js
├── .gitignore
├── README.md
└── package.json
```

------------------------------------------------------------------------

## 6. System Architecture

Use a simple modular monolith for V1. Do not split the backend into
microservices.

``` text
Browser
  |
  | HTTPS
  v
React + Vite frontend
  |
  | REST API requests (JSON)
  v
Node.js + Express API
  |
  +--> Authentication middleware
  +--> Institution/role authorization
  +--> Request validation
  +--> Feature modules / business logic
  |
  v
Prisma ORM
  |
  v
PostgreSQL
```

### 6.1 Architectural rules

-   Frontend must never connect directly to PostgreSQL.
-   All database access must go through the backend.
-   Keep route handlers thin; put business logic in service functions.
-   Keep database access in feature modules/services using Prisma.
-   Validate request bodies, query parameters, and route parameters.
-   Use centralized error handling and consistent API responses.
-   Use database transactions for multi-table operations such as
    institution registration.
-   Store secrets only in environment variables.
-   Configure CORS to allow only the deployed frontend origin in
    production.
-   Use HTTPS in production.

------------------------------------------------------------------------

## 7. Proposed Database Schema

### 7.1 Data model overview

``` text
Institution
 ├── InstitutionMember ── User
 ├── Program
 │    ├── Semester
 │    │    └── Subject
 │    └── AcademicClass
 │          ├── ClassFaculty ── User
 │          └── Student
 │                └── StudentMark ── Subject
```

All institution-owned records must be associated with an
`institutionId`, directly or through a validated parent relationship.
The backend must verify that related records belong to the same
institution.

### 7.2 Tables and fields

#### institutions

  Field             Type           Rules
  ----------------- -------------- ------------------
  id                UUID           Primary key
  name              VARCHAR(180)   Required
  institutionCode   VARCHAR(40)    Required, unique
  email             VARCHAR(255)   Required
  phone             VARCHAR(30)    Optional
  address           TEXT           Optional
  createdAt         TIMESTAMP      Default now
  updatedAt         TIMESTAMP      Auto-update

#### users

  -----------------------------------------------------------------------
  Field                   Type                    Rules
  ----------------------- ----------------------- -----------------------
  id                      UUID                    Primary key

  name                    VARCHAR(150)            Required

  email                   VARCHAR(255)            Required, globally
                                                  unique, normalized to
                                                  lowercase

  passwordHash            TEXT                    Required

  isActive                BOOLEAN                 Default true

  createdAt               TIMESTAMP               Default now

  updatedAt               TIMESTAMP               Auto-update
  -----------------------------------------------------------------------

Do not store plaintext passwords or return `passwordHash` in API
responses.

#### institution_members

  Field           Type        Rules
  --------------- ----------- ----------------------
  id              UUID        Primary key
  institutionId   UUID        FK → institutions.id
  userId          UUID        FK → users.id
  role            ENUM        ADMIN or FACULTY
  createdAt       TIMESTAMP   Default now

Constraints: unique `(institutionId, userId)`. Index `institutionId` and
`userId`.

#### programs

  Field           Type           Rules
  --------------- -------------- ----------------------
  id              UUID           Primary key
  institutionId   UUID           FK → institutions.id
  name            VARCHAR(150)   Required
  department      VARCHAR(150)   Optional
  durationYears   INTEGER        1--10
  createdAt       TIMESTAMP      Default now
  updatedAt       TIMESTAMP      Auto-update
  archivedAt      TIMESTAMP      Nullable

#### academic_classes

  Field           Type           Rules
  --------------- -------------- --------------------------------------
  id              UUID           Primary key
  institutionId   UUID           FK → institutions.id
  programId       UUID           FK → programs.id
  name            VARCHAR(150)   Required, e.g. B.Tech CSE 2023--2027
  batchYear       INTEGER        Required
  section         VARCHAR(30)    Optional
  createdAt       TIMESTAMP      Default now
  updatedAt       TIMESTAMP      Auto-update
  archivedAt      TIMESTAMP      Nullable

A class must reference a program from the same institution. Add an
appropriate uniqueness rule to prevent accidental duplicate
class/batch/section records.

#### class_faculty

  Field       Type        Rules
  ----------- ----------- --------------------------
  id          UUID        Primary key
  classId     UUID        FK → academic_classes.id
  userId      UUID        FK → users.id
  createdAt   TIMESTAMP   Default now

Constraint: unique `(classId, userId)`. Assignment is valid only when
the faculty user is a member of the same institution as the class.

#### students

  Field              Type           Rules
  ------------------ -------------- --------------------------
  id                 UUID           Primary key
  institutionId      UUID           FK → institutions.id
  classId            UUID           FK → academic_classes.id
  studentName        VARCHAR(150)   Required
  enrollmentNumber   VARCHAR(80)    Required
  rollNumber         VARCHAR(40)    Required
  email              VARCHAR(255)   Optional
  phone              VARCHAR(30)    Optional
  dateOfBirth        DATE           Optional
  admissionYear      INTEGER        Required
  createdAt          TIMESTAMP      Default now
  updatedAt          TIMESTAMP      Auto-update
  archivedAt         TIMESTAMP      Nullable

Constraints: - Unique `(institutionId, enrollmentNumber)`. - Unique
`(classId, rollNumber)`. - `classId` must reference a class belonging to
the same `institutionId`. - Index `(institutionId, classId)` and
searchable identifiers.

#### semesters

  Field            Type          Rules
  ---------------- ------------- ------------------
  id               UUID          Primary key
  programId        UUID          FK → programs.id
  semesterNumber   INTEGER       Required, 1--8
  name             VARCHAR(50)   e.g. Semester 1
  createdAt        TIMESTAMP     Default now

Constraint: unique `(programId, semesterNumber)`. Create semesters 1--8
when a program is created, or provide a clear setup flow. Do not create
separate semester columns in the student table.

#### subjects

  Field         Type           Rules
  ------------- -------------- -----------------------------
  id            UUID           Primary key
  semesterId    UUID           FK → semesters.id
  subjectCode   VARCHAR(50)    Required
  subjectName   VARCHAR(180)   Required
  maxMarks      DECIMAL(7,2)   Required, greater than zero
  credits       DECIMAL(5,2)   Optional
  createdAt     TIMESTAMP      Default now
  updatedAt     TIMESTAMP      Auto-update

Constraint: unique `(semesterId, subjectCode)`.

#### student_marks

  Field             Type           Rules
  ----------------- -------------- -----------------------------------
  id                UUID           Primary key
  studentId         UUID           FK → students.id
  subjectId         UUID           FK → subjects.id
  marksObtained     DECIMAL(7,2)   Required, 0 to subject.maxMarks
  grade             VARCHAR(10)    Optional
  resultStatus      VARCHAR(20)    Optional; e.g. PASS, FAIL, ABSENT
  updatedByUserId   UUID           FK → users.id
  createdAt         TIMESTAMP      Default now
  updatedAt         TIMESTAMP      Auto-update

Constraint: unique `(studentId, subjectId)`. Validate that the student's
class program matches the subject's semester program. Validate marks
against `maxMarks`.

### 7.3 Relationship and tenant integrity

The following checks are mandatory: - An `institution_members` row must
connect an existing user and institution. - A program must belong to the
active institution. - A class must belong to the active institution and
a program in that institution. - A student must belong to the active
institution and a class in that institution. - A subject must belong to
a semester in a program belonging to the active institution. - A marks
record must connect a student and subject from the same
institution/program context. - A faculty class assignment must connect a
faculty member to a class in the same institution.

Where practical, use composite unique keys and composite foreign keys in
PostgreSQL/Prisma-compatible migrations to strengthen tenant integrity.
Enforce all rules in backend services even when database constraints
also exist.

### 7.4 Deletion policy

Prefer archive/soft-delete for institutions' academic entities and
students. Avoid cascading deletion of student academic history. Define
explicit deletion behavior for each relation. A subject with recorded
marks should not be hard-deleted through normal application flows.

------------------------------------------------------------------------

## 8. API Design

Use REST endpoints prefixed with `/api/v1`. Return JSON consistently.

### 8.1 Authentication

  ------------------------------------------------------------------------------
  Method                  Endpoint                       Purpose
  ----------------------- ------------------------------ -----------------------
  POST                    `/auth/register-institution`   Create institution and
                                                         first admin

  POST                    `/auth/login`                  Sign in

  POST                    `/auth/logout`                 Sign out / clear
                                                         session

  GET                     `/auth/me`                     Current user,
                                                         memberships, and active
                                                         role
  ------------------------------------------------------------------------------

### 8.2 Institution and users

  Method   Endpoint                      Purpose
  -------- ----------------------------- ----------------------------------
  GET      `/institution`                Current institution profile
  PATCH    `/institution`                Update institution profile
  GET      `/users`                      List institution members (ADMIN)
  POST     `/users/faculty`              Create/invite faculty (ADMIN)
  PATCH    `/users/:userId/role`         Update membership role (ADMIN)
  POST     `/classes/:classId/faculty`   Assign faculty to class (ADMIN)

For a V1 without email delivery, the faculty creation flow may create an
account and return a one-time setup instruction. Never expose a
permanent plaintext password in logs.

### 8.3 Programs and classes

  Method   Endpoint                 Purpose
  -------- ------------------------ -----------------
  GET      `/programs`              List programs
  POST     `/programs`              Create program
  GET      `/programs/:programId`   Program detail
  PATCH    `/programs/:programId`   Update program
  DELETE   `/programs/:programId`   Archive program
  GET      `/classes`               List classes
  POST     `/classes`               Create class
  GET      `/classes/:classId`      Class detail
  PATCH    `/classes/:classId`      Update class
  DELETE   `/classes/:classId`      Archive class

### 8.4 Students

  ------------------------------------------------------------------------
  Method                  Endpoint                 Purpose
  ----------------------- ------------------------ -----------------------
  GET                     `/students`              Paginated list; support
                                                   `search`, `classId`,
                                                   `page`, `limit`

  POST                    `/students`              Create student

  GET                     `/students/:studentId`   Student profile

  PATCH                   `/students/:studentId`   Update student

  DELETE                  `/students/:studentId`   Archive student
  ------------------------------------------------------------------------

### 8.5 Academic records

  -----------------------------------------------------------------------------------
  Method                  Endpoint                            Purpose
  ----------------------- ----------------------------------- -----------------------
  GET                     `/programs/:programId/semesters`    List program semesters

  POST                    `/semesters/:semesterId/subjects`   Create subject

  GET                     `/semesters/:semesterId/subjects`   List subjects

  PATCH                   `/subjects/:subjectId`              Update subject

  POST                    `/students/:studentId/marks`        Create/update marks
                                                              (upsert)

  GET                     `/students/:studentId/marks`        Get student marks
                                                              grouped by semester
  -----------------------------------------------------------------------------------

Use pagination for potentially large lists. Apply maximum page-size
limits.

### 8.6 API response convention

Success:

``` json
{
  "success": true,
  "data": {},
  "message": "Request completed successfully"
}
```

Error:

``` json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check the submitted information",
    "details": []
  }
}
```

Use appropriate HTTP status codes: 200, 201, 204, 400, 401, 403, 404,
409, and 500.

------------------------------------------------------------------------

## 9. Security and Privacy Requirements

Security is a release requirement, not a later enhancement.

1.  Hash passwords with Argon2id or bcrypt using secure parameters.
2.  Prefer secure, HttpOnly, SameSite cookies for browser
    authentication. If using cookies, implement CSRF protection
    appropriate to the deployment.
3.  Set `Secure` cookies in production and use HTTPS.
4.  Never store authentication tokens or passwords in localStorage if
    using cookie-based authentication.
5.  Apply authentication and authorization middleware to every protected
    route.
6.  Derive the active institution from the authenticated
    membership/session, not from a client-supplied `institutionId`.
7.  Scope every query and mutation to the active institution.
8.  Verify ownership of every supplied record ID before reading or
    changing it.
9.  Enforce ADMIN/FACULTY permissions on the backend.
10. Validate and normalize all inputs; use Prisma parameterized queries
    rather than raw string-built SQL.
11. Add rate limiting to authentication endpoints.
12. Use Helmet, restrictive CORS, and safe error responses.
13. Do not log passwords, tokens, marks exports, or unnecessary student
    personal data.
14. Keep `.env` out of Git. Provide `.env.example` with placeholder
    values only.
15. Back up the production database and document a restore procedure
    before real institutional data is entered.
16. Use synthetic data for development and screenshots.

Because student records are sensitive, collect the minimum data needed
and obtain appropriate institutional authorization before using real
student data.

------------------------------------------------------------------------

## 10. Frontend Pages and Navigation

### Public routes

-   `/` --- Landing page
-   `/login` --- Login
-   `/register` --- Institution registration

### Protected routes

-   `/app` --- Dashboard
-   `/app/programs` --- Program list and management
-   `/app/classes` --- Class list and management
-   `/app/classes/:classId` --- Class details and student list
-   `/app/students` --- Student list
-   `/app/students/new` --- Add student
-   `/app/students/:studentId` --- Student profile and academic records
-   `/app/settings` --- Institution profile and staff management

The UI must show navigation and actions based on the user's role, but
backend authorization remains authoritative.

------------------------------------------------------------------------

## 11. Non-Functional Requirements

-   Responsive layouts for mobile, tablet, and desktop.
-   Accessible form labels, keyboard navigation, visible focus states,
    and sufficient contrast.
-   Loading, empty, success, and error states for all data-driven pages.
-   Search and pagination for student lists.
-   Reasonable database indexes for tenant, class, enrollment, and
    search queries.
-   Centralized logging without sensitive data.
-   Health endpoint such as `GET /health`.
-   Production environment variables and database migrations.
-   No secrets or database credentials in frontend bundles.
-   Graceful handling of database/API downtime.

------------------------------------------------------------------------

## 12. Environment Variables

Provide `.env.example` files. Exact variable names may be refined during
implementation.

Backend:

``` env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
SESSION_SECRET=replace-with-long-random-secret
CLIENT_ORIGIN=http://localhost:5173
```

Frontend:

``` env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

Do not commit actual `.env` files. Configure production values in the
hosting provider's secret/environment settings.

------------------------------------------------------------------------

## 13. Deployment Requirements

Recommended V1 deployment: - Frontend: Vercel. - Backend: Render. -
Database: managed PostgreSQL (Render PostgreSQL or another managed
provider).

Deployment checklist: 1. Create production PostgreSQL database. 2.
Configure backend environment variables. 3. Run Prisma migrations
against production database. 4. Deploy backend and verify `/health`. 5.
Configure frontend API base URL. 6. Configure exact production CORS
origin and cookie settings. 7. Deploy frontend. 8. Test institution
registration, login, CRUD, marks, logout, and tenant isolation in
production. 9. Configure database backups and review provider retention
settings. 10. Use a custom domain if available.

If frontend and API are on different sites, carefully configure cookie
`SameSite`, `Secure`, CORS credentials, and CSRF behavior. Prefer
deployment/domain arrangements that make secure cookie authentication
straightforward.

------------------------------------------------------------------------

## 14. V1 Definition of Done

V1 is ready to deploy when all items below pass:

-   [ ] Landing page is complete and responsive.
-   [ ] Institution registration creates institution, user, and ADMIN
    membership atomically.
-   [ ] Login, logout, and `/auth/me` work.
-   [ ] Passwords are hashed.
-   [ ] Protected routes redirect unauthenticated users.
-   [ ] Backend rejects unauthorized role actions.
-   [ ] Institution A cannot access Institution B's records.
-   [ ] Admin can create and manage programs.
-   [ ] Admin can create and manage classes/batches.
-   [ ] Admin can add, edit, view, and archive students.
-   [ ] Enrollment number and class roll-number constraints work.
-   [ ] Eight semesters can be configured for a program.
-   [ ] Subjects can be created for semesters.
-   [ ] Marks can be recorded, updated, and viewed by semester.
-   [ ] Marks validation prevents values outside the permitted range.
-   [ ] Search, filters, and pagination work on student lists.
-   [ ] Empty, loading, validation, and API error states are present.
-   [ ] Production migrations and environment variables are configured.
-   [ ] Production smoke tests pass.

------------------------------------------------------------------------

## 15. Agent Instructions

Build only the V1 scope in this document. Do not silently add
out-of-scope modules.

Before coding: 1. Inspect the existing repository and preserve useful
existing work. 2. Confirm the planned folder structure and dependencies.
3. Implement the Prisma schema and migrations early. 4. Build backend
authentication and tenant authorization before business CRUD. 5. Build
frontend flows against the actual API rather than hard-coded mock data.
6. Run migrations, seed only clearly marked demo data if needed, and
test all critical flows. 7. Fix lint/build/runtime errors before
declaring completion. 8. Document setup, environment variables,
migration, seed, and deployment commands in README.

Do not claim a feature is complete unless it is implemented and tested.
Where a requirement is ambiguous, choose the simplest secure
implementation consistent with this PRD and document the decision.
