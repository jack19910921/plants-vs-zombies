# Kids Run Challenges Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add short per-run objectives, gentle run modifiers, and compact iPad-first HUD feedback for a child-friendly offline replay loop.

**Architecture:** Add a focused `src/game/runChallenges.ts` module for deterministic challenge selection, modifier data, display labels, and progress helpers. Store the active challenge on `GameState` so rules update progress explicitly and DOM/Phaser only render state. Keep visual UI in the existing DOM overlay and responsive CSS, with no new setup screen or challenge picker.

**Tech Stack:** TypeScript, Phaser, Three.js, DOM HUD, Vitest, Vite.

---

## File Structure

- Create `src/game/runChallenges.ts`: challenge/modifier catalog, deterministic selection, progress helpers, label helpers.
- Create `src/game/runChallenges.test.ts`: selection, filtering, progress helper, and label tests.
- Modify `src/game/types.ts`: add run challenge types and `GameState.runChallenge`.
- Modify `src/game/rules.ts`: apply modifier adjustments and update objective progress.
- Modify `src/game/rules.test.ts`: modifier and progress integration coverage.
- Modify `src/game/GameScene.ts`: create a fresh run challenge when a level starts, restarts, advances, or difficulty changes.
- Modify `src/ui/domOverlay.ts`: render objective chip, modifier announcement, objective nudges, and terminal objective result.
- Modify `src/ui/domOverlay.test.ts`: markup coverage for new HUD and terminal states.
- Modify `src/styles.css`: responsive HUD grid for objective chip, short-label behavior, and terminal objective result chip.

## Task 1: Run Challenge Model And Selection

**Files:**
- Create: `src/game/runChallenges.ts`
- Create: `src/game/runChallenges.test.ts`
- Modify: `src/game/types.ts`

- [ ] **Step 1: Write failing tests for deterministic selection and display labels**

Add `src/game/runChallenges.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DIFFICULTY, LEVELS } from "./config";
import {
  createRunChallenge,
  getChallengeHudLabel,
  getChallengeNudgeText,
  getChallengeResultLabel,
  getModifierAnnouncement
} from "./runChallenges";

describe("run challenges", () => {
  it("selects the same challenge for the same seed and run input", () => {
    const first = createRunChallenge({
      level: LEVELS[1],
      difficultyId: "normal",
      seed: 12345,
      runIndex: 2
    });
    const second = createRunChallenge({
      level: LEVELS[1],
      difficultyId: "normal",
      seed: 12345,
      runIndex: 2
    });

    expect(second).toEqual(first);
  });

  it("changes selection when the run index changes", () => {
    const first = createRunChallenge({
      level: LEVELS[1],
      difficultyId: "normal",
      seed: 12345,
      runIndex: 1
    });
    const second = createRunChallenge({
      level: LEVELS[1],
      difficultyId: "normal",
      seed: 12345,
      runIndex: 2
    });

    expect(`${second.objective.id}:${second.modifier.id}`).not.toBe(`${first.objective.id}:${first.modifier.id}`);
  });

  it("does not select slow-hit objectives before snowpea is unlocked", () => {
    for (let seed = 1; seed <= 50; seed += 1) {
      const challenge = createRunChallenge({
        level: LEVELS[0],
        difficultyId: "normal",
        seed,
        runIndex: seed
      });

      expect(challenge.objective.kind).not.toBe("slow-hit-count");
    }
  });

  it("returns short child-readable labels", () => {
    const challenge = createRunChallenge({
      level: LEVELS[2],
      difficultyId: "easy",
      seed: 7,
      runIndex: 3
    });

    expect(getChallengeHudLabel(challenge)).toMatch(/^目标：/);
    expect(getModifierAnnouncement(challenge.modifier)).toContain("：");
    expect(getChallengeNudgeText(challenge)).not.toHaveLength(0);
    expect(getChallengeResultLabel({ ...challenge, completed: true })).toBe("小任务完成");
  });
});
```

- [ ] **Step 2: Run the new test and verify it fails**

Run:

```bash
npm test -- src/game/runChallenges.test.ts
```

Expected: FAIL because `src/game/runChallenges.ts` does not exist and the new types are not defined.

- [ ] **Step 3: Add run challenge types**

In `src/game/types.ts`, add these types after `DifficultyConfig`:

