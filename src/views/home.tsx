/**
 * @module src/views/home.tsx
 *
 * The root container for the PopPopLM landing page.
 *
 * Renders the initial HTML structure, including:
 * - Meta tags and third-party script/font imports
 * - Global header and responsive container
 * - The family member selection carousel
 * - The main notebooks directory grid
 * - A standard registration modal for adding family members
 *
 * Uses HTMX for partial page updates and Alpine.js for interactive UI state.
 */
import { NotebooksGrid } from "../components/NotebooksGrid";
import { OwnerCarousel } from "../components/OwnerCarousel";
import type { FormattedNotebook, SelectOwner } from "../types/home";

/**
 * Values required to render the full homepage.
 */
interface HomeViewProps {
  /** List of notebooks to show in the main grid. */
  notebooks: FormattedNotebook[];
  /** List of all family members for the selection carousel. */
  dbOwners: SelectOwner[];
}

export function HomeView({ notebooks, dbOwners }: HomeViewProps) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>PopPopLM</title>
        <link rel="stylesheet" href="/public/styles.css" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script src="/node_modules/htmx.org/dist/htmx.min.js" defer></script>
        <script src="/node_modules/alpinejs/dist/cdn.min.js" defer></script>
        <style>{`body { font-family: 'Inter', sans-serif; }`}</style>
      </head>

      <body
        class={[
          "min-h-screen antialiased selection:bg-primary selection:text-white",
          "bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800",
        ].join(" ")}
      >
        <div class="mx-auto w-full max-w-[1600px] flex flex-col p-4 sm:p-8">
          {/* Header */}
          <header class="flex items-center mb-10 sm:mb-16">
            <a href="/" class="flex items-center gap-3 no-underline group">
              <div
                class={[
                  "bg-white p-2 rounded-xl shadow-sm border border-slate-200 transition-all duration-300",
                  "group-hover:shadow-md group-hover:border-primary/40",
                ].join(" ")}
              >
                <img
                  src="/public/pplmlogo.png"
                  alt="PopPopLM Logo"
                  class="h-8 w-auto object-contain"
                />
              </div>
              <span
                class={[
                  "text-2xl font-bold tracking-tight text-slate-900 transition-colors",
                  "group-hover:text-primary",
                ].join(" ")}
              >
                PopPopLM
              </span>
            </a>
          </header>

          <main class="flex-1 w-full max-w-6xl mx-auto flex flex-col items-center">
            {/* Page Hero */}
            <div class="text-center mb-12 w-full">
              <h1 class="text-4xl md:text-[3.5rem] font-extrabold tracking-tight text-slate-900 mb-4 drop-shadow-sm">
                Family Notebooks
              </h1>
              <p class="text-slate-500 text-lg sm:text-xl font-medium">
                Organize and share your knowledge, securely.
              </p>
            </div>

            {/* Interactive Section */}
            <OwnerCarousel dbOwners={dbOwners} />
            <NotebooksGrid notebooks={notebooks} />
          </main>
        </div>

        {/* Family Member Registration Modal */}
        <dialog id="register_modal" class="modal modal-bottom sm:modal-middle">
          <div class="modal-box bg-white rounded-3xl shadow-2xl border border-slate-100 sm:max-w-md p-8">
            <h3 class="font-extrabold text-2xl text-slate-900 mb-2">
              Create Profile
            </h3>
            <p class="text-slate-500 mb-8 font-medium">
              Register your name to start managing your own sources.
            </p>

            <form
              hx-post="/fragments/owners"
              hx-target="#owner-carousel"
              hx-swap="outerHTML"
              class="flex flex-col gap-6"
              onsubmit="document.getElementById('register_modal').close()"
            >
              <div class="form-control w-full">
                <label class="label px-1 pt-0 pb-2">
                  <span class="label-text text-slate-700 font-semibold text-sm uppercase tracking-wide">
                    Your Name
                  </span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="E.g. James"
                  class={[
                    "input input-bordered w-full rounded-2xl transition-all text-lg py-6",
                    "bg-slate-50 border-slate-200 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10",
                  ].join(" ")}
                  required
                />
              </div>

              <div class="modal-action mt-4 m-0 flex gap-3">
                <button
                  type="button"
                  class="btn btn-ghost rounded-2xl hover:bg-slate-100 flex-1 font-semibold text-slate-600"
                  onclick="document.getElementById('register_modal').close()"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class={[
                    "btn btn-primary text-white rounded-2xl shadow-md border-none flex-1 font-bold text-base",
                    "hover:shadow-lg hover:scale-[1.02] transition-all",
                  ].join(" ")}
                >
                  Register
                </button>
              </div>
            </form>
          </div>

          <form method="dialog" class="modal-backdrop">
            <button class="cursor-default bg-slate-900/20 backdrop-blur-sm">
              close
            </button>
          </form>
        </dialog>

        {/* Alpine.js Initializer Script for HTMX content */}
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
