# M11g Grass 3D Animation Design

## Goal

Make the grass board feel deeper and more alive without changing rules, grid coordinates, levels, plants, enemies, or asset sources.

## Scope

- Add a lightweight animated grass overlay on the existing Phaser board.
- Give tiles subtle breathing wash, moving light shimmer, top highlights, bottom shadows, and small wind-leaning blades.
- Add a small number of procedural grass flecks so the field feels less static.
- Improve contact shadows for plants, zombies, the hero shooter, and lawn mowers so objects sit into the grass.
- Keep all motion decorative and derived from presentation helpers.

## Non-Goals

- No official PVZ assets.
- No new non-code assets.
- No gameplay rule, collision, board size, level, economy, or entity behavior changes.
- No repeated heavy browser smoke loop for this visual pass.

## Architecture

`src/game/worldPresentation.ts` owns deterministic grass animation values. `src/game/GameScene.ts` renders those values as one lightweight dynamic Phaser Graphics layer behind entities, then draws existing entities above it. This keeps the animated board visual testable and prevents scattered magic opacity/quantity constants in the scene.

## Verification

- `worldPresentation.test.ts` covers grass tile opacity, shimmer bounds, depth layering, motion variation, and fleck count/board bounds.
- Full `npm test`, `npm run build`, and `git diff --check` must pass before commit.
