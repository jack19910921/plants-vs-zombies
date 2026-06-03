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
    expect(html).toContain('data-short-label="音开"');
    expect(html).toContain('data-action="motion"');
    expect(html).toContain("动效正常");
    expect(html).toContain('data-short-label="动效"');
  });

  it("renders touch lane controls for mobile play", () => {
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

    expect(html).toContain('class="lane-controls"');
    expect(html).toContain('data-action="lane-up"');
    expect(html).toContain('data-action="lane-down"');
    expect(html).toContain('aria-label="小队长上移"');
    expect(html).toContain('aria-label="小队长下移"');
    expect(html).toContain("↑");
    expect(html).toContain("↓");
  });

  it("renders a transparent board touch grid for tablet planting", () => {
    const html = createDomOverlayMarkup({
      sun: 150,
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
      nowMs: 0
    });

    expect(html).toContain('class="board-touch-grid"');
    expect(html.match(/data-board-lane=/g)).toHaveLength(45);
    expect(html).toContain('data-board-lane="0" data-board-column="0"');
    expect(html).toContain('data-board-lane="4" data-board-column="8"');
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

  it("uses the selected scene name in the wave title", () => {
    const html = createDomOverlayMarkup({
      sun: 150,
      levelName: "阳光草坪",
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
      selectedSceneThemeId: "dewy-garden"
    });

    expect(html).toContain("露珠菜园 · 第 1 波 / 8");
  });

  it("renders difficulty options and selected difficulty", () => {
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
      nowMs: 0,
      difficultyId: "easy"
    });

    expect(html).toContain('data-difficulty="easy"');
    expect(html).toContain('data-difficulty="normal"');
    expect(html).toContain('data-difficulty="easy" class="difficulty-option is-selected"');
  });

  it("keeps normal difficulty selected by default", () => {
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

    expect(html).toContain('data-difficulty="normal" class="difficulty-option is-selected"');
  });

  it("renders locked plant cards when a level has not unlocked them", () => {
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
      nowMs: 0,
      allowedPlantIds: ["sunflower"]
    });

    expect(html).toContain('class="plant-card plant-card--peashooter is-locked"');
    expect(html).toContain('data-plant="peashooter"');
    expect(html).toContain("disabled");
    expect(html).toContain("未开放");
  });

  it("renders plant card profile styling variables", () => {
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

    expect(html).toContain('class="plant-card plant-card--sunflower"');
    expect(html).toContain("--plant-rim:");
    expect(html).toContain("--plant-base:");
    expect(html).toContain("--plant-stem:");
    expect(html).toContain("--plant-art:");
    expect(html).toContain("--plant-size: contain");
  });

  it("uses scene-specific plant card art when a scene provides it", () => {
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
      nowMs: 0,
      selectedSceneThemeId: "dewy-garden"
    });

    expect(html).toContain("image2-dewy-peashooter.png");
    expect(html).toContain("image2-dewy-wallnut.png");
    expect(html).toContain("image2-sunflower.png");
  });

  it("keeps profile styling on locked cards", () => {
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
      nowMs: 0,
      allowedPlantIds: ["sunflower"]
    });

    expect(html).toContain('class="plant-card plant-card--snowpea is-locked"');
    expect(html).toContain("--plant-rim:");
    expect(html).toContain("--plant-art:");
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
      hasNextLevel: vi.fn(() => false),
      getCurrentDifficultyId: vi.fn(() => "normal"),
      setDifficulty: vi.fn(),
      moveHeroLane: vi.fn()
    } as unknown as GameScene;

    createDomOverlay(root as unknown as Element, scene);
    const firstState = { ...createInitialState(LEVEL_ONE), status: "playing" as const };
    stateHandler!(firstState);
    stateHandler!({ ...firstState, nowMs: firstState.nowMs + 16 });

    expect(writes).toBe(1);
  });

  it("moves the hero lane from touch control actions", () => {
    let clickHandler: ((event: Event) => void) | null = null;
    const root = {
      innerHTML: "",
      addEventListener: vi.fn((_eventName: string, handler: (event: Event) => void) => {
        clickHandler = handler;
      })
    };
    const scene = {
      uiEvents: {
        on: vi.fn()
      },
      setSelectedPlant: vi.fn(),
      togglePause: vi.fn(),
      restartLevel: vi.fn(),
      nextLevel: vi.fn(),
      getCurrentLevel: vi.fn(() => LEVEL_ONE),
      hasNextLevel: vi.fn(() => false),
      getCurrentDifficultyId: vi.fn(() => "normal"),
      setDifficulty: vi.fn(),
      moveHeroLane: vi.fn()
    } as unknown as GameScene;
    const makeActionTarget = (action: string) =>
      ({
        closest: vi.fn((selector: string) => (selector === "[data-action]" ? { dataset: { action } } : null))
      }) as unknown as HTMLElement;

    createDomOverlay(root as unknown as Element, scene);
    clickHandler!({ target: makeActionTarget("lane-up") } as unknown as Event);
    clickHandler!({ target: makeActionTarget("lane-down") } as unknown as Event);

    expect(scene.moveHeroLane).toHaveBeenNthCalledWith(1, -1);
    expect(scene.moveHeroLane).toHaveBeenNthCalledWith(2, 1);
  });

  it("selects every plant card immediately from pointer input", () => {
    let pointerHandler: ((event: Event) => void) | null = null;
    const root = {
      innerHTML: "",
      addEventListener: vi.fn((eventName: string, handler: (event: Event) => void) => {
        if (eventName === "pointerdown") pointerHandler = handler;
      })
    };
    const scene = {
      uiEvents: {
        on: vi.fn()
      },
      setSelectedPlant: vi.fn(),
      plantAtCell: vi.fn(),
      togglePause: vi.fn(),
      restartLevel: vi.fn(),
      nextLevel: vi.fn(),
      getCurrentLevel: vi.fn(() => LEVEL_ONE),
      hasNextLevel: vi.fn(() => false),
      getCurrentDifficultyId: vi.fn(() => "normal"),
      setDifficulty: vi.fn(),
      moveHeroLane: vi.fn()
    } as unknown as GameScene;
    createDomOverlay(root as unknown as Element, scene);

    (["sunflower", "peashooter", "wallnut", "snowpea", "potatomine"] as const).forEach((plantId) => {
      const target = {
        closest: vi.fn((selector: string) =>
          selector === "[data-plant]" ? { dataset: { plant: plantId } } : null
        )
      } as unknown as HTMLElement;
      const event = {
        target,
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as unknown as Event;

      pointerHandler!(event);

      expect(scene.setSelectedPlant).toHaveBeenLastCalledWith(plantId);
      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  it("plants from the board touch grid on pointer input", () => {
    let pointerHandler: ((event: Event) => void) | null = null;
    const root = {
      innerHTML: "",
      addEventListener: vi.fn((eventName: string, handler: (event: Event) => void) => {
        if (eventName === "pointerdown") pointerHandler = handler;
      })
    };
    const scene = {
      uiEvents: {
        on: vi.fn()
      },
      setSelectedPlant: vi.fn(),
      plantAtCell: vi.fn(),
      togglePause: vi.fn(),
      restartLevel: vi.fn(),
      nextLevel: vi.fn(),
      getCurrentLevel: vi.fn(() => LEVEL_ONE),
      hasNextLevel: vi.fn(() => false),
      getCurrentDifficultyId: vi.fn(() => "normal"),
      setDifficulty: vi.fn(),
      moveHeroLane: vi.fn()
    } as unknown as GameScene;
    const target = {
      closest: vi.fn((selector: string) =>
        selector === "[data-board-lane][data-board-column]" ? { dataset: { boardLane: "3", boardColumn: "6" } } : null
      )
    } as unknown as HTMLElement;
    const event = {
      target,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn()
    } as unknown as Event;

    createDomOverlay(root as unknown as Element, scene);
    pointerHandler!(event);

    expect(scene.plantAtCell).toHaveBeenCalledWith(3, 6);
    expect(event.stopPropagation).toHaveBeenCalled();
  });

  it("toggles reduced motion from the HUD", () => {
    let stateHandler: ((state: GameState) => void) | null = null;
    let clickHandler: ((event: Event) => void) | null = null;
    const root = {
      innerHTML: "",
      addEventListener: vi.fn((_eventName: string, handler: (event: Event) => void) => {
        clickHandler = handler;
      })
    };
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
      hasNextLevel: vi.fn(() => false),
      getCurrentDifficultyId: vi.fn(() => "normal"),
      setDifficulty: vi.fn(),
      moveHeroLane: vi.fn()
    } as unknown as GameScene;
    const onToggleMotion = vi.fn();
    const motionTarget = {
      closest: vi.fn((selector: string) => (selector === "[data-action]" ? { dataset: { action: "motion" } } : null))
    } as unknown as HTMLElement;

    createDomOverlay(root as unknown as Element, scene, { onToggleMotion });
    stateHandler!({ ...createInitialState(LEVEL_ONE), status: "playing" });
    clickHandler!({ target: motionTarget } as unknown as Event);

    expect(onToggleMotion).toHaveBeenCalledWith(true);
    expect(root.innerHTML).toContain("动效柔和");
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

  it("celebrates the final level victory and offers replay", () => {
    const html = createDomOverlayMarkup({
      sun: 0,
      levelName: "暮色农圃",
      waveText: "第 10 波 / 10",
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
      hasNextLevel: false
    });

    expect(html).toContain("全部守住啦");
    expect(html).toContain('data-action="restart"');
  });

  it("shows a compact terminal summary on victory", () => {
    const html = createDomOverlayMarkup({
      sun: 120,
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
      hasNextLevel: true,
      plantsCount: 4,
      spawnedWaveCount: 8,
      totalWaveCount: 8
    });

    expect(html).toContain('class="modal-summary"');
    expect(html).toContain("守住 8/8 波");
    expect(html).toContain("剩余植物 4");
    expect(html).toContain("阳光 120");
  });

  it("shows a partial terminal summary on failure", () => {
    const html = createDomOverlayMarkup({
      sun: 35,
      levelName: "薄雾菜园",
      waveText: "第 6 波 / 9",
      status: "failure",
      selectedPlantId: null,
      cooldownReadyAt: {
        sunflower: 0,
        peashooter: 0,
        wallnut: 0,
        snowpea: 0,
        potatomine: 0
      },
      nowMs: 0,
      plantsCount: 2,
      spawnedWaveCount: 6,
      totalWaveCount: 9
    });

    expect(html).toContain("守到 6/9 波");
    expect(html).toContain("剩余植物 2");
    expect(html).toContain("阳光 35");
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

  it("renders touch-specific tutorial copy after planting", () => {
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
      recentFeedback: null,
      recentEvents: [],
      inputMode: "touch"
    });

    expect(html).toContain("点植物卡，再点草坪格子种植");
    expect(html).not.toContain("W/S");
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

  it("renders objective chip, short labels, and modifier announcement", () => {
    const html = createDomOverlayMarkup({
      sun: 150,
      levelName: "暮色农圃",
      waveText: "第 2 波 / 10",
      compactWaveText: "第 2/10 波",
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
      runChallenge: {
        objective: {
          id: "plant-sunflowers",
          kind: "plant-count",
          target: 3,
          label: "种 3 朵向日葵",
          plantId: "sunflower"
        },
        modifier: {
          id: "sunny-day",
          name: "阳光日",
          shortLabel: "阳光来得快",
          announcement: "阳光日：阳光来得快",
          adjustments: {}
        },
        current: 2,
        completed: false
      },
      modifierAnnouncement: "阳光日：阳光来得快"
    });

    expect(html).toContain('class="chip wave-chip"');
    expect(html).toContain('data-short-label="第 2/10 波"');
    expect(html).toContain('class="chip objective-chip"');
    expect(html).toContain("目标：种 3 朵向日葵");
    expect(html).toContain("阳光日：阳光来得快");
    expect(html).not.toContain("还差 1 朵向日葵");
  });

  it("renders objective nudge when no modifier announcement is active", () => {
    const html = createDomOverlayMarkup({
      sun: 150,
      waveText: "第 5 波 / 10",
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
      runChallenge: {
        objective: {
          id: "plant-sunflowers",
          kind: "plant-count",
          target: 3,
          label: "种 3 朵向日葵",
          plantId: "sunflower"
        },
        modifier: {
          id: "sunny-day",
          name: "阳光日",
          shortLabel: "阳光来得快",
          announcement: "阳光日：阳光来得快",
          adjustments: {}
        },
        current: 2,
        completed: false
      }
    });

    expect(html).toContain("还差 1 朵向日葵");
  });

  it("renders objective result in terminal summary", () => {
    const html = createDomOverlayMarkup({
      sun: 120,
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
      plantsCount: 4,
      spawnedWaveCount: 8,
      totalWaveCount: 8,
      runChallenge: {
        objective: { id: "defeat-zombies", kind: "defeat-count", target: 5, label: "打倒 5 个僵尸" },
        modifier: {
          id: "slow-start",
          name: "慢慢来",
          shortLabel: "第一波晚一点",
          announcement: "慢慢来：第一波晚一点",
          adjustments: {}
        },
        current: 5,
        completed: true
      }
    });

    expect(html).toContain("小任务完成");
    expect(html).toContain("objective-result");
  });

  it("renders a scene picker in menu state", () => {
    const html = createDomOverlayMarkup({
      sun: 250,
      waveText: "第 1 波 / 8",
      status: "menu",
      selectedPlantId: null,
      cooldownReadyAt: {
        sunflower: 0,
        peashooter: 0,
        wallnut: 0,
        snowpea: 0,
        potatomine: 0
      },
      nowMs: 0,
      selectedSceneThemeId: "sunny-lawn"
    });

    expect(html).toContain('class="scene-picker"');
    expect(html).toContain('class="scene-card-grid"');
    expect(html).toContain('class="scene-picker-bottom"');
    expect(html).toContain("--scene-card-bg:");
    expect(html).toContain("--scene-card-image:");
    expect(html).toContain("image2-garden-board.png");
    expect(html).toContain("image2-dewy-board.png");
    expect(html).toContain("image2-starlight-board.png");
    expect(html).toContain("今天去哪里守护");
    expect(html).toContain('data-scene-theme="sunny-lawn"');
    expect(html).toContain('data-scene-theme="dewy-garden"');
    expect(html).toContain('data-scene-theme="starlight-farm"');
    expect(html).toContain("阳光草坪");
    expect(html).toContain("露珠菜园");
    expect(html).toContain("星光农圃");
    expect(html).toContain('data-action="start-scene"');
    expect(html).toContain("开始守护");
    expect(html).toContain('data-difficulty="easy"');
  });

  it("marks the selected scene card", () => {
    const html = createDomOverlayMarkup({
      sun: 250,
      waveText: "第 1 波 / 8",
      status: "menu",
      selectedPlantId: null,
      cooldownReadyAt: {
        sunflower: 0,
        peashooter: 0,
        wallnut: 0,
        snowpea: 0,
        potatomine: 0
      },
      nowMs: 0,
      selectedSceneThemeId: "starlight-farm"
    });

    expect(html).toContain('class="scene-card scene-card--starlight-farm is-selected"');
    expect(html).toContain("星光慢，阳光少点");
  });

  it("selects scene cards from pointer input", () => {
    let pointerHandler: ((event: Event) => void) | null = null;
    const root = {
      innerHTML: "",
      addEventListener: vi.fn((eventName: string, handler: (event: Event) => void) => {
        if (eventName === "pointerdown") pointerHandler = handler;
      })
    };
    const scene = {
      uiEvents: { on: vi.fn() },
      setSelectedPlant: vi.fn(),
      plantAtCell: vi.fn(),
      togglePause: vi.fn(),
      restartLevel: vi.fn(),
      nextLevel: vi.fn(),
      getCurrentLevel: vi.fn(() => LEVEL_ONE),
      hasNextLevel: vi.fn(() => false),
      getCurrentDifficultyId: vi.fn(() => "normal"),
      setDifficulty: vi.fn(),
      moveHeroLane: vi.fn(),
      getCurrentSceneTheme: vi.fn(() => ({ id: "sunny-lawn" })),
      setSelectedSceneTheme: vi.fn(),
      startSelectedScene: vi.fn()
    } as unknown as GameScene;
    const target = {
      closest: vi.fn((selector: string) =>
        selector === "[data-scene-theme]" ? { dataset: { sceneTheme: "dewy-garden" } } : null
      )
    } as unknown as HTMLElement;
    const event = { target, preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as Event;

    createDomOverlay(root as unknown as Element, scene);
    pointerHandler!(event);

    expect((scene as unknown as { setSelectedSceneTheme: ReturnType<typeof vi.fn> }).setSelectedSceneTheme).toHaveBeenCalledWith("dewy-garden");
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("starts the selected scene from the start action", () => {
    let clickHandler: ((event: Event) => void) | null = null;
    const root = {
      innerHTML: "",
      addEventListener: vi.fn((_eventName: string, handler: (event: Event) => void) => {
        clickHandler = handler;
      })
    };
    const scene = {
      uiEvents: { on: vi.fn() },
      setSelectedPlant: vi.fn(),
      togglePause: vi.fn(),
      restartLevel: vi.fn(),
      nextLevel: vi.fn(),
      getCurrentLevel: vi.fn(() => LEVEL_ONE),
      hasNextLevel: vi.fn(() => false),
      getCurrentDifficultyId: vi.fn(() => "normal"),
      setDifficulty: vi.fn(),
      moveHeroLane: vi.fn(),
      getCurrentSceneTheme: vi.fn(() => ({ id: "sunny-lawn" })),
      setSelectedSceneTheme: vi.fn(),
      startSelectedScene: vi.fn()
    } as unknown as GameScene;
    const startTarget = {
      closest: vi.fn((selector: string) => (selector === "[data-action]" ? { dataset: { action: "start-scene" } } : null))
    } as unknown as HTMLElement;

    createDomOverlay(root as unknown as Element, scene);
    clickHandler!({ target: startTarget } as unknown as Event);

    expect((scene as unknown as { startSelectedScene: ReturnType<typeof vi.fn> }).startSelectedScene).toHaveBeenCalled();
  });
});