```ts
export type RunModifierId = "sunny-day" | "slow-start" | "little-hero" | "busy-garden";
export type ChallengeObjectiveId =
  | "plant-sunflowers"
  | "defeat-zombies"
  | "protect-mowers"
  | "save-sun"
  | "slow-hit-count";
export type ChallengeObjectiveKind =
  | "plant-count"
  | "defeat-count"
  | "mower-protection"
  | "sun-reserve"
  | "slow-hit-count";

export interface RunModifierAdjustments {
  baseSunIntervalMultiplier?: number;
  firstWaveDelayMs?: number;
  startingSunDelta?: number;
  mowerLaneLimit?: number;
  plantCooldownMultiplier?: Partial<Record<PlantId, number>>;
  zombieSpeedMultiplier?: number;
}

export interface RunModifier {
  id: RunModifierId;
  name: string;
  shortLabel: string;
  announcement: string;
  adjustments: RunModifierAdjustments;
}

export interface ChallengeObjective {
  id: ChallengeObjectiveId;
  kind: ChallengeObjectiveKind;
  target: number;
  label: string;
  plantId?: PlantId;
}

export interface RunChallengeState {
  objective: ChallengeObjective;
  modifier: RunModifier;
  current: number;
  completed: boolean;
}
```

Then add `runChallenge?: RunChallengeState;` to `GameState`.

- [ ] **Step 4: Implement selection and label helpers**

Create `src/game/runChallenges.ts`:

```ts
import type {
  ChallengeObjective,
  DifficultyId,
  LevelConfig,
  PlantId,
  RunChallengeState,
  RunModifier
} from "./types";

interface CreateRunChallengeOptions {
  level: LevelConfig;
  difficultyId: DifficultyId;
  seed: number;
  runIndex: number;
}

export const RUN_MODIFIERS: RunModifier[] = [
  {
    id: "sunny-day",
    name: "阳光日",
    shortLabel: "阳光来得快",
    announcement: "阳光日：阳光来得快",
    adjustments: { baseSunIntervalMultiplier: 0.78 }
  },
  {
    id: "slow-start",
    name: "慢慢来",
    shortLabel: "第一波晚一点",
    announcement: "慢慢来：第一波晚一点",
    adjustments: { firstWaveDelayMs: 3500 }
  },
  {
    id: "little-hero",
    name: "小勇士",
    shortLabel: "敌人慢一点",
    announcement: "小勇士：敌人慢一点，小车少一点",
    adjustments: { zombieSpeedMultiplier: 0.88, mowerLaneLimit: 1 }
  },
  {
    id: "busy-garden",
    name: "花园忙",
    shortLabel: "向日葵准备快",
    announcement: "花园忙：向日葵准备快",
    adjustments: { startingSunDelta: -25, plantCooldownMultiplier: { sunflower: 0.72 } }
  }
];

const OBJECTIVES: ChallengeObjective[] = [
  { id: "plant-sunflowers", kind: "plant-count", target: 3, label: "种 3 朵向日葵", plantId: "sunflower" },
  { id: "defeat-zombies", kind: "defeat-count", target: 5, label: "打倒 5 个僵尸" },
  { id: "protect-mowers", kind: "mower-protection", target: 1, label: "保护 1 台小车" },
  { id: "save-sun", kind: "sun-reserve", target: 100, label: "留下 100 阳光" },
  { id: "slow-hit-count", kind: "slow-hit-count", target: 2, label: "冻住 2 次敌人", plantId: "snowpea" }
];

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pickByHash<T>(items: readonly T[], key: string): T {
  return items[hashString(key) % items.length];
}

function isObjectiveAvailable(objective: ChallengeObjective, level: LevelConfig): boolean {
  if (objective.plantId && !level.allowedPlants.includes(objective.plantId as PlantId)) return false;
  return true;
}

export function createRunChallenge(options: CreateRunChallengeOptions): RunChallengeState {
  const key = `${options.seed}:${options.runIndex}:${options.level.id}:${options.difficultyId}`;
  const objectives = OBJECTIVES.filter((objective) => isObjectiveAvailable(objective, options.level));
  return {
    objective: pickByHash(objectives, `${key}:objective`),
    modifier: pickByHash(RUN_MODIFIERS, `${key}:modifier`),
    current: 0,
    completed: false
  };
}

export function getChallengeHudLabel(challenge: RunChallengeState): string {
  return `目标：${challenge.objective.label}`;
}

export function getModifierAnnouncement(modifier: RunModifier): string {
  return modifier.announcement;
}

export function getChallengeNudgeText(challenge: RunChallengeState): string {
  const remaining = Math.max(0, challenge.objective.target - challenge.current);
  if (challenge.completed) return "小任务完成啦";
  if (challenge.objective.kind === "plant-count") return `还差 ${remaining} 朵向日葵`;
  if (challenge.objective.kind === "defeat-count") return `还差 ${remaining} 个僵尸`;
  if (challenge.objective.kind === "slow-hit-count") return `还差 ${remaining} 次冰冻`;
  if (challenge.objective.kind === "mower-protection") return "保护小车，守住草坪";
  return `留下 ${challenge.objective.target} 阳光`;
}

export function getChallengeResultLabel(challenge: RunChallengeState): string {
  if (challenge.completed) return "小任务完成";
  return `差一点 ${Math.min(challenge.current, challenge.objective.target)}/${challenge.objective.target}`;
}
```

- [ ] **Step 5: Run the new test and verify it passes**

Run:

