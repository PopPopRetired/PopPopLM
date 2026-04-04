/**
 * @module src/components/StudioPanel.tsx
 *
 * A placeholder panel for transition-to-artifact features.
 *
 * Current State:
 * - Renders a grid of "mock" features (Audio Overview, Slide Deck, etc.)
 * - Shows sample "Library History" data to demonstrate the UI intended
 *   for managing generated AI artifacts.
 * - This panel is purely visual at this stage and serves as a preview
 *   of planned functionality.
 */

/**
 * Studio/Artifacts panel component.
 */
export function StudioPanel() {
  return (
    <div
      class={[
        "h-full flex flex-col bg-white/70 backdrop-blur-xl border border-white overflow-hidden shadow-lg rounded-3xl",
      ].join(" ")}
    >
      {/* Panel Header */}
      <div class="p-4 sm:p-6 border-b border-slate-200/60 bg-white/30 flex justify-between items-center shrink-0">
        <h2 class="font-bold text-xl text-slate-800 tracking-tight flex items-center gap-3">
          <span class="iconify text-primary text-2xl lucide--layout-grid" />
          Studio
        </h2>
        <button class="btn btn-ghost btn-circle btn-sm text-slate-500 hover:bg-slate-100">
          <span class="iconify lucide--settings-2" />
        </button>
      </div>

      {/* Main Content Area: Mock Features */}
      <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 bg-slate-50/50">
        {/* Artifact Creation Grid (Interactive Mocks) */}
        <div class="grid grid-cols-2 gap-3 sm:gap-4">
          <button
            class={[
              "group relative bg-white border border-slate-200 transition-all duration-300",
              "hover:border-sky-300 hover:shadow-md hover:-translate-y-1",
              "flex flex-col items-start p-5 rounded-2xl shadow-sm",
            ].join(" ")}
          >
            <div class="bg-sky-50 text-sky-500 p-2.5 rounded-xl mb-3 group-hover:bg-sky-500 group-hover:text-white transition-colors">
              <span class="iconify text-2xl lucide--headphones" />
            </div>
            <span class="text-sm font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
              Audio Overview
            </span>
            <div class="absolute top-4 right-4 bg-slate-100 text-slate-400 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="iconify text-xs lucide--plus" />
            </div>
          </button>

          <button
            class={[
              "group relative bg-white border border-slate-200 transition-all duration-300",
              "hover:border-amber-300 hover:shadow-md hover:-translate-y-1",
              "flex flex-col items-start p-5 rounded-2xl shadow-sm",
            ].join(" ")}
          >
            <div class="bg-amber-50 text-amber-500 p-2.5 rounded-xl mb-3 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <span class="iconify text-2xl lucide--presentation" />
            </div>
            <span class="text-sm font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
              Slide Deck
            </span>
            <div class="absolute top-4 right-4 bg-slate-100 text-slate-400 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="iconify text-xs lucide--plus" />
            </div>
          </button>

          <button
            class={[
              "group relative bg-white border border-slate-200 transition-all duration-300",
              "hover:border-green-300 hover:shadow-md hover:-translate-y-1",
              "flex flex-col items-start p-5 rounded-2xl shadow-sm",
            ].join(" ")}
          >
            <div class="bg-green-50 text-green-500 p-2.5 rounded-xl mb-3 group-hover:bg-green-500 group-hover:text-white transition-colors">
              <span class="iconify text-2xl lucide--video" />
            </div>
            <span class="text-sm font-bold text-slate-800 group-hover:text-green-600 transition-colors">
              Video Guide
            </span>
            <div class="absolute top-4 right-4 bg-slate-100 text-slate-400 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="iconify text-xs lucide--plus" />
            </div>
          </button>

          <button
            class={[
              "group relative bg-white border border-slate-200 transition-all duration-300",
              "hover:border-fuchsia-300 hover:shadow-md hover:-translate-y-1",
              "flex flex-col items-start p-5 rounded-2xl shadow-sm",
            ].join(" ")}
          >
            <div class="bg-fuchsia-50 text-fuchsia-500 p-2.5 rounded-xl mb-3 group-hover:bg-fuchsia-500 group-hover:text-white transition-colors">
              <span class="iconify text-2xl lucide--file-text" />
            </div>
            <span class="text-sm font-bold text-slate-800 group-hover:text-fuchsia-600 transition-colors">
              Reports
            </span>
            <div class="absolute top-4 right-4 bg-slate-100 text-slate-400 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
              <span class="iconify text-xs lucide--plus" />
            </div>
          </button>
        </div>

        {/* List Header/Divider */}
        <div class="flex items-center gap-3">
          <div class="h-px bg-slate-200 flex-1" />
          <span class="text-xs font-bold uppercase tracking-widest text-slate-400">
            Library History
          </span>
          <div class="h-px bg-slate-200 flex-1" />
        </div>

        {/* History List: Sample Records */}
        <div class="space-y-3">
          <div class="flex items-start gap-4 group bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer">
            <div class="bg-sky-50 text-sky-500 p-2.5 rounded-xl shrink-0">
              <span class="iconify text-lg lucide--headphones" />
            </div>
            <div class="flex-1 min-w-0 py-1">
              <p class="text-[15px] font-bold text-slate-800 truncate leading-tight mb-1 group-hover:text-primary transition-colors">
                Saint Peter, Philosophy
              </p>
              <div class="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span class="bg-slate-100 px-2 py-0.5 rounded-md">
                  9 sources
                </span>
                <span>•</span>
                <span>20d ago</span>
              </div>
            </div>
            <div class="flex items-center -mr-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button class="btn btn-ghost btn-circle btn-sm text-slate-400 hover:text-primary hover:bg-primary/10">
                <span class="iconify lucide--play fill-current w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Panel Action Button */}
      <div class="p-5 border-t border-slate-200/60 flex justify-center bg-white/30 backdrop-blur-md shrink-0">
        <button class="btn btn-primary text-white hover:scale-105 rounded-2xl shadow-md border-none px-8 w-full font-bold tracking-wide transition-all">
          <span class="iconify lucide--sparkles mr-1" />
          Generate New Artifact
        </button>
      </div>
    </div>
  );
}
