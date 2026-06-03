import type { GameScene } from "../game/GameScene";
import { getPlantAssetPresentation } from "../game/assetPresentation";
import { SUN_TOKEN_TEXTURE, getPlantTextureForScene } from "../game/assets";
import { PLANTS } from "../game/config";
import { getChallengeHudLabel, getChallengeNudgeText, getChallengeResultLabel } from "../game/runChallenges";
import { DEFAULT_SCENE_THEME_ID, SCENE_THEMES } from "../game/sceneThemes";
import type {
  ColumnIndex,
  CombatEvent,
  DifficultyId,
  GameState,
  LaneIndex,
  LevelConfig,
  PlantId,
  PlantingFailureReason,
  RunChallengeState,
  SceneThemeId
} from "../game/types";
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
  compactWaveText?: string;
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
  inputMode?: "keyboard" | "touch";
  runChallenge?: RunChallengeState | null;
  modifierAnnouncement?: string | null;
  selectedSceneThemeId?: SceneThemeId;
}

export interface DomOverlayOptions {
  soundEnabled?: boolean;
  onToggleSound?: (enabled: boolean) => void;
  reducedMotion?: boolean;
  onToggleMotion?: (enabled: boolean) => void;
}

const plantOrder: PlantId[] = ["sunflower", "peashooter", "wallnut", "snowpea", "potatomine"];
const GAME_VIEWPORT = { width: 1280, height: 720 };
const BOARD_TOUCH_GRID = { x: 148, y: 132, width: 980, height: 388, lanes: 5, columns: 9 };
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

