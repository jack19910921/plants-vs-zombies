import { describe, expect, it, vi } from "vitest";
import { LEVEL_ONE } from "../game/config";
import { createInitialState } from "../game/rules";
import type { GameScene } from "../game/GameScene";
import type { GameState } from "../game/types";
import { createDomOverlay, createDomOverlayMarkup } from "./domOverlay";

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

  it("does not replace controls when only elapsed time changes", () => {
    let stateHandler: ((state: GameState) => void) | null = null;
    let markup = "";
    let writes = 0;
    const root = {
      addEventListener: vi.fn()
    };
    Object.defineProperty(root, "innerHTML", {
      get: () => markup,
      set: (value: string) => {
        writes += 1;
        markup = value;
      }
    });
    const scene = {
      uiEvents: {
        on: vi.fn((_eventName: string, handler: (state: GameState) => void) => {
          stateHandler = handler;
        })
      },
      setSelectedPlant: vi.fn(),
      togglePause: vi.fn(),
      restartLevel: vi.fn()
    } as unknown as GameScene;

    createDomOverlay(root as unknown as Element, scene);
    const firstState = { ...createInitialState(LEVEL_ONE), status: "playing" as const };
    stateHandler!(firstState);
    stateHandler!({ ...firstState, nowMs: firstState.nowMs + 16 });

    expect(writes).toBe(1);
  });

  it("offers restart instead of continue on terminal states", () => {
    const html = createDomOverlayMarkup({
      sun: 0,
      waveText: "第 8 波 / 8",
      status: "failure",
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

    expect(html).toContain('data-action="restart"');
    expect(html).toContain("再玩一次");
  });
});
