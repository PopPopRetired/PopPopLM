/**
 * @module src/mastra/agents/notebook-agent.ts
 *
 * The primary agent for the Notebook experience.
 *
 * Responsible for synthesizing RAG context (fetched via `lib/search-sources.ts`)
 * into helpful chat responses. This agent uses conversational memory,
 * allowing it to handle follow-up questions effectively.
 */
import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";

/**
 * Assistant configured for source-based question answering.
 *
 * System instructions emphasize synthesizing the user's background notes
 * rather than drawing solely from general model knowledge.
 */
export const notebookAgent = new Agent({
  id: "notebookAgent",
  name: "Notebook Agent",
  instructions: [
    "You are a helpful assistant that answers questions using the User's provided background context notes.",
    "Synthesize the provided snippets to answer the User's question comprehensively.",
    "If the provided context is completely unrelated and contains absolutely no helpful information, state that you don't have enough information.",
  ].join("\n"),
  model: openai("gpt-4o-mini"),
  // Enable per-thread conversation history persistence
  memory: new Memory(),
});
