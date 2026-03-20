import { eq } from "drizzle-orm";
import { db } from "../index";
import { notebooks, owners } from "../schema";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const insertOwnerSchema = createInsertSchema(owners);
export const selectOwnerSchema = createSelectSchema(owners);
export type InsertOwner = z.infer<typeof insertOwnerSchema>;
export type SelectOwner = z.infer<typeof selectOwnerSchema>;

export const insertNotebookSchema = createInsertSchema(notebooks);
export const selectNotebookSchema = createSelectSchema(notebooks);
export type InsertNotebook = z.infer<typeof insertNotebookSchema>;
export type SelectNotebook = z.infer<typeof selectNotebookSchema>;


export async function listNotebooksWithSourceCount(ownerIdFilter?: number) {
  let query = db.query.notebooks.findMany({
    where: ownerIdFilter ? eq(notebooks.ownerId, ownerIdFilter) : undefined,
    with: {
      owner: true,
      sources: {
        columns: {
          fileData: false
        }
      }
    },
  });
  
  const results = await query;
  return results.map(nb => ({
    ...nb,
    sourceCount: nb.sources.length
  }));
}

export async function listOwners() {
  return db.select().from(owners);
}

export async function createOwner(data: InsertOwner) {
  return db.insert(owners).values(data).returning();
}

export async function createNotebook(data: InsertNotebook) {
  return db.insert(notebooks).values(data).returning();
}

export async function updateNotebookTitle(id: number, title: string) {
  return db.update(notebooks)
    .set({ title })
    .where(eq(notebooks.id, id))
    .returning();
}


