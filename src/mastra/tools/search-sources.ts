import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { generateEmbedding } from "../../lib/chunking";
import { db } from "../../db";
import { source_chunks, sources } from "../../db/schema";
import { sql, eq } from "drizzle-orm";

export async function searchSources(query: string, notebookId: number) {
  const embedding = await generateEmbedding(query);

  if (!embedding || embedding.length === 0) {
    return [];
  }

  const stringifiedVector = JSON.stringify(embedding);

  return db
    .select({
      content: source_chunks.content,
      title: sources.title,
    })
    .from(source_chunks)
    .innerJoin(sources, sql`${sources.id} = ${source_chunks.sourceId}`)
    .where(eq(sources.notebookId, notebookId))
    .orderBy(sql`vector_distance_cos(${source_chunks.embedding}, vector(${stringifiedVector}))`)
    .limit(10); // OpenAI handles massive context natively, send top 10 chunks
}

export const searchSourcesTool = createTool({
  id: "search-sources",
  description: "Searches the user's notebooks for background context. Always use this to answer questions about the user's notes.",
  inputSchema: z.object({
    query: z.string().describe("The search query to find relevant notes for."),
    notebookId: z.number().describe("The ID of the notebook to search within."),
  }),
  outputSchema: z.array(
    z.object({
      content: z.string(),
      title: z.string(),
    })
  ),
  execute: async ({ query, notebookId }) => {
    return searchSources(query, notebookId);
  },
});
