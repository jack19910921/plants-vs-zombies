# 3D Sun Collection Trail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a short 3D sun collection trail triggered by existing sun production events.

**Architecture:** Keep sun economy unchanged. Add pure animation state in `src/game/threePresentation.ts`, render it in `src/game/ThreeStage.ts`, and trigger it through the already wired `pulseSunCollection()` method.

**Tech Stack:** TypeScript, Three.js, Vitest, Vite, Playwright browser checks.

---

### Task 1: Trail Animation Helper

**Files:**
- Modify: `src/game/threePresentation.ts`
- Modify: `src/game/threePresentation.test.ts`

- [x] **Step 1: Write failing tests**

Add tests that call `getSunTrailParticleState(ageMs, index)` and verify:

```ts
const start = getSunTrailParticleState(0, 0);
const middle = getSunTrailParticleState(360, 0);
const late = getSunTrailParticleState(900, 0);
```

Expected behavior:
- start and middle are visible
- middle moves closer to the coin target than start
- particle index staggers position/opacity
- late is hidden with opacity 0

- [x] **Step 2: Verify red**

Run:

```bash
npm test -- src/game/threePresentation.test.ts
```

Expected: fail because `getSunTrailParticleState` is not exported.

- [x] **Step 3: Implement helper**

Add `SunTrailParticleState` and `getSunTrailParticleState(ageMs, index)` to `src/game/threePresentation.ts`. Return position, scale, opacity, and visibility only.

- [x] **Step 4: Verify green**

Run:

```bash
npm test -- src/game/threePresentation.test.ts
```

Expected: all presentation helper tests pass.

### Task 2: ThreeStage Trail Meshes

**Files:**
- Modify: `src/game/ThreeStage.ts`

- [x] **Step 1: Build trail beads**

Add a `sunTrail` group with six small sphere meshes and transparent warm materials.

- [x] **Step 2: Animate trail beads**

Call `animateSunTrail(now)` from the render loop. Use `now - sunPulseStartedAt` and `getSunTrailParticleState` for each bead.

- [x] **Step 3: Verify visually**

Plant a sunflower, wait for sun production, and confirm the WebGL canvas changes while console warnings/errors remain zero.

### Task 3: Roadmap, Full Verification, Commit

**Files:**
- Modify: `docs/project-roadmap.md`
- Modify: `docs/superpowers/plans/2026-05-27-m4-sun-collection-trail.md`

- [x] **Step 1: Update roadmap**

Add the sun collection trail to M4 delivered work.

- [x] **Step 2: Mark plan complete**

Check off all completed steps in this plan.

- [x] **Step 3: Run verification**

Run:

```bash
npm test
npm run build
git diff --check
```

Expected: tests and build pass; diff check has no whitespace errors.

- [x] **Step 4: Commit**

Run:

```bash
git add docs/superpowers/specs/2026-05-27-m4-sun-collection-trail-design.md docs/superpowers/plans/2026-05-27-m4-sun-collection-trail.md src/game/threePresentation.ts src/game/threePresentation.test.ts src/game/ThreeStage.ts docs/project-roadmap.md
git commit -m "Add 3D sun collection trail"
```
