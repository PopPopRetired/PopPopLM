import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { configureTestDatabase, resetNotebooksTables } from "../test-utils";

configureTestDatabase();

const { db } = await import("../index");
const { createOwner, createNotebook } = await import("./notebooks");
const { createSource, listSourcesByNotebook, deleteSources, updateSourceTitle } = await import("./sources");

beforeAll(async () => {
  await resetNotebooksTables(db);
});

beforeEach(async () => {
  await resetNotebooksTables(db);
});

describe("sources query helpers", () => {
  it("creates, lists, and deletes sources", async () => {
    const [owner] = await createOwner({ name: "Reader" });
    if (!owner) throw new Error("Failed to create owner");

    const [notebook] = await createNotebook({ title: "My Notes", ownerId: owner.id });
    if (!notebook) throw new Error("Failed to create notebook");

    const d1 = new Date();
    const [source1] = await createSource({
      notebookId: notebook.id,
      title: "Google",
      type: "url",
      content: "https://google.com",
      createdAt: d1
    });

    const [source2] = await createSource({
      notebookId: notebook.id,
      title: "Notes",
      type: "text",
      content: "Some notes",
      createdAt: d1
    });

    if (!source1 || !source2) throw new Error("Failed to create sources");

    const sourcesList = await listSourcesByNotebook(notebook.id);
    expect(sourcesList).toHaveLength(2);

    await deleteSources([source1.id]);
    const afterDelete = await listSourcesByNotebook(notebook.id);
    expect(afterDelete).toHaveLength(1);
    expect(afterDelete[0]?.id).toBe(source2.id);
  });

  it("updates source title", async () => {
    const [owner] = await createOwner({ name: "Renamer" });
    if (!owner) throw new Error("Failed to create owner");

    const [notebook] = await createNotebook({ title: "My Notes", ownerId: owner.id });
    if (!notebook) throw new Error("Failed to create notebook");

    const [source] = await createSource({
      notebookId: notebook.id,
      title: "Old Title",
      type: "text",
      content: "Old notes",
      createdAt: new Date()
    });
    if (!source) throw new Error("Failed to create source");

    const [updatedSource] = await updateSourceTitle(source.id, "New Title");
    expect(updatedSource?.title).toBe("New Title");

    const list = await listSourcesByNotebook(notebook.id);
    expect(list[0]?.title).toBe("New Title");
  });
});
