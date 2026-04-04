/**
 * @module src/lib/notebook-sse-stream.ts
 *
 * Handles the end-to-end RAG (Retrieval-Augmented Generation) streaming
 * pipeline for notebook chat. This is the core AI interaction flow:
 *
 * 1. Search the notebook's source chunks for content relevant to the user's message
 * 2. Inject that context as a system-level prompt (avoids bloating message memory)
 * 3. Stream the agent's response token-by-token over SSE to the client
 *
 * Called from the `GET /notebooks/:id/stream` route via HTMX SSE extension.
 */
import { mastra } from "../mastra";
import { searchSources } from "./search-sources";

/**
 * Runs the RAG pipeline and streams the AI response over an SSE connection.
 *
 * @param msg        - The user's chat message.
 * @param notebookId - The notebook ID, used for both RAG search scope and memory thread.
 * @param stream     - The Hono SSE stream writer (from `streamSSE`).
 */
export async function handleNotebookSSEStream(
  msg: string,
  notebookId: number,
  stream: any, // Hono's SSEStreamingApi type — not exported, so we use `any`
) {
  try {
    // Step 0: Get the notebook agent from Mastra
    const agent = mastra.getAgent("notebookAgent");
    if (!agent) {
      await stream.writeSSE({
        data: "<strong class='text-error'>Agent initialization failed.</strong>",
      });
      return;
    }

    // Step 1: Fetch RAG context — vector search over the notebook's source chunks
    // We do this manually instead of relying on tool-calling because local models
    // are unreliable at deciding when/how to call tools.
    const results = await searchSources(msg, notebookId);
    let contextText = results
      .map((r) => `[From ${r.title}]:\n${r.content}`)
      .join("\n\n");
    if (!contextText) {
      contextText = "No relevant context found in this notebook.";
    }

    // Step 2: Wrap context as a system message so it doesn't get saved into
    //         the conversation memory (which would bloat future requests).
    const systemPrompt = `BACKGROUND CONTEXT:\n${contextText}`;
    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: msg },
    ];

    // Step 3: Stream the response, using the notebookId as the memory thread
    //         so conversation history persists across page reloads.
    console.log(
      `[RAG] Streaming to OpenAI with memory thread ${notebookId}...`,
    );

    const result = await agent.stream(messages, {
      memory: {
        thread: String(notebookId),
        resource: "notebook-user",
      },
    });

    for await (const chunk of result.textStream) {
      // Replace newlines with <br/> so they render correctly in the HTML stream
      const browserChunk = chunk.replace(/\n/g, "<br/>");
      await stream.writeSSE({ data: browserChunk });
    }

    // Send a close event to cleanly terminate the EventSource connection.
    // Without this, the browser's EventSource auto-reconnects infinitely.
    await stream.writeSSE({ event: "close", data: "" });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Connection failed";
    console.error("AI Stream Error:", err);
    await stream.writeSSE({
      data: `<strong class='text-error'>AI Error: ${message}</strong>`,
    });
  }
}
