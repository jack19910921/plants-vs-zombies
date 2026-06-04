import type PhaserNamespace from "phaser";
import type { SoundId } from "./game/audio";
import { DEFAULT_SCENE_THEME_ID } from "./game/sceneThemes";
import type { ThreeStage } from "./game/ThreeStage";
import type { DifficultyId, GameState, SceneThemeId } from "./game/types";
import "./styles.css";
import { createScenePickerMarkup } from "./ui/scenePicker";

const gameRoot = document.querySelector("#game-root") as HTMLElement;
const threeRoot = document.querySelector("#three-root") as HTMLElement;
const uiRoot = document.querySelector("#ui-root") as HTMLElement;

let selectedSceneThemeId: SceneThemeId = DEFAULT_SCENE_THEME_ID;
let selectedDifficultyId: DifficultyId = "normal";
let isStartingGame = false;
let menuThreeStage: ThreeStage | null = null;
let menuThreeIdleHandle: number | null = null;
let menuThreeIdleHandleKind: "idle" | "timeout" | null = null;
let menuThreeLoadVersion = 0;

document.documentElement.dataset.motion = "full";
document.documentElement.dataset.scene = selectedSceneThemeId;

function renderLandingDecoration(): void {
  if (menuThreeStage) {
    menuThreeStage.setSceneTheme(selectedSceneThemeId);
    return;
  }

  threeRoot.innerHTML = `<div class="menu-scene-decoration menu-scene-decoration--${selectedSceneThemeId}" aria-hidden="true">
    <span class="menu-scene-decoration__stem"></span>
    <span class="menu-scene-decoration__leaf menu-scene-decoration__leaf--left"></span>
    <span class="menu-scene-decoration__leaf menu-scene-decoration__leaf--right"></span>
    <span class="menu-scene-decoration__tag"></span>
  </div>`;
}

function renderLandingMenu(): void {
  document.documentElement.dataset.scene = selectedSceneThemeId;
  uiRoot.innerHTML = createScenePickerMarkup({
    selectedSceneThemeId,
    difficultyId: selectedDifficultyId,
    isLoading: isStartingGame
  });
  renderLandingDecoration();
  scheduleMenuThreeStage();
}

function handleLandingPointerDown(event: PointerEvent): void {
  if (isStartingGame) return;
  const target = event.target as HTMLElement;
  const sceneButton = target.closest("[data-scene-theme]") as HTMLElement | null;
  if (!sceneButton) return;
  event.preventDefault();
  event.stopPropagation();
  selectedSceneThemeId = sceneButton.dataset.sceneTheme as SceneThemeId;
  renderLandingMenu();
}

function handleLandingClick(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  const difficultyButton = target.closest("[data-difficulty]") as HTMLElement | null;
  if (difficultyButton && !isStartingGame) {
    selectedDifficultyId = difficultyButton.dataset.difficulty as DifficultyId;
    renderLandingMenu();
    return;
  }

  const actionButton = target.closest("[data-action]") as HTMLElement | null;
  if (actionButton?.dataset.action === "start-scene" && !isStartingGame) {
    void startGame();
  }
}

function detachLandingMenu(): void {
  uiRoot.removeEventListener("pointerdown", handleLandingPointerDown);
  uiRoot.removeEventListener("click", handleLandingClick);
}

let destroyStartedGame: (() => void) | null = null;

type WindowWithIdleCallback = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

function cancelMenuThreeStageLoad(): void {
  menuThreeLoadVersion += 1;
  if (menuThreeIdleHandle === null) return;

  const idleWindow = window as WindowWithIdleCallback;
  if (menuThreeIdleHandleKind === "idle" && idleWindow.cancelIdleCallback) {
    idleWindow.cancelIdleCallback(menuThreeIdleHandle);
  } else {
    window.clearTimeout(menuThreeIdleHandle);
  }
  menuThreeIdleHandle = null;
  menuThreeIdleHandleKind = null;
}

function destroyMenuThreeStage(): void {
  cancelMenuThreeStageLoad();
  menuThreeStage?.destroy();
  menuThreeStage = null;
}

