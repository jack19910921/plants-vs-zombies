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
});
