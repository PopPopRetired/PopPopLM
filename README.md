# PopPopLM

PopPopLM is a lightning-fast, locally-hosted Retrieval-Augmented Generation (RAG) notebook application engineered for optimal performance on macOS.

Built on an incredibly modern, lightweight stack, it extracts and embeds documents entirely offline for maximum privacy and cost-efficiency, while seamlessly offloading the heavy text-generation lifting to lightning-fast cloud LLMs.

## 🚀 Tech Stack
- **Backend**: Bun + Hono
- **AI Orchestration**: Mastra v1.x + `@ai-sdk/openai`
- **Embeddings**: `@xenova/transformers` (WASM, 100% Offline)
- **Database**: Turso libSQL + Drizzle ORM (with native `vector_distance_cos` search)
- **Frontend**: HTMX v2 (Server-Sent Events) + Alpine.js v3
- **Styling**: Tailwind CSS v4 + DaisyUI v5

## 🧠 Hybrid AI Architecture
1. **Local Extraction**: Paste a URL or upload a PDF. The backend chunks the text and utilizes `@xenova/transformers` to generate mathematical vector embeddings completely locally, putting zero strain on external APIs and securing your data privacy.
2. **Local RAG Search**: When you ask a question, the agent performs an instant cosine similarity search against the embedded `libSQL` SQLite database to retrieve the top 10 most contextually relevant paragraphs.
3. **Cloud Generation**: To bypass the severe rendering bottlenecks of local LLM CPU inference on older Macs, the system instantly beams the context to `gpt-4o-mini` (or your chosen provider) using the Vercel AI SDK.
4. **Instant UI Streaming**: The exact millisecond the cloud starts responding, characters are caught via an EventSource streamer in Hono and injected live word-by-word into the browser using simple HTMX `sse-swap` attributes without a virtual DOM.

## 📦 Setup & Installation

### Prerequisites
- [Bun](https://bun.sh/)
- An OpenAI API Key

### 1. Install Dependencies
```sh
bun install
```

### 2. Configure Environment
Create a `.env` file in the root directory and add your API credentials:
```env
OPENAI_API_KEY="sk-proj-..."
```

### 3. Initialize Database
Push the schema to your local libSQL instance:
```sh
bun run db:push
```

### 4. Run the Application
Start the CSS watcher and the Hono backend side-by-side in two separate terminal windows.

**Terminal 1 (CSS Compiler for Tailwind 4 & DaisyUI):**
```sh
bun run css
```

**Terminal 2 (Web Server):**
```sh
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
