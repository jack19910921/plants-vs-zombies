# M3 Three-Level Sequence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a third level and final-victory completion copy for the current mini-run.

**Architecture:** Keep progression data in `LEVELS`. Reuse `GameScene.hasNextLevel()` and update DOM copy based on whether another level remains.

**Tech Stack:** TypeScript, Phaser, DOM HUD, Vitest, Vite.

---

## File Structure

- Modify `src/game/config.ts`: add `level-3`.
- Modify `src/game/config.test.ts`: require three unique levels and a distinct final wave count.
- Modify `src/ui/domOverlay.ts`: use final-victory copy when `hasNextLevel` is false.
- Modify `src/ui/domOverlay.test.ts`: cover final-victory restart/completion copy.
- Modify `docs/project-roadmap.md`: record three-level sequence progress.

## Task 1: Third Level Config

- [x] **Step 1: Write failing config test**

Update `src/game/config.test.ts`:

```ts
expect(LEVELS.length).toBeGreaterThanOrEqual(3);
expect(LEVELS[2].waves.length).not.toBe(LEVELS[0].waves.length);
```

- [x] **Step 2: Run test and verify red**

Run:

```bash
npm test -- src/game/config.test.ts
```

Expected: fail because only two levels exist.

- [x] **Step 3: Add third level**

Add `level-3` named `暮色农圃` with ten waves and a slightly tighter starting sun budget.

- [x] **Step 4: Run test and verify green**

Run:

```bash
npm test -- src/game/config.test.ts
```

Expected: config test passes.

## Task 2: Final Victory Copy

- [x] **Step 1: Write failing DOM test**

Add a test to `src/ui/domOverlay.test.ts` for `status: "victory"` and `hasNextLevel: false` that expects `全部守住啦` and `data-action="restart"`.

- [x] **Step 2: Implement copy change**

In `src/ui/domOverlay.ts`, make final victory use completion copy while next-level victory keeps `下一关`.

- [x] **Step 3: Run DOM tests**

Run:

```bash
npm test -- src/ui/domOverlay.test.ts
```

Expected: DOM tests pass.

## Task 3: Verification And Commit

- [x] **Step 1: Run all tests**

Run:

```bash
npm test
```

Expected: all tests pass.

- [x] **Step 2: Build**

Run:

```bash
npm run build
```

Expected: build succeeds with only the known chunk-size warning.

- [x] **Step 3: Browser check**

Open `http://127.0.0.1:5173/` and verify the HUD still renders the level name, difficulty controls, pause, sound, and plant tray without console warnings/errors.

- [x] **Step 4: Commit**

Commit:

```bash
git add docs/superpowers/specs/2026-05-26-m3-three-level-sequence-design.md docs/superpowers/plans/2026-05-26-m3-three-level-sequence.md docs/project-roadmap.md src/game/config.ts src/game/config.test.ts src/ui/domOverlay.ts src/ui/domOverlay.test.ts
git commit -m "Add three-level sequence"
```
