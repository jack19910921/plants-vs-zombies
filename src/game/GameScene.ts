import Phaser from "phaser";
import { PLANT_TEXTURES, ZOMBIE_TEXTURE } from "./assets";
import { LEVEL_ONE, PLANTS, ZOMBIES } from "./config";
import {
  advanceCombat,
  createInitialState,
  getPlantingResult,
  plantAt,
  selectPlant,
  spawnDueZombies,
  updateStatus
} from "./rules";
import type { CombatEvent, ColumnIndex, GameState, LaneIndex, PlantEntity, PlantId, ZombieEntity } from "./types";

const BOARD = {
  x: 148,
  y: 132,
  width: 980,
  height: 388,
  lanes: 5,
  columns: 9
};

const SHORT_EFFECT_MS = 360;
const LONG_EFFECT_MS = 700;

export class GameScene extends Phaser.Scene {
  public readonly uiEvents = new Phaser.Events.EventEmitter();

  private state: GameState = createInitialState(LEVEL_ONE);
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private lastTickMs = 0;

  constructor() {
    super("GameScene");
  }

  preload(): void {
    Object.entries(PLANT_TEXTURES).forEach(([plantId, url]) => {
      this.load.image(`plant-${plantId}`, url);
    });
    this.load.image("zombie-basic", ZOMBIE_TEXTURE);
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
    this.uiEvents.emit("state-changed", this.state);
  }

  setSelectedPlant(plantId: PlantId): void {
    this.state = selectPlant(this.state, plantId);
    this.uiEvents.emit("sound-requested", "select");
    this.uiEvents.emit("state-changed", this.state);
  }

  togglePause(): void {
    if (this.state.status !== "playing" && this.state.status !== "paused") return;
    this.uiEvents.emit("sound-requested", "button");
    this.state = {
      ...this.state,
      status: this.state.status === "paused" ? "playing" : "paused"
    };
    this.lastTickMs = 0;
    this.uiEvents.emit("state-changed", this.state);
  }

  restartLevel(): void {
    this.uiEvents.emit("sound-requested", "button");
    this.state = { ...createInitialState(LEVEL_ONE), status: "playing" };
    this.lastTickMs = 0;
    this.redrawDynamicWorld();
    this.uiEvents.emit("state-changed", this.state);
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
    if (column < 0 || column > 8 || lane < 0 || lane > 4) {
      this.uiEvents.emit("feedback-changed", { type: "planting", reason: "outside-board" });
      return;
    }
    const plantingResult = getPlantingResult(this.state, PLANTS, lane as LaneIndex, column as ColumnIndex);
    if (!plantingResult.ok) {
      this.uiEvents.emit("feedback-changed", { type: "planting", reason: plantingResult.reason });
      return;
    }
    this.state = plantAt(this.state, PLANTS, lane as LaneIndex, column as ColumnIndex);
    this.uiEvents.emit("sound-requested", "plant");
    this.uiEvents.emit("state-changed", this.state);
  }

