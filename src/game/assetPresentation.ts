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
  cssFilter: string;
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

const PLANT_ASSET_PRESENTATION: Record<PlantId, PlantAssetPresentation> = {
  sunflower: {
    crop: { x: 0.08, y: 0.04, width: 0.84, height: 0.88 },
    cssObjectPosition: "50% 48%",
    cssFilter: "contrast(1.08) saturate(1.16) brightness(1.02)",
    fieldOffsetX: 0,
    fieldOffsetY: -2
  },
  peashooter: {
    crop: { x: 0.1, y: 0.12, width: 0.8, height: 0.76 },
    cssObjectPosition: "48% 52%",
    cssFilter: "contrast(1.1) saturate(1.14) brightness(1.02)",
    fieldOffsetX: 1,
    fieldOffsetY: 1
  },
  wallnut: {
    crop: { x: 0.06, y: 0.16, width: 0.88, height: 0.72 },
    cssObjectPosition: "52% 58%",
    cssFilter: "contrast(1.12) saturate(1.08) brightness(0.98)",
    fieldOffsetX: 0,
    fieldOffsetY: 4
  },
  snowpea: {
    crop: { x: 0.08, y: 0.1, width: 0.84, height: 0.78 },
    cssObjectPosition: "48% 54%",
    cssFilter: "contrast(1.1) saturate(1.05) brightness(1.04)",
    fieldOffsetX: 1,
    fieldOffsetY: 1
  },
  potatomine: {
    crop: { x: 0.04, y: 0.2, width: 0.92, height: 0.68 },
    cssObjectPosition: "50% 62%",
    cssFilter: "contrast(1.12) saturate(1.02) brightness(0.98)",
    fieldOffsetX: 0,
    fieldOffsetY: 5
  }
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

export function getSourceCropPixels(crop: AssetCrop, sourceWidth: number, sourceHeight: number): SourceCropPixels {
  const safeWidth = Math.max(1, sourceWidth);
  const safeHeight = Math.max(1, sourceHeight);
  const x = Math.round(crop.x * safeWidth);
  const y = Math.round(crop.y * safeHeight);
  const width = Math.max(1, Math.min(safeWidth - x, Math.round(crop.width * safeWidth)));
  const height = Math.max(1, Math.min(safeHeight - y, Math.round(crop.height * safeHeight)));

  return { x, y, width, height };
}
