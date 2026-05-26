# M3 Level Progression And Difficulty Design

## Goal

Turn the game from a single isolated level into a small sequence while preserving the current rules/rendering boundaries.

## First Slice Scope

In scope:

- Add multiple level configs.
- Keep `LEVEL_ONE` as a compatibility export while introducing `LEVELS`.
- Make `GameScene` own a current level index and use the current level for initial state, spawning, status, restart, and UI.
- Add a victory next-level action when another level exists.
- Show the current level name in the HUD/modal.

Out of scope for this slice:

- Difficulty selection.
- Level select screen.
- Saving progress.
- New enemies or assets.
- Rebalancing all waves.

## Architecture

Level data stays configuration-only. Rules continue to accept `LevelConfig` as a parameter, so most rules should not change.

`GameScene` should replace direct `LEVEL_ONE` usage with a `currentLevel` getter. DOM overlay should receive level metadata from `GameState` rendering context instead of importing one fixed level for all UI labels.

Keep the first slice small:

- `src/game/config.ts`: add `LEVELS` with two or three levels.
- `src/game/GameScene.ts`: add `nextLevel()` and use current level everywhere.
- `src/ui/domOverlay.ts`: render level name and next-level button.

## UI Design

The top HUD should show level name alongside wave progress, for example `阳光草坪 · 第 1 波 / 8`.

On victory:

- If a next level exists, modal action is `下一关`.
- If no next level exists, modal action remains `再玩一次`.

On failure:

- Modal action remains `再玩一次`.

## Testing

Add tests for:

- Level list contains at least two levels with unique IDs.
- Wave text uses the supplied level, not a fixed `LEVEL_ONE`.
- Victory modal renders `下一关` when `hasNextLevel` is true.
- Victory modal renders `再玩一次` when `hasNextLevel` is false.

## Acceptance Criteria

- Player can win level one and start level two without reloading the page.
- Restart restarts the current level.
- Existing one-level tests keep passing.
- `npm test` passes.
- `npm run build` passes.
- Browser check shows level name and next-level action without HUD overlap.
