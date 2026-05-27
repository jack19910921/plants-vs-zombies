import type { GameScene } from "../game/GameScene";
import { getPlantAssetPresentation } from "../game/assetPresentation";
import { PLANT_TEXTURES, SUN_TOKEN_TEXTURE } from "../game/assets";
import { PLANTS } from "../game/config";
import type { CombatEvent, DifficultyId, GameState, LevelConfig, PlantId, PlantingFailureReason } from "../game/types";
import { getPlantMiniatureProfile } from "../game/worldPresentation";

export interface OverlayPlantingFeedback {
  type: "planting";
  reason: PlantingFailureReason | "outside-board" | "locked";
}

export type AchievementId = "first-plant" | "first-sun" | "first-zombie-defeated";

export interface OverlayAchievementFeedback {
  type: "achievement";
  achievement: AchievementId;
}

export type OverlayFeedback = OverlayPlantingFeedback | OverlayAchievementFeedback;

interface OverlayRenderState {
  sun: number;
  levelName?: string;
  waveText: string;
  status: GameState["status"];
  selectedPlantId: PlantId | null;
  cooldownReadyAt: GameState["cooldownReadyAt"];
  nowMs: number;
  allowedPlantIds?: PlantId[];
  difficultyId?: DifficultyId;
  soundEnabled?: boolean;
  reducedMotion?: boolean;
  hasNextLevel?: boolean;
  plantsCount?: number;
  spawnedWaveCount?: number;
  totalWaveCount?: number;
  recentFeedback?: OverlayFeedback | null;
  recentEvents?: CombatEvent[];
}

export interface DomOverlayOptions {
  soundEnabled?: boolean;
  onToggleSound?: (enabled: boolean) => void;
  reducedMotion?: boolean;
  onToggleMotion?: (enabled: boolean) => void;
}

const plantOrder: PlantId[] = ["sunflower", "peashooter", "wallnut", "snowpea", "potatomine"];
const difficultyOptions: Array<{ id: DifficultyId; label: string }> = [
  { id: "easy", label: "轻松" },
  { id: "normal", label: "普通" }
];

const plantingFeedbackText: Record<OverlayPlantingFeedback["reason"], string> = {
  "no-selection": "先选一张植物卡片。",
  occupied: "这个格子已经有植物啦。",
  "not-enough-sun": "阳光不够，等向日葵或基地补给。",
  cooldown: "这张卡还在准备。",
  "outside-board": "点彩色草坪格子来种植物。",
  locked: "这株植物下一关再用。"
};

const achievementFeedbackText: Record<AchievementId, string> = {
  "first-plant": "种得好，防线开始啦！",
  "first-sun": "收集到阳光，可以继续种植物。",
  "first-zombie-defeated": "打倒一个了，继续守住基地！"
};

function toCssHex(color: number): string {
  return `#${color.toString(16).padStart(6, "0")}`;
}

function getPlantCardStyle(plantId: PlantId): string {
  const profile = getPlantMiniatureProfile(plantId);
  const assetProfile = getPlantAssetPresentation(plantId);
  return [
    `--plant-rim: ${toCssHex(profile.rimColor)}`,
    `--plant-base: ${toCssHex(profile.baseColor)}`,
    `--plant-stem: ${toCssHex(profile.stemColor)}`,
    `--plant-art: url('${PLANT_TEXTURES[plantId]}')`,
    `--plant-position: ${assetProfile.cssObjectPosition}`,
    `--plant-size: ${assetProfile.cssBackgroundSize}`,
    `--plant-filter: ${assetProfile.cssFilter}`
  ].join("; ");
}

export function getNextAchievementFeedback(
  state: Pick<GameState, "plants" | "events">,
  shownAchievements: ReadonlySet<string>
): OverlayAchievementFeedback | null {
  if (state.plants.length > 0 && !shownAchievements.has("first-plant")) {
    return { type: "achievement", achievement: "first-plant" };
  }
  if (state.events.some((event) => event.type === "sun-produced") && !shownAchievements.has("first-sun")) {
    return { type: "achievement", achievement: "first-sun" };
  }
  if (
    state.events.some((event) => event.type === "zombie-defeated") &&
    !shownAchievements.has("first-zombie-defeated")
  ) {
    return { type: "achievement", achievement: "first-zombie-defeated" };
  }
  return null;
}

