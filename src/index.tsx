/**
 * @module src/index.tsx
 *
 * Main entry point for the PopPopLM Hono application.
 *
 * This file:
 * 1. Initializes the core Hono application instance with the AppEnv.
 * 2. Configures static file serving for CSS and dependencies.
 * 3. Registers all primary route groups (home, notebooks, sources).
 * 4. Configures the Bun-native server with an extended idleTimeout (to
 *    support long-running local AI generation).
 */
import { Hono } from "hono";
import { serveStatic } from "hono/bun";

import { homeRoutes } from "./routes/home";
import { notebookRoutes } from "./routes/notebooks";
import { sourcesRoutes } from "./routes/sources";
import type { AppEnv } from "./types";

export const app = new Hono<AppEnv>();

// Serve static assets and node_modules for frontend dependencies
app.use("/public/*", serveStatic({ root: "./" }));
app.use("/node_modules/*", serveStatic({ root: "./" }));

// Register feature-based route groups
app.route("/", homeRoutes);
app.route("/notebooks", notebookRoutes);
app.route("/sources", sourcesRoutes);

export default {
  port: 3000,
  fetch: app.fetch,
  /**
   * Keep-alive timeout in seconds.
   * Increased to 120s to prevent premature socket closure during heavy
   * local LLM inference or embedding generation.
   */
  idleTimeout: 120,
};
