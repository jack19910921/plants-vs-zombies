# M6 Mobile And Touch Hardening Design

## Goal

Make the current prototype comfortable to play on phone and tablet screens without changing the core lane-defense rules.

## Player Experience

- A child on a touch device can move the小队长 with large up/down buttons near the right edge.
- Plant cards, pause, sound, difficulty, and modal buttons stay tappable at mobile widths.
- Chinese HUD text wraps cleanly instead of overflowing or shrinking into unreadable controls.
- Safe-area insets are respected so controls avoid notches and home indicators.

## Chosen Approach

Use a small shared rules helper, `moveHeroLane(state, delta)`, so keyboard and touch movement use the same clamped lane logic. Add DOM lane controls with `data-action="lane-up"` and `data-action="lane-down"` in the overlay, then wire them to a public `GameScene.moveHeroLane(delta)` method.

For layout, keep the game world in Phaser and the dense controls in DOM. Replace the current mobile HUD transform scaling with real responsive grid sizing, apply safe-area CSS variables, and set explicit minimum touch sizes on chips, cards, lane controls, and modal actions.

## Boundaries

- No new external assets.
- No new gameplay systems or plant behavior.
- No always-on explanatory panels; tutorial copy stays short and contextual.
- Preserve desktop layout while tightening mobile behavior.

## Verification

- Rule tests cover lane clamping.
- DOM tests cover lane-control markup and click wiring.
- Browser smoke checks cover desktop and narrow mobile viewports with clean console output.
- `npm test`, `npm run build`, and `git diff --check` must pass before commit.
