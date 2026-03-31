# HustleHub — Multi-Tenant Task Board

A production-grade multi-tenant task management system built as a Turborepo monorepo. Two complete implementations — preferred (SvelteKit + Bun + Drizzle) and alternative (Next.js + Express + Prisma) — sharing the same PostgreSQL database.

## Live Demo

| Stack | URL |
|-------|-----|
| Preferred Web (SvelteKit) | https://hustlehub-6pm6.onrender.com |
| Preferred API (Bun) | https://hustlehub-preferred-api.onrender.com |

> Free tier — first request after idle may take ~30 seconds to wake up.

## What's Built

- Multi-tenant registration — each company gets its own isolated workspace
- JWT authentication with protected routes
- Kanban board with drag-and-drop between columns
- Optimistic UI — tasks move instantly, API syncs in background
- Task detail panel with inline editing
- Full CRUD for tasks with priority levels
- Tenant isolation enforced at the API middleware layer via AsyncLocalStorage

## Repository Structure

```
├── docs/
│   ├── HLD.md              — High-Level Design
│   └── LLD.md              — Low-Level Design
├── DECISIONS.md            — Architectural decisions and LLM disclosure
├── .env.example            — Environment variable documentation
├── preferred-stack/
│   ├── apps/
│   │   ├── api/            — Bun + Bun.serve backend (port 3001)
│   │   └── web/            — SvelteKit frontend (port 5173)
│   └── packages/
│       └── core/           — Shared types, Zod schemas, API contracts
└── alternative-stack/
    ├── apps/
    │   ├── api/            — Node.js + Express backend (port 4001)
    │   └── web/            — Next.js frontend (port 4000)
    └── packages/
        └── core/           — Shared types, Zod schemas, API contracts
```

## Running Locally

### Prerequisites

- [Bun](https://bun.sh) v1.0+ for the preferred stack
- Node.js v18+ for the alternative stack
- A PostgreSQL database (or use the same Render DB — see `.env.example`)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/Sumant3086/HustleHub.git
cd HustleHub

# 2. Copy env files
cp .env.example preferred-stack/apps/api/.env
cp .env.example alternative-stack/apps/api/.env

# 3. Fill in your DATABASE_URL and JWT_SECRET in both .env files
```

### Preferred Stack (SvelteKit + Bun)

```bash
# Terminal 1 — API on http://localhost:3001
cd preferred-stack/apps/api
bun install
bun run db:push
bun run dev

# Terminal 2 — Web on http://localhost:5173
cd preferred-stack/apps/web
bun install
bun run dev
```

### Alternative Stack (Next.js + Express)

```bash
# Terminal 1 — API on http://localhost:4001
cd alternative-stack/apps/api
npm install
npm run dev

# Terminal 2 — Web on http://localhost:4000
cd alternative-stack/apps/web
npm install
npm run dev
```

## Environment Variables

```env
# PostgreSQL connection string (both stacks share the same database)
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>?sslmode=require

# JWT signing secret — min 32 characters
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# API port — 3001 for preferred, 4001 for alternative
PORT=3001
```

## Architecture Highlights

### AsyncLocalStorage for Multi-Tenancy

The preferred stack uses Node's `AsyncLocalStorage` to propagate tenant context through the entire call stack. The middleware injects `tenantId` once — every repository method reads it automatically. It's impossible to accidentally query another tenant's data.

### packages/core as Single Source of Truth

Both the frontend and backend import types, Zod schemas, and API contract interfaces from `packages/core`. A mismatch between what the API returns and what the UI expects is a compile error, not a runtime bug.

### Optimistic UI with Intent Tracking

The task store applies drag-and-drop moves instantly. A `latestIntent` map tracks the most recent intended status per task — if a slow API response arrives after the user has already dragged again, it's silently ignored. Tasks never revert.

### Clean Architecture

Every feature follows Controller → Service → Repository. Controllers handle HTTP only. Services contain business logic. Repositories handle database queries with automatic tenant scoping.

## Documentation

- [High-Level Design](./docs/HLD.md) — system overview, technology choices, trade-offs
- [Low-Level Design](./docs/LLD.md) — schema, API contracts, module structure, state management
- [Decisions](./DECISIONS.md) — architectural decisions and LLM disclosure
