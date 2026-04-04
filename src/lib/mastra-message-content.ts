/**
 * @module src/lib/mastra-message-content.ts
 *
 * Normalizes Mastra message content into a plain string.
 *
 * Mastra stores message content in different shapes depending on the model
 * provider and SDK version:
 * - A plain string (most common for user messages)
 * - A JSON object with a `text` or `content` key
 * - An object with a `parts` array (multi-part model responses)
 * - A raw array of `{ type: 'text', text: '...' }` objects
 *
 * This function tries each shape in order and returns the first match,
 * making downstream rendering code simple — it always gets a string.
 */

/**
 * Extracts a clean text string from Mastra's polymorphic message content.
 *
 * @param content - Raw message content from Mastra storage (string, object, or array).
 * @returns A plain text string suitable for rendering in the UI.
 *
 * @example
 * parseMastraMessageContent("hello")              // → "hello"
 * parseMastraMessageContent({ text: "hello" })    // → "hello"
 * parseMastraMessageContent({ parts: [{ type: "text", text: "hello" }] }) // → "hello"
 */
export function parseMastraMessageContent(content: unknown): string {
  let parsed = content;

  // Attempt JSON parse if it's a string that looks like JSON
  if (typeof content === "string") {
    try {
      parsed = JSON.parse(content);
    } catch {
      return content; // Not JSON — plain string, return as-is
    }
  }

  if (parsed && typeof parsed === "object") {
    // Shape: { text: "..." }  or  { content: "..." }
    const obj = parsed as Record<string, unknown>;
    if (typeof obj.text === "string") return obj.text;
    if (typeof obj.content === "string") return obj.content;

    // Shape: { parts: [{ type: "text", text: "..." }, ...] }
    if (Array.isArray(obj.parts) && obj.parts.length > 0) {
      const textParts = obj.parts.filter(
        (part: Record<string, unknown>) => part.type === "text",
      );
      if (textParts.length > 0) {
        return textParts
          .map((part: Record<string, unknown>) => part.text)
          .join("\n");
      }
    }

    // Shape: [{ type: "text", text: "..." }, ...] (top-level array)
    if (Array.isArray(parsed) && parsed.length > 0) {
      const textParts = parsed.filter(
        (part: Record<string, unknown>) => part.type === "text",
      );
      if (textParts.length > 0) {
        return textParts
          .map((part: Record<string, unknown>) => part.text)
          .join("\n");
      }
    }
  }

  // Last resort: return original string or JSON-serialize
  return typeof content === "string" ? content : JSON.stringify(content);
}
