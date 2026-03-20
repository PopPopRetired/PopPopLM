import { Hono } from "hono";
import type { AppEnv } from "../types";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createSource, deleteSources, listSourcesByNotebook, updateSourceTitle } from "../db/queries/sources";
import { SourcesPanel } from "../components/SourcesPanel";

const sourcesRoutes = new Hono<AppEnv>();

const uploadSourceFormSchema = z.object({
  type: z.enum(["text", "url", "pdf"]).optional().default("text"),
  title: z.string().optional(),
  content: z.string().optional(),
  file: z.instanceof(File).optional(),
});

sourcesRoutes.post(
  "/:notebookId",
  zValidator("param", z.object({ notebookId: z.coerce.number().int().positive() }), (result, c) => {
    if (!result.success) return c.text("Invalid notebook", 400);
  }),
  zValidator("form", uploadSourceFormSchema, (result, c) => {
    if (!result.success) return c.text(result.error.issues[0]?.message || "Invalid form values", 400);
  }),
  async (c) => {
    const { notebookId } = c.req.valid("param");
    const body = c.req.valid("form");

    let type = body.type;
    let title = typeof body.title === "string" && body.title.trim() !== "" ? body.title : "Untitled";
    let content = "";
    let fileData: Uint8Array | undefined = undefined;

    if (type === "pdf" && body.file instanceof File) {
      const arrayBuffer = await body.file.arrayBuffer();
      fileData = new Uint8Array(arrayBuffer);
      if (title === "Untitled") {
        title = body.file.name;
      }
    } else if (type === "url" || type === "text") {
      content = typeof body.content === "string" ? body.content.trim() : "";
      
      if (type === "text" && (content.startsWith("http://") || content.startsWith("https://"))) {
        type = "url";
      }

      if (title === "Untitled" || title.trim() === "") {
        if (type === "url") {
          title = content;
        } else {
          title = content.length > 40 ? content.slice(0, 37) + "..." : (content || "Untitled Text");
        }
      }
    }

    await createSource({
      notebookId,
      title,
      type,
      content,
      fileData: fileData ? Buffer.from(fileData) : undefined,
      createdAt: new Date(),
    });

    const sourcesList = await listSourcesByNotebook(notebookId);
    return c.html(<SourcesPanel notebookId={notebookId} sources={sourcesList} />);
  }
);

sourcesRoutes.delete(
  "/:notebookId",
  zValidator("param", z.object({ notebookId: z.coerce.number().int().positive() }), (result, c) => {
    if (!result.success) return c.text("Invalid notebook", 400);
  }),
  async (c) => {
    const { notebookId } = c.req.valid("param");
    
    // HTMX hx-delete sends form data as query parameters by default, but sometimes as body
    let sourceIdsRaw = c.req.queries("sourceIds");
    
    if (!sourceIdsRaw || sourceIdsRaw.length === 0) {
      try {
        const body = await c.req.parseBody({ all: true });
        const bodyIds = body.sourceIds;
        if (Array.isArray(bodyIds)) {
          sourceIdsRaw = bodyIds as string[];
        } else if (typeof bodyIds === "string") {
          sourceIdsRaw = [bodyIds];
        }
      } catch (e) {
        // ignore parse body errors if empty
      }
    }
    
    const idsToDelete: number[] = [];
    
    if (Array.isArray(sourceIdsRaw)) {
      for (const idStr of sourceIdsRaw) {
        if (typeof idStr === "string") idsToDelete.push(parseInt(idStr, 10));
      }
    } else if (typeof sourceIdsRaw === "string") {
      idsToDelete.push(parseInt(sourceIdsRaw, 10));
    }

    if (idsToDelete.length > 0) {
      await deleteSources(idsToDelete);
    }

    const sourcesList = await listSourcesByNotebook(notebookId);
    return c.html(<SourcesPanel notebookId={notebookId} sources={sourcesList} />);
  }
);

sourcesRoutes.get(
  "/:notebookId/panel",
  zValidator("param", z.object({ notebookId: z.coerce.number().int().positive() }), (result, c) => {
    if (!result.success) return c.text("Invalid notebook", 400);
  }),
  async (c) => {
    const { notebookId } = c.req.valid("param");
    const sourcesList = await listSourcesByNotebook(notebookId);
    return c.html(<SourcesPanel notebookId={notebookId} sources={sourcesList} />);
  }
);

sourcesRoutes.patch(
  "/:notebookId/:sourceId",
  zValidator("param", z.object({
    notebookId: z.coerce.number().int().positive(),
    sourceId: z.coerce.number().int().positive()
  }), (result, c) => {
    if (!result.success) return c.text("Invalid ID", 400);
  }),
  zValidator("form", z.object({ title: z.string().trim() }), (result, c) => {
    if (!result.success) return c.text("Invalid title", 400);
  }),
  async (c) => {
    const { notebookId, sourceId } = c.req.valid("param");
    const { title } = c.req.valid("form");

    if (title) {
      await updateSourceTitle(sourceId, title);
    }

    const sourcesList = await listSourcesByNotebook(notebookId);
    return c.html(<SourcesPanel notebookId={notebookId} sources={sourcesList} />);
  }
);

export { sourcesRoutes };
