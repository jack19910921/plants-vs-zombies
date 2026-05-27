import { describe, expect, it } from "vitest";
import config, { manualChunks } from "../../vite.config";

describe("vite packaging config", () => {
  it("splits heavy engine dependencies into stable production chunks", () => {
    expect(manualChunks("/repo/node_modules/phaser/dist/phaser.esm.js")).toBe("engine-phaser");
    expect(manualChunks("/repo/node_modules/three/build/three.module.js")).toBe("engine-three");
    expect(manualChunks("/repo/src/game/GameScene.ts")).toBeUndefined();
  });

  it("uses an engine-sized chunk warning budget", () => {
    const build = typeof config === "object" && "build" in config ? config.build : undefined;

    expect(build?.chunkSizeWarningLimit).toBeGreaterThanOrEqual(1800);
  });
});
