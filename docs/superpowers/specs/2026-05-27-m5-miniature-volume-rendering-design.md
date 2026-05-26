# M5 Miniature Volume Rendering Design

## Goal

Make plants and enemies feel less like flat tokens and more like small tabletop figures while continuing to use the existing safe, localized assets.

## Player Experience

- Plants should look anchored to the lane with a small base, stem support, contact shadow, and slight squash/stretch during firing or damage.
- Enemies should feel heavier through foot shadows, side depth, lunge motion while chewing, and stronger hit recoil.
- The board should remain readable on desktop and mobile. Health bars, projectiles, and HUD should not be obscured.

## Chosen Approach

Add a small pure presentation module, `src/game/worldPresentation.ts`, that computes stable shape values for miniature volume effects. `src/game/GameScene.ts` will consume those values while drawing Phaser primitives and existing localized images.

This keeps game rules unchanged and makes the new visual behavior testable without needing to render Phaser in unit tests.

## Rendering Details

- Plant figures get a base ellipse, subtle stem rectangle, back-plate shadow, image squash/stretch, rim stroke, and highlight.
- Zombie figures get a stronger contact shadow, foot pads, side depth backing, image squash/stretch, rim stroke, and lunge/hit offsets.
- Existing event pulses remain the inputs: fire pulse, hit pulse, chewing state, and slow state.

## Boundaries

- No new external assets in this slice.
- No changes to combat math, sun economy, waves, or collision.
- No new gameplay state.
- Keep draw calls lightweight and scoped to dynamic world redraws.

## Verification

- Unit tests cover the pure presentation helpers for firing, damage, chewing, and hit recoil.
- Browser screenshot checks desktop and mobile layout after the drawing changes.
- `npm test`, `npm run build`, `git diff --check`, and browser console checks must pass before commit.
