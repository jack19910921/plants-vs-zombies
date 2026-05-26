import { describe, expect, it } from "vitest";
import { LEVELS } from "./config";

describe("level config", () => {
  it("provides multiple uniquely identified levels", () => {
    expect(LEVELS.length).toBeGreaterThanOrEqual(2);
    expect(new Set(LEVELS.map((level) => level.id)).size).toBe(LEVELS.length);
  });
});
