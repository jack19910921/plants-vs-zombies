# M4 Sun Collection Trail Design

## Goal

Make produced sun feel collectible and physical by adding a short 3D trail of warm light beads that flies into the existing 3D sun coin when a sunflower generates sun.

## Player Experience

- When sun is produced, the top-left 3D coin should brighten and a few golden beads should arc toward it.
- The trail should be quick, readable, and decorative. It must not cover the board or require player interaction.
- The effect should feel like a tabletop toy reward, matching the existing 3D coin, seed packet, garden tool, and wave marker.

## Chosen Approach

Use the existing `sun-produced` event path. `src/main.ts` already calls `ThreeStage.pulseSunCollection()`, so this slice only expands the Three.js presentation layer.

The stable animation math lives in `src/game/threePresentation.ts` as a pure helper. `src/game/ThreeStage.ts` owns meshes, materials, opacity, and render-loop application. Game rules and sun economy stay unchanged in `src/game/rules.ts`.

## Alternatives Considered

- Phaser sprites over the board: easier to place near sunflowers, but it would duplicate the existing 3D reward language.
- Full 3D objects mapped to board coordinates: more spatially accurate, but too much surface area for this slice.
- Add the trail inside the existing burst only: cheapest, but it would read as an explosion instead of collection.

## Boundaries

- No gameplay state in Three meshes.
- No new external assets.
- No changes to sun amount, generation timing, or plant behavior.
- No heavy post-processing or shader stack.

## Verification

- Unit tests cover trail visibility, motion toward the coin, staggered particles, and final hiding.
- Browser check confirms the WebGL canvas changes after a sunflower produces sun and console warnings/errors remain at zero.
- `npm test`, `npm run build`, and `git diff --check` must pass before commit.
