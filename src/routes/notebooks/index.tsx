/**
 * @module src/routes/notebooks/index.tsx
 *
 * Orchestrates the notebook viewing experience.
 *
 * This module coordinates:
 * 1. Notebook lifecycle (create, update title, delete)
 * 2. Chat history and AI-generated welcome panel
 * 3. SSE streaming for RAG-powered chat
 * 4. UI composition via Hono JSX views and HTMX fragments
 */
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { z } from "zod";

import { ChatPostFragment } from "../../components/notebook/chat-post-fragment";
import { ClearChatLoader } from "../../components/notebook/clear-chat-loader";
import { EmptyState } from "../../components/notebook/empty-state";
import { ErrorState } from "../../components/notebook/error";
import { ChatHistory } from "../../components/notebook/history";
import { WelcomePanel } from "../../components/notebook/welcome-panel";
import {
  createNotebook,
  deleteNotebook,
  findNotebookById,
  updateNotebookTitle,
} from "../../db/queries/notebooks";
import { listSourcesByNotebook } from "../../db/queries/sources";
import { handleNotebookSSEStream } from "../../lib/notebook-sse-stream";
import { parseMastraMessageContent } from "../../lib/mastra-message-content";
import {
  getWelcomePrompt,
  parseWelcomeAgentResponse,
} from "../../lib/notebook-welcome";
import { mastra } from "../../mastra";
import type { AppEnv } from "../../types";
import { NotebookTitleInput, NotebookView } from "../../views/notebook";

const notebookRoutes = new Hono<AppEnv>();

/** Max characters per source to include in the welcome analysis prompt. */
const SOURCE_PREVIEW_LENGTH = 1500;

/**
 * POST /
 * Creates a new notebook and redirects to its detail page.
 */
notebookRoutes.post(
  "/",
  zValidator(
    "form",
    z.object({ ownerId: z.coerce.number().int().positive() }),
    (result, c) => {
      if (!result.success) return c.text("Invalid Owner ID", 400);
    },
  ),
  async (c) => {
    const { ownerId } = c.req.valid("form");
    const [notebook] = await createNotebook({
      title: "Untitled Notebook",
      ownerId,
    });
    c.header("HX-Redirect", `/notebooks/${notebook.id}`);
    return c.text("Redirecting...");
  },
);

/**
 * POST /:id/title
 * Updates a notebook's title via inline edit.
 */
