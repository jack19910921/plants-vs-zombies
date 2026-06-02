# Kids Scene Picker Design

## Goal

Add an opening scene picker for the iPad-first, offline child-friendly lane defense game. The picker should make each play session feel like choosing a playful place to visit, while preserving the current pure single-player flow and avoiding a heavy map, account, or progression system.

The first version includes three clearly distinct scenes:

- `阳光草坪`: bright, warm, standard.
- `露珠菜园`: cool, fresh, gentler opening rhythm.
- `星光农圃`: soft night garden, calm and non-scary.

The scenes must be visibly different at a glance. A scene should not feel like the same grass board with a tiny color shift. The first implementation may use procedural visuals, but it should reserve clean replacement points for future image2-generated scene images if the procedural pass is not beautiful enough.

## Player Experience

When the game loads, it starts on a full-screen scene picker instead of immediately starting combat. The picker is one simple screen:

- A short title such as `今天去哪里守护？`
- The existing difficulty control.
- Three large scene cards.
- A primary button such as `开始守护`.

`阳光草坪` is selected by default, so a child can start immediately without needing to read every option. Tapping a scene card changes the selected scene and updates the short hint near the start button. Tapping `开始守护` starts level one using the selected scene.

Scene selection applies to the current mini-run. Advancing to the next level keeps the selected scene so the child does not have to reselect after every victory. Restarting from a terminal state returns to the same selected scene by default. Reloading the page can reset to the default scene; this slice does not need saved preferences.

The opening picker should not show the per-run challenge objective. The existing run challenge objective and modifier should appear after the level starts, through the current HUD chip and tutorial strip behavior. This keeps the first screen from becoming too wordy.

## Scene Direction

Each scene needs a distinct visual identity on both the picker cards and the active playfield.

### 阳光草坪

Purpose: default, safest, familiar.

Visual identity:

- Golden morning tabletop.
- Saturated green lawn.
- Warm sunlight highlights and yellow accents.
- Current toy garden mood, refined rather than replaced.

Rules:

- Standard baseline.
- No scene-specific rule adjustment.

Short copy:

- Picker hint: `标准草坪，最适合先玩一局`
- HUD scene label: `阳光草坪`

### 露珠菜园

Purpose: fresh, gentle, easy to understand.

Visual identity:

- Mint and teal garden palette.
- Dewdrop sparkles or small bead highlights on tiles.
- Cooler tabletop or garden-edge accents.
- Softer fog or morning mist bands that do not cover playable cells.

Rules:

- First wave starts a little later.
- The adjustment should be small and readable, around the same scale as the current `slow-start` run modifier.

Short copy:

- Picker hint: `露珠亮晶晶，第一波晚一点`
- HUD scene label: `露珠菜园`

### 星光农圃

Purpose: noticeably different and magical, but never frightening.

Visual identity:

- Soft blue-purple evening tabletop.
- High-contrast playable grid with warm tile rims so plants and enemies remain readable.
- Star glints, lantern-like edge highlights, or moonlit streaks.
- No scary darkness, no horror motifs, no hard-to-see enemies.

Rules:

- Enemies move a little slower.
- Starting sun is slightly lower to keep the rhythm from becoming too easy.
- Both values should be conservative and described with one short hint.

Short copy:

- Picker hint: `星光慢慢走，阳光少一点`
- HUD scene label: `星光农圃`

## Visual Implementation Strategy

The first pass should not depend on new image files. Instead, introduce scene presentation data that can drive procedural Phaser drawing and DOM card styling:

- Tabletop base color and plank accent colors.
- Board frame and lane wash colors.
- Tile highlight, shadow, shimmer, and decorative fleck colors.
- Optional scene decoration type such as sun rays, dew beads, or star glints.
- Picker card background and accent colors.

This gives the scenes obvious separation without waiting on new assets. However, the design should keep image replacement straightforward:

- Scene config should allow an optional board or scene-card image key later.
- Asset loading should be centralized, following the current `src/game/assets.ts` pattern.
- Cropping and presentation should be centralized if scene images are added, following the current `assetPresentation.ts` pattern.
- New image2 assets, if added later, should be documented in `docs/asset-sources.md`.

The active playfield must still preserve the fixed board geometry used by the touch grid. Scene visuals may recolor and decorate the board, but they should not move the board, change the lane count, or change the 9 by 5 planting grid.

## Rules And Data

Add a small scene theme model, likely in `src/game/sceneThemes.ts`.

Suggested data shape:

- `SceneThemeId`
- `SceneThemeConfig`
- Display fields: `name`, `shortName`, `pickerHint`, `hudHint`.
- Presentation fields for DOM cards and Phaser board drawing.
- Rule adjustment fields:
  - `firstWaveDelayMs`
  - `startingSunDelta`
  - `zombieSpeedMultiplier`

The selected scene should be stored in scene-level game flow state, not inferred from the DOM. `GameScene` can keep the selected scene id and expose it to the DOM overlay. When the player starts, `createInitialState` should receive the selected scene adjustments along with difficulty and run challenge data.

