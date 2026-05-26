# M4 Seed Packet Flip Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a test-backed 3D seed-packet flip for plant selection and planting.

**Architecture:** Keep animation timing in a pure helper and mesh work in `ThreeStage`. Trigger the effect from existing scene UI events in `main.ts`.

**Tech Stack:** TypeScript, Three.js, Vitest, Vite, Playwright.

---

## File Structure

- Create `src/game/threePresentation.ts`: pure animation state helpers.
- Create `src/game/threePresentation.test.ts`: unit tests for seed-packet flip state.
- Modify `src/game/ThreeStage.ts`: build and animate seed-packet mesh group.
- Modify `src/main.ts`: trigger seed-packet flip on select and plant events.
- Modify `docs/project-roadmap.md`: record M4 start.

## Task 1: Testable Animation State

- [x] **Step 1: Write failing helper tests**

Create tests that assert seed-packet state is visible at 0 ms, larger mid-animation, and hidden after the duration.

- [x] **Step 2: Run tests and verify red**

Run:

```bash
npm test -- src/game/threePresentation.test.ts
```

Expected: fail because the helper does not exist.

- [x] **Step 3: Implement helper**

Create `getSeedPacketFlipState(ageMs, mode)` and export `SeedPacketFlipMode`.

- [x] **Step 4: Run tests and verify green**

Run:

```bash
npm test -- src/game/threePresentation.test.ts
```

Expected: helper tests pass.

## Task 2: ThreeStage Mesh And Trigger

- [x] **Step 1: Add mesh group**

Build a small 3D seed packet from box/cylinder/leaf-like primitives in `ThreeStage`.

- [x] **Step 2: Animate from helper**

Add `flipSeedPacket(mode)` and update the group inside `animate()`.

- [x] **Step 3: Wire main event**

In `src/main.ts`, trigger `threeStage.flipSeedPacket("select")` for select and `threeStage.flipSeedPacket("plant")` for plant.

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

Open `http://127.0.0.1:5173/`, select an unlocked plant, plant it, verify the 3D canvas remains nonblank/animated, and check console warnings/errors.

- [x] **Step 4: Commit**

Commit:

```bash
git add docs/superpowers/specs/2026-05-26-m4-seed-packet-flip-design.md docs/superpowers/plans/2026-05-26-m4-seed-packet-flip.md docs/project-roadmap.md src/game/threePresentation.ts src/game/threePresentation.test.ts src/game/ThreeStage.ts src/main.ts
git commit -m "Add 3D seed packet flip"
```
