# Kids Scene Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an iPad-first opening scene picker with three clearly distinct offline scenes and light scene-specific rhythm differences.

**Architecture:** Add a focused scene theme catalog, store the selected scene in `GameScene`, and use `GameStatus.menu` for the opening picker. Rules receive scene adjustments explicitly through game state, while DOM and Phaser presentation read the same scene config so scene cards and active playfields match.

**Tech Stack:** TypeScript, Phaser, DOM HUD, Vitest, Vite, browser visual verification.

---

## File Structure

- Create `src/game/sceneThemes.ts`: three-scene catalog, default scene id, display copy, rule adjustments, and presentation values.
- Create `src/game/sceneThemes.test.ts`: catalog uniqueness, short copy, conservative adjustments, and visual distinctness coverage.
- Modify `src/game/types.ts`: add scene theme id, rule adjustment, presentation types, and `GameState` fields for selected scene data.
- Modify `src/game/rules.ts`: apply scene starting sun, first-wave delay, and zombie speed multiplier.
- Modify `src/game/rules.test.ts`: scene adjustment coverage and interaction with existing run challenge modifiers.
- Modify `src/game/GameScene.ts`: menu state, selected scene control, start flow, difficulty behavior, static board redraw, and scene-aware presentation.
- Modify `src/game/GameScene.test.ts`: menu/default scene/start-flow tests using the existing Phaser mock style.
- Modify `src/ui/domOverlay.ts`: render scene picker while `status === "menu"` and wire scene selection/start actions.
- Modify `src/ui/domOverlay.test.ts`: picker markup, scene card action, start action, and post-start run challenge HUD coverage.
- Modify `src/game/worldPresentation.ts`: scene decoration helper for sun rays, dew beads, and star glints if the Phaser rendering needs deterministic decoration data.
- Modify `src/game/worldPresentation.test.ts`: bounded deterministic scene decoration coverage.
- Modify `src/styles.css`: iPad landscape scene picker layout and visibly distinct scene card styling.
- Modify `docs/project-roadmap.md`: record the scene picker milestone after implementation.

## Task 1: Scene Theme Catalog

**Files:**
- Create: `src/game/sceneThemes.ts`
- Create: `src/game/sceneThemes.test.ts`
- Modify: `src/game/types.ts`

- [ ] **Step 1: Add failing scene catalog tests**

Create `src/game/sceneThemes.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DEFAULT_SCENE_THEME_ID, SCENE_THEMES, getSceneTheme } from "./sceneThemes";

describe("scene themes", () => {
  it("defines exactly three first-version scenes with a valid default", () => {
    expect(SCENE_THEMES).toHaveLength(3);
    expect(new Set(SCENE_THEMES.map((theme) => theme.id)).size).toBe(3);
    expect(SCENE_THEMES.map((theme) => theme.id)).toEqual(["sunny-lawn", "dewy-garden", "starlight-farm"]);
    expect(getSceneTheme(DEFAULT_SCENE_THEME_ID).id).toBe("sunny-lawn");
  });

  it("keeps scene labels and hints short enough for iPad cards", () => {
    SCENE_THEMES.forEach((theme) => {
      expect(theme.name.length).toBeLessThanOrEqual(5);
      expect(theme.pickerHint.length).toBeLessThanOrEqual(14);
      expect(theme.hudHint.length).toBeLessThanOrEqual(12);
    });
  });

  it("keeps scene rule adjustments conservative", () => {
    const sunny = getSceneTheme("sunny-lawn");
    const dewy = getSceneTheme("dewy-garden");
    const starlight = getSceneTheme("starlight-farm");

    expect(sunny.adjustments).toEqual({});
    expect(dewy.adjustments.firstWaveDelayMs).toBeGreaterThanOrEqual(2500);
    expect(dewy.adjustments.firstWaveDelayMs).toBeLessThanOrEqual(4500);
    expect(starlight.adjustments.zombieSpeedMultiplier).toBeGreaterThanOrEqual(0.86);
    expect(starlight.adjustments.zombieSpeedMultiplier).toBeLessThan(1);
    expect(starlight.adjustments.startingSunDelta).toBeGreaterThanOrEqual(-25);
  });

  it("gives each scene a distinct visual identity", () => {
    expect(new Set(SCENE_THEMES.map((theme) => theme.presentation.decoration))).toEqual(
      new Set(["sun-rays", "dew-beads", "star-glints"])
    );
    expect(new Set(SCENE_THEMES.map((theme) => theme.presentation.tabletopBaseColor)).size).toBe(3);
    expect(new Set(SCENE_THEMES.map((theme) => theme.presentation.cardGradient)).size).toBe(3);
  });
});
```

- [ ] **Step 2: Run the scene catalog test to verify it fails**

Run:

```bash
npm test -- src/game/sceneThemes.test.ts
```

Expected: FAIL because `src/game/sceneThemes.ts` does not exist.

- [ ] **Step 3: Add scene types**

In `src/game/types.ts`, add these types after `DifficultyConfig`:

```ts
export type SceneThemeId = "sunny-lawn" | "dewy-garden" | "starlight-farm";

export interface SceneRuleAdjustments {
  firstWaveDelayMs?: number;
  startingSunDelta?: number;
  zombieSpeedMultiplier?: number;
}

export type SceneDecorationKind = "sun-rays" | "dew-beads" | "star-glints";

export interface ScenePresentationConfig {
  tabletopBaseColor: number;
  tabletopPlankColors: number[];
  tabletopShadowColor: number;
  boardMatColor: number;
  boardFrameColor: number;
  boardArtAlpha: number;
  laneWashColor: number;
  tileWashColor: number;
  tileHighlightColor: number;
  tileShadowColor: number;
  fleckColor: number;
  fleckAltColor: number;
  cardGradient: string;
  cardAccent: string;
  cardInk: string;
  decoration: SceneDecorationKind;
}
```

