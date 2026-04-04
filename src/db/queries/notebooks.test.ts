import { beforeEach, describe, expect, it } from "bun:test";
import { createTestDatabase, resetNotebooksTables } from "../test-utils";
import { createOwner, listOwners, createNotebook, listNotebooksWithSourceCount, findNotebookById } from "./notebooks";
import { createSource } from "./sources";
import type { AppDatabase } from "../index";

let db: AppDatabase;

beforeEach(async () => {
  db = createTestDatabase();
  await resetNotebooksTables(db);
});

describe("notebooks query helpers", () => {
  it("creates and lists owners", async () => {
    await createOwner({ name: "PopPop" }, db);
    await createOwner({ name: "MawMaw" }, db);

    const owners = await listOwners(db);

    expect(owners).toHaveLength(2);
    expect(owners[0]?.name).toBe("PopPop");
    expect(owners[1]?.name).toBe("MawMaw");
  });

  it("creates notebooks for a specific owner", async () => {
    const [owner] = await createOwner({ name: "PopPop" }, db);
    if (!owner) throw new Error("Failed to create owner");

    const [notebook] = await createNotebook({
      title: "Technology",
      ownerId: owner.id,
    }, db);

    expect(notebook?.title).toBe("Technology");
    expect(notebook?.ownerId).toBe(owner.id);
  });

  it("adds sources to notebooks and lists correctly with source count", async () => {
    const [owner] = await createOwner({ name: "PopPop" }, db);
    if (!owner) throw new Error("Failed to create owner");

    const [notebook1] = await createNotebook({
      title: "Recipes",
      ownerId: owner.id,
    }, db);
    if (!notebook1) throw new Error("Failed to create notebook1");

    const [notebook2] = await createNotebook({
      title: "History",
      ownerId: owner.id,
    }, db);
    if (!notebook2) throw new Error("Failed to create notebook2");

    const d1 = new Date();
    const d2 = new Date();
    await createSource({
      notebookId: notebook1.id,
      title: "Recipe 1",
      type: "text",
      content: "Cookies",
      createdAt: d1
    }, db);
    await createSource({
      notebookId: notebook1.id,
      title: "Recipe 2",
      type: "text",
      content: "Cake",
      createdAt: d2
    }, db);

    const notebooks = await listNotebooksWithSourceCount(undefined, db);

    expect(notebooks).toHaveLength(2);

    const recipesNb = notebooks.find(nb => nb.id === notebook1.id);
    const historyNb = notebooks.find(nb => nb.id === notebook2.id);

    expect(recipesNb?.sourceCount).toBe(2);
    expect(recipesNb?.owner.name).toBe("PopPop");

    expect(historyNb?.sourceCount).toBe(0);
    expect(historyNb?.owner.name).toBe("PopPop");
  });

  it("filters notebooks by ownerId", async () => {
    const [owner1] = await createOwner({ name: "PopPop" }, db);
    const [owner2] = await createOwner({ name: "MawMaw" }, db);
    if (!owner1 || !owner2) throw new Error("Failed to create owners");

    await createNotebook({ title: "PopPop's Math Notes", ownerId: owner1.id }, db);
    await createNotebook({ title: "PopPop's Tech Notes", ownerId: owner1.id }, db);
    await createNotebook({ title: "MawMaw's Recipes", ownerId: owner2.id }, db);

    const popPopNotebooks = await listNotebooksWithSourceCount(owner1.id, db);
    expect(popPopNotebooks).toHaveLength(2);
    expect(popPopNotebooks[0]?.owner.id).toBe(owner1.id);

    const mawMawNotebooks = await listNotebooksWithSourceCount(owner2.id, db);
    expect(mawMawNotebooks).toHaveLength(1);
    expect(mawMawNotebooks[0]?.owner.id).toBe(owner2.id);
  });

  it("finds a notebook by its id", async () => {
    const [owner] = await createOwner({ name: "PopPop" }, db);
    if (!owner) throw new Error("Failed to create owner");

    const [notebook] = await createNotebook({
      title: "Science",
      ownerId: owner.id,
    }, db);

    if (!notebook) throw new Error("Failed to create notebook");

    const found = await findNotebookById(notebook.id, db);
    expect(found?.title).toBe("Science");
    expect(found?.id).toBe(notebook.id);

    const notFound = await findNotebookById(999999, db);
    expect(notFound).toBeUndefined();
  });
});
