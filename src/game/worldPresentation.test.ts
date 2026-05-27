import { describe, expect, it } from "vitest";
import {
  getHealthWearState,
  getHeroPeashooterPresentation,
  getPlantMiniatureProfile,
  getPlantMiniatureState,
  getProjectileParticleState,
  getProjectilePresentation,
  getSunPickupPresentation,
  getZombieMiniatureProfile,
  getZombieMiniatureState
} from "./worldPresentation";

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

  it("sizes M11 image2 shooter art larger without exceeding a lane", () => {
    const peashooter = getPlantMiniatureProfile("peashooter");
    const snowPea = getPlantMiniatureProfile("snowpea");

    expect(peashooter.imageHeight).toBeGreaterThanOrEqual(72);
    expect(snowPea.imageHeight).toBe(peashooter.imageHeight);
    expect(peashooter.imageWidth).toBeLessThanOrEqual(88);
    expect(snowPea.imageWidth).toBeLessThanOrEqual(88);
  });

  it("keeps basic enemies unarmored", () => {
    const basic = getZombieMiniatureProfile("basic");

    expect(basic.headgear).toBe("none");
  });

  it("makes cone enemies taller with cone headgear", () => {
    const basic = getZombieMiniatureProfile("basic");
    const cone = getZombieMiniatureProfile("cone");

    expect(cone.headgear).toBe("cone");
    expect(cone.imageHeight).toBeGreaterThan(basic.imageHeight);
  });

  it("makes bucket enemies wider and heavier", () => {
    const basic = getZombieMiniatureProfile("basic");
    const bucket = getZombieMiniatureProfile("bucket");

    expect(bucket.headgear).toBe("bucket");
    expect(bucket.imageWidth).toBeGreaterThan(basic.imageWidth);
    expect(bucket.shadowWidth).toBeGreaterThan(basic.shadowWidth);
  });

  it("uses a distinct rim for bucket armor", () => {
    const basic = getZombieMiniatureProfile("basic");
    const bucket = getZombieMiniatureProfile("bucket");

    expect(bucket.rimColor).not.toBe(basic.rimColor);
  });

  it("uses image2 peashooter proportions for the hero instead of a flat green ball", () => {
    const hero = getHeroPeashooterPresentation(1000, 0.8);

    expect(hero.imageKey).toBe("plant-peashooter");
    expect(hero.imageWidth).toBeGreaterThan(hero.imageHeight);
    expect(hero.shadowWidth).toBeGreaterThan(hero.imageWidth * 0.72);
    expect(hero.muzzleOffsetX).toBeGreaterThan(30);
    expect(hero.glossAlpha).toBeGreaterThan(0.2);
  });

  it("gives pea and ice projectiles distinct toy bead palettes", () => {
    const pea = getProjectilePresentation(false);
    const ice = getProjectilePresentation(true);

    expect(pea.coreColor).toBe(0x7edb65);
    expect(pea.rimColor).toBe(0x315f3a);
    expect(ice.coreColor).toBe(0x8fe7ff);
    expect(ice.glowRadius).toBeGreaterThan(pea.glowRadius);
    expect(ice.trailColor).not.toBe(pea.trailColor);
  });

  it("adds layered particle trails to projectiles", () => {
    const pea = getProjectilePresentation(false);
    const ice = getProjectilePresentation(true);
    const first = getProjectileParticleState(false, 0, 1200);
    const later = getProjectileParticleState(false, pea.trailParticleCount - 1, 1200);

    expect(pea.trailParticleCount).toBeGreaterThanOrEqual(5);
    expect(pea.imageWidth).toBeGreaterThan(pea.coreRadius * 2);
    expect(ice.trailParticleCount).toBeGreaterThan(pea.trailParticleCount);
    expect(first.alpha).toBeGreaterThan(later.alpha);
    expect(later.offsetX).toBeLessThan(first.offsetX);
  });

  it("shrinks and fades sun pickup feedback as it is collected", () => {
    const start = getSunPickupPresentation(0);
    const end = getSunPickupPresentation(1);

    expect(start.alpha).toBe(1);
    expect(end.alpha).toBe(0);
    expect(start.coinRadius).toBeGreaterThan(end.coinRadius);
    expect(start.haloRadius).toBeLessThan(end.haloRadius);
  });

  it("adds rotating token and spark particles to sun pickup feedback", () => {
    const start = getSunPickupPresentation(0.2);
    const later = getSunPickupPresentation(0.7);

    expect(start.tokenSize).toBeGreaterThan(start.coinRadius * 2);
    expect(start.sparkleCount).toBeGreaterThanOrEqual(8);
    expect(start.beamAlpha).toBeGreaterThan(0);
    expect(later.rotationDeg).toBeGreaterThan(start.rotationDeg);
    expect(later.sparkleRadius).toBeGreaterThan(start.sparkleRadius);
  });

  it("keeps full health figures clean", () => {
    expect(getHealthWearState(100, 100)).toMatchObject({
      crackCount: 0,
      crackAlpha: 0,
      scuffAlpha: 0,
      dangerAlpha: 0
    });
  });

  it("adds wear marks to damaged figures", () => {
    const damaged = getHealthWearState(50, 100);

    expect(damaged.crackCount).toBeGreaterThan(0);
    expect(damaged.crackAlpha).toBeGreaterThan(0);
    expect(damaged.scuffAlpha).toBeGreaterThan(0);
  });

  it("makes critical figures more visibly damaged", () => {
    const damaged = getHealthWearState(50, 100);
    const critical = getHealthWearState(20, 100);

    expect(critical.crackCount).toBeGreaterThan(damaged.crackCount);
    expect(critical.dangerAlpha).toBeGreaterThan(damaged.dangerAlpha);
  });
});
