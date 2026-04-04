/**
 * @module src/types.ts
 *
 * Core application-wide environment and context typing.
 *
 * Defines the cross-cutting `AppEnv` shared between Hono routes,
 * middleware, and Mastra agent integrations.
 */
import type { Mastra } from "@mastra/core/mastra";

/**
 * Hono environment environment variables and context variables.
 *
 * This type is passed to `new Hono<AppEnv>()` to provide type safety
 * on `c.var.mastra` inside route handlers.
 */
export type AppEnv = {
  Variables: {
    /** Global Mastra AI orchestration instance. */
    mastra: Mastra;
  };
};
