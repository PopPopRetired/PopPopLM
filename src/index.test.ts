import { describe, expect, it } from "bun:test";

import { app } from "./index";

describe("index routes", () => {
  it("renders the scaffold page", async () => {
    const response = await app.request("/");
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain("Family Notebooks");
    expect(html).toContain('id="owner-carousel"');
    expect(html).toContain('id="notebooks-grid"');
  });
});