function getTutorialText(state: OverlayRenderState): string {
  if (state.status === "victory")
    return state.hasNextLevel ? "守住啦，点“下一关”继续。" : "全部守住啦，点“再玩一次”可以重来。";
  if (state.status === "failure") return "没关系，换个位置再试一次。";
  if (state.status === "paused") return "休息一下，准备好了就继续。";
  if (state.recentEvents?.some((event) => event.type === "wave-spawned")) return "僵尸来了，守住基地！";
  if ((state.plantsCount ?? 0) > 0) return "很好！用 W/S 或方向键移动小队长。";
  if (state.selectedPlantId) return "点草坪格子，把植物放上去。";
  return "先选一张植物卡片。";
}

function getTerminalSummaryMarkup(state: OverlayRenderState): string {
  if (state.status !== "victory" && state.status !== "failure") return "";
  if (state.spawnedWaveCount === undefined || state.totalWaveCount === undefined) return "";

  const waveLabel =
    state.status === "victory"
      ? `守住 ${state.spawnedWaveCount}/${state.totalWaveCount} 波`
      : `守到 ${state.spawnedWaveCount}/${state.totalWaveCount} 波`;
  const plantLabel = `剩余植物 ${state.plantsCount ?? 0}`;
  const sunLabel = `阳光 ${state.sun}`;

  return `<div class="modal-summary">
        <span>${waveLabel}</span>
        <span>${plantLabel}</span>
        <span>${sunLabel}</span>
      </div>`;
}

export function createDomOverlayMarkup(state: OverlayRenderState): string {
  const allowedPlantIds = new Set(state.allowedPlantIds ?? plantOrder);
  const cards = plantOrder
    .map((plantId) => {
      const plant = PLANTS[plantId];
      const locked = !allowedPlantIds.has(plantId);
      const disabled = locked || state.nowMs < state.cooldownReadyAt[plantId] ? "disabled" : "";
      const selected = state.selectedPlantId === plantId ? " is-selected" : "";
      const lockedClass = locked ? " is-locked" : "";
      const cardStyle = getPlantCardStyle(plantId);
      return `<button class="plant-card plant-card--${plantId}${selected}${lockedClass}" data-plant="${plantId}" style="${cardStyle}" ${disabled}>
        <span class="plant-art"></span>
        <strong>${plant.name}</strong>
        <span class="plant-cost">${locked ? "未开放" : `<span class="sun-icon sun-icon--small"></span>${plant.cost}`}</span>
      </button>`;
    })
    .join("");
  const tutorialText = getTutorialText(state);
  const soundEnabled = state.soundEnabled ?? true;
  const reducedMotion = state.reducedMotion ?? false;
  const difficultyId = state.difficultyId ?? "normal";
  const waveLabel = state.levelName ? `${state.levelName} · ${state.waveText}` : state.waveText;
  const difficultyButtons = difficultyOptions
    .map((option) => {
      const selected = difficultyId === option.id ? " is-selected" : "";
      return `<button data-difficulty="${option.id}" class="difficulty-option${selected}">${option.label}</button>`;
    })
    .join("");
  const feedbackText =
    state.recentFeedback?.type === "planting"
      ? plantingFeedbackText[state.recentFeedback.reason]
      : state.recentFeedback?.type === "achievement"
        ? achievementFeedbackText[state.recentFeedback.achievement]
        : "";
  const feedbackMarkup = feedbackText ? `<span class="feedback-pill">${feedbackText}</span>` : "";

  const modalClass =
    state.status === "paused" || state.status === "victory" || state.status === "failure"
      ? "modal-layer is-visible"
      : "modal-layer";
  const modalTitle =
    state.status === "victory" ? (state.hasNextLevel ? "守住啦！" : "全部守住啦！") : state.status === "failure" ? "差一点点" : "暂停";
  const modalBody =
    state.status === "victory"
      ? state.hasNextLevel
        ? "获得本关植物奖章。"
        : "当前三关都守住了，可以再玩一次。"
      : state.status === "failure"
        ? "草坪防线被突破了，再试一次。"
        : "植物防线先休息一下。";
  const terminalAction = state.status === "victory" && state.hasNextLevel ? "next-level" : "restart";
  const modalButtonAction = state.status === "paused" ? "pause" : terminalAction;
  const modalButtonText = state.status === "paused" ? "继续" : terminalAction === "next-level" ? "下一关" : "再玩一次";
  const modalSummary = getTerminalSummaryMarkup(state);

  return `<div class="hud" style="--sun-art: url('${SUN_TOKEN_TEXTURE}')">
    <div class="hud-top">
      <div class="chip sun-chip"><span class="sun-icon"></span><span>${state.sun}</span></div>
      <div class="chip">${waveLabel}</div>
      <div class="difficulty-toggle">${difficultyButtons}</div>
      <button class="chip" data-action="pause">暂停</button>
      <button class="chip sound-toggle" data-action="sound">${soundEnabled ? "声音开" : "声音关"}</button>
      <button class="chip motion-toggle" data-action="motion">${reducedMotion ? "动效柔和" : "动效正常"}</button>
    </div>
    <div class="tutorial-strip"><span>${tutorialText}</span>${feedbackMarkup}</div>
    <div class="lane-controls" aria-label="小队长移动">
      <button class="lane-button" data-action="lane-up" aria-label="小队长上移">上移</button>
      <button class="lane-button" data-action="lane-down" aria-label="小队长下移">下移</button>
    </div>
    <div class="plant-tray">${cards}</div>
  </div>
  <div class="${modalClass}">
    <section class="modal">
      <h2>${modalTitle}</h2>
      <p>${modalBody}</p>
      ${modalSummary}
      <button class="chip" data-action="${modalButtonAction}">${modalButtonText}</button>
    </section>
  </div>`;
}

