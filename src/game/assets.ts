import type { PlantId } from "./types";

export const PLANT_TEXTURES: Record<PlantId, string> = {
  sunflower: new URL("../assets/external/sunflower.jpg", import.meta.url).href,
  peashooter: new URL("../assets/external/pea-pods.jpg", import.meta.url).href,
  wallnut: new URL("../assets/external/walnut.jpg", import.meta.url).href,
  snowpea: new URL("../assets/external/snow-peas.jpg", import.meta.url).href,
  potatomine: new URL("../assets/external/potato.jpg", import.meta.url).href
};

export const ZOMBIE_TEXTURE = new URL("../assets/external/zombie.png", import.meta.url).href;
