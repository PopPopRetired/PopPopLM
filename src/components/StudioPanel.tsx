export function StudioPanel() {
  return (
    <div class="h-full flex flex-col bg-white border-[2.5px] border-black overflow-hidden shadow-none rounded-none">
      <div class="p-4 sm:p-5 border-b-[2.5px] border-black flex justify-between items-center shrink-0 h-[72px]">
        <h2 class="font-normal text-xl text-black">Studio</h2>
        <button class="btn btn-ghost btn-circle btn-sm">
           <span class="iconify lucide--layout-grid" />
        </button>
      </div>
      
      <div class="flex-1 overflow-y-auto p-4 sm:p-5 space-y-8">
        
        {/* Actions Grid */}
        <div class="grid grid-cols-2 gap-3">
          <button class="group relative card bg-sky-50 border-[1.5px] border-sky-100 hover:border-sky-300 flex flex-col items-start p-4 rounded-xl shadow-none transition-colors">
            <span class="iconify text-sky-500 text-2xl mb-2 lucide--headphones" />
            <span class="text-xs font-semibold text-sky-900">Audio Overview</span>
            <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="iconify text-gray-400 text-sm lucide--pencil" />
            </div>
          </button>
          
          <button class="group relative card bg-amber-50 border-[1.5px] border-amber-100 hover:border-amber-300 flex flex-col items-start p-4 rounded-xl shadow-none transition-colors">
            <span class="iconify text-amber-500 text-2xl mb-2 lucide--presentation" />
            <span class="text-xs font-semibold text-amber-900">Slide Deck</span>
            <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="iconify text-gray-400 text-sm lucide--pencil" />
            </div>
          </button>
          
          <button class="group relative card bg-green-50 border-[1.5px] border-green-100 hover:border-green-300 flex flex-col items-start p-4 rounded-xl shadow-none transition-colors">
            <span class="iconify text-green-500 text-2xl mb-2 lucide--video" />
            <span class="text-xs font-semibold text-green-900">Video Overview</span>
            <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="iconify text-gray-400 text-sm lucide--pencil" />
            </div>
          </button>
          
          <button class="group relative card bg-fuchsia-50 border-[1.5px] border-fuchsia-100 hover:border-fuchsia-300 flex flex-col items-start p-4 rounded-xl shadow-none transition-colors">
            <span class="iconify text-fuchsia-500 text-2xl mb-2 lucide--file-text" />
            <span class="text-xs font-semibold text-fuchsia-900">Reports</span>
            <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="iconify text-gray-400 text-sm lucide--pencil" />
            </div>
          </button>
          
          <button class="group relative card bg-purple-50 border-[1.5px] border-purple-100 hover:border-purple-300 flex flex-col items-start p-4 rounded-xl shadow-none transition-colors">
            <span class="iconify text-purple-500 text-2xl mb-2 lucide--brain-circuit" />
            <span class="text-xs font-semibold text-purple-900">Quiz</span>
            <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="iconify text-gray-400 text-sm lucide--pencil" />
            </div>
          </button>
        </div>

        <div class="divider text-xs text-gray-400 font-medium">History</div>

        {/* History List */}
        <div class="space-y-4">
           <div class="flex items-start gap-4 group">
              <span class="iconify text-sky-500 text-xl mt-1 shrink-0 lucide--headphones" />
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-black truncate leading-tight mb-1">Saint Peter, Philosophy, and the Algorithm</p>
                <p class="text-xs text-gray-500">9 sources · 20d ago</p>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                 <button class="btn btn-ghost btn-circle btn-xs text-gray-400 hover:text-black">
                   <span class="iconify lucide--refresh-cw" />
                 </button>
                 <button class="btn btn-ghost btn-circle btn-xs text-gray-400 hover:text-black">
                   <span class="iconify lucide--play" />
                 </button>
                 <button class="btn btn-ghost btn-circle btn-xs text-gray-400 hover:text-black">
                   <span class="iconify lucide--more-vertical" />
                 </button>
              </div>
           </div>
        </div>
      </div>

      <div class="p-4 sm:p-5 border-t-[2.5px] border-black flex justify-center bg-white shrink-0">
        <button class="btn bg-black text-white hover:bg-gray-800 rounded-3xl border-2 border-black px-8">
           <span class="iconify lucide--edit-3" />
           Add note
        </button>
      </div>
    </div>
  );
}
