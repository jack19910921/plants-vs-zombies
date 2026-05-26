import type {
  ColumnIndex,
  GameState,
  LaneIndex,
  LevelConfig,
  PlantConfig,
  PlantId,
  ZombieConfig
} from "./types";

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
