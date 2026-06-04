import type { SceneThemeId } from "./types";

export const SCENE_THUMBNAILS: Record<SceneThemeId, string> = {
  "sunny-lawn": new URL("../assets/generated/thumbs/scene-thumb-sunny-lawn.png", import.meta.url).href,
  "dewy-garden": new URL("../assets/generated/thumbs/scene-thumb-dewy-garden.png", import.meta.url).href,
  "starlight-farm": new URL("../assets/generated/thumbs/scene-thumb-starlight-farm.png", import.meta.url).href
};

export function getSceneThumbnailForScene(sceneThemeId: SceneThemeId): string {
  return SCENE_THUMBNAILS[sceneThemeId];
}
