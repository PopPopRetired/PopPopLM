import { SourcesPanel } from "../components/SourcesPanel";
import { ChatPanel } from "../components/ChatPanel";
import { StudioPanel } from "../components/StudioPanel";
import type { SelectSource } from "../db/queries/sources";

export function NotebookTitleInput({ notebookId, title }: { notebookId: number, title: string }) {
  return (
    <form hx-post={`/notebooks/${notebookId}/title`} hx-swap="outerHTML" class="m-0 flex-1 flex items-center">
      <input
        type="text"
        name="title"
        value={title}
        class="text-xl sm:text-2xl font-bold tracking-tight bg-transparent border-transparent hover:border-slate-200 hover:bg-slate-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 border-2 rounded-xl px-2 sm:px-3 py-1 w-full max-w-[150px] sm:max-w-xs md:max-w-md transition-all m-0 outline-none text-slate-800"
        onblur="this.form.requestSubmit()"
        onkeydown="if(event.key === 'Enter') { event.preventDefault(); this.blur(); }"
      />
    </form>
  );
}

export function NotebookView(props: { notebookId: number, title: string, sources: SelectSource[] }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{props.title} - PopPopLM Notebooks</title>
        <link rel="stylesheet" href="/public/styles.css" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <script src="/node_modules/htmx.org/dist/htmx.min.js" defer />
        <script src="/node_modules/alpinejs/dist/cdn.min.js" defer />
        <style>
          {`body { font-family: 'Inter', sans-serif; }`}
        </style>
      </head>
      <body class="bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 h-screen flex flex-col overflow-hidden antialiased selection:bg-primary selection:text-white">
        
        {/* Header */}
        <header class="bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm h-[72px] shrink-0 px-4 sm:px-8 flex items-center justify-between z-20 sticky top-0">
          <div class="flex items-center gap-2 sm:gap-4 flex-1">
             <a href="/" class="btn btn-ghost btn-circle btn-sm sm:btn-md mr-1 shrink-0 bg-slate-100 hover:bg-slate-200 hover:-translate-x-0.5 transition-all" aria-label="Go back to home">
               <span class="iconify text-xl sm:text-2xl text-slate-600 lucide--chevron-left" />
             </a>
             <a href="/" class="flex flex-shrink-0 items-center justify-center hover:opacity-80 transition-opacity">
                <img src="/public/pplmlogo.png" alt="Logo" class="h-8 sm:h-10 w-auto object-contain drop-shadow-sm" />
             </a>
             <NotebookTitleInput notebookId={props.notebookId} title={props.title} />
          </div>
          <div class="flex items-center gap-2 sm:gap-4">
             <span class="px-2 py-1 bg-gradient-to-r from-amber-200 to-amber-300 text-amber-800 text-[10px] font-bold uppercase tracking-widest rounded-md shadow-sm hidden sm:inline-flex border border-amber-400/50">PRO</span>
            <div class="bg-primary/10 text-primary font-bold text-sm rounded-full w-10 h-10 flex items-center justify-center border-2 border-primary/20 shadow-sm cursor-pointer hover:bg-primary/20 transition-colors">
              J
            </div>
          </div>
        </header>

        {/* Responsive Layout with Alpine state for Mobile Tabs */}
        <div x-data="{ activeTab: 'chat' }" class="flex-1 flex flex-col overflow-hidden relative">
          
          {/* Mobile Tab Navigation */}
          <div class="md:hidden flex bg-white/90 backdrop-blur-md border-b border-slate-200 shrink-0 z-10 px-2 shadow-sm" style={{ WebkitOverflowScrolling: 'touch', overflowX: 'auto' }}>
            <button 
              class="flex-1 min-w-[100px] py-4 text-sm font-semibold border-b-[3px] transition-all duration-300" 
              x-bind:class="activeTab === 'sources' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'" 
              x-on:click="activeTab = 'sources'">
              Sources
            </button>
            <button 
              class="flex-1 min-w-[100px] py-4 text-sm font-semibold border-b-[3px] transition-all duration-300" 
              x-bind:class="activeTab === 'chat' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'" 
              x-on:click="activeTab = 'chat'">
              Chat
            </button>
            <button 
              class="flex-1 min-w-[100px] py-4 text-sm font-semibold border-b-[3px] transition-all duration-300" 
              x-bind:class="activeTab === 'studio' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'" 
              x-on:click="activeTab = 'studio'">
              Studio
            </button>
          </div>

          {/* Grid Layout Container */}
          <main class="flex-1 p-2 md:p-6 grid grid-cols-1 md:grid-cols-[minmax(280px,1fr)_minmax(400px,2fr)_minmax(280px,1fr)] lg:grid-cols-[380px_1fr_380px] gap-2 md:gap-6 overflow-hidden h-full max-w-[1920px] mx-auto w-full z-10">
            
             {/* 1. Sources Panel */}
             <aside class="hidden md:flex flex-col h-full bg-white/50 md:bg-transparent rounded-3xl" x-bind:class="activeTab === 'sources' ? '!flex' : ''">
               <SourcesPanel notebookId={props.notebookId} sources={props.sources} />
             </aside>

             {/* 2. Chat Panel */}
             <section class="hidden md:flex flex-col h-full bg-white/50 md:bg-transparent rounded-3xl" x-bind:class="activeTab === 'chat' ? '!flex' : ''">
               <ChatPanel />
             </section>

             {/* 3. Studio Panel */}
             <aside class="hidden md:flex flex-col h-full bg-white/50 md:bg-transparent rounded-3xl" x-bind:class="activeTab === 'studio' ? '!flex' : ''">
               <StudioPanel />
             </aside>

          </main>
        </div>
      </body>
    </html>
  );
}
