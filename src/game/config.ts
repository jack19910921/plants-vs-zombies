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

export const DIFFICULTY: Record<
  DifficultyId,
  { zombieHpMultiplier: number; zombieSpeedMultiplier: number; sunMultiplier: number }
> = {
  easy: { zombieHpMultiplier: 0.75, zombieSpeedMultiplier: 0.8, sunMultiplier: 1.25 },
  normal: { zombieHpMultiplier: 1, zombieSpeedMultiplier: 1, sunMultiplier: 1 }
};

export const LEVELS: LevelConfig[] = [
  {
    id: "level-1",
    name: "阳光草坪",
    startingSun: 250,
    durationMs: 105000,
    allowedPlants: ["sunflower", "peashooter", "wallnut", "snowpea", "potatomine"],
    waves: [
      { atMs: 8000, lane: 2, zombieId: "basic" },
      { atMs: 18000, lane: 1, zombieId: "basic" },
      { atMs: 30000, lane: 3, zombieId: "cone" },
      { atMs: 42000, lane: 0, zombieId: "basic" },
      { atMs: 54000, lane: 4, zombieId: "cone" },
      { atMs: 68000, lane: 2, zombieId: "bucket" },
      { atMs: 82000, lane: 1, zombieId: "basic" },
      { atMs: 98000, lane: 3, zombieId: "bucket" }
    ]
  },
  {
    id: "level-2",
    name: "薄雾菜园",
    startingSun: 225,
    durationMs: 115000,
    allowedPlants: ["sunflower", "peashooter", "wallnut", "snowpea", "potatomine"],
    waves: [
      { atMs: 6000, lane: 1, zombieId: "basic" },
      { atMs: 14000, lane: 3, zombieId: "basic" },
      { atMs: 24000, lane: 2, zombieId: "cone" },
      { atMs: 36000, lane: 0, zombieId: "basic" },
      { atMs: 48000, lane: 4, zombieId: "cone" },
      { atMs: 62000, lane: 1, zombieId: "bucket" },
      { atMs: 76000, lane: 3, zombieId: "cone" },
      { atMs: 92000, lane: 2, zombieId: "bucket" },
      { atMs: 108000, lane: 0, zombieId: "bucket" }
    ]
  }
];

export const LEVEL_ONE: LevelConfig = LEVELS[0];
