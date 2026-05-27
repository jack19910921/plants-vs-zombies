export type SeedPacketFlipMode = "select" | "plant";

export interface SeedPacketFlipState {
  visible: boolean;
  opacity: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
  y: number;
  shineOpacity: number;
  shineX: number;
  shineRotationZ: number;
}

export interface GardenToolState {
  visible: boolean;
  rotationZ: number;
  rotationY: number;
  scale: number;
  y: number;
}

export interface WaveWarningStakeState {
  visible: boolean;
  opacity: number;
  rotationZ: number;
  scale: number;
  y: number;
  beaconOpacity: number;
  beaconScale: number;
  flagGlow: number;
}

export interface SunTrailParticleState {
  visible: boolean;
  opacity: number;
  x: number;
  y: number;
  z: number;
  scale: number;
  haloScale: number;
  shimmerOpacity: number;
  rotationZ: number;
}

export interface PotatoMineShockwaveState {
  visible: boolean;
  opacity: number;
  flashOpacity: number;
  ringScale: number;
  x: number;
  y: number;
  z: number;
  scale: number;
  rotationZ: number;
}

export interface PlantingSparkState {
  visible: boolean;
  opacity: number;
  warmOpacity: number;
  x: number;
  y: number;
  z: number;
  scale: number;
  rotationZ: number;
}

export type StatusBadgeMode = "victory" | "failure";

export interface StatusBadgeState {
  visible: boolean;
  opacity: number;
  scale: number;
  y: number;
  rotationY: number;
  rotationZ: number;
  materialIntensity: number;
  particleVisible: boolean;
  particleOpacity: number;
  particleX: number;
  particleY: number;
  particleZ: number;
  particleScale: number;
  particleRotationZ: number;
}

export type ToyGardenPropKind = "terracotta-pot" | "watering-can" | "seed-crate" | "pebble" | "plant-label";
export type ToyGardenMaterialFamily = "ceramic" | "metal" | "wood" | "stone" | "leaf";

export interface ToyGardenPropProfile {
  id: string;
  kind: ToyGardenPropKind;
  materialFamily: ToyGardenMaterialFamily;
  x: number;
  y: number;
  z: number;
  scale: number;
  rotationZ: number;
  primaryColor: number;
  secondaryColor: number;
}

const SEED_PACKET_FLIP_MS = 720;
const GARDEN_TOOL_PULSE_MS = 620;
const WAVE_WARNING_STAKE_MS = 860;
const SUN_TRAIL_PARTICLE_MS = 760;
const SUN_TRAIL_PARTICLE_DELAY_MS = 48;
const POTATO_MINE_SHOCKWAVE_MS = 680;
const POTATO_MINE_DEBRIS_DELAY_MS = 32;
const STATUS_BADGE_MS = 5000;
const STATUS_BADGE_PARTICLE_MS = 1180;
const STATUS_BADGE_PARTICLE_DELAY_MS = 58;
const PLANTING_SPARK_MS = 620;
const PLANTING_SPARK_DELAY_MS = 26;

const TOY_GARDEN_PROP_PROFILES: ToyGardenPropProfile[] = [
  {
    id: "left-clay-pot",
    kind: "terracotta-pot",
    materialFamily: "ceramic",
    x: -1.1,
    y: -0.68,
    z: -0.24,
    scale: 0.34,
    rotationZ: -0.08,
    primaryColor: 0xc87545,
    secondaryColor: 0x5f3a24
  },
  {
    id: "right-clay-pot",
    kind: "terracotta-pot",
    materialFamily: "ceramic",
    x: 0.44,
    y: -0.84,
    z: -0.28,
    scale: 0.24,
    rotationZ: 0.1,
    primaryColor: 0xd58b58,
    secondaryColor: 0x6a4127
  },
  {
    id: "mint-watering-can",
    kind: "watering-can",
    materialFamily: "metal",
    x: 1.05,
    y: -0.58,
    z: -0.26,
    scale: 0.32,
    rotationZ: -0.1,
    primaryColor: 0x8fc9c2,
    secondaryColor: 0x4d8f92
  },
  {
    id: "seed-crate",
    kind: "seed-crate",
    materialFamily: "wood",
    x: 0.98,
    y: 0.55,
    z: -0.32,
    scale: 0.33,
    rotationZ: 0.08,
    primaryColor: 0x9a6638,
    secondaryColor: 0x5b3b22
  },
  {
    id: "left-pebble",
    kind: "pebble",
    materialFamily: "stone",
    x: -0.78,
    y: 0.58,
    z: -0.34,
    scale: 0.18,
    rotationZ: 0.22,
    primaryColor: 0xb7aaa0,
    secondaryColor: 0x756a62
  },
  {
    id: "top-pebble",
    kind: "pebble",
    materialFamily: "stone",
    x: -0.44,
    y: 0.68,
    z: -0.34,
    scale: 0.14,
    rotationZ: -0.18,
    primaryColor: 0xd0c4b3,
    secondaryColor: 0x81746a
  },
  {
    id: "sprout-label",
    kind: "plant-label",
    materialFamily: "wood",
    x: 0.36,
    y: 0.72,
    z: -0.3,
    scale: 0.25,
    rotationZ: -0.18,
    primaryColor: 0xffe3a4,
    secondaryColor: 0x7a5834
  },
  {
    id: "leaf-marker",
    kind: "plant-label",
    materialFamily: "leaf",
    x: -1.18,
    y: 0.12,
    z: -0.31,
    scale: 0.2,
    rotationZ: 0.2,
    primaryColor: 0x7fcf72,
    secondaryColor: 0x315f3a
  }
];

