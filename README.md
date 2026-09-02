# TMS Core — Training Management System

> A full-stack Training Management System built with **ASP.NET Core 10** and **Angular 22**.
> Covers student self-registration, admin review & approval, course enrolment, grade management, and real-time updates via SignalR.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Running the App](#running-the-app)
- [Demo Credentials](#demo-credentials)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Routes](#routes)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

TMS Core is a full-stack learning management platform designed for academic institutions. It supports three user roles — **Student**, **Instructor**, and **Admin** — each with a tailored experience:

- **Students** self-register, track their application status, enrol in courses, and view grades.
- **Instructors** manage enrollments, submit grades, and monitor student progress.
- **Admins** review registration applications, approve or reject them (triggering automatic credential generation and a Gmail notification), manage users, and maintain the course catalogue.

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | .NET 10 |
| Framework | ASP.NET Core 10 Web API |
| ORM | Entity Framework Core 10 |
| Database | PostgreSQL (via Npgsql) |
| Auth | ASP.NET Identity + JWT Bearer + Refresh Tokens |
| Caching | .NET HybridCache |
| Real-time | SignalR |
| API Versioning | Asp.Versioning 8 |
| API Docs | Scalar (OpenAPI) |
| CQRS / Mediator | MediatR |
| Validation | FluentValidation |

### Frontend
| Layer | Technology |
|---|---|
| Framework | Angular 22 (standalone, zoneless) |
| Language | TypeScript 6 |
| UI Components | Angular Material 22 |
| State Management | Angular Signals |
| Real-time | @microsoft/signalr |
| Build | Angular CLI / Vite |
| Tests | Vitest + Playwright |

---

## Architecture

```
TmsCore/
├── TmsCore.Api/            # ASP.NET Core Web API — controllers, middleware, DI wiring
├── TmsCore.Application/    # Business logic — services, DTOs, MediatR commands/queries
├── TmsCore.Domain/         # Domain entities — pure C# classes, no framework dependencies
├── TmsCore.Infrastructure/ # EF Core, Identity, JWT, caching, SignalR hub, workers
├── TmsCore.Tests/          # Unit + integration tests
└── tms-client/             # Angular 22 SPA
    └── src/app/
        ├── features/       # Page-level components (login, signup, dashboards, forms)
        ├── ui/             # Reusable UI components (course-card, analytics-chart)
        ├── services/       # Auth, Registration, Email, Course, Enrollment, LiveSync
        ├── store/          # Signal-based state stores (enrollment, course)
        ├── models/         # TypeScript interfaces
        ├── guards/         # authGuard, roleGuard
        └── interceptors/   # auth, credentials, error interceptors
```

The backend follows a **Clean Architecture** layering: Domain → Application → Infrastructure → API. The frontend uses **signal-based reactive state** throughout (no NgRx), with lazy-loaded standalone components for each route.

---

## Features

### Student
- ✅ Self-registration wizard (4 steps: Personal → Contact → Academic → Documents)
- ✅ Photo upload (JPG/PNG/WEBP, max 3 MB) and academic document upload (PDF/JPG/PNG, max 5 MB)
- ✅ Conditional field: GPA for Bachelor/Master, Grade 12 National Exam Score for High School
- ✅ Application status page — enter Reference ID to see Pending / Approved / Rejected
- ✅ Approved status reveals auto-generated username and password with copy buttons
- ✅ Course catalogue with pagination and enrol button
- ✅ Pending enrolment requests tracker

### Admin / Instructor Dashboard
- ✅ KPI cards (total enrollments, pending, approved, new registrations)
- ✅ Enrollment management with search, status filters, approve/reject actions
- ✅ Analytics donut chart (Approved / Pending / Rejected breakdown)
- ✅ Subject (course) management — add, edit, delete with inline forms
- ✅ User account management — create, remove system accounts
- ✅ **Registrations panel** — full application review drawer with:
  - Applicant photo, personal, academic, and document sections
  - Admin note textarea
  - Approve / Reject / Delete actions
  - **Print** button — generates a formatted A4 print layout in a new window
  - **Auto-email** — clicking Approve or Reject automatically opens Gmail compose with a professionally written congratulations or regret email pre-filled

### Authentication & Security
- ✅ JWT access tokens + refresh token rotation (stored securely)
- ✅ ASP.NET Identity with lockout policy (5 attempts → 15-minute lockout)
- ✅ Password policy: min 12 chars, uppercase, digit, special character
- ✅ Rate limiting on login endpoint (5 requests/minute per IP)
- ✅ CORS, XSRF protection, security headers middleware
- ✅ Role-based route guards (`authGuard`, `roleGuard`)

### Real-time
- ✅ SignalR hub (`/hubs/tms`) — live grade updates and course announcements push to the student dashboard automatically

---

## Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| .NET SDK | 10.0+ |
| Node.js | 18+ (LTS recommended) |
| npm | 9+ |
| PostgreSQL | 14+ |
| Angular CLI | `npm install -g @angular/cli` |

---

### Backend Setup

**1. Clone the repository**

```bash
git clone https://github.com/<your-username>/TmsCore.git
cd TmsCore
```

**2. Configure the database connection**

Create a `appsettings.Development.json` file inside `TmsCore.Api/` (this file is git-ignored):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=tmscore;Username=postgres;Password=yourpassword"
  },
  "Jwt": {
    "Key": "your-super-secret-key-at-least-32-characters-long",
    "Issuer": "TmsCore",
    "Audience": "TmsCoreClient"
  }
}
```

**3. Apply database migrations**

```bash
cd TmsCore.Api
dotnet ef database update
```

The `DataSeeder` will automatically seed 25 demo courses on first startup in Development mode.

**4. Run the API**

```bash
dotnet run --project TmsCore.Api
```

The API starts at `https://localhost:5001`.
Interactive API docs (Scalar/OpenAPI) are available at `https://localhost:5001/scalar` in Development.