```bash
npm test -- src/game/runChallenges.test.ts
```

Expected: PASS for all tests in `runChallenges.test.ts`.

- [ ] **Step 6: Commit Task 1**

Run:

```bash
git add src/game/types.ts src/game/runChallenges.ts src/game/runChallenges.test.ts
git commit -m "feat: add run challenge selection"
```

## Task 2: Apply Run Modifiers In Rules

**Files:**
- Modify: `src/game/rules.ts`
- Modify: `src/game/rules.test.ts`
- Modify: `src/game/types.ts`

- [ ] **Step 1: Write failing rule tests for modifier effects**

Append these tests inside `describe("game rules", () => { ... })` in `src/game/rules.test.ts`:

```ts
  it("applies run modifiers to starting sun and base sun cadence", () => {
    const state = createInitialState(LEVEL_ONE, DIFFICULTY.normal, {
      objective: { id: "save-sun", kind: "sun-reserve", target: 100, label: "留下 100 阳光" },
      modifier: {
        id: "sunny-day",
        name: "阳光日",
        shortLabel: "阳光来得快",
        announcement: "阳光日：阳光来得快",
        adjustments: { startingSunDelta: -25, baseSunIntervalMultiplier: 0.5 }
      },
      current: 0,
      completed: false
    });

    expect(state.sun).toBe(225);
    expect(state.baseSunIntervalMs).toBe(4500);
    expect(state.nextBaseSunAtMs).toBe(4500);
  });

  it("delays only the first wave when a run modifier asks for it", () => {
    const challenge = {
      objective: { id: "defeat-zombies", kind: "defeat-count", target: 5, label: "打倒 5 个僵尸" },
      modifier: {
        id: "slow-start",
        name: "慢慢来",
        shortLabel: "第一波晚一点",
        announcement: "慢慢来：第一波晚一点",
        adjustments: { firstWaveDelayMs: 3500 }
      },
      current: 0,
      completed: false
    } as const;
    const tooEarly = { ...createInitialState(LEVEL_ONE, DIFFICULTY.normal, challenge), nowMs: 9000 };
    const delayed = spawnDueZombies(tooEarly, LEVEL_ONE, ZOMBIES);
    const ready = spawnDueZombies({ ...tooEarly, nowMs: 12000 }, LEVEL_ONE, ZOMBIES);

    expect(delayed.zombies).toHaveLength(0);
    expect(ready.zombies).toHaveLength(1);
  });

  it("applies plant cooldown and zombie speed modifier adjustments", () => {
    const challenge = {
      objective: { id: "plant-sunflowers", kind: "plant-count", target: 3, label: "种 3 朵向日葵", plantId: "sunflower" },
      modifier: {
        id: "busy-garden",
        name: "花园忙",
        shortLabel: "向日葵准备快",
        announcement: "花园忙：向日葵准备快",
        adjustments: { plantCooldownMultiplier: { sunflower: 0.5 }, zombieSpeedMultiplier: 0.5 }
      },
      current: 0,
      completed: false
    } as const;
    const planted = plantAt(selectPlant(createInitialState(LEVEL_ONE, DIFFICULTY.normal, challenge), "sunflower"), PLANTS, 0, 0);
    expect(planted.cooldownReadyAt.sunflower).toBe(PLANTS.sunflower.cooldownMs * 0.5);

    const state = {
      ...createInitialState(LEVEL_ONE, DIFFICULTY.normal, challenge),
      zombies: [{ id: "z1", zombieId: "basic" as const, lane: 0 as const, x: 8, hp: 70, slowedUntilMs: 0 }]
    };
    const next = advanceCombat(state, PLANTS, ZOMBIES, 1000);
    expect(next.zombies[0].x).toBeGreaterThan(7.9);
  });
```

- [ ] **Step 2: Run the rule tests and verify they fail**

Run:

```bash
npm test -- src/game/rules.test.ts
```

Expected: FAIL because `createInitialState` does not accept a run challenge and `baseSunIntervalMs` is not on `GameState`.

- [ ] **Step 3: Extend state and rule helpers**

In `src/game/types.ts`, add `baseSunIntervalMs: number;` to `GameState`.

In `src/game/rules.ts`, update `createInitialState` signature and body:

