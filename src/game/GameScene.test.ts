import { describe, expect, it, vi } from "vitest";

vi.mock("phaser", () => ({
  default: {
    Scene: class {
      constructor(_key: string) {}
    },
    Events: {
      EventEmitter: class {
        emit = vi.fn();
        on = vi.fn();
      }
    },
    Loader: {
      Events: {
        COMPLETE: "complete"
      }
    }
  }
}));

describe("GameScene menu and run challenges", () => {
  it("starts in menu with the default scene and no run challenge", async () => {
    const { GameScene } = await import("./GameScene");
    const scene = new GameScene();

    expect(scene.getCurrentStatus()).toBe("menu");
    expect(scene.getCurrentSceneTheme().id).toBe("sunny-lawn");
    expect(scene.getCurrentRunChallenge()).toBeNull();
  });

  it("selects a scene before starting the level", async () => {
    const { GameScene } = await import("./GameScene");
    const scene = new GameScene();

    scene.setSelectedSceneTheme("dewy-garden");

    expect(scene.getCurrentStatus()).toBe("menu");
    expect(scene.getCurrentSceneTheme().id).toBe("dewy-garden");
  });

  it("starts a selected scene with a run challenge and modifier announcement", async () => {
    const { GameScene } = await import("./GameScene");
    const scene = new GameScene();

    scene.setSelectedSceneTheme("starlight-farm");
    scene.startSelectedScene();

    expect(scene.getCurrentStatus()).toBe("playing");
    expect(scene.getCurrentSceneTheme().id).toBe("starlight-farm");
    expect(scene.getCurrentRunChallenge()).toMatchObject({
      objective: expect.objectContaining({ label: expect.any(String) }),
      modifier: expect.objectContaining({ announcement: expect.stringContaining("：") })
    });
    expect(scene.getCurrentModifierAnnouncement()).toContain("：");
  });

  it("can start immediately from a selected scene for the lazy-loaded game boot", async () => {
    const { GameScene } = await import("./GameScene");
    const scene = new GameScene({
      initialSceneThemeId: "dewy-garden",
      initialDifficultyId: "easy",
      startInSelectedScene: true
    });

    expect(scene.getCurrentStatus()).toBe("playing");
    expect(scene.getCurrentSceneTheme().id).toBe("dewy-garden");
    expect(scene.getCurrentDifficultyId()).toBe("easy");
    expect(scene.getCurrentRunChallenge()).not.toBeNull();
  });

  it("returns from a run to the scene picker while keeping the selected scene", async () => {
    const { GameScene } = await import("./GameScene");
    const scene = new GameScene();

    scene.setSelectedSceneTheme("dewy-garden");
    scene.startSelectedScene();
    scene.returnToMenu();

    expect(scene.getCurrentStatus()).toBe("menu");
    expect(scene.getCurrentSceneTheme().id).toBe("dewy-garden");
    expect(scene.getCurrentRunChallenge()).toBeNull();
  });

  it("preloads only the initially selected scene-specific image2 overrides", async () => {
    const { GameScene } = await import("./GameScene");
    const scene = new GameScene({ initialSceneThemeId: "dewy-garden" });
    const image = vi.fn();
    Object.assign(scene, {
      load: {
        image,
        once: vi.fn()
      },
      textures: {
        exists: vi.fn(() => false)
      }
    });

    scene.preload();

    const queuedKeys = image.mock.calls.map(([key]) => key);
    const queuedUrls = image.mock.calls.map(([, url]) => String(url)).join(" ");
    expect(queuedKeys).toContain("scene-board-dewy-garden");
    expect(queuedKeys).toContain("plant-dewy-garden-peashooter");
    expect(queuedKeys).toContain("zombie-dewy-garden-basic");
    expect(queuedKeys).not.toContain("scene-board-starlight-farm");
    expect(queuedKeys).not.toContain("plant-starlight-farm-sunflower");
    expect(queuedKeys).not.toContain("zombie-starlight-farm-basic");
    expect(queuedUrls).not.toContain("image2-starlight-board.png");
    expect(queuedUrls).not.toContain("image2-starlight-peashooter.png");
    expect(queuedUrls).not.toContain("image2-starlight-zombie-basic.png");
  });
});