---

### Frontend Setup

**1. Install dependencies**

```bash
cd tms-client
npm install
```

**2. Start the dev server**

```bash
npm start
```

The Angular app starts at `http://localhost:4200` and proxies API requests to `https://localhost:5001`.

---

### Running the App

Start both services:

```bash
# Terminal 1 — API
cd TmsCore.Api && dotnet run

# Terminal 2 — Angular
cd tms-client && npm start
```

Then open `http://localhost:4200` in your browser.

---

## Demo Credentials

These accounts are seeded automatically on first run:

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Instructor | `instructor` | `instructor123` |
| Student | `student` | `student123` |

> **Note:** Demo accounts use localStorage for convenience. In production, all authentication goes through the ASP.NET Identity backend.

---

## Project Structure

### Backend — Key Files

```
TmsCore.Api/
├── Controllers/
│   ├── AuthController.cs          # Register, Login, Refresh, Me
│   ├── CoursesController.cs       # CRUD + HATEOAS links
│   ├── EnrollmentsController.cs   # Enrol students, list enrollments
│   └── V2/                        # Versioned endpoints (HybridCache, MediatR)
├── Program.cs                     # Full DI pipeline, middleware, rate limiting
└── Authorization/
    └── CourseOwnerHandler.cs      # Custom policy handler

TmsCore.Domain/Entities/
├── Course.cs
├── Student.cs
├── Enrollment.cs
├── Assessment.cs
├── Certificate.cs
└── RefreshToken.cs

TmsCore.Infrastructure/
├── Persistence/TmsDbContext.cs
├── Identity/TmsUser.cs
├── Services/TokenService.cs
└── Workers/EnrollmentWorker.cs
```

### Frontend — Key Files

```
tms-client/src/app/
├── features/
│   ├── login/                     # Login page with demo hint
│   ├── student-signup/            # 4-step self-registration wizard
│   ├── registration-status/       # Reference ID lookup → status + credentials
│   ├── instructor-dashboard/      # Admin panel (enrollments, subjects, users, registrations)
│   ├── student-dashboard/         # Student portal (courses, enrolment, status)
│   ├── enrollment-form/           # Course enrolment reactive form
│   ├── enrollment-list/           # Angular Material table with sort/paginate
│   └── grade-submission/          # Grade entry with SignalR integration
├── services/
│   ├── auth.service.ts            # Login, createAccount, localStorage persistence
│   ├── registration.service.ts    # Submit, approve, reject, status lookup
│   ├── email.service.ts           # Gmail compose URL builder (approval + rejection)
│   ├── course.service.ts          # HTTP GET courses
│   ├── enrollment.service.ts      # Enrollment HTTP operations
│   └── live-sync.service.ts       # SignalR connection + event handlers
└── ui/
    ├── analytics-chart/           # SVG donut pie chart (signal-based)
    └── course-card/               # Course tile with capacity bar
```

---

## API Reference

Base URL: `https://localhost:5001`

### Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user (Instructor role) | Public |
| `POST` | `/api/v1/auth/login` | Login → JWT + refresh token | Public |
| `POST` | `/api/v1/auth/refresh` | Rotate refresh token | Public |
| `GET` | `/api/v1/auth/me` | Get current user profile | Bearer |

### Courses

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/courses` | Paginated course list | Public |
| `GET` | `/api/courses/{id}` | Course detail + HATEOAS links | Public |
| `POST` | `/api/courses` | Create course | Bearer |
| `DELETE` | `/api/courses/{id}` | Delete course (owner only) | Bearer + CourseOwner |
| `GET` | `/api/v2/courses` | Cached paginated list | Public |
| `POST` | `/api/v2/courses` | Create course (cached) | Bearer |

### Enrollments

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `GET` | `/api/courses/{courseId}/enrollments` | List enrollments for a course | Bearer |
| `POST` | `/api/courses/{courseId}/enrollments` | Enrol a student | Bearer |
| `POST` | `/api/v2/enrollments` | Enrol via MediatR (rich error codes) | Bearer |
| `GET` | `/api/v2/enrollments/{studentId}/schedule` | Student schedule | Bearer |

---

## Routes

### Public (no login required)

| Path | Description |
|---|---|
| `/login` | Sign in |
| `/signup` | Student self-registration wizard |
| `/registration-status` | Application status lookup by Reference ID |
| `/unauthorized` | Access denied page |

### Authenticated (all roles)

| Path | Description |
|---|---|
| `/student-dashboard` | Student portal |
| `/enroll` | Course enrolment form |
| `/register` | Course enrolment form (alias) |
| `/courses/:id` | Course detail page |

### Instructor / Admin only

| Path | Description |
|---|---|
| `/dashboard` | Admin control centre (enrollments, subjects, users, registrations) |
| `/enrollments` | Angular Material enrollment table |
| `/grade-submission` | Grade entry form |

---

## Environment Variables

### Backend (`TmsCore.Api/appsettings.json`)

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "<PostgreSQL connection string>"
  },
  "Jwt": {
    "Key": "<min 32-char secret>",
    "Issuer": "TmsCore",
    "Audience": "TmsCoreClient"
  },
  "AllowedHosts": "*"
}
```

### Frontend (`tms-client/src/environments/environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: "/api/v1",
};
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

### Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | Use for |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `style:` | Formatting, no logic change |
| `refactor:` | Code restructure, no behaviour change |
| `test:` | Adding or fixing tests |
| `chore:` | Build system, dependencies |

---

## License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 TMS Core

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">
  Built with ❤️ using ASP.NET Core 10 &amp; Angular 22
</div>
