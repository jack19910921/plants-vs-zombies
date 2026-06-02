import type { PlantId, SceneDecorationKind, ZombieId } from "./types";

export interface PlantMiniatureProfile {
  imageWidth: number;
  imageHeight: number;
  baseWidth: number;
  baseHeight: number;
  stemWidth: number;
  stemHeight: number;
  stemColor: number;
  baseColor: number;
  rimColor: number;
  highlightAlpha: number;
}

export interface PlantMiniatureState {
  bodyXOffset: number;
  bodyYOffset: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  shadowScaleX: number;
  shadowScaleY: number;
  shadowAlpha: number;
  flashAlpha: number;
  highlightAlpha: number;
}

export interface ZombieMiniatureState {
  bodyXOffset: number;
  bodyYOffset: number;
  scaleX: number;
  scaleY: number;
  angle: number;
  shadowScaleX: number;
  shadowScaleY: number;
  shadowAlpha: number;
  flashAlpha: number;
  footOffset: number;
}

export interface ZombieMiniatureProfile {
  imageWidth: number;
  imageHeight: number;
  shadowWidth: number;
  shadowHeight: number;
  backingWidth: number;
  backingHeight: number;
  rimWidth: number;
  rimHeight: number;
  footWidth: number;
  footHeight: number;
  tintColor: number;
  backingColor: number;
  rimColor: number;
  slowAuraRadius: number;
  headgear: "none" | "cone" | "bucket";
  headgearColor: number;
  headgearStrokeColor: number;
  headgearWidth: number;
  headgearHeight: number;
  headgearYOffset: number;
}

export interface HealthWearState {
  damageRatio: number;
  crackCount: number;
  crackAlpha: number;
  scuffAlpha: number;
  dangerAlpha: number;
}

export interface ProjectilePresentation {
  trailColor: number;
  trailAlpha: number;
  glowColor: number;
  glowRadius: number;
  coreColor: number;
  coreRadius: number;
  rimColor: number;
  sparkleColor: number;
  imageWidth: number;
  imageHeight: number;
  shadowWidth: number;
  shadowHeight: number;
  trailParticleCount: number;
}

export interface SunPickupPresentation {
  coinColor: number;
  rimColor: number;
  glintColor: number;
  textColor: string;
  alpha: number;
  coinRadius: number;
  haloRadius: number;
  tokenSize: number;
  rotationDeg: number;
  sparkleCount: number;
  sparkleRadius: number;
  sparkleAlpha: number;
  beamAlpha: number;
}

export interface HeroPeashooterPresentation {
  imageKey: "plant-peashooter";
  imageWidth: number;
  imageHeight: number;
  bodyYOffset: number;
  angle: number;
  shadowWidth: number;
  shadowHeight: number;
  ringWidth: number;
  ringHeight: number;
  muzzleOffsetX: number;
  muzzleOffsetY: number;
  glossAlpha: number;
  glowAlpha: number;
}

export interface ProjectileParticleState {
  offsetX: number;
  offsetY: number;
  radius: number;
  alpha: number;
  rotationDeg: number;
}

export interface GrassTileMotionState {
  cellWashAlpha: number;
  topHighlightAlpha: number;
  bottomShadowAlpha: number;
  ridgeAlpha: number;
  shimmerAlpha: number;
  shimmerXRatio: number;
  shimmerWidthRatio: number;
  bladeAlpha: number;
  bladeLeanX: number;
  bladeYOffset: number;
}

export interface GrassFleckMotionState {
  xRatio: number;
  yRatio: number;
  width: number;
  height: number;
  alpha: number;
  driftX: number;
  driftY: number;
  rotationDeg: number;
}

export interface SceneDecorationState {
  xRatio: number;
  yRatio: number;
  size: number;
  alpha: number;
  rotationDeg: number;
}

const GRASS_FLECK_COUNT = 18;
const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

