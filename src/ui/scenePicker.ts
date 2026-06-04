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

interface SceneCardArtPalette {
  sky: string;
  ground: string;
  groundAlt: string;
  boardFrame: string;
  boardBase: string;
  boardStroke: string;
  tileColors: [string, string, string, string];
}

const SCENE_CARD_ART: Record<SceneThemeId, SceneCardArtPalette> = {
  "sunny-lawn": {
    sky: "#fff0a8",
    ground: "#96cf66",
    groundAlt: "#7fba45",
    boardFrame: "#7a5132",
    boardBase: "#b7814e",
    boardStroke: "#fff8df",
    tileColors: ["#83bf43", "#9bd45b", "#78b53d", "#a8dc69"]
  },
  "dewy-garden": {
    sky: "#c9f2ec",
    ground: "#8bd6a2",
    groundAlt: "#70be91",
    boardFrame: "#3f6f67",
    boardBase: "#a4c68f",
    boardStroke: "#daf8ff",
    tileColors: ["#7fcf9b", "#9be4c4", "#70be91", "#b9ecd3"]
  },
  "starlight-farm": {
    sky: "#596184",
    ground: "#78b67c",
    groundAlt: "#5f966c",
    boardFrame: "#38435f",
    boardBase: "#596184",
    boardStroke: "#fff1a3",
    tileColors: ["#6ea96f", "#82bd85", "#5f966c", "#91c99a"]
  }
};

function getSceneCardDecoration(sceneThemeId: SceneThemeId): string {
  if (sceneThemeId === "sunny-lawn") {
    return `<g stroke="#ffd34f" stroke-width="5" stroke-linecap="round">
        <line x1="282" y1="14" x2="282" y2="2" />
        <line x1="282" y1="70" x2="282" y2="82" />
        <line x1="254" y1="42" x2="242" y2="42" />
        <line x1="310" y1="42" x2="322" y2="42" />
      </g>
      <circle cx="282" cy="42" r="22" fill="#ffd34f" stroke="#d9932f" stroke-width="4" />
      <circle cx="274" cy="34" r="6" fill="#fff8df" opacity="0.74" />`;
  }

  if (sceneThemeId === "dewy-garden") {
    return `<g fill="#daf8ff" stroke="#5faec6" stroke-width="3" opacity="0.92">
        <circle cx="76" cy="34" r="10" />
        <circle cx="112" cy="58" r="7" />
        <circle cx="292" cy="42" r="8" />
      </g>`;
  }

  return `<g fill="#fff1a3" stroke="#bdefff" stroke-width="2">
      <polygon points="76,28 82,42 97,42 85,51 90,66 76,57 62,66 67,51 55,42 70,42" />
      <polygon points="292,28 297,39 309,40 300,47 304,59 292,52 281,59 285,47 276,40 288,39" />
      <circle cx="132" cy="42" r="4" />
      <circle cx="324" cy="70" r="3" />
    </g>`;
}

function getSceneCardArtMarkup(sceneThemeId: SceneThemeId): string {
  const palette = SCENE_CARD_ART[sceneThemeId];
  const tiles = Array.from({ length: 45 }, (_, index) => {
    const column = index % 9;
    const row = Math.floor(index / 9);
    const x = 59 + column * 30;
    const y = 84 + row * 19;
    const fill = palette.tileColors[index % palette.tileColors.length];

    return `<rect x="${x}" y="${y}" width="27" height="16" rx="2" fill="${fill}" />`;
  }).join("");

  return `<svg class="scene-card-art-svg" viewBox="0 0 360 220" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <rect width="360" height="96" fill="${palette.sky}" />
      <rect y="92" width="360" height="128" fill="${palette.ground}" />
      <path d="M0 96 C74 86 132 104 210 94 C282 86 326 89 360 98 L360 220 L0 220 Z" fill="${palette.groundAlt}" opacity="0.56" />
      ${getSceneCardDecoration(sceneThemeId)}
      <ellipse cx="184" cy="188" rx="148" ry="18" fill="#263238" opacity="0.22" />
      <g transform="rotate(-1 180 130)">
        <rect x="40" y="78" width="292" height="128" rx="8" fill="#263238" opacity="0.2" />
        <rect x="36" y="64" width="292" height="128" rx="8" fill="${palette.boardFrame}" />
        <rect x="36" y="174" width="292" height="18" rx="8" fill="#263238" opacity="0.28" />
        <rect x="46" y="74" width="272" height="108" rx="5" fill="${palette.boardBase}" />
        <rect x="46" y="74" width="272" height="22" rx="5" fill="${palette.boardStroke}" opacity="0.14" />
        ${tiles}
        <rect x="46" y="74" width="272" height="108" rx="5" fill="none" stroke="${palette.boardStroke}" stroke-width="3" opacity="0.38" />
      </g>
      <rect x="10" y="10" width="340" height="200" rx="8" fill="none" stroke="${palette.boardStroke}" stroke-width="3" opacity="0.42" />
    </svg>`;
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
    return `<button class="scene-card scene-card--${theme.id}${selected}" data-scene-theme="${theme.id}" style="--scene-card-bg: ${theme.presentation.cardGradient}; --scene-card-accent: ${theme.presentation.cardAccent}; --scene-card-ink: ${theme.presentation.cardInk}">
      <span class="scene-card-art">${getSceneCardArtMarkup(theme.id)}</span>
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
