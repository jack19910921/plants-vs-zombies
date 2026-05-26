import { describe, expect, it } from "vitest";
import { getPlantMiniatureProfile, getPlantMiniatureState, getZombieMiniatureState } from "./worldPresentation";

describe("world presentation helpers", () => {
  it("recoils and stretches plants while firing", () => {
    const idle = getPlantMiniatureState(1000, 1, 2, 0, 0);
    const firing = getPlantMiniatureState(1000, 1, 2, 0.8, 0);

    expect(firing.bodyXOffset).toBeLessThan(idle.bodyXOffset);
    expect(firing.scaleY).toBeGreaterThan(idle.scaleY);
    expect(firing.shadowScaleX).toBeGreaterThan(idle.shadowScaleX);
  });

  it("squashes and flashes plants when bitten", () => {
    const idle = getPlantMiniatureState(1000, 1, 2, 0, 0);
    const bitten = getPlantMiniatureState(1000, 1, 2, 0, 0.9);

    expect(Math.abs(bitten.bodyXOffset)).toBeGreaterThan(Math.abs(idle.bodyXOffset));
    expect(bitten.scaleY).toBeLessThan(idle.scaleY);
    expect(bitten.flashAlpha).toBeGreaterThan(idle.flashAlpha);
  });

  it("lunges zombies forward while chewing", () => {
    const idle = getZombieMiniatureState(1000, 4.5, false, 0);
    const chewing = getZombieMiniatureState(1000, 4.5, true, 0);

    expect(chewing.bodyXOffset).toBeLessThan(idle.bodyXOffset);
    expect(chewing.shadowScaleX).toBeGreaterThan(idle.shadowScaleX);
  });

  it("recoils and flashes zombies when hit", () => {
    const idle = getZombieMiniatureState(1000, 4.5, false, 0);
    const hit = getZombieMiniatureState(1000, 4.5, false, 0.8);

    expect(hit.bodyXOffset).toBeGreaterThan(idle.bodyXOffset);
    expect(hit.scaleY).toBeLessThan(idle.scaleY);
    expect(hit.flashAlpha).toBeGreaterThan(idle.flashAlpha);
  });

  it("gives sunflower a taller profile than wallnut", () => {
    const sunflower = getPlantMiniatureProfile("sunflower");
    const wallnut = getPlantMiniatureProfile("wallnut");

    expect(sunflower.imageHeight).toBeGreaterThan(wallnut.imageHeight);
    expect(sunflower.stemHeight).toBeGreaterThan(wallnut.stemHeight);
  });

  it("gives wallnut a sturdier base than peashooter", () => {
    const wallnut = getPlantMiniatureProfile("wallnut");
    const peashooter = getPlantMiniatureProfile("peashooter");

    expect(wallnut.baseWidth).toBeGreaterThan(peashooter.baseWidth);
    expect(wallnut.imageWidth).toBeGreaterThan(peashooter.imageWidth);
  });

  it("keeps potato mine low to the ground", () => {
    const potatoMine = getPlantMiniatureProfile("potatomine");
    const sunflower = getPlantMiniatureProfile("sunflower");

    expect(potatoMine.stemHeight).toBeLessThan(sunflower.stemHeight);
    expect(potatoMine.imageHeight).toBeLessThan(sunflower.imageHeight);
  });

  it("uses a cool rim for snow pea", () => {
    const snowPea = getPlantMiniatureProfile("snowpea");
    const peashooter = getPlantMiniatureProfile("peashooter");

    expect(snowPea.rimColor).not.toBe(peashooter.rimColor);
  });
});