```ts
export function createInitialState(
  level: LevelConfig,
  difficulty: DifficultyConfig = NORMAL_DIFFICULTY,
  runChallenge?: RunChallengeState
): GameState {
  const baseSunIntervalMs = Math.max(
    1000,
    Math.round(BASE_SUN_INTERVAL_MS * (runChallenge?.modifier.adjustments.baseSunIntervalMultiplier ?? 1))
  );
  const mowerLaneLimit = runChallenge?.modifier.adjustments.mowerLaneLimit;
  const mowerLanes = mowerLaneLimit ? level.mowerLanes.slice(0, mowerLaneLimit) : [...level.mowerLanes];
  return {
    status: "menu",
    nowMs: 0,
    sun: Math.max(0, applySunMultiplier(level.startingSun, difficulty) + (runChallenge?.modifier.adjustments.startingSunDelta ?? 0)),
    selectedPlantId: null,
    plants: [],
    zombies: [],
    projectiles: [],
    events: [],
    spawnedWaveIndexes: [],
    cooldownReadyAt: {
      sunflower: 0,
      peashooter: 0,
      wallnut: 0,
      snowpea: 0,
      potatomine: 0
    },
    heroLane: 2,
    nextHeroShotAtMs: 0,
    nextBaseSunAtMs: baseSunIntervalMs,
    baseSunIntervalMs,
    mowerLanes,
    runChallenge
  };
}
```

Import `RunChallengeState` from `./types`. Keep the current default behavior unchanged when `runChallenge` is omitted.

- [ ] **Step 4: Apply modifier adjustments in planting, wave spawning, and combat**

In `plantAt`, replace the cooldown assignment with:

```ts
const cooldownMultiplier = state.runChallenge?.modifier.adjustments.plantCooldownMultiplier?.[plantingResult.plantId] ?? 1;
const cooldownMs = Math.max(0, Math.round(plantConfig.cooldownMs * cooldownMultiplier));
```

Then set:

```ts
[plantingResult.plantId]: state.nowMs + cooldownMs
```

In `spawnDueZombies`, use an adjusted wave time:

```ts
const firstWaveDelayMs = state.runChallenge?.modifier.adjustments.firstWaveDelayMs ?? 0;
const newZombies = level.waves
  .map((wave, index) => ({ wave, index, spawnAtMs: wave.atMs + (index === 0 ? firstWaveDelayMs : 0) }))
  .filter(({ index, spawnAtMs }) => spawnAtMs <= state.nowMs && !state.spawnedWaveIndexes.includes(index));
```

In `advanceCombat`, replace the base sun reschedule:

```ts
nextBaseSunAtMs = state.nowMs + state.baseSunIntervalMs;
```

And multiply zombie movement by the run modifier:

```ts
const runSpeedMultiplier = state.runChallenge?.modifier.adjustments.zombieSpeedMultiplier ?? 1;
```

Then use:

```ts
x: zombie.x - config.speedCellsPerSecond * difficulty.zombieSpeedMultiplier * runSpeedMultiplier * slowMultiplier * deltaSeconds
```

- [ ] **Step 5: Run the rule tests and verify they pass**

Run:

```bash
npm test -- src/game/rules.test.ts src/game/runChallenges.test.ts
```

Expected: PASS for the rule and run challenge test files.

- [ ] **Step 6: Commit Task 2**

Run:

```bash
git add src/game/types.ts src/game/rules.ts src/game/rules.test.ts
git commit -m "feat: apply run challenge modifiers"
```

## Task 3: Track Objective Progress In Rules

**Files:**
- Modify: `src/game/runChallenges.ts`
- Modify: `src/game/runChallenges.test.ts`
- Modify: `src/game/rules.ts`
- Modify: `src/game/rules.test.ts`

- [ ] **Step 1: Add failing progress helper tests**

Extend the existing import from `./runChallenges` in `src/game/runChallenges.test.ts` so it also imports `syncChallengeProgressFromState` and `updateChallengeForEvent`, then append:

```ts
describe("run challenge progress", () => {
  it("tracks plant, defeat, and slow-hit event progress", () => {
    const plantChallenge = createRunChallenge({ level: LEVELS[2], difficultyId: "normal", seed: 11, runIndex: 1 });
    const planting = {
      ...plantChallenge,
      objective: { id: "plant-sunflowers", kind: "plant-count", target: 3, label: "种 3 朵向日葵", plantId: "sunflower" },
      current: 0,
      completed: false
    } as const;

    expect(updateChallengeForEvent(planting, { type: "plant", plantId: "sunflower" })!.current).toBe(1);
    expect(updateChallengeForEvent(planting, { type: "plant", plantId: "wallnut" })!.current).toBe(0);

    const defeat = {
      ...plantChallenge,
      objective: { id: "defeat-zombies", kind: "defeat-count", target: 2, label: "打倒 2 个僵尸" },
      current: 1,
      completed: false
    } as const;
    expect(updateChallengeForEvent(defeat, { type: "defeat" })!.completed).toBe(true);

    const slow = {
      ...plantChallenge,
      objective: { id: "slow-hit-count", kind: "slow-hit-count", target: 2, label: "冻住 2 次敌人", plantId: "snowpea" },
      current: 1,
      completed: false
    } as const;
    expect(updateChallengeForEvent(slow, { type: "slow-hit" })!.completed).toBe(true);
  });

  it("syncs mower and sun reserve progress from state", () => {
    const challenge = createRunChallenge({ level: LEVELS[0], difficultyId: "normal", seed: 5, runIndex: 1 });
    const mower = {
      ...challenge,
      objective: { id: "protect-mowers", kind: "mower-protection", target: 1, label: "保护 1 台小车" },
      current: 0,
      completed: false
    } as const;
    const syncedMower = syncChallengeProgressFromState(mower, { sun: 75, mowerLanes: [2] });
    expect(syncedMower).toMatchObject({ current: 1, completed: true });

    const sun = {
      ...challenge,
      objective: { id: "save-sun", kind: "sun-reserve", target: 100, label: "留下 100 阳光" },
      current: 0,
      completed: false
    } as const;
    const syncedSun = syncChallengeProgressFromState(sun, { sun: 125, mowerLanes: [] });
    expect(syncedSun).toMatchObject({ current: 125, completed: true });
  });
});
```

