import { Hono } from "hono";
import type { AppEnv } from "../types";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { NotebookView, NotebookTitleInput } from "../views/notebook";
import { streamSSE } from "hono/streaming";
import { mastra } from "../mastra";
import { searchSources } from "../mastra/tools/search-sources";
import { db } from "../db/index";
import { eq } from "drizzle-orm";
import { notebooks, sources } from "../db/schema";
import { listSourcesByNotebook } from "../db/queries/sources";
import { createNotebook, updateNotebookTitle } from "../db/queries/notebooks";

const notebookRoutes = new Hono<AppEnv>();

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
 notebookRoutes.post(
  "/:id/chat",
  zValidator("param", z.object({ id: z.coerce.number().int().positive() }), (result, c) => {
    if (!result.success) return c.text("Invalid Notebook ID", 400);
  }),
  zValidator("form", z.object({ message: z.string().min(1) }), (result, c) => {
    if (!result.success) return c.text("Invalid message", 400);
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const { message } = c.req.valid("form");
    
    return c.html(
      <>
        {/* User Message Bubble */}
        <div class="max-w-3xl mx-auto space-y-4 text-[15px] leading-relaxed text-slate-800 bg-slate-100 p-6 rounded-2xl shadow-sm border border-slate-200 mb-4 ml-auto w-[80%]">
          <p class="font-medium text-right">{message}</p>
        </div>
        
        {/* AI Streaming Bubble waiting to connect via SSE */}
        <div 
          class="max-w-3xl mx-auto space-y-4 text-[15px] leading-relaxed text-slate-700 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 w-full"
          hx-ext="sse" 
          sse-connect={`/notebooks/${id}/stream?msg=${encodeURIComponent(message)}`} 
          sse-swap="message"
          sse-close="close"
          hx-swap="beforeend scroll:#chat-messages:bottom"
        >
        </div>

        {/* Clear the input field for the next message */}
        <input type="text" name="message" id="message-input" hx-swap-oob="true" placeholder="Ask a question about your sources..." class="input w-full rounded-3xl border border-slate-200 bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 pr-24 py-6 font-medium text-slate-700 placeholder:font-normal placeholder-slate-400 transition-all" value="" autocomplete="off" />
      </>
    );
  }
);

notebookRoutes.get(
  "/:id/welcome",
  zValidator("param", z.object({ id: z.coerce.number().int().positive() }), (result, c) => {
    if (!result.success) return c.text("Invalid Notebook ID", 400);
  }),
  async (c) => {
    const id = Number(c.req.param("id"));

    const notebookData = await db.query.notebooks.findFirst({
      where: eq(notebooks.id, id),
    });

    if (!notebookData) return c.text("", 404);

    // FETCH CHAT HISTORY IF EXISTS
    const storage = mastra.getStorage();
    if (storage) {
      try {
        const memoryStore = await storage.getStore('memory');
        if (memoryStore) {
          const historyData = await memoryStore.listMessages({ threadId: String(id) });
          if (historyData?.messages && historyData.messages.length > 0) {
            const chatMessages = historyData.messages.filter((m: any) => m.role !== 'system');
            
            if (chatMessages.length > 0) {
              const parseContent = (content: any): string => {
                let parsed = content;
                if (typeof content === 'string') {
                  try {
                    parsed = JSON.parse(content);
                  } catch (e) {
                    return content; // Not JSON, standard string
                  }
                }
                
                if (parsed && typeof parsed === 'object') {
                  if (typeof parsed.text === 'string') return parsed.text;
                  if (typeof parsed.content === 'string') return parsed.content;
                  if (Array.isArray(parsed.parts) && parsed.parts.length > 0) {
                    const textParts = parsed.parts.filter((p: any) => p.type === 'text');
                    if (textParts.length > 0) {
                      return textParts.map((p: any) => p.text).join('\n');
                    }
                  }
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    const textParts = parsed.filter((p: any) => p.type === 'text');
                    if (textParts.length > 0) {
                      return textParts.map((p: any) => p.text).join('\n');
                    }
                  }
                }
                
                return typeof content === 'string' ? content : JSON.stringify(content);
              };

              return c.html(
                <>
                  {chatMessages.map((msg: any) => {
                    const cleanText = parseContent(msg.content);
                    return (
                      <div class={`max-w-3xl mx-auto space-y-4 text-[15px] leading-relaxed p-6 rounded-2xl shadow-sm border mb-4 ${msg.role === 'user' ? 'bg-slate-100 text-slate-800 border-slate-200 ml-auto w-[80%]' : 'bg-white text-slate-700 border-slate-100 w-full'}`}>
                        {msg.role === 'user' ? (
                          <p class="font-medium text-right">{cleanText}</p>
                        ) : (
                          cleanText.split('\n').map((line: string) => <p min-h="1lh">{line}</p>)
                        )}
                      </div>
                    );
                  })}
                </>
              );
            }
          }
        }
      } catch (err) {
        console.error("[Mastra] Error fetching chat history:", err);
      }
    }

    const sourcesInfo = await db.query.sources.findMany({
      where: eq(sources.notebookId, id),
    });

    if (sourcesInfo.length === 0) {
      return c.html(
        <div class="h-full flex items-center justify-center fade-in">
          <p class="text-slate-500 font-medium text-lg">Add a source to get started</p>
        </div>
      );
    }

    const content = sourcesInfo.map(s => `[Title: ${s.title}]\n${(s.content || "").substring(0, 1500)}...`).join("\n\n");

    const prompt = `Based on the following sources in the user's notebook:\n\n${content}\n\nProvide an appropriate single emoji, a 1 paragraph summary (approx 3-4 sentences), and exactly 3 suggested questions the user could ask.\nFormat EXACTLY like this:\nEMOJI: [emoji]\nSUMMARY: [summary]\nQ1: [q1]\nQ2: [q2]\nQ3: [q3]`;

    try {
      const agent = mastra.getAgent("notebookAgent");
      if (!agent) throw new Error("Agent not found");

      const result = await agent.generate(prompt);
      const text = result.text;

      const emojiMatch = text.match(/EMOJI:\s*(.*?)(?=SUMMARY:)/s);
      const summaryMatch = text.match(/SUMMARY:\s*(.*?)(?=Q1:)/s);
      const q1Match = text.match(/Q1:\s*(.*?)(?=Q2:)/s);
      const q2Match = text.match(/Q2:\s*(.*?)(?=Q3:)/s);
      const q3Match = text.match(/Q3:\s*(.*)/s);

      const emoji = emojiMatch ? emojiMatch[1].trim() : "📚";
      const summary = summaryMatch ? summaryMatch[1].trim() : "Welcome to your notebook! Feel free to ask questions about your sources.";
      const q1 = q1Match ? q1Match[1].trim() : "What are the main topics covered?";
      const q2 = q2Match ? q2Match[1].trim() : "Can you summarize the key points?";
      const q3 = q3Match ? q3Match[1].trim() : "What are the actionable takeaways?";

      return c.html(
        <div class="w-full max-w-4xl mx-auto px-2 fade-in animate-in slide-in-from-bottom-2 duration-500">
          <div class="mb-4">
            <div class="text-4xl mb-4">{emoji}</div>
            <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight leading-tight mb-2">{notebookData.title}</h1>
            <p class="text-sm font-medium text-slate-500">
              {sourcesInfo.length} source{sourcesInfo.length === 1 ? '' : 's'}
            </p>
          </div>
          
          <p class="text-slate-700 text-[15px] sm:text-[16px] leading-relaxed mb-6">
            {summary}
          </p>

          <div class="flex items-center gap-1 sm:gap-2 mb-8">
            <button class="btn btn-sm bg-white border border-slate-200 shadow-sm rounded-full text-slate-600 hover:bg-slate-50 hover:border-slate-300 font-medium px-4 transition-all">
              <span class="iconify lucide--pin text-[15px] opacity-70" /> Save to note
            </button>
            <button class="btn btn-sm btn-ghost btn-circle hover:bg-slate-100 text-slate-500 transition-colors">
              <span class="iconify lucide--copy text-[17px]" />
            </button>
            <button class="btn btn-sm btn-ghost btn-circle hover:bg-slate-100 text-slate-500 transition-colors">
              <span class="iconify lucide--thumbs-up text-[17px]" />
            </button>
            <button class="btn btn-sm btn-ghost btn-circle hover:bg-slate-100 text-slate-500 transition-colors">
              <span class="iconify lucide--thumbs-down text-[17px]" />
            </button>
          </div>

          <div class="space-y-3 flex flex-col items-start w-full">
            {[q1, q2, q3].map(q => (
              <button 
                class="text-left text-[14px] sm:text-[15px] font-medium text-slate-700 bg-white border border-slate-200 shadow-sm hover:border-primary/30 hover:shadow hover:bg-primary/5 px-5 py-3 rounded-2xl transition-all cursor-pointer"
                onclick={`document.getElementById('message-input').value = '${q.replace(/'/g, "\\'")}'; document.getElementById('message-input').focus();`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      );
    } catch (e) {
      console.error("Welcome AI error:", e);
      return c.html(
        <div class="text-error text-center p-4">Failed to load summary.</div>
      );
    }
  }
);

notebookRoutes.delete(
  "/:id/chat",
  zValidator("param", z.object({ id: z.coerce.number().int().positive() }), (result, c) => {
    if (!result.success) return c.text("Invalid Notebook ID", 400);
  }),
  async (c) => {
    const id = c.req.param("id");
    try {
      const storage = mastra.getStorage();
      if (storage) {
        const memoryStore = await storage.getStore('memory');
        if (memoryStore) {
          await memoryStore.deleteThread({ threadId: id });
        }
      }
      
      // Trigger a reload of the welcome screen by returning HTMX that targets itself
      c.header('HX-Trigger', 'load');
      return c.html(
        <div 
          hx-get={`/notebooks/${id}/welcome`} 
          hx-trigger="load" 
          hx-swap="outerHTML"
          class="flex items-center justify-center py-12"
        >
          <span class="loading loading-dots loading-md text-primary/60"></span>
        </div>
      );
    } catch (e) {
      console.error("Error clearing chat:", e);
      return c.text("Failed to clear chat", 500);
    }
  }
);

notebookRoutes.get(
  "/:id/stream",
  zValidator("param", z.object({ id: z.coerce.number().int().positive() }), (result, c) => {
    if (!result.success) return c.text("Invalid Notebook ID", 400);
  }),
  zValidator("query", z.object({ msg: z.string().min(1) }), (result, c) => {
    if (!result.success) return c.text("Invalid message", 400);
  }),
  async (c) => {
    const id = c.req.param("id");
    const { msg } = c.req.valid("query");
    
    console.log(`\n=> [SSE] Browser connected to stream for notebook ${id}. Message: "${msg}"`);
    console.log("=> [SSE] Awaiting LLM Generation...");
    
    return streamSSE(c, async (stream) => {
      try {
        const agent = mastra.getAgent("notebookAgent");
        if (!agent) {
            await stream.writeSSE({ data: "<strong class='text-error'>Agent initialization failed.</strong>" });
            return;
        }
        
        // 1. Manually fetch RAG context instead of relying on fragile local-model tool calling
        const results = await searchSources(msg, Number(id));
        let contextText = results.map(r => `[From ${r.title}]:\n${r.content}`).join("\n\n");
        if (!contextText) {
           contextText = "No relevant context found in this notebook.";
        }
        
        // 2. Wrap context as a system message to avoid memory bloat
        const systemPrompt = `BACKGROUND CONTEXT:\n${contextText}`;
        const messages = [
          { role: "system" as const, content: systemPrompt },
          { role: "user" as const, content: msg }
        ];
        
        // 3. Request a true stream, passing threadId for memory persistence
        console.log(`[RAG] Streaming to OpenAI with memory thread ${id}...`);
        
        const result = await agent.stream(messages, { 
          memory: {
            thread: String(id), 
            resource: "notebook-user" 
          }
        });

        for await (const chunk of result.textStream) {
          // preserve newlines in HTML streaming
          const browserChunk = chunk.replace(/\n/g, "<br/>");
          await stream.writeSSE({ data: browserChunk });
        }
        
        // Terminate the connection nicely to prevent EventSource from auto-reconnecting infinitely
        await stream.writeSSE({ event: "close", data: "" });
      } catch (err: any) {
        console.error("AI Stream Error:", err);
        await stream.writeSSE({ data: `<strong class='text-error'>AI Error: ${err.message || 'Connection failed'}</strong>` });
      }
    });
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
