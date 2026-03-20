import { eq, inArray } from "drizzle-orm";
import { db } from "../index";
import { sources } from "../schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const insertSourceSchema = createInsertSchema(sources);
export const selectSourceSchema = createSelectSchema(sources);
export type InsertSource = z.infer<typeof insertSourceSchema>;
export type SelectSource = z.infer<typeof selectSourceSchema>;

export async function createSource(data: InsertSource) {
  return db.insert(sources).values(data).returning();
}

export async function listSourcesByNotebook(notebookId: number): Promise<SelectSource[]> {
  const results = await db.select({
    id: sources.id,
    notebookId: sources.notebookId,
    title: sources.title,
    type: sources.type,
    content: sources.content,
    createdAt: sources.createdAt
  }).from(sources).where(eq(sources.notebookId, notebookId));

  return results.map(r => ({ ...r, fileData: null }));
}

export async function deleteSources(sourceIds: number[]) {
  if (sourceIds.length === 0) return [];
  return db.delete(sources).where(inArray(sources.id, sourceIds)).returning();
}

export async function updateSourceTitle(sourceId: number, newTitle: string) {
  return db
    .update(sources)
    .set({ title: newTitle })
    .where(eq(sources.id, sourceId))
    .returning();
}
