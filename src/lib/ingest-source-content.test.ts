import { expect, test, describe, mock, beforeAll } from "bun:test";
import { extractContentFromUploadSource } from "./ingest-source-content";

// Setup global mock for fetch
const globalFetchMock = mock(() => Promise.resolve(new Response(
  "<html><head><title>MockTitle</title></head><body><p>MockContent</p></body></html>",
  { status: 200 }
)));

describe("ingest-source-content", () => {
  beforeAll(() => {
    global.fetch = globalFetchMock as any;
  });

  test("text ingestion defaults title and type", async () => {
    const { extractedType, extractedTitle, extractedContent } = await extractContentFromUploadSource("text", "hello world", undefined, "Untitled");
    expect(extractedTitle).toBe("hello world");
    expect(extractedContent).toBe("hello world");
    expect(extractedType).toBe("text");
  });

  test("url ingestion with mock fetch extracts html body", async () => {
    const { extractedType, extractedTitle, extractedContent } = await extractContentFromUploadSource("url", "https://example.com");
    expect(extractedTitle).toBe("MockTitle");
    expect(extractedContent).toBe("MockContent");
  });
});
