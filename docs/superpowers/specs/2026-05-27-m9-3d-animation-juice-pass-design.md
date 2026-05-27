# M9 3D Animation Juice Pass Design

## Goal

Make the existing Three.js prop layer feel more like a lively toy tabletop without changing game rules, adding external assets, or obscuring the Phaser board and DOM plant tray.

## Current Observation

Desktop and mobile browser checks show a clean console and a readable layout. The 3D layer is safely tucked into the upper-left stage: the sun coin, seed packet, garden tool, wave stake, sun trail, and status badge support the toy feel without blocking the board. The main gap is event choreography: selection and planting read as small pulses, and the M8 potato mine explosion has Phaser dirt feedback but no dedicated Three.js moment.

## Animation Direction

Keep all new effects procedural and brief. Use warm light, small geometric particles, squash/stretch, and staged timing rather than larger UI panels. Persistent motion should stay subtle; event effects should peak quickly and fade before they interfere with reading the lanes.

Event treatment considered:

- Selected plant: make the seed packet flip catch a small diagonal light sweep so the chosen card feels like a physical toy packet.
- Planting: keep the garden tool swing, with future room for a landing dust/spark helper near the tool.
- Sun production: existing coin pulse and trail are already a good baseline; future pass can add particle depth and sparkle staggering.
- Wave arrival: existing warning stake is readable; future pass can add a friendlier red/yellow blink cadence.
- Potato mine explosion: add a miniature Three.js tabletop shockwave with dirt chunks and warm flash, tied to `potato-mine-exploded`.
- Victory: future pass can expand the badge into a reward ceremony with stars or paper confetti.
- Failure: future pass should stay gentle, like a toy sign dipping or dimming, not scary.

## Chosen Slice

This M9 slice implements two focused upgrades:

1. Seed packet light sweep driven by `getSeedPacketFlipState`.
2. Three.js potato mine shockwave driven by a new presentation helper and triggered from the existing combat event stream.

## Architecture

Keep deterministic timing math in `src/game/threePresentation.ts` and cover it with Vitest. Keep Three.js meshes and materials in `src/game/ThreeStage.ts`, treating the render graph as an adapter over event state. Wire the new event in `src/main.ts` alongside existing sun, wave, and level event handling.

No external assets are added, so `docs/asset-sources.md` does not change.

## Boundaries

- No rules changes.
- No new art files, audio files, or dependencies.
- No full-screen Three overlay.
- No long-running particle systems.
- Keep the mobile stage compact and non-interactive.

## Verification

- Unit tests cover seed shine timing and potato shockwave particle timing.
- Browser smoke covers desktop and mobile console warning/error checks.
- Browser smoke checks the 3D canvas area is visible and changes between animation frames.
- Final verification runs `npm test`, `npm run build`, and `git diff --check`.
