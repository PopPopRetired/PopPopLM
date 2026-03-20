import { OwnerCarousel } from "../components/OwnerCarousel";
import { NotebooksGrid } from "../components/NotebooksGrid";

export function HomeView({ notebooks, dbOwners }: { notebooks: any[], dbOwners: any[] }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>PopPopLM</title>
        <link rel="stylesheet" href="/public/styles.css" />
        <script src="/node_modules/htmx.org/dist/htmx.min.js" defer />
        <script src="/node_modules/alpinejs/dist/cdn.min.js" defer />
      </head>
      <body class="min-h-screen bg-white text-black font-sans antialiased">
        <div class="mx-auto w-full max-w-screen-2xl flex flex-col p-4 sm:p-6">
          {/* Header */}
          <header class="flex items-center mb-8">
            <a href="/" class="flex items-center gap-3 no-underline group hover:opacity-80 transition-opacity">
              <img src="/public/pplmlogo.png" alt="PopPopLM Logo" class="h-10 w-auto object-contain rounded-sm" />
              <span class="text-xl font-medium tracking-tight">PopPopLM</span>
            </a>
          </header>

          <main class="flex-1 w-full max-w-[1400px] mx-auto flex flex-col items-center">
            {/* Title */}
            <h1 class="text-[32px] md:text-[38px] font-normal tracking-tight mb-8 text-center">
              Family Notebooks
            </h1>

            {/* Filters Carousel */}
            <OwnerCarousel dbOwners={dbOwners} />

            {/* Grid */}
            <NotebooksGrid notebooks={notebooks} />
          </main>
        </div>

        {/* Register Modal */}
        <dialog id="register_modal" class="modal">
          <div class="modal-box bg-white border-[2.5px] border-black rounded-none shadow-none max-w-sm">
            <h3 class="font-normal text-2xl mb-6 tracking-tight">Register</h3>
            <form
              hx-post="/fragments/owners"
              hx-target="#owner-carousel"
              hx-swap="outerHTML"
              class="flex flex-col gap-4"
              onsubmit="document.getElementById('register_modal').close()"
            >
              <div class="form-control w-full">
                <label class="label px-0">
                  <span class="label-text text-black font-medium text-base">Your Name</span>
                </label>
                <input type="text" name="name" placeholder="E.g. James" class="input input-bordered w-full rounded-none border-[2.5px] border-black focus:outline-none focus:border-black" required />
              </div>
              <div class="modal-action mt-4 flex gap-3">
                <button type="button" class="btn btn-ghost rounded-none border-[2.5px] border-transparent hover:border-black hover:bg-gray-100" onclick="document.getElementById('register_modal').close()">Cancel</button>
                <button type="submit" class="btn bg-black text-white hover:bg-gray-800 rounded-none border-[2.5px] border-black flex-1">Register</button>
              </div>
            </form>
          </div>
          <form method="dialog" class="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>

        <script>
          {`document.body.addEventListener("htmx:afterSwap", (event) => {
  const target = event.detail && event.detail.target;
  if (target && window.Alpine && typeof window.Alpine.initTree === "function") {
    window.Alpine.initTree(target);
  }
});`}
        </script>
      </body>
    </html>
  );
}