- [ ] **Step 2: Run the helper tests and verify they fail**

Run:

```bash
npm test -- src/game/runChallenges.test.ts
```

Expected: FAIL because `updateChallengeForEvent` and `syncChallengeProgressFromState` are missing.

- [ ] **Step 3: Implement progress helpers**

In `src/game/runChallenges.ts`, add:

```ts
type ChallengeProgressEvent =
  | { type: "plant"; plantId: PlantId }
  | { type: "defeat" }
  | { type: "slow-hit" };

function completeByTarget(challenge: RunChallengeState, current: number): RunChallengeState {
  const nextCurrent = Math.max(0, current);
  return {
    ...challenge,
    current: nextCurrent,
    completed: nextCurrent >= challenge.objective.target
  };
}

export function updateChallengeForEvent(
  challenge: RunChallengeState | undefined,
  event: ChallengeProgressEvent
): RunChallengeState | undefined {
  if (!challenge) return undefined;
  if (event.type === "plant") {
    if (challenge.objective.kind !== "plant-count" || challenge.objective.plantId !== event.plantId) return challenge;
    return completeByTarget(challenge, challenge.current + 1);
  }
  if (event.type === "defeat") {
    if (challenge.objective.kind !== "defeat-count") return challenge;
    return completeByTarget(challenge, challenge.current + 1);
  }
  if (challenge.objective.kind !== "slow-hit-count") return challenge;
  return completeByTarget(challenge, challenge.current + 1);
}

export function syncChallengeProgressFromState(
  challenge: RunChallengeState | undefined,
  state: Pick<GameState, "sun" | "mowerLanes">
): RunChallengeState | undefined {
  if (!challenge) return undefined;
  if (challenge.objective.kind === "mower-protection") {
    return completeByTarget(challenge, state.mowerLanes.length);
  }
  if (challenge.objective.kind === "sun-reserve") {
    return completeByTarget(challenge, state.sun);
  }
  return challenge;
}
```

Import `GameState` in the type-only import list.

- [ ] **Step 4: Add failing integration tests in rules**

Append to `src/game/rules.test.ts`:

```ts
  it("tracks planting and slow-hit objectives through rules", () => {
    const plantingChallenge = {
      objective: { id: "plant-sunflowers", kind: "plant-count", target: 3, label: "种 3 朵向日葵", plantId: "sunflower" },
      modifier: { id: "sunny-day", name: "阳光日", shortLabel: "阳光来得快", announcement: "阳光日：阳光来得快", adjustments: {} },
      current: 0,
      completed: false
    } as const;
    const planted = plantAt(selectPlant(createInitialState(LEVEL_ONE, DIFFICULTY.normal, plantingChallenge), "sunflower"), PLANTS, 0, 0);
    expect(planted.runChallenge).toMatchObject({ current: 1, completed: false });

    const slowChallenge = {
      objective: { id: "slow-hit-count", kind: "slow-hit-count", target: 1, label: "冻住 1 次敌人", plantId: "snowpea" },
      modifier: { id: "sunny-day", name: "阳光日", shortLabel: "阳光来得快", announcement: "阳光日：阳光来得快", adjustments: {} },
      current: 0,
      completed: false
    } as const;
    const afterHit = advanceCombat(
      {
        ...createInitialState(LEVEL_ONE, DIFFICULTY.normal, slowChallenge),
        nowMs: 2400,
        zombies: [{ id: "z1", zombieId: "basic" as const, lane: 0 as const, x: 2.1, hp: 70, slowedUntilMs: 0 }],
        projectiles: [{ id: "p1", lane: 0 as const, x: 2.05, damage: 20, slows: true }]
      },
      PLANTS,
      ZOMBIES,
      16
    );
    expect(afterHit.runChallenge).toMatchObject({ current: 1, completed: true });
  });

  it("tracks defeat, mower, and sun reserve objectives through rules", () => {
    const defeatChallenge = {
      objective: { id: "defeat-zombies", kind: "defeat-count", target: 1, label: "打倒 1 个僵尸" },
      modifier: { id: "sunny-day", name: "阳光日", shortLabel: "阳光来得快", announcement: "阳光日：阳光来得快", adjustments: {} },
      current: 0,
      completed: false
    } as const;
    const afterDefeat = advanceCombat(
      {
        ...createInitialState(LEVEL_ONE, DIFFICULTY.normal, defeatChallenge),
        nowMs: 2400,
        zombies: [{ id: "z1", zombieId: "basic" as const, lane: 0 as const, x: 2.1, hp: 10, slowedUntilMs: 0 }],
        projectiles: [{ id: "p1", lane: 0 as const, x: 2.05, damage: 20, slows: false }]
      },
      PLANTS,
      ZOMBIES,
      16
    );
    expect(afterDefeat.runChallenge).toMatchObject({ current: 1, completed: true });

    const mowerChallenge = {
      objective: { id: "protect-mowers", kind: "mower-protection", target: 1, label: "保护 1 台小车" },
      modifier: { id: "sunny-day", name: "阳光日", shortLabel: "阳光来得快", announcement: "阳光日：阳光来得快", adjustments: {} },
      current: 0,
      completed: false
    } as const;
    expect(createInitialState(LEVEL_ONE, DIFFICULTY.normal, mowerChallenge).runChallenge).toMatchObject({
      current: LEVEL_ONE.mowerLanes.length,
      completed: true
    });

    const sunChallenge = {
      objective: { id: "save-sun", kind: "sun-reserve", target: 100, label: "留下 100 阳光" },
      modifier: { id: "sunny-day", name: "阳光日", shortLabel: "阳光来得快", announcement: "阳光日：阳光来得快", adjustments: {} },
      current: 0,
      completed: false
    } as const;
    expect(createInitialState(LEVEL_ONE, DIFFICULTY.normal, sunChallenge).runChallenge).toMatchObject({
      current: 250,
      completed: true
    });
  });
```

