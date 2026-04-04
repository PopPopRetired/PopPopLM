import { expect, test, describe, beforeEach } from "bun:test";
import { createTestDatabase, resetNotebooksTables } from "../db/test-utils";
import { createOwner, createNotebook, listNotebooksWithSourceCount } from "../db/queries/notebooks";
import type { AppDatabase } from "../db/index";
import type { FormattedNotebook } from "../types/home";

let db: AppDatabase;

beforeEach(async () => {
  db = createTestDatabase();
  await resetNotebooksTables(db);
});

/**
 * Mirrors the production getFormattedNotebooks but uses an injected test DB.
 */
const getFormattedNotebooks = async (ownerIdFilter?: number): Promise<FormattedNotebook[]> => {
  const dbNotebooks = await listNotebooksWithSourceCount(ownerIdFilter, db);
  return dbNotebooks.map((nb: any) => {
    let dateStr = "No data";
    if (nb.sources.length > 0) {
      const firstSource = nb.sources[0];
      if (firstSource && firstSource.createdAt) {
        dateStr = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(firstSource.createdAt));
      }
    }
    return {
      id: nb.id,
      title: nb.title,
      date: dateStr,
      sources: `${nb.sourceCount} sources`,
      ownerName: nb.owner.name
    };
  });
};

describe("home routes", () => {
  test("getFormattedNotebooks formats correctly", async () => {
    const [owner] = await createOwner({ name: "Test Owner" }, db);
    if (!owner) throw new Error("Failed to create owner");

    await createNotebook({ title: "Test Notebook", ownerId: owner.id }, db);

    const notebooks = await getFormattedNotebooks();
    expect(notebooks.length).toBe(1);
    expect(notebooks[0].title).toBe("Test Notebook");
    expect(notebooks[0].date).toBe("No data");
    expect(notebooks[0].ownerName).toBe("Test Owner");
  });
});
