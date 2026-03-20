export function NotebooksGrid({ notebooks, ownerIdFilter, isOob = false }: { notebooks: any[], ownerIdFilter?: number, isOob?: boolean }) {
  const hasSelectedOwner = typeof ownerIdFilter === 'number' && !isNaN(ownerIdFilter) && ownerIdFilter > 0;
  const oobAttr = isOob ? { "hx-swap-oob": "outerHTML" } : {};

  return (
    <div id="notebooks-grid-wrapper" class="w-full flex flex-col gap-8" {...oobAttr}>
      {!hasSelectedOwner && (
        <div class="w-full bg-white border-[2.5px] border-black p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-none">
          <div class="text-center sm:text-left">
            <h3 class="text-xl font-medium text-black mb-1">Not listed?</h3>
            <p class="text-gray-600">Register to create your own notebooks.</p>
          </div>
          <button type="button" class="btn bg-black text-white hover:bg-gray-800 rounded-none border-2 border-black px-8" onclick="document.getElementById('register_modal').showModal()">
            Register
          </button>
        </div>
      )}

      <div id="notebooks-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 w-full">
        {hasSelectedOwner && (
          <form hx-post="/notebooks" class="contents">
            <input type="hidden" name="ownerId" value={ownerIdFilter} />
            <button type="submit" class="card bg-white border-[2.5px] border-black hover:bg-gray-50 transition-colors flex flex-col items-center justify-center min-h-[160px] p-6 rounded-none group cursor-pointer shadow-none w-full h-full">
              <div class="bg-gray-200 rounded-full w-14 h-14 flex items-center justify-center mb-3 group-hover:bg-gray-300 group-hover:scale-105 transition-all duration-200">
                <span class="iconify text-[28px] text-gray-600 lucide--plus" />
              </div>
              <span class="font-normal text-base text-black">Create new notebook</span>
            </button>
          </form>
        )}

        {/* Existing notebooks */}
        {notebooks.map((nb: any, i: number) => (
          <a href={`/notebooks/${nb.id}`} key={i} class="card bg-white border-[2.5px] border-black hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col min-h-[160px] p-4 rounded-none cursor-pointer group shadow-none no-underline">
            <div class="w-full flex justify-start mb-1">
              <span class="iconify-color text-[34px] text-sky-500 group-hover:text-sky-600 transition-colors lucide--brain" />
            </div>
            <div class="flex-1 w-full flex flex-col items-center justify-center text-center">
              <h2 class="text-[22px] font-normal leading-tight mb-2 text-black whitespace-pre-wrap">
                {nb.title}
              </h2>
              <p class="text-[11px] text-gray-800">
                {nb.date} - {nb.sources}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
