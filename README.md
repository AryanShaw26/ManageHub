# ManageHub (V1)

**ManageHub** is a modern, multi-tenant institutional academic and student-record management system. It provides school and college administrators with a unified workspace to manage programs, classes, batches, student rosters, and semester-wise academic marks (Semesters 1 through 8) with strict tenant data isolation and role-based permissions.

---

## 1. Product Summary & Design Philosophy

- **Product Name:** ManageHub
- **Visual Direction:** Warm, modern, friendly, and professional.
- **Palette Signature:** Layered yellows (`brand-50` through `brand-600`), deep ink (`ink-900`, `ink-700`, `ink-500`), clean white surface cards, and a warm canvas (`#FAFAF5`).
- **Layout Language:** Bento grids, rounded cards (`rounded-card` 18px, `rounded-bento` 24px), generous whitespace, and mobile-adaptive cards.
- **Multi-Tenant Architecture:** Every institution registers its own isolated workspace with a unique institution code. Institutional data, academic records, and student rosters are strictly scoped and inaccessible across tenants.

---

## 2. Technology Stack

| Layer | Technology | Responsibility |
|---|---|---|
| **Frontend** | React 18 + Vite | Modern Single-Page Application (SPA) |
| **Styling** | Tailwind CSS | Custom design token system & responsive bento layouts |
| **Icons** | Lucide React | Clean, consistent interface icons |
| **Routing** | React Router v6 | Public routes, auth guards, and role-protected layout shell |
| **Backend** | Node.js + Express.js (ESM) | REST API, validation, error handling, rate limiting |
| **Database** | PostgreSQL | Relational persistence with UUID primary keys & constraints |
| **ORM** | Prisma ORM | Schema definitions, migrations, and parameterized queries |
| **Authentication** | JWT & Secure HttpOnly Cookies | Stateless session tokens with role and tenant claims |
| **Password Security**| bcryptjs | Salted password hashing (10 rounds) |
| **Validation** | Zod | Request payload, query, and parameter schema validation |

---

## 3. Repository Structure

```text
ManageHub/
├── client/                     # Frontend React + Vite application
│   ├── public/
│   │   └── favicon.svg         # ManageHub signature academic brand icon
│   ├── src/
│   │   ├── components/ui/      # Reusable design system primitives
│   │   │   ├── Badge.jsx       # Semantic status badges
│   │   │   ├── Button.jsx      # Primary, secondary, outline, danger buttons
│   │   │   ├── Card.jsx        # Standard & Metric Bento cards
│   │   │   ├── EmptyState.jsx  # Empty states & loading pulse skeletons
│   │   │   ├── Input.jsx       # Form inputs with labels & password toggle
│   │   │   ├── Modal.jsx       # Accessible modal & confirm dialogs
│   │   │   └── Select.jsx      # Form select dropdowns
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global auth session & tenant state provider
│   │   ├── layouts/
│   │   │   ├── AppLayout.jsx   # Authenticated dashboard shell & sidebar
│   │   │   └── PublicLayout.jsx# Public header, navigation, and footer
│   │   ├── pages/
│   │   │   ├── ClassDetailPage.jsx # Class summary, enrolled students & faculty assignment
│   │   │   ├── ClassesPage.jsx     # Classes & batches management
│   │   │   ├── DashboardPage.jsx   # Bento dashboard overview & live metrics
│   │   │   ├── LandingPage.jsx     # Hero, bento preview, features, how-it-works
│   │   │   ├── LoginPage.jsx       # Institutional sign-in flow
│   │   │   ├── ProgramsPage.jsx    # Programs & 8-semester subject catalog
│   │   │   ├── RegisterPage.jsx    # Institution & initial admin registration
│   │   │   ├── SettingsPage.jsx    # Institution profile & faculty management
│   │   │   ├── StudentDetailPage.jsx # Profile header, 8-semester selector & marks entry
│   │   │   └── StudentsPage.jsx    # Paginated student directory with search & filters
│   │   ├── services/
│   │   │   └── api.js          # Unified HTTP client with credentials & error mapping
│   │   ├── App.jsx             # React Router routing tree with route guards
│   │   ├── index.css           # Tailwind base styles & bento utilities
│   │   └── main.jsx            # Application entry point
│   ├── index.html              # HTML shell
│   ├── package.json
│   ├── tailwind.config.js      # ManageHub warm yellow/ink design tokens
│   └── vite.config.js          # Vite config with /api proxy
├── server/                     # Backend Node.js + Express API
│   ├── prisma/
│   │   ├── migrations/         # PostgreSQL schema migrations
│   │   └── schema.prisma       # Prisma data model & relations
│   ├── src/
│   │   ├── config/             # Environment configuration
│   │   ├── middleware/         # Auth, role authorization, validation, error handler
│   │   ├── modules/
│   │   │   ├── academics/      # Semesters, subjects, and marks recording (upsert)
│   │   │   ├── auth/           # Registration, login, logout, /auth/me
│   │   │   ├── classes/        # Academic class & batch management
│   │   │   ├── institutions/   # Profile & metrics
│   │   │   ├── programs/       # Programs with automatic 8-semester creation
│   │   │   ├── students/       # Student CRUD, pagination, roll & enrollment constraints
│   │   │   └── users/          # Member roles and faculty invitation
│   │   ├── utils/              # Response formatting, JWT, bcrypt, code generation
│   │   ├── app.js              # Express app with security headers & static serving
│   │   ├── db.js               # Prisma client singleton
│   │   ├── seed.js             # Synthetic development demo data seeder
│   │   └── server.js           # Server startup & graceful shutdown
│   ├── test/
│   │   └── api.test.js         # Automated end-to-end API test suite
│   ├── package.json
│   └── .env.example
├── .gitignore
├── package.json                # Root workspace configuration
└── README.md
```

