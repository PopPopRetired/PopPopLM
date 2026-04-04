/**
 * @module src/components/notebook/welcome-panel.tsx
 *
 * The AI-generated welcome experience for a notebook.
 *
 * Renders a visually rich introduction based on the notebook's sources:
 * - A contextual emoji and title
 * - A concise summary of the notebook's contents
 * - Three "quick-start" questions derived by the AI
 *
 * Each question has an `onclick` handler that populates and focuses
 * the main message input for immediate interaction.
 */

/**
 * AI Welcome Panel component.
 */
export function WelcomePanel({
  emoji,
  title,
  sourcesCount,
  summary,
  q1,
  q2,
  q3,
}: {
  emoji: string;
  title: string;
  sourcesCount: number;
  summary: string;
  q1: string;
  q2: string;
  q3: string;
}) {
  return (
    <div
      class={[
        "w-full max-w-4xl mx-auto px-2 fade-in",
        "animate-in slide-in-from-bottom-2 duration-500",
      ].join(" ")}
    >
      {/* Introduction Header */}
      <div class="mb-4">
        <div class="text-4xl mb-4">{emoji}</div>
        <h1 class="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight leading-tight mb-2">
          {title}
        </h1>
        <p class="text-sm font-medium text-slate-500">
          {sourcesCount} source{sourcesCount === 1 ? "" : "s"}
        </p>
      </div>

      {/* Narrative AI Summary */}
      <p class="text-slate-700 text-[15px] sm:text-[16px] leading-relaxed mb-6">
        {summary}
      </p>

      {/* Interaction Bar */}
      <div class="flex items-center gap-1 sm:gap-2 mb-8">
        <button
          class={[
            "btn btn-sm bg-white border border-slate-200 shadow-sm transition-all focus:outline-none",
            "rounded-full text-slate-600 hover:bg-slate-50 hover:border-slate-300 font-medium px-4",
          ].join(" ")}
        >
          <span class="iconify lucide--pin text-[15px] opacity-70" /> Save to
          note
        </button>
        <button class="btn btn-sm btn-ghost btn-circle hover:bg-slate-100 text-slate-500 transition-colors">
          <span class="iconify lucide--copy text-[17px]" />
        </button>
        <button class="btn btn-sm btn-ghost btn-circle hover:bg-slate-100 text-slate-500 transition-colors">
          <span class="iconify lucide--thumbs-up text-[17px]" />
        </button>
        <button class="btn btn-sm btn-ghost btn-circle hover:bg-slate-100 text-slate-500 transition-colors">
          <span class="iconify lucide--thumbs-down text-[17px]" />
        </button>
      </div>

      {/* Suggested Follow-up Questions */}
      <div class="space-y-3 flex flex-col items-start w-full">
        {[q1, q2, q3].map((q, i) => (
          <button
            key={i}
            class={[
              "text-left text-[14px] sm:text-[15px] font-medium text-slate-700 bg-white border border-slate-200 shadow-sm transition-all cursor-pointer px-5 py-3 rounded-2xl",
              "hover:border-primary/30 hover:shadow hover:bg-primary/5",
            ].join(" ")}
            onclick={[
              `document.getElementById('message-input').value = '${q.replace(
                /'/g,
                "\\'",
              )}';`,
              "document.getElementById('message-input').focus();",
            ].join(" ")}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