Add these fields to `GameState`:

```ts
sceneThemeId: SceneThemeId;
sceneAdjustments: SceneRuleAdjustments;
```

- [ ] **Step 4: Implement the scene catalog**

Create `src/game/sceneThemes.ts`:

```ts
import type { ScenePresentationConfig, SceneRuleAdjustments, SceneThemeId } from "./types";

export interface SceneThemeConfig {
  id: SceneThemeId;
  name: string;
  shortName: string;
  pickerHint: string;
  hudHint: string;
  startAnnouncement: string;
  adjustments: SceneRuleAdjustments;
  presentation: ScenePresentationConfig;
}

export const DEFAULT_SCENE_THEME_ID: SceneThemeId = "sunny-lawn";

export const SCENE_THEMES: SceneThemeConfig[] = [
  {
    id: "sunny-lawn",
    name: "阳光草坪",
    shortName: "草坪",
    pickerHint: "标准草坪，先玩一局",
    hudHint: "标准草坪",
    startAnnouncement: "阳光草坪：标准开局",
    adjustments: {},
    presentation: {
      tabletopBaseColor: 0xeebf7a,
      tabletopPlankColors: [0xe8ad68, 0xf0c07b, 0xe4a45f, 0xf3c889],
      tabletopShadowColor: 0x5c4330,
      boardMatColor: 0x7aa86b,
      boardFrameColor: 0x68482e,
      boardArtAlpha: 0.98,
      laneWashColor: 0xffffff,
      tileWashColor: 0xbde26c,
      tileHighlightColor: 0xfff8df,
      tileShadowColor: 0x174a36,
      fleckColor: 0xfff8df,
      fleckAltColor: 0xc6ec82,
      cardGradient: "linear-gradient(180deg, #fff0a8 0 42%, #96cf66 42%)",
      cardAccent: "#ffd34f",
      cardInk: "#5c4330",
      decoration: "sun-rays"
    }
  },
  {
    id: "dewy-garden",
    name: "露珠菜园",
    shortName: "菜园",
    pickerHint: "露珠亮，第一波晚",
    hudHint: "第一波晚一点",
    startAnnouncement: "露珠菜园：第一波晚一点",
    adjustments: { firstWaveDelayMs: 3500 },
    presentation: {
      tabletopBaseColor: 0xcbbf8d,
      tabletopPlankColors: [0xbfdba8, 0xd8e9ba, 0xaed6c6, 0xe4d59c],
      tabletopShadowColor: 0x45655f,
      boardMatColor: 0x83b99f,
      boardFrameColor: 0x3f6f67,
      boardArtAlpha: 0.86,
      laneWashColor: 0xdaf8ff,
      tileWashColor: 0x8ed7a4,
      tileHighlightColor: 0xe8fbff,
      tileShadowColor: 0x2d6b5f,
      fleckColor: 0xdaf8ff,
      fleckAltColor: 0x9be4c4,
      cardGradient: "linear-gradient(180deg, #c9f2ec 0 42%, #8bd6a2 42%)",
      cardAccent: "#9fd7ef",
      cardInk: "#31595c",
      decoration: "dew-beads"
    }
  },
  {
    id: "starlight-farm",
    name: "星光农圃",
    shortName: "星光",
    pickerHint: "星光慢，阳光少点",
    hudHint: "敌人慢一点",
    startAnnouncement: "星光农圃：敌人慢一点，阳光少一点",
    adjustments: { zombieSpeedMultiplier: 0.9, startingSunDelta: -25 },
    presentation: {
      tabletopBaseColor: 0x6f6a88,
      tabletopPlankColors: [0x5f6384, 0x77709a, 0x687c8d, 0x8a7a9d],
      tabletopShadowColor: 0x263238,
      boardMatColor: 0x627f62,
      boardFrameColor: 0x38435f,
      boardArtAlpha: 0.78,
      laneWashColor: 0xdff2ff,
      tileWashColor: 0x78b67c,
      tileHighlightColor: 0xfff1a3,
      tileShadowColor: 0x263238,
      fleckColor: 0xfff1a3,
      fleckAltColor: 0xbdefff,
      cardGradient: "linear-gradient(180deg, #596184 0 42%, #78b67c 42%)",
      cardAccent: "#fff1a3",
      cardInk: "#fff8df",
      decoration: "star-glints"
    }
  }
];

export function getSceneTheme(sceneThemeId: SceneThemeId): SceneThemeConfig {
  return SCENE_THEMES.find((theme) => theme.id === sceneThemeId) ?? SCENE_THEMES[0];
}
```

- [ ] **Step 5: Run scene catalog tests**

Run:

```bash
npm test -- src/game/sceneThemes.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit Task 1**

Run:

```bash
git add src/game/types.ts src/game/sceneThemes.ts src/game/sceneThemes.test.ts
git commit -m "feat: add scene theme catalog"
```

## Task 2: Scene Rule Adjustments

**Files:**
- Modify: `src/game/rules.ts`
- Modify: `src/game/rules.test.ts`

- [ ] **Step 1: Add failing rule tests for scene adjustments**

Append these tests near the other `createInitialState`, `spawnDueZombies`, and `advanceCombat` tests inside `describe("game rules", () => { })` in `src/game/rules.test.ts`:

```ts
  it("stores the selected scene on initial state", () => {
    const state = createInitialState(LEVEL_ONE, DIFFICULTY.normal, undefined, getSceneTheme("dewy-garden"));

    expect(state.sceneThemeId).toBe("dewy-garden");
    expect(state.sceneAdjustments).toMatchObject({ firstWaveDelayMs: 3500 });
  });

  it("applies scene starting sun adjustments after difficulty", () => {
    const sunny = createInitialState(LEVEL_ONE, DIFFICULTY.normal, undefined, getSceneTheme("sunny-lawn"));
    const starlight = createInitialState(LEVEL_ONE, DIFFICULTY.normal, undefined, getSceneTheme("starlight-farm"));

    expect(starlight.sun).toBe(sunny.sun - 25);
    expect(starlight.sun).toBeGreaterThanOrEqual(0);
  });

  it("delays the first wave from the selected scene", () => {
    const dewy = getSceneTheme("dewy-garden");
    const beforeFirstWave = {
      ...createInitialState(LEVEL_ONE, DIFFICULTY.normal, undefined, dewy),
      nowMs: LEVEL_ONE.waves[0].atMs + dewy.adjustments.firstWaveDelayMs! - 1
    };
    const atFirstWave = { ...beforeFirstWave, nowMs: beforeFirstWave.nowMs + 1 };

    expect(spawnDueZombies(beforeFirstWave, LEVEL_ONE, ZOMBIES).zombies).toHaveLength(0);
    expect(spawnDueZombies(atFirstWave, LEVEL_ONE, ZOMBIES).zombies).toHaveLength(1);
  });

  it("multiplies scene and run challenge zombie speed adjustments", () => {
    const starlight = getSceneTheme("starlight-farm");
    const base = {
      ...createInitialState(LEVEL_ONE, DIFFICULTY.normal, undefined, starlight),
      zombies: [{ id: "zombie-1", zombieId: "basic" as const, lane: 2 as const, x: 8, hp: 70, slowedUntilMs: 0 }]
    };
    const runAdjusted = {
      ...base,
      runChallenge: {
        objective: { id: "defeat-zombies", kind: "defeat-count", target: 5, label: "打倒 5 个僵尸" },
        modifier: {
          id: "little-hero",
          name: "小勇士",
          shortLabel: "敌人慢一点",
          announcement: "小勇士：敌人慢一点，小车少一点",
          adjustments: { zombieSpeedMultiplier: 0.88 }
        },
        current: 0,
        completed: false
      }
    } as const;

    const sceneOnly = advanceCombat(base, PLANTS, ZOMBIES, 1000, DIFFICULTY.normal);
    const sceneAndRun = advanceCombat(runAdjusted, PLANTS, ZOMBIES, 1000, DIFFICULTY.normal);

    expect(sceneOnly.zombies[0].x).toBeGreaterThan(advanceCombat({ ...base, sceneAdjustments: {} }, PLANTS, ZOMBIES, 1000, DIFFICULTY.normal).zombies[0].x);
    expect(sceneAndRun.zombies[0].x).toBeGreaterThan(sceneOnly.zombies[0].x);
  });