- [ ] **Step 5: Wire progress helpers into rules**

In `src/game/rules.ts`, import:

```ts
import { syncChallengeProgressFromState, updateChallengeForEvent } from "./runChallenges";
```

In `createInitialState`, assign:

```ts
const initialRunChallenge = syncChallengeProgressFromState(runChallenge, { sun, mowerLanes });
```

Use a local `sun` and `mowerLanes` before returning, then set `runChallenge: initialRunChallenge`.

In `plantAt`, build `nextState` first, then return:

```ts
const withPlantProgress = {
  ...nextState,
  runChallenge: updateChallengeForEvent(nextState.runChallenge, { type: "plant", plantId: plantingResult.plantId })
};
return {
  ...withPlantProgress,
  runChallenge: syncChallengeProgressFromState(withPlantProgress.runChallenge, withPlantProgress)
};
```

In `advanceCombat`, create a local:

```ts
let runChallenge = state.runChallenge;
```

Whenever a `zombie-defeated` event is pushed, add:

```ts
runChallenge = updateChallengeForEvent(runChallenge, { type: "defeat" });
```

Whenever a projectile hit has `projectile.slows`, add:

```ts
runChallenge = updateChallengeForEvent(runChallenge, { type: "slow-hit" });
```

Before returning from `advanceCombat`, build `nextState` and return it after syncing:

```ts
const nextState = {
  ...state,
  sun,
  nextHeroShotAtMs,
  nextBaseSunAtMs,
  plants: plants.filter((plant) => plant.hp > 0 && !spentPlantIds.has(plant.id)),
  zombies,
  projectiles: remainingProjectiles,
  events,
  mowerLanes,
  runChallenge
};
return {
  ...nextState,
  runChallenge: syncChallengeProgressFromState(nextState.runChallenge, nextState)
};
```

- [ ] **Step 6: Run progress tests and verify they pass**

Run:

```bash
npm test -- src/game/runChallenges.test.ts src/game/rules.test.ts
```

Expected: PASS for the run challenge and rules tests.

- [ ] **Step 7: Commit Task 3**

Run:

```bash
git add src/game/runChallenges.ts src/game/runChallenges.test.ts src/game/rules.ts src/game/rules.test.ts
git commit -m "feat: track run challenge progress"
```

## Task 4: Wire Challenges Into GameScene

**Files:**
- Modify: `src/game/GameScene.ts`

- [ ] **Step 1: Add scene-level run setup state**

In `src/game/GameScene.ts`, import:

```ts
import { createRunChallenge, getModifierAnnouncement } from "./runChallenges";
```

Add fields to `GameScene`:

```ts
private readonly sessionSeed = Math.floor(Math.random() * 1_000_000_000);
private runIndex = 0;
private modifierAnnouncement: string | null = null;
private modifierAnnouncementUntilMs = 0;
```

- [ ] **Step 2: Add scene getters for DOM rendering**

Add public methods near existing getters:

