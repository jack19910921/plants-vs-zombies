import { describe, expect, it } from "vitest";
import { getGardenToolState, getSeedPacketFlipState, getWaveWarningStakeState } from "./threePresentation";

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
});