const PLANT_MINIATURE_PROFILES: Record<PlantId, PlantMiniatureProfile> = {
  sunflower: {
    imageWidth: 74,
    imageHeight: 84,
    baseWidth: 64,
    baseHeight: 20,
    stemWidth: 12,
    stemHeight: 38,
    stemColor: 0x2e7d55,
    baseColor: 0x8f5d32,
    rimColor: 0x35513f,
    highlightAlpha: 0.26
  },
  peashooter: {
    imageWidth: 84,
    imageHeight: 74,
    baseWidth: 66,
    baseHeight: 20,
    stemWidth: 13,
    stemHeight: 32,
    stemColor: 0x2e7d55,
    baseColor: 0x8f5d32,
    rimColor: 0x35513f,
    highlightAlpha: 0.2
  },
  wallnut: {
    imageWidth: 90,
    imageHeight: 72,
    baseWidth: 82,
    baseHeight: 22,
    stemWidth: 16,
    stemHeight: 14,
    stemColor: 0x8f5d32,
    baseColor: 0xb48a4a,
    rimColor: 0x5c4330,
    highlightAlpha: 0.18
  },
  snowpea: {
    imageWidth: 84,
    imageHeight: 74,
    baseWidth: 66,
    baseHeight: 20,
    stemWidth: 13,
    stemHeight: 32,
    stemColor: 0x478da0,
    baseColor: 0x9fd7ef,
    rimColor: 0x3f6f86,
    highlightAlpha: 0.24
  },
  potatomine: {
    imageWidth: 82,
    imageHeight: 56,
    baseWidth: 62,
    baseHeight: 18,
    stemWidth: 18,
    stemHeight: 8,
    stemColor: 0x8f5d32,
    baseColor: 0xb48a4a,
    rimColor: 0x6d4b2b,
    highlightAlpha: 0.16
  }
};

const ZOMBIE_MINIATURE_PROFILES: Record<ZombieId, ZombieMiniatureProfile> = {
  basic: {
    imageWidth: 58,
    imageHeight: 92,
    shadowWidth: 70,
    shadowHeight: 19,
    backingWidth: 64,
    backingHeight: 72,
    rimWidth: 60,
    rimHeight: 68,
    footWidth: 26,
    footHeight: 9,
    tintColor: 0xffffff,
    backingColor: 0x1f2e2b,
    rimColor: 0x3f504d,
    slowAuraRadius: 44,
    headgear: "none",
    headgearColor: 0xffffff,
    headgearStrokeColor: 0x3f504d,
    headgearWidth: 0,
    headgearHeight: 0,
    headgearYOffset: 0
  },
  cone: {
    imageWidth: 56,
    imageHeight: 102,
    shadowWidth: 74,
    shadowHeight: 20,
    backingWidth: 66,
    backingHeight: 78,
    rimWidth: 62,
    rimHeight: 73,
    footWidth: 27,
    footHeight: 9,
    tintColor: 0xffd0a6,
    backingColor: 0x2b3029,
    rimColor: 0x7b4a24,
    slowAuraRadius: 46,
    headgear: "cone",
    headgearColor: 0xf59f42,
    headgearStrokeColor: 0x8b4f1f,
    headgearWidth: 38,
    headgearHeight: 42,
    headgearYOffset: -48
  },
  bucket: {
    imageWidth: 64,
    imageHeight: 100,
    shadowWidth: 82,
    shadowHeight: 22,
    backingWidth: 72,
    backingHeight: 76,
    rimWidth: 68,
    rimHeight: 72,
    footWidth: 30,
    footHeight: 10,
    tintColor: 0xc7d2d6,
    backingColor: 0x223033,
    rimColor: 0x60747a,
    slowAuraRadius: 48,
    headgear: "bucket",
    headgearColor: 0xaebbc1,
    headgearStrokeColor: 0x60747a,
    headgearWidth: 42,
    headgearHeight: 22,
    headgearYOffset: -44
  }
};

export function getPlantMiniatureProfile(plantId: PlantId): PlantMiniatureProfile {
  return PLANT_MINIATURE_PROFILES[plantId];
}

export function getZombieMiniatureProfile(zombieId: ZombieId): ZombieMiniatureProfile {
  return ZOMBIE_MINIATURE_PROFILES[zombieId];
}

