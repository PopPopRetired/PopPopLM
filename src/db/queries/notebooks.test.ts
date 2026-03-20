import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { configureTestDatabase, resetNotebooksTables } from "../test-utils";

configureTestDatabase();

const { db } = await import("../index");
const {
  createOwner,
  listOwners,
  createNotebook,
  listNotebooksWithSourceCount,
} = await import("./notebooks");
const { createSource } = await import("./sources");

beforeAll(async () => {
  await resetNotebooksTables(db);
});

beforeEach(async () => {
  await resetNotebooksTables(db);
});

describe("notebooks query helpers", () => {
  it("creates and lists owners", async () => {
    await createOwner({ name: "PopPop" });
    await createOwner({ name: "MawMaw" });

    const owners = await listOwners();

    expect(owners).toHaveLength(2);
    expect(owners[0]?.name).toBe("PopPop");
    expect(owners[1]?.name).toBe("MawMaw");
  });

  it("creates notebooks for a specific owner", async () => {
    const [owner] = await createOwner({ name: "PopPop" });
    if (!owner) throw new Error("Failed to create owner");

    const [notebook] = await createNotebook({
      title: "Technology",
      ownerId: owner.id,
    });

    expect(notebook?.title).toBe("Technology");
    expect(notebook?.ownerId).toBe(owner.id);
  });

  it("adds sources to notebooks and lists correctly with source count", async () => {
    const [owner] = await createOwner({ name: "PopPop" });
    if (!owner) throw new Error("Failed to create owner");

    const [notebook1] = await createNotebook({
      title: "Recipes",
      ownerId: owner.id,
    });
    if (!notebook1) throw new Error("Failed to create notebook1");

    const [notebook2] = await createNotebook({
      title: "History",
      ownerId: owner.id,
    });
    if (!notebook2) throw new Error("Failed to create notebook2");

    // Add 2 sources to notebook1
    const d1 = new Date();
    const d2 = new Date();
    await createSource({ 
        notebookId: notebook1.id, 
        title: "Recipe 1", 
        type: "text", 
        content: "Cookies", 
        createdAt: d1 
    });
    await createSource({ 
        notebookId: notebook1.id, 
        title: "Recipe 2", 
        type: "text", 
        content: "Cake", 
        createdAt: d2 
    });

    // list owners and notebooks (no filter)
    const notebooks = await listNotebooksWithSourceCount();
    
    expect(notebooks).toHaveLength(2);

    const recipesNb = notebooks.find(nb => nb.id === notebook1.id);
    const historyNb = notebooks.find(nb => nb.id === notebook2.id);

    expect(recipesNb?.sourceCount).toBe(2);
    expect(recipesNb?.owner.name).toBe("PopPop");
    
    expect(historyNb?.sourceCount).toBe(0);
    expect(historyNb?.owner.name).toBe("PopPop");
  });

  it("filters notebooks by ownerId", async () => {
    const [owner1] = await createOwner({ name: "PopPop" });
    const [owner2] = await createOwner({ name: "MawMaw" });
    if (!owner1 || !owner2) throw new Error("Failed to create owners");

    await createNotebook({ title: "PopPop's Math Notes", ownerId: owner1.id });
    await createNotebook({ title: "PopPop's Tech Notes", ownerId: owner1.id });
    await createNotebook({ title: "MawMaw's Recipes", ownerId: owner2.id });

    // filter by owner1
    const popPopNotebooks = await listNotebooksWithSourceCount(owner1.id);
    expect(popPopNotebooks).toHaveLength(2);
    expect(popPopNotebooks[0]?.owner.id).toBe(owner1.id);
    
    // filter by owner2
    const mawMawNotebooks = await listNotebooksWithSourceCount(owner2.id);
    expect(mawMawNotebooks).toHaveLength(1);
    expect(mawMawNotebooks[0]?.owner.id).toBe(owner2.id);
  });
});
