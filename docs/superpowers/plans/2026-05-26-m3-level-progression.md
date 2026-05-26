# M3 Level Progression Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add multiple levels and a victory next-level flow while preserving the existing rules and rendering boundaries.

**Architecture:** Keep level data in config, rules parameterized by `LevelConfig`, current level state in `GameScene`, and level metadata rendering in the DOM HUD.

**Tech Stack:** TypeScript, Phaser, DOM HUD, Vitest, Vite.

---

## File Structure

- Modify `src/game/config.ts`: export `LEVELS` and add at least one additional level.
- Create or modify tests for level config uniqueness.
- Modify `src/game/GameScene.ts`: track current level index and add `nextLevel()`.
- Modify `src/ui/domOverlay.ts`: render level name and next-level action.
- Modify `src/ui/domOverlay.test.ts`: cover wave text and next-level modal behavior.
- Modify `src/styles.css`: adjust HUD text if needed.

## Task 1: Level Config List

- [x] **Step 1: Write failing config test**

Add a test that expects `LEVELS.length` to be at least 2 and all IDs to be unique.

- [x] **Step 2: Run test and verify red**

Run:

```bash
npm test -- src/game/config.test.ts
```

Expected: fail because the test or `LEVELS` does not exist.

- [x] **Step 3: Add levels**

Export `LEVELS` from `src/game/config.ts`, keeping `LEVEL_ONE` as `LEVELS[0]`. Add `level-2` with different wave timings.

- [x] **Step 4: Run test and verify green**

Run:

```bash
npm test -- src/game/config.test.ts
```

Expected: config test passes.

## Task 2: DOM Level Metadata And Next Action

- [x] **Step 1: Write failing DOM tests**

Add tests for:

- HUD wave text includes a supplied level name.
- Victory with `hasNextLevel: true` renders `data-action="next-level"` and `下一关`.
- Victory with `hasNextLevel: false` renders restart and `再玩一次`.

- [x] **Step 2: Implement DOM changes**

Extend `createDomOverlayMarkup` render state with `levelName` and `hasNextLevel`.

- [x] **Step 3: Run DOM tests**

Run:

```bash
npm test -- src/ui/domOverlay.test.ts
```

Expected: DOM tests pass.

## Task 3: Scene Current Level

- [x] **Step 1: Replace fixed `LEVEL_ONE` in scene**

In `src/game/GameScene.ts`, import `LEVELS`, add `currentLevelIndex`, `currentLevel`, `hasNextLevel`, `startCurrentLevel()`, and `nextLevel()`.

- [x] **Step 2: Wire DOM overlay action**

`createDomOverlay` should call `scene.nextLevel()` on `data-action="next-level"`.

- [x] **Step 3: Run all tests**

Run:

```bash
npm test
```

Expected: all tests pass.

## Task 4: Browser Verification

- [x] **Step 1: Build**

Run:

```bash
npm run build
```

Expected: build succeeds with only known chunk-size warning.

- [x] **Step 2: Browser check**

Open `http://127.0.0.1:5173/`. Verify:

- HUD shows the level name.
- Restart still works.
- Victory modal code path supports next-level action.
- Console has no warnings or errors.

- [x] **Step 3: Commit**

Commit:

```bash
git add docs/superpowers/specs/2026-05-26-m3-level-progression-design.md docs/superpowers/plans/2026-05-26-m3-level-progression.md src/game/config.ts src/game/config.test.ts src/game/GameScene.ts src/ui/domOverlay.ts src/ui/domOverlay.test.ts src/styles.css
git commit -m "Add level progression flow"
```