export function getHeroPeashooterPresentation(nowMs: number, firePulse: number): HeroPeashooterPresentation {
  const safeFirePulse = Math.max(0, Math.min(1, firePulse));
  const idle = Math.sin(nowMs / 360);
  const breathe = Math.sin(nowMs / 520);

  return {
    imageKey: "plant-peashooter",
    imageWidth: 96 + safeFirePulse * 5 + breathe * 2,
    imageHeight: 80 - safeFirePulse * 2 + idle * 2,
    bodyYOffset: -4 + idle * 3 - safeFirePulse * 3,
    angle: -3 + Math.sin(nowMs / 480) * 2 - safeFirePulse * 5,
    shadowWidth: 84 + safeFirePulse * 12,
    shadowHeight: 20 - safeFirePulse * 2,
    ringWidth: 86 + safeFirePulse * 6,
    ringHeight: 24 + safeFirePulse * 2,
    muzzleOffsetX: 39 + safeFirePulse * 10,
    muzzleOffsetY: -15 + idle * 2,
    glossAlpha: 0.28 + safeFirePulse * 0.16,
    glowAlpha: safeFirePulse * 0.52
  };
}

export function getProjectilePresentation(slows: boolean): ProjectilePresentation {
  return slows
    ? {
        trailColor: 0xbdefff,
        trailAlpha: 0.34,
        glowColor: 0xe8fbff,
        glowRadius: 15,
        coreColor: 0x8fe7ff,
        coreRadius: 10,
        rimColor: 0x3f6f86,
        sparkleColor: 0xffffff,
        imageWidth: 31,
        imageHeight: 31,
        shadowWidth: 32,
        shadowHeight: 9,
        trailParticleCount: 6
      }
    : {
        trailColor: 0xa6e56f,
        trailAlpha: 0.3,
        glowColor: 0xf4ffd0,
        glowRadius: 12,
        coreColor: 0x7edb65,
        coreRadius: 10,
        rimColor: 0x315f3a,
        sparkleColor: 0xffffe4,
        imageWidth: 38,
        imageHeight: 28,
        shadowWidth: 36,
        shadowHeight: 8,
        trailParticleCount: 5
      };
}

export function getProjectileParticleState(slows: boolean, index: number, nowMs: number): ProjectileParticleState {
  const count = slows ? 6 : 5;
  const safeIndex = Math.max(0, Math.min(count - 1, index));
  const progress = count <= 1 ? 0 : safeIndex / (count - 1);
  const shimmer = 0.5 + Math.sin(nowMs / 96 + safeIndex * 1.37) * 0.5;

  return {
    offsetX: -10 - safeIndex * (slows ? 8 : 7),
    offsetY: Math.sin(nowMs / 124 + safeIndex * 1.18) * (slows ? 4.5 : 3.2),
    radius: (slows ? 5.6 : 5) * (1 - progress * 0.5) + shimmer * 1.2,
    alpha: (slows ? 0.36 : 0.32) * (1 - progress * 0.82) * (0.72 + shimmer * 0.28),
    rotationDeg: (nowMs / (slows ? 9 : 12) + safeIndex * 28) % 360
  };
}

export function getSunPickupPresentation(progress: number): SunPickupPresentation {
  const safeProgress = Math.max(0, Math.min(1, progress));
  const alpha = 1 - safeProgress;
  const coinRadius = 14 - safeProgress * 4;
  const haloRadius = 20 + safeProgress * 18;

  return {
    coinColor: 0xffd34f,
    rimColor: 0xa56c21,
    glintColor: 0xfff8df,
    textColor: "#6d4615",
    alpha,
    coinRadius,
    haloRadius,
    tokenSize: coinRadius * 2.9 + alpha * 4,
    rotationDeg: safeProgress * 260,
    sparkleCount: 9,
    sparkleRadius: 18 + safeProgress * 30,
    sparkleAlpha: alpha * (0.62 + safeProgress * 0.18),
    beamAlpha: alpha * 0.28
  };
}

