/**
 * @module src/lib/chunking.ts
 *
 * Text splitting and embedding generation for RAG (Retrieval-Augmented Generation).
 *
 * Two responsibilities:
 * 1. `chunkText` — splits long text into overlapping windows so each fits
 *    within an embedding model's context limit.
 * 2. `generateEmbedding` — converts a text string into a 768-dimension
 *    float vector using a local Xenova/Transformers model.
 *
 * The embedding pipeline is loaded lazily on first call to avoid blocking
 * server startup (the model download + warm-up takes several seconds).
 */
import { pipeline } from "@xenova/transformers";

// ── Chunking Constants ──────────────────────────────────────────────────
/** Maximum number of words per chunk. Balances context richness vs. embedding quality. */
const DEFAULT_MAX_WORDS = 400;

/** Number of words that overlap between consecutive chunks to preserve context at boundaries. */
const DEFAULT_OVERLAP_WORDS = 50;

// ── Embedding Constants ─────────────────────────────────────────────────
/** Hugging Face model ID — a fully public, non-gated sentence-transformer (768 dims). */
const EMBEDDING_MODEL = "Xenova/all-mpnet-base-v2";

/**
 * Splits a string of text into overlapping word-based chunks.
 *
 * If the text is shorter than `maxWords`, it's returned as a single-element
 * array. Otherwise a sliding window advances by `maxWords - overlapWords`
 * words per step.
 *
 * @param text          - The raw text to split.
 * @param maxWords      - Maximum words per chunk (default {@link DEFAULT_MAX_WORDS}).
 * @param overlapWords  - Words shared between consecutive chunks (default {@link DEFAULT_OVERLAP_WORDS}).
 * @returns An array of text chunks, or an empty array if input is blank.
 */
export function chunkText(
  text: string,
  maxWords: number = DEFAULT_MAX_WORDS,
  overlapWords: number = DEFAULT_OVERLAP_WORDS,
): string[] {
  if (!text.trim()) return [];

  const words = text.split(/\s+/);
  if (words.length <= maxWords) {
    return [text];
  }

  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    const chunk = words.slice(i, i + maxWords).join(" ");
    chunks.push(chunk);
    i += maxWords - overlapWords;
  }
  return chunks;
}

/**
 * Singleton wrapper around the Xenova/Transformers feature-extraction pipeline.
 *
 * Uses the classic "lazy singleton" pattern: the model is only downloaded and
 * loaded on the first call to `getInstance()`. All subsequent calls reuse the
 * same pipeline instance. This keeps server startup fast while amortizing the
 * one-time model load cost over the first embedding request.
 */
class EmbeddingPipeline {
  static task = "feature-extraction";
  static model = EMBEDDING_MODEL;
  static instance: ReturnType<typeof pipeline> | null = null;

  static async getInstance(progressCallback?: Function) {
    if (this.instance === null) {
      this.instance = pipeline(this.task as any, this.model, {
        quantized: true,
        progress_callback: progressCallback,
      });
    }
    return this.instance;
  }
}

/**
 * Generates a 768-dimension embedding vector for the given text.
 *
 * Uses the local {@link EMBEDDING_MODEL} via {@link EmbeddingPipeline}.
 * Returns an empty array if embedding fails (e.g., model not downloaded yet
 * on first cold start) — callers should check for this.
 *
 * @param text - The text to embed.
 * @returns A number array of length 768, or `[]` on failure.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const embedder = await EmbeddingPipeline.getInstance();
    const output = await embedder(text, { pooling: "mean", normalize: true });
    return Array.from(output.data);
  } catch (err) {
    console.error("Local Embedding Pipeline Error:", err);
    return [];
  }
}
