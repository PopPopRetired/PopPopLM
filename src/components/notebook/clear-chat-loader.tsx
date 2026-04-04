/**
 * @module src/components/notebook/clear-chat-loader.tsx
 *
 * A temporary loading placeholder returned after a user clears history.
 *
 * Tells HTMX to immediately fetch the welcome/history fragment from
 * the server (`hx-get`) to re-initialize the chat panel with the
 * empty state or AI welcome panel.
 */

/**
 * Loading state for chat clearing.
 */
export function ClearChatLoader({ id }: { id: number | string }) {
  return (
    <div
      hx-get={`/notebooks/${id}/welcome`}
      hx-trigger="load"
      hx-swap="outerHTML"
      class="flex items-center justify-center py-12"
    >
      <span class="loading loading-dots loading-md text-primary/60" />
    </div>
  );
}
