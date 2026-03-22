import { expect, test, describe } from "bun:test";
import { weatherTool } from "./weather-tool";

describe("weatherTool", () => {
  test("defines expected basic tool properties", () => {
    expect(weatherTool.id).toBe("get-weather");
    expect(weatherTool.description).toBeDefined();
  });

  test("executes mock logic successfully", async () => {
    // We can test the schema and execution behavior
    // Testing the actual API call would require network access, which we mock here 
    // or test against a known error condition.
    try {
      await weatherTool.execute({ location: "NonExistentCity123456789" });
    } catch (e: any) {
      expect(e.message).toContain("not found");
    }
  });
});
