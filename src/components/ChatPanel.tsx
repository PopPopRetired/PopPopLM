export function ChatPanel() {
  return (
    <div class="h-full flex flex-col bg-white/70 backdrop-blur-xl border border-white overflow-hidden shadow-lg rounded-3xl">
      <div class="p-4 sm:p-6 border-b border-slate-200/60 bg-white/30 flex justify-between items-center shrink-0">
        <h2 class="font-bold text-xl text-slate-800 tracking-tight flex items-center gap-3">
          <span class="iconify text-primary text-2xl lucide--message-square" /> 
          Chat
        </h2>
        <button class="btn btn-ghost btn-circle btn-sm text-slate-500 hover:bg-slate-100">
          <span class="iconify lucide--more-vertical" />
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 bg-slate-50/50">
        {/* Placeholder Chat Message */}
        <div class="max-w-3xl mx-auto space-y-4 text-[15px] leading-relaxed text-slate-700 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <p class="font-medium">Here is the appropriate response according to the sources:</p>
          <p>
            <strong class="font-bold text-slate-900">Engage with a Coherent Christian Conscience First</strong>, avoiding divisive politics does not mean abandoning your civic duty. The sources stress that the lay faithful must never relinquish their participation in public life and democracy. However, your involvement must be guided by a well-formed Christian conscience rooted in the natural moral law, rather than the "ephemeral cultural and moral trends" or moral relativism that drive much of today's political division.
          </p>
          
          <div class="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100">
             <button class="btn btn-ghost btn-sm rounded-lg hover:bg-primary/10 hover:text-primary gap-2 text-xs font-semibold text-slate-500 transition-colors">
               <span class="iconify lucide--bookmark" />
               Save note
             </button>
             <button class="btn btn-ghost btn-sm btn-circle text-slate-400 hover:text-slate-700 hover:bg-slate-100 ml-auto">
               <span class="iconify lucide--copy w-4 h-4" />
             </button>
             <button class="btn btn-ghost btn-sm btn-circle text-slate-400 hover:text-success hover:bg-success/10">
               <span class="iconify lucide--thumbs-up w-4 h-4" />
             </button>
             <button class="btn btn-ghost btn-sm btn-circle text-slate-400 hover:text-error hover:bg-error/10">
               <span class="iconify lucide--thumbs-down w-4 h-4" />
             </button>
          </div>
        </div>
        
        <div class="text-center text-xs font-medium text-slate-400 mt-8 mb-4">
          Today • 2:03 PM
        </div>
      </div>

      <div class="p-4 sm:p-6 border-t border-slate-200/60 bg-white/30 backdrop-blur-md shrink-0">
        <form class="max-w-3xl mx-auto flex items-end gap-3" hx-post="/fragments/notebooks/chat" hx-swap="none">
          <div class="flex-1 relative shadow-sm rounded-3xl">
            <input type="text" name="message" placeholder="Ask a question about your sources..." class="input w-full rounded-3xl border border-slate-200 bg-white focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 pr-24 py-6 font-medium text-slate-700 placeholder:font-normal placeholder-slate-400 transition-all" />
            <div class="absolute right-5 top-1/2 -translate-y-1/2 text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded-lg">
              10 sources
            </div>
          </div>
          <button type="submit" class="btn btn-circle btn-primary text-white hover:scale-105 border-none shrink-0 shadow-md transition-all">
            <span class="iconify text-xl lucide--arrow-up" />
          </button>
        </form>
      </div>
    </div>
  );
}