  private drawStaticBoard(): void {
    this.add.rectangle(640, 360, 1280, 720, 0xeebf7a);
    this.add.rectangle(640, 326, 1080, 420, 0xf5cf8c).setStrokeStyle(4, 0x7b5737);
    const laneHeight = BOARD.height / BOARD.lanes;
    const columnWidth = BOARD.width / BOARD.columns;
    for (let lane = 0; lane < BOARD.lanes; lane += 1) {
      const y = BOARD.y + lane * laneHeight + laneHeight / 2;
      const color = [0x8bd4bd, 0xf7df76, 0x9bd887, 0x9fd7ef, 0xf8b1a7][lane];
      this.add
        .rectangle(BOARD.x + BOARD.width / 2, y, BOARD.width, laneHeight - 8, color)
        .setStrokeStyle(2, 0x5c4330, 0.25);
      this.add.rectangle(BOARD.x + BOARD.width / 2, y + 24, BOARD.width - 18, 10, 0x5c4330, 0.06);
    }
    for (let column = 1; column < BOARD.columns; column += 1) {
      const x = BOARD.x + column * columnWidth;
      this.add.line(x, BOARD.y + BOARD.height / 2, 0, 0, 0, BOARD.height, 0x5c4330, 0.14).setLineWidth(2);
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

    this.drawHero(laneHeight, columnWidth);

    this.state.plants.forEach((plant) => this.drawPlant(plant, laneHeight, columnWidth));

    this.state.projectiles.forEach((projectile) => this.drawProjectile(projectile, laneHeight, columnWidth));

    this.state.zombies.forEach((zombie) => this.drawZombie(zombie, laneHeight, columnWidth));
    this.drawExpiredZombieEffects(laneHeight, columnWidth);
  }

  private drawHero(laneHeight: number, columnWidth: number): void {
    const x = BOARD.x + columnWidth * 0.7;
    const y = BOARD.y + this.state.heroLane * laneHeight + laneHeight / 2;
    const fireEvent = this.findRecentEvent((event) => event.type === "hero-fired", SHORT_EFFECT_MS);
    const firePulse = fireEvent ? 1 - this.eventProgress(fireEvent, SHORT_EFFECT_MS) : 0;
    this.add.ellipse(x, y + 28, 72, 18, 0x163622, 0.24).setData("dynamic", true);
    this.add.circle(x, y + 4, 31 + firePulse * 4, 0x4abb6e).setStrokeStyle(4, 0x174a36).setData("dynamic", true);
    this.add.circle(x - 10, y - 8, 10, 0xffffff, 0.24).setData("dynamic", true);
    this.add.rectangle(x + 32, y, 38 + firePulse * 8, 12, 0x2a8952).setStrokeStyle(3, 0x174a36).setData("dynamic", true);
    if (firePulse > 0) {
      this.add.circle(x + 58, y, 10 + firePulse * 15, 0xfff1a3, 0.42 * firePulse).setData("dynamic", true);
    }
  }

  private drawPlant(plant: PlantEntity, laneHeight: number, columnWidth: number): void {
    const x = BOARD.x + plant.column * columnWidth + columnWidth / 2;
    const y = BOARD.y + plant.lane * laneHeight + laneHeight / 2;
    const bob = Math.sin(this.state.nowMs / 280 + plant.column * 0.7) * 4;
    const firedEvent = this.findRecentEvent(
      (event) => event.type === "plant-fired" && event.sourceId === plant.id,
      SHORT_EFFECT_MS
    );
    const bittenEvent = this.findRecentEvent(
      (event) => event.type === "plant-bitten" && event.targetId === plant.id,
      SHORT_EFFECT_MS
    );
    const sunEvent = this.findRecentEvent(
      (event) => event.type === "sun-produced" && event.sourceId === plant.id,
      LONG_EFFECT_MS
    );
    const firePulse = firedEvent ? 1 - this.eventProgress(firedEvent, SHORT_EFFECT_MS) : 0;
    const hitPulse = bittenEvent ? 1 - this.eventProgress(bittenEvent, SHORT_EFFECT_MS) : 0;
    const sunProgress = sunEvent ? this.eventProgress(sunEvent, LONG_EFFECT_MS) : 1;
    const recoil = firePulse * 8;
    const shake = hitPulse * Math.sin(this.state.nowMs / 18) * 5;
    const scale = 1 + firePulse * 0.08 - hitPulse * 0.04;
    const bodyX = x + shake - recoil;
    const bodyY = y - 5 + bob;
    const tint = hitPulse > 0 ? 0xffb39b : 0xffffff;

    this.add.ellipse(x, y + 28, 72, 18, 0x163622, 0.24).setData("dynamic", true);
    this.add.circle(bodyX, bodyY + 4, 37 * scale, 0x1d3f2c, 0.16).setData("dynamic", true);
    this.add
      .image(bodyX, bodyY, `plant-${plant.plantId}`)
      .setDisplaySize(66 * scale, 66 * scale)
      .setAngle(Math.sin(this.state.nowMs / 420 + plant.lane) * 4 - firePulse * 7)
      .setTint(tint)
      .setData("dynamic", true);
    this.add.circle(bodyX - 14, bodyY - 17, 11 * scale, 0xffffff, 0.2).setData("dynamic", true);
    this.add.circle(bodyX, bodyY, 36 * scale, 0xffffff, 0).setStrokeStyle(3, 0x35513f).setData("dynamic", true);

    if (firePulse > 0) {
      this.add.circle(x + 42, y - 8, 10 + firePulse * 18, 0xfff1a3, 0.4 * firePulse).setData("dynamic", true);
      this.add.star(x + 48, y - 8, 6, 6, 14 + firePulse * 10, 0xffffff, 0.42 * firePulse).setData("dynamic", true);
    }

    if (sunEvent?.type === "sun-produced") {
      const coinY = y - 48 - sunProgress * 34;
      const alpha = Math.max(0, 1 - sunProgress);
      this.add.circle(x, coinY, 14, 0xffd34f, alpha).setStrokeStyle(3, 0xa56c21, alpha).setData("dynamic", true);
      this.add.text(x + 18, coinY - 8, `+${sunEvent.amount}`, { fontSize: "16px", color: "#6d4615", fontStyle: "bold" }).setData("dynamic", true);
    }

    this.drawPlantHealth(plant, x, y);
  }

  private drawPlantHealth(plant: PlantEntity, x: number, y: number): void {
    const maxHp = PLANTS[plant.plantId].maxHp;
    if (plant.hp >= maxHp) return;
    const ratio = Phaser.Math.Clamp(plant.hp / maxHp, 0, 1);
    this.add.rectangle(x, y + 45, 58, 6, 0x263238, 0.42).setData("dynamic", true);
    this.add.rectangle(x - 29 + 29 * ratio, y + 45, 58 * ratio, 6, ratio < 0.35 ? 0xf45f4f : 0x65b86b).setData("dynamic", true);
  }

  private drawProjectile(
    projectile: GameState["projectiles"][number],
    laneHeight: number,
    columnWidth: number
  ): void {
    const x = BOARD.x + projectile.x * columnWidth;
    const y = BOARD.y + projectile.lane * laneHeight + laneHeight / 2;
    const color = projectile.slows ? 0x9fd7ef : 0xc7ef68;
    const glow = projectile.slows ? 0xdaf8ff : 0xf4ffd0;
    this.add.circle(x - 18, y, 8, color, 0.18).setData("dynamic", true);
    this.add.circle(x - 8, y, 10, color, 0.28).setData("dynamic", true);
    this.add.circle(x, y, 11, color).setStrokeStyle(2, 0x35513f).setData("dynamic", true);
    this.add.circle(x - 4, y - 4, 4, glow, 0.7).setData("dynamic", true);
  }

  private drawZombie(zombie: ZombieEntity, laneHeight: number, columnWidth: number): void {
    const x = BOARD.x + zombie.x * columnWidth;
    const y = BOARD.y + zombie.lane * laneHeight + laneHeight / 2;
    const hitEvent = this.findRecentEvent(
      (event) => event.type === "zombie-hit" && event.targetId === zombie.id,
      SHORT_EFFECT_MS
    );
    const hitPulse = hitEvent ? 1 - this.eventProgress(hitEvent, SHORT_EFFECT_MS) : 0;
    const chewing = this.isZombieChewing(zombie);
    const slowPulse = zombie.slowedUntilMs > this.state.nowMs ? 1 : 0;
    const shuffle = Math.sin(this.state.nowMs / 180 + zombie.x) * 4;
    const lunge = chewing ? Math.sin(this.state.nowMs / 75) * 7 : 0;
    const bodyX = x - hitPulse * 12 + lunge;
    const bodyY = y - 4 + shuffle;
    const variantTint = zombie.zombieId === "bucket" ? 0xc7d2d6 : zombie.zombieId === "cone" ? 0xffd0a6 : 0xffffff;
    const tint = hitPulse > 0 ? (hitEvent?.type === "zombie-hit" && hitEvent.slows ? 0xbbefff : 0xffa899) : variantTint;

    this.add.ellipse(x, y + 30, 68, 19, 0x263238, 0.24).setData("dynamic", true);
    this.add.ellipse(bodyX + 2, bodyY + 6, 60, 68, 0x1f2e2b, 0.16).setData("dynamic", true);
    this.add
      .image(bodyX, bodyY, "zombie-basic")
      .setDisplaySize(74, 74)
      .setAngle(chewing ? Math.sin(this.state.nowMs / 90) * 5 : Math.sin(this.state.nowMs / 240 + zombie.x) * 2)
      .setTint(tint)
      .setData("dynamic", true);
    this.add.rectangle(bodyX, bodyY, 58, 66, 0xffffff, 0).setStrokeStyle(3, 0x3f504d).setData("dynamic", true);

    if (zombie.zombieId === "cone") {
      this.add
        .triangle(bodyX, bodyY - 46, 0, 24, 17, -13, 34, 24, 0xf59f42, 0.86)
        .setStrokeStyle(2, 0x8b4f1f)
        .setData("dynamic", true);
    }
    if (zombie.zombieId === "bucket") {
      this.add.rectangle(bodyX, bodyY - 44, 38, 20, 0xaebbc1, 0.9).setStrokeStyle(2, 0x60747a).setData("dynamic", true);
      this.add.ellipse(bodyX, bodyY - 54, 38, 10, 0xe7eef1, 0.8).setStrokeStyle(2, 0x60747a).setData("dynamic", true);
    }

    if (slowPulse > 0) {
      this.add.circle(bodyX, bodyY, 44, 0xbdefff, 0.16).setStrokeStyle(3, 0xdaf8ff, 0.5).setData("dynamic", true);
    }
    if (hitPulse > 0) {
      this.add.circle(bodyX + 24, bodyY - 12, 12 + hitPulse * 22, 0xffffff, 0.35 * hitPulse).setData("dynamic", true);
    }

    this.drawZombieHealth(zombie, x, y);
  }

  private drawZombieHealth(zombie: ZombieEntity, x: number, y: number): void {
    const maxHp = ZOMBIES[zombie.zombieId].maxHp;
    const ratio = Phaser.Math.Clamp(zombie.hp / maxHp, 0, 1);
    this.add.rectangle(x, y - 52, 58, 7, 0x263238, 0.42).setData("dynamic", true);
    this.add.rectangle(x - 29 + 29 * ratio, y - 52, 58 * ratio, 7, ratio < 0.35 ? 0xf45f4f : 0xffd34f).setData("dynamic", true);
  }

  private drawExpiredZombieEffects(laneHeight: number, columnWidth: number): void {
    this.state.events
      .filter((event) => event.type === "zombie-defeated")
      .forEach((event) => {
        const progress = this.eventProgress(event, LONG_EFFECT_MS);
        if (progress >= 1) return;
        const x = BOARD.x + event.x * columnWidth;
        const y = BOARD.y + event.lane * laneHeight + laneHeight / 2;
        const alpha = 1 - progress;
        this.add.circle(x, y - 4, 24 + progress * 36, 0xfff8df, 0.28 * alpha).setData("dynamic", true);
        this.add.circle(x - 18, y - 18 - progress * 18, 7, 0xffd34f, 0.45 * alpha).setData("dynamic", true);
        this.add.circle(x + 18, y - 12 - progress * 12, 6, 0x9bd887, 0.42 * alpha).setData("dynamic", true);
      });
  }

  private isZombieChewing(zombie: ZombieEntity): boolean {
    return this.state.plants.some(
      (plant) => plant.lane === zombie.lane && zombie.x <= plant.column + 0.75 && zombie.x >= plant.column - 0.2
    );
  }

  private findRecentEvent(matches: (event: CombatEvent) => boolean, durationMs: number): CombatEvent | undefined {
    return this.state.events
      .slice()
      .reverse()
      .find((event) => this.state.nowMs - event.atMs <= durationMs && matches(event));
  }

  private eventProgress(event: CombatEvent, durationMs: number): number {
    return Phaser.Math.Clamp((this.state.nowMs - event.atMs) / durationMs, 0, 1);
  }
}
