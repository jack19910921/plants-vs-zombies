import { describe, expect, it } from "vitest";
import {
  BASE_SIGN_TEXTURE,
  BOARD_TEXTURE,
  SCENE_BOARD_TEXTURES,
  SCENE_PLANT_TEXTURES,
  SCENE_THUMBNAILS,
  SCENE_ZOMBIE_TEXTURES,
  LAWN_MOWER_TEXTURE,
  PLANT_TEXTURES,
  PROJECTILE_TEXTURES,
  SUN_TOKEN_TEXTURE,
  ZOMBIE_TEXTURES,
  getBoardTextureKeyForScene,
  getBoardTextureForScene,
  getPlantTextureKeyForScene,
  getPlantTextureForScene,
  getSceneSpecificTextureEntries,
  getSceneThumbnailForScene,
  getZombieTextureKeyForScene,
  getZombieTextureForScene
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

  it("exposes scene-specific image2 board textures", () => {
    expect(SCENE_BOARD_TEXTURES["dewy-garden"]).toContain("image2-dewy-board.png");
    expect(SCENE_BOARD_TEXTURES["starlight-farm"]).toContain("image2-starlight-board.png");
    expect(getBoardTextureForScene("sunny-lawn")).toBe(BOARD_TEXTURE);
    expect(getBoardTextureForScene("dewy-garden")).toBe(SCENE_BOARD_TEXTURES["dewy-garden"]);
  });

  it("exposes lightweight scene picker thumbnails separate from full board textures", () => {
    expect(SCENE_THUMBNAILS["sunny-lawn"]).toContain("scene-thumb-sunny-lawn.png");
    expect(SCENE_THUMBNAILS["dewy-garden"]).toContain("scene-thumb-dewy-garden.png");
    expect(SCENE_THUMBNAILS["starlight-farm"]).toContain("scene-thumb-starlight-farm.png");
    expect(getSceneThumbnailForScene("dewy-garden")).toBe(SCENE_THUMBNAILS["dewy-garden"]);
    expect(getSceneThumbnailForScene("dewy-garden")).not.toContain("image2-dewy-board.png");
    expect(getSceneThumbnailForScene("starlight-farm")).not.toContain("image2-starlight-board.png");
  });

  it("exposes scene-specific image2 plant textures with sunny fallbacks", () => {
    expect(SCENE_PLANT_TEXTURES["dewy-garden"]?.peashooter).toContain("image2-dewy-peashooter.png");
    expect(SCENE_PLANT_TEXTURES["dewy-garden"]?.wallnut).toContain("image2-dewy-wallnut.png");
    expect(SCENE_PLANT_TEXTURES["starlight-farm"]?.sunflower).toContain("image2-starlight-sunflower.png");
    expect(SCENE_PLANT_TEXTURES["starlight-farm"]?.peashooter).toContain("image2-starlight-peashooter.png");
    expect(getPlantTextureForScene("sunny-lawn", "peashooter")).toBe(PLANT_TEXTURES.peashooter);
    expect(getPlantTextureForScene("dewy-garden", "sunflower")).toBe(PLANT_TEXTURES.sunflower);
  });

  it("exposes scene-specific image2 zombie textures with sunny fallbacks", () => {
    expect(SCENE_ZOMBIE_TEXTURES["dewy-garden"]?.basic).toContain("image2-dewy-zombie-basic.png");
    expect(SCENE_ZOMBIE_TEXTURES["starlight-farm"]?.basic).toContain("image2-starlight-zombie-basic.png");
    expect(SCENE_ZOMBIE_TEXTURES["starlight-farm"]?.bucket).toContain("image2-starlight-zombie-bucket.png");
    expect(getZombieTextureForScene("sunny-lawn", "basic")).toBe(ZOMBIE_TEXTURES.basic);
    expect(getZombieTextureForScene("dewy-garden", "bucket")).toBe(ZOMBIE_TEXTURES.bucket);
  });

  it("resolves Phaser texture keys from the selected scene", () => {
    expect(getBoardTextureKeyForScene("sunny-lawn")).toBe("garden-board");
    expect(getBoardTextureKeyForScene("dewy-garden")).toBe("scene-board-dewy-garden");
    expect(getPlantTextureKeyForScene("starlight-farm", "sunflower")).toBe("plant-starlight-farm-sunflower");
    expect(getPlantTextureKeyForScene("starlight-farm", "wallnut")).toBe("plant-wallnut");
    expect(getZombieTextureKeyForScene("starlight-farm", "bucket")).toBe("zombie-starlight-farm-bucket");
    expect(getZombieTextureKeyForScene("dewy-garden", "bucket")).toBe("zombie-bucket");
  });

  it("returns only the selected scene-specific Phaser preload entries", () => {
    const dewyEntries = getSceneSpecificTextureEntries("dewy-garden");
    const starlightEntries = getSceneSpecificTextureEntries("starlight-farm");

    expect(dewyEntries.map((entry) => entry.key)).toEqual([
      "scene-board-dewy-garden",
      "plant-dewy-garden-peashooter",
      "plant-dewy-garden-wallnut",
      "zombie-dewy-garden-basic",
      "zombie-dewy-garden-cone"
    ]);
    expect(dewyEntries.map((entry) => entry.url).join(" ")).not.toContain("image2-starlight-board.png");
    expect(starlightEntries.map((entry) => entry.url).join(" ")).not.toContain("image2-dewy-board.png");
  });
});
