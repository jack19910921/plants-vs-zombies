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
  LAWN_MOWER_TEXTURE,
  PLANT_TEXTURES,
  PROJECTILE_TEXTURES,
  SUN_TOKEN_TEXTURE,
  ZOMBIE_TEXTURES,
  getBoardTextureKeyForScene,
  getPlantTextureKeyForScene,
  getSceneSpecificTextureEntries,
  getZombieTextureKeyForScene
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
import { createRunChallenge, getModifierAnnouncement } from "./runChallenges";
import { DEFAULT_SCENE_THEME_ID, getSceneTheme, type SceneThemeConfig } from "./sceneThemes";
import {
  getGrassFleckCount,
  getGrassFleckMotionState,
  getGrassTileMotionState,
  getHeroPeashooterPresentation,
  getHealthWearState,
  getPlantMiniatureProfile,
  getPlantMiniatureState,
  getProjectileParticleState,
  getProjectilePresentation,
  getSceneDecorationCount,
  getSceneDecorationState,
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
  SceneThemeId,
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

export interface GameSceneOptions {
  initialSceneThemeId?: SceneThemeId;
  initialDifficultyId?: DifficultyId;
  startInSelectedScene?: boolean;
}

export class GameScene extends Phaser.Scene {
  public readonly uiEvents = new Phaser.Events.EventEmitter();

  private currentLevelIndex = 0;
  private currentDifficultyId: DifficultyId = "normal";
  private selectedSceneThemeId: SceneThemeId = DEFAULT_SCENE_THEME_ID;
  private state: GameState = createInitialState(
    LEVELS[0],
    DIFFICULTY.normal,
    undefined,
    getSceneTheme(DEFAULT_SCENE_THEME_ID)
  );
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private lastTickMs = 0;
  private readonly sessionSeed = Math.floor(Math.random() * 1_000_000_000);
  private runIndex = 0;
  private modifierAnnouncement: string | null = null;
  private modifierAnnouncementUntilMs = 0;
  private sceneAnnouncement: string | null = null;
  private sceneAnnouncementUntilMs = 0;
  private readonly loadedSceneThemeIds = new Set<SceneThemeId>();
  private readonly sceneThemeLoadCallbacks = new Map<SceneThemeId, Array<() => void>>();

  constructor(options: GameSceneOptions = {}) {
    super("GameScene");
    this.currentDifficultyId = DIFFICULTY[options.initialDifficultyId ?? "normal"]
      ? (options.initialDifficultyId ?? "normal")
      : "normal";
    this.selectedSceneThemeId = options.initialSceneThemeId ?? DEFAULT_SCENE_THEME_ID;
    this.state = {
      ...createInitialState(this.currentLevel, this.currentDifficulty, undefined, this.getCurrentSceneTheme()),
      status: "menu"
    };
    if (options.startInSelectedScene) {
      this.startCurrentLevel();
    }
  }

  preload(): void {
    Object.entries(PLANT_TEXTURES).forEach(([plantId, url]) => {
      this.queueImageIfMissing(`plant-${plantId}`, url);
    });
    this.queueImageIfMissing("garden-board", BOARD_TEXTURE);
    this.queueSceneThemeTextures(this.selectedSceneThemeId);
    this.queueImageIfMissing("base-sign", BASE_SIGN_TEXTURE);
    this.queueImageIfMissing("sun-token", SUN_TOKEN_TEXTURE);
    this.queueImageIfMissing("lawn-mower", LAWN_MOWER_TEXTURE);
    this.queueImageIfMissing("projectile-pea", PROJECTILE_TEXTURES.pea);
    this.queueImageIfMissing("projectile-ice", PROJECTILE_TEXTURES.ice);
    Object.entries(ZOMBIE_TEXTURES).forEach(([zombieId, url]) => {
      this.queueImageIfMissing(`zombie-${zombieId}`, url);
    });
    this.load.once("complete", () => {
      this.loadedSceneThemeIds.add(DEFAULT_SCENE_THEME_ID);
      this.loadedSceneThemeIds.add(this.selectedSceneThemeId);
    });
  }

  create(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = this.input.keyboard!.addKeys("W,A,S,D,SPACE,ESC") as Record<string, Phaser.Input.Keyboard.Key>;
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.handlePointer(pointer));
    this.drawStaticBoard();
    this.uiEvents.emit("state-changed", this.state);
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

  getCurrentStatus(): GameState["status"] {
    return this.state.status;
  }

  getCurrentSceneTheme(): SceneThemeConfig {
    return getSceneTheme(this.selectedSceneThemeId);
  }

  getCurrentRunChallenge(): GameState["runChallenge"] | null {
    return this.state.runChallenge ?? null;
  }

  getCurrentModifierAnnouncement(): string | null {
    if (this.modifierAnnouncement && this.state.nowMs <= this.modifierAnnouncementUntilMs) return this.modifierAnnouncement;
    if (this.sceneAnnouncement && this.state.nowMs <= this.sceneAnnouncementUntilMs) return this.sceneAnnouncement;
    return null;
  }

  emitCurrentState(): void {
    this.uiEvents.emit("state-changed", this.state);
  }

  setDifficulty(difficultyId: DifficultyId): void {
    if (!DIFFICULTY[difficultyId] || difficultyId === this.currentDifficultyId) return;
    this.uiEvents.emit("sound-requested", "button");
    this.currentDifficultyId = difficultyId;
    if (this.state.status === "menu") {
      this.state = {
        ...createInitialState(this.currentLevel, this.currentDifficulty, undefined, this.getCurrentSceneTheme()),
        status: "menu"
      };
      this.uiEvents.emit("state-changed", this.state);
      return;
    }
    this.startCurrentLevel();
    this.redrawFullWorld();
    this.uiEvents.emit("state-changed", this.state);
  }

  setSelectedSceneTheme(sceneThemeId: SceneThemeId): void {
    if (sceneThemeId === this.selectedSceneThemeId) return;
    this.selectedSceneThemeId = sceneThemeId;
    if (this.state.status === "menu") {
      this.state = {
        ...createInitialState(this.currentLevel, this.currentDifficulty, undefined, this.getCurrentSceneTheme()),
        status: "menu"
      };
    }
    this.uiEvents.emit("sound-requested", "button");
    this.uiEvents.emit("state-changed", this.state);
    this.ensureSceneThemeTextures(sceneThemeId, () => {
      this.redrawFullWorld();
      this.uiEvents.emit("state-changed", this.state);
    });
  }

  startSelectedScene(): void {
    if (this.state.status !== "menu") return;
    this.uiEvents.emit("sound-requested", "button");
    this.ensureSceneThemeTextures(this.selectedSceneThemeId, () => {
      this.startCurrentLevel();
      this.redrawFullWorld();
      this.uiEvents.emit("state-changed", this.state);
    });
  }

  returnToMenu(): void {
    if (this.state.status === "menu") return;
    this.uiEvents.emit("sound-requested", "button");
    this.modifierAnnouncement = null;
    this.sceneAnnouncement = null;
    this.state = {
      ...createInitialState(this.currentLevel, this.currentDifficulty, undefined, this.getCurrentSceneTheme()),
      status: "menu"
    };
    this.lastTickMs = 0;
    this.redrawFullWorld();
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

  plantAtCell(lane: LaneIndex, column: ColumnIndex): void {
    const plantingResult = getPlantingResult(this.state, PLANTS, lane, column);
    if (!plantingResult.ok) {
      this.uiEvents.emit("feedback-changed", { type: "planting", reason: plantingResult.reason });
      return;
    }
    this.state = plantAt(this.state, PLANTS, lane, column);
    this.uiEvents.emit("sound-requested", "plant");
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

  private queueImageIfMissing(key: string, url: string): boolean {
    if (this.textures?.exists?.(key)) return false;
    this.load.image(key, url);
    return true;
  }

  private queueSceneThemeTextures(sceneThemeId: SceneThemeId): boolean {
    return getSceneSpecificTextureEntries(sceneThemeId).reduce(
      (queued, entry) => this.queueImageIfMissing(entry.key, entry.url) || queued,
      false
    );
  }

  private ensureSceneThemeTextures(sceneThemeId: SceneThemeId, onReady: () => void): void {
    if (!this.load?.image || !this.load?.start) {
      onReady();
      return;
    }
    if (this.loadedSceneThemeIds.has(sceneThemeId)) {
      onReady();
      return;
    }

    const existingCallbacks = this.sceneThemeLoadCallbacks.get(sceneThemeId);
    if (existingCallbacks) {
      existingCallbacks.push(onReady);
      return;
    }

    const queued = this.queueSceneThemeTextures(sceneThemeId);
    if (!queued) {
      this.loadedSceneThemeIds.add(sceneThemeId);
      onReady();
      return;
    }

    this.sceneThemeLoadCallbacks.set(sceneThemeId, [onReady]);
    this.load.once("complete", () => {
      this.loadedSceneThemeIds.add(sceneThemeId);
      const callbacks = this.sceneThemeLoadCallbacks.get(sceneThemeId) ?? [];
      this.sceneThemeLoadCallbacks.delete(sceneThemeId);
      callbacks.forEach((callback) => callback());
    });
    this.load.start();
  }

  private startCurrentLevel(): void {
    this.runIndex += 1;
    const runChallenge = createRunChallenge({
      level: this.currentLevel,
      difficultyId: this.currentDifficultyId,
      seed: this.sessionSeed,
      runIndex: this.runIndex
    });
    this.modifierAnnouncement = getModifierAnnouncement(runChallenge.modifier);
    this.modifierAnnouncementUntilMs = 4200;
    this.sceneAnnouncement = this.getCurrentSceneTheme().startAnnouncement;
    this.sceneAnnouncementUntilMs = 6200;
    this.state = {
      ...createInitialState(this.currentLevel, this.currentDifficulty, runChallenge, this.getCurrentSceneTheme()),
      status: "playing"
    };
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
    if (this.state.status !== "playing") return;
    const column = Math.floor(((pointer.x - BOARD.x) / BOARD.width) * BOARD.columns);
    const lane = Math.floor(((pointer.y - BOARD.y) / BOARD.height) * BOARD.lanes);
    if (column < 0 || column > 8 || lane < 0 || lane > 4) {
      this.uiEvents.emit("feedback-changed", { type: "planting", reason: "outside-board" });
      return;
    }
    this.plantAtCell(lane as LaneIndex, column as ColumnIndex);
  }

  private redrawFullWorld(): void {
    if (!this.children?.removeAll) return;
    this.children.removeAll();
    this.drawStaticBoard();
    if (this.state.status === "playing") this.redrawDynamicWorld();
  }

  private drawStaticBoard(): void {
    const sceneTheme = this.getCurrentSceneTheme();
    const presentation = sceneTheme.presentation;
    this.drawTabletop(presentation);
    this.add.rectangle(648, 338, 1106, 438, 0x5c4330, 0.18);
    this.add
      .rectangle(640, 326, 1092, 430, presentation.boardMatColor, 0.36)
      .setStrokeStyle(5, presentation.boardFrameColor, 0.92);
    this.add
      .rectangle(640, 326, 1066, 404, presentation.boardInsetColor, 0.96)
      .setStrokeStyle(3, presentation.boardFrameColor, 0.72);
    const boardArt = this.add.image(
      BOARD.x + BOARD.width / 2,
      BOARD.y + BOARD.height / 2,
      getBoardTextureKeyForScene(sceneTheme.id)
    );
    const boardCrop = getSourceCropPixels(getBoardAssetPresentation().crop, boardArt.width, boardArt.height);
    const boardScaleX = BOARD.width / boardCrop.width;
    const boardScaleY = BOARD.height / boardCrop.height;
    const cropCenterOffsetX = (boardCrop.x + boardCrop.width / 2 - boardArt.width / 2) * boardScaleX;
    const cropCenterOffsetY = (boardCrop.y + boardCrop.height / 2 - boardArt.height / 2) * boardScaleY;
    boardArt
      .setCrop(boardCrop.x, boardCrop.y, boardCrop.width, boardCrop.height)
      .setScale(boardScaleX, boardScaleY)
      .setPosition(BOARD.x + BOARD.width / 2 - cropCenterOffsetX, BOARD.y + BOARD.height / 2 - cropCenterOffsetY)
      .setAlpha(presentation.boardArtAlpha);
    this.add.rectangle(BOARD.x + BOARD.width / 2, BOARD.y + BOARD.height / 2, BOARD.width, BOARD.height, presentation.tileWashColor, 0.14);
    this.add.rectangle(BOARD.x + BOARD.width / 2, BOARD.y + BOARD.height / 2, BOARD.width - 26, BOARD.height - 22, presentation.laneWashColor, 0.045);
    this.add.rectangle(BOARD.x + BOARD.width / 2, BOARD.y + BOARD.height + 10, BOARD.width - 26, 20, 0x163622, 0.08);
    this.add.rectangle(BOARD.x + BOARD.width / 2, BOARD.y + 18, BOARD.width - 38, 16, presentation.tileHighlightColor, 0.08);
    this.add.ellipse(250, 148, 86, 20, presentation.tileHighlightColor, 0.14);
    this.add.ellipse(1040, 510, 120, 24, 0x5c4330, 0.1);
    const laneHeight = BOARD.height / BOARD.lanes;
    const columnWidth = BOARD.width / BOARD.columns;
    for (let lane = 0; lane < BOARD.lanes; lane += 1) {
      const y = BOARD.y + lane * laneHeight + laneHeight / 2;
      const laneDepth = lane / Math.max(1, BOARD.lanes - 1);
      this.add
        .rectangle(BOARD.x + BOARD.width / 2, y, BOARD.width, laneHeight - 8, presentation.laneWashColor, 0.03 + laneDepth * 0.015)
        .setStrokeStyle(2, presentation.tileShadowColor, 0.16 + laneDepth * 0.04);
      this.add.rectangle(BOARD.x + BOARD.width / 2, y - 28, BOARD.width - 24, 7, presentation.tileHighlightColor, 0.1);
      this.add.rectangle(BOARD.x + BOARD.width / 2, y + 30, BOARD.width - 22, 9, presentation.tileShadowColor, 0.055 + laneDepth * 0.035);
      this.add.rectangle(BOARD.x + BOARD.width / 2, y + 36, BOARD.width - 44, 3, presentation.tileShadowColor, 0.04 + laneDepth * 0.02);
    }
    for (let column = 1; column < BOARD.columns; column += 1) {
      const x = BOARD.x + column * columnWidth;
      this.add.line(x - 1, BOARD.y + BOARD.height / 2, 0, 0, 0, BOARD.height, presentation.tileShadowColor, 0.1).setLineWidth(3);
      this.add.line(x + 2, BOARD.y + BOARD.height / 2, 0, 0, 0, BOARD.height, presentation.tileHighlightColor, 0.055).setLineWidth(1);
    }
    this.drawTrayPebbles();
    this.add.ellipse(92, 498, 92, 20, 0x5c4330, 0.16);
    this.add.image(88, 340, "base-sign").setDisplaySize(94, 308);
  }

  private drawTabletop(presentation: SceneThemeConfig["presentation"]): void {
    this.add.rectangle(640, 360, 1280, 720, presentation.tabletopBaseColor);
    for (let plank = 0; plank < 16; plank += 1) {
      const x = plank * 88 + 44;
      const color = presentation.tabletopPlankColors[plank % presentation.tabletopPlankColors.length];
      this.add.rectangle(x, 360, 88, 720, color, 0.42);
      this.add.line(x + 44, 360, 0, -360, 0, 360, presentation.tabletopShadowColor, 0.13).setLineWidth(2);
      this.add.rectangle(x - 18, 128 + (plank % 5) * 118, 42, 3, presentation.tileHighlightColor, 0.16).setAngle((plank % 3) * 4 - 4);
      this.add.rectangle(x + 14, 184 + (plank % 4) * 126, 58, 3, presentation.tabletopShadowColor, 0.08).setAngle((plank % 2) * 5 - 2);
    }
    this.add.rectangle(640, 360, 1280, 720, presentation.tabletopShadowColor, 0.04);
    this.add.ellipse(100, 650, 360, 70, presentation.tabletopShadowColor, 0.08);
    this.add.ellipse(1170, 70, 320, 64, presentation.tileHighlightColor, 0.08);
    this.drawSceneTableDecorations(presentation);
  }

  private drawSceneTableDecorations(presentation: SceneThemeConfig["presentation"]): void {
    const decoration = presentation.decoration;
    if (decoration === "sun-rays") {
      for (let index = 0; index < getSceneDecorationCount(decoration); index += 1) {
        const ray = getSceneDecorationState(decoration, this.state.nowMs, index);
        this.add
          .rectangle(130 + index * 160, 70 + ray.yRatio * 42, ray.size * 2.4, 6, presentation.tileHighlightColor, ray.alpha)
          .setAngle(ray.rotationDeg);
      }
      return;
    }
    if (decoration === "dew-beads") {
      for (let index = 0; index < getSceneDecorationCount(decoration); index += 1) {
        const bead = getSceneDecorationState(decoration, this.state.nowMs, index);
        this.add
          .circle(90 + bead.xRatio * 1120, 64 + bead.yRatio * 560, bead.size, presentation.fleckColor, bead.alpha)
          .setStrokeStyle(1, 0xffffff, bead.alpha * 0.7);
      }
      return;
    }
    for (let index = 0; index < getSceneDecorationCount(decoration); index += 1) {
      const star = getSceneDecorationState(decoration, this.state.nowMs, index);
      this.add
        .star(80 + star.xRatio * 1140, 58 + star.yRatio * 560, 5, 2, star.size, presentation.fleckColor, star.alpha)
        .setAngle(star.rotationDeg);
    }
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
      this.add.rectangle(x, BOARD.y - 31, 30, 9, 0xffe6a8, 0.38).setStrokeStyle(1, 0x8a633d, 0.14);
      this.add.line(x - 7, BOARD.y - 26, 0, 0, 14, 0, 0x8a633d, 0.12).setLineWidth(1);
    }
  }

  private redrawDynamicWorld(): void {
    this.children.list
      .filter((child) => child.getData("dynamic"))
      .forEach((child) => child.destroy());

    const laneHeight = BOARD.height / BOARD.lanes;
    const columnWidth = BOARD.width / BOARD.columns;

    this.drawGrassMotionLayer(laneHeight, columnWidth);
    this.drawArmedLawnMowers(laneHeight, columnWidth);
    this.drawHero(laneHeight, columnWidth);

    this.state.plants.forEach((plant) => this.drawPlant(plant, laneHeight, columnWidth));

    this.state.projectiles.forEach((projectile) => this.drawProjectile(projectile, laneHeight, columnWidth));

    this.state.zombies.forEach((zombie) => this.drawZombie(zombie, laneHeight, columnWidth));
    this.drawLawnMowerEffects(laneHeight, columnWidth);
    this.drawExpiredZombieEffects(laneHeight, columnWidth);
    this.drawPotatoMineEffects(laneHeight, columnWidth);
  }

  private drawGrassMotionLayer(laneHeight: number, columnWidth: number): void {
    const presentation = this.getCurrentSceneTheme().presentation;
    const graphics = this.add.graphics();
    graphics.setData("dynamic", true);

    graphics.fillStyle(presentation.tileShadowColor, 0.05);
    graphics.fillRect(BOARD.x + 12, BOARD.y + BOARD.height - 24, BOARD.width - 24, 18);
    graphics.fillStyle(presentation.tileHighlightColor, 0.04);
    graphics.fillRect(BOARD.x + 18, BOARD.y + 13, BOARD.width - 36, 8);

    for (let lane = 0; lane < BOARD.lanes; lane += 1) {
      const laneTop = BOARD.y + lane * laneHeight;
      const laneCenterY = laneTop + laneHeight / 2;
      const laneDepth = lane / Math.max(1, BOARD.lanes - 1);
      graphics.fillStyle(presentation.tileHighlightColor, 0.035 + (1 - laneDepth) * 0.025);
      graphics.fillRect(BOARD.x + 18, laneTop + 8, BOARD.width - 36, 5);
      graphics.fillStyle(presentation.tileShadowColor, 0.05 + laneDepth * 0.045);
      graphics.fillRect(BOARD.x + 18, laneTop + laneHeight - 13, BOARD.width - 36, 8);
      graphics.lineStyle(2, 0xffffff, 0.03);
      graphics.strokeLineShape(new Phaser.Geom.Line(BOARD.x + 16, laneCenterY - 22, BOARD.x + BOARD.width - 16, laneCenterY - 22));
    }

    for (let column = 1; column < BOARD.columns; column += 1) {
      const x = BOARD.x + column * columnWidth;
      graphics.fillStyle(presentation.tileShadowColor, 0.04);
      graphics.fillRect(x - 2, BOARD.y + 14, 3, BOARD.height - 28);
      graphics.fillStyle(presentation.tileHighlightColor, 0.035);
      graphics.fillRect(x + 2, BOARD.y + 18, 1, BOARD.height - 36);
    }

    for (let lane = 0; lane < BOARD.lanes; lane += 1) {
      for (let column = 0; column < BOARD.columns; column += 1) {
        const tile = getGrassTileMotionState(this.state.nowMs, lane, column);
        const cellX = BOARD.x + column * columnWidth;
        const cellY = BOARD.y + lane * laneHeight;
        const cellCenterX = cellX + columnWidth / 2;
        const cellCenterY = cellY + laneHeight / 2;

        graphics.fillStyle(presentation.tileWashColor, tile.cellWashAlpha);
        graphics.fillRect(cellX + 5, cellY + 7, columnWidth - 10, laneHeight - 14);
        graphics.fillStyle(presentation.tileHighlightColor, tile.topHighlightAlpha);
        graphics.fillRect(cellX + 10, cellY + 11, columnWidth - 20, 3);
        graphics.fillStyle(presentation.tileShadowColor, tile.bottomShadowAlpha);
        graphics.fillRect(cellX + 8, cellY + laneHeight - 15, columnWidth - 16, 5);
        graphics.lineStyle(1, presentation.tileShadowColor, tile.ridgeAlpha);
        graphics.strokeRect(cellX + 7, cellY + 8, columnWidth - 14, laneHeight - 16);

        const shimmerX = cellCenterX + tile.shimmerXRatio * columnWidth;
        const shimmerLength = laneHeight * 1.25;
        const shimmerAngle = -Math.PI / 3.2;
        const shimmerDx = Math.cos(shimmerAngle) * shimmerLength * 0.5;
        const shimmerDy = Math.sin(shimmerAngle) * shimmerLength * 0.5;
        graphics.lineStyle(Math.max(5, columnWidth * tile.shimmerWidthRatio), presentation.tileHighlightColor, tile.shimmerAlpha);
        graphics.strokeLineShape(
          new Phaser.Geom.Line(
            shimmerX - shimmerDx,
            cellCenterY - shimmerDy,
            shimmerX + shimmerDx,
            cellCenterY + shimmerDy
          )
        );

        if ((lane + column) % 2 === 0) {
          const bladeX = cellX + columnWidth * (0.22 + ((lane * 2 + column) % 4) * 0.14);
          const bladeY = cellY + laneHeight * 0.74 + tile.bladeYOffset;
          graphics.lineStyle(2, presentation.fleckAltColor, tile.bladeAlpha);
          graphics.strokeLineShape(new Phaser.Geom.Line(bladeX, bladeY, bladeX + tile.bladeLeanX, bladeY - 12));
          graphics.lineStyle(1, presentation.tileHighlightColor, tile.bladeAlpha * 0.28);
          graphics.strokeLineShape(new Phaser.Geom.Line(bladeX + 3, bladeY - 2, bladeX + tile.bladeLeanX * 0.62, bladeY - 10));
        }
      }
    }

    for (let index = 0; index < getGrassFleckCount(); index += 1) {
      const fleck = getGrassFleckMotionState(this.state.nowMs, index);
      const x = BOARD.x + fleck.xRatio * BOARD.width + fleck.driftX;
      const y = BOARD.y + fleck.yRatio * BOARD.height + fleck.driftY;
      const angle = Phaser.Math.DegToRad(fleck.rotationDeg);
      const dx = Math.cos(angle) * fleck.width;
      const dy = Math.sin(angle) * fleck.width * 0.45;
      graphics.lineStyle(
        Math.max(1, fleck.height),
        index % 3 === 0 ? presentation.fleckColor : presentation.fleckAltColor,
        fleck.alpha
      );
      graphics.strokeLineShape(new Phaser.Geom.Line(x - dx, y - dy, x + dx, y + dy));
    }

    for (let index = 0; index < getSceneDecorationCount(presentation.decoration); index += 1) {
      const decoration = getSceneDecorationState(presentation.decoration, this.state.nowMs, index);
      const x = BOARD.x + decoration.xRatio * BOARD.width;
      const y = BOARD.y + decoration.yRatio * BOARD.height;
      if (presentation.decoration === "dew-beads") {
        graphics.fillStyle(presentation.fleckColor, decoration.alpha * 0.7);
        graphics.fillCircle(x, y, decoration.size);
        graphics.fillStyle(0xffffff, decoration.alpha * 0.42);
        graphics.fillCircle(x - decoration.size * 0.25, y - decoration.size * 0.25, Math.max(1, decoration.size * 0.32));
      } else if (presentation.decoration === "star-glints") {
        graphics.lineStyle(2, presentation.fleckColor, decoration.alpha);
        graphics.strokeLineShape(new Phaser.Geom.Line(x - decoration.size, y, x + decoration.size, y));
        graphics.strokeLineShape(new Phaser.Geom.Line(x, y - decoration.size, x, y + decoration.size));
      } else {
        graphics.lineStyle(5, presentation.tileHighlightColor, decoration.alpha * 0.55);
        graphics.strokeLineShape(
          new Phaser.Geom.Line(x - decoration.size, y - decoration.size * 0.22, x + decoration.size, y + decoration.size * 0.22)
        );
      }
    }
  }

  private drawArmedLawnMowers(laneHeight: number, columnWidth: number): void {
    const x = BOARD.x + columnWidth * 0.22;
    this.state.mowerLanes.forEach((lane) => {
      const y = BOARD.y + lane * laneHeight + laneHeight / 2 + 10;
      this.add.ellipse(x + 2, y + 25, 88, 19, 0x0f2b1f, 0.14).setData("dynamic", true);
      this.add.ellipse(x, y + 22, 70, 15, 0x163622, 0.24).setData("dynamic", true);
      this.add.rectangle(x - 6, y + 31, 64, 4, 0xbde26c, 0.12).setData("dynamic", true);
      this.add
        .image(x, y, "lawn-mower")
        .setDisplaySize(70, 74)
        .setAngle(-6)
        .setData("dynamic", true);
      this.add
        .rectangle(x + 16, y - 32, 38, 5, 0xffd34f, 0.9)
        .setStrokeStyle(1, 0x8a633d, 0.34)
        .setData("dynamic", true);
    });
  }

  private drawLawnMowerEffects(laneHeight: number, columnWidth: number): void {
    this.state.events
      .filter((event) => event.type === "lawn-mower-triggered")
      .forEach((event) => {
        const progress = this.eventProgress(event, LONG_EFFECT_MS);
        if (progress >= 1) return;
        const eased = Phaser.Math.Easing.Cubic.Out(progress);
        const x = Phaser.Math.Linear(BOARD.x + columnWidth * 0.22, BOARD.x + BOARD.width + columnWidth * 0.45, eased);
        const y = BOARD.y + event.lane * laneHeight + laneHeight / 2 + 10;
        const alpha = 1 - progress * 0.2;

        this.add.ellipse(x - 4, y + 26, 106, 22, 0x0f2b1f, 0.14 * alpha).setData("dynamic", true);
        this.add.ellipse(x - 8, y + 23, 88, 18, 0x163622, 0.22 * alpha).setData("dynamic", true);
        this.add.rectangle(x - 44, y + 12, 70, 8, 0xbde26c, 0.24 * alpha).setData("dynamic", true);
        this.add.rectangle(x - 64, y + 2, 42, 5, 0xfff1a3, 0.22 * alpha).setData("dynamic", true);
        this.add
          .image(x, y, "lawn-mower")
          .setDisplaySize(86, 90)
          .setAngle(-3 + progress * 8)
          .setAlpha(alpha)
          .setData("dynamic", true);
        this.add
          .text(x - 4, y - 46, `清线 x${event.clearedCount}`, {
            fontSize: "14px",
            color: "#5c4330",
            fontStyle: "bold"
          })
          .setOrigin(0.5)
          .setAlpha(1 - progress)
          .setData("dynamic", true);
      });
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

    this.add.ellipse(x, y + 34, hero.shadowWidth + 20, hero.shadowHeight + 7, 0x0f2b1f, 0.12).setData("dynamic", true);
    this.add.ellipse(x, y + 30, hero.shadowWidth, hero.shadowHeight, 0x163622, 0.28).setData("dynamic", true);
    this.add
      .ellipse(x, y + 24, hero.ringWidth, hero.ringHeight, 0x8f5d32, 0.84)
      .setStrokeStyle(3, 0x35513f, 0.62)
      .setData("dynamic", true);
    this.add.ellipse(x, y + 18, hero.ringWidth * 0.72, 10, 0xfff1a3, 0.18).setData("dynamic", true);
    this.add
      .ellipse(x + 5, imageY - hero.imageHeight * 0.48, hero.imageWidth + 10, hero.imageHeight + 8, 0x1d3f2c, 0.16)
      .setData("dynamic", true);
    const heroImage = this.add.image(x, imageY, getPlantTextureKeyForScene(this.state.sceneThemeId, "peashooter"));
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
      .ellipse(x, y + 32, profile.baseWidth + 24, profile.baseHeight + 9, 0x0f2b1f, 0.11 + hitPulse * 0.04)
      .setData("dynamic", true);
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
    const plantImage = this.add.image(imageX, imageY, getPlantTextureKeyForScene(this.state.sceneThemeId, plant.plantId));
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
        y + 34,
        profile.shadowWidth * miniature.shadowScaleX + 18,
        profile.shadowHeight * miniature.shadowScaleY + 7,
        0x0f2b1f,
        0.12 + (chewing ? 0.03 : 0)
      )
      .setData("dynamic", true);
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
      getZombieTextureKeyForScene(this.state.sceneThemeId, zombie.zombieId)
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
