import { describe, expect, it } from "vitest";
import {
  getBoardAssetPresentation,
  getPlantAssetPresentation,
  getSourceCropPixels,
  getZombieAssetPresentation,
  type AssetCrop
} from "./assetPresentation";
import type { PlantId, ZombieId } from "./types";

const plantIds: PlantId[] = ["sunflower", "peashooter", "wallnut", "snowpea", "potatomine"];
const zombieIds: ZombieId[] = ["basic", "cone", "bucket"];

function expectValidCrop(crop: AssetCrop): void {
  expect(crop.x).toBeGreaterThanOrEqual(0);
  expect(crop.y).toBeGreaterThanOrEqual(0);
  expect(crop.width).toBeGreaterThan(0);
  expect(crop.height).toBeGreaterThan(0);
  expect(crop.x + crop.width).toBeLessThanOrEqual(1);
  expect(crop.y + crop.height).toBeLessThanOrEqual(1);
}

describe("asset presentation profiles", () => {
  it("defines valid crop and filter values for every plant", () => {
    plantIds.forEach((plantId) => {
      const profile = getPlantAssetPresentation(plantId);

      expectValidCrop(profile.crop);
      expect(profile.cssFilter).toContain("contrast");
      expect(profile.cssObjectPosition).toContain("%");
      expect(profile.cssBackgroundSize).toBe("contain");
      expect(profile.fieldAnchorX).toBe(0.5);
      expect(profile.fieldAnchorY).toBe(1);
    });
  });

  it("uses different framing for wallnut than sunflower", () => {
    const sunflower = getPlantAssetPresentation("sunflower");
    const wallnut = getPlantAssetPresentation("wallnut");

    expect(wallnut.cssObjectPosition).not.toBe(sunflower.cssObjectPosition);
    expect(wallnut.fieldOffsetY).toBeGreaterThan(sunflower.fieldOffsetY);
  });

  it("defines valid crop values for every enemy", () => {
    zombieIds.forEach((zombieId) => {
      const profile = getZombieAssetPresentation(zombieId);

      expectValidCrop(profile.crop);
      expect(profile.cssFilter).toContain("contrast");
    });
  });

  it("defines a bounded crop for the image2 garden board", () => {
    const board = getBoardAssetPresentation();

    expectValidCrop(board.crop);
    const cropPixels = getSourceCropPixels(board.crop, 1672, 941);
    const aspectRatio = cropPixels.width / cropPixels.height;

    expect(aspectRatio).toBeGreaterThan(2.4);
    expect(aspectRatio).toBeLessThan(2.7);
  });

  it("converts normalized crop fractions to bounded source pixels", () => {
    expect(getSourceCropPixels({ x: 0.1, y: 0.2, width: 0.8, height: 0.7 }, 1000, 500)).toEqual({
      x: 100,
      y: 100,
      width: 800,
      height: 350
    });
  });
});
