# M3 Difficulty Selection Design

## Goal

Add a small easy/normal difficulty choice so the two-level flow can be tuned for a child without duplicating level data or moving balance rules into Phaser rendering code.

## Player Experience

The game keeps its immediate playable first screen. The HUD gains a compact segmented control with two choices:

- `轻松`: more starting sun, lower zombie health, slower zombie movement.
- `普通`: the current baseline balance.

Changing difficulty restarts the current level immediately. This keeps the rule surface understandable: a selected difficulty always applies to the entire current run, not half of a wave already in progress.

## Architecture

`src/game/config.ts` remains the source of difficulty multipliers. `src/game/rules.ts` accepts a `DifficultyConfig` argument for initial sun, zombie spawning, and zombie movement. `GameScene` stores the selected difficulty ID, exposes it to the DOM overlay, and restarts the current level when the player changes difficulty.

The DOM overlay renders the segmented control and sends `setDifficulty()` events to `GameScene`. It does not compute balance values. Phaser drawing still only reflects the current `GameState`.

## Testing

Rules tests cover:

- easy mode grants more starting sun than normal.
- easy mode spawns lower-health zombies.
- easy mode moves zombies more slowly.

DOM tests cover:

- markup renders both difficulty choices.
- the active difficulty is visibly selected.

Browser verification covers:

- the difficulty control appears on desktop and mobile without breaking the HUD.
- selecting/planting/pause/sound still work.
- console warnings/errors remain at zero.

## Scope Boundaries

This slice does not add a full level-select screen, saved progress, or custom difficulty sliders. Those belong after M3 has the basic sequence and balance controls working.