---

## 4. Prerequisites

- **Node.js**: v18.0.0 or higher (v24.x tested)
- **npm**: v9.0.0 or higher (v11.x tested)
- **PostgreSQL**: PostgreSQL 14+ (PostgreSQL 18.x tested)

---

## 5. Local Setup Instructions

### 1. Clone & Install Dependencies
From the repository root:
```bash
# Install server dependencies
npm --prefix server install

# Install client dependencies
npm --prefix client install
```

### 2. Configure Environment Variables
Copy `.env.example` in both server and client:

**`server/.env`**:
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://postgres:password@localhost:5432/managehub_db"
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
CLIENT_ORIGIN=http://localhost:5173
COOKIE_NAME=managehub_token
```

**`client/.env`**:
```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### 3. Database Migration & Optional Development Seed
```bash
# Generate Prisma Client
npm --prefix server run prisma:generate

# Apply pending migrations
npm --prefix server run prisma:migrate

# Optional: seed synthetic development data
npm --prefix server run prisma:seed
```
The optional seed script is blocked in `NODE_ENV=production` and does not print or hard-code login passwords.

---

## 6. Running the Application

### Development Mode (Separate servers)
In terminal 1 (Start API server):
```bash
npm --prefix server run dev
```

In terminal 2 (Start Vite dev server):
```bash
npm --prefix client run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build & Single-Port Server
The server is configured to automatically serve the compiled frontend from `client/dist`:
```bash
# Build frontend bundle
npm --prefix client run build