Scene adjustments should layer with existing difficulty and run challenge modifiers:

- Difficulty remains the main easy or normal knob.
- Scene adjustment is stable for the selected scene.
- Run challenge modifier remains the per-run surprise layer.

If multiple sources affect the same field, use conservative multiplication or addition in the same style as existing modifiers. For example, zombie speed can multiply difficulty, scene, and run challenge factors. First-wave delay can add scene delay and run modifier delay, with values kept small enough that the first wave does not feel broken.

## UI And Feedback

The DOM overlay should render a scene picker when the game status is `menu`.

The picker should be touch-first:

- Three large cards, each with a strong visual preview.
- Card labels readable on iPad landscape.
- Selected card has an obvious border or glow.
- The start button is large and stable.
- No dense paragraphs, no nested menus, no scroll requirement on iPad landscape.

During play, the existing HUD can include the selected scene in the wave chip or as a compact scene label. If space is tight on iPad landscape, the scene name can be shown in the wave chip before the compact wave label only when it does not crowd the objective. The objective chip from the run challenge system remains more important during combat.

The tutorial strip may briefly show the scene hint after starting, but it should not fight with the run modifier announcement. Recommended priority:

1. Run modifier announcement, because it explains the current random change.
2. Scene start hint, only if the modifier is absent or after the modifier window.
3. Objective nudge.
4. Existing tutorial text.

## Architecture

Preserve current boundaries:

- `src/game/sceneThemes.ts`: scene catalog, labels, presentation values, and rule adjustments.
- `src/game/types.ts`: scene id and scene adjustment types if needed by multiple modules.
- `src/game/rules.ts`: accept scene adjustments as explicit input and apply them to initial state, spawn timing, or speed calculations.
- `src/game/GameScene.ts`: hold selected scene id, transition from `menu` to `playing`, pass selected scene to rules, and redraw static board when scene changes.
- `src/ui/domOverlay.ts`: render the opening picker and wire scene selection/start actions.
- `src/styles.css`: responsive iPad landscape picker layout and scene card styling.
- `src/game/worldPresentation.ts` or a new focused presentation helper: deterministic scene decoration values if the board drawing needs more than static colors.

`GameStatus` already includes `menu`, and it should become the real opening state. The game should not auto-create a run challenge until the selected scene starts a level. This keeps challenge selection tied to actual runs, not menu previews.

`GameScene.drawStaticBoard` currently hard-codes tabletop and lawn colors. The implementation should extract enough scene presentation data to avoid adding scattered conditionals. A full renderer refactor is not required, but scene-specific colors and decoration should be data-driven.

## Testing

Add focused automated tests:

- Scene catalog has exactly three unique first-version scenes and a valid default.
- Scene labels and hints are short enough for iPad UI.
- Scene rule adjustments are conservative and do not change board shape or allowed plant lists.
- Initial game status is `menu`.
- Starting from the picker creates a fresh run challenge and enters `playing`.
- Selected scene adjustments affect first-wave timing, starting sun, or zombie speed as intended.
- DOM picker markup renders three cards, a selected default, difficulty controls, and a start button.
- DOM actions can select a scene and start the game.
- Existing run challenge HUD still renders after the game starts.

Run full verification after implementation:

- `npm test`
- `npm run build`
- Browser visual check at desktop and iPad landscape viewports.

The browser check must cover:

- Opening picker fits in one iPad landscape viewport.
- All three scene cards are visibly different.
- Start button is easy to tap.
- After starting, the board and touch grid still align.
- HUD, objective chip, tutorial strip, and plant tray do not overlap.

## Dependencies And Sequencing

This work has real dependencies and should not be split into parallel implementation agents:

1. Define scene config and selected-scene state.
2. Add menu-to-playing flow.
3. Render the DOM picker.
4. Apply rule adjustments.
5. Apply scene presentation to the playfield.
6. Verify iPad layout and run challenge interaction.

The scene config is the foundation. UI, rules, and visual rendering all depend on it.

## Non-Goals

This slice will not include:

- Backend, accounts, cloud saves, analytics, or network content.
- A world map, campaign map, calendar, or long-term unlock system.
- More than three scenes in the first version.
- Scene-specific lane counts, obstacles, water lanes, night-only planting rules, or hard tower-defense mechanics.
- Official Plants vs Zombies assets, names, audio, or UI.
- Required new image2 assets.
- Persistent saved scene preference.

## Acceptance

The slice is successful when:

- The game opens on a child-friendly scene picker.
- `阳光草坪` is selected by default and can start immediately.
- The three scene cards are clearly visually distinct.
- The active playfield also changes visibly by selected scene.
- Scene differences are understandable in one short hint.
- Existing difficulty, level progression, run challenge objectives, and run modifiers still work.
- The game remains pure offline single-player.
- Automated tests and build pass.
- iPad landscape browser verification shows no UI overlap and no touch-grid drift.
