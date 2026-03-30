# Low-Level Design — Multi-Tenant Task Board

**Candidate:** Sumant Yadav
**Role:** Lead Full Stack Developer (SvelteKit / TypeScript)
**Version:** v1.0 — 2026

---

## Table of Contents

1. [Monorepo Workspace Structure](#1-monorepo-workspace-structure)
2. [Database Schema](#2-database-schema)
3. [API Contract Design](#3-api-contract-design)
4. [Shared Package Design — packages/core](#4-shared-package-design)
5. [Feature Module Design — Authentication](#5-feature-module-design--authentication)
6. [Feature Module Design — Tasks](#6-feature-module-design--tasks)
7. [State Management Strategy](#7-state-management-strategy)
8. [Multi-Tenancy Enforcement](#8-multi-tenancy-enforcement)
9. [Error Handling Strategy](#9-error-handling-strategy)

---

## 1. Monorepo Workspace Structure

The repository is organised as a Turborepo workspace with two complete, independent implementations sharing the same PostgreSQL database. Each stack is self-contained and can be run independently.


### Root Layout

```
multi-tenant-taskboard/
├── turbo.json                  — Turborepo pipeline configuration
├── package.json                — Root workspace, shared scripts
├── .env.example                — Environment variable documentation
├── README.md                   — Setup and run instructions
├── DECISIONS.md                — Architectural decisions and LLM disclosure
├── docs/
│   ├── HLD.md                  — High-Level Design
│   └── LLD.md                  — This document
├── preferred-stack/            — SvelteKit + Bun + Drizzle implementation
└── alternative-stack/          — Next.js + Express + Prisma implementation
```

### Preferred Stack

```
preferred-stack/
├── apps/
│   ├── api/                    — Bun + Bun.serve HTTP server (port 3001)
│   │   ├── src/
│   │   │   ├── index.ts        — Server entry point, route registration
│   │   │   ├── lib/
│   │   │   │   └── context.ts  — AsyncLocalStorage for request-scoped tenant context
│   │   │   ├── middleware/
│   │   │   │   └── auth.middleware.ts  — JWT verification, context injection
│   │   │   ├── modules/
│   │   │   │   ├── auth/       — Self-contained auth feature module
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   └── auth.repository.ts
│   │   │   │   └── tasks/      — Self-contained task feature module
│   │   │   │       ├── task.controller.ts
│   │   │   │       ├── task.service.ts
│   │   │   │       └── task.repository.ts
│   │   │   ├── db/
│   │   │   │   ├── schema.ts   — Drizzle table definitions
│   │   │   │   └── index.ts    — Database connection
│   │   │   └── utils/
│   │   │       ├── jwt.ts      — Token generation and verification
│   │   │       ├── password.ts — Bcrypt hashing
│   │   │       └── response.ts — Standardised HTTP response helpers
│   │   ├── drizzle.config.ts
│   │   └── package.json
│   └── web/                    — SvelteKit frontend (port 5173)
│       ├── src/
│       │   ├── routes/
│       │   │   ├── +layout.svelte      — Root layout, auth initialisation
│       │   │   ├── +page.svelte        — Landing page
│       │   │   ├── login/+page.svelte
│       │   │   ├── register/+page.svelte
│       │   │   └── dashboard/+page.svelte  — Protected Kanban board
│       │   └── lib/
│       │       ├── api/
│       │       │   └── client.ts       — Typed HTTP client
│       │       ├── stores/
│       │       │   ├── auth.ts         — Authentication state
│       │       │   └── tasks.ts        — Task state with optimistic updates
│       │       └── components/
│       │           ├── auth/           — LoginForm, RegisterForm
│       │           └── tasks/          — TaskBoard, TaskColumn, TaskCard, TaskForm
│       └── package.json
└── packages/
    └── core/                   — Shared types, schemas, and contracts
        ├── src/
        │   ├── types/
        │   │   ├── user.ts
        │   │   └── task.ts
        │   ├── contracts/
        │   │   ├── auth.ts
        │   │   ├── task.ts
        │   │   └── api.ts
        │   └── index.ts        — Single barrel export
        └── package.json
```

### Alternative Stack

```
alternative-stack/
├── apps/
│   ├── api/                    — Node.js + Express HTTP server (port 4001)
│   │   ├── src/
│   │   │   ├── index.ts        — Express app setup, middleware registration
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.ts  — JWT verification, req.user injection
│   │   │   │   └── error.middleware.ts — Global error handler
│   │   │   ├── modules/
│   │   │   │   ├── auth/       — Self-contained auth feature module
│   │   │   │   └── tasks/      — Self-contained task feature module
│   │   │   ├── prisma/
│   │   │   │   └── schema.prisma
│   │   │   └── utils/
│   │   └── package.json
│   └── web/                    — Next.js App Router frontend (port 4000)
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx          — Root layout with AuthProvider
│       │   │   ├── page.tsx            — Landing page
│       │   │   ├── login/page.tsx
│       │   │   ├── register/page.tsx
│       │   │   └── dashboard/page.tsx  — Protected Kanban board
│       │   └── lib/
│       │       ├── api-client.ts       — Typed HTTP client
│       │       └── auth-context.tsx    — React context for auth state
│       └── package.json
└── packages/
    └── core/                   — Shared types, schemas, and contracts (mirrors preferred)
```

---

## 2. Database Schema

Both stacks share the same PostgreSQL database and identical schema. The preferred stack manages the schema via Drizzle; the alternative stack uses Prisma pointing to the same connection string.

### Entities

#### tenants

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| name | VARCHAR(255) | NOT NULL | Display name of the organisation |
| slug | VARCHAR(100) | NOT NULL, UNIQUE | URL-safe identifier used in login |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMP | NOT NULL | |

The `slug` is the tenant's unique identifier used during login. It is immutable after creation.

#### users

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| tenant_id | UUID | NOT NULL, FK → tenants.id | Cascade delete |
| email | VARCHAR(255) | NOT NULL | Unique within a tenant |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hash, never stored plaintext |
| role | VARCHAR(50) | NOT NULL, DEFAULT 'member' | Extensible for RBAC |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMP | NOT NULL | |

**Unique constraint:** `(tenant_id, email)` — the same email address may exist in different tenants.
**Index:** `(tenant_id, email)` — optimises login lookup.

#### tasks

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PRIMARY KEY | Auto-generated |
| tenant_id | UUID | NOT NULL, FK → tenants.id | Cascade delete |
| user_id | UUID | NOT NULL, FK → users.id | Task creator/assignee |
| title | VARCHAR(200) | NOT NULL | |
| description | TEXT | NULLABLE | |
| status | VARCHAR(50) | NOT NULL, DEFAULT 'todo' | Enum: todo, in_progress, done |
| priority | VARCHAR(50) | NOT NULL, DEFAULT 'medium' | Enum: low, medium, high |
| position | INTEGER | NOT NULL | Ordering within a column |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | |
| updated_at | TIMESTAMP | NOT NULL | |

**Index:** `(tenant_id, status)` — optimises the primary query pattern (fetch all tasks for a tenant, grouped by status).
**Index:** `(user_id)` — optimises user-specific task lookups.

### Relationships

- One **Tenant** has many **Users**
- One **Tenant** has many **Tasks**
- One **User** belongs to one **Tenant**
- One **User** has many **Tasks**
- One **Task** belongs to one **Tenant** and one **User**

### Schema Decisions

**Why UUID primary keys?** Avoids sequential ID enumeration attacks. A user cannot guess another tenant's task IDs.

**Why `tenant_id` on every task?** Enables a single-index query to fetch all tenant tasks without joining through users. This is the most frequent query in the system.

**Why cascade deletes?** Deleting a tenant removes all associated users and tasks atomically. Prevents orphaned records.

**Why store `status` as VARCHAR rather than a PostgreSQL enum?** Allows adding new statuses without a schema migration. Validation is enforced at the application layer via Zod.

---

## 3. API Contract Design

All endpoints are prefixed with `/api`. Authentication endpoints are public; all task endpoints require a valid JWT in the `Authorization: Bearer <token>` header.

### Standard Response Envelope

All responses follow a consistent shape:

**Success**
```
{
  "data": <payload>,
  "message": <optional string>
}
```

**Error**
```
{
  "error": <message string>
}
```

---

### Authentication Endpoints

#### POST /api/auth/register

Creates a new tenant and the first user for that tenant.

**Request Body**

| Field | Type | Validation |
|-------|------|------------|
| tenantName | string | min 2, max 100 chars |
| tenantSlug | string | min 2, max 100, lowercase alphanumeric and hyphens only |
| email | string | valid email format |
| password | string | min 8, max 100 chars |

**Response — 200 OK**

| Field | Type | Notes |
|-------|------|-------|
| accessToken | string | JWT, expires in 7 days |
| refreshToken | string | JWT, expires in 30 days |
| user.id | string | UUID |
| user.email | string | |
| user.tenantId | string | UUID |
| user.role | string | Always "member" on registration |

**Error States**

| Status | Condition |
|--------|-----------|
| 400 | Validation failure (missing fields, invalid format) |
| 409 | Tenant slug already exists |
| 500 | Database error |

---

#### POST /api/auth/login

Authenticates an existing user within a specific tenant.

**Query Parameter:** `?tenant=<slug>` — identifies which tenant to authenticate against.

**Request Body**

| Field | Type | Validation |
|-------|------|------------|
| email | string | valid email format |
| password | string | min 1 char |

**Response — 200 OK**

Same shape as `/register`.

**Error States**

| Status | Condition |
|--------|-----------|
| 400 | Missing tenant query parameter or validation failure |
| 401 | Invalid credentials (tenant not found, user not found, wrong password) |
| 500 | Database error |

Note: All credential failures return the same 401 message ("Invalid credentials") to prevent user enumeration.

---

### Task Endpoints

All task endpoints require `Authorization: Bearer <token>`. The tenant context is extracted from the JWT and enforced at the middleware layer — it is never accepted from the request body or query string.

#### GET /api/tasks

Returns all tasks belonging to the authenticated user's tenant.

**Response — 200 OK**

Array of task objects:

| Field | Type |
|-------|------|
| id | string (UUID) |
| tenantId | string (UUID) |
| userId | string (UUID) |
| title | string |
| description | string or null |
| status | "todo" \| "in_progress" \| "done" |
| priority | "low" \| "medium" \| "high" |
| position | number |
| createdAt | ISO 8601 string |
| updatedAt | ISO 8601 string |

**Error States**

| Status | Condition |
|--------|-----------|
| 401 | Missing or invalid JWT |
| 500 | Database error |

---

#### POST /api/tasks

Creates a new task in the authenticated user's tenant.

**Request Body**

| Field | Type | Validation |
|-------|------|------------|
| title | string | min 1, max 200 chars |
| description | string | optional, max 2000 chars |
| status | TaskStatus | optional, defaults to "todo" |
| priority | TaskPriority | optional, defaults to "medium" |

**Response — 200 OK**

Single task object (same shape as GET /api/tasks items).

**Error States**

| Status | Condition |
|--------|-----------|
| 400 | Validation failure |
| 401 | Missing or invalid JWT |
| 500 | Database error |

---

#### PATCH /api/tasks/:id

Updates one or more fields of an existing task. Partial updates are supported.

**Request Body** — all fields optional

| Field | Type |
|-------|------|
| title | string |
| description | string |
| status | TaskStatus |
| priority | TaskPriority |

**Response — 200 OK**

Updated task object.

**Error States**

| Status | Condition |
|--------|-----------|
| 400 | Validation failure |
| 401 | Missing or invalid JWT |
| 404 | Task not found or belongs to a different tenant |
| 500 | Database error |

---

#### PATCH /api/tasks/:id/move

Moves a task to a different status column. Separated from the general update endpoint to make the drag-and-drop intent explicit.

**Request Body**

| Field | Type | Validation |
|-------|------|------------|
| status | TaskStatus | required |
| position | number | required, integer ≥ 0 |

**Response — 200 OK**

Updated task object.

**Error States**

| Status | Condition |
|--------|-----------|
| 400 | Validation failure |
| 401 | Missing or invalid JWT |
| 404 | Task not found or belongs to a different tenant |
| 500 | Database error |

---

#### DELETE /api/tasks/:id

Permanently deletes a task. The task must belong to the authenticated user's tenant.

**Response — 200 OK**

```
{ "data": null, "message": "Task deleted successfully" }
```

**Error States**

| Status | Condition |
|--------|-----------|
| 401 | Missing or invalid JWT |
| 404 | Task not found or belongs to a different tenant |
| 500 | Database error |

---

## 4. Shared Package Design

`packages/core` is the single source of truth for all types, validation schemas, and API contract interfaces. Both the frontend and backend import from this package. A type mismatch between what the API returns and what the UI expects is caught at compile time.

### What It Exports

#### Types (`src/types/`)

**user.ts** — `User` interface representing a user record. Consumed by auth service and auth store.

**task.ts** — `Task` interface representing a task record. `TaskStatus` and `TaskPriority` union types. Consumed by task service, task repository, and all frontend task components.

#### Contracts (`src/contracts/`)

**auth.ts** — Zod schemas for `RegisterDto` and `LoginDto`. Inferred TypeScript types exported alongside schemas. `AuthResponse` interface defining the shape of a successful auth response. Used by the API to validate incoming requests and by the frontend to type API responses.

**task.ts** — Zod schemas for `CreateTaskDto`, `UpdateTaskDto`, and `MoveTaskDto`. `TaskResponse` interface defining the exact shape returned by every task endpoint. Used by the API controller to validate requests and by the frontend API client to type responses.

**api.ts** — `ApiResponse<T>` generic wrapper interface matching the standard response envelope. Ensures the frontend client and backend response helpers agree on the outer shape.

#### Why Each Export Belongs Here

- **Zod schemas** belong in core because they are used for validation on both sides — the API validates incoming requests, the frontend can validate form inputs before sending.
- **Response interfaces** belong in core because the frontend fetch layer and the backend handler must reference the same contract. If the API adds a field, TypeScript will surface the mismatch in the frontend at compile time.
- **DTO types** belong in core because the frontend constructs these objects when making requests. Sharing the type ensures the request body always matches what the API expects.

#### What Does Not Belong Here

- Database models (Drizzle/Prisma types) — these are implementation details of the API
- UI component types — these are implementation details of the frontend
- Environment configuration — this is deployment-specific

### How Both Apps Consume It

The preferred stack imports as `@preferred/core`. The alternative stack imports as `@alternative/core`. Both are resolved via Turborepo workspace linking — no publishing required.

---

## 5. Feature Module Design — Authentication

The auth module is self-contained under `src/modules/auth/`. It does not import from the tasks module. It imports shared contracts from `packages/core`.

### Files and Responsibilities

**auth.controller.ts**
Handles HTTP concerns only. Parses the request body, delegates to the service, formats the response. Contains no business logic. Catches `AppError` subclasses and maps them to appropriate HTTP status codes.

**auth.service.ts**
Contains all business logic for authentication. Checks for duplicate tenant slugs, hashes passwords, generates JWT tokens, verifies credentials. Depends on `AuthRepository` via constructor injection. Does not know about HTTP.

**auth.repository.ts**
Contains all database queries for the auth domain. Methods: `createTenant`, `findTenantBySlug`, `createUser`, `findUserByEmail`, `findUserById`. All queries are scoped to the relevant tenant where applicable. Does not contain business logic.

### Data Flow — Register

```
POST /api/auth/register
  → auth.controller: parse body, validate with registerSchema (from @preferred/core)
  → auth.service.register(dto)
      → auth.repository.findTenantBySlug(dto.tenantSlug)  — check uniqueness
      → auth.repository.createTenant(name, slug)
      → bcrypt.hash(dto.password)
      → auth.repository.createUser(tenantId, email, hash)
      → generateAccessToken({ userId, tenantId, email, role })
      → generateRefreshToken(...)
      → return AuthResponse
  → auth.controller: return 200 with AuthResponse
```

### Data Flow — Login

```
POST /api/auth/login?tenant=<slug>
  → auth.controller: parse body, validate with loginSchema, extract tenant from query
  → auth.service.login(dto, tenantSlug)
      → auth.repository.findTenantBySlug(tenantSlug)  — 401 if not found
      → auth.repository.findUserByEmail(email, tenantId)  — 401 if not found
      → bcrypt.compare(password, user.passwordHash)  — 401 if mismatch
      → generateAccessToken(...)
      → generateRefreshToken(...)
      → return AuthResponse
  → auth.controller: return 200 with AuthResponse
```

Note: All three failure conditions (tenant not found, user not found, wrong password) return the same 401 response to prevent user enumeration.

---

## 6. Feature Module Design — Tasks

The task module is self-contained under `src/modules/tasks/`. It does not import from the auth module. It reads tenant context from `AsyncLocalStorage` — it never accepts `tenantId` as a function parameter.

### Files and Responsibilities

**task.controller.ts**
Handles HTTP concerns only. Parses and validates request bodies using Zod schemas from `@preferred/core`. Delegates to the service. Does not read `tenantId` from the request — this is handled by the middleware before the controller is invoked.

**task.service.ts**
Contains business logic for task operations. Validates ownership before updates and deletes. Maps database records to `TaskResponse` objects. Does not know about HTTP or tenant context — it receives clean DTOs from the controller.

**task.repository.ts**
Contains all database queries. Reads `tenantId` from `AsyncLocalStorage` context at the start of every method. Every query includes `WHERE tenant_id = <tenantId>`. This is the enforcement point for multi-tenancy — a task from a different tenant will simply not be found.

### Data Flow — Drag and Drop (Move Task)

```
User drags task to new column
  → TaskColumn: onDrop fires
  → taskStore.updateTask(id, { status: newStatus })
      → Svelte store: update tasks array immediately (optimistic)
      → apiClient.patch('/api/tasks/:id', { status })  — fire and forget
          → auth.middleware: verify JWT, inject context via AsyncLocalStorage
          → task.controller.update: validate body with updateTaskSchema
          → task.service.update(id, dto)
              → task.repository.findById(id)  — reads tenantId from context
              → task.repository.update(id, dto)  — scoped to tenant
              → return TaskResponse
          → return 200 with updated task
      → Store: silently merge server response (no visual change)
      → If API fails: store retains optimistic state (no revert)
```

The key design decision here is that the UI never waits for the API response before updating. The `latestIntent` map in the task store ensures that a slow API response from an earlier drag does not overwrite a more recent drag.

---

## 7. State Management Strategy

### Preferred Stack (SvelteKit)

State is managed with Svelte writable stores. There are two stores:

**auth store (`src/lib/stores/auth.ts`)**
Holds `{ user, isAuthenticated, isLoading }`. On page load, `checkAuth()` decodes the JWT from `localStorage` locally — no network call. This makes auth restoration instant on refresh. The store is initialised in `+layout.svelte` via `onMount`.

**task store (`src/lib/stores/tasks.ts`)**
Holds the flat array of `TaskResponse[]`. Derived values (tasks per column) are computed reactively with `$:` statements in the component layer. The store exposes `loadTasks`, `createTask`, `updateTask`, `moveTask`, and `deleteTask`. All mutation methods apply optimistic updates synchronously before firing the API call.

**Why stores over component state?** Tasks need to be accessible across `TaskBoard`, `TaskColumn`, and `TaskCard` without prop drilling. A store provides a single source of truth that any component can subscribe to.

**Why not SvelteKit's `load` functions?** The dashboard is a client-rendered protected page. Using `load` would require server-side session handling, which adds complexity beyond the scope of this assignment.

### Alternative Stack (Next.js)

State is managed with React's built-in primitives:

**AuthContext (`src/lib/auth-context.tsx`)**
A React context wrapping the entire application. Provides `user`, `isAuthenticated`, `isLoading`, `login`, `register`, and `logout`. On mount, decodes the JWT from `localStorage` locally — same approach as the preferred stack.

**Local component state**
The dashboard page manages `tasks` with `useState`. This is sufficient because tasks are only needed on the dashboard page. A global state solution (Zustand, Redux) would be over-engineering for this scope.

**Why not React Query or SWR?** These libraries add value for cache invalidation and background refetching. For this assignment, the optimistic update pattern is implemented manually to demonstrate understanding of the underlying mechanics.

---

## 8. Multi-Tenancy Enforcement

Tenant isolation is enforced at the API middleware layer. The UI has no role in enforcing tenancy — it is purely a display concern.

### Preferred Stack — AsyncLocalStorage Pattern

The preferred stack uses Node's `AsyncLocalStorage` to propagate tenant context through the call stack without passing it as a function argument.

**Flow:**
1. `auth.middleware.ts` verifies the JWT and extracts `{ userId, tenantId, email, role }`
2. It calls `requestContext.run(ctx, handler)` — this binds the context to the current async execution chain
3. Any code called within that chain (controller → service → repository) can call `getContext()` to retrieve the tenant context
4. `task.repository.ts` calls `getContext()` at the start of every method and uses the `tenantId` in every query

**Why this pattern?** It enforces tenancy at the infrastructure level. A developer cannot accidentally forget to pass `tenantId` to a repository method — the repository always reads it from context. This is the same pattern used in production observability systems (OpenTelemetry, request tracing).

### Alternative Stack — Express Middleware Pattern

The alternative stack uses Express's `req.user` injection pattern:

1. `auth.middleware.ts` verifies the JWT and attaches `{ userId, tenantId, email, role }` to `req.user`
2. Every controller method reads `req.user.tenantId` and passes it to the service
3. The service passes it to the repository

This is the conventional Express pattern. It is explicit but requires every controller to correctly forward the tenant context.

### Isolation Guarantee

In both stacks, every database query that operates on tasks includes `WHERE tenant_id = <tenantId>`. A `findById` query that does not find a record (because it belongs to a different tenant) returns a 404 — indistinguishable from a genuinely missing record. This prevents cross-tenant data leakage and avoids revealing the existence of records in other tenants.

---

## 9. Error Handling Strategy

### Error Class Hierarchy

A base `AppError` class carries an HTTP status code and a message. Subclasses represent specific error conditions:

- `ValidationError` — 400, input failed Zod schema validation
- `UnauthorizedError` — 401, missing or invalid JWT, wrong credentials
- `ForbiddenError` — 403, authenticated but not permitted
- `NotFoundError` — 404, resource does not exist or belongs to another tenant

### Handling at Each Layer

**Repository** — throws `NotFoundError` when a tenant-scoped query returns no result.

**Service** — throws `ValidationError` for business rule violations (e.g. duplicate slug), `UnauthorizedError` for credential failures.

**Controller** — catches `AppError` subclasses and maps them to HTTP responses. Unexpected errors (not `AppError`) are caught by the global error handler and returned as 500 with a generic message. Stack traces are never exposed to the client.

### Error Message Policy

Authentication failures always return "Invalid credentials" regardless of whether the tenant, user, or password was wrong. This prevents user enumeration — an attacker cannot determine whether a given email exists in a tenant.

---

*End of Document*
