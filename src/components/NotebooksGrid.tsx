export function NotebooksGrid({ notebooks, ownerIdFilter, isOob = false }: { notebooks: any[], ownerIdFilter?: number, isOob?: boolean }) {
  const hasSelectedOwner = typeof ownerIdFilter === 'number' && !isNaN(ownerIdFilter) && ownerIdFilter > 0;
  const oobAttr = isOob ? { "hx-swap-oob": "outerHTML" } : {};

  return (
    <div id="notebooks-grid-wrapper" class="w-full flex flex-col gap-8" {...oobAttr}>
      {!hasSelectedOwner && (
        <div class="w-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/60 rounded-[2rem] p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm relative overflow-hidden">
          <div class="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
          <div class="text-center sm:text-left z-10">
            <h3 class="text-2xl font-bold text-slate-800 mb-2">Looking for your notebooks?</h3>
            <p class="text-slate-600 font-medium text-lg">Register a profile to start tracking your own family sources.</p>
          </div>
          <button type="button" class="btn btn-primary text-white rounded-2xl shadow-md border-none px-10 py-3 sm:py-0 h-auto sm:h-14 font-bold text-base hover:shadow-xl hover:scale-105 transition-all z-10" onclick="document.getElementById('register_modal').showModal()">
            Register Profile
          </button>
        </div>
      )}

      <div id="notebooks-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-5 sm:gap-6 w-full pb-16">
        {hasSelectedOwner && (
          <form hx-post="/notebooks" class="contents">
            <input type="hidden" name="ownerId" value={ownerIdFilter} />
            <button type="submit" class="card bg-white/40 border-2 border-dashed border-slate-300 hover:border-primary hover:bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] p-6 rounded-3xl group cursor-pointer w-full h-full">
              <div class="bg-primary/10 text-primary rounded-full w-16 h-16 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                <span class="iconify text-3xl lucide--plus" />
              </div>
              <span class="font-bold text-lg text-slate-500 group-hover:text-primary transition-colors">Create Notebook</span>
            </button>
          </form>
        )}

        {/* Existing notebooks */}
        {notebooks.map((nb: any, i: number) => (
          <a href={`/notebooks/${nb.id}`} key={i} class="card bg-white border border-slate-100 hover:border-primary/20 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col min-h-[240px] p-7 rounded-3xl cursor-pointer group no-underline relative overflow-hidden">
            {/* Soft background glow */}
            <div class="absolute -top-12 -right-12 w-36 h-36 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/15 transition-colors duration-500"></div>
            
            <div class="w-full flex justify-start mb-5">
              <div class="bg-blue-50 text-blue-500 p-4 rounded-2xl group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-500/30">
                 <span class="iconify text-3xl lucide--book-open" />
              </div>
            </div>
            
            <div class="flex-1 w-full flex flex-col justify-start">
              <h2 class="text-xl font-bold leading-tight mb-2 text-slate-800 line-clamp-3 group-hover:text-primary transition-colors">
                {nb.title}
              </h2>
            </div>
            
            <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <span>{nb.date}</span>
              <span class="bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600">{nb.sources}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