export function getToyGardenPropProfiles(): ToyGardenPropProfile[] {
  return TOY_GARDEN_PROP_PROFILES.map((profile) => ({ ...profile }));
}

export function getSeedPacketFlipState(ageMs: number, mode: SeedPacketFlipMode): SeedPacketFlipState {
  if (ageMs < 0 || ageMs > SEED_PACKET_FLIP_MS) {
    return {
      visible: false,
      opacity: 0,
      rotationY: 0,
      rotationZ: 0,
      scale: 0.1,
      y: 0,
      shineOpacity: 0,
      shineX: -0.36,
      shineRotationZ: -0.42
    };
  }

  const progress = ageMs / SEED_PACKET_FLIP_MS;
  const pop = Math.sin(progress * Math.PI);
  const strength = mode === "plant" ? 1.18 : 1;
  const shineProgress = Math.min(1, Math.max(0, (progress - 0.08) / 0.76));
  const shinePeak = Math.sin(shineProgress * Math.PI);

  return {
    visible: true,
    opacity: Math.max(0, 1 - progress * 0.25),
    rotationY: (1 - progress) * Math.PI * 1.35,
    rotationZ: (mode === "plant" ? -0.16 : 0.12) + pop * 0.18,
    scale: 0.72 + pop * 0.34 * strength,
    y: -0.15 + pop * 0.24 * strength,
    shineOpacity: shinePeak * (mode === "plant" ? 0.74 : 0.58),
    shineX: -0.34 + shineProgress * 0.68,
    shineRotationZ: -0.42
  };
}

export function getGardenToolState(nowMs: number, pulseStartedAt: number): GardenToolState {
  const idle = Math.sin(nowMs / 880);
  const pulseAge = (nowMs - pulseStartedAt) / GARDEN_TOOL_PULSE_MS;
  const pulse = pulseAge >= 0 && pulseAge <= 1 ? Math.sin(pulseAge * Math.PI) : 0;

  return {
    visible: true,
    rotationZ: -0.42 + idle * 0.04 - pulse * 0.42,
    rotationY: 0.18 + idle * 0.08 + pulse * 0.36,
    scale: 0.88 + pulse * 0.1,
    y: -0.28 + idle * 0.03 + pulse * 0.14
  };
}

export function getWaveWarningStakeState(ageMs: number): WaveWarningStakeState {
  if (ageMs < 0 || ageMs > WAVE_WARNING_STAKE_MS) {
    return {
      visible: false,
      opacity: 0,
      rotationZ: 0,
      scale: 0.1,
      y: 0,
      beaconOpacity: 0,
      beaconScale: 0.1,
      flagGlow: 0
    };
  }

  const progress = ageMs / WAVE_WARNING_STAKE_MS;
  const pop = Math.sin(progress * Math.PI);
  const wobble = Math.sin(progress * Math.PI * 5);
  const beaconFlicker = 0.76 + Math.sin(progress * Math.PI * 7) * 0.18;

  return {
    visible: true,
    opacity: Math.max(0, 1 - progress * 0.16),
    rotationZ: wobble * 0.16,
    scale: 0.55 + pop * 0.48,
    y: -0.42 + pop * 0.16,
    beaconOpacity: Math.max(0, pop * beaconFlicker),
    beaconScale: 0.22 + pop * 1.04,
    flagGlow: 0.32 + pop * 0.62
  };
}

