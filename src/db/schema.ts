import { sqliteTable, text, integer, blob, customType } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const owners = sqliteTable("owners", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});

export const notebooks = sqliteTable("notebooks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  ownerId: integer("owner_id").notNull().references(() => owners.id),
});

export const sources = sqliteTable("sources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  notebookId: integer("notebook_id").notNull().references(() => notebooks.id),
  title: text("title").notNull(),
  type: text("type").notNull(), // 'url', 'text', 'pdf'
  content: text("content"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const f32Vector = customType<{ data: number[] }>({
  dataType() {
    return "F32_BLOB(768)";
  },
  toDriver(value) {
    return new Float32Array(value);
  },
  fromDriver(value: unknown) {
    if (value instanceof ArrayBuffer) return Array.from(new Float32Array(value));
    if (value instanceof Buffer) return Array.from(new Float32Array(value.buffer, value.byteOffset, value.length / 4));
    return [];
  },
});

export const source_chunks = sqliteTable("source_chunks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sourceId: integer("source_id").notNull().references(() => sources.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  chunkIndex: integer("chunk_index").notNull(),
  embedding: f32Vector("embedding").notNull(),
});

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

export const insertOwnerSchema = createInsertSchema(owners);
export const selectOwnerSchema = createSelectSchema(owners);

export const insertNotebookSchema = createInsertSchema(notebooks);
export const selectNotebookSchema = createSelectSchema(notebooks);

export const insertSourceSchema = createInsertSchema(sources);
export const selectSourceSchema = createSelectSchema(sources);

export const insertSourceChunkSchema = createInsertSchema(source_chunks);
export const selectSourceChunkSchema = createSelectSchema(source_chunks);
