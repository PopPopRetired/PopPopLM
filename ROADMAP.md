# PopPopLM Development Roadmap

Incremental milestones following MECE (Mutually Exclusive, Collectively Exhaustive) scope. Complete each milestone fully before starting the next. Update the status field as you progress.

---

## How to Use This Roadmap

At the start of each build session:

1. Find the current milestone (first one not marked `[x] COMPLETE`).
2. Attach only the listed context files and docs.
3. Scope the session to that milestone's feature set only.
4. Run targeted tests for changed behavior while building (`bun test <path>` or `bun test --watch`).
5. Verify the Definition of Done before closing the session.
6. Run full `bun test` before merge/milestone completion.
7. Mark the milestone complete and commit.

### Testing Cadence Policy

- Use balanced testing: add or update tests as behavior changes in each milestone.
- Keep local feedback fast with `bun test --watch` during active feature work.
- Defer enforced automation (git hooks/CI) until the stack and feature surface are more stable.

### Current Scaffold Test Starter Plan

- `src/index.test.ts`
  - Route behavior via `app.request()` for `GET /`, `GET /fragments/users`, and CRUD fragment POST routes.
  - Validate key response branches: success, invalid input, invalid id, not found, and DB error mapping.
  - Assert HTMX response contracts, including OOB updates for `#users-count` and `#crud-flash`.
- `src/db/queries/users.test.ts`
  - Use `DATABASE_URL=:memory:` test setup.
  - Verify CRUD semantics (`create`, `update`, `delete`, not-found paths) and `countUsers`.
  - Verify duplicate email behavior maps to the expected error path at route level.

### Commit Process (Item 7)

Use this checklist every time you finish a milestone.

**First-time setup (one time only):**

1. Initialize git in this project folder:
   - `git init`
2. Connect your GitHub repository:
   - `git remote add origin https://github.com/PopPopRetired/PopPopLM.git`
3. Create and switch to `main`:
   - `git branch -M main`

**Per-milestone commit workflow:**

1. Check what changed:
   - `git status`
2. Stage all milestone files:
   - `git add .`
3. Create a commit message tied to the milestone:
   - `git commit -m "Complete M1 database layer"`
4. Push to GitHub:
   - `git push -u origin main` (first push)
   - `git push` (after first push)

**Helpful checks:**

- See recent commits: `git log --oneline -n 5`
- If `git push` asks for auth, sign in with GitHub credentials or a personal access token.
- Keep commits milestone-scoped: do not mix multiple roadmap milestones in one commit.

---

## M0 — Foundation

**Status:** `[x] COMPLETE`

**Scope:** Hono app entry point, Drizzle + libSQL connection wired, Bun scripts confirmed working.

**Files:**

- `src/index.tsx` — Hono app with basic GET /
- `src/db/index.ts` — drizzle client singleton
- `src/db/schema.ts` — initial users table
- `drizzle.config.ts` — drizzle-kit config
- `package.json` — all scripts defined

**Definition of Done:**

- `bun run dev` starts the server and `GET /` returns 200.
- `DATABASE_URL` is set (`.env` or environment).
- Project typechecks: `bun run typecheck` exits 0.

---

## M1 — Database Layer

**Status:** `[ ] PENDING`

**Scope:** Full schema design for all domain entities + drizzle-kit migration workflow + typed CRUD helper functions per domain.

**Context to attach:**