```

At the top of `src/game/rules.test.ts`, add:

```ts
import { getSceneTheme } from "./sceneThemes";
```

- [ ] **Step 2: Run rule tests to verify they fail**

Run:

```bash
npm test -- src/game/rules.test.ts
```

Expected: FAIL because `createInitialState` does not accept scene themes and `GameState` does not yet store scene adjustments.

- [ ] **Step 3: Apply scene adjustments in rules**

In `src/game/rules.ts`, import scene helpers:

```ts
import { DEFAULT_SCENE_THEME_ID, getSceneTheme, type SceneThemeConfig } from "./sceneThemes";
```

Change `createInitialState` signature:

```ts
export function createInitialState(
  level: LevelConfig,
  difficulty: DifficultyConfig = NORMAL_DIFFICULTY,
  runChallenge?: RunChallengeState,
  sceneTheme: SceneThemeConfig = getSceneTheme(DEFAULT_SCENE_THEME_ID)
): GameState {
```

Change sun calculation:

```ts
  const sun = Math.max(
    0,
    applySunMultiplier(level.startingSun, difficulty) +
      (sceneTheme.adjustments.startingSunDelta ?? 0) +
      (runChallenge?.modifier.adjustments.startingSunDelta ?? 0)
  );
```

Add these fields to the returned state:

```ts
    sceneThemeId: sceneTheme.id,
    sceneAdjustments: { ...sceneTheme.adjustments },
```

Change first-wave delay in `spawnDueZombies`:

```ts
  const firstWaveDelayMs =
    (state.sceneAdjustments.firstWaveDelayMs ?? 0) + (state.runChallenge?.modifier.adjustments.firstWaveDelayMs ?? 0);
```

Change movement speed in `advanceCombat`:

```ts
  const sceneSpeedMultiplier = state.sceneAdjustments.zombieSpeedMultiplier ?? 1;
  const runSpeedMultiplier = state.runChallenge?.modifier.adjustments.zombieSpeedMultiplier ?? 1;
```

Then include `sceneSpeedMultiplier` in the x calculation:

```ts
        config.speedCellsPerSecond *
          difficulty.zombieSpeedMultiplier *
          sceneSpeedMultiplier *
          runSpeedMultiplier *
          slowMultiplier *
          deltaSeconds
```

- [ ] **Step 4: Run focused tests**

Run:

```bash
npm test -- src/game/rules.test.ts src/game/sceneThemes.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 2**

Run:

```bash
git add src/game/rules.ts src/game/rules.test.ts
git commit -m "feat: apply scene rule adjustments"
```

## Task 3: GameScene Menu Flow

**Files:**
- Modify: `src/game/GameScene.ts`
- Modify: `src/game/GameScene.test.ts`

- [ ] **Step 1: Add failing GameScene tests**

Replace `src/game/GameScene.test.ts` with:

```ts
import { describe, expect, it, vi } from "vitest";

vi.mock("phaser", () => ({
  default: {
    Scene: class {
      constructor(_key: string) {}
    },
    Events: {
      EventEmitter: class {
        emit = vi.fn();
        on = vi.fn();
      }
    }
  }
}));

describe("GameScene menu and run challenges", () => {
  it("starts in menu with the default scene and no run challenge", async () => {
    const { GameScene } = await import("./GameScene");
    const scene = new GameScene();

    expect(scene.getCurrentStatus()).toBe("menu");
    expect(scene.getCurrentSceneTheme().id).toBe("sunny-lawn");
    expect(scene.getCurrentRunChallenge()).toBeNull();
  });

  it("selects a scene before starting the level", async () => {
    const { GameScene } = await import("./GameScene");
    const scene = new GameScene();

    scene.setSelectedSceneTheme("dewy-garden");

    expect(scene.getCurrentStatus()).toBe("menu");
    expect(scene.getCurrentSceneTheme().id).toBe("dewy-garden");
  });

  it("starts a selected scene with a run challenge and modifier announcement", async () => {
    const { GameScene } = await import("./GameScene");
    const scene = new GameScene();

    scene.setSelectedSceneTheme("starlight-farm");
    scene.startSelectedScene();

    expect(scene.getCurrentStatus()).toBe("playing");
    expect(scene.getCurrentSceneTheme().id).toBe("starlight-farm");
    expect(scene.getCurrentRunChallenge()).toMatchObject({
      objective: expect.objectContaining({ label: expect.any(String) }),
      modifier: expect.objectContaining({ announcement: expect.stringContaining("：") })
    });
    expect(scene.getCurrentModifierAnnouncement()).toContain("：");
  });
});
```

- [ ] **Step 2: Run GameScene tests to verify they fail**

Run:

```bash
npm test -- src/game/GameScene.test.ts
```

Expected: FAIL because `getCurrentStatus`, `getCurrentSceneTheme`, `setSelectedSceneTheme`, and `startSelectedScene` do not exist.

- [ ] **Step 3: Add scene selection state and menu start flow**

In `src/game/GameScene.ts`, import scene helpers:

```ts
import { DEFAULT_SCENE_THEME_ID, getSceneTheme, type SceneThemeConfig } from "./sceneThemes";
import type { SceneThemeId } from "./types";
```

Add class fields:

```ts
  private selectedSceneThemeId: SceneThemeId = DEFAULT_SCENE_THEME_ID;
  private sceneAnnouncement: string | null = null;
  private sceneAnnouncementUntilMs = 0;
```

Initialize state with the default scene:

```ts
  private state: GameState = createInitialState(
    LEVELS[0],
    DIFFICULTY.normal,
    undefined,
    getSceneTheme(DEFAULT_SCENE_THEME_ID)
  );
```

Change `create()` so it no longer starts combat immediately:

```ts
  create(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys("W,A,S,D,SPACE,ESC") as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.handlePointer(pointer));
    this.drawStaticBoard();
    this.uiEvents.emit("state-changed", this.state);
  }
```

Add public helpers:

```ts
  getCurrentStatus(): GameState["status"] {
    return this.state.status;
  }

  getCurrentSceneTheme(): SceneThemeConfig {
    return getSceneTheme(this.selectedSceneThemeId);
  }

  setSelectedSceneTheme(sceneThemeId: SceneThemeId): void {
    if (sceneThemeId === this.selectedSceneThemeId) return;
    this.selectedSceneThemeId = sceneThemeId;
    if (this.state.status === "menu") {
      this.state = {
        ...createInitialState(this.currentLevel, this.currentDifficulty, undefined, this.getCurrentSceneTheme()),
        status: "menu"
      };
    }
    this.uiEvents.emit("sound-requested", "button");
    this.redrawFullWorld();
    this.uiEvents.emit("state-changed", this.state);
  }

  startSelectedScene(): void {
    if (this.state.status !== "menu") return;
    this.uiEvents.emit("sound-requested", "button");
    this.startCurrentLevel();
    this.redrawFullWorld();
    this.uiEvents.emit("state-changed", this.state);
  }
```

Change `setDifficulty` so menu changes do not start combat:

```ts
  setDifficulty(difficultyId: DifficultyId): void {
    if (!DIFFICULTY[difficultyId] || difficultyId === this.currentDifficultyId) return;
    this.uiEvents.emit("sound-requested", "button");
    this.currentDifficultyId = difficultyId;
    if (this.state.status === "menu") {
      this.state = {
        ...createInitialState(this.currentLevel, this.currentDifficulty, undefined, this.getCurrentSceneTheme()),
        status: "menu"
      };
      this.uiEvents.emit("state-changed", this.state);
      return;
    }
    this.startCurrentLevel();
    this.redrawFullWorld();
    this.uiEvents.emit("state-changed", this.state);
  }
```

Change `startCurrentLevel` to pass the selected scene:

```ts
    this.sceneAnnouncement = this.getCurrentSceneTheme().startAnnouncement;
    this.sceneAnnouncementUntilMs = 6200;
    this.state = {
      ...createInitialState(this.currentLevel, this.currentDifficulty, runChallenge, this.getCurrentSceneTheme()),
      status: "playing"
    };
```

Add a full redraw helper:

```ts
  private redrawFullWorld(): void {
    if (!this.children?.removeAll) return;
    this.children.removeAll();
    this.drawStaticBoard();
    if (this.state.status === "playing") this.redrawDynamicWorld();
  }
```

Guard board clicks while in the menu:

```ts
  private handlePointer(pointer: Phaser.Input.Pointer): void {
    if (this.state.status !== "playing") return;
    const column = Math.floor(((pointer.x - BOARD.x) / BOARD.width) * BOARD.columns);
    const lane = Math.floor(((pointer.y - BOARD.y) / BOARD.height) * BOARD.lanes);
    if (column < 0 || column > 8 || lane < 0 || lane > 4) {
      this.uiEvents.emit("feedback-changed", { type: "planting", reason: "outside-board" });
      return;
    }
    this.plantAtCell(lane as LaneIndex, column as ColumnIndex);
  }
```

Update `getCurrentModifierAnnouncement` to allow a scene hint after modifier text expires:

```ts
  getCurrentModifierAnnouncement(): string | null {
    if (this.modifierAnnouncement && this.state.nowMs <= this.modifierAnnouncementUntilMs) return this.modifierAnnouncement;
    if (this.sceneAnnouncement && this.state.nowMs <= this.sceneAnnouncementUntilMs) return this.sceneAnnouncement;
    return null;
  }
```

- [ ] **Step 4: Run GameScene tests**

Run:

```bash
npm test -- src/game/GameScene.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 3**

Run:

```bash
git add src/game/GameScene.ts src/game/GameScene.test.ts
git commit -m "feat: add scene picker game flow"
```

## Task 4: DOM Scene Picker

**Files:**
- Modify: `src/ui/domOverlay.ts`
- Modify: `src/ui/domOverlay.test.ts`

- [ ] **Step 1: Add failing DOM picker markup tests**

Append to `src/ui/domOverlay.test.ts`:

```ts
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
```

- [ ] **Step 2: Add failing DOM action tests**

Append to `src/ui/domOverlay.test.ts`:

```ts
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
```

- [ ] **Step 3: Run DOM tests to verify they fail**

Run:

```bash
npm test -- src/ui/domOverlay.test.ts
```

Expected: FAIL because scene picker props and actions are not implemented.

- [ ] **Step 4: Implement scene picker markup**

In `src/ui/domOverlay.ts`, import scenes:

```ts
import { DEFAULT_SCENE_THEME_ID, SCENE_THEMES } from "../game/sceneThemes";
import type { SceneThemeId } from "../game/types";
```

Add to `OverlayRenderState`:

```ts
  selectedSceneThemeId?: SceneThemeId;
```

Add a picker helper above `createDomOverlayMarkup`:

```ts
function getScenePickerMarkup(state: OverlayRenderState): string {
  const selectedSceneThemeId = state.selectedSceneThemeId ?? DEFAULT_SCENE_THEME_ID;
  const sceneCards = SCENE_THEMES.map((theme) => {
    const selected = theme.id === selectedSceneThemeId ? " is-selected" : "";
    return `<button class="scene-card scene-card--${theme.id}${selected}" data-scene-theme="${theme.id}" style="--scene-card-bg: ${theme.presentation.cardGradient}; --scene-card-accent: ${theme.presentation.cardAccent}; --scene-card-ink: ${theme.presentation.cardInk}">
      <span class="scene-card-art"></span>
      <strong>${theme.name}</strong>
      <span>${theme.pickerHint}</span>
    </button>`;
  }).join("");
  const selectedTheme = SCENE_THEMES.find((theme) => theme.id === selectedSceneThemeId) ?? SCENE_THEMES[0];
  const difficultyButtons = difficultyOptions
    .map((option) => {
      const selected = (state.difficultyId ?? "normal") === option.id ? " is-selected" : "";
      return `<button data-difficulty="${option.id}" class="difficulty-option${selected}">${option.label}</button>`;
    })
    .join("");

  return `<div class="scene-picker">
    <div class="scene-picker-top">
      <div>
        <h1>今天去哪里守护？</h1>
        <p>${selectedTheme.hudHint}</p>
      </div>
      <div class="difficulty-toggle">${difficultyButtons}</div>
    </div>
    <div class="scene-card-grid">${sceneCards}</div>
    <div class="scene-picker-bottom">
      <span>${selectedTheme.startAnnouncement}</span>
      <button class="chip scene-start-button" data-action="start-scene">开始守护</button>
    </div>
  </div>`;
}
```

At the start of `createDomOverlayMarkup`, return the picker for menu state:

```ts
  if (state.status === "menu") return getScenePickerMarkup(state);
```

- [ ] **Step 5: Wire scene actions**

In `createDomOverlay`, include selected scene while rendering:

```ts
      selectedSceneThemeId: challengeScene.getCurrentSceneTheme?.().id ?? DEFAULT_SCENE_THEME_ID,
```

Extend the `challengeScene` local type:

```ts
      getCurrentSceneTheme?: () => { id: SceneThemeId };
```

In the `pointerdown` listener, before plant card handling, add:

```ts
    const sceneButton = target.closest("[data-scene-theme]") as HTMLElement | null;
    if (sceneButton) {
      event.preventDefault();
      event.stopPropagation();
      const sceneActions = scene as GameScene & { setSelectedSceneTheme?: (sceneThemeId: SceneThemeId) => void };
      sceneActions.setSelectedSceneTheme?.(sceneButton.dataset.sceneTheme as SceneThemeId);
      return;
    }
```

In the click listener, before pause handling, add:

```ts
    if (actionButton?.dataset.action === "start-scene") {
      const sceneActions = scene as GameScene & { startSelectedScene?: () => void };
      sceneActions.startSelectedScene?.();
      return;
    }
```

- [ ] **Step 6: Run DOM tests**

Run:

```bash
npm test -- src/ui/domOverlay.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit Task 4**

Run:

```bash
git add src/ui/domOverlay.ts src/ui/domOverlay.test.ts
git commit -m "feat: render scene picker overlay"
```

## Task 5: Distinct Phaser Scene Presentation

**Files:**
- Modify: `src/game/worldPresentation.ts`
- Modify: `src/game/worldPresentation.test.ts`
- Modify: `src/game/GameScene.ts`

- [ ] **Step 1: Add failing scene decoration helper tests**

In `src/game/worldPresentation.test.ts`, add imports:

```ts
  getSceneDecorationCount,
  getSceneDecorationState,
```

Append tests:

```ts
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
```

- [ ] **Step 2: Run presentation tests to verify they fail**

Run:

```bash
npm test -- src/game/worldPresentation.test.ts
```

Expected: FAIL because scene decoration helpers do not exist.

- [ ] **Step 3: Add scene decoration helpers**

In `src/game/worldPresentation.ts`, import:

```ts
import type { SceneDecorationKind } from "./types";
```

Add interfaces and helpers:

```ts
export interface SceneDecorationState {
  xRatio: number;
  yRatio: number;
  size: number;
  alpha: number;
  rotationDeg: number;
}

export function getSceneDecorationCount(kind: SceneDecorationKind): number {
  if (kind === "sun-rays") return 8;
  if (kind === "dew-beads") return 16;
  return 14;
}

export function getSceneDecorationState(kind: SceneDecorationKind, nowMs: number, index: number): SceneDecorationState {
  const safeIndex = Math.max(0, index);
  const count = getSceneDecorationCount(kind);
  const phase = nowMs / (kind === "sun-rays" ? 1500 : kind === "dew-beads" ? 980 : 1180) + safeIndex * 0.71;
  const shimmer = 0.5 + Math.sin(phase) * 0.5;
  const xRatio = clamp(0.08 + (((safeIndex * 31) % 86) / 100), 0.02, 0.98);
  const yRatio = clamp(0.08 + (((safeIndex * 47) % 82) / 100), 0.04, 0.96);

  if (kind === "sun-rays") {
    return {
      xRatio: clamp(0.12 + safeIndex / Math.max(1, count - 1) * 0.76, 0, 1),
      yRatio: clamp(0.08 + Math.sin(phase) * 0.035, 0, 1),
      size: 26 + shimmer * 16,
      alpha: 0.08 + shimmer * 0.14,
      rotationDeg: -18 + safeIndex * 5
    };
  }

  if (kind === "dew-beads") {
    return {
      xRatio,
      yRatio,
      size: 5 + (safeIndex % 4) * 2 + shimmer * 2,
      alpha: 0.2 + shimmer * 0.28,
      rotationDeg: nowMs / 28 + safeIndex * 31
    };
  }

  return {
    xRatio,
    yRatio,
    size: 8 + (safeIndex % 3) * 4 + shimmer * 5,
    alpha: 0.16 + shimmer * 0.34,
    rotationDeg: nowMs / 18 + safeIndex * 37
  };
}
```

- [ ] **Step 4: Run presentation helper tests**

Run:

```bash
npm test -- src/game/worldPresentation.test.ts
```

Expected: PASS.

- [ ] **Step 5: Make Phaser board rendering scene-aware**

In `src/game/GameScene.ts`, import helpers:

```ts
  getSceneDecorationCount,
  getSceneDecorationState,
```

Change `drawStaticBoard` to read:

```ts
    const sceneTheme = this.getCurrentSceneTheme();
    const presentation = sceneTheme.presentation;
```

Pass presentation into tabletop drawing:

```ts
    this.drawTabletop(presentation);
```

Change hard-coded static colors to presentation-driven colors:

```ts
    this.add.rectangle(640, 360, 1280, 720, presentation.tabletopBaseColor);
    this.add.rectangle(640, 326, 1092, 430, presentation.boardMatColor, 0.36).setStrokeStyle(5, presentation.boardFrameColor, 0.92);
    boardArt.setAlpha(presentation.boardArtAlpha);
```

Update `drawTabletop` signature and plank colors:

```ts
  private drawTabletop(presentation: SceneThemeConfig["presentation"]): void {
    this.add.rectangle(640, 360, 1280, 720, presentation.tabletopBaseColor);
    for (let plank = 0; plank < 16; plank += 1) {
      const x = plank * 88 + 44;
      const color = presentation.tabletopPlankColors[plank % presentation.tabletopPlankColors.length];
      this.add.rectangle(x, 360, 88, 720, color, 0.42);
      this.add.line(x + 44, 360, 0, -360, 0, 360, presentation.tabletopShadowColor, 0.13).setLineWidth(2);
      this.add.rectangle(x - 18, 128 + (plank % 5) * 118, 42, 3, 0xfff0b8, 0.16).setAngle((plank % 3) * 4 - 4);
      this.add.rectangle(x + 14, 184 + (plank % 4) * 126, 58, 3, presentation.tabletopShadowColor, 0.08).setAngle((plank % 2) * 5 - 2);
    }
    this.add.rectangle(640, 360, 1280, 720, presentation.tabletopShadowColor, 0.04);
    this.drawSceneTableDecorations(presentation);
  }
```

Add `drawSceneTableDecorations`:

```ts
  private drawSceneTableDecorations(presentation: SceneThemeConfig["presentation"]): void {
    const decoration = presentation.decoration;
    if (decoration === "sun-rays") {
      for (let index = 0; index < 8; index += 1) {
        const ray = getSceneDecorationState(decoration, this.state.nowMs, index);
        this.add
          .rectangle(130 + index * 160, 70 + ray.yRatio * 42, ray.size * 2.4, 6, presentation.tileHighlightColor, ray.alpha)
          .setAngle(ray.rotationDeg)
          .setData("scene-static", true);
      }
      return;
    }
    if (decoration === "dew-beads") {
      for (let index = 0; index < 16; index += 1) {
        const bead = getSceneDecorationState(decoration, this.state.nowMs, index);
        this.add
          .circle(90 + bead.xRatio * 1120, 64 + bead.yRatio * 560, bead.size, presentation.fleckColor, bead.alpha)
          .setStrokeStyle(1, 0xffffff, bead.alpha * 0.7);
      }
      return;
    }
    for (let index = 0; index < 14; index += 1) {
      const star = getSceneDecorationState(decoration, this.state.nowMs, index);
      this.add
        .star(80 + star.xRatio * 1140, 58 + star.yRatio * 560, 5, 2, star.size, presentation.fleckColor, star.alpha)
        .setAngle(star.rotationDeg);
    }
  }
```

Change `drawGrassMotionLayer` to use presentation colors:

```ts
    const presentation = this.getCurrentSceneTheme().presentation;
    graphics.fillStyle(presentation.tileShadowColor, 0.05);
    graphics.fillRect(BOARD.x + 12, BOARD.y + BOARD.height - 24, BOARD.width - 24, 18);
    graphics.fillStyle(presentation.tileHighlightColor, 0.04);
    graphics.fillRect(BOARD.x + 18, BOARD.y + 13, BOARD.width - 36, 8);
    graphics.fillStyle(presentation.tileWashColor, tile.cellWashAlpha);
    graphics.fillStyle(presentation.tileHighlightColor, tile.topHighlightAlpha);
    graphics.fillStyle(presentation.tileShadowColor, tile.bottomShadowAlpha);
```

For flecks:

```ts
      graphics.lineStyle(
        Math.max(1, fleck.height),
        index % 3 === 0 ? presentation.fleckColor : presentation.fleckAltColor,
        fleck.alpha
      );
```

Add board-local decorations after flecks so active scenes are visibly different:

```ts
    for (let index = 0; index < getSceneDecorationCount(presentation.decoration); index += 1) {
      const decoration = getSceneDecorationState(presentation.decoration, this.state.nowMs, index);
      const x = BOARD.x + decoration.xRatio * BOARD.width;
      const y = BOARD.y + decoration.yRatio * BOARD.height;
      if (presentation.decoration === "dew-beads") {
        graphics.fillStyle(presentation.fleckColor, decoration.alpha * 0.7);
        graphics.fillCircle(x, y, decoration.size);
        graphics.fillStyle(0xffffff, decoration.alpha * 0.42);
        graphics.fillCircle(x - decoration.size * 0.25, y - decoration.size * 0.25, Math.max(1, decoration.size * 0.32));
      } else if (presentation.decoration === "star-glints") {
        graphics.lineStyle(2, presentation.fleckColor, decoration.alpha);
        graphics.strokeLineShape(new Phaser.Geom.Line(x - decoration.size, y, x + decoration.size, y));
        graphics.strokeLineShape(new Phaser.Geom.Line(x, y - decoration.size, x, y + decoration.size));
      } else {
        graphics.lineStyle(5, presentation.tileHighlightColor, decoration.alpha * 0.55);
        graphics.strokeLineShape(new Phaser.Geom.Line(x - decoration.size, y - decoration.size * 0.22, x + decoration.size, y + decoration.size * 0.22));
      }
    }
```

- [ ] **Step 6: Run focused presentation tests**

Run:

```bash
npm test -- src/game/worldPresentation.test.ts src/game/GameScene.test.ts
```

Expected: PASS.

- [ ] **Step 7: Commit Task 5**

Run:

```bash
git add src/game/worldPresentation.ts src/game/worldPresentation.test.ts src/game/GameScene.ts
git commit -m "feat: render distinct scene themes"
```

## Task 6: Responsive Scene Picker Styling

**Files:**
- Modify: `src/styles.css`
- Modify: `src/ui/domOverlay.test.ts`

- [ ] **Step 1: Add a markup regression for scene picker class hooks**

In the existing scene picker markup test in `src/ui/domOverlay.test.ts`, add:

```ts
    expect(html).toContain('class="scene-picker"');
    expect(html).toContain('class="scene-card-grid"');
    expect(html).toContain('class="scene-picker-bottom"');
    expect(html).toContain("--scene-card-bg:");
```

- [ ] **Step 2: Run DOM tests**

Run:

```bash
npm test -- src/ui/domOverlay.test.ts
```

Expected: PASS because Task 4 already adds the class hooks.

- [ ] **Step 3: Add responsive CSS**

Append to `src/styles.css` before the existing media queries:

```css
.scene-picker {
  position: absolute;
  inset:
    calc(20px + env(safe-area-inset-top, 0px))
    calc(20px + env(safe-area-inset-right, 0px))
    calc(20px + env(safe-area-inset-bottom, 0px))
    calc(20px + env(safe-area-inset-left, 0px));
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 14px;
  pointer-events: auto;
}

.scene-picker-top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 132px;
  gap: 12px;
  align-items: center;
}

.scene-picker h1 {
  margin: 0;
  color: #5c4330;
  font-size: 32px;
  line-height: 1.05;
}

.scene-picker p {
  margin: 5px 0 0;
  color: #5c4330;
  font-size: 18px;
  font-weight: 900;
}

.scene-card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  min-height: 0;
}

.scene-card {
  display: grid;
  grid-template-rows: minmax(130px, 1fr) auto auto;
  min-width: 0;
  min-height: 0;
  padding: 0;
  overflow: hidden;
  border: 4px solid #5c4330;
  border-radius: 8px;
  background: var(--paper);
  box-shadow: 0 6px 0 rgba(92, 67, 48, 0.18);
  color: #5c4330;
  font-weight: 900;
  text-align: center;
}

.scene-card.is-selected {
  border-color: #2f6b40;
  box-shadow:
    0 0 0 5px rgba(255, 211, 79, 0.58),
    0 6px 0 rgba(92, 67, 48, 0.18);
}

.scene-card-art {
  min-height: 0;
  background: var(--scene-card-bg);
  position: relative;
}

.scene-card-art::before {
  content: "";
  position: absolute;
  left: 12%;
  right: 12%;
  top: 47%;
  bottom: 12%;
  border: 2px solid rgba(92, 67, 48, 0.26);
  border-radius: 8px;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.16) 1px, transparent 1px) 0 0 / 24px 100%,
    rgba(255, 255, 255, 0.12);
}

.scene-card strong {
  padding: 10px 8px 0;
  font-size: 24px;
  line-height: 1.05;
}

.scene-card span:last-child {
  padding: 6px 8px 12px;
  color: var(--scene-card-ink, #5c4330);
  font-size: 16px;
  line-height: 1.1;
}

.scene-picker-bottom {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 180px;
  gap: 12px;
  align-items: stretch;
}

.scene-picker-bottom span {
  display: flex;
  min-height: 56px;
  align-items: center;
  justify-content: center;
  padding: 8px 14px;
  border: 3px solid rgba(92, 67, 48, 0.76);
  border-radius: 8px;
  background: rgba(255, 248, 223, 0.92);
  color: #5c4330;
  font-size: 18px;
  font-weight: 900;
  text-align: center;
}

.scene-start-button {
  width: 100%;
  background: #ffd34f;
}
```

Inside `@media (pointer: coarse) and (orientation: landscape) and (min-width: 760px)`, add:

```css
  .scene-picker {
    inset:
      calc(8px + env(safe-area-inset-top, 0px))
      calc(10px + env(safe-area-inset-right, 0px))
      calc(8px + env(safe-area-inset-bottom, 0px))
      calc(10px + env(safe-area-inset-left, 0px));
    gap: 8px;
  }

  .scene-picker-top {
    grid-template-columns: minmax(0, 1fr) 104px;
    gap: 8px;
  }

  .scene-picker h1 {
    font-size: 22px;
  }

  .scene-picker p {
    font-size: 13px;
  }

  .scene-card-grid {
    gap: 8px;
  }

  .scene-card {
    grid-template-rows: minmax(88px, 1fr) auto auto;
    border-width: 3px;
    box-shadow: 0 3px 0 rgba(92, 67, 48, 0.18);
  }

  .scene-card.is-selected {
    box-shadow:
      0 0 0 3px rgba(255, 211, 79, 0.62),
      0 3px 0 rgba(92, 67, 48, 0.18);
  }

  .scene-card strong {
    padding-top: 6px;
    font-size: 16px;
  }

  .scene-card span:last-child {
    padding: 4px 6px 8px;
    font-size: 12px;
  }

  .scene-picker-bottom {
    grid-template-columns: minmax(0, 1fr) 132px;
    gap: 8px;
  }

  .scene-picker-bottom span {
    min-height: 38px;
    padding: 4px 8px;
    border-width: 2px;
    font-size: 12px;
  }
```

- [ ] **Step 4: Run DOM tests after CSS changes**

Run:

```bash
npm test -- src/ui/domOverlay.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit Task 6**

Run:

```bash
git add src/styles.css src/ui/domOverlay.test.ts
git commit -m "feat: style scene picker for ipad"
```

## Task 7: Integration Verification And Roadmap

**Files:**
- Modify: `docs/project-roadmap.md`

- [ ] **Step 1: Run full automated tests**

Run:

```bash
npm test
```

Expected: PASS.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: PASS. A known Vite chunk-size warning is acceptable if no new error appears.

- [ ] **Step 3: Start the dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: dev server starts and prints a local URL, usually `http://127.0.0.1:5173/`.

- [ ] **Step 4: Browser-check the scene picker at iPad landscape**

Open the local URL at an iPad landscape-sized viewport such as `1180x820`.

Expected:

- The opening screen shows `今天去哪里守护？`.
- All three scene cards are visible without scrolling.
- The three cards are visually distinct: warm sun, cool dew, soft night.
- `阳光草坪` is selected by default.
- `开始守护` is large enough to tap.
- Difficulty buttons remain readable.
- No console errors or warnings.

- [ ] **Step 5: Browser-check selected scene gameplay**

In the browser:

1. Select `露珠菜园`.
2. Tap `开始守护`.
3. Confirm the active playfield uses cool mint/dew visuals.
4. Restart the page.
5. Select `星光农圃`.
6. Tap `开始守护`.
7. Confirm the active playfield uses soft night/star visuals.

Expected:

- Board position remains aligned with the transparent touch grid.
- Plant cards remain readable.
- Objective chip and tutorial strip do not overlap controls.
- Run challenge objective appears after start, not on the picker.
- Scene hints and modifier announcements do not create long unreadable text in iPad landscape.

- [ ] **Step 6: Update roadmap**

In `docs/project-roadmap.md`, add a completed bullet under `Current State`:

```md
- Opening scene picker adds three visibly distinct offline scenes with iPad-first cards, light scene-specific rhythm, and no backend or account system.
```

Add a milestone note under `Milestone Plan` near replay or visual work:

```md
### M13: Scene Picker And Scene Identity

Status: complete.

Goal: let children choose a clearly distinct play setting before starting a run.

Delivered:

- Opening scene picker with `阳光草坪`, `露珠菜园`, and `星光农圃`.
- Default scene selection and one-tap start flow.
- Scene-specific procedural board/tabletop visuals that can later be replaced with image2 scene art.
- Conservative scene rhythm adjustments layered with difficulty and run modifiers.
- iPad landscape verification for picker readability and touch-grid alignment.
```

- [ ] **Step 7: Stop the dev server**

Stop the dev server session cleanly with `Ctrl+C`.

Expected: no running dev server process remains from this task.

- [ ] **Step 8: Commit Task 7**

Run:

```bash
git add docs/project-roadmap.md
git commit -m "docs: record scene picker milestone"
```

- [ ] **Step 9: Final status check**

Run:

```bash
git status --short --branch
```

Expected: clean working tree on `codex/ipad-kids-feature-ideas`, with new implementation commits ahead of origin.
