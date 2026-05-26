# Playable Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first playable Phaser + Vite + TypeScript vertical slice for 《玩具桌面植物小队》: one level that can start, place plants, move 豌豆队长, spawn zombies, shoot, pause, win, and fail.

**Architecture:** Use Phaser for the game world and a small DOM HUD layer for menus, cards, settings, and results. Keep game rules in pure TypeScript modules so resource costs, cooldowns, grid occupancy, waves, and win/fail conditions can be tested without opening a browser. Keep art temporary and data-driven so the current UI prototype can guide layout while gameplay logic stays independent.

**Tech Stack:** Vite, TypeScript, Phaser, Vitest, HTML, CSS.

---

## Scope

This plan builds a playable first level only. It creates the project foundation that later plans can extend to all three levels, richer art, saved settings, Mac packaging, and additional enemy abilities.

## File Structure

- Create: `package.json`
  - Defines Vite, Phaser, TypeScript, Vitest scripts and dependencies.
- Create: `tsconfig.json`
  - Browser TypeScript compiler settings.
- Create: `index.html`
  - Mounts the game app and loads `src/main.ts`.
- Create: `src/main.ts`
  - Boots Phaser and wires DOM overlay callbacks.
- Create: `src/styles.css`
  - Page shell, DOM HUD, card bar, modal styling based on the prototype.
- Create: `src/game/types.ts`
  - Shared type definitions for plants, zombies, levels, runtime entities, and game status.
- Create: `src/game/config.ts`
  - Data for plants, zombies, difficulty, and the first playable level.
- Create: `src/game/rules.ts`
  - Pure functions for planting, spending resources, cooldowns, damage, waves, and status transitions.
- Create: `src/game/rules.test.ts`
  - Vitest coverage for the rule functions.
- Create: `src/game/GameScene.ts`
  - Phaser scene for board drawing, input, entity rendering, update loop, collisions, and events.
- Create: `src/ui/domOverlay.ts`
  - Creates and updates DOM menus, HUD, settings, pause, victory, and failure overlays.
