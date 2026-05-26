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
