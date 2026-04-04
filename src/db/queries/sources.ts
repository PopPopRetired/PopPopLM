/**
 * @module src/db/queries/sources.ts
 *
 * Typed query helpers for the `sources` and `source_chunks` tables.
 *
 * Handles creation, listing, deletion, and updates for the various
 * content items (URLs, PDFs, etc.) stored within a notebook.
 */
import { eq, inArray } from "drizzle-orm";

import { db as defaultDb, type AppDatabase } from "../index";
import {
  sources,
  source_chunks,
  type InsertSource,
  type SelectSource,
  type InsertSourceChunk,
} from "../schema";

/**
 * Creates a new content source record.
 *
 * @param data - Initial source fields (title, type, notebookId, etc.)
 * @param db   - Database instance (defaults to production singleton).
 * @returns The newly created source record.
 */
export async function createSource(
  data: InsertSource,
  db: AppDatabase = defaultDb,
) {
  return db.insert(sources).values(data).returning();
}

/**
 * Persists an array of text chunks with their embeddings.
 *
 * Usually called after `createSource` and a chunking/embedding pipeline.
 *
 * @param data - Array of chunk records to insert.
 * @param db   - Database instance (defaults to production singleton).
 * @returns The inserted chunks records.
 */
export async function createSourceChunks(
  data: InsertSourceChunk[],
  db: AppDatabase = defaultDb,
) {
  if (data.length === 0) return [];
  return db.insert(source_chunks).values(data).returning();
}

/**
 * Lists all sources belonging to a specific notebook.
 *
 * @param notebookId - The ID of the notebook to filter by.
 * @param db         - Database instance (defaults to production singleton).
 * @returns An array of source records.
 */
export async function listSourcesByNotebook(
  notebookId: number,
  db: AppDatabase = defaultDb,
): Promise<SelectSource[]> {
  const results = await db
    .select({
      id: sources.id,
      notebookId: sources.notebookId,
      title: sources.title,
      type: sources.type,
      content: sources.content,
      createdAt: sources.createdAt,
    })
    .from(sources)
    .where(eq(sources.notebookId, notebookId));

  return results;
}

/**
 * Deletes multiple sources by their IDs.
 *
 * Note: Associated `source_chunks` are automatically deleted via
 * foreign key cascade (defined in schema.ts).
 *
 * @param sourceIds - Array of source IDs to delete.
 * @param db        - Database instance (defaults to production singleton).
 * @returns The deleted source records.
 */
export async function deleteSources(
  sourceIds: number[],
  db: AppDatabase = defaultDb,
) {
  if (sourceIds.length === 0) return [];
  return db.delete(sources).where(inArray(sources.id, sourceIds)).returning();
}

/**
 * Updates the title for a specific source.
 *
 * @param sourceId - ID of the source to update.
 * @param newTitle - The updated title string.
 * @param db       - Database instance (defaults to production singleton).
 * @returns The updated source record.
 */
export async function updateSourceTitle(
  sourceId: number,
  newTitle: string,
  db: AppDatabase = defaultDb,
) {
  return db
    .update(sources)
    .set({ title: newTitle })
    .where(eq(sources.id, sourceId))
    .returning();
}
