import Phaser from "phaser";
import {
  getBoardAssetPresentation,
  getPlantAssetPresentation,
  getSourceCropPixels,
  getZombieAssetPresentation,
  type AssetCrop
} from "./assetPresentation";
import {
  BASE_SIGN_TEXTURE,
  BOARD_TEXTURE,
  PLANT_TEXTURES,
  PROJECTILE_TEXTURES,
  SUN_TOKEN_TEXTURE,
  ZOMBIE_TEXTURES
} from "./assets";
import { DIFFICULTY, LEVELS, PLANTS, ZOMBIES } from "./config";
import {
  advanceCombat,
  createInitialState,
  getPlantingResult,
  moveHeroLane,
  plantAt,
  selectPlant,
  spawnDueZombies,
  updateStatus
} from "./rules";
import {
  getHeroPeashooterPresentation,
  getHealthWearState,
  getPlantMiniatureProfile,
  getPlantMiniatureState,
  getProjectileParticleState,
  getProjectilePresentation,
  getSunPickupPresentation,
  getZombieMiniatureProfile,
  getZombieMiniatureState,
  type HealthWearState
} from "./worldPresentation";
import type {
  CombatEvent,
  ColumnIndex,
  DifficultyId,
  GameState,
  LaneIndex,
  LevelConfig,
  PlantEntity,
  PlantId,
  ZombieEntity
} from "./types";

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

  private currentLevelIndex = 0;
  private currentDifficultyId: DifficultyId = "normal";
  private state: GameState = createInitialState(LEVELS[0], DIFFICULTY.normal);
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
    this.load.image("garden-board", BOARD_TEXTURE);
    this.load.image("base-sign", BASE_SIGN_TEXTURE);
    this.load.image("sun-token", SUN_TOKEN_TEXTURE);
    this.load.image("projectile-pea", PROJECTILE_TEXTURES.pea);
    this.load.image("projectile-ice", PROJECTILE_TEXTURES.ice);
    Object.entries(ZOMBIE_TEXTURES).forEach(([zombieId, url]) => {
      this.load.image(`zombie-${zombieId}`, url);
    });
  }

  create(): void {
    this.startCurrentLevel();
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
    this.state = spawnDueZombies(this.state, this.currentLevel, ZOMBIES, this.currentDifficulty);
    this.state = advanceCombat(this.state, PLANTS, ZOMBIES, deltaMs, this.currentDifficulty);
    this.state = updateStatus(this.state, this.currentLevel);
    this.redrawDynamicWorld();
    this.uiEvents.emit("state-changed", this.state);
  }

  getCurrentLevel(): LevelConfig {
    return this.currentLevel;
  }

  hasNextLevel(): boolean {
    return this.currentLevelIndex < LEVELS.length - 1;
  }

  getCurrentDifficultyId(): DifficultyId {
    return this.currentDifficultyId;
  }

  setDifficulty(difficultyId: DifficultyId): void {
    if (!DIFFICULTY[difficultyId] || difficultyId === this.currentDifficultyId) return;
    this.uiEvents.emit("sound-requested", "button");
    this.currentDifficultyId = difficultyId;
    this.startCurrentLevel();
    this.redrawDynamicWorld();
    this.uiEvents.emit("state-changed", this.state);
  }

  setSelectedPlant(plantId: PlantId): void {
    if (!this.currentLevel.allowedPlants.includes(plantId)) {
      this.uiEvents.emit("feedback-changed", { type: "planting", reason: "locked" });
      return;
    }
    this.state = selectPlant(this.state, plantId);
    this.uiEvents.emit("sound-requested", "select");
    this.uiEvents.emit("state-changed", this.state);
  }

  moveHeroLane(delta: -1 | 1): void {
    const nextState = moveHeroLane(this.state, delta);
    if (nextState === this.state) return;
    this.state = nextState;
    this.uiEvents.emit("sound-requested", "button");
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
    this.startCurrentLevel();
    this.redrawDynamicWorld();
    this.uiEvents.emit("state-changed", this.state);
  }

  nextLevel(): void {
    if (!this.hasNextLevel()) return;
    this.uiEvents.emit("sound-requested", "button");
    this.currentLevelIndex += 1;
    this.startCurrentLevel();
    this.redrawDynamicWorld();
    this.uiEvents.emit("state-changed", this.state);
  }

  private get currentLevel(): LevelConfig {
    return LEVELS[this.currentLevelIndex];
  }

  private get currentDifficulty() {
    return DIFFICULTY[this.currentDifficultyId];
  }

  private startCurrentLevel(): void {
    this.state = { ...createInitialState(this.currentLevel, this.currentDifficulty), status: "playing" };
    this.lastTickMs = 0;
  }

  private handleKeyboard(): void {
    if (Phaser.Input.Keyboard.JustDown(this.keys.W) || Phaser.Input.Keyboard.JustDown(this.cursors.up!)) {
      this.moveHeroLane(-1);
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.S) || Phaser.Input.Keyboard.JustDown(this.cursors.down!)) {
      this.moveHeroLane(1);
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
    this.drawTabletop();
    this.add.rectangle(648, 338, 1106, 438, 0x5c4330, 0.18);
    this.add.rectangle(640, 326, 1092, 430, 0x7aa86b, 0.28).setStrokeStyle(5, 0x68482e, 0.92);
    this.add.rectangle(640, 326, 1066, 404, 0xf1cc86, 0.96).setStrokeStyle(3, 0x8a633d, 0.72);
    const boardArt = this.add.image(BOARD.x + BOARD.width / 2, BOARD.y + BOARD.height / 2, "garden-board");
    const boardCrop = getSourceCropPixels(getBoardAssetPresentation().crop, boardArt.width, boardArt.height);
    const boardScaleX = BOARD.width / boardCrop.width;
    const boardScaleY = BOARD.height / boardCrop.height;
    const cropCenterOffsetX = (boardCrop.x + boardCrop.width / 2 - boardArt.width / 2) * boardScaleX;
    const cropCenterOffsetY = (boardCrop.y + boardCrop.height / 2 - boardArt.height / 2) * boardScaleY;
    boardArt
      .setCrop(boardCrop.x, boardCrop.y, boardCrop.width, boardCrop.height)
      .setScale(boardScaleX, boardScaleY)
      .setPosition(BOARD.x + BOARD.width / 2 - cropCenterOffsetX, BOARD.y + BOARD.height / 2 - cropCenterOffsetY)
      .setAlpha(0.98);
    this.add.ellipse(250, 148, 86, 20, 0xffffff, 0.12);
    this.add.ellipse(1040, 510, 120, 24, 0x5c4330, 0.1);
    const laneHeight = BOARD.height / BOARD.lanes;
    const columnWidth = BOARD.width / BOARD.columns;
    for (let lane = 0; lane < BOARD.lanes; lane += 1) {
      const y = BOARD.y + lane * laneHeight + laneHeight / 2;
      this.add
        .rectangle(BOARD.x + BOARD.width / 2, y, BOARD.width, laneHeight - 8, 0xffffff, 0.035)
        .setStrokeStyle(2, 0x315f3a, 0.18);
      this.add.rectangle(BOARD.x + BOARD.width / 2, y - 27, BOARD.width - 20, 8, 0xffffff, 0.08);
      this.add.rectangle(BOARD.x + BOARD.width / 2, y + 27, BOARD.width - 18, 8, 0x174a36, 0.05);
    }
    for (let column = 1; column < BOARD.columns; column += 1) {
      const x = BOARD.x + column * columnWidth;
      this.add.line(x, BOARD.y + BOARD.height / 2, 0, 0, 0, BOARD.height, 0x5c4330, 0.14).setLineWidth(2);
    }
    this.drawTrayPebbles();
    this.add.ellipse(92, 498, 92, 20, 0x5c4330, 0.16);
    this.add.image(88, 340, "base-sign").setDisplaySize(94, 308);
  }

  private drawTabletop(): void {
    this.add.rectangle(640, 360, 1280, 720, 0xeab674);
    for (let plank = 0; plank < 16; plank += 1) {
      const x = plank * 88 + 44;
      const color = [0xe8ad68, 0xf0c07b, 0xe4a45f, 0xf3c889][plank % 4];
      this.add.rectangle(x, 360, 88, 720, color, 0.42);
      this.add.line(x + 44, 360, 0, -360, 0, 360, 0x7a4d2e, 0.13).setLineWidth(2);
      this.add.rectangle(x - 18, 128 + (plank % 5) * 118, 42, 3, 0xfff0b8, 0.16).setAngle((plank % 3) * 4 - 4);
      this.add.rectangle(x + 14, 184 + (plank % 4) * 126, 58, 3, 0x7a4d2e, 0.08).setAngle((plank % 2) * 5 - 2);
    }
    this.add.rectangle(640, 360, 1280, 720, 0x5c4330, 0.04);
    this.add.ellipse(100, 650, 360, 70, 0x6d4b2b, 0.08);
    this.add.ellipse(1170, 70, 320, 64, 0xffffff, 0.08);
  }

  private drawTrayPebbles(): void {
    const pebbleColors = [0xd6c7aa, 0xbda984, 0x8f7b63, 0xe7d5b8];
    for (let index = 0; index < 18; index += 1) {
      const x = BOARD.x + 28 + ((index * 137) % (BOARD.width - 56));
      const y = index % 2 === 0 ? BOARD.y - 21 + (index % 3) * 5 : BOARD.y + BOARD.height + 15 + (index % 4) * 4;
      const width = 8 + (index % 3) * 4;
      const height = 5 + (index % 2) * 3;
      this.add.ellipse(x, y, width, height, pebbleColors[index % pebbleColors.length], 0.72).setStrokeStyle(1, 0x5c4330, 0.12);
    }
    for (let marker = 0; marker < 5; marker += 1) {
      const x = BOARD.x + 74 + marker * 194;
      this.add.rectangle(x, BOARD.y - 34, 42, 14, 0xffe6a8, 0.74).setStrokeStyle(1, 0x8a633d, 0.22);
      this.add.line(x - 10, BOARD.y - 26, 0, 0, 20, 0, 0x8a633d, 0.2).setLineWidth(2);
    }
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
    this.drawPotatoMineEffects(laneHeight, columnWidth);
  }

  private drawHero(laneHeight: number, columnWidth: number): void {
    const x = BOARD.x + columnWidth * 0.7;
    const y = BOARD.y + this.state.heroLane * laneHeight + laneHeight / 2;
    const fireEvent = this.findRecentEvent((event) => event.type === "hero-fired", SHORT_EFFECT_MS);
    const firePulse = fireEvent ? 1 - this.eventProgress(fireEvent, SHORT_EFFECT_MS) : 0;
    const hero = getHeroPeashooterPresentation(this.state.nowMs, firePulse);
    const assetProfile = getPlantAssetPresentation("peashooter");
    const imageY = y + 37 + hero.bodyYOffset;
    const muzzleX = x + hero.muzzleOffsetX;
    const muzzleY = y + hero.muzzleOffsetY;

    this.add.ellipse(x, y + 30, hero.shadowWidth, hero.shadowHeight, 0x163622, 0.26).setData("dynamic", true);
    this.add
      .ellipse(x, y + 24, hero.ringWidth, hero.ringHeight, 0x8f5d32, 0.84)
      .setStrokeStyle(3, 0x35513f, 0.62)
      .setData("dynamic", true);
    this.add.ellipse(x, y + 18, hero.ringWidth * 0.72, 10, 0xfff1a3, 0.18).setData("dynamic", true);
    this.add
      .ellipse(x + 5, imageY - hero.imageHeight * 0.48, hero.imageWidth + 10, hero.imageHeight + 8, 0x1d3f2c, 0.16)
      .setData("dynamic", true);
    const heroImage = this.add.image(x, imageY, hero.imageKey);
    this.applyTextureCrop(heroImage, assetProfile.crop)
      .setOrigin(assetProfile.fieldAnchorX, assetProfile.fieldAnchorY)
      .setDisplaySize(hero.imageWidth, hero.imageHeight)
      .setAngle(hero.angle)
      .setData("dynamic", true);
    this.add
      .circle(x - 18, imageY - hero.imageHeight * 0.72, 11, 0xffffff, hero.glossAlpha)
      .setData("dynamic", true);
    this.add
      .ellipse(x, imageY - hero.imageHeight * 0.48, hero.imageWidth + 5, hero.imageHeight + 5, 0xffffff, 0)
      .setStrokeStyle(3, 0x35513f, 0.9)
      .setData("dynamic", true);
    if (firePulse > 0) {
      this.add.circle(muzzleX, muzzleY, 12 + firePulse * 22, 0xfff1a3, hero.glowAlpha).setData("dynamic", true);
      this.add.star(muzzleX + 6, muzzleY, 6, 5, 14 + firePulse * 10, 0xffffff, 0.46 * firePulse).setData("dynamic", true);
    }
  }

  private drawPlant(plant: PlantEntity, laneHeight: number, columnWidth: number): void {
    const x = BOARD.x + plant.column * columnWidth + columnWidth / 2;
    const y = BOARD.y + plant.lane * laneHeight + laneHeight / 2;
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
    const profile = getPlantMiniatureProfile(plant.plantId);
    const assetProfile = getPlantAssetPresentation(plant.plantId);
    const miniature = getPlantMiniatureState(this.state.nowMs, plant.lane, plant.column, firePulse, hitPulse);
    const wear = getHealthWearState(plant.hp, PLANTS[plant.plantId].maxHp);
    const bodyX = x + miniature.bodyXOffset;
    const imageWidth = profile.imageWidth * miniature.scaleX;
    const imageHeight = profile.imageHeight * miniature.scaleY;
    const imageX = bodyX + assetProfile.fieldOffsetX;
    const imageY = y + 34 + miniature.bodyYOffset + assetProfile.fieldOffsetY;
    const visualCenterX = imageX + imageWidth * (0.5 - assetProfile.fieldAnchorX);
    const visualCenterY = imageY + imageHeight * (0.5 - assetProfile.fieldAnchorY);
    const tint = hitPulse > 0 ? 0xffb39b : 0xffffff;
    const highlightAlpha = Math.min(0.56, profile.highlightAlpha + firePulse * 0.14);

    this.add
      .ellipse(x, y + 28, 74 * miniature.shadowScaleX, 18 * miniature.shadowScaleY, 0x163622, miniature.shadowAlpha)
      .setData("dynamic", true);
    this.add
      .ellipse(x, y + 23, profile.baseWidth, profile.baseHeight, profile.baseColor, 0.86)
      .setStrokeStyle(3, 0x5c4330, 0.36)
      .setData("dynamic", true);
    this.add
      .ellipse(x, y + 17, profile.baseWidth * 0.72, Math.max(9, profile.baseHeight * 0.52), 0xfff1a3, 0.18)
      .setData("dynamic", true);
    this.add
      .rectangle(bodyX, y + 23 - profile.stemHeight / 2, profile.stemWidth, profile.stemHeight, profile.stemColor, 0.58)
      .setStrokeStyle(2, 0x174a36, 0.28)
      .setData("dynamic", true);
    this.add
      .ellipse(
        visualCenterX + 5,
        visualCenterY + 7,
        imageWidth + 8 * miniature.scaleX,
        imageHeight + 6 * miniature.scaleY,
        0x1d3f2c,
        0.18
      )
      .setData("dynamic", true);
    const plantImage = this.add.image(imageX, imageY, `plant-${plant.plantId}`);
    this.applyTextureCrop(plantImage, assetProfile.crop)
      .setOrigin(assetProfile.fieldAnchorX, assetProfile.fieldAnchorY)
      .setDisplaySize(imageWidth, imageHeight)
      .setAngle(miniature.angle)
      .setTint(tint)
      .setData("dynamic", true);
    this.add
      .circle(visualCenterX - 14, visualCenterY - 17, 11 * Math.max(miniature.scaleX, miniature.scaleY), 0xffffff, highlightAlpha)
      .setData("dynamic", true);
    this.add
      .ellipse(
        visualCenterX,
        visualCenterY,
        imageWidth + 6 * miniature.scaleX,
        imageHeight + 6 * miniature.scaleY,
        0xffffff,
        0
      )
      .setStrokeStyle(3, profile.rimColor)
      .setData("dynamic", true);

    if (miniature.flashAlpha > 0) {
      this.add
        .ellipse(
          visualCenterX,
          visualCenterY,
          imageWidth + 10 * miniature.scaleX,
          imageHeight + 8 * miniature.scaleY,
          0xfff8df,
          miniature.flashAlpha
        )
        .setData("dynamic", true);
    }
    this.drawPlantWear(visualCenterX, visualCenterY, imageWidth, imageHeight, wear);

    if (firePulse > 0) {
      const muzzleX = imageX + imageWidth * 0.42;
      const muzzleY = visualCenterY - imageHeight * 0.12;
      const effectColor = plant.plantId === "snowpea" ? 0xbdefff : 0xfff1a3;
      this.add.circle(muzzleX, muzzleY, 10 + firePulse * 18, effectColor, 0.4 * firePulse).setData("dynamic", true);
      this.add.star(muzzleX + 6, muzzleY, 6, 6, 14 + firePulse * 10, 0xffffff, 0.42 * firePulse).setData("dynamic", true);
    }

    if (sunEvent?.type === "sun-produced") {
      const coinY = visualCenterY - imageHeight * 0.48 - sunProgress * 34;
      const sunPickup = getSunPickupPresentation(sunProgress);
      for (let index = 0; index < sunPickup.sparkleCount; index += 1) {
        const angle = (Math.PI * 2 * index) / sunPickup.sparkleCount + this.state.nowMs / 420;
        const distance = sunPickup.sparkleRadius * (0.58 + (index % 3) * 0.18);
        const sparkleX = x + Math.cos(angle) * distance;
        const sparkleY = coinY + Math.sin(angle) * distance * 0.72;
        this.add
          .line(x, coinY, 0, 0, Math.cos(angle) * sunPickup.haloRadius, Math.sin(angle) * sunPickup.haloRadius * 0.72, sunPickup.glintColor, sunPickup.beamAlpha)
          .setLineWidth(2)
          .setData("dynamic", true);
        this.add
          .star(sparkleX, sparkleY, 5, 2, 5 + (index % 2) * 2, sunPickup.glintColor, sunPickup.sparkleAlpha)
          .setAngle(sunPickup.rotationDeg + index * 23)
          .setData("dynamic", true);
      }
      this.add
        .circle(x, coinY, sunPickup.haloRadius, sunPickup.glintColor, 0.16 * sunPickup.alpha)
        .setData("dynamic", true);
      this.add
        .circle(x, coinY, sunPickup.haloRadius * 0.62, sunPickup.coinColor, 0)
        .setStrokeStyle(3, sunPickup.coinColor, 0.36 * sunPickup.alpha)
        .setData("dynamic", true);
      this.add
        .image(x, coinY, "sun-token")
        .setDisplaySize(sunPickup.tokenSize, sunPickup.tokenSize)
        .setAngle(sunPickup.rotationDeg)
        .setAlpha(sunPickup.alpha)
        .setData("dynamic", true);
      this.add
        .star(x - 4, coinY - 5, 5, 3, 7, sunPickup.glintColor, 0.34 * sunPickup.alpha)
        .setData("dynamic", true);
      this.add
        .text(x + 18, coinY - 8, `+${sunEvent.amount}`, {
          fontSize: "16px",
          color: sunPickup.textColor,
          fontStyle: "bold"
        })
        .setAlpha(sunPickup.alpha)
        .setData("dynamic", true);
    }

    this.drawPlantHealth(plant, x, y);
  }

  private drawPlantWear(x: number, y: number, width: number, height: number, wear: HealthWearState): void {
    if (wear.dangerAlpha > 0) {
      this.add
        .ellipse(x, y, width + 12, height + 10, 0xff8f4d, wear.dangerAlpha * 0.16)
        .setData("dynamic", true);
    }

    if (wear.crackCount === 0) return;

    const cracks = [
      [-0.18, -0.28, -0.02, -0.08],
      [0.12, -0.18, 0.0, 0.1],
      [-0.06, 0.08, -0.22, 0.28],
      [0.2, 0.02, 0.08, 0.26]
    ];

    cracks.slice(0, wear.crackCount).forEach(([x1, y1, x2, y2]) => {
      this.add
        .line(x, y, x1 * width, y1 * height, x2 * width, y2 * height, 0x5c4330, wear.crackAlpha)
        .setLineWidth(2)
        .setData("dynamic", true);
    });
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
    const presentation = getProjectilePresentation(projectile.slows);
    const projectileKey = projectile.slows ? "projectile-ice" : "projectile-pea";
    this.add
      .ellipse(x - 2, y + 12, presentation.shadowWidth, presentation.shadowHeight, 0x163622, 0.16)
      .setData("dynamic", true);
    for (let index = presentation.trailParticleCount - 1; index >= 0; index -= 1) {
      const particle = getProjectileParticleState(projectile.slows, index, this.state.nowMs);
      const particleX = x + particle.offsetX;
      const particleY = y + particle.offsetY;
      this.add
        .circle(particleX, particleY, particle.radius, presentation.trailColor, particle.alpha)
        .setData("dynamic", true);
      this.add
        .star(particleX - 1, particleY - 1, 5, 2, particle.radius + 2, presentation.sparkleColor, particle.alpha * 0.42)
        .setAngle(particle.rotationDeg)
        .setData("dynamic", true);
    }
    this.add.circle(x, y, presentation.glowRadius + 3, presentation.glowColor, 0.22).setData("dynamic", true);
    this.add.circle(x, y, presentation.coreRadius + 7, presentation.trailColor, 0).setStrokeStyle(2, presentation.rimColor, 0.34).setData("dynamic", true);
    this.add
      .image(x, y, projectileKey)
      .setDisplaySize(presentation.imageWidth, presentation.imageHeight)
      .setAngle(projectile.slows ? (this.state.nowMs / 18) % 360 : Math.sin(this.state.nowMs / 140) * 2)
      .setAlpha(0.97)
      .setData("dynamic", true);
    this.add.circle(x - 5, y - 5, 3, presentation.sparkleColor, 0.48).setData("dynamic", true);
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
    const profile = getZombieMiniatureProfile(zombie.zombieId);
    const assetProfile = getZombieAssetPresentation(zombie.zombieId);
    const miniature = getZombieMiniatureState(this.state.nowMs, zombie.x, chewing, hitPulse);
    const wear = getHealthWearState(zombie.hp, ZOMBIES[zombie.zombieId].maxHp);
    const bodyX = x + miniature.bodyXOffset;
    const bodyY = y + miniature.bodyYOffset;
    const tint = hitPulse > 0 ? (hitEvent?.type === "zombie-hit" && hitEvent.slows ? 0xbbefff : 0xffa899) : profile.tintColor;

    this.add
      .ellipse(
        x,
        y + 30,
        profile.shadowWidth * miniature.shadowScaleX,
        profile.shadowHeight * miniature.shadowScaleY,
        0x263238,
        miniature.shadowAlpha
      )
      .setData("dynamic", true);
    this.add
      .ellipse(bodyX - 14 + miniature.footOffset, y + 31, profile.footWidth, profile.footHeight, 0x5c4330, 0.22)
      .setData("dynamic", true);
    this.add
      .ellipse(bodyX + 18 - miniature.footOffset, y + 31, profile.footWidth - 1, profile.footHeight, 0x5c4330, 0.18)
      .setData("dynamic", true);
    this.add
      .ellipse(
        bodyX + 6,
        bodyY + 7,
        profile.backingWidth * miniature.scaleX,
        profile.backingHeight * miniature.scaleY,
        profile.backingColor,
        0.18
      )
      .setData("dynamic", true);
    const zombieImage = this.add.image(
      bodyX + assetProfile.fieldOffsetX,
      bodyY + assetProfile.fieldOffsetY,
      `zombie-${zombie.zombieId}`
    );
    this.applyTextureCrop(zombieImage, assetProfile.crop)
      .setDisplaySize(profile.imageWidth * miniature.scaleX, profile.imageHeight * miniature.scaleY)
      .setAngle(miniature.angle)
      .setTint(tint)
      .setData("dynamic", true);
    this.add
      .rectangle(bodyX, bodyY, profile.rimWidth * miniature.scaleX, profile.rimHeight * miniature.scaleY, 0xffffff, 0)
      .setStrokeStyle(3, profile.rimColor)
      .setData("dynamic", true);

    if (miniature.flashAlpha > 0) {
      this.add
        .ellipse(
          bodyX,
          bodyY - 2,
          (profile.rimWidth + 10) * miniature.scaleX,
          (profile.rimHeight + 6) * miniature.scaleY,
          0xfff8df,
          miniature.flashAlpha
        )
        .setData("dynamic", true);
    }
    this.drawZombieWear(bodyX, bodyY, profile.rimWidth * miniature.scaleX, profile.rimHeight * miniature.scaleY, wear);

    if (assetProfile.drawProceduralHeadgear && profile.headgear === "cone") {
      const halfWidth = profile.headgearWidth / 2;
      const yTop = bodyY + profile.headgearYOffset;
      this.add
        .triangle(
          bodyX,
          yTop,
          0,
          profile.headgearHeight,
          halfWidth,
          0,
          profile.headgearWidth,
          profile.headgearHeight,
          profile.headgearColor,
          0.86
        )
        .setStrokeStyle(2, profile.headgearStrokeColor)
        .setData("dynamic", true);
    }
    if (assetProfile.drawProceduralHeadgear && profile.headgear === "bucket") {
      this.add
        .rectangle(
          bodyX,
          bodyY + profile.headgearYOffset,
          profile.headgearWidth,
          profile.headgearHeight,
          profile.headgearColor,
          0.9
        )
        .setStrokeStyle(2, profile.headgearStrokeColor)
        .setData("dynamic", true);
      this.add
        .ellipse(
          bodyX,
          bodyY + profile.headgearYOffset - profile.headgearHeight / 2,
          profile.headgearWidth,
          10,
          0xe7eef1,
          0.8
        )
        .setStrokeStyle(2, profile.headgearStrokeColor)
        .setData("dynamic", true);
    }

    if (slowPulse > 0) {
      this.add
        .circle(bodyX, bodyY, profile.slowAuraRadius, 0xbdefff, 0.16)
        .setStrokeStyle(3, 0xdaf8ff, 0.5)
        .setData("dynamic", true);
    }
    if (hitPulse > 0) {
      this.add.circle(bodyX + 24, bodyY - 12, 12 + hitPulse * 22, 0xffffff, 0.35 * hitPulse).setData("dynamic", true);
    }

    this.drawZombieHealth(zombie, x, y);
  }

  private drawZombieWear(x: number, y: number, width: number, height: number, wear: HealthWearState): void {
    if (wear.dangerAlpha > 0) {
      this.add
        .ellipse(x, y, width + 14, height + 10, 0xf45f4f, wear.dangerAlpha * 0.14)
        .setData("dynamic", true);
    }

    if (wear.crackCount === 0) return;

    const scratches = [
      [-0.2, -0.2, 0.0, -0.28],
      [0.1, -0.04, 0.28, -0.12],
      [-0.18, 0.16, 0.02, 0.08],
      [0.06, 0.24, 0.26, 0.18]
    ];

    scratches.slice(0, wear.crackCount).forEach(([x1, y1, x2, y2]) => {
      this.add
        .line(x, y, x1 * width, y1 * height, x2 * width, y2 * height, 0xfff8df, wear.scuffAlpha)
        .setLineWidth(2)
        .setData("dynamic", true);
    });
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

  private drawPotatoMineEffects(laneHeight: number, columnWidth: number): void {
    this.state.events
      .filter((event) => event.type === "potato-mine-exploded")
      .forEach((event) => {
        const progress = this.eventProgress(event, LONG_EFFECT_MS);
        if (progress >= 1) return;
        const x = BOARD.x + event.column * columnWidth + columnWidth / 2;
        const y = BOARD.y + event.lane * laneHeight + laneHeight / 2;
        const alpha = 1 - progress;
        const radius = columnWidth * event.radiusCells * (0.5 + progress);

        this.add.ellipse(x, y + 28, radius * 1.35, 22 + progress * 18, 0x6d4b2b, 0.24 * alpha).setData("dynamic", true);
        this.add.circle(x, y + 2, 26 + progress * 42, 0xffd34f, 0.28 * alpha).setData("dynamic", true);
        this.add.circle(x, y + 4, 16 + progress * 26, 0x8f5d32, 0.36 * alpha).setData("dynamic", true);
        this.add.star(x, y - 4, 7, 7, 24 + progress * 18, 0xfff8df, 0.42 * alpha).setData("dynamic", true);
      });
  }

  private applyTextureCrop(image: Phaser.GameObjects.Image, crop: AssetCrop): Phaser.GameObjects.Image {
    const sourceCrop = getSourceCropPixels(crop, image.width, image.height);
    image.setCrop(sourceCrop.x, sourceCrop.y, sourceCrop.width, sourceCrop.height);
    return image;
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
