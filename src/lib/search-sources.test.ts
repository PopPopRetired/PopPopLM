import { expect, test, describe, mock } from "bun:test";

// Mock the chunking module before importing the function
mock.module("./chunking", () => {
  return {
    generateEmbedding: mock(async () => []),
  };
});

import { searchSources } from "./search-sources";

describe("searchSources", () => {
  test("handles empty embedding correctly (mocked)", async () => {
    const result = await searchSources("empty test", 1);
    expect(result).toEqual([]);
  });
});
