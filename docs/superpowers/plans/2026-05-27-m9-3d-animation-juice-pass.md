# M9 3D Animation Juice Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a small, test-backed animation polish slice to the Three.js prop layer.

**Architecture:** Extend `src/game/threePresentation.ts` with deterministic effect state helpers, render those helpers in `src/game/ThreeStage.ts`, and trigger the potato mine effect from `src/main.ts`.

**Tech Stack:** TypeScript, Vitest, Three.js, Phaser event stream, Vite.

---

### Task 1: Presentation Helper Tests

**Files:**
- Modify: `src/game/threePresentation.test.ts`
- Modify: `src/game/threePresentation.ts`

- [x] **Step 1: Write failing tests**

Add tests for:

- Seed packet shine opacity peaking during the flip.
- Seed packet shine traveling across the packet.
- Potato mine shockwave visible during its short lifetime.
- Potato mine debris particles staggered by index and hidden after the effect.

- [x] **Step 2: Verify red**

Run:

```bash
npm test -- src/game/threePresentation.test.ts
```

Expected: fail because the new helper fields/functions do not exist.

- [x] **Step 3: Implement minimal helper state**

Add shine fields to `SeedPacketFlipState` and add `getPotatoMineShockwaveState(ageMs, index)`.

- [x] **Step 4: Verify green**

Run:

```bash
npm test -- src/game/threePresentation.test.ts
```

Expected: all Three presentation tests pass.

### Task 2: Three.js Rendering And Event Wiring

**Files:**
- Modify: `src/game/ThreeStage.ts`
- Modify: `src/main.ts`

- [x] **Step 1: Render seed shine**

Add a small transparent shine mesh to the seed packet group and drive it from `getSeedPacketFlipState`.

- [x] **Step 2: Render potato mine shockwave**

Add a compact group with a warm ring, glow, and small dirt chunks. Drive it from `getPotatoMineShockwaveState`.

- [x] **Step 3: Wire combat event**

Call `threeStage.pulsePotatoMineExplosion()` once per new `potato-mine-exploded` event.

- [x] **Step 4: Type/build check**

Run:

```bash
npm run build
```

Expected: TypeScript and Vite build pass, allowing the existing chunk strategy warning if present.

### Task 3: Docs, Browser Smoke, Commit

**Files:**
- Modify: `docs/project-roadmap.md`
- Modify: `docs/superpowers/plans/2026-05-27-m9-3d-animation-juice-pass.md`

- [x] **Step 1: Update roadmap**

Add M9 as an in-progress/completed 3D animation polish slice with no external assets.

- [x] **Step 2: Mark this plan complete**

Check off completed steps in this plan.

- [x] **Step 3: Run verification**

Run:

```bash
npm test
npm run build
git diff --check
```

Then run browser smoke on desktop and mobile viewports, checking console warning/error count, visible 3D stage, animation frame changes, and no board/card obstruction.

- [x] **Step 4: Commit**

Run:

```bash
git add docs/project-roadmap.md docs/superpowers/specs/2026-05-27-m9-3d-animation-juice-pass-design.md docs/superpowers/plans/2026-05-27-m9-3d-animation-juice-pass.md src/game/threePresentation.ts src/game/threePresentation.test.ts src/game/ThreeStage.ts src/main.ts
git commit -m "Add M9 Three animation juice"
```
