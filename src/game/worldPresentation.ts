import type { PlantId, ZombieId } from "./types";

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
}

export interface SunPickupPresentation {
  coinColor: number;
  rimColor: number;
  glintColor: number;
  textColor: string;
  alpha: number;
  coinRadius: number;
  haloRadius: number;
}

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
        sparkleColor: 0xffffff
      }
    : {
        trailColor: 0xa6e56f,
        trailAlpha: 0.3,
        glowColor: 0xf4ffd0,
        glowRadius: 12,
        coreColor: 0x7edb65,
        coreRadius: 10,
        rimColor: 0x315f3a,
        sparkleColor: 0xffffe4
      };
}

export function getSunPickupPresentation(progress: number): SunPickupPresentation {
  const safeProgress = Math.max(0, Math.min(1, progress));
  const alpha = 1 - safeProgress;

  return {
    coinColor: 0xffd34f,
    rimColor: 0xa56c21,
    glintColor: 0xfff8df,
    textColor: "#6d4615",
    alpha,
    coinRadius: 14 - safeProgress * 4,
    haloRadius: 20 + safeProgress * 18
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
