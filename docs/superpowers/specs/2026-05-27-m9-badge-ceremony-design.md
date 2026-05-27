# M9 Badge Ceremony Design

## Goal

Make level-end feedback feel more ceremonial while staying bright, child-friendly, and safely tucked into the existing Three.js toy stage.

## Current Observation

The current level-end badge appears in the upper-left Three.js stage, rotates, bobs, and fades after several seconds. It is readable and non-obstructive, but victory and failure mostly differ by color. Victory does not yet feel like a reward ritual, and failure is visually close to danger coloring rather than a gentle toy-tabletop reset.

## Chosen Slice

Add a procedural status badge ceremony helper:

- Victory: the badge pops in with a larger bounce, brightens briefly, and emits small star/confetti particles around the badge.
- Failure: the badge dips like a small toy sign, turns slightly, dims gently, and emits no sharp warning particles.

## Architecture

Keep timing math in `src/game/threePresentation.ts` with a new `getStatusBadgeState(ageMs, mode, particleIndex)` helper. `src/game/ThreeStage.ts` will keep rendering details: the existing badge mesh gets driven by the helper, and a small particle group is added for victory stars only. Existing `showLevelBadge(status)` remains the public event trigger.

No game rules, Phaser board drawing, DOM HUD markup, audio, dependencies, or external assets change.

## Visual Boundaries

- The ceremony stays inside the current upper-left Three.js stage.
- Victory particles are few, small, and short-lived.
- Failure feedback uses dimming and a toy sign tilt rather than scary colors or shake.
- Effects fade out using the existing badge lifetime window.

## Verification

- Vitest covers victory pop/particle visibility, failure dip/dim behavior, and hide-after-lifetime behavior.
- Browser smoke checks desktop and mobile console warning/error counts, 3D stage frame changes, and that the 3D stage remains away from the plant tray.
- Final verification runs `npm test`, `npm run build`, and `git diff --check`.
