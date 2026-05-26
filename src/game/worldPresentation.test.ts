import { describe, expect, it } from "vitest";
import { getPlantMiniatureState, getZombieMiniatureState } from "./worldPresentation";

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
});
