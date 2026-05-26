import type { GameScene } from "../game/GameScene";
import { PLANT_TEXTURES } from "../game/assets";
import { LEVEL_ONE, PLANTS } from "../game/config";
import type { CombatEvent, GameState, PlantId, PlantingFailureReason } from "../game/types";

export interface OverlayPlantingFeedback {
  type: "planting";
  reason: PlantingFailureReason | "outside-board";
}

interface OverlayRenderState {
  sun: number;
  waveText: string;
  status: GameState["status"];
  selectedPlantId: PlantId | null;
  cooldownReadyAt: GameState["cooldownReadyAt"];
  nowMs: number;
  plantsCount?: number;
  recentFeedback?: OverlayPlantingFeedback | null;
  recentEvents?: CombatEvent[];
}

const plantOrder: PlantId[] = ["sunflower", "peashooter", "wallnut", "snowpea", "potatomine"];

const plantingFeedbackText: Record<OverlayPlantingFeedback["reason"], string> = {
  "no-selection": "先选一张植物卡片。",
  occupied: "这个格子已经有植物啦。",
  "not-enough-sun": "阳光不够，等向日葵产阳光。",
  cooldown: "这张卡还在准备。",
  "outside-board": "点彩色草坪格子来种植物。"
};

function getTutorialText(state: OverlayRenderState): string {
  if (state.status === "victory") return "守住啦，点“再玩一次”可以重来。";
  if (state.status === "failure") return "没关系，换个位置再试一次。";
  if (state.status === "paused") return "休息一下，准备好了就继续。";
  if (state.recentEvents?.some((event) => event.type === "wave-spawned")) return "僵尸来了，守住基地！";
  if ((state.plantsCount ?? 0) > 0) return "很好！用 W/S 或方向键移动小队长。";
  if (state.selectedPlantId) return "点草坪格子，把植物放上去。";
  return "先选一张植物卡片。";
}

export function createDomOverlayMarkup(state: OverlayRenderState): string {
  const cards = plantOrder
    .map((plantId) => {
      const plant = PLANTS[plantId];
      const disabled = state.nowMs < state.cooldownReadyAt[plantId] ? "disabled" : "";
      const selected = state.selectedPlantId === plantId ? " is-selected" : "";
      return `<button class="plant-card${selected}" data-plant="${plantId}" ${disabled}>
        <span class="plant-art" style="background-image: url('${PLANT_TEXTURES[plantId]}')"></span>
        <strong>${plant.name}</strong>
        <span>☀ ${plant.cost}</span>
      </button>`;
    })
    .join("");
  const tutorialText = getTutorialText(state);
  const feedbackText = state.recentFeedback ? plantingFeedbackText[state.recentFeedback.reason] : "";
  const feedbackMarkup = feedbackText ? `<span class="feedback-pill">${feedbackText}</span>` : "";

  const modalClass =
    state.status === "paused" || state.status === "victory" || state.status === "failure"
      ? "modal-layer is-visible"
      : "modal-layer";
  const modalTitle = state.status === "victory" ? "守住啦！" : state.status === "failure" ? "差一点点" : "暂停";
  const modalBody =
    state.status === "victory"
      ? "获得本关植物奖章。"
      : state.status === "failure"
        ? "草坪防线被突破了，再试一次。"
        : "植物防线先休息一下。";
  const modalAction = state.status === "paused" ? "pause" : "restart";
  const modalButtonText = state.status === "paused" ? "继续" : "再玩一次";

  return `<div class="hud">
    <div class="hud-top">
      <div class="chip">☀ ${state.sun}</div>
      <div class="chip">${state.waveText}</div>
      <button class="chip" data-action="pause">暂停</button>
    </div>
    <div class="tutorial-strip"><span>${tutorialText}</span>${feedbackMarkup}</div>
    <div class="plant-tray">${cards}</div>
  </div>
  <div class="${modalClass}">
    <section class="modal">
      <h2>${modalTitle}</h2>
      <p>${modalBody}</p>
      <button class="chip" data-action="${modalAction}">${modalButtonText}</button>
    </section>
  </div>`;
}

function getWaveText(state: GameState): string {
  const spawned = state.spawnedWaveIndexes.length;
  return `第 ${Math.min(spawned + 1, LEVEL_ONE.waves.length)} 波 / ${LEVEL_ONE.waves.length}`;
}

export function createDomOverlay(root: Element, scene: GameScene): void {
  let lastMarkup = "";
  let lastState: GameState | null = null;
  let recentFeedback: OverlayPlantingFeedback | null = null;
  let feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  function render(state: GameState): void {
    lastState = state;
    const nextMarkup = createDomOverlayMarkup({
      sun: state.sun,
      waveText: getWaveText(state),
      status: state.status,
      selectedPlantId: state.selectedPlantId,
      cooldownReadyAt: state.cooldownReadyAt,
      nowMs: state.nowMs,
      plantsCount: state.plants.length,
      recentFeedback,
      recentEvents: state.events
    });
    if (nextMarkup === lastMarkup) return;
    root.innerHTML = nextMarkup;
    lastMarkup = nextMarkup;
  }

  scene.uiEvents.on("state-changed", render);
  scene.uiEvents.on("feedback-changed", (feedback: OverlayPlantingFeedback) => {
    recentFeedback = feedback;
    if (feedbackTimer) clearTimeout(feedbackTimer);
    feedbackTimer = setTimeout(() => {
      recentFeedback = null;
      if (lastState) render(lastState);
    }, 1800);
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
    if (actionButton?.dataset.action === "restart") {
      scene.restartLevel();
    }
  });
}
