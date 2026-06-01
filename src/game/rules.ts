import type {
  ColumnIndex,
  CombatEvent,
  DifficultyConfig,
  GameState,
  LaneIndex,
  LevelConfig,
  PlantConfig,
  PlantId,
  PlantingResult,
  ProjectileEntity,
  RunChallengeState,
  ZombieConfig
} from "./types";
import { syncChallengeProgressFromState, updateChallengeForEvent } from "./runChallenges";

let entityCounter = 0;
const EVENT_TTL_MS = 700;
const POTATO_MINE_TRIGGER_RADIUS_CELLS = 0.65;
const POTATO_MINE_BLAST_RADIUS_CELLS = 0.75;
const BASE_SUN_AMOUNT = 25;
const BASE_SUN_INTERVAL_MS = 9000;
const ICE_SLOW_MS = 2000;
const BUCKET_ICE_SLOW_MS = 1000;
const NORMAL_DIFFICULTY: DifficultyConfig = {
  zombieHpMultiplier: 1,
  zombieSpeedMultiplier: 1,
  sunMultiplier: 1
};
type CombatEventInput = CombatEvent extends infer Event ? (Event extends CombatEvent ? Omit<Event, "id"> : never) : never;

function nextId(prefix: string): string {
  entityCounter += 1;
  return `${prefix}-${entityCounter}`;
}

function makeEvent(event: CombatEventInput): CombatEvent {
  return { ...event, id: nextId("event") } as CombatEvent;
}

function applySunMultiplier(startingSun: number, difficulty: DifficultyConfig): number {
  return Math.max(0, Math.round((startingSun * difficulty.sunMultiplier) / 25) * 25);
}

function applyZombieHp(maxHp: number, difficulty: DifficultyConfig): number {
  return Math.max(1, Math.round(maxHp * difficulty.zombieHpMultiplier));
}

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
  const sun = Math.max(
    0,
    applySunMultiplier(level.startingSun, difficulty) + (runChallenge?.modifier.adjustments.startingSunDelta ?? 0)
  );

  const initialRunChallenge = syncChallengeProgressFromState(runChallenge, { sun, mowerLanes });

  return {
    status: "menu",
    nowMs: 0,
    sun,
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
    runChallenge: initialRunChallenge
  };
}

export function selectPlant(state: GameState, plantId: PlantId): GameState {
  return { ...state, selectedPlantId: plantId };
}

export function moveHeroLane(state: GameState, delta: -1 | 1): GameState {
  const nextLane = Math.max(0, Math.min(4, state.heroLane + delta)) as LaneIndex;
  if (nextLane === state.heroLane) return state;
  return { ...state, heroLane: nextLane };
}

export function getPlantingResult(
  state: GameState,
  plantConfigs: Record<PlantId, PlantConfig>,
  lane: LaneIndex,
  column: ColumnIndex
): PlantingResult {
  if (!state.selectedPlantId) return { ok: false, reason: "no-selection" };
  const plantConfig = plantConfigs[state.selectedPlantId];
  const occupied = state.plants.some((plant) => plant.lane === lane && plant.column === column);
  if (occupied) return { ok: false, reason: "occupied" };
  if (state.sun < plantConfig.cost) return { ok: false, reason: "not-enough-sun" };
  const readyAt = state.cooldownReadyAt[state.selectedPlantId];
  if (state.nowMs < readyAt) return { ok: false, reason: "cooldown" };
  return { ok: true, plantId: state.selectedPlantId };
}

