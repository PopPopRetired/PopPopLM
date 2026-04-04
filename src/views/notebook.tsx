/**
 * @module src/views/notebook.tsx
 *
 * The layout for the individual Notebook studio experience.
 *
 * Provides a triple-column layout for desktop:
 * 1. Sources Panel (Left) — Add and manage PDFs, URLs, and text.
 * 2. Chat Panel (Center) — AI-powered RAG chat interface.
 * 3. Studio Panel (Right) — Supplemental notebook features and history.
 *
 * On mobile, this view uses an Alpine.js-powered tab switcher to rotate
 * between the three panels.
 */
import { ChatPanel } from "../components/ChatPanel";
import { SourcesPanel } from "../components/SourcesPanel";
import { StudioPanel } from "../components/StudioPanel";
import type { SelectSource } from "../db/queries/sources";

/**
 * Inline-editable title input for the notebook header.
 * Submits via HTMX when the user blurs the input or presses Enter.
 */
export function NotebookTitleInput({
  notebookId,
  title,
}: {
  notebookId: number;
  title: string;
}) {
  return (
    <form
      hx-post={`/notebooks/${notebookId}/title`}
      hx-swap="outerHTML"
      class="m-0 flex-1 flex items-center"
    >
      <input
        type="text"
        name="title"
        value={title}
        class={[
          "text-xl sm:text-2xl font-bold tracking-tight py-1 px-2 sm:px-3 w-full border-2 rounded-xl transition-all outline-none text-slate-800",
          "bg-transparent border-transparent hover:border-slate-200 hover:bg-slate-50",
          "focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10",
          "max-w-[150px] sm:max-w-xs md:max-w-md",
        ].join(" ")}
        onblur="this.form.requestSubmit()"
        onkeydown="if(event.key === 'Enter') { event.preventDefault(); this.blur(); }"
      />
    </form>
  );
}

/**
 * Main application layout for the notebook "Studio".
 */
