import type { PlantId, ZombieId } from "./types";

export interface AssetCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PlantAssetPresentation {
  crop: AssetCrop;
  cssObjectPosition: string;
  cssBackgroundSize: string;
  cssFilter: string;
  fieldAnchorX: number;
  fieldAnchorY: number;
  fieldOffsetX: number;
  fieldOffsetY: number;
}

export interface ZombieAssetPresentation {
  crop: AssetCrop;
  cssFilter: string;
  fieldOffsetX: number;
  fieldOffsetY: number;
}

export interface SourceCropPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface BoardAssetPresentation {
  crop: AssetCrop;
}

const PLANT_ASSET_PRESENTATION: Record<PlantId, PlantAssetPresentation> = {
  sunflower: {
    crop: { x: 0, y: 0, width: 1, height: 1 },
    cssObjectPosition: "50% 58%",
    cssBackgroundSize: "contain",
    cssFilter: "contrast(1.04) saturate(1.06) brightness(1.02)",
    fieldAnchorX: 0.5,
    fieldAnchorY: 1,
    fieldOffsetX: 0,
    fieldOffsetY: 1
  },
  peashooter: {
    crop: { x: 0, y: 0, width: 1, height: 1 },
    cssObjectPosition: "50% 58%",
    cssBackgroundSize: "contain",
    cssFilter: "contrast(1.04) saturate(1.06) brightness(1.02)",
    fieldAnchorX: 0.5,
    fieldAnchorY: 1,
    fieldOffsetX: 2,
    fieldOffsetY: 1
  },
  wallnut: {
    crop: { x: 0, y: 0, width: 1, height: 1 },
    cssObjectPosition: "50% 60%",
    cssBackgroundSize: "contain",
    cssFilter: "contrast(1.04) saturate(1.04) brightness(1.01)",
    fieldAnchorX: 0.5,
    fieldAnchorY: 1,
    fieldOffsetX: 0,
    fieldOffsetY: 3
  },
  snowpea: {
    crop: { x: 0, y: 0, width: 1, height: 1 },
    cssObjectPosition: "50% 58%",
    cssBackgroundSize: "contain",
    cssFilter: "contrast(1.04) saturate(1.02) brightness(1.04)",
    fieldAnchorX: 0.5,
    fieldAnchorY: 1,
    fieldOffsetX: 2,
    fieldOffsetY: 1
  },
  potatomine: {
    crop: { x: 0, y: 0, width: 1, height: 1 },
    cssObjectPosition: "50% 62%",
    cssBackgroundSize: "contain",
    cssFilter: "contrast(1.04) saturate(1.02) brightness(1.01)",
    fieldAnchorX: 0.5,
    fieldAnchorY: 1,
    fieldOffsetX: 0,
    fieldOffsetY: 4
  }
};

const BOARD_ASSET_PRESENTATION: BoardAssetPresentation = {
  crop: { x: 0.03, y: 0.12, width: 0.94, height: 0.66 }
};

const ZOMBIE_ASSET_PRESENTATION: Record<ZombieId, ZombieAssetPresentation> = {
  basic: {
    crop: { x: 0.06, y: 0.02, width: 0.88, height: 0.94 },
    cssFilter: "contrast(1.06) saturate(1.08) brightness(1.02)",
    fieldOffsetX: 0,
    fieldOffsetY: 0
  },
  cone: {
    crop: { x: 0.05, y: 0, width: 0.9, height: 0.96 },
    cssFilter: "contrast(1.08) saturate(1.08) brightness(1.02)",
    fieldOffsetX: 0,
    fieldOffsetY: 1
  },
  bucket: {
    crop: { x: 0.04, y: 0.02, width: 0.92, height: 0.94 },
    cssFilter: "contrast(1.08) saturate(0.96) brightness(1.04)",
    fieldOffsetX: 0,
    fieldOffsetY: 1
  }
};

export function getPlantAssetPresentation(plantId: PlantId): PlantAssetPresentation {
  return PLANT_ASSET_PRESENTATION[plantId];
}

export function getZombieAssetPresentation(zombieId: ZombieId): ZombieAssetPresentation {
  return ZOMBIE_ASSET_PRESENTATION[zombieId];
}

export function getBoardAssetPresentation(): BoardAssetPresentation {
  return BOARD_ASSET_PRESENTATION;
}

export function getSourceCropPixels(crop: AssetCrop, sourceWidth: number, sourceHeight: number): SourceCropPixels {
  const safeWidth = Math.max(1, sourceWidth);
  const safeHeight = Math.max(1, sourceHeight);
  const x = Math.round(crop.x * safeWidth);
  const y = Math.round(crop.y * safeHeight);
  const width = Math.max(1, Math.min(safeWidth - x, Math.round(crop.width * safeWidth)));
  const height = Math.max(1, Math.min(safeHeight - y, Math.round(crop.height * safeHeight)));

  return { x, y, width, height };
}
