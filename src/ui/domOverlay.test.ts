import { describe, expect, it, vi } from "vitest";
import { LEVEL_ONE, PLANTS } from "../game/config";
import { createInitialState, plantAt, selectPlant } from "../game/rules";
import type { GameScene } from "../game/GameScene";
import type { GameState } from "../game/types";
import { createDomOverlay, createDomOverlayMarkup, getNextAchievementFeedback } from "./domOverlay";

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
    expect(html).toContain('data-action="sound"');
    expect(html).toContain("声音开");
  });

  it("renders level name with wave text", () => {
    const html = createDomOverlayMarkup({
      sun: 150,
      levelName: "薄雾菜园",
      waveText: "第 1 波 / 9",
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

    expect(html).toContain("薄雾菜园 · 第 1 波 / 9");
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
          if (_eventName === "state-changed") stateHandler = handler;
        })
      },
      setSelectedPlant: vi.fn(),
      togglePause: vi.fn(),
      restartLevel: vi.fn(),
      nextLevel: vi.fn(),
      getCurrentLevel: vi.fn(() => LEVEL_ONE),
      hasNextLevel: vi.fn(() => false)
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

  it("offers next level when victory has a following level", () => {
    const html = createDomOverlayMarkup({
      sun: 0,
      levelName: "阳光草坪",
      waveText: "第 8 波 / 8",
      status: "victory",
      selectedPlantId: null,
      cooldownReadyAt: {
        sunflower: 0,
        peashooter: 0,
        wallnut: 0,
        snowpea: 0,
        potatomine: 0
      },
      nowMs: 0,
      hasNextLevel: true
    });

    expect(html).toContain('data-action="next-level"');
    expect(html).toContain("下一关");
  });

  it("renders the initial tutorial prompt", () => {
    const html = createDomOverlayMarkup({
      sun: 250,
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
      nowMs: 0,
      plantsCount: 0,
      recentFeedback: null,
      recentEvents: []
    });

    expect(html).toContain("先选一张植物卡片");
  });

  it("renders specific invalid action feedback", () => {
    const html = createDomOverlayMarkup({
      sun: 250,
      waveText: "第 1 波 / 8",
      status: "playing",
      selectedPlantId: "sunflower",
      cooldownReadyAt: {
        sunflower: 0,
        peashooter: 0,
        wallnut: 0,
        snowpea: 0,
        potatomine: 0
      },
      nowMs: 0,
      plantsCount: 0,
      recentFeedback: { type: "planting", reason: "occupied" },
      recentEvents: []
    });

    expect(html).toContain("这个格子已经有植物啦");
  });

  it("detects first-time achievement feedback once", () => {
    const planted = plantAt(selectPlant(createInitialState(LEVEL_ONE), "sunflower"), PLANTS, 0, 0);
    const seen = new Set<string>();

    expect(getNextAchievementFeedback(planted, seen)).toMatchObject({
      type: "achievement",
      achievement: "first-plant"
    });

    seen.add("first-plant");
    expect(getNextAchievementFeedback(planted, seen)).toBeNull();
  });

  it("detects sun and defeated zombie achievement feedback from events", () => {
    const base = createInitialState(LEVEL_ONE);
    expect(
      getNextAchievementFeedback(
        {
          ...base,
          events: [
            {
              id: "event-sun",
              type: "sun-produced",
              sourceId: "plant-1",
              lane: 0,
              column: 0,
              amount: 25,
              atMs: 5000
            }
          ]
        },
        new Set()
      )
    ).toMatchObject({ type: "achievement", achievement: "first-sun" });

    expect(
      getNextAchievementFeedback(
        {
          ...base,
          events: [
            {
              id: "event-defeat",
              type: "zombie-defeated",
              targetId: "zombie-1",
              lane: 2,
              x: 6.4,
              atMs: 9000
            }
          ]
        },
        new Set(["first-sun"])
      )
    ).toMatchObject({ type: "achievement", achievement: "first-zombie-defeated" });
  });

  it("renders achievement feedback copy", () => {
    const html = createDomOverlayMarkup({
      sun: 250,
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
      nowMs: 0,
      plantsCount: 1,
      recentFeedback: { type: "achievement", achievement: "first-zombie-defeated" },
      recentEvents: []
    });

    expect(html).toContain("打倒一个了");
  });

  it("renders sound disabled state", () => {
    const html = createDomOverlayMarkup({
      sun: 250,
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
      nowMs: 0,
      soundEnabled: false
    });

    expect(html).toContain("声音关");
  });
});
