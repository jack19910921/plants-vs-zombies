import { describe, expect, it } from "vitest";
import {
  BASE_SIGN_TEXTURE,
  BOARD_TEXTURE,
  LAWN_MOWER_TEXTURE,
  PLANT_TEXTURES,
  PROJECTILE_TEXTURES,
  SUN_TOKEN_TEXTURE,
  ZOMBIE_TEXTURES
} from "./assets";
import type { PlantId, ZombieId } from "./types";

const expectedPlantAssetNames: Record<PlantId, string> = {
  sunflower: "image2-sunflower.png",
  peashooter: "image2-peashooter.png",
  wallnut: "image2-wallnut.png",
  snowpea: "image2-snowpea.png",
  potatomine: "image2-potatomine.png"
};

const expectedZombieAssetNames: Record<ZombieId, string> = {
  basic: "image2-zombie-basic.png",
  cone: "image2-zombie-cone.png",
  bucket: "image2-zombie-bucket.png"
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

  it("exposes the M11 image2 UI prop and effect textures", () => {
    expect(PROJECTILE_TEXTURES.pea).toContain("image2-pea-projectile.png");
    expect(PROJECTILE_TEXTURES.ice).toContain("image2-ice-projectile.png");
    expect(SUN_TOKEN_TEXTURE).toContain("image2-sun-token.png");
    expect(BASE_SIGN_TEXTURE).toContain("image2-base-sign.png");
    expect(LAWN_MOWER_TEXTURE).toContain("image2-lawn-mower.png");
  });
});
