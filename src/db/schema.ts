/**
 * @module src/db/schema.ts
 *
 * Central schema definition for all database tables, relationships,
 * Zod validation schemas, and inferred TypeScript types.
 *
 * This is the **single source of truth** for database structure. All query
 * files import schemas and types from here — never re-derive them.
 *
 * Tables:
 * - `owners`        — Family members who own notebooks
 * - `notebooks`     — Research/study notebooks, each belonging to one owner
 * - `sources`       — Individual content items (URLs, PDFs, text) in a notebook
 * - `source_chunks` — Text chunks with vector embeddings for RAG search
 */
import { sqliteTable, text, integer, customType } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════════
// Tables
// ═══════════════════════════════════════════════════════════════════════

/** Family members who own notebooks (e.g., "PopPop", "MawMaw"). */
export const owners = sqliteTable("owners", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});

/** Research/study notebooks. Each belongs to exactly one owner. */
export const notebooks = sqliteTable("notebooks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  ownerId: integer("owner_id").notNull().references(() => owners.id),
});

/** Individual content sources within a notebook (web pages, PDFs, pasted text). */
export const sources = sqliteTable("sources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  notebookId: integer("notebook_id").notNull().references(() => notebooks.id),
  title: text("title").notNull(),
  /** Source format: `"url"`, `"text"`, or `"pdf"`. */
  type: text("type").notNull(),
  content: text("content"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

/**
 * Custom Drizzle column type for 768-dimension float32 vectors.
 *
 * libSQL supports native vector columns via `F32_BLOB(n)`. This custom type
 * handles the JS ↔ SQLite conversion:
 * - **To DB**: converts `number[]` → `Float32Array` (binary blob)
 * - **From DB**: converts `ArrayBuffer`/`Buffer` → `number[]`
 *
 * Used by `source_chunks.embedding` for cosine similarity search.
 */
export const f32Vector = customType<{ data: number[] }>({
  dataType() {
    return "F32_BLOB(768)";
  },
  toDriver(value) {
    return new Float32Array(value);
  },
  fromDriver(value: unknown) {
    if (value instanceof ArrayBuffer)
      return Array.from(new Float32Array(value));
    if (value instanceof Buffer)
      return Array.from(
        new Float32Array(value.buffer, value.byteOffset, value.length / 4),
      );
    return [];
  },
});

/**
 * Text chunks with vector embeddings for RAG (Retrieval-Augmented Generation).
 *
 * Each source is split into overlapping chunks (see `lib/chunking.ts`),
 * and each chunk gets a 768-dim embedding for cosine similarity search.
 * Cascades on source deletion — when a source is removed, its chunks go too.
 */
export const source_chunks = sqliteTable("source_chunks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sourceId: integer("source_id")
    .notNull()
    .references(() => sources.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  embedding: f32Vector("embedding").notNull(),
});

// ═══════════════════════════════════════════════════════════════════════
// Relations (for Drizzle relational queries)
// ═══════════════════════════════════════════════════════════════════════

export const ownersRelations = relations(owners, ({ many }) => ({
  notebooks: many(notebooks),
}));

export const notebooksRelations = relations(notebooks, ({ one, many }) => ({
  owner: one(owners, {
    fields: [notebooks.ownerId],
    references: [owners.id],
  }),
  sources: many(sources),
}));

export const sourcesRelations = relations(sources, ({ one, many }) => ({
  notebook: one(notebooks, {
    fields: [sources.notebookId],
    references: [notebooks.id],
  }),
  chunks: many(source_chunks),
}));

export const sourceChunksRelations = relations(source_chunks, ({ one }) => ({
  source: one(sources, {
    fields: [source_chunks.sourceId],
    references: [sources.id],
  }),
}));

// ═══════════════════════════════════════════════════════════════════════
// Zod Schemas (for validation)
// ═══════════════════════════════════════════════════════════════════════

export const insertOwnerSchema = createInsertSchema(owners);
export const selectOwnerSchema = createSelectSchema(owners);

export const insertNotebookSchema = createInsertSchema(notebooks);
export const selectNotebookSchema = createSelectSchema(notebooks);

export const insertSourceSchema = createInsertSchema(sources);
export const selectSourceSchema = createSelectSchema(sources);

export const insertSourceChunkSchema = createInsertSchema(source_chunks);
export const selectSourceChunkSchema = createSelectSchema(source_chunks);

// ═══════════════════════════════════════════════════════════════════════
// Inferred Types (single source of truth — import these, don't re-derive)
// ═══════════════════════════════════════════════════════════════════════

export type InsertOwner = z.infer<typeof insertOwnerSchema>;
export type SelectOwner = z.infer<typeof selectOwnerSchema>;

export type InsertNotebook = z.infer<typeof insertNotebookSchema>;
export type SelectNotebook = z.infer<typeof selectNotebookSchema>;

export type InsertSource = z.infer<typeof insertSourceSchema>;
export type SelectSource = z.infer<typeof selectSourceSchema>;

export type InsertSourceChunk = z.infer<typeof insertSourceChunkSchema>;
export type SelectSourceChunk = z.infer<typeof selectSourceChunkSchema>;
