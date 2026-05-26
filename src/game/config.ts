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
