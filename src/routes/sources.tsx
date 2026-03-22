import { Hono } from "hono";
import type { AppEnv } from "../types";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { createSource, createSourceChunks, deleteSources, listSourcesByNotebook, updateSourceTitle } from "../db/queries/sources";
import { chunkText, generateEmbedding } from "../lib/chunking";
import { SourcesPanel } from "../components/SourcesPanel";
import * as cheerio from "cheerio";
import { PDFParse } from "pdf-parse";
import { YoutubeTranscript } from "youtube-transcript";

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

    if (type === "pdf" && body.file instanceof File) {
      const arrayBuffer = await body.file.arrayBuffer();
      
      try {
        const parser = new PDFParse({ data: Buffer.from(arrayBuffer) });
        const textResult = await parser.getText();
        content = textResult.text.trim();
      } catch (e) {
        console.error("Failed to parse PDF", e);
        content = "Could not extract text from PDF";
      }

      if (title === "Untitled") {
        title = body.file.name;
      }
    } else if (type === "url" || type === "text") {
      const rawContent = typeof body.content === "string" ? body.content.trim() : "";
      content = rawContent;
      
      if (type === "text" && (content.startsWith("http://") || content.startsWith("https://"))) {
        type = "url";
      }

      if (type === "url") {
        try {
          // If the rawContent is not a full URL, we might want to ensure it has http:// or https://
          let fetchUrl = rawContent;
          if (!fetchUrl.startsWith("http")) {
            fetchUrl = "https://" + fetchUrl;
          }

          const isYouTube = fetchUrl.includes("youtube.com/watch") || fetchUrl.includes("youtu.be/");
          let youtubeText = "";

          if (isYouTube) {
            try {
              const transcript = await YoutubeTranscript.fetchTranscript(fetchUrl);
              youtubeText = transcript.map((t) => t.text).join(" ");
            } catch (e) {
              console.error("Failed to fetch YouTube transcript", e);
            }
          }

          const res = await fetch(fetchUrl);
          if (res.ok) {
            const html = await res.text();
            const $ = cheerio.load(html);
            
            // Extract the title if not provided
            if (title === "Untitled" || title.trim() === "") {
              const urlTitle = $("title").text().trim();
              if (urlTitle) {
                title = urlTitle;
              }
            }
            
            if (isYouTube && youtubeText) {
              content = youtubeText;
            } else {
              // remove non-content elements
              $("script, style, noscript, nav, header, footer, iframe").remove();
              const extractedText = $("body").text().replace(/\s+/g, ' ').trim();
              content = extractedText || rawContent; // store the extracted text in content
            }
          } else if (isYouTube && youtubeText) {
            content = youtubeText;
          }
        } catch (e) {
          console.error("Failed to fetch/parse URL", e);
          // Keep content as rawContent if fetch fails
        }
      }

      if (title === "Untitled" || title.trim() === "") {
        if (type === "url") {
          title = rawContent;
        } else {
          title = rawContent.length > 40 ? rawContent.slice(0, 37) + "..." : (rawContent || "Untitled Text");
        }
      }
    }

    const [insertedSource] = await createSource({
      notebookId,
      title,
      type,
      content,
      createdAt: new Date(),
    });

    if (content && content.trim() !== "") {
      const chunks = chunkText(content);
      const chunksToInsert = [];
      
      // Process sequentially to avoid instantly overwhelming a local GPT4All instance
      for (let i = 0; i < chunks.length; i++) {
        const textChunk = chunks[i];
        const embedding = await generateEmbedding(textChunk);
        if (embedding && embedding.length > 0) {
          chunksToInsert.push({
            sourceId: insertedSource.id,
            content: textChunk,
            chunkIndex: i,
            embedding: embedding
          });
        }
      }
      
      if (chunksToInsert.length > 0) {
        await createSourceChunks(chunksToInsert);
      }
    }

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