# Start production API server
npm --prefix server start
```
Open [http://localhost:5000](http://localhost:5000) to access the fully integrated application.

---

## 7. Running the Automated Test Suite

The test suite validates:
- System health and branding verification (`/health`)
- Authentication, JWT generation, and cookie management
- Anonymous request rejection (401)
- Role authorization (Faculty rejected from Admin actions with 403)
- Multi-tenant security (Institution B cannot access or modify Institution A records)
- Duplicate enrollment number rejection (409)
- Marks range validation (`0 <= marks <= maxMarks`)

Run the test suite:
```bash
npm --prefix server test
```

---

## 8. API Route Overview (`/api/v1`)

### Authentication
- `POST /api/v1/auth/register-institution`: Register new institution & first administrator atomically.
- `POST /api/v1/auth/login`: Authenticate and receive session token.
- `POST /api/v1/auth/logout`: Clear session cookies.
- `GET /api/v1/auth/me`: Fetch authenticated user, institution details, and active role.

### Institution & Users
- `GET /api/v1/institution`: Current institution profile and dashboard metrics.
- `PATCH /api/v1/institution`: Update institution profile (ADMIN).
- `GET /api/v1/users`: List institution members (ADMIN).
- `POST /api/v1/users/faculty`: Invite / create faculty account (ADMIN).
- `PATCH /api/v1/users/:userId/role`: Change member role (ADMIN).
- `POST /api/v1/classes/:classId/faculty`: Assign faculty to class (ADMIN).
- `DELETE /api/v1/classes/:classId/faculty/:userId`: Unassign faculty from class (ADMIN).

### Programs & Classes
- `GET /api/v1/programs`: List programs with semester & class counts.
- `POST /api/v1/programs`: Create program (automatically creates Semesters 1–8 in one transaction).
- `GET /api/v1/programs/:programId`: Program details with subjects catalog.
- `PATCH /api/v1/programs/:programId`: Update program (ADMIN).
- `DELETE /api/v1/programs/:programId`: Soft-archive program (ADMIN).
- `GET /api/v1/classes`: List classes (scoped to assigned classes for FACULTY).
- `POST /api/v1/classes`: Create class (ADMIN).
- `GET /api/v1/classes/:classId`: Class details, faculty assignments, and enrolled students.
- `PATCH /api/v1/classes/:classId`: Update class (ADMIN).
- `DELETE /api/v1/classes/:classId`: Soft-archive class (ADMIN).

### Students
- `GET /api/v1/students`: Paginated student directory with search and class filters.
- `POST /api/v1/students`: Register student (enforces unique enrollment & roll numbers).
- `GET /api/v1/students/:studentId`: Student profile details.
- `PATCH /api/v1/students/:studentId`: Update student record.
- `DELETE /api/v1/students/:studentId`: Soft-archive student (ADMIN).

### Academic Records & Marks
- `GET /api/v1/programs/:programId/semesters`: List semesters for program.
- `POST /api/v1/semesters/:semesterId/subjects`: Create subject under a semester (ADMIN).
- `GET /api/v1/semesters/:semesterId/subjects`: List subjects for a semester.
- `PATCH /api/v1/subjects/:subjectId`: Update subject metadata (ADMIN).
- `POST /api/v1/students/:studentId/marks`: Record or update student subject marks (upsert).
- `GET /api/v1/students/:studentId/marks`: Fetch student marks grouped across Semesters 1 to 8.

---

## 9. Production Deployment Guide

### Deploying Backend (Render / Railway / DigitalOcean)
1. Provision a managed PostgreSQL database.
2. In your backend environment settings, configure:
   - `NODE_ENV=production`
   - `DATABASE_URL=postgresql://...`
   - `JWT_SECRET=strong-random-hex-string`
   - `CLIENT_ORIGIN=https://your-frontend-domain.com`
   - `COOKIE_NAME=managehub_token`
3. Set the build command: `npm --prefix server install && npm --prefix server run prisma:generate`
4. Set the release/deploy command: `npm --prefix server run prisma:deploy`
5. Set start command: `npm --prefix server start`

### Deploying Frontend (Vercel)
1. Set the Root Directory to `client`.
2. Framework preset: **Vite**.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Environment variable:
   - `VITE_API_BASE_URL=https://your-api-domain.com/api/v1`

### Database Backup and Recovery
- Configure managed PostgreSQL automated snapshots or run `npm --prefix server run db:backup`.
- Store backups outside the application host, with encryption and restricted access.
- Test restoration regularly in a separate database and record the tested recovery time.
- Keep point-in-time recovery enabled when the managed database provider supports it.
- `pg_restore --clean --if-exists --dbname <TARGET_DB_URL> --verbose <BACKUP_FILE>` performs a restore; validate application behavior before promoting the database.

---

## 10. Deferred V2 Modules (Out of Scope for V1)

Per the Product Requirements Document (PRD), the following capabilities are explicitly deferred to future releases:
- Student and parent login portals
- Attendance tracking
- Fee collection and invoicing
- Classroom timetable scheduling
- PDF report card generation
- SMS / WhatsApp / Email broadcast campaigns
- AI analytics or predictive grading