export function getGrassTileMotionState(nowMs: number, lane: number, column: number): GrassTileMotionState {
  const safeLane = Math.max(0, lane);
  const safeColumn = Math.max(0, column);
  const laneDepth = clamp(safeLane / 4, 0, 1);
  const breathe = 0.5 + Math.sin(nowMs / 1120 + safeLane * 0.82 + safeColumn * 0.47) * 0.5;
  const gust = 0.5 + Math.sin(nowMs / 680 + safeColumn * 0.58 - safeLane * 0.34) * 0.5;
  const shimmerSweep = (nowMs / 2600 + safeColumn * 0.113 + safeLane * 0.067) % 1;

  return {
    cellWashAlpha: 0.018 + laneDepth * 0.014 + breathe * 0.018,
    topHighlightAlpha: 0.046 + (1 - laneDepth) * 0.028 + gust * 0.026,
    bottomShadowAlpha: 0.04 + laneDepth * 0.042 + (1 - breathe) * 0.018,
    ridgeAlpha: 0.045 + laneDepth * 0.024,
    shimmerAlpha: 0.018 + gust * 0.054,
    shimmerXRatio: -0.42 + shimmerSweep * 0.84,
    shimmerWidthRatio: 0.24 + (safeColumn % 3) * 0.035 + gust * 0.04,
    bladeAlpha: 0.14 + breathe * 0.14,
    bladeLeanX: Math.sin(nowMs / 520 + safeColumn * 0.9 + safeLane * 0.52) * 7,
    bladeYOffset: Math.sin(nowMs / 760 + safeLane * 0.7 + safeColumn * 0.19) * 3
  };
}

export function getGrassFleckCount(): number {
  return GRASS_FLECK_COUNT;
}

export function getGrassFleckMotionState(nowMs: number, index: number): GrassFleckMotionState {
  const safeIndex = Math.max(0, index);
  const baseX = 0.06 + (((safeIndex * 37) % 88) / 100);
  const baseY = 0.08 + (((safeIndex * 53) % 84) / 100);
  const phase = nowMs / 940 + safeIndex * 0.74;
  const shimmer = 0.5 + Math.sin(phase) * 0.5;
  const drift = Math.sin(nowMs / 1640 + safeIndex * 1.31);

  return {
    xRatio: clamp(baseX + drift * 0.014, 0.04, 0.96),
    yRatio: clamp(baseY + Math.cos(nowMs / 1380 + safeIndex * 0.9) * 0.012, 0.06, 0.94),
    width: 5 + (safeIndex % 4) * 1.8 + shimmer * 1.2,
    height: 1.8 + (safeIndex % 3) * 0.7 + shimmer * 0.6,
    alpha: 0.035 + shimmer * 0.078,
    driftX: drift * 8,
    driftY: Math.sin(nowMs / 1180 + safeIndex * 0.52) * 3,
    rotationDeg: -16 + ((safeIndex * 29) % 32) + Math.sin(phase) * 5
  };
}

export function getSceneDecorationCount(kind: SceneDecorationKind): number {
  if (kind === "sun-rays") return 8;
  if (kind === "dew-beads") return 16;
  return 14;
}

export function getSceneDecorationState(kind: SceneDecorationKind, nowMs: number, index: number): SceneDecorationState {
  const safeIndex = Math.max(0, index);
  const count = getSceneDecorationCount(kind);
  const phase = nowMs / (kind === "sun-rays" ? 1500 : kind === "dew-beads" ? 980 : 1180) + safeIndex * 0.71;
  const shimmer = 0.5 + Math.sin(phase) * 0.5;
  const xRatio = clamp(0.08 + (((safeIndex * 31) % 86) / 100), 0.02, 0.98);
  const yRatio = clamp(0.08 + (((safeIndex * 47) % 82) / 100), 0.04, 0.96);

  if (kind === "sun-rays") {
    return {
      xRatio: clamp(0.12 + (safeIndex / Math.max(1, count - 1)) * 0.76, 0, 1),
      yRatio: clamp(0.08 + Math.sin(phase) * 0.035, 0, 1),
      size: 26 + shimmer * 16,
      alpha: 0.08 + shimmer * 0.14,
      rotationDeg: -18 + safeIndex * 5
    };
  }

  if (kind === "dew-beads") {
    return {
      xRatio,
      yRatio,
      size: 5 + (safeIndex % 4) * 2 + shimmer * 2,
      alpha: 0.2 + shimmer * 0.28,
      rotationDeg: nowMs / 28 + safeIndex * 31
    };
  }

  return {
    xRatio,
    yRatio,
    size: 8 + (safeIndex % 3) * 4 + shimmer * 5,
    alpha: 0.16 + shimmer * 0.34,
    rotationDeg: nowMs / 18 + safeIndex * 37
  };
}

