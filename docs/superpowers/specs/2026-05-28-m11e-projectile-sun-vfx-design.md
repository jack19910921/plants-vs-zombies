# M11e Projectile And Sun VFX Design

## Goal

Remove the last obvious procedural "green ball" look from the player shooter and make projectile and sun feedback feel more dimensional, using the already-approved image2 assets.

## Scope

- Replace the procedural hero shooter body with the image2 peashooter texture, plus a small base plate, shadow, rim, gloss, and muzzle flash.
- Keep projectile gameplay unchanged, but render pea/ice shots with image2 cores, layered particle trails, glow rings, shadows, and spark highlights.
- Keep sun economy unchanged, but render produced sun with a rotating token, halo, radial beams, and orbiting spark particles.

## Non-Goals

- No new assets, plant types, enemy types, economy changes, or level changes.
- No heavy browser screenshot loop for this pass.

## Verification

- `worldPresentation.test.ts` covers the new hero, projectile particle, and sun particle presentation parameters.
- Full `npm test`, `npm run build`, and `git diff --check` must pass before commit.
