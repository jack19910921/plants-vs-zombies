export type SeedPacketFlipMode = "select" | "plant";

export interface SeedPacketFlipState {
  visible: boolean;
  opacity: number;
  rotationY: number;
  rotationZ: number;
  scale: number;
  y: number;
}

const SEED_PACKET_FLIP_MS = 720;

export function getSeedPacketFlipState(ageMs: number, mode: SeedPacketFlipMode): SeedPacketFlipState {
  if (ageMs < 0 || ageMs > SEED_PACKET_FLIP_MS) {
    return {
      visible: false,
      opacity: 0,
      rotationY: 0,
      rotationZ: 0,
      scale: 0.1,
      y: 0
    };
  }

  const progress = ageMs / SEED_PACKET_FLIP_MS;
  const pop = Math.sin(progress * Math.PI);
  const strength = mode === "plant" ? 1.18 : 1;

  return {
    visible: true,
    opacity: Math.max(0, 1 - progress * 0.25),
    rotationY: (1 - progress) * Math.PI * 1.35,
    rotationZ: (mode === "plant" ? -0.16 : 0.12) + pop * 0.18,
    scale: 0.72 + pop * 0.34 * strength,
    y: -0.15 + pop * 0.24 * strength
  };
}
