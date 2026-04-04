/**
 * @module src/components/NotebooksGrid.tsx
 *
 * A responsive grid display for notebooks.
 *
 * Features:
 * - Shows an "Empty State" hero if no owner is selected (invites registration)
 * - Includes a "Create Notebook" CTA card when an owner is active
 * - Renders notebook cards with metadata (title, date, source count)
 * - Supports HTMX Out-of-Band (OOB) swaps for instant UI updates when
 *   registering a new owner
 */
import type { FormattedNotebook } from "../types/home";

/**
 * Grid component for the homepage.
 */
export function NotebooksGrid({
  notebooks,
  ownerIdFilter,
  isOob = false,
}: {
  notebooks: FormattedNotebook[];
  ownerIdFilter?: number;
  isOob?: boolean;
}) {
  const hasSelectedOwner =
    typeof ownerIdFilter === "number" && !isNaN(ownerIdFilter) && ownerIdFilter > 0;

  // Attributes for HTMX Out-of-Band updates
  const oobAttr = isOob ? { "hx-swap-oob": "outerHTML" } : {};

  return (
    <div
      id="notebooks-grid-wrapper"
      class="w-full flex flex-col gap-8"
      {...oobAttr}
    >
      {/* Registration CTA Hero (only shown when no owner is selected) */}
      {!hasSelectedOwner && (
        <div
          class={[
            "w-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/60 rounded-[2rem] p-6 sm:p-10",
            "flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm relative overflow-hidden",
          ].join(" ")}
        >
          <div class="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div class="text-center sm:text-left z-10">
            <h3 class="text-2xl font-bold text-slate-800 mb-2">
              Looking for your notebooks?
            </h3>
            <p class="text-slate-600 font-medium text-lg">
              Register a profile to start tracking your own family sources.
            </p>
          </div>
          <button
            type="button"
            class={[
              "btn btn-primary text-white rounded-2xl shadow-md border-none px-10 py-3 sm:py-0 h-auto sm:h-14 font-bold text-base",
              "hover:shadow-xl hover:scale-105 transition-all z-10",
            ].join(" ")}
            onclick="document.getElementById('register_modal').showModal()"
          >
            Register Profile
          </button>
        </div>
      )}

      {/* Main Grid: CTAs + Notebook Cards */}
      <div
        id="notebooks-grid"
        class={[
          "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-5 sm:gap-6 w-full pb-16",
        ].join(" ")}
      >
        {/* 'Create' Slot (only shown when an owner is active) */}
        {hasSelectedOwner && (
          <form hx-post="/notebooks" class="contents">
            <input type="hidden" name="ownerId" value={ownerIdFilter} />
            <button
              type="submit"
              class={[
                "card bg-white/40 border-2 border-dashed border-slate-300 transition-all duration-300",
                "hover:border-primary hover:bg-white hover:shadow-xl hover:-translate-y-2",
                "flex flex-col items-center justify-center min-h-[220px] p-6 rounded-3xl group cursor-pointer w-full h-full",
              ].join(" ")}
            >
              <div
                class={[
                  "bg-primary/10 text-primary rounded-full w-16 h-16 flex items-center justify-center mb-5 transition-all duration-300",
                  "group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-primary/30",
                ].join(" ")}
              >
                <span class="iconify text-3xl lucide--plus" />
              </div>
              <span class="font-bold text-lg text-slate-500 group-hover:text-primary transition-colors">
                Create Notebook
              </span>
            </button>
          </form>
        )}

        {/* Dynamic Notebook Cards */}
        {notebooks.map((nb: FormattedNotebook, i: number) => (
          <a
            href={`/notebooks/${nb.id}`}
            key={i}
            class={[
              "card bg-white border border-slate-100 shadow-sm transition-all duration-300 px-7 py-7 rounded-3xl cursor-pointer group no-underline relative overflow-hidden",
              "hover:border-primary/20 hover:shadow-2xl hover:-translate-y-2 flex flex-col min-h-[240px]",
            ].join(" ")}
          >
            <div class="absolute -top-12 -right-12 w-36 h-36 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/15 transition-colors duration-500" />

            <div class="w-full flex justify-start mb-5">
              <div
                class={[
                  "bg-blue-50 text-blue-500 p-4 rounded-2xl transition-all duration-300",
                  "group-hover:bg-blue-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/30",
                ].join(" ")}
              >
                <span class="iconify text-3xl lucide--book-open" />
              </div>
            </div>

            <div class="flex-1 w-full flex flex-col justify-start">
              <h2 class="text-xl font-bold leading-tight mb-2 text-slate-800 line-clamp-3 group-hover:text-primary transition-colors">
                {nb.title}
              </h2>
            </div>

            <div class="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <span>{nb.date}</span>
              <span class="bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600">
                {nb.sources}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
