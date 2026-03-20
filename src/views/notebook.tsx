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
        class="text-xl sm:text-[22px] font-normal tracking-tight bg-transparent border-transparent hover:border-gray-200 focus:bg-white focus:border-blue-500 border-2 rounded-md px-1 sm:px-2 py-0.5 w-full max-w-[150px] sm:max-w-xs md:max-w-md transition-colors m-0 outline-none"
        onblur="this.form.requestSubmit()"
        onkeydown="if(event.key === 'Enter') { event.preventDefault(); this.blur(); }"
      />
    </form>
  );
}

export function NotebookView(props: { notebookId: number, title: string, sources: SelectSource[] }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{props.title} - PopPopLM Notebooks</title>
        <link rel="stylesheet" href="/public/styles.css" />
        <script src="/node_modules/htmx.org/dist/htmx.min.js" defer />
        <script src="/node_modules/alpinejs/dist/cdn.min.js" defer />
      </head>
      <body class="bg-[#F8F9FA] text-black h-screen flex flex-col overflow-hidden font-sans antialiased">
        
        {/* Header */}
        <header class="bg-white border-b-[2.5px] border-black h-16 shrink-0 px-4 sm:px-6 flex items-center justify-between z-10">
          <div class="flex items-center gap-2 sm:gap-4 flex-1">
             <a href="/" class="btn btn-ghost btn-circle btn-sm sm:btn-md mr-1 shrink-0" aria-label="Go back to home">
               <span class="iconify text-xl sm:text-2xl text-gray-700 lucide--arrow-left" />
             </a>
             <a href="/" class="flex flex-shrink-0 items-center justify-center hover:opacity-80 transition-opacity">
                <img src="/public/pplmlogo.png" alt="Logo" class="h-8 sm:h-10 w-auto object-contain rounded-sm" />
             </a>
             <NotebookTitleInput notebookId={props.notebookId} title={props.title} />
          </div>
          <div class="flex items-center gap-2 sm:gap-4">
            <button class="btn btn-ghost hover:bg-transparent hidden sm:flex items-center gap-2 text-sm font-medium">
               <span class="iconify lucide--settings" />
               Settings
            </button>
            <span class="badge badge-sm rounded-[4px] border border-gray-300 text-[10px] tracking-wider hidden sm:inline-flex">PRO</span>
            <div class="bg-purple-100 text-purple-700 font-medium text-sm rounded-full w-8 h-8 flex items-center justify-center border-2 border-purple-200">
              J
            </div>
          </div>
        </header>

        {/* Responsive Layout with Alpine state for Mobile Tabs */}
        <div x-data="{ activeTab: 'chat' }" class="flex-1 flex flex-col overflow-hidden">
          
          {/* Mobile Tab Navigation */}
          <div class="md:hidden flex bg-white border-b-[2px] border-black shrink-0 z-10 px-2" style={{ WebkitOverflowScrolling: 'touch', overflowX: 'auto' }}>
            <button 
              class="flex-1 min-w-[100px] py-3.5 text-sm font-medium border-b-[3px] transition-colors duration-200" 
              x-bind:class="activeTab === 'sources' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:bg-gray-50'" 
              x-on:click="activeTab = 'sources'">
              Sources
            </button>
            <button 
              class="flex-1 min-w-[100px] py-3.5 text-sm font-medium border-b-[3px] transition-colors duration-200" 
              x-bind:class="activeTab === 'chat' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:bg-gray-50'" 
              x-on:click="activeTab = 'chat'">
              Chat
            </button>
            <button 
              class="flex-1 min-w-[100px] py-3.5 text-sm font-medium border-b-[3px] transition-colors duration-200" 
              x-bind:class="activeTab === 'studio' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:bg-gray-50'" 
              x-on:click="activeTab = 'studio'">
              Studio
            </button>
          </div>

          {/* Grid Layout Container */}
          <main class="flex-1 p-0 md:p-4 grid grid-cols-1 md:grid-cols-[minmax(280px,1fr)_minmax(400px,2fr)_minmax(280px,1fr)] lg:grid-cols-[380px_1fr_380px] gap-0 md:gap-4 overflow-hidden h-full max-w-[1920px] mx-auto w-full">
            
             {/* 1. Sources Panel */}
             <aside class="hidden md:flex flex-col h-full bg-white md:bg-transparent" x-bind:class="activeTab === 'sources' ? '!flex' : ''">
               <SourcesPanel notebookId={props.notebookId} sources={props.sources} />
             </aside>

             {/* 2. Chat Panel */}
             <section class="hidden md:flex flex-col h-full bg-white md:bg-transparent" x-bind:class="activeTab === 'chat' ? '!flex' : ''">
               <ChatPanel />
             </section>

             {/* 3. Studio Panel */}
             <aside class="hidden md:flex flex-col h-full bg-white md:bg-transparent" x-bind:class="activeTab === 'studio' ? '!flex' : ''">
               <StudioPanel />
             </aside>

          </main>
        </div>
      </body>
    </html>
  );
}
