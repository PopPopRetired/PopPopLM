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
      <input type="hidden" name="ownerId" x-bind:value="currentOwner.id || ''" />

      <button type="button" {...{ "x-on:click": "prev()" }} class="btn btn-circle bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-800 shadow-sm border border-slate-200 hover:border-slate-300 hover:-translate-x-0.5 transition-all">
        <span class="iconify text-xl lucide--chevron-left" />
      </button>
      
      <div class="bg-white shadow-sm border border-slate-200 rounded-full flex items-center justify-center h-12 min-w-[200px] px-8 transition-all">
        <span x-text="currentOwner.name" class="font-bold text-slate-700 tracking-wide select-none"></span>
      </div>
      
      <button type="button" {...{ "x-on:click": "next()" }} class="btn btn-circle bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-800 shadow-sm border border-slate-200 hover:border-slate-300 hover:translate-x-0.5 transition-all">
        <span class="iconify text-xl lucide--chevron-right" />
      </button>
    </form>
  );
}
