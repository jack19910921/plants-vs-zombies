import { describe, expect, it } from "vitest";
import { DEFAULT_SCENE_THEME_ID, SCENE_THEMES, getSceneTheme } from "./sceneThemes";

describe("scene themes", () => {
  it("defines exactly three first-version scenes with a valid default", () => {
    expect(SCENE_THEMES).toHaveLength(3);
    expect(new Set(SCENE_THEMES.map((theme) => theme.id)).size).toBe(3);
    expect(SCENE_THEMES.map((theme) => theme.id)).toEqual(["sunny-lawn", "dewy-garden", "starlight-farm"]);
    expect(getSceneTheme(DEFAULT_SCENE_THEME_ID).id).toBe("sunny-lawn");
  });

  it("keeps scene labels and hints short enough for iPad cards", () => {
    SCENE_THEMES.forEach((theme) => {
      expect(theme.name.length).toBeLessThanOrEqual(5);
      expect(theme.pickerHint.length).toBeLessThanOrEqual(14);
      expect(theme.hudHint.length).toBeLessThanOrEqual(12);
    });
  });

  it("keeps scene rule adjustments conservative", () => {
    const sunny = getSceneTheme("sunny-lawn");
    const dewy = getSceneTheme("dewy-garden");
    const starlight = getSceneTheme("starlight-farm");

    expect(sunny.adjustments).toEqual({});
    expect(dewy.adjustments.firstWaveDelayMs).toBeGreaterThanOrEqual(2500);
    expect(dewy.adjustments.firstWaveDelayMs).toBeLessThanOrEqual(4500);
    expect(starlight.adjustments.zombieSpeedMultiplier).toBeGreaterThanOrEqual(0.86);
    expect(starlight.adjustments.zombieSpeedMultiplier).toBeLessThan(1);
    expect(starlight.adjustments.startingSunDelta).toBeGreaterThanOrEqual(-25);
  });

  it("gives each scene a distinct visual identity", () => {
    expect(new Set(SCENE_THEMES.map((theme) => theme.presentation.decoration))).toEqual(
      new Set(["sun-rays", "dew-beads", "star-glints"])
    );
    expect(new Set(SCENE_THEMES.map((theme) => theme.presentation.tabletopBaseColor)).size).toBe(3);
    expect(new Set(SCENE_THEMES.map((theme) => theme.presentation.cardGradient)).size).toBe(3);
    expect(new Set(SCENE_THEMES.map((theme) => theme.presentation.boardInsetColor)).size).toBe(3);
  });

  it("keeps image2 scene boards clear enough for iPad play", () => {
    expect(getSceneTheme("dewy-garden").presentation.boardArtAlpha).toBeGreaterThanOrEqual(0.92);
    expect(getSceneTheme("starlight-farm").presentation.boardArtAlpha).toBeGreaterThanOrEqual(0.9);
  });
});
