# M11c Projectile And Sun Polish Design

## Goal

Bring projectile beads and sun-production pickup feedback closer to the M11 toy asset style without adding new files or changing gameplay.

## Scope

Included:

- Add test-backed presentation helpers for projectile palettes and sun pickup feedback.
- Give normal projectiles a green toy-bead look and ice projectiles a brighter blue glow.
- Add a small halo/glint/fade treatment to sun pickup feedback.
- Keep projectile hit timing, damage, speed, and sun economy unchanged.

Excluded:

- New particle systems.
- New external or generated asset files.
- Heavy browser screenshot smoke.

## Architecture

`src/game/worldPresentation.ts` owns deterministic visual parameters. `GameScene` consumes those helpers when drawing projectile circles and the existing sun-produced feedback. This keeps tuning testable and avoids spreading more magic colors through the renderer.

## Verification

- `src/game/worldPresentation.test.ts` covers projectile palette separation and sun pickup fade/scale behavior.
- Final verification uses `npm test`, `npm run build`, and `git diff --check`.
