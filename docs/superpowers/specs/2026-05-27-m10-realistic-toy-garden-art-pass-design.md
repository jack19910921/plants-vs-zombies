# M10 Realistic Toy Garden Art Pass Design

## Goal

Make the game read more like a real toy garden set on a tabletop without adding external assets or copyrighted material.

## Chosen Approach

Use procedural art only:

- Phaser draws a richer wooden tabletop and garden tray using gradients, planks, shadows, soil strips, and small pebbles.
- Three.js adds a permanent miniature prop layer behind the existing event props: tiny pots, a watering can, a seed crate, pebble markers, and warm depth lighting.
- Animation event props keep their current compact footprint so the board and plant cards stay readable.

This keeps licensing simple and preserves the current private prototype pipeline.

## Scope

Included:

- A testable presentation helper for toy-garden prop layout and materials.
- Three.js procedural props built from geometry and standard materials.
- Phaser board/table drawing polish that remains lightweight and responsive.
- Browser smoke verification on the existing local app.

Excluded:

- Downloaded image textures, GLB files, or AI-generated raster assets.
- Major gameplay, economy, HUD, or plant/zombie behavior changes.
- Replacing current plant and zombie source images.

## Visual Direction

- Brighter, realistic toy-desk feel: warm wood, green tray, soft ceramic/metal props.
- Miniature scale: objects look like small tabletop models, not full-size garden tools.
- Child-friendly: no horror, gore, dark mood, or harsh flashes.
- Low obstruction: persistent props sit around the compact Three.js stage and outside critical board/card interaction zones.

## Architecture

Keep deterministic visual choices in `src/game/threePresentation.ts` and render them in `src/game/ThreeStage.ts`. Keep Phaser board polish in `src/game/GameScene.ts` because the board is already drawn there. CSS body background can receive a stronger tabletop base but should not introduce layout changes.

## Verification

- Vitest covers prop layout count, material palette diversity, and safe bounds.
- Browser smoke checks console warning/error count, canvas presence, frame changes, and visible sun/HUD text.
- Final commands: `npm test`, `npm run build`, `git diff --check`.
