# M4 Wave Warning Stake Design

## Goal

Make incoming waves feel more physical by adding a small 3D warning stake with a flag when zombies arrive.

## Player Experience

When a wave spawns, the existing 3D alert pulse is joined by a little red garden stake/flag that pops up, wobbles, and fades. It should feel like a tabletop marker being placed on the board to say "danger is coming." It remains decorative and does not change wave timing, spawning, or combat.

## Architecture

`src/game/threePresentation.ts` adds a pure `getWaveWarningStakeState(ageMs)` helper. `ThreeStage.pulseWaveAlert()` already receives wave-spawn events, so the new mesh can reuse `wavePulseStartedAt` without new gameplay wiring.

## Testing

Unit tests cover visibility at the start, higher scale during the pop, and hidden state after expiry. Browser verification checks that waiting for a wave changes Three canvas pixels and that the page console remains clean.