```ts
getCurrentRunChallenge() {
  return this.state.runChallenge ?? null;
}

getCurrentModifierAnnouncement(): string | null {
  if (!this.modifierAnnouncement) return null;
  if (this.state.nowMs > this.modifierAnnouncementUntilMs) return null;
  return this.modifierAnnouncement;
}
```

- [ ] **Step 3: Create a fresh challenge on each level start**

Replace `startCurrentLevel` with:

```ts
private startCurrentLevel(): void {
  this.runIndex += 1;
  const runChallenge = createRunChallenge({
    level: this.currentLevel,
    difficultyId: this.currentDifficultyId,
    seed: this.sessionSeed,
    runIndex: this.runIndex
  });
  this.modifierAnnouncement = getModifierAnnouncement(runChallenge.modifier);
  this.modifierAnnouncementUntilMs = 4200;
  this.state = { ...createInitialState(this.currentLevel, this.currentDifficulty, runChallenge), status: "playing" };
  this.lastTickMs = 0;
}
```

This automatically covers initial start, restart, next level, and difficulty changes because they all call `startCurrentLevel`.

- [ ] **Step 4: Run build as the GameScene safety check**

Run:

```bash
npm run build
```

Expected: PASS with no TypeScript errors.

- [ ] **Step 5: Commit Task 4**

Run:

```bash
git add src/game/GameScene.ts
git commit -m "feat: start run challenges per level"
```

## Task 5: Render Objective HUD, Modifier Feedback, And Terminal Result

**Files:**
- Modify: `src/ui/domOverlay.ts`
- Modify: `src/ui/domOverlay.test.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Write failing DOM overlay tests**

Append to `src/ui/domOverlay.test.ts`:

```ts
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
        objective: { id: "plant-sunflowers", kind: "plant-count", target: 3, label: "种 3 朵向日葵", plantId: "sunflower" },
        modifier: { id: "sunny-day", name: "阳光日", shortLabel: "阳光来得快", announcement: "阳光日：阳光来得快", adjustments: {} },
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
        modifier: { id: "slow-start", name: "慢慢来", shortLabel: "第一波晚一点", announcement: "慢慢来：第一波晚一点", adjustments: {} },
        current: 5,
        completed: true
      }
    });

    expect(html).toContain("小任务完成");
    expect(html).toContain("objective-result");
  });
```

- [ ] **Step 2: Run DOM tests and verify they fail**

Run:

```bash
npm test -- src/ui/domOverlay.test.ts
```

Expected: FAIL because the overlay state does not support challenge fields.

- [ ] **Step 3: Add overlay state fields and render labels**

In `src/ui/domOverlay.ts`, import:

```ts
import {
  getChallengeHudLabel,
  getChallengeNudgeText,
  getChallengeResultLabel
} from "../game/runChallenges";
import type { RunChallengeState } from "../game/types";
```

Add to `OverlayRenderState`:

```ts
compactWaveText?: string;
runChallenge?: RunChallengeState | null;
modifierAnnouncement?: string | null;
```

In `getTerminalSummaryMarkup`, append objective result when terminal:

```ts
const objectiveLabel = state.runChallenge ? getChallengeResultLabel(state.runChallenge) : "";
const objectiveMarkup = objectiveLabel ? `<span class="objective-result">${objectiveLabel}</span>` : "";
```

Then include `${objectiveMarkup}` before closing `.modal-summary`.

In `createDomOverlayMarkup`, replace the wave chip with:

```ts
<div class="chip wave-chip" data-short-label="${state.compactWaveText ?? state.waveText}">${waveLabel}</div>
```

Add the objective chip after wave chip:

```ts
${state.runChallenge ? `<div class="chip objective-chip">${getChallengeHudLabel(state.runChallenge)}</div>` : ""}
```

Update tutorial/feedback text selection:

```ts
const objectiveNudge =
  state.runChallenge && state.status === "playing" && !state.modifierAnnouncement
    ? getChallengeNudgeText(state.runChallenge)
    : "";
