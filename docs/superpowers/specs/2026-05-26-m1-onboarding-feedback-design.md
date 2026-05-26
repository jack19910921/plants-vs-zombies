# M1 Onboarding And Child-Friendly Feedback Design

## Goal

Make the current playable slice understandable in the first minute for a child or supervising adult. The player should know what to do next, see why an action did not work, and receive small positive reinforcement for early success.

## Scope

In scope:

- A compact tutorial prompt in the DOM HUD.
- Step progression for the first core actions: choose a plant, plant on the board, move the hero lane, survive the first wave, and use pause/restart.
- Invalid-action feedback for no selected plant, occupied tile, not enough sun, plant cooldown, and clicking outside the board.
- Short positive feedback for first successful planting, first sun production, first zombie defeat, victory, and failure retry.

Out of scope for M1:

- Audio.
- Multiple levels or difficulty selection.
- New plant/enemy types.
- New external assets.
- Large Three.js refactors.

## Architecture

The rules layer remains the source of gameplay truth. It should expose stable state/events that the UI can render, but tutorial copy and DOM layout stay in `src/ui/domOverlay.ts`.

The first implementation slice should avoid over-building persistent profiles. Tutorial progress can be derived from `GameState` and recent `CombatEvent` values where possible. If a prompt needs memory that cannot be derived from state, add a small UI-side helper rather than changing combat rules.

Invalid planting feedback needs rule-level clarity because `plantAt` currently returns the same state for every failure reason. Add a focused helper that evaluates planting attempts and returns a typed result. `plantAt` can reuse it so game behavior stays consistent.

## UI Design

Add a small tutorial strip between the top HUD and the board space. It should be readable, short, and non-blocking.

Prompt examples:

- No plant selected: `先选一张植物卡片。`
- Plant selected: `点草坪格子，把植物放上去。`
- First plant placed: `很好！用 W/S 或方向键移动小队长。`
- First wave started: `僵尸来了，守住基地！`
- Victory: `守住啦，点“再玩一次”可以重来。`
- Failure: `没关系，换个位置再试一次。`

Feedback examples:

- Not enough sun: `阳光不够，等向日葵产阳光。`
- Cooldown: `这张卡还在准备。`
- Occupied: `这个格子已经有植物啦。`
- Outside board: `点彩色草坪格子来种植物。`

## Data Flow

1. Player clicks a plant card or board cell.
2. `GameScene` emits/updates state as today.
3. Planting validation returns either success or a typed failure reason.
4. `GameState.events` or a UI-side feedback state carries the short-lived message.
5. `createDomOverlayMarkup` renders prompt and feedback text.

## Testing

Add DOM markup tests for:

- Initial tutorial prompt.
- Selected-plant prompt.
- Invalid action feedback.
- Terminal-state prompt copy.

Add rule tests for:

- Planting validation reports occupied tile.
- Planting validation reports not enough sun.
- Planting validation reports cooldown.
- Successful planting still spends sun and clears selection.

## Acceptance Criteria

- A fresh player sees a clear next action before clicking anything.
- Selecting a plant changes the tutorial prompt.
- Invalid planting attempts show a specific, short message.
- Existing gameplay remains intact.
- `npm test` passes.
- `npm run build` passes.
- Browser check confirms the tutorial strip does not overlap the board or plant tray.