- Create: `src/ui/domOverlay.test.ts`
  - Lightweight DOM tests for overlay state rendering.

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.ts`
- Create: `src/styles.css`

- [ ] **Step 1: Create `package.json`**

Add:

```json
{
  "name": "toy-tabletop-plant-squad",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview --host 127.0.0.1",
    "test": "vitest run"
  },
  "dependencies": {
    "phaser": "^3.90.0"
  },
  "devDependencies": {
    "@vitejs/plugin-legacy": "^6.0.0",
    "typescript": "^5.8.3",
    "vite": "^6.3.5",
    "vitest": "^3.1.4"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

Add:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `index.html`**

Add:

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>玩具桌面植物小队</title>
  </head>
  <body>
    <div id="app">
      <div id="game-root"></div>
      <div id="ui-root"></div>
    </div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 4: Create initial `src/styles.css`**

Add:

```css
:root {
  color-scheme: light;
  --ink: #263238;
  --paper: #fff8df;
  --wood: #eebf7a;
  --wood-line: #d99d55;
  --star: #ffd34f;
  --danger: #f45f4f;
}

* {
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
}

body {
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(217, 157, 85, 0.18) 1px, transparent 1px) 0 0 / 42px 100%,
    var(--wood);
  color: var(--ink);
  font-family:
    "PingFang SC",
    "Hiragino Sans GB",
    "Microsoft YaHei",
    system-ui,
    sans-serif;
}

#game-root {
  position: fixed;
  inset: 0;
}

#ui-root {
  position: fixed;
  inset: 0;
  pointer-events: none;
}

.hud {
  position: absolute;
  inset: 20px;
  display: grid;
  grid-template-rows: 64px 1fr 118px;
  gap: 12px;
  pointer-events: none;
}

.hud-top,
.plant-tray {
  pointer-events: auto;
}

.hud-top {
  display: grid;
  grid-template-columns: 220px 1fr 64px;
  gap: 12px;
}

.chip,
.plant-card,
.modal {
  border: 3px solid #5c4330;
  border-radius: 8px;
  background: var(--paper);
  box-shadow: 0 5px 0 rgba(92, 67, 48, 0.18);
}

.chip {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 56px;
  font-size: 22px;
  font-weight: 900;
}

.plant-tray {
  display: grid;
  grid-template-columns: repeat(5, minmax(120px, 1fr));
  gap: 10px;
}

.plant-card {
  display: grid;
  place-items: center;
  padding: 8px;
  font-weight: 900;
}

.plant-card[disabled] {
  opacity: 0.5;
}

.modal-layer {
  position: fixed;
  inset: 0;
  display: none;
  place-items: center;
  background: rgba(38, 50, 56, 0.32);
  pointer-events: auto;
}

.modal-layer.is-visible {
  display: grid;
}

.modal {
  width: min(520px, 92vw);
  padding: 28px;
  text-align: center;
}
```

- [ ] **Step 5: Create initial `src/main.ts`**

Add:

```ts
import Phaser from "phaser";
import "./styles.css";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-root",
  backgroundColor: "#eebf7a",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720
  },
  scene: []
};

new Phaser.Game(config);
```

- [ ] **Step 6: Install dependencies**

Run:

```bash
npm install
```

Expected: `package-lock.json` is created and dependencies install successfully.

- [ ] **Step 7: Verify scaffold build**

Run:

```bash
npm run build
```

Expected: TypeScript and Vite finish with exit code 0.

- [ ] **Step 8: Commit scaffold**

Run:

```bash
git add package.json package-lock.json tsconfig.json index.html src/main.ts src/styles.css
git commit -m "Scaffold Phaser Vite game"
```

---

### Task 2: Pure Game Types And Rules

**Files:**
- Create: `src/game/types.ts`
- Create: `src/game/config.ts`
- Create: `src/game/rules.ts`
- Create: `src/game/rules.test.ts`

- [ ] **Step 1: Create `src/game/types.ts`**

Add:

```ts
export type LaneIndex = 0 | 1 | 2 | 3 | 4;
export type ColumnIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type PlantId = "sunflower" | "peashooter" | "wallnut" | "snowpea" | "potatomine";
export type ZombieId = "basic" | "cone" | "bucket";
export type DifficultyId = "easy" | "normal";
export type GameStatus = "menu" | "playing" | "paused" | "victory" | "failure";

export interface PlantConfig {
  id: PlantId;
  name: string;
  cost: number;
  cooldownMs: number;
  maxHp: number;
  damage: number;
  fireIntervalMs: number;
  rangeColumns: number;
  producesSun: boolean;
  slows: boolean;
  blocks: boolean;
  armsAfterMs: number;
}

export interface ZombieConfig {
  id: ZombieId;
  name: string;
  maxHp: number;
  speedCellsPerSecond: number;
  damagePerSecond: number;
}

export interface PlantEntity {
  id: string;
  plantId: PlantId;
  lane: LaneIndex;
  column: ColumnIndex;
  hp: number;
  plantedAtMs: number;
  nextFireAtMs: number;
  nextSunAtMs: number;
}

export interface ZombieEntity {
  id: string;
  zombieId: ZombieId;
  lane: LaneIndex;
  x: number;
  hp: number;
  slowedUntilMs: number;
}

export interface ProjectileEntity {
  id: string;
  lane: LaneIndex;
  x: number;
  damage: number;
  slows: boolean;
}

export interface WaveEntry {
  atMs: number;
  lane: LaneIndex;
  zombieId: ZombieId;
}

export interface LevelConfig {
  id: string;
  name: string;
  startingSun: number;
  durationMs: number;
  allowedPlants: PlantId[];
  waves: WaveEntry[];
}

export interface GameState {
  status: GameStatus;
  nowMs: number;
  sun: number;
  selectedPlantId: PlantId | null;
  plants: PlantEntity[];
  zombies: ZombieEntity[];
  projectiles: ProjectileEntity[];
  spawnedWaveIndexes: number[];
  cooldownReadyAt: Record<PlantId, number>;
  heroLane: LaneIndex;
  nextHeroShotAtMs: number;
}
```

- [ ] **Step 2: Create `src/game/config.ts`**

Add:

```ts
import type { DifficultyId, LevelConfig, PlantConfig, PlantId, ZombieConfig } from "./types";

export const PLANTS: Record<PlantId, PlantConfig> = {
  sunflower: {
    id: "sunflower",
    name: "向日葵",
    cost: 50,
    cooldownMs: 2500,
    maxHp: 80,
    damage: 0,
    fireIntervalMs: 0,
    rangeColumns: 0,
    producesSun: true,
    slows: false,
    blocks: false,
    armsAfterMs: 0
  },
  peashooter: {
    id: "peashooter",
    name: "豌豆射手",
    cost: 100,
    cooldownMs: 3000,
    maxHp: 100,
    damage: 20,
    fireIntervalMs: 1200,
    rangeColumns: 9,
    producesSun: false,
    slows: false,
    blocks: false,
    armsAfterMs: 0
  },
  wallnut: {
    id: "wallnut",
    name: "坚果墙",
    cost: 50,
    cooldownMs: 5000,
    maxHp: 360,
    damage: 0,
    fireIntervalMs: 0,
    rangeColumns: 0,
    producesSun: false,
    slows: false,
    blocks: true,
    armsAfterMs: 0
  },
  snowpea: {
    id: "snowpea",
    name: "寒冰射手",
    cost: 175,
    cooldownMs: 4500,
    maxHp: 100,
    damage: 15,
    fireIntervalMs: 1400,
    rangeColumns: 9,
    producesSun: false,
    slows: true,
    blocks: false,
    armsAfterMs: 0
  },
  potatomine: {
    id: "potatomine",
    name: "土豆雷",
    cost: 25,
    cooldownMs: 6000,
    maxHp: 70,
    damage: 120,
    fireIntervalMs: 0,
    rangeColumns: 0,
    producesSun: false,
    slows: false,
    blocks: false,
    armsAfterMs: 3000
  }
};

export const ZOMBIES: Record<string, ZombieConfig> = {
  basic: { id: "basic", name: "普通僵尸", maxHp: 70, speedCellsPerSecond: 0.18, damagePerSecond: 18 },
  cone: { id: "cone", name: "路障僵尸", maxHp: 120, speedCellsPerSecond: 0.16, damagePerSecond: 20 },
  bucket: { id: "bucket", name: "铁桶僵尸", maxHp: 180, speedCellsPerSecond: 0.13, damagePerSecond: 22 }
};

export const DIFFICULTY: Record<DifficultyId, { zombieHpMultiplier: number; zombieSpeedMultiplier: number; sunMultiplier: number }> = {
  easy: { zombieHpMultiplier: 0.75, zombieSpeedMultiplier: 0.8, sunMultiplier: 1.25 },
  normal: { zombieHpMultiplier: 1, zombieSpeedMultiplier: 1, sunMultiplier: 1 }
};

export const LEVEL_ONE: LevelConfig = {
  id: "level-1",
  name: "阳光草坪",
  startingSun: 150,
  durationMs: 120000,
  allowedPlants: ["sunflower", "peashooter", "wallnut", "snowpea", "potatomine"],
  waves: [
    { atMs: 3000, lane: 2, zombieId: "basic" },
    { atMs: 9000, lane: 1, zombieId: "basic" },
    { atMs: 16000, lane: 3, zombieId: "cone" },
    { atMs: 24000, lane: 0, zombieId: "basic" },
    { atMs: 33000, lane: 4, zombieId: "cone" },
    { atMs: 45000, lane: 2, zombieId: "bucket" },
    { atMs: 60000, lane: 1, zombieId: "basic" },
    { atMs: 72000, lane: 3, zombieId: "bucket" }
  ]
};
```

- [ ] **Step 3: Create failing rule tests in `src/game/rules.test.ts`**

Add:

```ts
import { describe, expect, it } from "vitest";
import { LEVEL_ONE, PLANTS, ZOMBIES } from "./config";
import { createInitialState, plantAt, selectPlant, spawnDueZombies, updateStatus } from "./rules";

describe("game rules", () => {
  it("spends sun and occupies a grid cell when planting succeeds", () => {
    const state = selectPlant(createInitialState(LEVEL_ONE), "peashooter");
    const next = plantAt(state, PLANTS, 2, 3);
    expect(next.sun).toBe(50);
    expect(next.plants).toHaveLength(1);
    expect(next.plants[0]).toMatchObject({ plantId: "peashooter", lane: 2, column: 3 });
  });

  it("does not allow sun to become negative", () => {
    const state = selectPlant({ ...createInitialState(LEVEL_ONE), sun: 20 }, "peashooter");
    const next = plantAt(state, PLANTS, 2, 3);
    expect(next.sun).toBe(20);
    expect(next.plants).toHaveLength(0);
  });

  it("does not plant into an occupied cell", () => {
    const first = plantAt(selectPlant(createInitialState(LEVEL_ONE), "sunflower"), PLANTS, 1, 1);
    const second = plantAt(selectPlant(first, "peashooter"), PLANTS, 1, 1);
    expect(second.plants).toHaveLength(1);
    expect(second.sun).toBe(first.sun);
  });

  it("spawns each wave entry once", () => {
    const state = { ...createInitialState(LEVEL_ONE), nowMs: 10000 };
    const first = spawnDueZombies(state, LEVEL_ONE, ZOMBIES);
    const second = spawnDueZombies(first, LEVEL_ONE, ZOMBIES);
    expect(first.zombies).toHaveLength(2);
    expect(second.zombies).toHaveLength(2);
    expect(first.zombies[0].hp).toBeGreaterThan(1);
  });

  it("sets failure when a zombie reaches the base", () => {
    const state = createInitialState(LEVEL_ONE);
    const next = updateStatus({
      ...state,
      zombies: [{ id: "z1", zombieId: "basic", lane: 0, x: -0.1, hp: 10, slowedUntilMs: 0 }]
    }, LEVEL_ONE);
    expect(next.status).toBe("failure");
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run:

```bash
npm test -- src/game/rules.test.ts
```

Expected: FAIL because `src/game/rules.ts` does not exist yet.

- [ ] **Step 5: Create `src/game/rules.ts`**

Add:

```ts
import type { ColumnIndex, GameState, LaneIndex, LevelConfig, PlantConfig, PlantId, ProjectileEntity, ZombieConfig } from "./types";

let entityCounter = 0;

function nextId(prefix: string): string {
  entityCounter += 1;
  return `${prefix}-${entityCounter}`;
}

export function createInitialState(level: LevelConfig): GameState {
  return {
    status: "menu",
    nowMs: 0,
    sun: level.startingSun,
    selectedPlantId: null,
    plants: [],
    zombies: [],
    projectiles: [],
    spawnedWaveIndexes: [],
    cooldownReadyAt: {
      sunflower: 0,
      peashooter: 0,
      wallnut: 0,
      snowpea: 0,
      potatomine: 0
    },
    heroLane: 2,
    nextHeroShotAtMs: 0
  };
}

export function selectPlant(state: GameState, plantId: PlantId): GameState {
  return { ...state, selectedPlantId: plantId };
}

export function plantAt(
  state: GameState,
  plantConfigs: Record<PlantId, PlantConfig>,
  lane: LaneIndex,
  column: ColumnIndex
): GameState {
  if (!state.selectedPlantId) return state;
  const plantConfig = plantConfigs[state.selectedPlantId];
  const occupied = state.plants.some((plant) => plant.lane === lane && plant.column === column);
  const readyAt = state.cooldownReadyAt[state.selectedPlantId];
  if (occupied || state.sun < plantConfig.cost || state.nowMs < readyAt) return state;

  return {
    ...state,
    sun: state.sun - plantConfig.cost,
    selectedPlantId: null,
    cooldownReadyAt: {
      ...state.cooldownReadyAt,
      [state.selectedPlantId]: state.nowMs + plantConfig.cooldownMs
    },
    plants: [
      ...state.plants,
      {
        id: nextId("plant"),
        plantId: plantConfig.id,
        lane,
        column,
        hp: plantConfig.maxHp,
        plantedAtMs: state.nowMs,
        nextFireAtMs: state.nowMs + plantConfig.fireIntervalMs,
        nextSunAtMs: state.nowMs + 5000
      }
    ]
  };
}

export function spawnDueZombies(
  state: GameState,
  level: LevelConfig,
  zombieConfigs: Record<string, ZombieConfig>
): GameState {
  const newZombies = level.waves
    .map((wave, index) => ({ wave, index }))
    .filter(({ wave, index }) => wave.atMs <= state.nowMs && !state.spawnedWaveIndexes.includes(index));

  if (newZombies.length === 0) return state;

  return {
    ...state,
    spawnedWaveIndexes: [...state.spawnedWaveIndexes, ...newZombies.map(({ index }) => index)],
    zombies: [
      ...state.zombies,
      ...newZombies.map(({ wave }) => ({
        id: nextId("zombie"),
        zombieId: wave.zombieId,
        lane: wave.lane,
        x: 8.8,
        hp: zombieConfigs[wave.zombieId].maxHp,
        slowedUntilMs: 0
      }))
    ]
  };
}

export function updateStatus(state: GameState, level: LevelConfig): GameState {
  if (state.zombies.some((zombie) => zombie.x <= 0)) {
    return { ...state, status: "failure" };
  }
  const allWavesSpawned = state.spawnedWaveIndexes.length === level.waves.length;
  if (allWavesSpawned && state.zombies.length === 0 && state.nowMs >= level.durationMs) {
    return { ...state, status: "victory" };
  }
  return state;
}
```

- [ ] **Step 6: Run rule tests**

Run:

```bash
npm test -- src/game/rules.test.ts
```

Expected: PASS for all tests.

- [ ] **Step 7: Commit rule foundation**

Run:

```bash
git add src/game/types.ts src/game/config.ts src/game/rules.ts src/game/rules.test.ts
git commit -m "Add playable game rules"
```

---

### Task 3: Phaser Scene Foundation

**Files:**
- Create: `src/game/GameScene.ts`
- Modify: `src/main.ts`

- [ ] **Step 1: Create `src/game/GameScene.ts`**

Add:

```ts
import Phaser from "phaser";
import { LEVEL_ONE, PLANTS, ZOMBIES } from "./config";
import { createInitialState, plantAt, selectPlant, spawnDueZombies, updateStatus } from "./rules";
import type { ColumnIndex, GameState, LaneIndex, PlantId } from "./types";

const BOARD = {
  x: 148,
  y: 132,
  width: 980,
  height: 388,
  lanes: 5,
  columns: 9
};

export class GameScene extends Phaser.Scene {
  private state: GameState = createInitialState(LEVEL_ONE);
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private lastTickMs = 0;

  constructor() {
    super("GameScene");
  }

  create(): void {
    this.state = { ...createInitialState(LEVEL_ONE), status: "playing" };
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys("W,A,S,D,SPACE,ESC") as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.handlePointer(pointer));
    this.drawStaticBoard();
  }

  update(time: number): void {
    if (this.state.status !== "playing") return;
    const deltaMs = this.lastTickMs === 0 ? 16 : time - this.lastTickMs;
    this.lastTickMs = time;
    this.state = { ...this.state, nowMs: this.state.nowMs + deltaMs };
    this.handleKeyboard();
    this.state = spawnDueZombies(this.state, LEVEL_ONE, ZOMBIES);
    this.state = updateStatus(this.state, LEVEL_ONE);
    this.redrawDynamicWorld();
    this.events.emit("state-changed", this.state);
  }

  setSelectedPlant(plantId: PlantId): void {
    this.state = selectPlant(this.state, plantId);
    this.events.emit("state-changed", this.state);
  }

  togglePause(): void {
    this.state = {
      ...this.state,
      status: this.state.status === "paused" ? "playing" : "paused"
    };
    this.lastTickMs = 0;
    this.events.emit("state-changed", this.state);
  }

  private handleKeyboard(): void {
    if (Phaser.Input.Keyboard.JustDown(this.keys.W) || Phaser.Input.Keyboard.JustDown(this.cursors.up!)) {
      this.state = { ...this.state, heroLane: Math.max(0, this.state.heroLane - 1) as LaneIndex };
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.S) || Phaser.Input.Keyboard.JustDown(this.cursors.down!)) {
      this.state = { ...this.state, heroLane: Math.min(4, this.state.heroLane + 1) as LaneIndex };
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
      this.togglePause();
    }
  }

  private handlePointer(pointer: Phaser.Input.Pointer): void {
    const column = Math.floor(((pointer.x - BOARD.x) / BOARD.width) * BOARD.columns);
    const lane = Math.floor(((pointer.y - BOARD.y) / BOARD.height) * BOARD.lanes);
    if (column < 0 || column > 8 || lane < 0 || lane > 4) return;
    this.state = plantAt(this.state, PLANTS, lane as LaneIndex, column as ColumnIndex);
    this.events.emit("state-changed", this.state);
  }

  private drawStaticBoard(): void {
    this.add.rectangle(640, 360, 1280, 720, 0xeebf7a);
    this.add.rectangle(640, 326, 1080, 420, 0xf5cf8c).setStrokeStyle(4, 0x7b5737);
    const laneHeight = BOARD.height / BOARD.lanes;
    for (let lane = 0; lane < BOARD.lanes; lane += 1) {
      const y = BOARD.y + lane * laneHeight + laneHeight / 2;
      const color = [0x8bd4bd, 0xf7df76, 0x9bd887, 0x9fd7ef, 0xf8b1a7][lane];
      this.add.rectangle(BOARD.x + BOARD.width / 2, y, BOARD.width, laneHeight - 8, color).setStrokeStyle(2, 0x5c4330, 0.25);
    }
    this.add.rectangle(86, 326, 72, 350, 0xfff0b8).setStrokeStyle(3, 0x5c4330);
    this.add.text(70, 296, "基地", { fontSize: "24px", color: "#263238", fontStyle: "bold" }).setAngle(-90);
  }

  private redrawDynamicWorld(): void {
    this.children.list
      .filter((child) => child.getData("dynamic"))
      .forEach((child) => child.destroy());

    const laneHeight = BOARD.height / BOARD.lanes;
    const columnWidth = BOARD.width / BOARD.columns;

    this.add
      .circle(BOARD.x + columnWidth * 0.7, BOARD.y + this.state.heroLane * laneHeight + laneHeight / 2, 28, 0x4abb6e)
      .setStrokeStyle(4, 0x174a36)
      .setData("dynamic", true);

    this.state.plants.forEach((plant) => {
      const x = BOARD.x + plant.column * columnWidth + columnWidth / 2;
      const y = BOARD.y + plant.lane * laneHeight + laneHeight / 2;
      this.add.circle(x, y, 24, 0x55bd70).setStrokeStyle(3, 0x35513f).setData("dynamic", true);
      this.add.text(x - 16, y - 13, PLANTS[plant.plantId].name.slice(0, 1), { fontSize: "24px", color: "#163622", fontStyle: "bold" }).setData("dynamic", true);
    });

    this.state.zombies.forEach((zombie) => {
      const x = BOARD.x + zombie.x * columnWidth;
      const y = BOARD.y + zombie.lane * laneHeight + laneHeight / 2;
      this.add.rectangle(x, y, 48, 54, 0x7b9189).setStrokeStyle(3, 0x3f504d).setData("dynamic", true);
      this.add.text(x - 15, y - 13, "僵", { fontSize: "24px", color: "#263238", fontStyle: "bold" }).setData("dynamic", true);
    });
  }
}
```

- [ ] **Step 2: Modify `src/main.ts` to load the scene**

Replace the file with:

```ts
import Phaser from "phaser";
import { GameScene } from "./game/GameScene";
import { createDomOverlay } from "./ui/domOverlay";
import "./styles.css";

