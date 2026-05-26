import Phaser from "phaser";
import { createGameAudioController, getSoundForCombatEvent, type SoundId } from "./game/audio";
import { GameScene } from "./game/GameScene";
import { ThreeStage } from "./game/ThreeStage";
import type { GameState } from "./game/types";
import { createDomOverlay } from "./ui/domOverlay";
import "./styles.css";

const scene = new GameScene();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-root",
  backgroundColor: "#eebf7a",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720
  },
  scene: [scene]
};

const game = new Phaser.Game(config);
const threeStage = new ThreeStage(document.querySelector("#three-root")!);
const audio = createGameAudioController();
createDomOverlay(document.querySelector("#ui-root")!, scene, {
  soundEnabled: audio.getSettings().enabled,
  onToggleSound: (enabled) => {
    audio.setEnabled(enabled);
    if (enabled) {
      void audio.unlock().then((unlocked) => {
        if (unlocked) audio.play("button");
      }).catch(() => undefined);
      return;
    }
    audio.play("button");
  }
});

window.addEventListener(
  "pointerdown",
  () => {
    void audio.unlock().catch(() => undefined);
  },
  { once: true }
);

let seenThreeEventIds = new Set<string>();
let seenAudioEventIds = new Set<string>();
scene.uiEvents.on("state-changed", (state: GameState) => {
  state.events.forEach((event) => {
    if (!seenThreeEventIds.has(event.id) && event.type === "sun-produced") {
      threeStage.pulseSunCollection();
    }
    if (!seenThreeEventIds.has(event.id) && event.type === "wave-spawned") {
      threeStage.pulseWaveAlert();
    }
    if (!seenThreeEventIds.has(event.id) && event.type === "level-ended") {
      threeStage.showLevelBadge(event.status);
    }
    if (!seenAudioEventIds.has(event.id)) {
      const sound = getSoundForCombatEvent(event);
      if (sound) audio.play(sound);
    }
  });
  seenThreeEventIds = new Set(state.events.map((event) => event.id));
  seenAudioEventIds = new Set(state.events.map((event) => event.id));
});

scene.uiEvents.on("sound-requested", (soundId: SoundId) => {
  void audio.unlock().then((unlocked) => {
    if (unlocked) audio.play(soundId);
  }).catch(() => undefined);
});

window.addEventListener("beforeunload", () => {
  audio.destroy();
  threeStage.destroy();
  game.destroy(true);
});
