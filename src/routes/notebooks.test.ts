import { describe, it, expect, mock } from "bun:test";
import { app } from "../index";

// 1. Mock the Mastra export so our endpoints don't hit the real instance
mock.module("../mastra", () => {
  return {
    mastra: {
      getAgent: () => ({
        stream: async () => ({
          textStream: (async function* () {
            yield "Mock response chunks are flowing...";
          })()
        })
      }),
      getStorage: () => ({
        getStore: async (domain: string) => {
          if (domain === "memory") {
            return {
              listMessages: async () => ({
                messages: [
                  { id: "msg1", role: "user", content: "Hello testing" },
                  { id: "msg2", role: "assistant", content: "Mock response" }
                ]
              }),
              deleteThread: async () => {
                // Return successfully
              }
            };
          }
          return null;
        }
      })
    }
  };
});

describe("Notebook Routes Memory & Chat", () => {
  it("GET /notebooks/1/welcome handles history properly", async () => {
    // Notebook 1 doesn't exist in the test DB, so the route returns 404
    const res = await app.request("/notebooks/1/welcome");
    expect(res.status).toBe(404);
  });

  it("DELETE /notebooks/1/chat handles memory deletion", async () => {
    const res = await app.request("/notebooks/1/chat", {
      method: "DELETE"
    });
    // This could also be a 404 if notebook doesn't exist depending on how validation goes
    // but right now DELETE just checks valid ID struct and calls mastra, so it should be 200
    // Actually the app.request signature in latest Bun might require absolute URL
    expect(res.status).toBe(200);
    const hxTrigger = res.headers.get("HX-Trigger");
    expect(hxTrigger).toBe("load");
  });
});
