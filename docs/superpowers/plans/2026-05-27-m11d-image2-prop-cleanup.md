# M11d Image2 Prop Cleanup Plan

**Goal:** Use the user-provided 007-014 image2 PNGs to replace the called-out fake-looking enemies, props, sun, and projectile visuals.

## Checklist

- [x] Confirm worktree and residual service state lightly.
- [x] Add failing asset registry expectations for the new image2 files.
- [x] Process 007-014 into transparent, cropped, downscaled PNGs under `src/assets/generated/m11/`.
- [x] Update asset exports and renderer preload paths.
- [x] Swap Phaser enemy, projectile, sun feedback, and base sign rendering to the new textures.
- [x] Swap the Three.js sun token and garden tool prop to image2 textures.
- [x] Update DOM sun/cost icon rendering.
- [x] Record asset sources and roadmap status.
- [x] Run full tests, build, and diff hygiene checks.
- [x] Commit the completed cleanup pass.
