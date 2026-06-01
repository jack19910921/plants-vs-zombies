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

describe("GameScene run challenges", () => {
  it("starts a level with a run challenge and modifier announcement", async () => {
    const { GameScene } = await import("./GameScene");
    const scene = new GameScene() as unknown as {
      startCurrentLevel: () => void;
      getCurrentRunChallenge: () => unknown;
      getCurrentModifierAnnouncement: () => string | null;
    };

    scene.startCurrentLevel();

    expect(scene.getCurrentRunChallenge()).toMatchObject({
      objective: expect.objectContaining({ label: expect.any(String) }),
      modifier: expect.objectContaining({ announcement: expect.stringContaining("：") })
    });
    expect(scene.getCurrentModifierAnnouncement()).toContain("：");
  });
});
