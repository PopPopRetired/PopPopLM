/**
 * @module src/components/notebook/error.tsx
 *
 * Generic error display for AI-generated fragments.
 */

/**
 * Error state display.
 */
export function ErrorState({
  message = "Failed to load summary.",
}: {
  message?: string;
}) {
  return <div class="text-error text-center p-4 font-semibold">{message}</div>;
}
