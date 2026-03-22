import { expect, test, describe, mock } from "bun:test";

// Mock the chunking module before importing the tool
mock.module("../../lib/chunking", () => {
  return {
    generateEmbedding: mock(async () => []),
  };
});

import { searchSourcesTool } from "./search-sources";

describe("searchSourcesTool", () => {
  test("defines expected basic tool properties", () => {
    expect(searchSourcesTool.id).toBe("search-sources");
    expect(searchSourcesTool.description).toBeDefined();
  });

  test("handles empty embedding correctly (mocked)", async () => {
    const result = await searchSourcesTool.execute({ query: "empty test", notebookId: 1 });
    expect(result).toEqual([]);
  });
});