export function plantAt(
  state: GameState,
  plantConfigs: Record<PlantId, PlantConfig>,
  lane: LaneIndex,
  column: ColumnIndex
): GameState {
  const plantingResult = getPlantingResult(state, plantConfigs, lane, column);
  if (!plantingResult.ok) return state;
  const plantConfig = plantConfigs[plantingResult.plantId];
  const cooldownMultiplier = state.runChallenge?.modifier.adjustments.plantCooldownMultiplier?.[plantingResult.plantId] ?? 1;
  const cooldownMs = Math.max(0, Math.round(plantConfig.cooldownMs * cooldownMultiplier));

  const nextState = {
    ...state,
    sun: state.sun - plantConfig.cost,
    selectedPlantId: null,
    cooldownReadyAt: {
      ...state.cooldownReadyAt,
      [plantingResult.plantId]: state.nowMs + cooldownMs
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

  const withPlantProgress = {
    ...nextState,
    runChallenge: updateChallengeForEvent(nextState.runChallenge, { type: "plant", plantId: plantingResult.plantId })
  };
  return {
    ...withPlantProgress,
    runChallenge: syncChallengeProgressFromState(withPlantProgress.runChallenge, withPlantProgress)
  };
}

export function spawnDueZombies(
  state: GameState,
  level: LevelConfig,
  zombieConfigs: Record<string, ZombieConfig>,
  difficulty: DifficultyConfig = NORMAL_DIFFICULTY
): GameState {
  const firstWaveDelayMs = state.runChallenge?.modifier.adjustments.firstWaveDelayMs ?? 0;
  const newZombies = level.waves
    .map((wave, index) => ({ wave, index, spawnAtMs: wave.atMs + (index === 0 ? firstWaveDelayMs : 0) }))
    .filter(({ index, spawnAtMs }) => spawnAtMs <= state.nowMs && !state.spawnedWaveIndexes.includes(index));

  if (newZombies.length === 0) return state;

  return {
    ...state,
    events: [
      ...state.events,
      ...newZombies.map(({ wave, index }) =>
        makeEvent({
          type: "wave-spawned",
          waveIndex: index,
          lane: wave.lane,
          zombieId: wave.zombieId,
          atMs: state.nowMs
        })
      )
    ],
    spawnedWaveIndexes: [...state.spawnedWaveIndexes, ...newZombies.map(({ index }) => index)],
    zombies: [
      ...state.zombies,
      ...newZombies.map(({ wave }) => ({
        id: nextId("zombie"),
        zombieId: wave.zombieId,
        lane: wave.lane,
        x: 8.8,
        hp: applyZombieHp(zombieConfigs[wave.zombieId].maxHp, difficulty),
        slowedUntilMs: 0
      }))
    ]
  };
}

export function updateStatus(state: GameState, level: LevelConfig): GameState {
  if (state.zombies.some((zombie) => zombie.x <= 0)) {
    return {
      ...state,
      status: "failure",
      events:
        state.status === "failure"
          ? state.events
          : [...state.events, makeEvent({ type: "level-ended", status: "failure", atMs: state.nowMs })]
    };
  }
  const allWavesSpawned = state.spawnedWaveIndexes.length === level.waves.length;
  if (allWavesSpawned && state.zombies.length === 0 && state.nowMs >= level.durationMs) {
    return {
      ...state,
      status: "victory",
      events:
        state.status === "victory"
          ? state.events
          : [...state.events, makeEvent({ type: "level-ended", status: "victory", atMs: state.nowMs })]
    };
  }
  return state;
}

export function advanceCombat(
  state: GameState,
  plantConfigs: Record<PlantId, PlantConfig>,
  zombieConfigs: Record<string, ZombieConfig>,
  deltaMs: number,
  difficulty: DifficultyConfig = NORMAL_DIFFICULTY
): GameState {
  const deltaSeconds = deltaMs / 1000;
  const newProjectiles = [...state.projectiles];
  const plants = state.plants.map((plant) => ({ ...plant }));
  const spentPlantIds = new Set<string>();
  let zombies = state.zombies.map((zombie) => ({ ...zombie }));
  const events = state.events.filter((event) => state.nowMs - event.atMs <= EVENT_TTL_MS);
  let sun = state.sun;
  let nextHeroShotAtMs = state.nextHeroShotAtMs;
  let nextBaseSunAtMs = state.nextBaseSunAtMs;
  let mowerLanes = [...state.mowerLanes];
  let runChallenge = state.runChallenge;

  if (state.nowMs >= nextBaseSunAtMs) {
    sun += BASE_SUN_AMOUNT;
    events.push(
      makeEvent({
        type: "sun-produced",
        sourceId: "base-sun",
        lane: state.heroLane,
        column: 0,
        amount: BASE_SUN_AMOUNT,
        atMs: state.nowMs
      })
    );
    nextBaseSunAtMs = state.nowMs + state.baseSunIntervalMs;
  }

  for (const plant of plants) {
    const config = plantConfigs[plant.plantId];
    if (!config.producesSun || state.nowMs < plant.nextSunAtMs) continue;
    sun += 25;
    events.push(
      makeEvent({
        type: "sun-produced",
        sourceId: plant.id,
        lane: plant.lane,
        column: plant.column,
        amount: 25,
        atMs: state.nowMs
      })
    );
    plant.nextSunAtMs = state.nowMs + 5000;
  }

  if (state.nowMs >= nextHeroShotAtMs && zombies.some((zombie) => zombie.lane === state.heroLane)) {
    newProjectiles.push({
      id: nextId("projectile"),
      lane: state.heroLane,
      x: 0.8,
      damage: 14,
      slows: false
    });
    events.push(makeEvent({ type: "hero-fired", sourceId: "hero", lane: state.heroLane, atMs: state.nowMs }));
    nextHeroShotAtMs = state.nowMs + 850;
  }

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
    events.push(
      makeEvent({
        type: "plant-fired",
        sourceId: plant.id,
        lane: plant.lane,
        column: plant.column,
        atMs: state.nowMs
      })
    );
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
    if (projectile.slows) runChallenge = updateChallengeForEvent(runChallenge, { type: "slow-hit" });
    events.push(
      makeEvent({
        type: "zombie-hit",
        targetId: target.id,
        lane: target.lane,
        x: target.x,
        damage: projectile.damage,
        slows: projectile.slows,
        atMs: state.nowMs
      })
    );
    if (projectile.slows) target.slowedUntilMs = state.nowMs + (target.zombieId === "bucket" ? BUCKET_ICE_SLOW_MS : ICE_SLOW_MS);
    if (target.hp <= 0) {
      runChallenge = updateChallengeForEvent(runChallenge, { type: "defeat" });
      events.push(
        makeEvent({
          type: "zombie-defeated",
          targetId: target.id,
          lane: target.lane,
          x: target.x,
          atMs: state.nowMs
        })
      );
    }
  }

  zombies = zombies.filter((zombie) => zombie.hp > 0);

  for (const plant of plants) {
    const config = plantConfigs[plant.plantId];
    if (spentPlantIds.has(plant.id)) continue;
    if (config.armsAfterMs <= 0 || config.damage <= 0) continue;
    if (state.nowMs - plant.plantedAtMs < config.armsAfterMs) continue;
    zombies = zombies.filter((zombie) => zombie.hp > 0);
    const trigger = zombies.find(
      (zombie) =>
        zombie.lane === plant.lane && Math.abs(zombie.x - plant.column) <= POTATO_MINE_TRIGGER_RADIUS_CELLS
    );
    if (!trigger) continue;

    spentPlantIds.add(plant.id);
    events.push(
      makeEvent({
        type: "potato-mine-exploded",
        sourceId: plant.id,
        lane: plant.lane,
        column: plant.column,
        damage: config.damage,
        radiusCells: POTATO_MINE_BLAST_RADIUS_CELLS,
        atMs: state.nowMs
      })
    );

    for (const zombie of zombies) {
      if (zombie.lane !== plant.lane || Math.abs(zombie.x - plant.column) > POTATO_MINE_BLAST_RADIUS_CELLS) continue;
      zombie.hp -= config.damage;
      events.push(
        makeEvent({
          type: "zombie-hit",
          targetId: zombie.id,
          lane: zombie.lane,
          x: zombie.x,
          damage: config.damage,
          slows: false,
          atMs: state.nowMs
        })
      );
      if (zombie.hp <= 0) {
        runChallenge = updateChallengeForEvent(runChallenge, { type: "defeat" });
        events.push(
          makeEvent({
            type: "zombie-defeated",
            targetId: zombie.id,
            lane: zombie.lane,
            x: zombie.x,
            atMs: state.nowMs
          })
        );
      }
    }
  }

  zombies = zombies.filter((zombie) => zombie.hp > 0);
  const runSpeedMultiplier = state.runChallenge?.modifier.adjustments.zombieSpeedMultiplier ?? 1;
  zombies = zombies.map((zombie) => {
    const config = zombieConfigs[zombie.zombieId];
    const blockingPlant = plants.find(
      (plant) =>
        !spentPlantIds.has(plant.id) &&
        plant.lane === zombie.lane &&
        zombie.x <= plant.column + 0.75 &&
        zombie.x >= plant.column - 0.2
    );
    if (blockingPlant) {
      const damage = config.damagePerSecond * deltaSeconds;
      blockingPlant.hp -= damage;
      events.push(
        makeEvent({
          type: "plant-bitten",
          targetId: blockingPlant.id,
          lane: blockingPlant.lane,
          column: blockingPlant.column,
          damage,
          atMs: state.nowMs
        })
      );
      return zombie;
    }
    const slowMultiplier = zombie.slowedUntilMs > state.nowMs ? 0.45 : 1;
    return {
      ...zombie,
      x:
        zombie.x -
        config.speedCellsPerSecond *
          difficulty.zombieSpeedMultiplier *
          runSpeedMultiplier *
          slowMultiplier *
          deltaSeconds
    };
  });

  const triggeredMowerLanes = mowerLanes.filter((lane) => zombies.some((zombie) => zombie.lane === lane && zombie.x <= 0));
  if (triggeredMowerLanes.length > 0) {
    for (const lane of triggeredMowerLanes) {
      const clearedZombies = zombies.filter((zombie) => zombie.lane === lane);
      events.push(
        makeEvent({
          type: "lawn-mower-triggered",
          lane,
          clearedCount: clearedZombies.length,
          atMs: state.nowMs
        })
      );
      for (const zombie of clearedZombies) {
        runChallenge = updateChallengeForEvent(runChallenge, { type: "defeat" });
        events.push(
          makeEvent({
            type: "zombie-defeated",
            targetId: zombie.id,
            lane: zombie.lane,
            x: zombie.x,
            atMs: state.nowMs
          })
        );
      }
    }
    zombies = zombies.filter((zombie) => !triggeredMowerLanes.includes(zombie.lane));
    mowerLanes = mowerLanes.filter((lane) => !triggeredMowerLanes.includes(lane));
  }

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
}
