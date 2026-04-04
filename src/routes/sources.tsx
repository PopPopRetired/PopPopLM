/**
 * @module src/routes/sources.tsx
 *
 * Handles source lifecycle: ingestion, chunking, embedding, and deletion.
 *
 * This route is the entry point for all information added to a notebook.
 * It coordinates text extraction (from URLs, PDFs, or raw text), splits it
 * into chunks, generates vector embeddings for each chunk, and persists
 * everything to the database.
 */
import { zValidator } from "@hono/zod-validator";
import { type Context, Hono } from "hono";
import { z } from "zod";

import { SourcesPanel } from "../components/SourcesPanel";
import {
  createSource,
  createSourceChunks,
  deleteSources,
  listSourcesByNotebook,
  updateSourceTitle,
} from "../db/queries/sources";
import { chunkText, generateEmbedding } from "../lib/chunking";
import { extractContentFromUploadSource } from "../lib/ingest-source-content";
import type { AppEnv } from "../types";

const sourcesRoutes = new Hono<AppEnv>();

/** Schema for the source ingestion form. */
const uploadSourceFormSchema = z.object({
  /** Input type provided by the user. */
  type: z.enum(["text", "url", "pdf"]).optional().default("text"),
  /** User-supplied title (optional fallback). */
  title: z.string().optional(),
  /** Raw text or URL string. */
  content: z.string().optional(),
  /** Uploaded PDF file (required if type is 'pdf'). */
  file: z.instanceof(File).optional(),
});

/**
 * Internal helper: Splits text into chunks, generates embeddings, and saves to DB.
 *
 * Processes chunks sequentially to avoid overwhelming the local embedding
 * pipeline (especially if running on CPU).
 *
 * @param content  - Normalized text content to process.
 * @param sourceId - Parent source ID for these chunks.
 */
async function chunkAndEmbedContent(content: string, sourceId: number) {
  if (!content || content.trim() === "") return;

  const chunks = chunkText(content);
  const chunksToInsert = [];

  for (let i = 0; i < chunks.length; i++) {
    const textChunk = chunks[i];
    const embedding = await generateEmbedding(textChunk);

    if (embedding && embedding.length > 0) {
      chunksToInsert.push({
        sourceId,
        content: textChunk,
        chunkIndex: i,
        embedding: embedding,
      });
    }
  }

  if (chunksToInsert.length > 0) {
    await createSourceChunks(chunksToInsert);
  }
}

/**
 * Internal helper: Extracts source IDs from an HTMX DELETE request.
 *
 * Handles IDs arriving via query parameters (default) or multi-part
 * form bodies (depending on HTMX configuration).
 *
 * @param c - Hono request context.
 * @returns Array of numeric IDs to delete.
 */
async function parseSourceIdsFromRequest(c: Context): Promise<number[]> {
  let sourceIdsRaw = c.req.queries("sourceIds");

  // Fallback to parsing body if query params are empty
  if (!sourceIdsRaw || sourceIdsRaw.length === 0) {
    try {
      const body = await c.req.parseBody({ all: true });
      const bodyIds = body.sourceIds;
      if (Array.isArray(bodyIds)) {
        sourceIdsRaw = bodyIds as string[];
      } else if (typeof bodyIds === "string") {
        sourceIdsRaw = [bodyIds];
      }
    } catch {
      /* ignore empty bodies */
    }
  }

  if (!sourceIdsRaw) return [];

  return sourceIdsRaw
    .map((id) => parseInt(id, 10))
    .filter((id) => !isNaN(id));
}

/**
 * POST /:notebookId
 * Ingests a new source, handles embedding pipeline, and returns updated panel.
 */
sourcesRoutes.post(
  "/:notebookId",
  zValidator(
    "param",
    z.object({ notebookId: z.coerce.number().int().positive() }),
    (result, c) => {
      if (!result.success) return c.text("Invalid notebook", 400);
    },
  ),
  zValidator("form", uploadSourceFormSchema, (result, c) => {
    if (!result.success)
      return c.text(
        result.error.issues[0]?.message || "Invalid form values",
        400,
      );
  }),
  async (c) => {
    const { notebookId } = c.req.valid("param");
    const body = c.req.valid("form");

    // 1. Extract content based on type (URL fetch, PDF parse, etc.)
    const extracted = await extractContentFromUploadSource(
      body.type ?? "text",
      typeof body.content === "string" ? body.content : "",
      body.file instanceof File ? body.file : undefined,
      typeof body.title === "string" ? body.title : undefined,
    );

    // 2. Create the source record
    const [insertedSource] = await createSource({
      notebookId,
      title: extracted.extractedTitle,
      type: extracted.extractedType,
      content: extracted.extractedContent,
      createdAt: new Date(),
    });

    // 3. Kick off embedding pipeline
    await chunkAndEmbedContent(extracted.extractedContent, insertedSource.id);

    // 4. Return updated sources list view
    const sourcesList = await listSourcesByNotebook(notebookId);
    return c.html(
      <SourcesPanel notebookId={notebookId} sources={sourcesList} />,
    );
  },
);

/**
 * DELETE /:notebookId
 * Deletes multiple sources and returns updated panel.
 */
sourcesRoutes.delete(
  "/:notebookId",
  zValidator(
    "param",
    z.object({ notebookId: z.coerce.number().int().positive() }),
    (result, c) => {
      if (!result.success) return c.text("Invalid notebook", 400);
    },
  ),
  async (c) => {
    const { notebookId } = c.req.valid("param");
    const idsToDelete = await parseSourceIdsFromRequest(c);

    if (idsToDelete.length > 0) {
      await deleteSources(idsToDelete);
    }

    const sourcesList = await listSourcesByNotebook(notebookId);
    return c.html(
      <SourcesPanel notebookId={notebookId} sources={sourcesList} />,
    );
  },
);

/**
 * GET /:notebookId/panel
 * Fragment: Returns the current sources list for a notebook.
 */
sourcesRoutes.get(
  "/:notebookId/panel",
  zValidator(
    "param",
    z.object({ notebookId: z.coerce.number().int().positive() }),
    (result, c) => {
      if (!result.success) return c.text("Invalid notebook", 400);
    },
  ),
  async (c) => {
    const { notebookId } = c.req.valid("param");
    const sourcesList = await listSourcesByNotebook(notebookId);
    return c.html(
      <SourcesPanel notebookId={notebookId} sources={sourcesList} />,
    );
  },
);

/**
 * PATCH /:notebookId/:sourceId
 * Updates a source title and returns updated panel.
 */
sourcesRoutes.patch(
  "/:notebookId/:sourceId",
  zValidator(
    "param",
    z.object({
      notebookId: z.coerce.number().int().positive(),
      sourceId: z.coerce.number().int().positive(),
    }),
    (result, c) => {
      if (!result.success) return c.text("Invalid ID", 400);
    },
  ),
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
    return c.html(
      <SourcesPanel notebookId={notebookId} sources={sourcesList} />,
    );
  },
);

export { sourcesRoutes };
