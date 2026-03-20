import type { SelectSource } from "../db/queries/sources";

export function SourcesPanel({ notebookId, sources = [] }: { notebookId: number; sources?: SelectSource[] }) {
  return (
    <div id="sources-panel" class="h-full flex flex-col bg-white border-[2.5px] border-black overflow-hidden shadow-none rounded-none">
      <div class="p-4 sm:p-5 border-b-[2.5px] border-black">
        <h2 class="font-normal text-xl text-black">Sources</h2>
        <div class="mt-5">
          <form hx-post={`/sources/${notebookId}`} hx-target="#sources-panel" hx-swap="outerHTML">
            <input type="hidden" name="type" value="text" />
            <label class="input input-bordered flex items-center gap-2 rounded-none border-[2.5px] border-black h-12 mb-2 p-0 pl-3 overflow-hidden">
              <span class="iconify text-gray-400 text-xl shrink-0 lucide--link mb-[2px]" />
              <input type="text" name="content" class="grow bg-transparent border-none focus:ring-0 px-0 h-full !outline-none" placeholder="Add web link or text" required />
              <button type="submit" class="btn btn-ghost btn-square h-full min-h-0 bg-gray-100 hover:bg-gray-200 shrink-0 border-l border-black rounded-none border-t-0 border-b-0 border-r-0">
                <span class="iconify lucide--plus" />
              </button>
            </label>
          </form>
        </div>
      </div>
      
      <div id="delete-sources-form" class="flex-1 flex flex-col overflow-hidden">
        <div class="flex-1 overflow-y-auto px-4 sm:px-5 py-4">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm font-medium text-gray-700">Sources ({sources.length})</span>
            {sources.length > 0 && (
              <button 
                type="button" 
                hx-delete={`/sources/${notebookId}`}
                hx-include="input[name='sourceIds']:checked"
                hx-target="#sources-panel"
                hx-swap="outerHTML"
                class="text-xs text-red-500 hover:underline"
              >
                Delete selected
              </button>
            )}
          </div>
          
          <div class="space-y-4">
             {sources.map(source => {
               const safeTitle = source.title.replace(/'/g, "\\'");
               return (
                 <div 
                   class="group flex flex-col hover:bg-gray-50 -mx-2 px-2 py-1" 
                   key={source.id.toString()} 
                   x-data={`{ editing: false, title: '${safeTitle}' }`}
                 >
                   {/* VIEW STATE */}
                   <div class="flex items-center justify-between cursor-pointer w-full" x-show="!editing">
                     <div class="flex items-center gap-2 overflow-hidden flex-1">
                       <span class={`iconify text-xl shrink-0 ${source.type === 'pdf' ? 'text-error lucide--file-text' : 'text-info lucide--globe'}`} />
                       <span class="text-sm truncate mr-1" x-text="title"></span>
                       
                       {/* Rename button (shows on hover) */}
                       <button 
                         type="button" 
                         {...{'@click.prevent': "editing = true; $nextTick(() => $refs.titleInput.focus())"}} 
                         class="opacity-0 group-hover:opacity-100 btn btn-ghost btn-xs btn-circle text-gray-400 hover:text-black shrink-0 transition-opacity"
                       >
                         <span class="iconify lucide--pencil w-3 h-3" />
                       </button>
                     </div>
                     <input type="checkbox" name="sourceIds" value={source.id.toString()} class="checkbox checkbox-sm rounded-none border-[2px] border-black shrink-0 ml-2" />
                   </div>
                   
                   {/* EDIT STATE */}
                   <div 
                     x-show="editing" 
                     style="display: none;"
                     class="flex items-center gap-2 w-full mt-1 mb-1"
                   >
                     <input 
                       x-ref="titleInput"
                       type="text" 
                       name="title" 
                       x-model="title" 
                       class="input input-xs input-bordered rounded-[4px] border border-gray-300 w-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                       required 
                       {...{'@keydown.escape': `editing = false; title = '${safeTitle}'`}}
                       {...{'@keydown.enter.prevent': "$refs.saveBtn.click()"}}
                     />
                     <div class="flex gap-1 shrink-0">
                       <button 
                         x-ref="saveBtn"
                         type="button" 
                         hx-patch={`/sources/${notebookId}/${source.id}`}
                         hx-include="closest .group"
                         hx-target="#sources-panel" 
                         hx-swap="outerHTML"
                         class="btn btn-xs btn-square bg-blue-600 text-white hover:bg-blue-700 rounded-[4px] border-none"
                       >
                         <span class="iconify lucide--check w-3 h-3" />
                       </button>
                       <button type="button" {...{'@click': `editing = false; title = '${safeTitle}'`}} class="btn btn-xs btn-square btn-ghost rounded-[4px] bg-gray-100 hover:bg-gray-200 text-gray-600">
                         <span class="iconify lucide--x w-3 h-3" />
                       </button>
                     </div>
                   </div>
                 </div>
               );
             })}
             {sources.length === 0 && (
               <div class="text-sm text-gray-400 italic text-center py-4">No sources yet</div>
             )}
          </div>
        </div>
      </div>

      <div class="p-4 sm:p-5 border-t-[2.5px] border-black flex justify-center">
        <label class="btn btn-ghost hover:bg-transparent hover:underline text-sm font-normal text-black flex items-center justify-center gap-2 cursor-pointer w-full">
          <span class="iconify lucide--file-up" />
          Upload PDF
          <input 
            type="file" 
            name="file" 
            accept=".pdf" 
            class="hidden" 
            hx-post={`/sources/${notebookId}`} 
            hx-target="#sources-panel" 
            hx-swap="outerHTML" 
            hx-encoding="multipart/form-data"
            hx-vals={JSON.stringify({ type: "pdf" })}
          />
        </label>
      </div>
    </div>
  );
}
