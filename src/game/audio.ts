import type { CombatEvent, GameStatus } from "./types";

export type SoundId = "select" | "plant" | "shoot" | "hit" | "sun" | "wave" | "victory" | "failure" | "button";

export interface AudioSettings {
  enabled: boolean;
}

export interface GameAudioController {
  getSettings(): AudioSettings;
  setEnabled(enabled: boolean): void;
  toggle(): AudioSettings;
  unlock(): Promise<boolean>;
  play(soundId: SoundId): void;
  destroy(): void;
}

interface ToneStep {
  frequency: number;
  duration: number;
  delay?: number;
  gain?: number;
  type?: OscillatorType;
}

const soundRecipes: Record<SoundId, ToneStep[]> = {
  select: [{ frequency: 520, duration: 0.06, gain: 0.035, type: "triangle" }],
  plant: [{ frequency: 220, duration: 0.1, gain: 0.05, type: "sine" }],
  shoot: [{ frequency: 440, duration: 0.05, gain: 0.03, type: "square" }],
  hit: [{ frequency: 160, duration: 0.06, gain: 0.045, type: "triangle" }],
  sun: [
    { frequency: 660, duration: 0.07, gain: 0.035, type: "sine" },
    { frequency: 880, duration: 0.08, delay: 0.06, gain: 0.03, type: "sine" }
  ],
  wave: [
    { frequency: 180, duration: 0.12, gain: 0.04, type: "sawtooth" },
    { frequency: 230, duration: 0.1, delay: 0.1, gain: 0.03, type: "sawtooth" }
  ],
  victory: [
    { frequency: 523, duration: 0.1, gain: 0.04, type: "sine" },
    { frequency: 659, duration: 0.1, delay: 0.09, gain: 0.04, type: "sine" },
    { frequency: 784, duration: 0.16, delay: 0.18, gain: 0.04, type: "sine" }
  ],
  failure: [
    { frequency: 330, duration: 0.12, gain: 0.04, type: "triangle" },
    { frequency: 220, duration: 0.18, delay: 0.1, gain: 0.035, type: "triangle" }
  ],
  button: [{ frequency: 360, duration: 0.045, gain: 0.025, type: "triangle" }]
};

export function createAudioSettings(): AudioSettings {
  return { enabled: true };
}

export function toggleAudioSettings(settings: AudioSettings): AudioSettings {
  return { ...settings, enabled: !settings.enabled };
}

export function getSoundForCombatEvent(event: CombatEvent): SoundId | null {
  switch (event.type) {
    case "sun-produced":
      return "sun";
    case "plant-fired":
    case "hero-fired":
      return "shoot";
    case "zombie-hit":
    case "plant-bitten":
    case "zombie-defeated":
      return "hit";
    case "wave-spawned":
      return "wave";
    case "level-ended":
      return getSoundForStatus(event.status);
    default:
      return null;
  }
}

export function getSoundForStatus(status: GameStatus): SoundId | null {
  if (status === "victory") return "victory";
  if (status === "failure") return "failure";
  return null;
}

export function createGameAudioController(): GameAudioController {
  let settings = createAudioSettings();
  let audioContext: AudioContext | null = null;

  async function unlock(): Promise<boolean> {
    if (!settings.enabled) return false;
    const AudioContextConstructor = getAudioContextConstructor();
    if (!AudioContextConstructor) return false;
    audioContext ??= new AudioContextConstructor();
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }
    return audioContext.state === "running";
  }

  return {
    getSettings: () => ({ ...settings }),
    setEnabled(enabled: boolean): void {
      settings = { ...settings, enabled };
    },
    toggle(): AudioSettings {
      settings = toggleAudioSettings(settings);
      return { ...settings };
    },
    unlock,
    play(soundId: SoundId): void {
      if (!settings.enabled || !audioContext || audioContext.state !== "running") return;
      playRecipe(audioContext, soundRecipes[soundId]);
    },
    destroy(): void {
      void audioContext?.close();
      audioContext = null;
    }
  };
}

function getAudioContextConstructor(): typeof AudioContext | undefined {
  if (typeof window === "undefined") return undefined;
  return window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
}

function playRecipe(audioContext: AudioContext, recipe: ToneStep[]): void {
  recipe.forEach((step) => {
    const startAt = audioContext.currentTime + (step.delay ?? 0);
    const stopAt = startAt + step.duration;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = step.type ?? "sine";
    oscillator.frequency.setValueAtTime(step.frequency, startAt);
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(step.gain ?? 0.035, startAt + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, stopAt);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startAt);
    oscillator.stop(stopAt + 0.02);
  });
}
