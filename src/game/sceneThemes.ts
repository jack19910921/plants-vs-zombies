import type { ScenePresentationConfig, SceneRuleAdjustments, SceneThemeId } from "./types";

export interface SceneThemeConfig {
  id: SceneThemeId;
  name: string;
  shortName: string;
  pickerHint: string;
  hudHint: string;
  startAnnouncement: string;
  adjustments: SceneRuleAdjustments;
  presentation: ScenePresentationConfig;
}

export const DEFAULT_SCENE_THEME_ID: SceneThemeId = "sunny-lawn";

export const SCENE_THEMES: SceneThemeConfig[] = [
  {
    id: "sunny-lawn",
    name: "阳光草坪",
    shortName: "草坪",
    pickerHint: "标准草坪，先玩一局",
    hudHint: "标准草坪",
    startAnnouncement: "阳光草坪：标准开局",
    adjustments: {},
    presentation: {
      tabletopBaseColor: 0xeebf7a,
      tabletopPlankColors: [0xe8ad68, 0xf0c07b, 0xe4a45f, 0xf3c889],
      tabletopShadowColor: 0x5c4330,
      boardMatColor: 0x7aa86b,
      boardFrameColor: 0x68482e,
      boardInsetColor: 0xf1cc86,
      boardArtAlpha: 0.98,
      laneWashColor: 0xffffff,
      tileWashColor: 0xbde26c,
      tileHighlightColor: 0xfff8df,
      tileShadowColor: 0x174a36,
      fleckColor: 0xfff8df,
      fleckAltColor: 0xc6ec82,
      cardGradient: "linear-gradient(180deg, #fff0a8 0%, #fff0a8 42%, #96cf66 42%, #96cf66 100%)",
      cardAccent: "#ffd34f",
      cardInk: "#5c4330",
      decoration: "sun-rays"
    }
  },
  {
    id: "dewy-garden",
    name: "露珠菜园",
    shortName: "菜园",
    pickerHint: "露珠亮，第一波晚",
    hudHint: "第一波晚一点",
    startAnnouncement: "露珠菜园：第一波晚一点",
    adjustments: { firstWaveDelayMs: 3500 },
    presentation: {
      tabletopBaseColor: 0xcbbf8d,
      tabletopPlankColors: [0xbfdba8, 0xd8e9ba, 0xaed6c6, 0xe4d59c],
      tabletopShadowColor: 0x45655f,
      boardMatColor: 0x83b99f,
      boardFrameColor: 0x3f6f67,
      boardInsetColor: 0xcfe5b8,
      boardArtAlpha: 0.93,
      laneWashColor: 0xdaf8ff,
      tileWashColor: 0x8ed7a4,
      tileHighlightColor: 0xe8fbff,
      tileShadowColor: 0x2d6b5f,
      fleckColor: 0xdaf8ff,
      fleckAltColor: 0x9be4c4,
      cardGradient: "linear-gradient(180deg, #c9f2ec 0%, #c9f2ec 42%, #8bd6a2 42%, #8bd6a2 100%)",
      cardAccent: "#9fd7ef",
      cardInk: "#31595c",
      decoration: "dew-beads"
    }
  },
  {
    id: "starlight-farm",
    name: "星光农圃",
    shortName: "星光",
    pickerHint: "星光慢，阳光少点",
    hudHint: "敌人慢一点",
    startAnnouncement: "星光农圃：敌人慢一点，阳光少一点",
    adjustments: { zombieSpeedMultiplier: 0.9, startingSunDelta: -25 },
    presentation: {
      tabletopBaseColor: 0x6f6a88,
      tabletopPlankColors: [0x5f6384, 0x77709a, 0x687c8d, 0x8a7a9d],
      tabletopShadowColor: 0x263238,
      boardMatColor: 0x627f62,
      boardFrameColor: 0x38435f,
      boardInsetColor: 0x596184,
      boardArtAlpha: 0.91,
      laneWashColor: 0xdff2ff,
      tileWashColor: 0x78b67c,
      tileHighlightColor: 0xfff1a3,
      tileShadowColor: 0x263238,
      fleckColor: 0xfff1a3,
      fleckAltColor: 0xbdefff,
      cardGradient: "linear-gradient(180deg, #596184 0%, #596184 42%, #78b67c 42%, #78b67c 100%)",
      cardAccent: "#bdefff",
      cardInk: "#4b3f5f",
      decoration: "star-glints"
    }
  }
];

export function getSceneTheme(sceneThemeId: SceneThemeId): SceneThemeConfig {
  return SCENE_THEMES.find((theme) => theme.id === sceneThemeId) ?? SCENE_THEMES[0];
}
