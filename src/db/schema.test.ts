import { describe, expect, it } from "bun:test";
import { insertOwnerSchema, insertNotebookSchema, insertSourceSchema } from "./schema";

describe("Zod Schema Validation", () => {


  describe("Owners Table Schema", () => {
    it("validates valid owner names", () => {
      const result = insertOwnerSchema.safeParse({ name: "James Owner" });
      expect(result.success).toBe(true);
    });

    it("rejects missing names", () => {
      const result = insertOwnerSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("Notebooks Table Schema", () => {
    it("validates complete notebook objects", () => {
      const result = insertNotebookSchema.safeParse({
        title: "My React Study Notes",
        ownerId: 2,
      });
      expect(result.success).toBe(true);
    });

    it("rejects notebooks without an ownerId linkage", () => {
      const result = insertNotebookSchema.safeParse({ title: "Orphan Notebook" });
      expect(result.success).toBe(false);
      if (!result.success) {
         expect(result.error.issues[0]?.path).toContain("ownerId");
      }
    });
  });

  describe("Sources Table Schema", () => {
    it("validates valid text source insertions", () => {
      const result = insertSourceSchema.safeParse({
        notebookId: 10,
        title: "Important Snippet",
        type: "text",
        content: "const a = 1;",
        createdAt: new Date(),
      });
      expect(result.success).toBe(true);
    });

    it("rejects sources without a required type", () => {
      const result = insertSourceSchema.safeParse({
        notebookId: 10,
        title: "Important Snippet",
        createdAt: new Date(),
      });
      expect(result.success).toBe(false);
    });
  });
});