notebookRoutes.post(
  "/:id/title",
  zValidator(
    "param",
    z.object({ id: z.coerce.number().int().positive() }),
    (result, c) => {
      if (!result.success) return c.text("Invalid Notebook ID", 400);
    },
  ),
  zValidator("form", z.object({ title: z.string().min(1) }), (result, c) => {
    if (!result.success) return c.text("Invalid title", 400);
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const { title } = c.req.valid("form");

    await updateNotebookTitle(id, title);
    return c.html(<NotebookTitleInput notebookId={id} title={title} />);
  },
);

/**
 * DELETE /:id
 * Deletes a notebook and redirects to home.
 */
notebookRoutes.delete(
  "/:id",
  zValidator(
    "param",
    z.object({ id: z.coerce.number().int().positive() }),
    (result, c) => {
      if (!result.success) return c.text("Invalid Notebook ID", 400);
    },
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const notebook = await findNotebookById(id);
    if (!notebook) return c.text("Notebook not found", 404);

    await deleteNotebook(id);
    c.header("HX-Redirect", "/");
    return c.text("Deleted");
  },
);

/**
 * POST /:id/chat
 * Fragment: Renders the user's message bubble and triggers the SSE stream.
 */
notebookRoutes.post(
  "/:id/chat",
  zValidator(
    "param",
    z.object({ id: z.coerce.number().int().positive() }),
    (result, c) => {
      if (!result.success) return c.text("Invalid Notebook ID", 400);
    },
  ),
  zValidator("form", z.object({ message: z.string().min(1) }), (result, c) => {
    if (!result.success) return c.text("Invalid message", 400);
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const { message } = c.req.valid("form");
    return c.html(<ChatPostFragment id={id} message={message} />);
  },
);

/**
 * GET /:id/welcome
 * Fragment: Logic-heavy panel that decides between Chat History, Empty State, or AI Welcome.
 */
notebookRoutes.get(
  "/:id/welcome",
  zValidator(
    "param",
    z.object({ id: z.coerce.number().int().positive() }),
    (result, c) => {
      if (!result.success) return c.text("Invalid Notebook ID", 400);
    },
  ),
  async (c) => {
    const id = Number(c.req.param("id"));

    const notebookData = await findNotebookById(id);
    if (!notebookData) return c.text("", 404);

    // 1. Check for existing chat history in Mastra memory
    const storage = mastra.getStorage();
    if (storage) {
      try {
        const memoryStore = await storage.getStore("memory");
        if (memoryStore) {
          const historyData = await memoryStore.listMessages({
            threadId: String(id),
          });
          if (historyData?.messages && historyData.messages.length > 0) {
            const chatMessages = historyData.messages.filter(
              (m: any) => m.role !== "system",
            );
            if (chatMessages.length > 0) {
              return c.html(
                <ChatHistory
                  chatMessages={chatMessages}
                  parseContent={parseMastraMessageContent}
                />,
              );
            }
          }
        }
      } catch (err) {
        console.error("[Mastra] Error fetching chat history:", err);
      }
    }

    // 2. No history - check if user has any sources for a welcome panel
    const sourcesInfo = await listSourcesByNotebook(id);
    if (sourcesInfo.length === 0) {
      return c.html(<EmptyState />);
    }

    // 3. Generate AI welcome panel from notebook sources
    const contextSnippet = sourcesInfo
      .map(
        (s) =>
          `[Title: ${s.title}]\n${(s.content || "").substring(
            0,
            SOURCE_PREVIEW_LENGTH,
          )}...`,
      )
      .join("\n\n");

    const prompt = getWelcomePrompt(contextSnippet);

    try {
      const agent = mastra.getAgent("notebookAgent");
      if (!agent) throw new Error("Agent not found");

      const result = await agent.generate(prompt);
      const { emoji, summary, q1, q2, q3 } = parseWelcomeAgentResponse(
        result.text,
      );

      return c.html(
        <WelcomePanel
          emoji={emoji}
          title={notebookData.title}
          sourcesCount={sourcesInfo.length}
          summary={summary}
          q1={q1}
          q2={q2}
          q3={q3}
        />,
      );
    } catch (e) {
      console.error("Welcome AI error:", e);
      return c.html(<ErrorState />);
    }
  },
);

/**
 * DELETE /:id/chat
 * Clears the Mastra memory thread for this notebook.
 */
notebookRoutes.delete(
  "/:id/chat",
  zValidator(
    "param",
    z.object({ id: z.coerce.number().int().positive() }),
    (result, c) => {
      if (!result.success) return c.text("Invalid Notebook ID", 400);
    },
  ),
  async (c) => {
    const id = c.req.param("id");
    try {
      const storage = mastra.getStorage();
      if (storage) {
        const memoryStore = await storage.getStore("memory");
        if (memoryStore) {
          await memoryStore.deleteThread({ threadId: id });
        }
      }

      c.header("HX-Trigger", "load");
      return c.html(<ClearChatLoader id={id} />);
    } catch (e) {
      console.error("Error clearing chat:", e);
      return c.text("Failed to clear chat", 500);
    }
  },
);

/**
 * GET /:id/stream
 * SSE Endpoint: Streams the RAG-powered AI response.
 */
notebookRoutes.get(
  "/:id/stream",
  zValidator(
    "param",
    z.object({ id: z.coerce.number().int().positive() }),
    (result, c) => {
      if (!result.success) return c.text("Invalid Notebook ID", 400);
    },
  ),
  zValidator("query", z.object({ msg: z.string().min(1) }), (result, c) => {
    if (!result.success) return c.text("Invalid message", 400);
  }),
  async (c) => {
    const id = Number(c.req.param("id"));
    const { msg } = c.req.valid("query");

    return streamSSE(c, async (stream) => {
      await handleNotebookSSEStream(msg, id, stream);
    });
  },
);

/**
 * GET /:id
 * Primary entry point: Renders the base notebook layout.
 */
notebookRoutes.get(
  "/:id",
  zValidator(
    "param",
    z.object({ id: z.coerce.number().int().positive() }),
    (result, c) => {
      if (!result.success) return c.text("Invalid Notebook ID", 400);
    },
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const notebookData = await findNotebookById(id);

    if (!notebookData) {
      return c.text("Notebook not found", 404);
    }

    const sources = await listSourcesByNotebook(id);
    return c.html(
      <NotebookView
        notebookId={id}
        title={notebookData.title}
        sources={sources}
      />,
    );
  },
);

export { notebookRoutes };
