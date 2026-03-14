# Task Management Application

Production-ready task management app with JWT auth, CRUD APIs, pagination, filtering, and secure cookies.

**Live app:** [https://task-manager-8fre0s4i2-officialnishant21-gmailcoms-projects.vercel.app](https://task-manager-8fre0s4i2-officialnishant21-gmailcoms-projects.vercel.app)

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** JWT stored in HTTP-only cookies, bcrypt for passwords
- **Validation:** Zod

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Browser   │────▶│  Next.js (App)   │────▶│  PostgreSQL │
│   (React)   │◀────│  API Routes      │◀────│  (Prisma)   │
└─────────────┘     │  Middleware      │     └─────────────┘
                   │  Auth (JWT)      │
                   └──────────────────┘
```

- **Middleware** protects `/tasks` and redirects unauthenticated users to `/login`.
- **Auth:** Register/Login set an HTTP-only cookie with the JWT. All task APIs require a valid cookie.
- **Tasks** are scoped by `userId`; users only access their own tasks.
- **Pagination, filter by status, and search by title** are supported on `GET /api/tasks`.

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL (local or hosted, e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com))

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and set:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
JWT_SECRET="your-secret-at-least-32-characters-long"
ENCRYPTION_KEY="64-hex-characters-for-aes-256"
NODE_ENV=development
```

- **JWT_SECRET:** Min 32 characters; used to sign JWTs.
- **ENCRYPTION_KEY:** 64 hex characters (32 bytes) for optional AES encryption of sensitive fields.

### 3. Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Register, then use the Tasks page.

## API Documentation

See [API.md](./API.md) for request/response examples.

## Security

- Passwords hashed with bcrypt (rounds 12).
- JWT in HTTP-only cookie (Secure in production, SameSite=Lax).
- Prisma parameterized queries (no raw SQL) to avoid injection.
- Input validation with Zod on all auth and task endpoints.
- Sensitive payload encryption available via `lib/encryption.ts` (AES-256-GCM).

## Deployment

1. Set env vars on your platform (Vercel, Railway, Render, etc.).
2. Use a hosted PostgreSQL (Neon, Supabase, Railway DB).
3. Build: `npm run build`
4. Start: `npm start`

Ensure `NODE_ENV=production` so the cookie is sent with `Secure`.
