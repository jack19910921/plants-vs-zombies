import { describe, expect, it } from "vitest";
import {
  createAudioSettings,
  getSoundForCombatEvent,
  getSoundForStatus,
  toggleAudioSettings
} from "./audio";

describe("audio", () => {
  it("defaults sound to enabled and toggles it", () => {
    const settings = createAudioSettings();
    expect(settings.enabled).toBe(true);
    expect(toggleAudioSettings(settings).enabled).toBe(false);
    expect(toggleAudioSettings({ enabled: false }).enabled).toBe(true);
  });

  it("maps combat events to generated sound ids", () => {
    expect(
      getSoundForCombatEvent({
        id: "event-sun",
        type: "sun-produced",
        sourceId: "plant-1",
        lane: 0,
        column: 0,
        amount: 25,
        atMs: 1000
      })
    ).toBe("sun");
    expect(
      getSoundForCombatEvent({
        id: "event-hit",
        type: "zombie-hit",
        targetId: "zombie-1",
        lane: 0,
        x: 5,
        damage: 20,
        slows: false,
        atMs: 1000
      })
    ).toBe("hit");
    expect(
      getSoundForCombatEvent({
        id: "event-wave",
        type: "wave-spawned",
        waveIndex: 0,
        lane: 2,
        zombieId: "basic",
        atMs: 1000
      })
    ).toBe("wave");
    expect(
      getSoundForCombatEvent({
        id: "event-mine",
        type: "potato-mine-exploded",
        sourceId: "plant-1",
        lane: 2,
        column: 3,
        damage: 120,
        radiusCells: 0.75,
        atMs: 1000
      })
    ).toBe("hit");
  });

  it("maps status changes to terminal sounds", () => {
    expect(getSoundForStatus("victory")).toBe("victory");
    expect(getSoundForStatus("failure")).toBe("failure");
    expect(getSoundForStatus("playing")).toBeNull();
  });
});
