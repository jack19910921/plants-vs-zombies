# M3 Three-Level Sequence Design

## Goal

Finish the basic M3 sequence by expanding the prototype from two levels to three and making the final victory state read like a completed mini-run.

## Player Experience

The player starts on `阳光草坪`, advances to `薄雾菜园`, then reaches a third harder level named `暮色农圃`. The existing `下一关` button appears while another level remains. On the last victory, the modal changes copy to celebrate that all current levels are cleared and offers replay.

## Architecture

Level data stays in `src/game/config.ts` as `LEVELS`. `GameScene` already tracks `currentLevelIndex`, so no new progression system is needed. The DOM overlay already receives `hasNextLevel`; it can use that value to choose final-victory copy without touching rules.

## Testing

Config tests should require at least three unique levels and verify the final level has a distinct wave count. DOM tests should verify last-level victory uses the completion copy and still exposes `data-action="restart"`.

## Scope Boundaries

This slice does not add save files, a world map, or a level-select screen. Those can come later if the prototype needs replayability beyond the current mini-run.
