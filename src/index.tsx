import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import type { AppEnv } from "./types";

import { homeRoutes } from "./routes/home";

import { notebookRoutes } from "./routes/notebooks";
import { sourcesRoutes } from "./routes/sources";

export const app = new Hono<AppEnv>();

app.use("/public/*", serveStatic({ root: "./" }));
app.use("/node_modules/*", serveStatic({ root: "./" }));

app.route("/", homeRoutes);

app.route("/notebooks", notebookRoutes);
app.route("/sources", sourcesRoutes);

export default {
  port: 3000,
  fetch: app.fetch,
  idleTimeout: 120, // 120 seconds to allow slow local CPU Generation
};
