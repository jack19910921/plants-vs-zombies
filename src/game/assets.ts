import type { PlantId, ZombieId } from "./types";

export const PLANT_TEXTURES: Record<PlantId, string> = {
  sunflower: new URL("../assets/generated/m11/image2-sunflower.png", import.meta.url).href,
  peashooter: new URL("../assets/generated/m11/image2-peashooter.png", import.meta.url).href,
  wallnut: new URL("../assets/generated/m11/image2-wallnut.png", import.meta.url).href,
  snowpea: new URL("../assets/generated/m11/image2-snowpea.png", import.meta.url).href,
  potatomine: new URL("../assets/generated/m11/image2-potatomine.png", import.meta.url).href
};

export const BOARD_TEXTURE = new URL("../assets/generated/m11/image2-garden-board.png", import.meta.url).href;

export const ZOMBIE_TEXTURES: Record<ZombieId, string> = {
  basic: new URL("../assets/generated/m11/image2-zombie-basic.png", import.meta.url).href,
  cone: new URL("../assets/generated/m11/image2-zombie-cone.png", import.meta.url).href,
  bucket: new URL("../assets/generated/m11/image2-zombie-bucket.png", import.meta.url).href
};

export const PROJECTILE_TEXTURES = {
  pea: new URL("../assets/generated/m11/image2-pea-projectile.png", import.meta.url).href,
  ice: new URL("../assets/generated/m11/image2-ice-projectile.png", import.meta.url).href
} as const;

export const SUN_TOKEN_TEXTURE = new URL("../assets/generated/m11/image2-sun-token.png", import.meta.url).href;
export const BASE_SIGN_TEXTURE = new URL("../assets/generated/m11/image2-base-sign.png", import.meta.url).href;
export const LAWN_MOWER_TEXTURE = new URL("../assets/generated/m11/image2-lawn-mower.png", import.meta.url).href;