function getWaveText(state: GameState, level: LevelConfig): string {
  const spawned = state.spawnedWaveIndexes.length;
  return `第 ${Math.min(spawned + 1, level.waves.length)} 波 / ${level.waves.length}`;
}

export function createDomOverlay(root: Element, scene: GameScene, options: DomOverlayOptions = {}): void {
  let lastMarkup = "";
  let lastState: GameState | null = null;
  let recentFeedback: OverlayFeedback | null = null;
  let feedbackTimer: ReturnType<typeof setTimeout> | null = null;
  let soundEnabled = options.soundEnabled ?? true;
  let reducedMotion = options.reducedMotion ?? false;
  const shownAchievements = new Set<AchievementId>();
  const queuedFeedback: OverlayAchievementFeedback[] = [];

  function showFeedback(feedback: OverlayFeedback): void {
    recentFeedback = feedback;
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => {
      recentFeedback = null;
      const nextFeedback = queuedFeedback.shift();
      if (nextFeedback) {
        showFeedback(nextFeedback);
      }
      if (lastState) render(lastState);
    }, 1800);
  }

  function render(state: GameState): void {
    lastState = state;
    const level = scene.getCurrentLevel();
    if (!recentFeedback) {
      const achievementFeedback = getNextAchievementFeedback(state, shownAchievements);
      if (achievementFeedback) {
        shownAchievements.add(achievementFeedback.achievement);
        showFeedback(achievementFeedback);
      }
    } else {
      const achievementFeedback = getNextAchievementFeedback(state, shownAchievements);
      if (achievementFeedback) {
        shownAchievements.add(achievementFeedback.achievement);
        queuedFeedback.push(achievementFeedback);
      }
    }
    const nextMarkup = createDomOverlayMarkup({
      sun: state.sun,
      levelName: level.name,
      waveText: getWaveText(state, level),
      status: state.status,
      selectedPlantId: state.selectedPlantId,
      cooldownReadyAt: state.cooldownReadyAt,
      nowMs: state.nowMs,
      allowedPlantIds: level.allowedPlants,
      difficultyId: scene.getCurrentDifficultyId(),
      soundEnabled,
      reducedMotion,
      hasNextLevel: scene.hasNextLevel(),
      plantsCount: state.plants.length,
      spawnedWaveCount: state.spawnedWaveIndexes.length,
      totalWaveCount: level.waves.length,
      recentFeedback,
      recentEvents: state.events
    });
    if (nextMarkup === lastMarkup) return;
    root.innerHTML = nextMarkup;
    lastMarkup = nextMarkup;
  }

  scene.uiEvents.on("state-changed", render);
  scene.uiEvents.on("feedback-changed", (feedback: OverlayPlantingFeedback) => {
    showFeedback(feedback);
    if (lastState) render(lastState);
  });
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
      return;
    }
    if (actionButton?.dataset.action === "lane-up") {
      scene.moveHeroLane(-1);
      return;
    }
    if (actionButton?.dataset.action === "lane-down") {
      scene.moveHeroLane(1);
      return;
    }
    if (actionButton?.dataset.action === "sound") {
      soundEnabled = !soundEnabled;
      options.onToggleSound?.(soundEnabled);
      if (lastState) render(lastState);
      return;
    }
    if (actionButton?.dataset.action === "motion") {
      reducedMotion = !reducedMotion;
      options.onToggleMotion?.(reducedMotion);
      if (lastState) render(lastState);
      return;
    }
    if (actionButton?.dataset.action === "restart") {
      scene.restartLevel();
      return;
    }
    if (actionButton?.dataset.action === "next-level") {
      scene.nextLevel();
      return;
    }
    const difficultyButton = target.closest("[data-difficulty]") as HTMLElement | null;
    if (difficultyButton) {
      scene.setDifficulty(difficultyButton.dataset.difficulty as DifficultyId);
    }
  });
}
