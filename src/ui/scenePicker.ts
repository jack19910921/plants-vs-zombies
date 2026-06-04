import { getSceneThumbnailForScene } from "../game/sceneThumbnails";
import { DEFAULT_SCENE_THEME_ID, SCENE_THEMES } from "../game/sceneThemes";
import type { DifficultyId, SceneThemeId } from "../game/types";

export interface ScenePickerRenderState {
  selectedSceneThemeId?: SceneThemeId;
  difficultyId?: DifficultyId;
  isLoading?: boolean;
}

export const SCENE_PICKER_DIFFICULTY_OPTIONS: Array<{ id: DifficultyId; label: string }> = [
  { id: "easy", label: "轻松" },
  { id: "normal", label: "普通" }
];

function toCssHex(color: number): string {
  return `#${color.toString(16).padStart(6, "0")}`;
}

export function createScenePickerMarkup(state: ScenePickerRenderState): string {
  const selectedSceneThemeId = state.selectedSceneThemeId ?? DEFAULT_SCENE_THEME_ID;
  const selectedTheme = SCENE_THEMES.find((theme) => theme.id === selectedSceneThemeId) ?? SCENE_THEMES[0];
  const pageStyle = [
    `--scene-page-base: ${toCssHex(selectedTheme.presentation.tabletopBaseColor)}`,
    `--scene-page-alt: ${toCssHex(selectedTheme.presentation.tabletopPlankColors[1] ?? selectedTheme.presentation.tabletopBaseColor)}`,
    `--scene-page-shadow: ${toCssHex(selectedTheme.presentation.tabletopShadowColor)}`,
    `--scene-page-accent: ${selectedTheme.presentation.cardAccent}`,
    `--scene-page-ink: ${selectedTheme.presentation.cardInk}`
  ].join("; ");
  const sceneCards = SCENE_THEMES.map((theme) => {
    const selected = theme.id === selectedSceneThemeId ? " is-selected" : "";
    return `<button class="scene-card scene-card--${theme.id}${selected}" data-scene-theme="${theme.id}" style="--scene-card-bg: ${theme.presentation.cardGradient}; --scene-card-image: url('${getSceneThumbnailForScene(theme.id)}'); --scene-card-accent: ${theme.presentation.cardAccent}; --scene-card-ink: ${theme.presentation.cardInk}">
      <span class="scene-card-art"></span>
      <strong>${theme.name}</strong>
      <span>${theme.pickerHint}</span>
    </button>`;
  }).join("");
  const difficultyButtons = SCENE_PICKER_DIFFICULTY_OPTIONS.map((option) => {
    const selected = (state.difficultyId ?? "normal") === option.id ? " is-selected" : "";
    return `<button data-difficulty="${option.id}" class="difficulty-option${selected}">${option.label}</button>`;
  }).join("");
  const loadingAttribute = state.isLoading ? ' disabled aria-busy="true"' : "";
  const startButtonText = state.isLoading ? "正在布置" : "开始守护";
  const announcementText = state.isLoading ? "正在布置菜园…" : selectedTheme.startAnnouncement;

  return `<div class="scene-picker scene-picker--${selectedTheme.id}" style="${pageStyle}">
    <div class="scene-picker-top">
      <div>
        <h1>今天去哪里守护？</h1>
      </div>
      <div class="difficulty-toggle">${difficultyButtons}</div>
    </div>
    <div class="scene-card-grid">${sceneCards}</div>
    <div class="scene-picker-bottom">
      <span>${announcementText}</span>
      <button class="chip scene-start-button" data-action="start-scene"${loadingAttribute}>${startButtonText}</button>
    </div>
  </div>`;
}
