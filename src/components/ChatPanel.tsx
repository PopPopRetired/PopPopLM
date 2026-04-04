/**
 * @module src/components/ChatPanel.tsx
 *
 * The central chat interface for a notebook.
 *
 * Includes:
 * - A message window that automatically loads welcome info or history via HTMX
 * - A sticky message input area with source count indicators
 * - A dropdown menu for clearing chat persistence (via Mastra memory)
 */
import type { SelectSource } from "../db/schema";

/**
 * Chat interface component.
 */
export function ChatPanel({
  notebookId,
  sources,
}: {
  notebookId: number;
  title: string;
  sources: SelectSource[];
}) {
  const hasSources = sources && sources.length > 0;

  return (
    <div
      class={[
        "h-full flex flex-col bg-white/70 backdrop-blur-xl border border-white overflow-hidden shadow-lg rounded-3xl min-h-0",
      ].join(" ")}
    >
      {/* Panel Header */}
      <div class="p-4 sm:p-6 border-b border-slate-200/60 bg-white/30 flex justify-between items-center shrink-0">
        <h2 class="font-bold text-xl text-slate-800 tracking-tight flex items-center gap-3">
          <span class="iconify text-primary text-2xl lucide--message-square" />
          Chat
        </h2>

        {/* Options Menu */}
        <details class="dropdown dropdown-end">
          <summary class="btn btn-ghost btn-circle btn-sm text-slate-500 hover:bg-slate-100 marker:content-none list-none [&::-webkit-details-marker]:hidden">
            <span class="iconify lucide--more-vertical" />
          </summary>
          <ul class="dropdown-content z-[10] menu p-2 shadow-lg bg-white border border-slate-100 rounded-box w-48 mt-2">
            <li>
              <button
                class="text-error hover:bg-error/10 w-full"
                hx-delete={`/notebooks/${notebookId}/chat`}
                hx-target="#chat-messages"
                hx-swap="innerHTML"
                hx-confirm="Are you sure you want to clear this chat history? This action cannot be undone."
                onclick="this.closest('details').removeAttribute('open')"
              >
                <span class="iconify lucide--trash-2" />
                Clear Chat
              </button>
            </li>
          </ul>
        </details>
      </div>

      {/* Message Window: Loads history or AI welcome on mount */}
      <div
        id="chat-messages"
        class="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-white/50"
      >
        {hasSources ? (
          <div
            hx-get={`/notebooks/${notebookId}/welcome`}
            hx-trigger="load"
            hx-swap="outerHTML"
            class="flex items-center justify-center py-12"
          >
            <span class="loading loading-dots loading-md text-primary/60"></span>
          </div>
        ) : (
          <div class="h-full flex items-center justify-center">
            <p class="text-slate-500 font-medium text-lg">
              Add a source to get started
            </p>
          </div>
        )}
      </div>

      {/* Message Input Area */}
      <div class="p-4 sm:p-6 border-t border-slate-200/60 bg-white/30 backdrop-blur-md shrink-0">
        <form
          class="max-w-3xl mx-auto flex items-end gap-3"
          hx-post={`/notebooks/${notebookId}/chat`}
          hx-target="#chat-messages"
          hx-swap="beforeend scroll:bottom"
        >
          <div class="flex-1 relative shadow-sm rounded-3xl">
            <input
              type="text"
              name="message"
              id="message-input"
              placeholder={
                hasSources
                  ? "Ask a question about your sources..."
                  : "Add a source to chat..."
              }
              disabled={!hasSources}
              class={[
                "input w-full rounded-3xl border border-slate-200 bg-white transition-all py-6 pr-24 font-medium text-slate-700",
                "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10",
                "placeholder:font-normal placeholder-slate-400 disabled:bg-slate-50 disabled:text-slate-400",
              ].join(" ")}
              autocomplete="off"
            />
            <div class="absolute right-5 top-1/2 -translate-y-1/2 text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded-lg">
              {sources?.length || 0} source{sources?.length === 1 ? "" : "s"}
            </div>
          </div>
          <button
            type="submit"
            disabled={!hasSources}
            class={[
              "btn btn-circle btn-primary text-white border-none shrink-0 shadow-md transition-all",
              "hover:scale-105 disabled:opacity-50 disabled:hover:scale-100",
            ].join(" ")}
          >
            <span class="iconify text-xl lucide--arrow-up" />
          </button>
        </form>
      </div>
    </div>
  );
}