- `@Drizzle ORM Docs` (https://orm.drizzle.team/docs/overview)
- `.agents/skills/database/SKILL.md` (auto-attached via skill)
- `src/db/schema.ts`
- `src/db/index.ts`

**Tasks:**

- [ ] Design and define all domain tables in `src/db/schema.ts`
- [ ] Define `relations()` for any foreign key relationships
- [ ] Run `bun run db:generate` and `bun run db:migrate` successfully
- [ ] Create typed query helpers in `src/db/queries/<domain>.ts` for each table
- [ ] Write `src/db/queries/<domain>.test.ts` tests using `:memory:` libSQL

**Definition of Done:**

- `bun run db:push` applies schema with no errors.
- `bun test src/db/` passes — typed select and insert verified on at least one table.
- `bun run typecheck` exits 0.

---

## M2 — Validation Layer

**Status:** `[x] COMPLETE`

**Scope:** Zod v4 schemas derived from Drizzle tables via drizzle-zod. All API input/output types inferred — zero manual type duplication.

**Context to attach:**

- `@Zod v4 Docs` (https://zod.dev)
- `@Drizzle ORM Docs` (https://orm.drizzle.team/docs/overview)
- `.agents/skills/database/SKILL.md` (auto-attached via skill)
- `src/db/schema.ts`

**Tasks:**

- [ ] Add `createInsertSchema` and `createSelectSchema` exports to each domain in `src/db/schema.ts` (or `src/db/queries/<domain>.ts`)
- [ ] Define any additional Zod v4 refinements needed for business rules (e.g. email format, min/max length)
- [ ] Export `InsertX` and `SelectX` TypeScript types inferred from schemas
- [ ] Write schema validation tests using `schema.safeParse()` with valid and invalid fixtures

**Definition of Done:**

- No manually written TypeScript interfaces that duplicate Drizzle column definitions.
- `bun test src/db/` passes — valid and invalid inputs tested against all schemas.
- `bun run typecheck` exits 0.

---

## M3 — Route Layer

**Status:** `[x] COMPLETE`

**Scope:** Hono route groups for each domain + `@hono/zod-validator` middleware + global error handling.

**Context to attach:**

- `@Hono Docs` (https://hono.dev/docs/)
- `.agents/skills/project/SKILL.md` (auto-attached via skill)
- `src/index.tsx`
- Relevant schema/query files from M1/M2

**Tasks:**

- [ ] Create `src/routes/<domain>.ts` route groups for each domain
- [ ] Mount route groups on the main Hono app in `src/index.tsx`
- [ ] Add `@hono/zod-validator` middleware to all POST/PUT/PATCH routes
- [ ] Add a global error handler middleware in `src/index.tsx`
- [ ] Write route integration tests using `app.request()` (no network)

**Definition of Done:**

- All CRUD endpoints return correctly typed JSON responses.
- Invalid input returns a 400 with a structured error body (from zod-validator).
- `bun test src/routes/` passes.
- `bun run typecheck` exits 0.

---

## M4 — UI Shell

**Status:** `[ ] PENDING`

**Scope:** Tailwind v4 + DaisyUI v5 + Alpine.js v3 + Iconify (lucide) base layout with responsive behavior from mobile to desktop. HTMX v2 wired to at least one route. One complete end-to-end interaction: form submit → HTMX request → server renders partial → DOM swap, plus one Alpine micro-interaction for client-only state.

**Context to attach:**

- `@Tailwind CSS Docs` (https://tailwindcss.com/docs)
- `@DaisyUI Docs` (https://daisyui.com/docs/)
- `@Alpine Docs` (https://alpinejs.dev)
- `@HTMX Docs` (https://htmx.org/docs/)
- `@Iconify Tailwind4 Docs` (https://iconify.design/docs/usage/css/tailwind/tailwind4/)
- `.agents/skills/ui/SKILL.md` (auto-attached via skill)
- `src/styles.css`

**Tasks:**

- [ ] Create `src/styles.css` with Tailwind + DaisyUI + Iconify `@plugin` configuration
- [ ] Create `src/views/layout.tsx` — base HTML shell that includes `public/styles.css` and HTMX script
- [ ] Create at least one full-page view and one HTMX partial component
- [ ] Wire one form to a Hono route using `hx-post` / `hx-target` / `hx-swap`
- [ ] Add one Alpine-powered micro-interaction (for example: `x-data` + `x-show` dropdown/toggle) in a server-rendered view
- [ ] Apply responsive layout utilities (`sm`/`md`/`lg`) so primary sections adapt between phone and desktop
- [ ] Add at least one Lucide icon using the `iconify lucide--home` style two-class pattern (follow `.agents/skills/ui/SKILL.md` as source of truth)
- [ ] Confirm `bun run css` compiles styles with no errors

**Definition of Done:**

- `bun run css` compiles `src/styles.css` → `public/styles.css` with no errors.
- One complete form → HTMX request → server renders HTML partial → DOM swaps correctly in browser.
- One Alpine interaction works correctly (state changes in the browser with no round-trip).
- Layout remains usable at mobile and desktop widths (core navigation and interaction cards remain accessible and readable).
- At least one Lucide icon renders visibly.
- Targeted tests for changed behavior are added/updated and passing.
- `bun run typecheck` exits 0.

---

## M5 — AI Agent Core

**Status:** `[ ] PENDING`

**Scope:** Single Mastra agent with at least one tool and libSQL-backed memory. Mastra Studio accessible via CLI.

**Context to attach:**

- `@Mastra Docs` (https://mastra.ai/docs) — or use web search for live docs
- `.agents/skills/mastra/SKILL.md` (auto-attached via skill)
- `src/mastra/index.ts` (create if not exists)
- `src/db/index.ts`

**Tasks:**

- [ ] Create `src/mastra/index.ts` — Mastra instance registration
- [ ] Create `src/mastra/tools/weather-tool.ts` style file — at least one tool with Zod v4 input/output schema
- [ ] Create `src/mastra/agents/weather-agent.ts` style file — agent that uses the tool
- [ ] Configure `@mastra/memory` with `@mastra/libsql` storage adapter
- [ ] Configure `@mastra/loggers` for structured logging
- [ ] Verify `bun run studio` (`mastra dev`) starts without errors

**Definition of Done:**

- `mastra dev` starts and the agent is visible in Mastra Studio.
- Agent generates a response with memory persistence across turns (verified in Studio).
- Targeted tests for changed behavior are added/updated and passing.
- `bun run typecheck` exits 0.

---

## M5b — Source Ingestion & RAG

**Status:** `[ ] PENDING`

**Scope:** URL parsing, PDF processing, Youtube transcript ingestion, text chunking, and AI RAG integration.

**Context to attach:**

- `.agents/skills/ingestion/SKILL.md` (auto-attached via skill)
- `src/routes/sources.tsx`
- `src/db/queries/sources.ts`
- `src/mastra/tools/search-sources.ts`

**Tasks:**

- [ ] Extract structured data/content from URLs, YouTube, and PDFs
- [ ] Perform targeted text chunking using `@xenova/transformers`
- [ ] Develop schema and tests using `:memory:` libSQL for the `sources` table
- [ ] Hook up ingestion flow via relevant API routes and test their endpoints

**Definition of Done:**

- Sources properly ingested and stored as readable chunks.
- Chat panel retrieves RAG content correctly to avoid omissions.
- Ingestion data pipelines have unit tests avoiding regressions for PDFs and web fetches.
- `bun run typecheck` exits 0.

---

## M6 — Agent-UI Integration

**Status:** `[ ] PENDING`

**Scope:** Hono route exposes the Mastra agent via `@mastra/hono`. HTMX streams the agent response into the UI.

**Context to attach:**

- `@Mastra Docs` (https://mastra.ai/docs)
- `@Hono Docs` (https://hono.dev/docs/)
- `.agents/skills/mastra/SKILL.md` (auto-attached for `src/mastra/`)
- `.agents/skills/ui/SKILL.md` (auto-attached for components)
- `src/mastra/index.ts`
- `src/index.tsx`

**Tasks:**

- [ ] Mount `@mastra/hono` adapter on the Hono app
- [ ] Create a UI form that submits to the Mastra agent endpoint
- [ ] Handle streaming response in HTMX (use `hx-swap: beforeend` or SSE approach)
- [ ] Display agent response in the UI with appropriate loading state

**Definition of Done:**

- User submits a message via the UI form.
- Agent processes the request and the response appears in the UI without a full page reload.
- Memory persists between submissions (agent remembers prior context).
- Targeted tests for changed behavior are added/updated and passing.

---

## M7 — Observability & Polish

**Status:** `[ ] PENDING`

**Scope:** `@mastra/observability` tracing + structured logging + Hono error boundaries + UI polish.

**Context to attach:**

- `@Mastra Docs` — observability section
- `.agents/skills/mastra/SKILL.md` (auto-attached via skill)
- `src/mastra/index.ts`

**Tasks:**

- [ ] Configure `@mastra/observability` in the Mastra instance
- [ ] Verify traces appear in Mastra Studio
- [ ] Add `@mastra/loggers` structured log output to all agents and tools
- [ ] Add Hono middleware for request logging and error formatting
- [ ] UI polish: loading states, error messages, empty states

**Definition of Done:**

- Agent traces visible in Mastra Studio after a request.
- Structured log lines appear in the console for agent calls.
- Application handles errors gracefully without exposing stack traces to the client.
- Targeted tests for changed behavior are added/updated and passing.

---

## M8 — Testing

**Status:** `[ ] PENDING`

**Scope:** Test hardening and coverage expansion across critical paths: schemas, DB queries, Hono routes, HTMX fragments, and agent tool contracts. This milestone strengthens and standardizes coverage already added during prior milestones.

**Context to attach:**

- `@Bun Docs` — test runner section (https://bun.sh/docs/cli/test)
- All relevant source files for the domain under test

**Tasks:**

- [ ] Create `bunfig.toml` or test setup file configuring happy-dom for DOM tests
- [ ] Schema tests: `safeParse` valid + invalid inputs for every Zod schema
- [ ] DB tests: CRUD operations against `:memory:` libSQL in each `src/db/queries/*.test.ts`
- [ ] Route tests: `app.request()` for all Hono endpoints — test 200, 400, 404, 500 cases
- [ ] Agent tool tests: verify tool Zod schemas, mock tool execution contracts, and test data ingestion output formats (PDF/URL).
- [ ] HTMX tests: assert HTML fragment structure using happy-dom for partial responses
- [ ] Decide and implement enforcement level (pre-commit/pre-push hooks and/or CI workflow)
- [ ] Run full suite: `bun test` from project root

**Definition of Done:**

- `bun test` exits 0 with no failures.
- All CRUD paths, validation errors, and route responses have test coverage.
- `bun run typecheck` exits 0.