export function getHealthWearState(currentHp: number, maxHp: number): HealthWearState {
  if (maxHp <= 0) {
    return {
      damageRatio: 0,
      crackCount: 0,
      crackAlpha: 0,
      scuffAlpha: 0,
      dangerAlpha: 0
    };
  }

  const healthRatio = Math.max(0, Math.min(1, currentHp / maxHp));
  const damageRatio = 1 - healthRatio;
  const crackCount = damageRatio < 0.25 ? 0 : damageRatio < 0.65 ? 2 : 4;

  return {
    damageRatio,
    crackCount,
    crackAlpha: crackCount === 0 ? 0 : 0.28 + damageRatio * 0.38,
    scuffAlpha: crackCount === 0 ? 0 : 0.18 + damageRatio * 0.3,
    dangerAlpha: healthRatio > 0.35 ? 0 : (0.35 - healthRatio) / 0.35
  };
}

export function getPlantMiniatureState(
  nowMs: number,
  lane: number,
  column: number,
  firePulse: number,
  hitPulse: number
): PlantMiniatureState {
  const bob = Math.sin(nowMs / 280 + column * 0.7) * 4;
  const shake = hitPulse * Math.sin(nowMs / 18) * 5;

  return {
    bodyXOffset: shake - firePulse * 8,
    bodyYOffset: -5 + bob - firePulse * 2 + hitPulse * 3,
    scaleX: 1 + firePulse * 0.03 + hitPulse * 0.1,
    scaleY: 1 + firePulse * 0.12 - hitPulse * 0.12,
    angle: Math.sin(nowMs / 420 + lane) * 4 - firePulse * 7 + hitPulse * Math.sin(nowMs / 24) * 3,
    shadowScaleX: 1 + firePulse * 0.12 + hitPulse * 0.18,
    shadowScaleY: 1 - firePulse * 0.04 + hitPulse * 0.04,
    shadowAlpha: 0.24 + firePulse * 0.04 + hitPulse * 0.08,
    flashAlpha: hitPulse * 0.5,
    highlightAlpha: 0.2 + firePulse * 0.14
  };
}

export function getZombieMiniatureState(
  nowMs: number,
  x: number,
  chewing: boolean,
  hitPulse: number
): ZombieMiniatureState {
  const shuffle = Math.sin(nowMs / 180 + x) * 4;
  const chewLunge = chewing ? -Math.abs(Math.sin(nowMs / 75)) * 7 : 0;
  const hitRecoil = hitPulse * 12;

  return {
    bodyXOffset: chewLunge + hitRecoil,
    bodyYOffset: -4 + shuffle - (chewing ? 1.5 : 0) + hitPulse * 2,
    scaleX: 1 + (chewing ? 0.06 : 0) + hitPulse * 0.08,
    scaleY: 1 - (chewing ? 0.04 : 0) - hitPulse * 0.1,
    angle: chewing ? Math.sin(nowMs / 90) * 5 : Math.sin(nowMs / 240 + x) * 2,
    shadowScaleX: 1 + (chewing ? 0.18 : 0) + hitPulse * 0.14,
    shadowScaleY: 1 + (chewing ? 0.06 : 0) + hitPulse * 0.02,
    shadowAlpha: 0.24 + (chewing ? 0.05 : 0) + hitPulse * 0.08,
    flashAlpha: hitPulse * 0.5,
    footOffset: Math.sin(nowMs / 160 + x) * 4
  };
}
