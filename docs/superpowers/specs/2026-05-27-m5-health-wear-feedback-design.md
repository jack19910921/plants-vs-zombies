# M5 Health Wear Feedback Design

## Goal

Make damage visible on the characters themselves, not only in small health bars.

## Player Experience

- Full-health figures should look clean.
- Damaged plants should gain small cracks and a warm warning wash.
- Damaged enemies should gain scratch/scuff marks and a stronger danger flash near low health.
- Feedback should stay decorative and must not hide the existing asset art or health bars.

## Chosen Approach

Add a pure `getHealthWearState(currentHp, maxHp)` helper in `src/game/worldPresentation.ts`. `GameScene` will use that helper to draw a few lightweight Phaser line/ellipse overlays on plants and enemies.

This keeps rules unchanged. The helper is generic so it can support both plant and enemy rendering without duplicating threshold math.

## Boundaries

- No combat math changes.
- No new assets.
- No persistent scene state.
- Keep overlays subtle enough for mobile readability.

## Verification

- Unit tests cover full, damaged, and critical health states.
- Browser checks verify damage overlays appear during combat without console warnings/errors.
- `npm test`, `npm run build`, and `git diff --check` must pass before commit.
