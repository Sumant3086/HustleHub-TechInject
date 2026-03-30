git add .env.example README.md .eslintrc.json .prettierrc DECISIONS.md
git commit -m "chore: add env example, readme, eslint, prettier and decisions doc"

git add preferred-stack/packages/core/package.json preferred-stack/packages/core/tsconfig.json
git commit -m "feat(core): scaffold shared core package with tsconfig and package setup"

git add preferred-stack/packages/core/src/types/
git commit -m "feat(core): add shared TypeScript types for User, Task and Tenant"

git add preferred-stack/packages/core/src/contracts/auth.ts
git commit -m "feat(core): add auth contracts with Zod schemas for register and login"

git add preferred-stack/packages/core/src/contracts/task.ts
git commit -m "feat(core): add task contracts with Zod schemas and TaskResponse interface"

git add preferred-stack/packages/core/src/contracts/api.ts preferred-stack/packages/core/src/index.ts
git commit -m "feat(core): add unified API contract interface and barrel export"

git add preferred-stack/apps/api/package.json preferred-stack/apps/api/tsconfig.json preferred-stack/apps/api/drizzle.config.ts
git commit -m "feat(api): scaffold Bun API app with drizzle config and tsconfig"

git add preferred-stack/apps/api/src/db/
git commit -m "feat(api): add Drizzle schema for tenants, users and tasks with indexes"

git add preferred-stack/apps/api/src/utils/
git commit -m "feat(api): add jwt, password, response and prisma utility helpers"

git add preferred-stack/apps/api/src/lib/context.ts
git commit -m "feat(api): add AsyncLocalStorage context for request-scoped tenant isolation"

git add preferred-stack/apps/api/src/middleware/
git commit -m "feat(api): add auth middleware that verifies JWT and injects tenant context"

git add preferred-stack/apps/api/src/modules/auth/
git commit -m "feat(api): add auth module with register and login endpoints"

git add preferred-stack/apps/api/src/modules/tasks/
git commit -m "feat(api): add tasks module with full CRUD and tenant-scoped repository"

git add preferred-stack/apps/api/src/index.ts
git commit -m "feat(api): wire up Bun.serve with all routes and CORS headers"

git add preferred-stack/apps/api/.env preferred-stack/apps/api/prisma/
git commit -m "chore(api): add env config and prisma schema for database setup"

git add preferred-stack/apps/web/package.json preferred-stack/apps/web/tsconfig.json preferred-stack/apps/web/svelte.config.js preferred-stack/apps/web/next.config.js 2>$null
git commit -m "feat(web): scaffold SvelteKit frontend with tsconfig and svelte config"

git add preferred-stack/apps/web/src/app.html preferred-stack/apps/web/src/app.css 2>$null
git add preferred-stack/apps/web/src/routes/+layout.svelte preferred-stack/apps/web/src/routes/+page.svelte
git commit -m "feat(web): add root layout and landing page"

git add preferred-stack/apps/web/src/lib/api/
git commit -m "feat(web): add typed API client with auth header injection"

git add preferred-stack/apps/web/src/lib/stores/auth.ts
git commit -m "feat(web): add auth store with JWT decode, login, register and logout"

git add preferred-stack/apps/web/src/lib/stores/tasks.ts
git commit -m "feat(web): add task store with optimistic updates and intent tracking"

git add preferred-stack/apps/web/src/lib/components/auth/
git commit -m "feat(web): add login and register form components"

git add preferred-stack/apps/web/src/routes/login/ preferred-stack/apps/web/src/routes/register/
git commit -m "feat(web): add login and register pages with route guards"

git add preferred-stack/apps/web/src/lib/components/tasks/TaskBoard.svelte preferred-stack/apps/web/src/lib/components/tasks/TaskColumn.svelte
git commit -m "feat(web): add Kanban board with three-column layout and drop zones"

git add preferred-stack/apps/web/src/lib/components/tasks/TaskCard.svelte
git commit -m "feat(web): add draggable task card with priority indicator"

git add preferred-stack/apps/web/src/lib/components/tasks/TaskForm.svelte
git commit -m "feat(web): add task creation modal with title, description and priority"

git add preferred-stack/apps/web/src/lib/components/tasks/TaskDetail.svelte
git commit -m "feat(web): add task detail panel with inline editing for all fields"

git add preferred-stack/apps/web/src/routes/dashboard/
git commit -m "feat(web): add protected dashboard page with auth check on mount"

git add alternative-stack/
git commit -m "feat(alt): add Next.js and Express alternative stack sharing same database"

git add HLD.mermaid LLD-architecture.mermaid LLD-auth-flow.mermaid LLD-layers.mermaid LLD-schema.mermaid LLD-task-flow.mermaid 2>$null
git add . 
git commit -m "chore: final cleanup, remove temp files and tidy root structure"

git push -u origin main
