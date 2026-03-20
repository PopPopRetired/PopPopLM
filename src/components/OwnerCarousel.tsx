export function OwnerCarousel({ dbOwners, selectedOwnerId = null, isOob = false }: { dbOwners: any[], selectedOwnerId?: number | null, isOob?: boolean }) {
  const carouselOwners = [
    { id: null, name: "All" },
    ...dbOwners.map((o: any) => ({ id: o.id, name: `${o.name}'s Notebooks` }))
  ];

  const startIdx = selectedOwnerId 
    ? carouselOwners.findIndex(o => o.id === selectedOwnerId)
    : 0;
  const safeStartIdx = startIdx === -1 ? 0 : startIdx;
  const oobAttr = isOob ? { "hx-swap-oob": "outerHTML" } : {};

  return (
    <form 
      id="owner-carousel"
      class="flex items-center justify-center gap-4 sm:gap-6 mb-14 w-full px-2"
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
      <input type="hidden" name="ownerId" x-bind:value="currentOwner.id || ''" />

      <button type="button" {...{ "x-on:click": "prev()" }} class="btn btn-ghost btn-circle text-3xl hover:bg-gray-100 min-h-[3.25rem] w-[3.25rem] font-light">
        <span class="iconify lucide--chevron-left" />
      </button>
      
      <div class="border-[2px] border-black bg-white flex items-center justify-center h-14 min-w-[240px] px-6">
        <span x-text="currentOwner.name" class="font-normal text-lg tracking-wide"></span>
      </div>
      
      <button type="button" {...{ "x-on:click": "next()" }} class="btn btn-ghost btn-circle text-3xl hover:bg-gray-100 min-h-[3.25rem] w-[3.25rem] font-light">
        <span class="iconify lucide--chevron-right" />
      </button>
    </form>
  );
}
