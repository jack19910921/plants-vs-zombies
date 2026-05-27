# M9 Feedback Closeout Design

## Goal

Finish the remaining M9 animation polish by strengthening sun collection, wave warning, and planting feedback in the existing compact Three.js toy stage.

## Remaining Enhancements

- Sun collection should feel more layered: not only beads flying inward, but also a small halo/sparkle pulse that gives depth.
- Wave arrival should feel more ceremonial: the warning stake should have a friendly beacon pulse, like a little stage prop calling attention.
- Planting should have a landing moment: the garden tool swing should kick up tiny dust/spark pieces near the tool blade.

## Chosen Slice

Implement all three as procedural Three.js effects driven by deterministic presentation helpers:

1. Extend `getSunTrailParticleState` with halo and shimmer fields.
2. Extend `getWaveWarningStakeState` with beacon and glow fields.
3. Add `getPlantingSparkState(ageMs, index)` for planting dust/spark particles.

## Architecture

Keep timing math in `src/game/threePresentation.ts` and render objects in `src/game/ThreeStage.ts`. `swingGardenTool()` becomes the trigger for the planting spark group, because it is already called only when a plant is successfully placed. Existing event wiring and game rules do not change.

No external assets, dependencies, Phaser board drawing, or DOM HUD markup change.

## Visual Boundaries

- Effects stay inside the upper-left Three.js stage.
- Sun halo and wave beacon use low particle counts and fade quickly.
- Planting spark is symbolic near the toy garden tool, not a board-space explosion.
- Mobile keeps the same small stage dimensions and non-interactive behavior.

## Verification

- Vitest covers the new helper fields and planting spark lifetime/staggering.
- Browser smoke checks desktop and mobile console warning/error counts, nonblank 3D canvas, frame changes, and no plant-tray obstruction.
- Final verification runs `npm test`, `npm run build`, and `git diff --check`.
