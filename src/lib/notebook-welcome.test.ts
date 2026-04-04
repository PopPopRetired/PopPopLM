import { expect, test, describe } from "bun:test";
import { getWelcomePrompt, parseWelcomeAgentResponse } from "./notebook-welcome";

describe("notebook-welcome", () => {
  test("getWelcomePrompt includes context", () => {
    const prompt = getWelcomePrompt("some text");
    expect(prompt).toContain("some text");
    expect(prompt).toContain("EMOJI: [emoji]");
  });
  
  test("parseWelcomeAgentResponse exact match", () => {
    const text = `EMOJI: 🚀\nSUMMARY: This is a summary.\nQ1: How does it work?\nQ2: What is the cost?\nQ3: When will it launch?`;
    const res = parseWelcomeAgentResponse(text);
    expect(res.emoji).toBe("🚀");
    expect(res.summary).toBe("This is a summary.");
    expect(res.q1).toBe("How does it work?");
  });
  
  test("parseWelcomeAgentResponse falls back to defaults", () => {
    const res = parseWelcomeAgentResponse("invalid text");
    expect(res.emoji).toBe("📚");
    expect(res.summary).toBe("Welcome to your notebook! Feel free to ask questions about your sources.");
  });
});
