import type { PlantId } from "./types";

export const PLANT_TEXTURES: Record<PlantId, string> = {
  sunflower: new URL("../assets/generated/m11/image2-sunflower.png", import.meta.url).href,
  peashooter: new URL("../assets/generated/m11/image2-peashooter.png", import.meta.url).href,
  wallnut: new URL("../assets/generated/m11/image2-wallnut.png", import.meta.url).href,
  snowpea: new URL("../assets/generated/m11/image2-snowpea.png", import.meta.url).href,
  potatomine: new URL("../assets/generated/m11/image2-potatomine.png", import.meta.url).href
};

export const BOARD_TEXTURE = new URL("../assets/generated/m11/image2-garden-board.png", import.meta.url).href;
export const ZOMBIE_TEXTURE = new URL("../assets/external/zombie.png", import.meta.url).href;
