import Phaser from "phaser";
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
createDomOverlay(document.querySelector("#ui-root")!, scene);

let seenThreeEventIds = new Set<string>();
scene.uiEvents.on("state-changed", (state: GameState) => {
  state.events.forEach((event) => {
    if (!seenThreeEventIds.has(event.id) && event.type === "sun-produced") {
      threeStage.pulseSunCollection();
    }
  });
  seenThreeEventIds = new Set(state.events.map((event) => event.id));
});

window.addEventListener("beforeunload", () => {
  threeStage.destroy();
  game.destroy(true);
});
