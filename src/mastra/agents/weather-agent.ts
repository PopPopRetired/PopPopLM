/**
 * @module src/mastra/agents/weather-agent.ts
 *
 * REFERENCE EXAMPLE: An agent with dynamic tool calling.
 *
 * Demonstrates how to:
 * 1. Define an agent with specific `instructions`
 * 2. Attach a tool (`weatherTool`) for external data fetching
 * 3. Configure conversation history via `Memory()`
 *
 * NOTE: This agent is not used in the primary Notebook flow; it exists
 * as a scaffolding example for adding new capabilities.
 */
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";

import { weatherTool } from "../tools/weather-tool";

/**
 * Assistant that provides weather info by dynamically calling tools.
 */
export const weatherAgent = new Agent({
  id: "weather-agent",
  name: "Weather Agent",
  instructions: [
    "You are a helpful weather assistant that provides weather info and activity suggestions.",
    "- Always ask for a location if none is provided.",
    "- Include details like humidity, wind, and precipitation.",
    "- Use the weatherTool to fetch current weather data for the location.",
  ].join("\n"),
  model: "openai/gpt-4o-mini", // Standardizing model name from placeholder
  tools: { weatherTool },
  memory: new Memory(),
});
