/**
 * @module src/mastra/index.ts
 *
 * Central orchestration point for Mastra AI features.
 *
 * This singleton instance registers all agents, workflows, and tools,
 * and configures global storage (for memory and traces), logging,
 * and observability.
 */
import { LibSQLStore } from "@mastra/libsql";
import { PinoLogger } from "@mastra/loggers";
import { Mastra } from "@mastra/core/mastra";
import {
  Observability,
  DefaultExporter,
  CloudExporter,
  SensitiveDataFilter,
} from "@mastra/observability";

import { notebookAgent } from "./agents/notebook-agent";
import { weatherAgent } from "./agents/weather-agent";
import { weatherWorkflow } from "./workflows/weather-workflow";

/**
 * The global Mastra orchestration instance.
 *
 * Shared across the app via Hono middleware to provide agents and
 * workflow execution to route handlers.
 */
export const mastra = new Mastra({
  // Register AI capabilities
  workflows: { weatherWorkflow },
  agents: { weatherAgent, notebookAgent },

  // Persistence: Stores chat memory, workflow states, and traces
  storage: new LibSQLStore({
    id: "mastra-storage",
    url: "file:./mastra.db",
  }),

  // Logging: Standard Pino logger for AI-related events
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),

  // Observability: Distributed tracing for debugging agent/workflow flows
  observability: new Observability({
    configs: {
      default: {
        serviceName: "mastra",
        exporters: [
          // Persists traces to local storage for use with Mastra Studio
          new DefaultExporter(),
          // Connects to Mastra Cloud if MASTRA_CLOUD_ACCESS_TOKEN is set
          new CloudExporter(),
        ],
        spanOutputProcessors: [
          // Automatically redacts PII and sensitive tokens from traces
          new SensitiveDataFilter(),
        ],
      },
    },
  }),
});
