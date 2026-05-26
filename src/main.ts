import Phaser from "phaser";
import { GameScene } from "./game/GameScene";
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
createDomOverlay(document.querySelector("#ui-root")!, scene);

window.addEventListener("beforeunload", () => {
  game.destroy(true);
});
