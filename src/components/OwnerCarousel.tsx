/**
 * @module src/components/OwnerCarousel.tsx
 *
 * A reactive family member selection carousel powered by Alpine.js and HTMX.
 *
 * State Management:
 * - Alpine.js (`x-data`) manages the local carousel index and labels.
 * - When the user clicks "next" or "prev", Alpine updates the `idx`.
 * - An Alpine watcher (`$watch('idx')`) dispatches a custom 'owner-changed' event.
 * - HTMX listens for 'owner-changed' (`hx-trigger`), fetches the filtered
 *   notebook grid, and swaps it out-of-band.
 */
import type { SelectOwner } from "../types/home";

/**
 * Carousel component for filtering notebooks by owner.
 */
export function OwnerCarousel({
  dbOwners,
  selectedOwnerId = null,
  isOob = false,
}: {
  dbOwners: SelectOwner[];
  selectedOwnerId?: number | null;
  isOob?: boolean;
}) {
  // Normalize owners for the UI, adding the "All" global filter
  const carouselOwners = [
    { id: null, name: "All" },
    ...dbOwners.map((o) => ({ id: o.id, name: `${o.name}'s Notebooks` })),
  ];

  // Calculate starting index based on the optional selectedOwnerId
  const startIdx = selectedOwnerId
    ? carouselOwners.findIndex((o) => o.id === selectedOwnerId)
    : 0;
  const safeStartIdx = startIdx === -1 ? 0 : startIdx;

  // Attributes for HTMX Out-of-Band updates
  const oobAttr = isOob ? { "hx-swap-oob": "outerHTML" } : {};

  return (
    <form
      id="owner-carousel"
      class="flex items-center justify-center gap-3 sm:gap-4 mb-12 w-full px-4"
      {...oobAttr}
      {...{ "x-on:submit.prevent": "" }}
      x-data={`{
        idx: ${safeStartIdx},
        owners: ${JSON.stringify(carouselOwners).replace(/'/g, "\\'")},
        get currentOwner() { return this.owners[this.idx]; },
        next() { this.idx = this.idx === this.owners.length - 1 ? 0 : this.idx + 1; },
        prev() { this.idx = this.idx === 0 ? this.owners.length - 1 : this.idx - 1; }
      }`}
      x-init="$watch('idx', () => $dispatch('owner-changed'))"
      hx-get="/fragments/notebooks"
      hx-trigger="owner-changed"
      hx-target="#notebooks-grid-wrapper"
      hx-swap="outerHTML"
    >
      {/* Hidden input to pass the selected ownerId to the HTMX GET request */}
      <input type="hidden" name="ownerId" x-bind:value="currentOwner.id || ''" />

      {/* Previous Button */}
      <button
        type="button"
        {...{ "x-on:click": "prev()" }}
        class={[
          "btn btn-circle bg-white shadow-sm border border-slate-200 transition-all",
          "hover:bg-slate-50 text-slate-400 hover:text-slate-800 hover:border-slate-300 hover:-translate-x-0.5",
        ].join(" ")}
      >
        <span class="iconify text-xl lucide--chevron-left" />
      </button>

      {/* Selected Owner Label */}
      <div class="bg-white shadow-sm border border-slate-200 rounded-full flex items-center justify-center h-12 min-w-[200px] px-8 transition-all">
        <span
          x-text="currentOwner.name"
          class="font-bold text-slate-700 tracking-wide select-none"
        />
      </div>

      {/* Next Button */}
      <button
        type="button"
        {...{ "x-on:click": "next()" }}
        class={[
          "btn btn-circle bg-white shadow-sm border border-slate-200 transition-all",
          "hover:bg-slate-50 text-slate-400 hover:text-slate-800 hover:border-slate-300 hover:translate-x-0.5",
        ].join(" ")}
      >
        <span class="iconify text-xl lucide--chevron-right" />
      </button>
    </form>
  );
}
