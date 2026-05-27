import { describe, expect, it } from "vitest";
import {
  getGardenToolState,
  getPlantingSparkState,
  getPotatoMineShockwaveState,
  getSeedPacketFlipState,
  getStatusBadgeState,
  getSunTrailParticleState,
  getToyGardenPropProfiles,
  getWaveWarningStakeState
} from "./threePresentation";

describe("three presentation helpers", () => {
  it("keeps the seed packet visible during the flip", () => {
    expect(getSeedPacketFlipState(0, "select")).toMatchObject({ visible: true });
    expect(getSeedPacketFlipState(360, "select")).toMatchObject({ visible: true });
  });

  it("pops larger for planting than selecting", () => {
    const selected = getSeedPacketFlipState(360, "select");
    const planted = getSeedPacketFlipState(360, "plant");

    expect(planted.scale).toBeGreaterThan(selected.scale);
    expect(planted.opacity).toBeGreaterThan(0);
  });

  it("sweeps a shine across the seed packet during the flip", () => {
    const early = getSeedPacketFlipState(90, "select");
    const middle = getSeedPacketFlipState(360, "select");
    const late = getSeedPacketFlipState(620, "select");

    expect(middle.shineOpacity).toBeGreaterThan(early.shineOpacity);
    expect(late.shineX).toBeGreaterThan(early.shineX);
    expect(middle.shineRotationZ).toBeLessThan(0);
  });

  it("hides after the flip duration", () => {
    expect(getSeedPacketFlipState(900, "plant")).toMatchObject({ visible: false, opacity: 0 });
  });

  it("keeps the garden tool visible while idling", () => {
    expect(getGardenToolState(1000, Number.NEGATIVE_INFINITY)).toMatchObject({ visible: true });
  });

  it("changes garden tool idle rotation over time", () => {
    const first = getGardenToolState(1000, Number.NEGATIVE_INFINITY);
    const second = getGardenToolState(1800, Number.NEGATIVE_INFINITY);

    expect(second.rotationZ).not.toBe(first.rotationZ);
  });

  it("swings the garden tool more strongly after planting", () => {
    const idle = getGardenToolState(1200, Number.NEGATIVE_INFINITY);
    const planting = getGardenToolState(1200, 1000);

    expect(Math.abs(planting.rotationZ)).toBeGreaterThan(Math.abs(idle.rotationZ));
    expect(planting.y).toBeGreaterThan(idle.y);
  });

  it("shows the wave warning stake during the alert", () => {
    expect(getWaveWarningStakeState(0)).toMatchObject({ visible: true });
  });

  it("pops the wave warning stake larger mid-alert", () => {
    const start = getWaveWarningStakeState(0);
    const middle = getWaveWarningStakeState(240);

    expect(middle.scale).toBeGreaterThan(start.scale);
    expect(middle.opacity).toBeGreaterThan(0);
  });

  it("hides the wave warning stake after the alert", () => {
    expect(getWaveWarningStakeState(1000)).toMatchObject({ visible: false, opacity: 0 });
  });

  it("keeps sun trail particles visible during collection", () => {
    expect(getSunTrailParticleState(0, 0)).toMatchObject({ visible: true });
    expect(getSunTrailParticleState(360, 0)).toMatchObject({ visible: true });
  });

  it("moves sun trail particles toward the coin", () => {
    const start = getSunTrailParticleState(0, 0);
    const middle = getSunTrailParticleState(360, 0);
    const startDistance = Math.hypot(start.x, start.y);
    const middleDistance = Math.hypot(middle.x, middle.y);

    expect(middleDistance).toBeLessThan(startDistance);
    expect(middle.opacity).toBeGreaterThan(0);
  });

  it("adds halo and shimmer to sun trail particles during collection", () => {
    const start = getSunTrailParticleState(0, 0);
    const middle = getSunTrailParticleState(360, 0);

    expect(middle.haloScale).toBeGreaterThan(start.haloScale);
    expect(middle.shimmerOpacity).toBeGreaterThan(0);
    expect(middle.rotationZ).not.toBe(start.rotationZ);
  });

  it("staggers sun trail particles by index", () => {
    const first = getSunTrailParticleState(220, 0);
    const later = getSunTrailParticleState(220, 4);

    expect(later.x).not.toBe(first.x);
    expect(later.opacity).toBeLessThan(first.opacity);
  });

  it("hides sun trail particles after collection", () => {
    expect(getSunTrailParticleState(1000, 0)).toMatchObject({ visible: false, opacity: 0 });
  });

  it("adds a beacon pulse to the wave warning stake", () => {
    const start = getWaveWarningStakeState(0);
    const middle = getWaveWarningStakeState(360);

    expect(middle.beaconScale).toBeGreaterThan(start.beaconScale);
    expect(middle.beaconOpacity).toBeGreaterThan(0);
    expect(middle.flagGlow).toBeGreaterThan(start.flagGlow);
  });

  it("shows a warm potato mine shockwave during the burst", () => {
    const start = getPotatoMineShockwaveState(0, 0);
    const middle = getPotatoMineShockwaveState(260, 0);

    expect(start.visible).toBe(true);
    expect(middle.ringScale).toBeGreaterThan(start.ringScale);
    expect(middle.flashOpacity).toBeGreaterThan(0);
  });

  it("staggers potato mine debris particles by index", () => {
    const first = getPotatoMineShockwaveState(180, 0);
    const later = getPotatoMineShockwaveState(180, 5);

    expect(first.visible).toBe(true);
    expect(later.x).not.toBe(first.x);
    expect(later.opacity).toBeLessThan(first.opacity);
  });

  it("hides potato mine shockwave particles after the burst", () => {
    expect(getPotatoMineShockwaveState(900, 0)).toMatchObject({ visible: false, opacity: 0, flashOpacity: 0 });
  });

  it("pops the victory badge and exposes celebration particles", () => {
    const start = getStatusBadgeState(0, "victory", 0);
    const intro = getStatusBadgeState(360, "victory", 0);

    expect(start.visible).toBe(true);
    expect(intro.scale).toBeGreaterThan(start.scale);
    expect(intro.particleVisible).toBe(true);
    expect(intro.particleOpacity).toBeGreaterThan(0);
  });

  it("keeps failure badge gentle and dimmer than victory", () => {
    const victory = getStatusBadgeState(520, "victory", 0);
    const failure = getStatusBadgeState(520, "failure", 0);

    expect(failure.visible).toBe(true);
    expect(failure.y).toBeLessThan(victory.y);
    expect(failure.materialIntensity).toBeLessThan(victory.materialIntensity);
    expect(failure.particleVisible).toBe(false);
  });

  it("hides status badge ceremony after its lifetime", () => {
    expect(getStatusBadgeState(5200, "victory", 0)).toMatchObject({
      visible: false,
      opacity: 0,
      particleOpacity: 0
    });
    expect(getStatusBadgeState(5200, "failure", 0)).toMatchObject({ visible: false, opacity: 0 });
  });

  it("shows planting spark particles during the garden tool landing", () => {
    const start = getPlantingSparkState(0, 0);
    const middle = getPlantingSparkState(180, 0);

    expect(start.visible).toBe(true);
    expect(middle.x).not.toBe(start.x);
    expect(middle.opacity).toBeGreaterThan(0);
    expect(middle.warmOpacity).toBeGreaterThan(0);
  });

  it("staggers planting spark particles by index", () => {
    const first = getPlantingSparkState(160, 0);
    const later = getPlantingSparkState(160, 5);

    expect(first.visible).toBe(true);
    expect(later.x).not.toBe(first.x);
    expect(later.opacity).toBeLessThan(first.opacity);
  });

  it("hides planting spark particles after the landing effect", () => {
    expect(getPlantingSparkState(760, 0)).toMatchObject({ visible: false, opacity: 0, warmOpacity: 0 });
  });

  it("defines a varied procedural toy garden prop set", () => {
    const props = getToyGardenPropProfiles();
    const materialFamilies = new Set(props.map((prop) => prop.materialFamily));

    expect(props.length).toBeGreaterThanOrEqual(7);
    expect(materialFamilies.size).toBeGreaterThanOrEqual(4);
    expect(props.map((prop) => prop.kind)).toEqual(
      expect.arrayContaining(["terracotta-pot", "watering-can", "seed-crate", "pebble"])
    );
  });

  it("keeps persistent toy garden props inside the compact Three stage", () => {
    const props = getToyGardenPropProfiles();

    props.forEach((prop) => {
      expect(Math.abs(prop.x)).toBeLessThanOrEqual(1.34);
      expect(prop.y).toBeGreaterThanOrEqual(-1);
      expect(prop.y).toBeLessThanOrEqual(0.86);
      expect(prop.z).toBeLessThanOrEqual(0.04);
      expect(prop.scale).toBeGreaterThan(0);
      expect(prop.scale).toBeLessThanOrEqual(1);
    });
  });
});
