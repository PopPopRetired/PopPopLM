import { expect, test, describe, mock } from "bun:test";
import { handleNotebookSSEStream } from "./notebook-sse-stream";
import { mastra } from "../mastra";

mock.module("./search-sources", () => ({
  searchSources: mock(() => Promise.resolve([{ title: "test", content: "context" }])),
}));

describe("notebook-sse-stream", () => {
  test("missing agent", async () => {
    const streamMock = { writeSSE: mock() };
    const originalGetAgent = mastra.getAgent;
    mastra.getAgent = () => null as any;

    await handleNotebookSSEStream("msg", 1, streamMock);

    expect(streamMock.writeSSE).toHaveBeenCalledWith({ data: "<strong class='text-error'>Agent initialization failed.</strong>" });
    mastra.getAgent = originalGetAgent;
  });
});
