import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { NotebookView, NotebookTitleInput } from "../views/notebook";
import { db } from "../db/index";
import { eq } from "drizzle-orm";
import { notebooks } from "../db/schema";
import { listSourcesByNotebook } from "../db/queries/sources";
import { createNotebook, updateNotebookTitle } from "../db/queries/notebooks";

const notebookRoutes = new Hono();

notebookRoutes.post(
  "/",
  zValidator("form", z.object({ ownerId: z.coerce.number().int().positive() }), (result, c) => {
    if (!result.success) return c.text("Invalid Owner ID", 400);
  }),
  async (c) => {
    const { ownerId } = c.req.valid("form");
    const [notebook] = await createNotebook({ title: "Untitled Notebook", ownerId });
    c.header("HX-Redirect", `/notebooks/${notebook.id}`);
    return c.text("Redirecting...");
  }
);

notebookRoutes.post(
  "/:id/title",
  zValidator("param", z.object({ id: z.coerce.number().int().positive() }), (result, c) => {
    if (!result.success) return c.text("Invalid Notebook ID", 400);
  }),
  zValidator("form", z.object({ title: z.string().min(1) }), (result, c) => {
    if (!result.success) return c.text("Invalid title", 400);
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const { title } = c.req.valid("form");
    
    await updateNotebookTitle(id, title);
    return c.html(<NotebookTitleInput notebookId={id} title={title} />);
  }
);

notebookRoutes.get(
  "/:id",
  zValidator("param", z.object({ id: z.coerce.number().int().positive() }), (result, c) => {
    if (!result.success) return c.text("Invalid Notebook ID", 400);
  }),
  async (c) => {
    const { id } = c.req.valid("param");

    const notebookData = await db.query.notebooks.findFirst({
      where: eq(notebooks.id, id),
    });

    if (!notebookData) {
      return c.text("Notebook not found", 404);
    }

    const sources = await listSourcesByNotebook(id);

    return c.html(<NotebookView notebookId={id} title={notebookData.title} sources={sources} />);
  }
);

export { notebookRoutes };
