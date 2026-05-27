import { describe, expect, it } from "vitest";
import { BOARD_TEXTURE, PLANT_TEXTURES, ZOMBIE_TEXTURES } from "./assets";
import type { PlantId, ZombieId } from "./types";

const expectedPlantAssetNames: Record<PlantId, string> = {
  sunflower: "image2-sunflower.png",
  peashooter: "image2-peashooter.png",
  wallnut: "image2-wallnut.png",
  snowpea: "image2-snowpea.png",
  potatomine: "image2-potatomine.png"
};

const expectedZombieAssetNames: Record<ZombieId, string> = {
  basic: "toy-zombie-basic.svg",
  cone: "toy-zombie-cone.svg",
  bucket: "toy-zombie-bucket.svg"
};

describe("asset texture registry", () => {
  it("points every plant to the M11 image2 generated asset", () => {
    Object.entries(expectedPlantAssetNames).forEach(([plantId, fileName]) => {
      expect(PLANT_TEXTURES[plantId as PlantId]).toContain(fileName);
    });
  });

  it("exposes the M11 image2 garden board texture", () => {
    expect(BOARD_TEXTURE).toContain("image2-garden-board.png");
  });

  it("points every enemy to the M11 toy enemy generated asset", () => {
    Object.entries(expectedZombieAssetNames).forEach(([zombieId, fileName]) => {
      expect(ZOMBIE_TEXTURES[zombieId as ZombieId]).toContain(fileName);
    });
  });
});
