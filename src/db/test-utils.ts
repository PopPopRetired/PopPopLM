/**
 * @module src/db/test-utils.ts
 *
 * Utilities for database testing: in-memory database setup and
 * automated table reset helpers.
 *
 * Each test suite should call `createTestDatabase` and `resetNotebooksTables`
 * in its `beforeEach` hook to ensure isolated, repeatable tests.
 */
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { type AppDatabase } from "./index";
import * as schema from "./schema";

/**
 * Creates a fresh in-memory Drizzle database for testing.
 *
 * Returns a completely isolated instance; there is no shared state
 * between different test suites using this utility.
 *
 * Uses `as unknown as AppDatabase` because the Drizzle client configuration
 * for `:memory:` returns a slightly different internal type than web-based
 * libSQL clients.
 *
 * @returns An isolated, typed Drizzle/libSQL database instance.
 */
export function createTestDatabase(): AppDatabase {
  const client = createClient({ url: ":memory:" });
  return drizzle(client, { schema }) as unknown as AppDatabase;
}

/**
 * Teardown and manually rebuild the application schema via raw SQL.
 *
 * Since we use an in-memory database (`:memory:`) in the test harness,
 * we rebuild the tables manually instead of running migrations to
 * keep the test feedback loop fast.
 *
 * @param db - The test database instance to reset.
 */
export async function resetNotebooksTables(db: AppDatabase): Promise<void> {
  const client = (db as any).$client;

  // Drop existing tables in correct dependency order (children first)
  await client.execute("DROP TABLE IF EXISTS source_chunks");
  await client.execute("DROP TABLE IF EXISTS sources");
  await client.execute("DROP TABLE IF EXISTS notebooks");
  await client.execute("DROP TABLE IF EXISTS owners");

  // Re-create parent tables
  await client.execute(`
    CREATE TABLE owners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);

  await client.execute(`
    CREATE TABLE notebooks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      owner_id INTEGER NOT NULL REFERENCES owners(id)
    )
  `);

  // Re-create children tables
  await client.execute(`
    CREATE TABLE sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notebook_id INTEGER NOT NULL REFERENCES notebooks(id),
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      content TEXT,
      created_at INTEGER NOT NULL
    )
  `);

  await client.execute(`
    CREATE TABLE source_chunks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_id INTEGER NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      chunk_index INTEGER NOT NULL,
      embedding F32_BLOB(768) NOT NULL
    )
  `);
}
