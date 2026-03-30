# Multi-Tenant Task Board

A production-grade multi-tenant task management system built as a Turborepo monorepo. Implements the same architecture in two stacks — preferred (SvelteKit + Bun + Drizzle) and alternative (Next.js + Express + Prisma) — sharing the same PostgreSQL database.

## Repository Structure

```
├── docs/
│   ├── HLD.md                  # High-Level Design
│   └── LLD.md                  # Low-Level Design
├── DECISIONS.md                # Architectural decisions & LLM disclosure
├── preferred-stack/
│   ├── apps/
│   │   ├── api/                # Bun + Bun.serve backend (port 3001)
│   │   └── web/                # SvelteKit frontend (port 5173)
│   └── packages/
│       └── core/               # Shared types, Zod schemas, API contracts
└── alternative-stack/
    ├── apps/
    │   ├── api/                # Node.js + Express backend (port 4001)
    │   └── web/                # Next.js frontend (port 4000)
    └── packages/
        └── core/               # Shared types, Zod schemas, API contracts
```

## Prerequisites

- **Bun** v1.0+ — https://bun.sh (for preferred stack)
- **Node.js** v18+ (for alternative stack and Turborepo)
- **PostgreSQL** database (see Environment Variables below)

## Environment Variables

Copy `.env.example` and fill in your values:

```bash
cp .env.example preferred-stack/apps/api/.env
cp .env.example alternative-stack/apps/api/.env
```

Required variables:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>?sslmode=require
JWT_SECRET=your-secret-key-min-32-chars
PORT=3001   # 4001 for alternative stack
```

> Both stacks point to the **same database**. Run migrations once (see below).

## Database Setup

```bash
# Run from preferred-stack/apps/api
cd preferred-stack/apps/api
bun run db:push
```

This applies the schema to your PostgreSQL database. No separate migration needed for the alternative stack — it shares the same tables.

## Running the Preferred Stack

SvelteKit + Bun + Drizzle → http://localhost:5173

```bash
# Terminal 1 — API
cd preferred-stack/apps/api
bun run dev

# Terminal 2 — Web
cd preferred-stack/apps/web
bun run dev
```

## Running the Alternative Stack

Next.js + Express + Prisma → http://localhost:4000

```bash
# Terminal 1 — API
cd alternative-stack/apps/api
npm run dev

# Terminal 2 — Web
cd alternative-stack/apps/web
npm run dev
```

## Features

- **Authentication** — Register with company name/slug, login with email + tenant slug, JWT access tokens, protected routes
- **Task Board** — Kanban board with To Do / In Progress / Done columns
- **Drag and Drop** — Move tasks between columns with instant optimistic updates
- **Multi-Tenancy** — Tenant isolation enforced at the API middleware layer via AsyncLocalStorage (preferred) and Express middleware (alternative). Users from different tenants cannot access each other's data even with a valid JWT.
- **Full CRUD** — Create, read, update, delete tasks with priority levels

## Type Safety

Both stacks use `packages/core` as the single source of truth for:
- TypeScript types (`Task`, `User`, `Tenant`, `ApiResponse`)
- Zod validation schemas (shared between frontend and backend)
- API contract interfaces (typed request/response shapes)

`strict: true` is enforced in all `tsconfig.json` files.

## Architecture Decisions

See [`DECISIONS.md`](./DECISIONS.md) for:
- Every significant architectural decision
- LLM disclosure (what was AI-suggested vs. manually decided)
- Two examples of LLM errors that were identified and corrected
- Prompting strategy for complex sub-tasks

See [`docs/HLD.md`](./docs/HLD.md) and [`docs/LLD.md`](./docs/LLD.md) for full design documentation.
