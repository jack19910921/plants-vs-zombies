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
