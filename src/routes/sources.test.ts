import { beforeEach, describe, expect, it } from "bun:test";
import { configureTestDatabase, resetNotebooksTables } from "../db/test-utils";

configureTestDatabase(":memory:");
const { db } = await import("../db/index");
import { app } from "../index";

const formBody = (data: Record<string, string>): string =>
  new URLSearchParams(data).toString();

beforeEach(async () => {
  await resetNotebooksTables(db as any);
  await db.$client.execute(`INSERT INTO owners (id, name) VALUES (1, 'Test Owner')`);
  await db.$client.execute(`INSERT INTO notebooks (id, title, owner_id) VALUES (1, 'Test Notebook', 1)`);
});

describe("Sources Routes Validation", () => {
  it("POST /sources/:notebookId returns 400 for invalid notebookId param", async () => {
    const res = await app.request("/sources/bad-id", {
      method: "POST",
      body: formBody({ type: "text", content: "foo" }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    expect(res.status).toBe(400);
    expect(await res.text()).toBe("Invalid notebook");
  });

  it("POST /sources/:notebookId returns 400 for invalid source type in form", async () => {
    const res = await app.request("/sources/1", {
      method: "POST",
      body: formBody({ type: "INVALID_ENUM_VALUE" }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    expect(res.status).toBe(400);
    expect(await res.text()).toContain("Invalid option: expected");
  });

  it("DELETE /sources/:notebookId returns 400 for invalid ID", async () => {
    const res = await app.request("/sources/bad-delete-id", {
      method: "DELETE"
    });
    expect(res.status).toBe(400);
    expect(await res.text()).toBe("Invalid notebook");
  });

  it("PATCH /sources/:notebookId/:sourceId returns 400 for missing title", async () => {
    const res = await app.request("/sources/1/99", {
      method: "PATCH",
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    expect(res.status).toBe(400);
    expect(await res.text()).toBe("Invalid title");
  });
});
