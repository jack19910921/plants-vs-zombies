import { describe, expect, it } from "vitest";
import { createDomOverlayMarkup } from "./domOverlay";

describe("dom overlay", () => {
  it("renders sun, wave, pause, and all plant cards", () => {
    const html = createDomOverlayMarkup({
      sun: 150,
      waveText: "第 1 波 / 8",
      status: "playing",
      selectedPlantId: null,
      cooldownReadyAt: {
        sunflower: 0,
        peashooter: 0,
        wallnut: 0,
        snowpea: 0,
        potatomine: 0
      },
      nowMs: 0
    });
    expect(html).toContain("150");
    expect(html).toContain("第 1 波 / 8");
    expect(html).toContain("向日葵");
    expect(html).toContain("豌豆射手");
    expect(html).toContain("暂停");
  });
});
