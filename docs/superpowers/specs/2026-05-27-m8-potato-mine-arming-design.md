# M8 Potato Mine Arming Design

## Goal

Make the existing `土豆雷` plant behave like a delayed trap so the third level gains a distinct tactical choice.

## Player Experience

- The player can plant `土豆雷` cheaply in an enemy lane.
- It does not explode immediately; it needs its existing `armsAfterMs` delay.
- Once armed, a zombie entering the same cell triggers a small burst.
- The burst removes the mine, damages nearby zombies in the same lane, and shows a short ground shockwave.

## Chosen Approach

Use the existing `PlantConfig.armsAfterMs` and `PlantConfig.damage` fields. In `advanceCombat`, before ordinary chewing/movement resolution, scan armed trap plants and zombies in the same lane within a tight cell radius. Trigger at most once per mine per tick, apply damage to lane-local zombies, remove the spent mine, and emit a `potato-mine-exploded` combat event.

The Phaser layer listens to that event and draws a short-lived dirt burst around the planted cell. Audio maps the new event to the existing gentle `hit` sound to avoid adding audio assets.

## Boundaries

- No new external assets.
- No new plant cards or level configuration.
- Do not change locked/unlocked progression.
- Keep the explosion lane-local and simple; no chain reactions or global area damage in this slice.

## Verification

- Rules tests cover unarmed mines not exploding and armed mines exploding.
- Audio tests cover the new event mapping.
- Build and browser smoke verify the new event type does not break rendering.
