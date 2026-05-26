import Phaser from "phaser";
import { LEVEL_ONE, PLANTS, ZOMBIES } from "./config";
import { advanceCombat, createInitialState, plantAt, selectPlant, spawnDueZombies, updateStatus } from "./rules";
import type { ColumnIndex, GameState, LaneIndex, PlantId } from "./types";

const BOARD = {
  x: 148,
  y: 132,
  width: 980,
  height: 388,
  lanes: 5,
  columns: 9
};

export class GameScene extends Phaser.Scene {
  private state: GameState = createInitialState(LEVEL_ONE);
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private lastTickMs = 0;

  constructor() {
    super("GameScene");
  }

  create(): void {
    this.state = { ...createInitialState(LEVEL_ONE), status: "playing" };
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys("W,A,S,D,SPACE,ESC") as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.handlePointer(pointer));
    this.drawStaticBoard();
  }

  update(time: number): void {
    if (this.state.status !== "playing") return;
    const deltaMs = this.lastTickMs === 0 ? 16 : time - this.lastTickMs;
    this.lastTickMs = time;
    this.state = { ...this.state, nowMs: this.state.nowMs + deltaMs };
    this.handleKeyboard();
    this.state = spawnDueZombies(this.state, LEVEL_ONE, ZOMBIES);
    this.state = advanceCombat(this.state, PLANTS, ZOMBIES, deltaMs);
    this.state = updateStatus(this.state, LEVEL_ONE);
    this.redrawDynamicWorld();
    this.events.emit("state-changed", this.state);
  }

  setSelectedPlant(plantId: PlantId): void {
    this.state = selectPlant(this.state, plantId);
    this.events.emit("state-changed", this.state);
  }

  togglePause(): void {
    this.state = {
      ...this.state,
      status: this.state.status === "paused" ? "playing" : "paused"
    };
    this.lastTickMs = 0;
    this.events.emit("state-changed", this.state);
  }

  private handleKeyboard(): void {
    if (Phaser.Input.Keyboard.JustDown(this.keys.W) || Phaser.Input.Keyboard.JustDown(this.cursors.up!)) {
      this.state = { ...this.state, heroLane: Math.max(0, this.state.heroLane - 1) as LaneIndex };
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.S) || Phaser.Input.Keyboard.JustDown(this.cursors.down!)) {
      this.state = { ...this.state, heroLane: Math.min(4, this.state.heroLane + 1) as LaneIndex };
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
      this.togglePause();
    }
  }

  private handlePointer(pointer: Phaser.Input.Pointer): void {
    const column = Math.floor(((pointer.x - BOARD.x) / BOARD.width) * BOARD.columns);
    const lane = Math.floor(((pointer.y - BOARD.y) / BOARD.height) * BOARD.lanes);
    if (column < 0 || column > 8 || lane < 0 || lane > 4) return;
    this.state = plantAt(this.state, PLANTS, lane as LaneIndex, column as ColumnIndex);
    this.events.emit("state-changed", this.state);
  }

  private drawStaticBoard(): void {
    this.add.rectangle(640, 360, 1280, 720, 0xeebf7a);
    this.add.rectangle(640, 326, 1080, 420, 0xf5cf8c).setStrokeStyle(4, 0x7b5737);
    const laneHeight = BOARD.height / BOARD.lanes;
    for (let lane = 0; lane < BOARD.lanes; lane += 1) {
      const y = BOARD.y + lane * laneHeight + laneHeight / 2;
      const color = [0x8bd4bd, 0xf7df76, 0x9bd887, 0x9fd7ef, 0xf8b1a7][lane];
      this.add
        .rectangle(BOARD.x + BOARD.width / 2, y, BOARD.width, laneHeight - 8, color)
        .setStrokeStyle(2, 0x5c4330, 0.25);
    }
    this.add.rectangle(86, 326, 72, 350, 0xfff0b8).setStrokeStyle(3, 0x5c4330);
    this.add.text(70, 296, "基地", { fontSize: "24px", color: "#263238", fontStyle: "bold" }).setAngle(-90);
  }

  private redrawDynamicWorld(): void {
    this.children.list
      .filter((child) => child.getData("dynamic"))
      .forEach((child) => child.destroy());

    const laneHeight = BOARD.height / BOARD.lanes;
    const columnWidth = BOARD.width / BOARD.columns;

    this.add
      .circle(BOARD.x + columnWidth * 0.7, BOARD.y + this.state.heroLane * laneHeight + laneHeight / 2, 28, 0x4abb6e)
      .setStrokeStyle(4, 0x174a36)
      .setData("dynamic", true);

    this.state.plants.forEach((plant) => {
      const x = BOARD.x + plant.column * columnWidth + columnWidth / 2;
      const y = BOARD.y + plant.lane * laneHeight + laneHeight / 2;
      this.add.circle(x, y, 24, 0x55bd70).setStrokeStyle(3, 0x35513f).setData("dynamic", true);
      this.add
        .text(x - 16, y - 13, PLANTS[plant.plantId].name.slice(0, 1), {
          fontSize: "24px",
          color: "#163622",
          fontStyle: "bold"
        })
        .setData("dynamic", true);
    });

    this.state.projectiles.forEach((projectile) => {
      const x = BOARD.x + projectile.x * columnWidth;
      const y = BOARD.y + projectile.lane * laneHeight + laneHeight / 2;
      this.add
        .circle(x, y, 9, projectile.slows ? 0x9fd7ef : 0xc7ef68)
        .setStrokeStyle(2, 0x35513f)
        .setData("dynamic", true);
    });

    this.state.zombies.forEach((zombie) => {
      const x = BOARD.x + zombie.x * columnWidth;
      const y = BOARD.y + zombie.lane * laneHeight + laneHeight / 2;
      this.add.rectangle(x, y, 48, 54, 0x7b9189).setStrokeStyle(3, 0x3f504d).setData("dynamic", true);
      this.add
        .text(x - 15, y - 13, "僵", { fontSize: "24px", color: "#263238", fontStyle: "bold" })
        .setData("dynamic", true);
    });
  }
}
