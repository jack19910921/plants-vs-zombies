import { defineConfig } from "vite";

export function manualChunks(id: string): string | undefined {
  if (id.includes("node_modules/phaser")) return "engine-phaser";
  if (id.includes("node_modules/three")) return "engine-three";
  return undefined;
}

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1800,
    rollupOptions: {
      output: {
        manualChunks
      }
    }
  }
});
