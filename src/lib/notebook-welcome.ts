/**
 * @module src/lib/notebook-welcome.ts
 *
 * Helpers for the AI-generated "welcome panel" shown when a user first
 * opens a notebook (or after clearing chat history).
 *
 * The flow works via a structured prompt/response contract:
 * 1. `getWelcomePrompt` builds a prompt asking the AI to analyze notebook
 *    sources and return an emoji, summary, and 3 suggested questions.
 * 2. `parseWelcomeAgentResponse` extracts those fields from the AI's
 *    text response using regex against known labels (EMOJI, SUMMARY, Q1-Q3).
 *
 * The format is intentionally simple and regex-parseable — no JSON parsing
 * required, which is more reliable with smaller/cheaper models.
 */

/**
 * Builds a structured prompt that instructs the AI to analyze notebook sources
 * and return a welcome message in a specific parseable format.
 *
 * @param content - Concatenated source content from the notebook.
 * @returns A prompt string ready to send to the agent.
 */
export function getWelcomePrompt(content: string): string {
  return [
    "Based on the following sources in the user's notebook:",
    "",
    content,
    "",
    "Provide an appropriate single emoji, a 1 paragraph summary (approx 3-4 sentences), and exactly 3 suggested questions the user could ask.",
    "Format EXACTLY like this:",
    "EMOJI: [emoji]",
    "SUMMARY: [summary]",
    "Q1: [q1]",
    "Q2: [q2]",
    "Q3: [q3]",
  ].join("\n");
}

/**
 * Parses the agent's plain-text response into structured welcome panel data.
 *
 * Uses regex to extract labeled fields. Falls back to sensible defaults if
 * the AI doesn't follow the format perfectly.
 *
 * @param text - Raw text response from the agent.
 * @returns An object with `emoji`, `summary`, `q1`, `q2`, `q3` strings.
 */
export function parseWelcomeAgentResponse(text: string) {
  const emojiMatch = text.match(/EMOJI:\s*(.*?)(?=SUMMARY:)/s);
  const summaryMatch = text.match(/SUMMARY:\s*(.*?)(?=Q1:)/s);
  const q1Match = text.match(/Q1:\s*(.*?)(?=Q2:)/s);
  const q2Match = text.match(/Q2:\s*(.*?)(?=Q3:)/s);
  const q3Match = text.match(/Q3:\s*(.*)/s);

  return {
    emoji: emojiMatch?.[1]?.trim() ?? "📚",
    summary:
      summaryMatch?.[1]?.trim() ??
      "Welcome to your notebook! Feel free to ask questions about your sources.",
    q1: q1Match?.[1]?.trim() ?? "What are the main topics covered?",
    q2: q2Match?.[1]?.trim() ?? "Can you summarize the key points?",
    q3: q3Match?.[1]?.trim() ?? "What are the actionable takeaways?",
  };
}