export function getSunTrailParticleState(ageMs: number, index: number): SunTrailParticleState {
  const particleIndex = Math.max(0, index);
  const localAge = ageMs - particleIndex * SUN_TRAIL_PARTICLE_DELAY_MS;
  const startX = 1.04 - (particleIndex % 3) * 0.14;
  const startY = -0.7 + (particleIndex % 2) * 0.18;
  const startZ = -0.1 + (particleIndex % 4) * 0.04;

  if (ageMs < 0 || localAge < 0 || localAge > SUN_TRAIL_PARTICLE_MS) {
    return {
      visible: false,
      opacity: 0,
      x: startX,
      y: startY,
      z: startZ,
      scale: 0.1,
      haloScale: 0.1,
      shimmerOpacity: 0,
      rotationZ: particleIndex * 0.4
    };
  }

  const progress = localAge / SUN_TRAIL_PARTICLE_MS;
  const eased = 1 - (1 - progress) ** 3;
  const arc = Math.sin(progress * Math.PI) * (0.28 + (particleIndex % 3) * 0.04);
  const fadeIn = Math.min(1, progress * 5 + 0.18);
  const fadeOut = Math.max(0, 1 - Math.max(0, progress - 0.58) / 0.42);

  return {
    visible: true,
    opacity: fadeIn * fadeOut,
    x: startX * (1 - eased),
    y: startY * (1 - eased) + arc,
    z: startZ * (1 - eased) + Math.sin(progress * Math.PI * 2 + particleIndex) * 0.04,
    scale: 0.42 + Math.sin(progress * Math.PI) * 0.42,
    haloScale: 0.58 + Math.sin(progress * Math.PI) * (0.52 + (particleIndex % 2) * 0.1),
    shimmerOpacity:
      (0.18 + Math.sin(progress * Math.PI) ** 2 * 0.82) *
      (0.72 + Math.sin(progress * Math.PI * 3 + particleIndex) * 0.18) *
      fadeOut *
      0.62,
    rotationZ: particleIndex * 0.4 + progress * Math.PI * 1.6
  };
}

export function getPlantingSparkState(ageMs: number, index: number): PlantingSparkState {
  const particleIndex = Math.max(0, index);
  const localAge = ageMs - particleIndex * PLANTING_SPARK_DELAY_MS;
  const angle = -Math.PI * 0.82 + particleIndex * 1.18;
  const startRadius = 0.04 + (particleIndex % 3) * 0.012;

  if (ageMs < 0 || localAge < 0 || localAge > PLANTING_SPARK_MS) {
    return {
      visible: false,
      opacity: 0,
      warmOpacity: 0,
      x: Math.cos(angle) * startRadius,
      y: -0.04,
      z: Math.sin(angle) * startRadius * 0.2,
      scale: 0.1,
      rotationZ: angle
    };
  }

  const progress = localAge / PLANTING_SPARK_MS;
  const eased = 1 - (1 - progress) ** 3;
  const lift = Math.sin(progress * Math.PI) * (0.16 + (particleIndex % 3) * 0.025);
  const spread = startRadius + eased * (0.32 + (particleIndex % 4) * 0.035);
  const fadeIn = Math.min(1, progress * 8 + 0.2);
  const fadeOut = Math.max(0, 1 - Math.max(0, progress - 0.44) / 0.56);
  const opacity = fadeIn * fadeOut;

  return {
    visible: true,
    opacity,
    warmOpacity: Math.max(0, 1 - progress * 1.4) * 0.72,
    x: Math.cos(angle) * spread,
    y: -0.08 + lift,
    z: Math.sin(angle) * spread * 0.18,
    scale: 0.28 + Math.sin(progress * Math.PI) * 0.3,
    rotationZ: angle + progress * Math.PI * 1.1
  };
}