function scheduleMenuThreeStage(): void {
  if (isStartingGame || menuThreeStage || menuThreeIdleHandle !== null) return;

  const idleWindow = window as WindowWithIdleCallback;
  const loadVersion = menuThreeLoadVersion;
  const loadMenuThreeStage = (): void => {
    menuThreeIdleHandle = null;
    menuThreeIdleHandleKind = null;
    if (isStartingGame || menuThreeStage || loadVersion !== menuThreeLoadVersion) return;

    void import("./game/ThreeStage").then(({ ThreeStage: MenuThreeStage }) => {
      if (isStartingGame || menuThreeStage || loadVersion !== menuThreeLoadVersion) return;

      threeRoot.replaceChildren();
      menuThreeStage = new MenuThreeStage(threeRoot);
      menuThreeStage.setSceneTheme(selectedSceneThemeId);
    }).catch(() => undefined);
  };
  const scheduleIdleLoad = (): void => {
    menuThreeIdleHandle = null;
    menuThreeIdleHandleKind = null;
    if (isStartingGame || menuThreeStage || loadVersion !== menuThreeLoadVersion) return;

    if (idleWindow.requestIdleCallback) {
      menuThreeIdleHandle = idleWindow.requestIdleCallback(loadMenuThreeStage, { timeout: 1800 });
      menuThreeIdleHandleKind = "idle";
      return;
    }

    loadMenuThreeStage();
  };

  menuThreeIdleHandle = window.setTimeout(scheduleIdleLoad, 1200);
  menuThreeIdleHandleKind = "timeout";
}

async function startGame(): Promise<void> {
  isStartingGame = true;
  destroyMenuThreeStage();
  renderLandingMenu();

  try {
    const [{ default: Phaser }, { GameScene }, { ThreeStage }, audioModule, overlayModule] = await Promise.all([
      import("phaser"),
      import("./game/GameScene"),
      import("./game/ThreeStage"),
      import("./game/audio"),
      import("./ui/domOverlay")
    ]);
    const { createGameAudioController, getSoundForCombatEvent } = audioModule;
    const { createDomOverlay } = overlayModule;
    detachLandingMenu();
    threeRoot.replaceChildren();

    const scene = new GameScene({
      initialSceneThemeId: selectedSceneThemeId,
      initialDifficultyId: selectedDifficultyId,
      startInSelectedScene: true
    });
    const config = {
      type: Phaser.AUTO,
      parent: gameRoot,
      backgroundColor: "#eebf7a",
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1280,
        height: 720
      },
      scene: [scene]
    } satisfies PhaserNamespace.Types.Core.GameConfig;

    const game = new Phaser.Game(config);
    const threeStage = new ThreeStage(threeRoot);
    const audio = createGameAudioController();
    let reducedMotion = false;
    let seenThreeEventIds = new Set<string>();
    let seenAudioEventIds = new Set<string>();

    threeStage.setSceneTheme(scene.getCurrentSceneTheme().id);

    createDomOverlay(uiRoot, scene, {
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
      },
      reducedMotion,
      onToggleMotion: (enabled) => {
        reducedMotion = enabled;
        document.documentElement.dataset.motion = enabled ? "reduced" : "full";
        audio.play("button");
      }
    });
    scene.emitCurrentState();

    window.addEventListener(
      "pointerdown",
      () => {
        void audio.unlock().catch(() => undefined);
      },
      { once: true }
    );

    scene.uiEvents.on("state-changed", (state: GameState) => {
      document.documentElement.dataset.scene = state.sceneThemeId;
      threeStage.setSceneTheme(state.sceneThemeId);
      state.events.forEach((event) => {
        if (!reducedMotion && !seenThreeEventIds.has(event.id) && event.type === "sun-produced") {
          threeStage.pulseSunCollection();
        }
        if (!reducedMotion && !seenThreeEventIds.has(event.id) && event.type === "wave-spawned") {
          threeStage.pulseWaveAlert();
        }
        if (!reducedMotion && !seenThreeEventIds.has(event.id) && event.type === "potato-mine-exploded") {
          threeStage.pulsePotatoMineExplosion();
        }
        if (!reducedMotion && !seenThreeEventIds.has(event.id) && event.type === "level-ended") {
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
      if (!reducedMotion && soundId === "select") {
        threeStage.flipSeedPacket("select");
      }
      if (!reducedMotion && soundId === "plant") {
        threeStage.flipSeedPacket("plant");
        threeStage.swingGardenTool();
      }
      void audio.unlock().then((unlocked) => {
        if (unlocked) audio.play(soundId);
      }).catch(() => undefined);
    });

    destroyStartedGame = () => {
      audio.destroy();
      threeStage.destroy();
      game.destroy(true);
    };
  } catch (error) {
    isStartingGame = false;
    renderLandingMenu();
    console.error("Unable to start game", error);
  }
}

uiRoot.addEventListener("pointerdown", handleLandingPointerDown);
uiRoot.addEventListener("click", handleLandingClick);
window.addEventListener("beforeunload", () => {
  destroyStartedGame?.();
});

renderLandingMenu();