export function NotebookView(props: {
  notebookId: number;
  title: string;
  sources: SelectSource[];
}) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{props.title} - PopPopLM Notebooks</title>
        <link rel="stylesheet" href="/public/styles.css" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script src="/node_modules/htmx.org/dist/htmx.min.js" defer />
        <script src="https://unpkg.com/htmx-ext-sse@2.2.2/sse.js" defer />
        <script src="/node_modules/alpinejs/dist/cdn.min.js" defer />
        <style>{`body { font-family: 'Inter', sans-serif; }`}</style>
      </head>

      <body
        class={[
          "bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800",
          "h-screen flex flex-col overflow-hidden antialiased selection:bg-primary selection:text-white",
        ].join(" ")}
      >
        {/* Persistent Header */}
        <header
          class={[
            "bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm shrink-0 px-4 sm:px-8",
            "h-[72px] flex items-center justify-between z-20 sticky top-0",
          ].join(" ")}
        >
          <div class="flex items-center gap-2 sm:gap-4 flex-1">
            <a
              href="/"
              class="btn btn-ghost btn-circle btn-sm sm:btn-md mr-1 shrink-0 bg-slate-100 hover:bg-slate-200 hover:-translate-x-0.5 transition-all"
              aria-label="Go back to home"
            >
              <span class="iconify text-xl sm:text-2xl text-slate-600 lucide--chevron-left" />
            </a>
            <a
              href="/"
              class="flex flex-shrink-0 items-center justify-center hover:opacity-80 transition-opacity"
            >
              <img
                src="/public/pplmlogo.png"
                alt="Logo"
                class="h-8 sm:h-10 w-auto object-contain drop-shadow-sm"
              />
            </a>
            <NotebookTitleInput
              notebookId={props.notebookId}
              title={props.title}
            />
          </div>

          <div class="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              class="btn btn-ghost btn-circle btn-sm sm:btn-md text-slate-400 hover:text-error hover:bg-error/10 transition-all"
              onclick="document.getElementById('delete_notebook_modal').showModal()"
              aria-label="Delete notebook"
            >
              <span class="iconify text-lg sm:text-xl lucide--trash-2" />
            </button>
            <span
              class={[
                "px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md shadow-sm border",
                "bg-gradient-to-r from-amber-200 to-amber-300 text-amber-800 border-amber-400/50 hidden sm:inline-flex",
              ].join(" ")}
            >
              PRO
            </span>
            <div class="bg-primary/10 text-primary font-bold text-sm rounded-full w-10 h-10 flex items-center justify-center border-2 border-primary/20 shadow-sm cursor-pointer hover:bg-primary/20 transition-colors">
              J
            </div>
          </div>
        </header>

        {/* Alpine.js state for responsive behavior */}
        <div
          x-data="{ activeTab: 'chat' }"
          class="flex-1 flex flex-col overflow-hidden relative min-h-0"
        >
          {/* Mobile Tabbed Navigation (visible on small screens) */}
          <div
            class="md:hidden flex bg-white/90 backdrop-blur-md border-b border-slate-200 shrink-0 z-10 px-2 shadow-sm"
            style={{ WebkitOverflowScrolling: "touch", overflowX: "auto" }}
          >
            <button
              class="flex-1 min-w-[100px] py-4 text-sm font-semibold border-b-[3px] transition-all duration-300"
              x-bind:class="activeTab === 'sources' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'"
              x-on:click="activeTab = 'sources'"
            >
              Sources
            </button>
            <button
              class="flex-1 min-w-[100px] py-4 text-sm font-semibold border-b-[3px] transition-all duration-300"
              x-bind:class="activeTab === 'chat' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'"
              x-on:click="activeTab = 'chat'"
            >
              Chat
            </button>
            <button
              class="flex-1 min-w-[100px] py-4 text-sm font-semibold border-b-[3px] transition-all duration-300"
              x-bind:class="activeTab === 'studio' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'"
              x-on:click="activeTab = 'studio'"
            >
              Studio
            </button>
          </div>

          {/* Triple-column grid layout */}
          <main
            class={[
              "flex-1 min-h-0 p-2 md:p-6 grid gap-2 md:gap-6 overflow-hidden h-full max-w-[1920px] mx-auto w-full z-10",
              "grid-cols-1 md:grid-cols-[minmax(280px,1fr)_minmax(400px,2fr)_minmax(280px,1fr)] lg:grid-cols-[380px_1fr_380px]",
            ].join(" ")}
          >
            {/* 1. Left Sidebar: Sources Panel */}
            <aside
              class="hidden md:flex flex-col h-full bg-white/50 md:bg-transparent rounded-3xl min-h-0"
              x-bind:class="activeTab === 'sources' ? '!flex' : ''"
            >
              <SourcesPanel
                notebookId={props.notebookId}
                sources={props.sources}
              />
            </aside>

            {/* 2. Center Stage: AI Chat Panel */}
            <section
              class="hidden md:flex flex-col h-full bg-white/50 md:bg-transparent rounded-3xl min-h-0"
              x-bind:class="activeTab === 'chat' ? '!flex' : ''"
            >
              <ChatPanel
                notebookId={props.notebookId}
                title={props.title}
                sources={props.sources}
              />
            </section>

            {/* 3. Right Sidebar: Studio Features */}
            <aside
              class="hidden md:flex flex-col h-full bg-white/50 md:bg-transparent rounded-3xl min-h-0"
              x-bind:class="activeTab === 'studio' ? '!flex' : ''"
            >
              <StudioPanel />
            </aside>
          </main>
        </div>

        {/* Notebook Deletion Confirmation Modal */}
        <dialog
          id="delete_notebook_modal"
          class="modal modal-bottom sm:modal-middle"
        >
          <div class="modal-box rounded-3xl bg-white border border-slate-200 shadow-2xl">
            <div class="flex flex-col items-center text-center py-4">
              <div class="bg-error/10 text-error p-4 rounded-full mb-5">
                <span class="iconify text-4xl lucide--triangle-alert" />
              </div>
              <h3 class="font-bold text-xl text-slate-800 mb-2">
                Delete this notebook?
              </h3>
              <p class="text-slate-500 text-sm max-w-xs">
                This will permanently delete the notebook, all its sources, and
                chat history. This action cannot be undone.
              </p>
            </div>
            <div class="modal-action justify-center gap-3 pt-2">
              <form method="dialog">
                <button class="btn btn-ghost rounded-2xl px-8 font-semibold">
                  Cancel
                </button>
              </form>
              <button
                type="button"
                hx-delete={`/notebooks/${props.notebookId}`}
                class="btn btn-error text-white rounded-2xl px-8 font-semibold shadow-md border-none hover:shadow-lg"
              >
                <span class="iconify lucide--trash-2 mr-1" />
                Delete
              </button>
            </div>
          </div>
          <form method="dialog" class="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>
      </body>
    </html>
  );
}
