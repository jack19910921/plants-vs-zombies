import type {
  ChallengeObjective,
  DifficultyId,
  GameState,
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

export function getChallengeShortHudLabel(challenge: RunChallengeState): string {
  return challenge.objective.label;
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
  state: Pick<GameState, "sun" | "mowerLanes"> & Partial<Pick<GameState, "status">>
): RunChallengeState | undefined {
  if (!challenge) return undefined;
  const isTerminal = state.status === "victory" || state.status === "failure";
  if (challenge.objective.kind === "mower-protection") {
    const nextCurrent = Math.max(0, state.mowerLanes.length);
    return {
      ...challenge,
      current: nextCurrent,
      completed: isTerminal && nextCurrent >= challenge.objective.target
    };
  }
  if (challenge.objective.kind === "sun-reserve") {
    const nextCurrent = Math.max(0, state.sun);
    return {
      ...challenge,
      current: nextCurrent,
      completed: isTerminal && nextCurrent >= challenge.objective.target
    };
  }
  return challenge;
}