function getPlantCardStyle(plantId: PlantId, sceneThemeId: SceneThemeId = DEFAULT_SCENE_THEME_ID): string {
  const profile = getPlantMiniatureProfile(plantId);
  const assetProfile = getPlantAssetPresentation(plantId);
  return [
    `--plant-rim: ${toCssHex(profile.rimColor)}`,
    `--plant-base: ${toCssHex(profile.baseColor)}`,
    `--plant-stem: ${toCssHex(profile.stemColor)}`,
    `--plant-art: url('${getPlantTextureForScene(sceneThemeId, plantId)}')`,
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
  const isTouchInput = state.inputMode === "touch";
  if (state.status === "victory")
    return state.hasNextLevel ? "守住啦，点“下一关”继续。" : "全部守住啦，点“再玩一次”可以重来。";
  if (state.status === "failure") return "没关系，换个位置再试一次。";
  if (state.status === "paused") return "休息一下，准备好了就继续。";
  if (state.recentEvents?.some((event) => event.type === "wave-spawned")) return "僵尸来了，守住基地！";
  if (isTouchInput && (state.plantsCount ?? 0) > 0) return "点植物卡，再点草坪格子种植。";
  if ((state.plantsCount ?? 0) > 0) return "很好！用 W/S 或方向键移动小队长。";
  if (state.selectedPlantId) return "点草坪格子，把植物放上去。";
  if (isTouchInput) return "点植物卡，再点草坪格子种植。";
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
  const objectiveLabel = state.runChallenge ? getChallengeResultLabel(state.runChallenge) : "";
  const objectiveMarkup = objectiveLabel ? `<span class="objective-result">${objectiveLabel}</span>` : "";

  return `<div class="modal-summary">
        <span>${waveLabel}</span>
        <span>${plantLabel}</span>
        <span>${sunLabel}</span>
        ${objectiveMarkup}
      </div>`;
}

export function getBoardViewportRect(viewportWidth: number, viewportHeight: number): {
  left: number;
  top: number;
  width: number;
  height: number;
} {
  const scale = Math.min(viewportWidth / GAME_VIEWPORT.width, viewportHeight / GAME_VIEWPORT.height);
  const renderedGameWidth = GAME_VIEWPORT.width * scale;
  const renderedGameHeight = GAME_VIEWPORT.height * scale;
  return {
    left: (viewportWidth - renderedGameWidth) / 2 + BOARD_TOUCH_GRID.x * scale,
    top: (viewportHeight - renderedGameHeight) / 2 + BOARD_TOUCH_GRID.y * scale,
    width: BOARD_TOUCH_GRID.width * scale,
    height: BOARD_TOUCH_GRID.height * scale
  };
}

function getBoardTouchGridMarkup(): string {
  const cells: string[] = [];
  for (let lane = 0; lane < BOARD_TOUCH_GRID.lanes; lane += 1) {
    for (let column = 0; column < BOARD_TOUCH_GRID.columns; column += 1) {
      cells.push(
        `<button class="board-touch-cell" data-board-lane="${lane}" data-board-column="${column}" aria-label="在第 ${lane + 1} 行第 ${column + 1} 列种植"></button>`
      );
    }
  }
  return `<div class="board-touch-grid" aria-label="草坪种植格">${cells.join("")}</div>`;
}

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

function getSceneName(sceneThemeId?: SceneThemeId): string | null {
  if (!sceneThemeId) return null;
  return SCENE_THEMES.find((theme) => theme.id === sceneThemeId)?.name ?? null;
}

export function createDomOverlayMarkup(state: OverlayRenderState): string {
  if (state.status === "menu") return getScenePickerMarkup(state);

  const allowedPlantIds = new Set(state.allowedPlantIds ?? plantOrder);
  const selectedSceneThemeId = state.selectedSceneThemeId ?? DEFAULT_SCENE_THEME_ID;
  const cards = plantOrder
    .map((plantId) => {
      const plant = PLANTS[plantId];
      const locked = !allowedPlantIds.has(plantId);
      const disabled = locked || state.nowMs < state.cooldownReadyAt[plantId] ? "disabled" : "";
      const selected = state.selectedPlantId === plantId ? " is-selected" : "";
      const lockedClass = locked ? " is-locked" : "";
      const cardStyle = getPlantCardStyle(plantId, selectedSceneThemeId);
      return `<button class="plant-card plant-card--${plantId}${selected}${lockedClass}" data-plant="${plantId}" style="${cardStyle}" ${disabled}>
        <span class="plant-art"></span>
        <strong>${plant.name}</strong>
        <span class="plant-cost">${locked ? "未开放" : `<span class="sun-icon sun-icon--small"></span>${plant.cost}`}</span>
      </button>`;
    })
    .join("");
  const objectiveNudge =
    state.runChallenge && state.status === "playing" && !state.modifierAnnouncement
      ? getChallengeNudgeText(state.runChallenge)
      : "";
  const tutorialText = (state.modifierAnnouncement ?? objectiveNudge) || getTutorialText(state);
  const soundEnabled = state.soundEnabled ?? true;
  const reducedMotion = state.reducedMotion ?? false;
  const difficultyId = state.difficultyId ?? "normal";
  const sceneName = getSceneName(state.selectedSceneThemeId);
  const waveTitle = sceneName ?? state.levelName;
  const waveLabel = waveTitle ? `${waveTitle} · ${state.waveText}` : state.waveText;
  const objectiveMarkup = state.runChallenge
    ? `<div class="chip objective-chip">${getChallengeHudLabel(state.runChallenge)}</div>`
    : "";
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
      <div class="chip wave-chip" data-short-label="${state.compactWaveText ?? state.waveText}">${waveLabel}</div>
      ${objectiveMarkup}
      <div class="difficulty-toggle">${difficultyButtons}</div>
      <button class="chip" data-action="pause">暂停</button>
      <button class="chip sound-toggle" data-action="sound" data-short-label="${soundEnabled ? "音开" : "音关"}" aria-label="${soundEnabled ? "声音开启" : "声音关闭"}">${soundEnabled ? "声音开" : "声音关"}</button>
      <button class="chip motion-toggle" data-action="motion" data-short-label="${reducedMotion ? "柔和" : "动效"}" aria-label="${reducedMotion ? "动效柔和" : "动效正常"}">${reducedMotion ? "动效柔和" : "动效正常"}</button>
    </div>
    <div class="tutorial-strip"><span>${tutorialText}</span>${feedbackMarkup}</div>
    ${getBoardTouchGridMarkup()}
    <div class="lane-controls" aria-label="小队长移动">
      <button class="lane-button" data-action="lane-up" aria-label="小队长上移">↑</button>
      <button class="lane-button" data-action="lane-down" aria-label="小队长下移">↓</button>
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

function getCompactWaveText(state: GameState, level: LevelConfig): string {
  const spawned = state.spawnedWaveIndexes.length;
  return `第 ${Math.min(spawned + 1, level.waves.length)}/${level.waves.length} 波`;
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
  const rootElement = root as HTMLElement;
  const rootWindow = root.ownerDocument?.defaultView ?? (typeof window !== "undefined" ? window : null);

  function updateBoardTouchBounds(): void {
    if (!rootElement.style || !rootWindow) return;
    const rect = getBoardViewportRect(rootWindow.innerWidth, rootWindow.innerHeight);
    rootElement.style.setProperty("--board-left", `${rect.left}px`);
    rootElement.style.setProperty("--board-top", `${rect.top}px`);
    rootElement.style.setProperty("--board-width", `${rect.width}px`);
    rootElement.style.setProperty("--board-height", `${rect.height}px`);
  }

  function getInputMode(): "keyboard" | "touch" {
    return rootWindow?.matchMedia?.("(pointer: coarse)").matches ? "touch" : "keyboard";
  }

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
    const challengeScene = scene as GameScene & {
      getCurrentRunChallenge?: () => RunChallengeState | null;
      getCurrentModifierAnnouncement?: () => string | null;
      getCurrentSceneTheme?: () => { id: SceneThemeId };
    };
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
      compactWaveText: getCompactWaveText(state, level),
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
      recentEvents: state.events,
      inputMode: getInputMode(),
      runChallenge: challengeScene.getCurrentRunChallenge?.() ?? null,
      modifierAnnouncement: challengeScene.getCurrentModifierAnnouncement?.() ?? null,
      selectedSceneThemeId: state.sceneThemeId ?? challengeScene.getCurrentSceneTheme?.().id ?? DEFAULT_SCENE_THEME_ID
    });
    if (nextMarkup === lastMarkup) return;
    root.innerHTML = nextMarkup;
    lastMarkup = nextMarkup;
    updateBoardTouchBounds();
  }

  scene.uiEvents.on("state-changed", render);
  scene.uiEvents.on("feedback-changed", (feedback: OverlayPlantingFeedback) => {
    showFeedback(feedback);
    if (lastState) render(lastState);
  });
  root.addEventListener("pointerdown", (event) => {
    const target = event.target as HTMLElement;
    const sceneButton = target.closest("[data-scene-theme]") as HTMLElement | null;
    if (sceneButton) {
      event.preventDefault();
      event.stopPropagation();
      const sceneActions = scene as GameScene & { setSelectedSceneTheme?: (sceneThemeId: SceneThemeId) => void };
      sceneActions.setSelectedSceneTheme?.(sceneButton.dataset.sceneTheme as SceneThemeId);
      return;
    }
    const plantButton = target.closest("[data-plant]") as HTMLElement | null;
    if (plantButton) {
      event.preventDefault();
      event.stopPropagation();
      scene.setSelectedPlant(plantButton.dataset.plant as PlantId);
      return;
    }
    const boardCell = target.closest("[data-board-lane][data-board-column]") as HTMLElement | null;
    if (boardCell) {
      event.preventDefault();
      event.stopPropagation();
      scene.plantAtCell(
        Number(boardCell.dataset.boardLane) as LaneIndex,
        Number(boardCell.dataset.boardColumn) as ColumnIndex
      );
    }
  });
  root.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    const actionButton = target.closest("[data-action]") as HTMLElement | null;
    if (actionButton?.dataset.action === "start-scene") {
      const sceneActions = scene as GameScene & { startSelectedScene?: () => void };
      sceneActions.startSelectedScene?.();
      return;
    }
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
  updateBoardTouchBounds();
  rootWindow?.addEventListener("resize", updateBoardTouchBounds);
  rootWindow?.addEventListener("orientationchange", updateBoardTouchBounds);
}
