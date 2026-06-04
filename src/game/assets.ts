import type { PlantId, SceneThemeId, ZombieId } from "./types";
export { SCENE_THUMBNAILS, getSceneThumbnailForScene } from "./sceneThumbnails";

export interface TextureAssetEntry {
  key: string;
  url: string;
}

export const PLANT_TEXTURES: Record<PlantId, string> = {
  sunflower: new URL("../assets/generated/m11/image2-sunflower.png", import.meta.url).href,
  peashooter: new URL("../assets/generated/m11/image2-peashooter.png", import.meta.url).href,
  wallnut: new URL("../assets/generated/m11/image2-wallnut.png", import.meta.url).href,
  snowpea: new URL("../assets/generated/m11/image2-snowpea.png", import.meta.url).href,
  potatomine: new URL("../assets/generated/m11/image2-potatomine.png", import.meta.url).href
};

export const BOARD_TEXTURE = new URL("../assets/generated/m11/image2-garden-board.png", import.meta.url).href;

export const SCENE_BOARD_TEXTURES: Partial<Record<SceneThemeId, string>> = {
  "dewy-garden": new URL("../assets/generated/m13/image2-dewy-board.png", import.meta.url).href,
  "starlight-farm": new URL("../assets/generated/m13/image2-starlight-board.png", import.meta.url).href
};

export const ZOMBIE_TEXTURES: Record<ZombieId, string> = {
  basic: new URL("../assets/generated/m11/image2-zombie-basic.png", import.meta.url).href,
  cone: new URL("../assets/generated/m11/image2-zombie-cone.png", import.meta.url).href,
  bucket: new URL("../assets/generated/m11/image2-zombie-bucket.png", import.meta.url).href
};

export const SCENE_PLANT_TEXTURES: Partial<Record<SceneThemeId, Partial<Record<PlantId, string>>>> = {
  "dewy-garden": {
    peashooter: new URL("../assets/generated/m13/image2-dewy-peashooter.png", import.meta.url).href,
    wallnut: new URL("../assets/generated/m13/image2-dewy-wallnut.png", import.meta.url).href
  },
  "starlight-farm": {
    sunflower: new URL("../assets/generated/m13/image2-starlight-sunflower.png", import.meta.url).href,
    peashooter: new URL("../assets/generated/m13/image2-starlight-peashooter.png", import.meta.url).href
  }
};

export const SCENE_ZOMBIE_TEXTURES: Partial<Record<SceneThemeId, Partial<Record<ZombieId, string>>>> = {
  "dewy-garden": {
    basic: new URL("../assets/generated/m13/image2-dewy-zombie-basic.png", import.meta.url).href,
    cone: new URL("../assets/generated/m13/image2-dewy-zombie-cone.png", import.meta.url).href
  },
  "starlight-farm": {
    basic: new URL("../assets/generated/m13/image2-starlight-zombie-basic.png", import.meta.url).href,
    bucket: new URL("../assets/generated/m13/image2-starlight-zombie-bucket.png", import.meta.url).href
  }
};

export const PROJECTILE_TEXTURES = {
  pea: new URL("../assets/generated/m11/image2-pea-projectile.png", import.meta.url).href,
  ice: new URL("../assets/generated/m11/image2-ice-projectile.png", import.meta.url).href
} as const;

export const SUN_TOKEN_TEXTURE = new URL("../assets/generated/m11/image2-sun-token.png", import.meta.url).href;
export const BASE_SIGN_TEXTURE = new URL("../assets/generated/m11/image2-base-sign.png", import.meta.url).href;
export const LAWN_MOWER_TEXTURE = new URL("../assets/generated/m11/image2-lawn-mower.png", import.meta.url).href;

export function getBoardTextureForScene(sceneThemeId: SceneThemeId): string {
  return SCENE_BOARD_TEXTURES[sceneThemeId] ?? BOARD_TEXTURE;
}

export function getPlantTextureForScene(sceneThemeId: SceneThemeId, plantId: PlantId): string {
  return SCENE_PLANT_TEXTURES[sceneThemeId]?.[plantId] ?? PLANT_TEXTURES[plantId];
}

export function getZombieTextureForScene(sceneThemeId: SceneThemeId, zombieId: ZombieId): string {
  return SCENE_ZOMBIE_TEXTURES[sceneThemeId]?.[zombieId] ?? ZOMBIE_TEXTURES[zombieId];
}

export function getBoardTextureKeyForScene(sceneThemeId: SceneThemeId): string {
  return SCENE_BOARD_TEXTURES[sceneThemeId] ? `scene-board-${sceneThemeId}` : "garden-board";
}

export function getPlantTextureKeyForScene(sceneThemeId: SceneThemeId, plantId: PlantId): string {
  return SCENE_PLANT_TEXTURES[sceneThemeId]?.[plantId] ? `plant-${sceneThemeId}-${plantId}` : `plant-${plantId}`;
}

export function getZombieTextureKeyForScene(sceneThemeId: SceneThemeId, zombieId: ZombieId): string {
  return SCENE_ZOMBIE_TEXTURES[sceneThemeId]?.[zombieId] ? `zombie-${sceneThemeId}-${zombieId}` : `zombie-${zombieId}`;
}

export function getSceneBoardTextureEntry(sceneThemeId: SceneThemeId): TextureAssetEntry | null {
  const url = SCENE_BOARD_TEXTURES[sceneThemeId];
  if (!url) return null;
  return {
    key: getBoardTextureKeyForScene(sceneThemeId),
    url
  };
}

export function getScenePlantTextureEntries(sceneThemeId: SceneThemeId): TextureAssetEntry[] {
  return Object.entries(SCENE_PLANT_TEXTURES[sceneThemeId] ?? {}).map(([plantId, url]) => ({
    key: getPlantTextureKeyForScene(sceneThemeId, plantId as PlantId),
    url
  }));
}

export function getSceneZombieTextureEntries(sceneThemeId: SceneThemeId): TextureAssetEntry[] {
  return Object.entries(SCENE_ZOMBIE_TEXTURES[sceneThemeId] ?? {}).map(([zombieId, url]) => ({
    key: getZombieTextureKeyForScene(sceneThemeId, zombieId as ZombieId),
    url
  }));
}

export function getSceneSpecificTextureEntries(sceneThemeId: SceneThemeId): TextureAssetEntry[] {
  return [
    getSceneBoardTextureEntry(sceneThemeId),
    ...getScenePlantTextureEntries(sceneThemeId),
    ...getSceneZombieTextureEntries(sceneThemeId)
  ].filter((entry): entry is TextureAssetEntry => Boolean(entry));
}