export function getPotatoMineShockwaveState(ageMs: number, index: number): PotatoMineShockwaveState {
  const particleIndex = Math.max(0, index);
  const localAge = ageMs - particleIndex * POTATO_MINE_DEBRIS_DELAY_MS;
  const angle = -Math.PI / 2 + particleIndex * 1.37;
  const startRadius = 0.08 + (particleIndex % 3) * 0.018;

  if (ageMs < 0 || localAge < 0 || localAge > POTATO_MINE_SHOCKWAVE_MS) {
    return {
      visible: false,
      opacity: 0,
      flashOpacity: 0,
      ringScale: 0.28,
      x: Math.cos(angle) * startRadius,
      y: Math.sin(angle) * startRadius,
      z: -0.05,
      scale: 0.1,
      rotationZ: angle
    };
  }

  const progress = localAge / POTATO_MINE_SHOCKWAVE_MS;
  const globalProgress = Math.min(1, Math.max(0, ageMs / POTATO_MINE_SHOCKWAVE_MS));
  const eased = 1 - (1 - progress) ** 3;
  const lift = Math.sin(progress * Math.PI) * (0.18 + (particleIndex % 4) * 0.025);
  const radius = startRadius + eased * (0.48 + (particleIndex % 5) * 0.04);
  const fadeIn = Math.min(1, progress * 7 + 0.24);
  const fadeOut = Math.max(0, 1 - Math.max(0, progress - 0.48) / 0.52);

  return {
    visible: true,
    opacity: fadeIn * fadeOut,
    flashOpacity: Math.max(0, 1 - globalProgress * 1.35),
    ringScale: 0.34 + (1 - (1 - globalProgress) ** 2) * 1.1,
    x: Math.cos(angle) * radius,
    y: -0.34 + lift,
    z: Math.sin(angle) * radius * 0.18,
    scale: 0.34 + Math.sin(progress * Math.PI) * 0.36,
    rotationZ: angle + progress * Math.PI * 0.85
  };
}

export function getStatusBadgeState(ageMs: number, mode: StatusBadgeMode, index: number): StatusBadgeState {
  const particleIndex = Math.max(0, index);
  const angle = -Math.PI / 2 + particleIndex * 1.79;
  const localAge = ageMs - particleIndex * STATUS_BADGE_PARTICLE_DELAY_MS;

  if (ageMs < 0 || ageMs > STATUS_BADGE_MS) {
    return {
      visible: false,
      opacity: 0,
      scale: 0.2,
      y: -0.88,
      rotationY: 0,
      rotationZ: 0,
      materialIntensity: 0,
      particleVisible: false,
      particleOpacity: 0,
      particleX: Math.cos(angle) * 0.18,
      particleY: Math.sin(angle) * 0.18,
      particleZ: 0,
      particleScale: 0.1,
      particleRotationZ: angle
    };
  }

  const progress = ageMs / STATUS_BADGE_MS;
  const intro = Math.min(1, ageMs / 780);
  const pop = Math.sin(intro * Math.PI);
  const fadeOut = ageMs > 4100 ? Math.max(0, 1 - (ageMs - 4100) / 900) : 1;
  const victory = mode === "victory";
  const failureDip = victory ? 0 : Math.sin(Math.min(1, ageMs / 900) * Math.PI) * 0.1;
  const particleProgress = localAge / STATUS_BADGE_PARTICLE_MS;
  const particleVisible = victory && localAge >= 0 && localAge <= STATUS_BADGE_PARTICLE_MS;
  const particleArc = particleVisible ? Math.sin(particleProgress * Math.PI) : 0;
  const particleRadius = 0.18 + (particleVisible ? (1 - (1 - particleProgress) ** 3) * 0.62 : 0);
  const particleFade = particleVisible ? Math.max(0, 1 - Math.max(0, particleProgress - 0.48) / 0.52) : 0;

  return {
    visible: true,
    opacity: fadeOut,
    scale: victory ? 0.34 + intro * 0.72 + pop * 0.18 : 0.34 + intro * 0.58 + pop * 0.06,
    y: victory ? -0.88 + pop * 0.09 : -0.9 - failureDip,
    rotationY: victory ? Math.sin(progress * Math.PI * 5) * 0.46 : -0.28 + pop * 0.1,
    rotationZ: victory ? progress * Math.PI * 2.8 : -0.22 * intro + Math.sin(progress * Math.PI * 2) * 0.04,
    materialIntensity: victory ? 0.95 + pop * 0.42 : 0.56 + pop * 0.1,
    particleVisible,
    particleOpacity: particleFade * fadeOut,
    particleX: Math.cos(angle) * particleRadius,
    particleY: Math.sin(angle) * particleRadius + particleArc * 0.2,
    particleZ: Math.sin(angle * 2) * 0.08,
    particleScale: 0.24 + particleArc * 0.38,
    particleRotationZ: angle + particleProgress * Math.PI * 1.2
  };
}
