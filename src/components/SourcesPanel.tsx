/**
 * @module src/components/SourcesPanel.tsx
 *
 * The sidebar for managing notebook content sources.
 *
 * Features:
 * - Direct text/link ingestion via a persistent top form.
 * - PDF file upload via a hidden input and custom label.
 * - Multi-select deletion of sources.
 * - Alpine.js-powered inline title editing for any source:
 *   - Uses `editing` boolean to toggle between view and edit UI.
 *   - Uses `$refs` and `$nextTick` for focus management.
 *   - Uses HTMX `hx-patch` for saving the new title.
 */
import type { SelectSource } from "../db/schema";

/**
 * Sources management panel.
 */
export function SourcesPanel({
  notebookId,
  sources = [],
}: {
  notebookId: number;
  sources?: SelectSource[];
}) {
  return (
    <div
      id="sources-panel"
      class="h-full flex flex-col bg-white/70 backdrop-blur-xl border border-white overflow-hidden shadow-lg rounded-3xl"
    >
      {/* Search/Add Header */}
      <div class="px-6 py-5 border-b border-slate-200/60 bg-white/30">
        <h2 class="font-bold text-xl text-slate-800 tracking-tight flex items-center gap-3">
          <span class="iconify text-primary text-2xl lucide--library" />
          Sources
        </h2>
        <div class="mt-5">
          <form
            hx-post={`/sources/${notebookId}`}
            hx-target="#sources-panel"
            hx-swap="outerHTML"
          >
            <input type="hidden" name="type" value="text" />
            <label
              class={[
                "input input-bordered flex items-center gap-2 rounded-2xl border-slate-200 bg-slate-50 transition-all shadow-sm",
                "focus-within:bg-white focus-within:ring-4 focus-within:ring-primary/10",
                "h-[3.25rem] mb-2 p-0 pl-4 overflow-hidden",
              ].join(" ")}
            >
              <span class="iconify text-slate-400 text-xl shrink-0 lucide--plus mb-[2px]" />
              <input
                type="text"
                name="content"
                class="grow bg-transparent border-none focus:ring-0 px-1 py-4 h-full !outline-none text-slate-700 font-medium placeholder-slate-400"
                placeholder="Paste web link or text..."
                required
              />
              <button
                type="submit"
                class={[
                  "btn btn-ghost h-full min-h-0 bg-transparent shrink-0 rounded-none border-none border-l border-slate-200 transition-colors w-14",
                  "hover:bg-primary hover:text-white",
                ].join(" ")}
              >
                <span class="iconify lucide--arrow-right text-lg" />
              </button>
            </label>
          </form>
        </div>
      </div>

      {/* Sources List */}
      <div
        id="delete-sources-form"
        class="flex-1 flex flex-col overflow-hidden bg-slate-50/50"
      >
        <div class="flex-1 overflow-y-auto px-6 py-5">
          <div class="flex items-center justify-between mb-5">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Sources{" "}
              <span class="bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-md ml-2">
                {sources.length}
              </span>
            </span>
            {sources.length > 0 && (
              <button
                type="button"
                hx-delete={`/sources/${notebookId}`}
                hx-include="input[name='sourceIds']:checked"
                hx-target="#sources-panel"
                hx-swap="outerHTML"
                class="text-xs font-semibold text-error/80 hover:text-error hover:underline flex items-center gap-1"
              >
                <span class="iconify lucide--trash-2 w-3 h-3" />
                Delete selected
              </button>
            )}
          </div>

          <div class="space-y-3">
            {sources.map((source) => {
              const safeTitle = source.title.replace(/'/g, "\\'");
              return (
                <div
                  class={[
                    "group flex flex-col bg-white border border-slate-100 shadow-sm rounded-2xl p-3 transition-all cursor-default",
                    "hover:shadow-md hover:border-slate-200",
                  ].join(" ")}
                  key={source.id.toString()}
                  x-data={`{ editing: false, title: '${safeTitle}' }`}
                >
                  {/* VIEW STATE */}
                  <div
                    class="flex items-center justify-between w-full"
                    x-show="!editing"
                  >
                    <div class="flex items-center gap-4 overflow-hidden flex-1">
                      <div
                        class={[
                          "flex items-center justify-center w-10 h-10 rounded-xl shrink-0 shadow-sm",
                          source.type === "pdf"
                            ? "bg-red-50 text-red-500"
                            : "bg-blue-50 text-blue-500",
                        ].join(" ")}
                      >
                        <span
                          class={[
                            "iconify text-xl",
                            source.type === "pdf"
                              ? "lucide--file-text"
                              : "lucide--globe",
                          ].join(" ")}
                        />
                      </div>
                      <span
                        class="text-[15px] font-medium text-slate-700 truncate mr-1"
                        x-text="title"
                      />

                      {/* Rename Trigger (visible on hover) */}
                      <button
                        type="button"
                        {...{
                          "@click.prevent":
                            "editing = true; $nextTick(() => $refs.titleInput.focus())",
                        }}
                        class={[
                          "opacity-0 transition-all ml-auto shrink-0",
                          "group-hover:opacity-100 btn btn-ghost btn-sm btn-circle text-slate-400 hover:text-primary hover:bg-primary/10",
                        ].join(" ")}
                      >
                        <span class="iconify lucide--pencil w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="checkbox"
                      name="sourceIds"
                      value={source.id.toString()}
                      class="checkbox checkbox-sm checkbox-primary border-slate-300 shrink-0 ml-3 rounded-md"
                    />
                  </div>

                  {/* EDIT STATE (Alpine.js handled) */}
                  <div
                    x-show="editing"
                    style="display: none;"
                    class="flex items-center gap-2 w-full"
                  >
                    <input
                      x-ref="titleInput"
                      type="text"
                      name="title"
                      x-model="title"
                      class={[
                        "input input-sm input-bordered rounded-xl border-slate-300 w-full focus:outline-none bg-slate-50 font-medium",
                        "focus:border-primary focus:ring-2 focus:ring-primary/20",
                      ].join(" ")}
                      required
                      {...{
                        "@keydown.escape": `editing = false; title = '${safeTitle}'`,
                      }}
                      {...{ "@keydown.enter.prevent": "$refs.saveBtn.click()" }}
                    />
                    <div class="flex gap-2 shrink-0">
                      <button
                        x-ref="saveBtn"
                        type="button"
                        hx-patch={`/sources/${notebookId}/${source.id}`}
                        hx-include="closest .group"
                        hx-target="#sources-panel"
                        hx-swap="outerHTML"
                        class="btn btn-sm btn-primary btn-square text-white rounded-xl shadow-sm border-none"
                      >
                        <span class="iconify lucide--check w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        {...{
                          "@click": `editing = false; title = '${safeTitle}'`,
                        }}
                        class="btn btn-sm btn-square btn-ghost rounded-xl hover:bg-slate-200 text-slate-600"
                      >
                        <span class="iconify lucide--x w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Empty Context State */}
            {sources.length === 0 && (
              <div class="h-40 flex flex-col items-center justify-center text-center">
                <div class="bg-slate-100 text-slate-400 p-4 rounded-full mb-3">
                  <span class="iconify lucide--file-search text-3xl" />
                </div>
                <p class="text-slate-500 font-medium tracking-tight">
                  No sources yet
                </p>
                <p class="text-xs text-slate-400 mt-1 max-w-[200px]">
                  Add links or files above to build your notebook.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer: Multi-part File Upload */}
      <div class="p-5 border-t border-slate-200/60 flex justify-center bg-white/30 backdrop-blur-md">
        <label
          class={[
            "btn btn-outline border-slate-300 transition-all rounded-2xl w-full shadow-sm font-semibold tracking-wide cursor-pointer",
            "hover:border-primary hover:bg-primary/5 hover:text-primary text-slate-600 flex items-center justify-center gap-3",
          ].join(" ")}
        >
          <span class="iconify lucide--file-up text-lg" />
          Upload PDF File
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
