/**
 * @module src/components/notebook/history.tsx
 *
 * Renders previous conversation messages from the Mastra memory store.
 *
 * This component is used to "hydrate" the chat window with existing
 * discourse after a page reload or navigation. It Uses consistent
 * styling with the live chat bubbles.
 */

/**
 * Historical message list component.
 */
export function ChatHistory({
  chatMessages,
  parseContent,
}: {
  chatMessages: Record<string, any>[];
  parseContent: (c: unknown) => string;
}) {
  return (
    <>
      {chatMessages.map((msg, i) => {
        const cleanText = parseContent(msg.content);
        const isUser = msg.role === "user";

        return (
          <div
            key={i}
            class={[
              "max-w-3xl mx-auto space-y-4 text-[15px] leading-relaxed p-6 rounded-2xl shadow-sm border mb-4",
              isUser
                ? "bg-slate-100 text-slate-800 border-slate-200 ml-auto w-[80%]"
                : "bg-white text-slate-700 border-slate-100 w-full",
            ].join(" ")}
          >
            {isUser ? (
              <p class="font-medium text-right">{cleanText}</p>
            ) : (
              // AI responses may contain multi-line text (e.g. lists or summaries)
              cleanText
                .split("\n")
                .map((line: string, j: number) => (
                  <p key={j} class="min-h-[1lh]">
                    {line}
                  </p>
                ))
            )}
          </div>
        );
      })}
    </>
  );
}
