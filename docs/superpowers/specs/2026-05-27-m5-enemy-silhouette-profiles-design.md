# M5 Enemy Silhouette Profiles Design

## Goal

Make enemy variants read as distinct tabletop figures instead of one shared body with small hard-coded props.

## Player Experience

- Basic enemies should stay readable and light.
- Cone enemies should look taller and slightly top-heavy because of the warning cone.
- Bucket enemies should look wider, heavier, and more protected.
- Hit, slow, and chewing feedback should still be clear after the profile changes.

## Chosen Approach

Add a pure `getZombieMiniatureProfile(zombieId)` helper in `src/game/worldPresentation.ts`. `GameScene` will use the profile for body size, shadow size, foot pads, rim color, tint, and headgear geometry.

This keeps all gameplay state and combat math unchanged. Rendering remains Phaser-only and derived from the current simulation state.

## Boundaries

- No rule changes and no new enemy behavior.
- No new external assets.
- No protected PVZ assets or names.
- Keep profile values conservative so enemies remain readable in mobile view.

## Verification

- Unit tests cover basic, cone, and bucket profile differences.
- Browser checks verify enemies render on desktop and mobile without console warnings/errors.
- `npm test`, `npm run build`, and `git diff --check` must pass before commit.
