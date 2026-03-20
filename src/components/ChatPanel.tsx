export function ChatPanel() {
  return (
    <div class="h-full flex flex-col bg-white border-[2.5px] border-black overflow-hidden shadow-none rounded-none">
      <div class="p-4 sm:p-5 border-b-[2.5px] border-black flex justify-between items-center shrink-0 h-[72px]">
        <h2 class="font-normal text-xl text-black">Chat</h2>
        <button class="btn btn-ghost btn-circle btn-sm">
          <span class="iconify lucide--more-vertical" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 sm:p-6 sm:px-10 space-y-6 bg-gray-50/30">
        {/* Placeholder Chat Message */}
        <div class="max-w-3xl mx-auto space-y-4 text-[15px] leading-relaxed text-black">
          <p class="font-medium">Here is the appropriate response according to the sources:</p>
          <p>
            <strong class="font-bold">Engage with a Coherent Christian Conscience First</strong>, avoiding divisive politics does not mean abandoning your civic duty. The sources stress that the lay faithful must never relinquish their participation in public life and democracy. However, your involvement must be guided by a well-formed Christian conscience rooted in the natural moral law, rather than the "ephemeral cultural and moral trends" or moral relativism that drive much of today's political division.
          </p>
          
          <div class="flex items-center gap-2 mt-4">
             <button class="btn btn-ghost btn-sm rounded-none border-[1.5px] border-gray-300 gap-2 text-xs font-normal">
               <span class="iconify lucide--bookmark" />
               Save to note
             </button>
             <button class="btn btn-ghost btn-sm btn-circle text-gray-500">
               <span class="iconify lucide--copy" />
             </button>
             <button class="btn btn-ghost btn-sm btn-circle text-gray-500">
               <span class="iconify lucide--thumbs-up" />
             </button>
             <button class="btn btn-ghost btn-sm btn-circle text-gray-500">
               <span class="iconify lucide--thumbs-down" />
             </button>
          </div>
        </div>
        
        <div class="text-center text-xs text-gray-500 mt-8 mb-4">
          Today • 2:03 PM
        </div>
      </div>

      <div class="p-4 sm:p-5 border-t-[2.5px] border-black bg-white shrink-0">
        <form class="max-w-3xl mx-auto flex items-end gap-2" hx-post="/fragments/notebooks/chat" hx-swap="none">
          <div class="flex-1 relative">
            <input type="text" name="message" placeholder="Start typing..." class="input input-bordered w-full rounded-2xl border-[1.5px] border-gray-300 focus:outline-none focus:border-black pr-24" />
            <div class="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500 font-medium">
              10 sources
            </div>
          </div>
          <button type="submit" class="btn btn-circle bg-gray-100 hover:bg-gray-200 border-none shrink-0 h-12 w-12">
            <span class="iconify text-black lucide--arrow-right" />
          </button>
        </form>
      </div>
    </div>
  );
}
