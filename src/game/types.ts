export type LaneIndex = 0 | 1 | 2 | 3 | 4;
export type ColumnIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type PlantId = "sunflower" | "peashooter" | "wallnut" | "snowpea" | "potatomine";
export type ZombieId = "basic" | "cone" | "bucket";
export type DifficultyId = "easy" | "normal";
export type GameStatus = "menu" | "playing" | "paused" | "victory" | "failure";
export type PlantingFailureReason = "no-selection" | "occupied" | "not-enough-sun" | "cooldown";

export type PlantingResult =
  | {
      ok: true;
      plantId: PlantId;
    }
  | {
      ok: false;
      reason: PlantingFailureReason;
    };

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

export interface DifficultyConfig {
  zombieHpMultiplier: number;
  zombieSpeedMultiplier: number;
  sunMultiplier: number;
}

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

export type CombatEvent =
  | {
      id: string;
      type: "sun-produced";
      sourceId: string;
      lane: LaneIndex;
      column: ColumnIndex;
      amount: number;
      atMs: number;
    }
  | {
      id: string;
      type: "plant-fired";
      sourceId: string;
      lane: LaneIndex;
      column: ColumnIndex;
      atMs: number;
    }
  | {
      id: string;
      type: "hero-fired";
      sourceId: "hero";
      lane: LaneIndex;
      atMs: number;
    }
  | {
      id: string;
      type: "zombie-hit";
      targetId: string;
      lane: LaneIndex;
      x: number;
      damage: number;
      slows: boolean;
      atMs: number;
    }
  | {
      id: string;
      type: "plant-bitten";
      targetId: string;
      lane: LaneIndex;
      column: ColumnIndex;
      damage: number;
      atMs: number;
    }
  | {
      id: string;
      type: "zombie-defeated";
      targetId: string;
      lane: LaneIndex;
      x: number;
      atMs: number;
    }
  | {
      id: string;
      type: "potato-mine-exploded";
      sourceId: string;
      lane: LaneIndex;
      column: ColumnIndex;
      damage: number;
      radiusCells: number;
      atMs: number;
    }
  | {
      id: string;
      type: "lawn-mower-triggered";
      lane: LaneIndex;
      clearedCount: number;
      atMs: number;
    }
  | {
      id: string;
      type: "wave-spawned";
      waveIndex: number;
      lane: LaneIndex;
      zombieId: ZombieId;
      atMs: number;
    }
  | {
      id: string;
      type: "level-ended";
      status: Extract<GameStatus, "victory" | "failure">;
      atMs: number;
    };

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
  mowerLanes: LaneIndex[];
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
  events: CombatEvent[];
  spawnedWaveIndexes: number[];
  cooldownReadyAt: Record<PlantId, number>;
  heroLane: LaneIndex;
  nextHeroShotAtMs: number;
  nextBaseSunAtMs: number;
  baseSunIntervalMs: number;
  mowerLanes: LaneIndex[];
  runChallenge?: RunChallengeState;
}
