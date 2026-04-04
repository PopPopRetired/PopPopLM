import { beforeEach, describe, expect, it } from "bun:test";
import { createTestDatabase, resetNotebooksTables } from "../test-utils";
import { createOwner, createNotebook } from "./notebooks";
import { createSource, listSourcesByNotebook, deleteSources, updateSourceTitle } from "./sources";
import type { AppDatabase } from "../index";

let db: AppDatabase;

beforeEach(async () => {
  db = createTestDatabase();
  await resetNotebooksTables(db);
});

describe("sources query helpers", () => {
  it("creates, lists, and deletes sources", async () => {
    const [owner] = await createOwner({ name: "Reader" }, db);
    if (!owner) throw new Error("Failed to create owner");

    const [notebook] = await createNotebook({ title: "My Notes", ownerId: owner.id }, db);
    if (!notebook) throw new Error("Failed to create notebook");

    const d1 = new Date();
    const [source1] = await createSource({
      notebookId: notebook.id,
      title: "Google",
      type: "url",
      content: "https://google.com",
      createdAt: d1
    }, db);

    const [source2] = await createSource({
      notebookId: notebook.id,
      title: "Notes",
      type: "text",
      content: "Some notes",
      createdAt: d1
    }, db);

    if (!source1 || !source2) throw new Error("Failed to create sources");

    const sourcesList = await listSourcesByNotebook(notebook.id, db);
    expect(sourcesList).toHaveLength(2);

    await deleteSources([source1.id], db);
    const afterDelete = await listSourcesByNotebook(notebook.id, db);
    expect(afterDelete).toHaveLength(1);
    expect(afterDelete[0]?.id).toBe(source2.id);
  });

  it("updates source title", async () => {
    const [owner] = await createOwner({ name: "Renamer" }, db);
    if (!owner) throw new Error("Failed to create owner");

    const [notebook] = await createNotebook({ title: "My Notes", ownerId: owner.id }, db);
    if (!notebook) throw new Error("Failed to create notebook");

    const [source] = await createSource({
      notebookId: notebook.id,
      title: "Old Title",
      type: "text",
      content: "Old notes",
      createdAt: new Date()
    }, db);
    if (!source) throw new Error("Failed to create source");

    const [updatedSource] = await updateSourceTitle(source.id, "New Title", db);
    expect(updatedSource?.title).toBe("New Title");

    const list = await listSourcesByNotebook(notebook.id, db);
    expect(list[0]?.title).toBe("New Title");
  });
});
