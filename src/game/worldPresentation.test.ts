import { describe, expect, it } from "vitest";
import {
  getGrassFleckCount,
  getGrassFleckMotionState,
  getGrassTileMotionState,
  getHealthWearState,
  getHeroPeashooterPresentation,
  getPlantMiniatureProfile,
  getPlantMiniatureState,
  getProjectileParticleState,
  getProjectilePresentation,
  getSceneDecorationCount,
  getSceneDecorationState,
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

  it("keeps grass tile animation opacity and shimmer values bounded", () => {
    [0, 700, 1800, 3600].forEach((nowMs) => {
      for (let lane = 0; lane < 5; lane += 1) {
        for (let column = 0; column < 9; column += 1) {
          const tile = getGrassTileMotionState(nowMs, lane, column);

          expect(tile.cellWashAlpha).toBeGreaterThanOrEqual(0);
          expect(tile.cellWashAlpha).toBeLessThanOrEqual(0.06);
          expect(tile.topHighlightAlpha).toBeGreaterThanOrEqual(0);
          expect(tile.topHighlightAlpha).toBeLessThanOrEqual(0.11);
          expect(tile.bottomShadowAlpha).toBeGreaterThanOrEqual(0);
          expect(tile.bottomShadowAlpha).toBeLessThanOrEqual(0.11);
          expect(tile.shimmerAlpha).toBeGreaterThanOrEqual(0);
          expect(tile.shimmerAlpha).toBeLessThanOrEqual(0.08);
          expect(tile.shimmerXRatio).toBeGreaterThanOrEqual(-0.42);
          expect(tile.shimmerXRatio).toBeLessThanOrEqual(0.42);
          expect(tile.shimmerWidthRatio).toBeGreaterThanOrEqual(0.24);
          expect(tile.shimmerWidthRatio).toBeLessThanOrEqual(0.36);
        }
      }
    });
  });

  it("adds deeper row shadows toward the front of the grass board", () => {
    const backLane = getGrassTileMotionState(1000, 0, 4);
    const frontLane = getGrassTileMotionState(1000, 4, 4);

    expect(frontLane.bottomShadowAlpha).toBeGreaterThan(backLane.bottomShadowAlpha);
    expect(frontLane.ridgeAlpha).toBeGreaterThan(backLane.ridgeAlpha);
  });

  it("moves grass shimmer over time without changing the logical grid", () => {
    const early = getGrassTileMotionState(0, 2, 3);
    const later = getGrassTileMotionState(1300, 2, 3);

    expect(later.shimmerXRatio).not.toBe(early.shimmerXRatio);
    expect(later.bladeLeanX).not.toBe(early.bladeLeanX);
    expect(Math.abs(later.bladeYOffset)).toBeLessThanOrEqual(3);
  });

  it("keeps procedural grass flecks lightweight and inside the board", () => {
    expect(getGrassFleckCount()).toBeGreaterThanOrEqual(12);
    expect(getGrassFleckCount()).toBeLessThanOrEqual(24);

    for (let index = 0; index < getGrassFleckCount(); index += 1) {
      const fleck = getGrassFleckMotionState(1200, index);

      expect(fleck.xRatio).toBeGreaterThanOrEqual(0.04);
      expect(fleck.xRatio).toBeLessThanOrEqual(0.96);
      expect(fleck.yRatio).toBeGreaterThanOrEqual(0.06);
      expect(fleck.yRatio).toBeLessThanOrEqual(0.94);
      expect(fleck.alpha).toBeGreaterThanOrEqual(0);
      expect(fleck.alpha).toBeLessThanOrEqual(0.12);
      expect(fleck.width).toBeGreaterThan(fleck.height);
    }
  });

  it("provides distinct lightweight scene decoration counts", () => {
    expect(getSceneDecorationCount("sun-rays")).toBeGreaterThanOrEqual(6);
    expect(getSceneDecorationCount("dew-beads")).toBeGreaterThanOrEqual(12);
    expect(getSceneDecorationCount("star-glints")).toBeGreaterThanOrEqual(10);
    expect(getSceneDecorationCount("dew-beads")).toBeGreaterThan(getSceneDecorationCount("sun-rays"));
  });

  it("keeps scene decorations bounded inside the board area", () => {
    (["sun-rays", "dew-beads", "star-glints"] as const).forEach((kind) => {
      for (let index = 0; index < getSceneDecorationCount(kind); index += 1) {
        const decoration = getSceneDecorationState(kind, 1200, index);

        expect(decoration.xRatio).toBeGreaterThanOrEqual(0);
        expect(decoration.xRatio).toBeLessThanOrEqual(1);
        expect(decoration.yRatio).toBeGreaterThanOrEqual(0);
        expect(decoration.yRatio).toBeLessThanOrEqual(1);
        expect(decoration.alpha).toBeGreaterThanOrEqual(0);
        expect(decoration.alpha).toBeLessThanOrEqual(0.62);
        expect(decoration.size).toBeGreaterThan(0);
        expect(decoration.size).toBeLessThanOrEqual(42);
      }
    });
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
