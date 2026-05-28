# M11f Lawn Mower Defense Plan

**Goal:** Move the mower onto the grass as a limited one-shot defense on only one or two lanes per level.

## Checklist

- [x] Confirm current config, rules, and render hooks.
- [x] Add failing config/rules tests for limited mower lanes and one-shot clearing.
- [x] Add `mowerLanes` to level config and game state.
- [x] Trigger mower clearing only when an armed lane is breached.
- [x] Keep unarmed or spent lanes as normal failure paths.
- [x] Move mower rendering from Three.js decoration to Phaser grass lanes.
- [x] Update asset source note and roadmap.
- [x] Run full verification.
- [x] Commit the mower defense change.
