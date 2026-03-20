import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import type { AppEnv } from "./types";

import { homeRoutes } from "./routes/home";

import { notebookRoutes } from "./routes/notebooks";
import { sourcesRoutes } from "./routes/sources";

const app = new Hono<AppEnv>();

app.use("/public/*", serveStatic({ root: "./" }));
app.use("/node_modules/*", serveStatic({ root: "./" }));

app.route("/", homeRoutes);

app.route("/notebooks", notebookRoutes);
app.route("/sources", sourcesRoutes);

export default app;
