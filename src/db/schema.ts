import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
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

export const sourcesRelations = relations(sources, ({ one }) => ({
  notebook: one(notebooks, {
    fields: [sources.notebookId],
    references: [notebooks.id],
  }),
}));

export const insertOwnerSchema = createInsertSchema(owners);
export const selectOwnerSchema = createSelectSchema(owners);

export const insertNotebookSchema = createInsertSchema(notebooks);
export const selectNotebookSchema = createSelectSchema(notebooks);

export const insertSourceSchema = createInsertSchema(sources);
export const selectSourceSchema = createSelectSchema(sources);