const tutorialText = (state.modifierAnnouncement ?? objectiveNudge) || getTutorialText(state);
```

- [ ] **Step 4: Pass challenge state from `createDomOverlay`**

In the `render` function inside `createDomOverlay`, add:

```ts
const compactWaveText = getCompactWaveText(state, level);
```

Create helper:

```ts
function getCompactWaveText(state: GameState, level: LevelConfig): string {
  const spawned = state.spawnedWaveIndexes.length;
  return `第 ${Math.min(spawned + 1, level.waves.length)}/${level.waves.length} 波`;
}
```

Pass these fields into `createDomOverlayMarkup`:

```ts
compactWaveText,
runChallenge: scene.getCurrentRunChallenge(),
modifierAnnouncement: scene.getCurrentModifierAnnouncement()
```

Update the `GameScene` mock objects in `src/ui/domOverlay.test.ts` to include:

```ts
getCurrentRunChallenge: vi.fn(() => null),
getCurrentModifierAnnouncement: vi.fn(() => null),
```

- [ ] **Step 5: Update CSS for the new chip**

In `src/styles.css`, replace the desktop top grid:

```css
.hud-top {
  display: grid;
  grid-template-columns: 180px minmax(170px, 1fr) minmax(190px, 1.05fr) 132px 64px 92px 104px;
  gap: 10px;
}
```

Replace `.hud-top .chip:nth-child(2)` with:

```css
.wave-chip,
.objective-chip {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

In the coarse/mobile media block, use:

```css
.hud-top {
  grid-template-columns: minmax(94px, 1fr) minmax(96px, 1fr) minmax(82px, 0.9fr);
  grid-template-rows: repeat(4, 46px);
  gap: 6px;
  width: auto;
}

.hud {
  grid-template-rows: 196px minmax(0, 1fr) auto;
}

.wave-chip {
  grid-column: 2 / 4;
}

.objective-chip {
  grid-column: 1 / 4;
  grid-row: 2;
}

.hud-top .difficulty-toggle {
  grid-column: 1;
  grid-row: 3;
}

.hud-top [data-action="pause"] {
  grid-column: 2;
  grid-row: 3;
}

.hud-top .sound-toggle {
  grid-column: 3;
  grid-row: 3;
}

.hud-top .motion-toggle {
  grid-column: 1 / 4;
  grid-row: 4;
}
```

In the iPad landscape media block, use:

```css
.hud-top {
  grid-template-columns: 82px minmax(92px, 0.85fr) minmax(138px, 1.25fr) 104px 52px 50px 54px;
  grid-template-rows: 38px;
  gap: 5px;
}

.wave-chip,
.objective-chip,
.hud-top .difficulty-toggle,
.hud-top [data-action="pause"],
.hud-top .sound-toggle,
.hud-top .motion-toggle {
  grid-column: auto;
  grid-row: auto;
}

.wave-chip {
  font-size: 0;
}

.wave-chip::before {
  content: attr(data-short-label);
  font-size: 13px;
  line-height: 1;
}

.objective-chip {
  padding: 0 6px;
  font-size: 12px;
}
```

Add terminal objective styling:

```css
.modal-summary .objective-result {
  grid-column: 1 / -1;
  background: #ffd34f;
}
```

- [ ] **Step 6: Run DOM tests and build**

Run:

```bash
npm test -- src/ui/domOverlay.test.ts
npm run build
```

Expected: PASS for DOM tests and build.

- [ ] **Step 7: Commit Task 5**

Run:

```bash
git add src/ui/domOverlay.ts src/ui/domOverlay.test.ts src/styles.css
git commit -m "feat: show run challenge hud"
```

## Task 6: Full Verification And Browser Check

**Files:**
- No planned source edits unless verification finds a defect.

- [ ] **Step 1: Run full automated tests**

Run:

```bash
npm test
```

Expected: PASS for all Vitest suites.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: PASS with no TypeScript errors.

- [ ] **Step 3: Start local dev server**

Run:

```bash
npm run dev
```

Expected: Vite prints a local URL, usually `http://127.0.0.1:5173/`.

- [ ] **Step 4: Browser verify iPad landscape HUD**

Open the dev server at an iPad landscape viewport, preferably `1024x768` or `1180x820`. Verify:

- The objective chip appears in the top HUD.
- The wave label uses compact text if needed.
- The tutorial strip shows the modifier announcement near level start.
- The board center remains unobstructed.
- Plant cards remain tappable.
- Terminal modal shows `小任务完成` or `差一点 x/y`.
- The browser console has no errors.

- [ ] **Step 5: Commit any verification fixes**

If the browser check requires CSS or markup fixes, commit only those fixes:

```bash
git add src/ui/domOverlay.ts src/ui/domOverlay.test.ts src/styles.css
git commit -m "fix: polish challenge hud layout"
```

Skip this commit if no fixes were needed.

## Self-Review

Spec coverage:

- Per-run objective: Task 1 creates objectives, Task 3 tracks progress, Task 5 renders status.
- Gentle modifier: Task 1 creates modifiers, Task 2 applies effects, Task 5 announces the modifier.
- iPad-first UI: Task 5 updates responsive HUD and terminal layout, Task 6 verifies in browser.
- Pure offline single-player: no task adds network, accounts, persistence, menus, or external services.
- Testing and build: every task includes targeted tests, and Task 6 runs full verification.

Placeholder scan:

- The plan contains no unfinished-marker text or open-ended "add tests" instructions.
- Every code-changing step has concrete snippets, file paths, and commands.

Type consistency:

- `RunChallengeState`, `RunModifier`, `ChallengeObjective`, and `GameState.runChallenge` are introduced in Task 1 and reused consistently in later tasks.
- `createInitialState(level, difficulty, runChallenge)` is introduced in Task 2 and used by GameScene in Task 4.
- DOM state uses `runChallenge`, `compactWaveText`, and `modifierAnnouncement` consistently in Task 5.