const scene = new GameScene();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-root",
  backgroundColor: "#eebf7a",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720
  },
  scene: [scene]
};

const game = new Phaser.Game(config);
createDomOverlay(document.querySelector("#ui-root")!, scene);

window.addEventListener("beforeunload", () => {
  game.destroy(true);
});
```

- [ ] **Step 3: Run build to reveal missing overlay**

Run:

```bash
npm run build
```

Expected: FAIL because `src/ui/domOverlay.ts` has not been created yet.

**Commit note:** Do not commit Task 3 by itself. Commit it with Task 4 after the DOM overlay exists and build passes.

---

### Task 4: DOM Overlay And HUD

**Files:**
- Create: `src/ui/domOverlay.ts`
- Create: `src/ui/domOverlay.test.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Create `src/ui/domOverlay.test.ts`**

Add:

```ts
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
```

- [ ] **Step 2: Run overlay test to verify it fails**

Run:

```bash
npm test -- src/ui/domOverlay.test.ts
```

Expected: FAIL because `src/ui/domOverlay.ts` does not exist yet.

- [ ] **Step 3: Create `src/ui/domOverlay.ts`**

Add:

```ts
import type { GameScene } from "../game/GameScene";
import { LEVEL_ONE, PLANTS } from "../game/config";
import type { GameState, PlantId } from "../game/types";

interface OverlayRenderState {
  sun: number;
  waveText: string;
  status: GameState["status"];
  selectedPlantId: PlantId | null;
  cooldownReadyAt: GameState["cooldownReadyAt"];
  nowMs: number;
}

const plantOrder: PlantId[] = ["sunflower", "peashooter", "wallnut", "snowpea", "potatomine"];

export function createDomOverlayMarkup(state: OverlayRenderState): string {
  const cards = plantOrder
    .map((plantId) => {
      const plant = PLANTS[plantId];
      const disabled = state.nowMs < state.cooldownReadyAt[plantId] ? "disabled" : "";
      const selected = state.selectedPlantId === plantId ? " is-selected" : "";
      return `<button class="plant-card${selected}" data-plant="${plantId}" ${disabled}>
        <strong>${plant.name}</strong>
        <span>☀ ${plant.cost}</span>
      </button>`;
    })
    .join("");

  const modalClass = state.status === "paused" || state.status === "victory" || state.status === "failure" ? "modal-layer is-visible" : "modal-layer";
  const modalTitle = state.status === "victory" ? "守住啦！" : state.status === "failure" ? "差一点点" : "暂停";
  const modalBody = state.status === "victory" ? "获得本关植物奖章。" : state.status === "failure" ? "草坪防线被突破了，再试一次。" : "植物防线先休息一下。";

  return `<div class="hud">
    <div class="hud-top">
      <div class="chip">☀ ${state.sun}</div>
      <div class="chip">${state.waveText}</div>
      <button class="chip" data-action="pause">暂停</button>
    </div>
    <div></div>
    <div class="plant-tray">${cards}</div>
  </div>
  <div class="${modalClass}">
    <section class="modal">
      <h2>${modalTitle}</h2>
      <p>${modalBody}</p>
      <button class="chip" data-action="pause">继续</button>
    </section>
  </div>`;
}

function getWaveText(state: GameState): string {
  const spawned = state.spawnedWaveIndexes.length;
  return `第 ${Math.min(spawned + 1, LEVEL_ONE.waves.length)} 波 / ${LEVEL_ONE.waves.length}`;
}

export function createDomOverlay(root: Element, scene: GameScene): void {
  function render(state: GameState): void {
    root.innerHTML = createDomOverlayMarkup({
      sun: state.sun,
      waveText: getWaveText(state),
      status: state.status,
      selectedPlantId: state.selectedPlantId,
      cooldownReadyAt: state.cooldownReadyAt,
      nowMs: state.nowMs
    });
  }

  scene.events.on("state-changed", render);
  root.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const plantButton = target.closest("[data-plant]") as HTMLElement | null;
    if (plantButton) {
      scene.setSelectedPlant(plantButton.dataset.plant as PlantId);
      return;
    }
    const actionButton = target.closest("[data-action]") as HTMLElement | null;
    if (actionButton?.dataset.action === "pause") {
      scene.togglePause();
    }
  });
}
```

