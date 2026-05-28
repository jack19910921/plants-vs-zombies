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

  it("limits lawn mower defenses to one or two configured lanes per level", () => {
    LEVELS.forEach((level) => {
      expect(level.mowerLanes.length).toBeGreaterThanOrEqual(1);
      expect(level.mowerLanes.length).toBeLessThanOrEqual(2);
      expect(new Set(level.mowerLanes).size).toBe(level.mowerLanes.length);
      level.mowerLanes.forEach((lane) => {
        expect(lane).toBeGreaterThanOrEqual(0);
        expect(lane).toBeLessThanOrEqual(4);
      });
    });
  });
});
