/**
 * @module src/db/queries/notebooks.ts
 *
 * Typed query helpers for the `owners` and `notebooks` tables.
 *
 * Every function accepts an optional `db` parameter that defaults to the
 * production singleton. Tests pass an in-memory database instead for
 * isolation (see `src/db/test-utils.ts`).
 */
import { eq } from "drizzle-orm";

import { db as defaultDb, type AppDatabase } from "../index";
import {
  notebooks,
  owners,
  sources,
  type InsertOwner,
  type InsertNotebook,
} from "../schema";

/**
 * Lists all notebooks, optionally filtered by owner, with a count of sources.
 *
 * Uses Drizzle relational queries to eagerly load the `owner` and `sources`
 * relations, then appends a computed `sourceCount` field.
 *
 * @param ownerIdFilter - If provided, only returns notebooks owned by this owner.
 * @param db            - Database instance (defaults to production singleton).
 * @returns Notebook objects with nested `owner`, `sources`, and `sourceCount`.
 */
export async function listNotebooksWithSourceCount(
  ownerIdFilter?: number,
  db: AppDatabase = defaultDb,
) {
  const results = await db.query.notebooks.findMany({
    where: ownerIdFilter ? eq(notebooks.ownerId, ownerIdFilter) : undefined,
    with: {
      owner: true,
      sources: true,
    },
  });

  return results.map((nb) => ({
    ...nb,
    sourceCount: nb.sources.length,
  }));
}

/**
 * Returns all owner records.
 *
 * @param db - Database instance (defaults to production singleton).
 */
export async function listOwners(db: AppDatabase = defaultDb) {
  return db.select().from(owners);
}

/**
 * Creates a new owner and returns the inserted row.
 *
 * @param data - Owner fields (validated via `insertOwnerSchema` upstream).
 * @param db   - Database instance (defaults to production singleton).
 */
export async function createOwner(
  data: InsertOwner,
  db: AppDatabase = defaultDb,
) {
  return db.insert(owners).values(data).returning();
}

/**
 * Creates a new notebook and returns the inserted row.
 *
 * @param data - Notebook fields including `ownerId` foreign key.
 * @param db   - Database instance (defaults to production singleton).
 */
export async function createNotebook(
  data: InsertNotebook,
  db: AppDatabase = defaultDb,
) {
  return db.insert(notebooks).values(data).returning();
}

/**
 * Updates a notebook's title and returns the updated row.
 *
 * @param id    - Notebook ID to update.
 * @param title - New title string.
 * @param db    - Database instance (defaults to production singleton).
 */
export async function updateNotebookTitle(
  id: number,
  title: string,
  db: AppDatabase = defaultDb,
) {
  return db
    .update(notebooks)
    .set({ title })
    .where(eq(notebooks.id, id))
    .returning();
}

/**
 * Finds a single notebook by its primary key.
 *
 * @param id - Notebook ID to look up.
 * @param db - Database instance (defaults to production singleton).
 * @returns The notebook record, or `undefined` if not found.
 */
export async function findNotebookById(
  id: number,
  db: AppDatabase = defaultDb,
) {
  return db.query.notebooks.findFirst({
    where: eq(notebooks.id, id),
  });
}

/**
 * Deletes a notebook and all its sources.
 *
 * Sources are deleted first because `source_chunks` cascade from sources
 * via `ON DELETE CASCADE`, but sources themselves don't cascade from notebooks.
 *
 * @param id - Notebook ID to delete.
 * @param db - Database instance (defaults to production singleton).
 * @returns The deleted notebook row.
 */
export async function deleteNotebook(
  id: number,
  db: AppDatabase = defaultDb,
) {
  await db.delete(sources).where(eq(sources.notebookId, id));
  return db.delete(notebooks).where(eq(notebooks.id, id)).returning();
}
