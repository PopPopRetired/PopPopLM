/**
 * @module src/db/index.ts
 *
 * Singleton Drizzle ORM client initialization.
 *
 * Configures the primary production database connection via a local
 * libSQL client and the application's central schema definition.
 */
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import * as schema from "./schema";

/**
 * The production database client.
 *
 * Expects `DATABASE_URL` to be defined in `.env` (passed via Bun).
 * For development, this is typically `file:./local.db`.
 */
const client = createClient({
  url: process.env.DATABASE_URL!,
});

export const db = drizzle(client, { schema });

/** Export the database type for use in query functions and tests. */
export type AppDatabase = typeof db;
