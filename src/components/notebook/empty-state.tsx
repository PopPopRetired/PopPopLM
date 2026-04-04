/**
 * @module src/components/notebook/empty-state.tsx
 *
 * Generic empty-state placeholder for the notebook chat.
 *
 * Displayed when a notebook has no sources and no conversation history.
 */

/**
 * Empty context chat placeholder.
 */
export function EmptyState() {
  return (
    <div class="h-full flex items-center justify-center fade-in">
      <p class="text-slate-500 font-medium text-lg">
        Add a source to get started
      </p>
    </div>
  );
}