- [ ] **Step 4: Run overlay tests**

Run:

```bash
npm test -- src/ui/domOverlay.test.ts
```

Expected: PASS.

- [ ] **Step 5: Run build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit scene and overlay**

Run:

```bash
git add src/game/GameScene.ts src/main.ts src/ui/domOverlay.ts src/ui/domOverlay.test.ts src/styles.css
git commit -m "Add playable scene and HUD"
```

---

### Task 5: Movement, Zombies, Projectiles, And Win/Fail Loop

**Files:**
- Modify: `src/game/rules.ts`
- Modify: `src/game/rules.test.ts`
- Modify: `src/game/GameScene.ts`

- [ ] **Step 1: Add failing tests for movement and combat**

Update the existing rules import in `src/game/rules.test.ts`:

```ts
import { advanceCombat, createInitialState, plantAt, selectPlant, spawnDueZombies, updateStatus } from "./rules";
```

Then append these tests inside the existing `describe("game rules", callback)` block:

```ts

it("moves zombies toward the base", () => {
  const state = {
    ...createInitialState(LEVEL_ONE),
    zombies: [{ id: "z1", zombieId: "basic", lane: 0, x: 8, hp: 70, slowedUntilMs: 0 }]
  };
  const next = advanceCombat(state, PLANTS, { basic: { id: "basic", name: "普通僵尸", maxHp: 70, speedCellsPerSecond: 1, damagePerSecond: 18 } }, 1000);
  expect(next.zombies[0].x).toBeLessThan(8);
});

it("creates projectiles from peashooters when a zombie is ahead", () => {
  const planted = plantAt(selectPlant(createInitialState(LEVEL_ONE), "peashooter"), PLANTS, 0, 1);
  const state = {
    ...planted,
    nowMs: 2000,
    zombies: [{ id: "z1", zombieId: "basic", lane: 0, x: 7, hp: 70, slowedUntilMs: 0 }]
  };
  const next = advanceCombat(state, PLANTS, { basic: { id: "basic", name: "普通僵尸", maxHp: 70, speedCellsPerSecond: 1, damagePerSecond: 18 } }, 16);
  expect(next.projectiles.length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run rule tests to verify failure**

Run:

```bash
npm test -- src/game/rules.test.ts
```

Expected: FAIL because `advanceCombat` does not exist yet.

- [ ] **Step 3: Implement `advanceCombat` in `src/game/rules.ts`**

Append:

```ts
export function advanceCombat(
  state: GameState,
  plantConfigs: Record<PlantId, PlantConfig>,
  zombieConfigs: Record<string, ZombieConfig>,
  deltaMs: number
): GameState {
  const deltaSeconds = deltaMs / 1000;
  const newProjectiles = [...state.projectiles];
  const plants = state.plants.map((plant) => ({ ...plant }));
  let zombies = state.zombies.map((zombie) => ({ ...zombie }));

  for (const plant of plants) {
    const config = plantConfigs[plant.plantId];
    if (config.damage <= 0 || state.nowMs < plant.nextFireAtMs) continue;
    const target = zombies.find((zombie) => zombie.lane === plant.lane && zombie.x > plant.column);
    if (!target) continue;
    newProjectiles.push({
      id: nextId("projectile"),
      lane: plant.lane,
      x: plant.column + 0.8,
      damage: config.damage,
      slows: config.slows
    });
    plant.nextFireAtMs = state.nowMs + config.fireIntervalMs;
  }

  const movedProjectiles = newProjectiles.map((projectile) => ({ ...projectile, x: projectile.x + deltaSeconds * 4 }));
  const remainingProjectiles: ProjectileEntity[] = [];

  for (const projectile of movedProjectiles) {
    const target = zombies.find((zombie) => zombie.lane === projectile.lane && Math.abs(zombie.x - projectile.x) < 0.28);
    if (!target) {
      if (projectile.x < 9.4) remainingProjectiles.push(projectile);
      continue;
    }
    target.hp -= projectile.damage;
    if (projectile.slows) target.slowedUntilMs = state.nowMs + 2000;
  }

  zombies = zombies.filter((zombie) => zombie.hp > 0);
  zombies = zombies.map((zombie) => {
    const config = zombieConfigs[zombie.zombieId];
    const slowMultiplier = zombie.slowedUntilMs > state.nowMs ? 0.45 : 1;
    return { ...zombie, x: zombie.x - config.speedCellsPerSecond * slowMultiplier * deltaSeconds };
  });

  return {
    ...state,
    plants,
    zombies,
    projectiles: remainingProjectiles
  };
}
```

- [ ] **Step 4: Wire `advanceCombat` into `src/game/GameScene.ts`**

Update imports:

```ts
import { LEVEL_ONE, PLANTS, ZOMBIES } from "./config";
import { advanceCombat, createInitialState, plantAt, selectPlant, spawnDueZombies, updateStatus } from "./rules";
```

In `update`, after `spawnDueZombies`, add:

```ts
this.state = advanceCombat(this.state, PLANTS, ZOMBIES, deltaMs);
```

- [ ] **Step 5: Render projectiles in `redrawDynamicWorld`**

Add before rendering zombies:

```ts
this.state.projectiles.forEach((projectile) => {
  const x = BOARD.x + projectile.x * columnWidth;
  const y = BOARD.y + projectile.lane * laneHeight + laneHeight / 2;
  this.add.circle(x, y, 9, projectile.slows ? 0x9fd7ef : 0xc7ef68).setStrokeStyle(2, 0x35513f).setData("dynamic", true);
});
```

- [ ] **Step 6: Run tests and build**

Run:

```bash
npm test
npm run build
```

Expected: both commands exit 0.

- [ ] **Step 7: Commit combat loop**

Run:

```bash
git add src/game/rules.ts src/game/rules.test.ts src/game/GameScene.ts
git commit -m "Add combat loop"
```

---

### Task 6: Browser Verification And Prototype Alignment

**Files:**
- Modify: `src/styles.css`
- Modify: `docs/superpowers/plans/2026-05-26-playable-vertical-slice.md`

- [ ] **Step 1: Start the dev server**

Run:

```bash
npm run dev
```

Expected: Vite prints a local URL, usually `http://127.0.0.1:5173/`.

