/**
 * @module src/components/notebook/chat-post-fragment.tsx
 *
 * A multi-responsibility fragment returned after a user sends a chat message.
 *
 * It uses HTMX to update three distinct parts of the UI simultaneously:
 * 1. Appends the user's message bubble to the chat window.
 * 2. Appends an empty container that immediately opens an SSE connection
 *    to stream the AI response token-by-token.
 * 3. Resets the main message input field via an Out-of-Band (`hx-swap-oob`) swap.
 */

/**
 * Chat submission response fragment.
 */
export function ChatPostFragment({
  id,
  message,
}: {
  id: number;
  message: string;
}) {
  return (
    <>
      {/* 1. The User Bubble */}
      <div class="max-w-3xl mx-auto space-y-4 text-[15px] leading-relaxed text-slate-800 bg-slate-100 p-6 rounded-2xl shadow-sm border border-slate-200 mb-4 ml-auto w-[80%]">
        <p class="font-medium text-right">{message}</p>
      </div>

      {/* 2. The AI Response Container (opens SSE stream) */}
      <div
        class="max-w-3xl mx-auto space-y-4 text-[15px] leading-relaxed text-slate-700 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 w-full"
        hx-ext="sse"
        sse-connect={`/notebooks/${id}/stream?msg=${encodeURIComponent(
          message,
        )}`}
        sse-swap="message"
        sse-close="close"
        hx-swap="beforeend scroll:#chat-messages:bottom"
      >
        {/* SSE content will stream into this div */}
      </div>

      {/* 3. The Input Reset (OOB Swap) */}
      <input
        type="text"
        name="message"
        id="message-input"
        hx-swap-oob="true"
        placeholder="Ask a question about your sources..."
        class={[
          "input w-full rounded-3xl border border-slate-200 bg-white transition-all py-6 pr-24 font-medium text-slate-700",
          "focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10",
          "placeholder:font-normal placeholder-slate-400",
        ].join(" ")}
        value=""
        autocomplete="off"
      />
    </>
  );
}
