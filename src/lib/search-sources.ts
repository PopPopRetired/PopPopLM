/**
 * @module src/lib/search-sources.ts
 *
 * Vector similarity search over a notebook's source chunks.
 *
 * This is the "retrieval" half of RAG: given a user query, embed it into a
 * vector, then find the most semantically similar chunks stored in the database
 * using cosine distance. The results are passed to the AI agent as context.
 *
 * Uses libSQL's built-in `vector_distance_cos` function for in-database
 * vector search — no external vector DB required.
 */
import { eq, sql } from "drizzle-orm";

import { db } from "../db";
import { source_chunks, sources } from "../db/schema";
import { generateEmbedding } from "./chunking";

/**
 * Maximum number of chunks to return from a search.
 * OpenAI models handle large contexts well, so we send the top 10 chunks
 * to maximize the chance of including the relevant information.
 */
const MAX_SEARCH_RESULTS = 10;

/**
 * Searches a notebook's source chunks for content relevant to the query.
 *
 * @param query      - The user's chat message to find relevant context for.
 * @param notebookId - Scopes the search to chunks belonging to this notebook's sources.
 * @returns The top {@link MAX_SEARCH_RESULTS} chunks, ordered by cosine similarity (closest first).
 */
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
    .orderBy(
      sql`vector_distance_cos(${source_chunks.embedding}, vector(${stringifiedVector}))`,
    )
    .limit(MAX_SEARCH_RESULTS);
}
