import { describe, expect, it } from "vitest";
import { LEVELS } from "./config";

describe("level config", () => {
  it("provides multiple uniquely identified levels", () => {
    expect(LEVELS.length).toBeGreaterThanOrEqual(3);
    expect(new Set(LEVELS.map((level) => level.id)).size).toBe(LEVELS.length);
    expect(LEVELS[2].waves.length).not.toBe(LEVELS[0].waves.length);
    expect(LEVELS[0].allowedPlants).not.toContain("snowpea");
    expect(LEVELS[0].allowedPlants).not.toContain("potatomine");
    expect(LEVELS[1].allowedPlants).toContain("snowpea");
    expect(LEVELS[2].allowedPlants).toContain("potatomine");
  });
});