- [ ] **Step 2: Open the game in a browser**

Run with the Playwright wrapper:

```bash
/Users/jack/.codex/skills/playwright/scripts/playwright_cli.sh open http://127.0.0.1:5173/
```

Expected: page title is `玩具桌面植物小队` and the game canvas is visible.

- [ ] **Step 3: Interact with the vertical slice**

Use Playwright or manual browser interaction:

```text
1. Click 豌豆射手 card.
2. Click a lane cell on the board.
3. Press W and S to move 豌豆队长.
4. Wait for at least two zombies to spawn.
5. Click 暂停, then 继续.
```

Expected:

- Sun decreases after planting.
- Occupied cells do not accept a second plant.
- Hero lane changes after W/S.
- Zombies spawn and move toward the base.
- Projectiles appear when a shooter has a zombie ahead.
- Pause modal appears and closes.

- [ ] **Step 4: Capture screenshot**

Run:

```bash
/Users/jack/.codex/skills/playwright/scripts/playwright_cli.sh screenshot
```

Expected: screenshot shows the playable board, HUD, plant tray, at least one plant, and at least one zombie.

- [ ] **Step 5: Run final verification**

Run:

```bash
npm test
npm run build
git status --short
```

Expected:

- `npm test` exits 0.
- `npm run build` exits 0.
- `git status --short` only shows files intentionally changed for this task and generated screenshot artifacts outside the commit.

- [ ] **Step 6: Mark this plan task complete**

Update this file so completed steps are checked.

- [ ] **Step 7: Commit verification updates**

Run:

```bash
git add src/styles.css docs/superpowers/plans/2026-05-26-playable-vertical-slice.md
git commit -m "Verify playable vertical slice"
```

---

## Self-Review Notes

- Spec coverage in this plan: playable browser foundation, five lanes, five plant cards, resource spending, cooldown eligibility, grid occupancy, hero lane movement, zombie waves, projectiles, pause, victory/failure state, DOM HUD, and build/test verification.
- Not covered in this plan: all three full levels, family time settings for 3/5/8 minutes, simple/normal tuning UI persistence, Mac packaging, sound, and polished final art. Those are separate implementation slices after this first playable level is verified.
- No official game assets are required by this plan. The game can use generated shapes and public/open placeholder assets until local user-provided assets are added.
