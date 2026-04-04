import { expect, test, describe } from "bun:test";
import { parseMastraMessageContent } from "./mastra-message-content";

describe("mastra-message-content", () => {
  test("plain string", () => {
    expect(parseMastraMessageContent("hello")).toBe("hello");
  });
  
  test("json string text", () => {
    expect(parseMastraMessageContent('{"text":"hello"}')).toBe("hello");
  });
  
  test("json string content", () => {
    expect(parseMastraMessageContent('{"content":"hello"}')).toBe("hello");
  });
  
  test("json array parts", () => {
    expect(parseMastraMessageContent({ parts: [{ type: "text", text: "hello" }] })).toBe("hello");
  });
  
  test("json array direct", () => {
    expect(parseMastraMessageContent([{ type: "text", text: "hello" }])).toBe("hello");
  });
});
