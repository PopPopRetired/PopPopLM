import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { Memory } from "@mastra/memory";

export const notebookAgent = new Agent({
  id: "notebookAgent",
  name: "Notebook Agent",
  instructions: "You are a helpful assistant that answers questions using the User's provided background context notes. Synthesize the provided snippets to answer the User's question comprehensively. If the provided context is completely unrelated and contains absolutely no helpful information, state that you don't have enough information.",
  model: openai('gpt-4o-mini'), 
  memory: new Memory(),
});
