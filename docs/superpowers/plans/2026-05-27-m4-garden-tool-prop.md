# M4 Garden Tool Prop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a persistent 3D garden tool prop that idles and swings on planting.

**Architecture:** Keep motion state in `src/game/threePresentation.ts`, mesh construction and animation in `src/game/ThreeStage.ts`, and event wiring in `src/main.ts`.

**Tech Stack:** TypeScript, Three.js, Vitest, Vite, Playwright.

---

## File Structure

- Modify `src/game/threePresentation.ts`: add garden-tool animation state helper.
- Modify `src/game/threePresentation.test.ts`: cover idle and plant-pulse tool state.
- Modify `src/game/ThreeStage.ts`: build and animate a persistent trowel prop.
- Modify `src/main.ts`: trigger tool swing on plant events.
- Modify `docs/project-roadmap.md`: record garden-tool prop progress.

## Task 1: Tool Motion Helper

- [x] **Step 1: Write failing helper tests**

Add tests that assert `getGardenToolState(1000, Number.NEGATIVE_INFINITY)` is visible, that idle rotation changes between two times, and that `getGardenToolState(1200, 1000)` has a larger swing than idle.

- [x] **Step 2: Run tests and verify red**

Run:

```bash
npm test -- src/game/threePresentation.test.ts
```

Expected: fail because `getGardenToolState` does not exist.

- [x] **Step 3: Implement helper**

Export `GardenToolState` and `getGardenToolState(nowMs, pulseStartedAt)` from `src/game/threePresentation.ts`.

- [x] **Step 4: Run tests and verify green**

Run:

```bash
npm test -- src/game/threePresentation.test.ts
```

Expected: helper tests pass.

## Task 2: ThreeStage Prop

- [x] **Step 1: Build trowel mesh**

In `src/game/ThreeStage.ts`, add a `gardenTool` group and build a simple trowel from a handle cylinder and metal scoop shape.

- [x] **Step 2: Animate from helper**

Add `swingGardenTool()` and `animateGardenTool(now)`.

- [x] **Step 3: Wire plant event**

In `src/main.ts`, call `threeStage.swingGardenTool()` when `soundId === "plant"`.

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

Open `http://127.0.0.1:5173/`, verify the Three canvas is nonblank, planting changes the Three canvas pixels, and console warnings/errors are zero.

- [x] **Step 4: Commit**

Commit:

```bash
git add docs/superpowers/specs/2026-05-27-m4-garden-tool-prop-design.md docs/superpowers/plans/2026-05-27-m4-garden-tool-prop.md docs/project-roadmap.md src/game/threePresentation.ts src/game/threePresentation.test.ts src/game/ThreeStage.ts src/main.ts
git commit -m "Add 3D garden tool prop"
```
