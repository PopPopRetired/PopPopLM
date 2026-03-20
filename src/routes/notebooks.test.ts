import { beforeEach, describe, expect, it } from "bun:test";
import { configureTestDatabase, resetNotebooksTables } from "../db/test-utils";

configureTestDatabase(":memory:");
const { db } = await import("../db/index");
const { default: app } = await import("../index");

const formBody = (data: Record<string, string>): string =>
  new URLSearchParams(data).toString();

beforeEach(async () => {
  await resetNotebooksTables(db as any);
  await db.$client.execute(`INSERT INTO owners (id, name) VALUES (1, 'Test Owner')`);
  await db.$client.execute(`INSERT INTO notebooks (id, title, owner_id) VALUES (1, 'Test Notebook', 1)`);
});

describe("Notebooks Routes Validation", () => {
  it("POST /notebooks returns 400 for invalid/missing ownerId form input", async () => {
    const res = await app.request("/notebooks", {
      method: "POST",
      body: formBody({ ownerId: "not-a-number" }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    expect(res.status).toBe(400); 
    expect(await res.text()).toEqual("Invalid Owner ID");
  });

  it("POST /notebooks successfully redirects for valid ownerId", async () => {
    const res = await app.request("/notebooks", {
      method: "POST",
      body: formBody({ ownerId: "1" }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("HX-Redirect")).toContain("/notebooks/");
  });

  it("GET /notebooks/:id returns 400 for invalid param type", async () => {
    const res = await app.request("/notebooks/not-an-id");
    expect(res.status).toBe(400);
    expect(await res.text()).toContain("Invalid Notebook ID");
  });

  it("GET /notebooks/:id renders successfully for valid ID", async () => {
    const res = await app.request("/notebooks/1");
    expect(res.status).toBe(200);
    expect(await res.text()).toContain("Test Notebook");
  });

  it("POST /notebooks/:id/title returns 400 for empty string input", async () => {
    const res = await app.request("/notebooks/1/title", {
      method: "POST",
      body: formBody({ title: "" }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    expect(res.status).toBe(400);
    expect(await res.text()).toBe("Invalid title");
  });
});
