# M11f Lawn Mower Defense Design

## Goal

Move the image2 lawn mower off the decorative Three.js corner and onto the grass as a limited final-defense weapon.

## Scope

- Add per-level `mowerLanes` so only one or two lanes have a mower.
- Store remaining armed mower lanes in `GameState`.
- When a zombie breaches an armed lane, trigger the mower once, clear zombies in that lane, emit a combat event, and remove that lane's mower.
- If a zombie breaches an unarmed or already-used lane, the level still fails.
- Render armed mowers on the left edge of their grass lanes and show a short sweep effect when triggered.

## Non-Goals

- No five-lane mower coverage.
- No new asset files, economy changes, plant cards, or manual mower control.

## Verification

- Config tests assert every level has only one or two unique mower lanes.
- Rules tests cover initial mower state, one-shot clear, defeated events, and failure on unarmed lanes.
- Full test/build/diff checks must pass before commit.
