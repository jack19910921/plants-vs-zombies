# M9 Feedback Closeout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish M9 by adding procedural sun, wave, and planting feedback polish to the existing Three.js stage.

**Architecture:** Extend deterministic presentation helpers in `src/game/threePresentation.ts`, render the new helper fields/groups in `src/game/ThreeStage.ts`, and keep all triggers on existing public methods.

**Tech Stack:** TypeScript, Vitest, Three.js, Vite.

---

### Task 1: Presentation Helpers

**Files:**
- Modify: `src/game/threePresentation.test.ts`
- Modify: `src/game/threePresentation.ts`

- [x] **Step 1: Write failing tests**

Add tests for:

- sun trail halo/shimmer fields peaking during collection.
- wave warning beacon/glow fields peaking during alert.
- planting spark particles appearing, staggering by index, and hiding after their lifetime.

- [x] **Step 2: Verify red**

Run:

```bash
npm test -- src/game/threePresentation.test.ts
```

Expected: fail because the new helper fields/function do not exist.

- [x] **Step 3: Implement helper state**

Extend existing state interfaces and add `getPlantingSparkState(ageMs, index)`.

- [x] **Step 4: Verify green**

Run:

```bash
npm test -- src/game/threePresentation.test.ts
```

Expected: all Three presentation tests pass.

### Task 2: Three.js Rendering

**Files:**
- Modify: `src/game/ThreeStage.ts`

- [x] **Step 1: Render sun halo layer**

Add a compact halo group paired with existing sun trail beads and drive opacity/scale from `getSunTrailParticleState`.

- [x] **Step 2: Render wave beacon**

Add a tiny beacon/halo to the wave warning stake and drive it from `getWaveWarningStakeState`.

- [x] **Step 3: Render planting spark**

Add a small dust/spark group near the garden tool blade. Trigger it from `swingGardenTool()`.

- [x] **Step 4: Build check**

Run:

```bash
npm run build
```

Expected: TypeScript and Vite build pass.

### Task 3: Docs, Verification, Commit

**Files:**
- Modify: `docs/project-roadmap.md`
- Modify: `docs/superpowers/plans/2026-05-27-m9-feedback-closeout.md`

- [x] **Step 1: Update roadmap**

Record M9 closeout as complete with sun, wave, and planting polish.

- [x] **Step 2: Mark this plan complete**

Check off completed steps as they finish.

- [x] **Step 3: Run full verification**

Run:

```bash
npm test
npm run build
git diff --check
```

Then run browser smoke on desktop and mobile viewports.

- [x] **Step 4: Commit**

Run:

```bash
git add docs/project-roadmap.md docs/superpowers/specs/2026-05-27-m9-feedback-closeout-design.md docs/superpowers/plans/2026-05-27-m9-feedback-closeout.md src/game/threePresentation.ts src/game/threePresentation.test.ts src/game/ThreeStage.ts
git commit -m "Complete M9 feedback animation polish"
```
