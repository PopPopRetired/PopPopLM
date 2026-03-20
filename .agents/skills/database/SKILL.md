---
name: Database Patterns
description: Drizzle ORM v0.45 + drizzle-zod + libSQL patterns for schema definition, migrations, and typed queries. Auto-attached when editing files under src/db/.
---

# Database Rules

## Versions

| Package | Version |
|---|---|
| `drizzle-orm` | 0.45.1 |
| `drizzle-kit` | 0.31.9 |
| `drizzle-zod` | 0.8.3 |
| `@libsql/client` | 0.17.0 |

## Client Initialization

The canonical client setup lives in `src/db/index.ts`. Do not reinvent it:

```typescript
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";

const client = createClient({ url: process.env.DATABASE_URL! });
export const db = drizzle(client);
```

- Always import `db` from `src/db/index.ts` — never create a second client instance.
- `DATABASE_URL` must be set in the environment. For local dev, use a local file path (`file:./local.db`) or Turso URL.

## Schema Definition

- Use `drizzle-orm/sqlite-core` imports: `sqliteTable`, `text`, `integer`, `blob`, `real`.
- All schema definitions live in `src/db/schema.ts` (or colocated schema files imported from there).
- Always export every table so drizzle-kit can introspect them.
- Use `.primaryKey()` on the `id` column; prefer `integer` PKs for SQLite.
- Use `.notNull()` explicitly — do not rely on Drizzle inferring nullability.

```typescript
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
```

## drizzle-zod Integration

- Use `createInsertSchema` and `createSelectSchema` from `drizzle-zod` to derive Zod v4 schemas from Drizzle table definitions.
- Do not manually duplicate type definitions — always infer from schemas.

```typescript
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./schema";

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);

export type InsertUser = typeof insertUserSchema._type;
export type SelectUser = typeof selectUserSchema._type;
```

## Query Patterns

- Always use the Drizzle query builder — no raw SQL strings or template literals.
- Use `db.select().from(table).where(eq(table.col, value))` pattern.
- Import operators (`eq`, `and`, `or`, `like`, `gt`, `lt`, etc.) from `drizzle-orm`.
- For relational queries, define relations in `src/db/schema.ts` using `relations()` and use `db.query.<table>.findMany()`.

## Migrations

Run these from the project root using the scripts in `package.json`:

- `bun run db:generate` — generates SQL migration files in `./drizzle/`
- `bun run db:migrate` — applies pending migrations
- `bun run db:push` — pushes schema directly (dev only, no migration files)
- `bun run db:studio` — opens Drizzle Studio UI

## Testing

- Treat DB testing as continuous work: whenever query behavior changes, add or update matching query tests in the same milestone/session.
- Use `:memory:` as the `DATABASE_URL` in tests to get an in-memory SQLite instance.
- Run migrations in test setup before executing any queries.
- Never share the `db` singleton across test files — create a fresh client per test suite.
- During development, run targeted DB tests first (`bun test src/db/`), then run full `bun test` before feature completion.

## File Structure Convention

```
src/db/
  index.ts      ← drizzle client singleton
  schema.ts     ← all table definitions and relations
  queries/
    <domain>.ts ← typed query helpers per domain (e.g. users.ts, posts.ts)
```
