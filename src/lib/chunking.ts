export function chunkText(text: string, maxWords: number = 400, overlapWords: number = 50): string[] {
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
    i += (maxWords - overlapWords);
  }
  return chunks;
}

import { pipeline } from '@xenova/transformers';

class EmbeddingPipeline {
  static task = 'feature-extraction';
  static model = 'Xenova/all-mpnet-base-v2'; // Fully public, non-gated model (768 dimensions)
  static instance: any = null;

  static async getInstance(progress_callback?: Function) {
    if (this.instance === null) {
      // Lazy load the pipeline and model
      this.instance = await pipeline(this.task as any, this.model, { 
        quantized: true, 
        progress_callback 
      });
    }
    return this.instance;
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const embedder = await EmbeddingPipeline.getInstance();
    const output = await embedder(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch (err) {
    console.error("Local Embedding Pipeline Error:", err);
    return [];
  }
}
