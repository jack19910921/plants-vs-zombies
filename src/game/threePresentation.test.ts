import { describe, expect, it } from "vitest";
import { getSeedPacketFlipState } from "./threePresentation";

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
});
