# M9 Badge Ceremony Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a test-backed level-end badge ceremony for victory and failure in the existing Three.js stage.

**Architecture:** Add deterministic badge ceremony state to `src/game/threePresentation.ts`, drive the existing status badge and new small victory particles from `src/game/ThreeStage.ts`, and preserve the current `showLevelBadge(status)` integration.

**Tech Stack:** TypeScript, Vitest, Three.js, Vite.

---

### Task 1: Status Badge Helper

**Files:**
- Modify: `src/game/threePresentation.test.ts`
- Modify: `src/game/threePresentation.ts`

- [x] **Step 1: Write failing tests**

Add tests for `getStatusBadgeState(ageMs, mode, particleIndex)`:

- victory starts visible, pops larger mid-intro, and exposes particle opacity for early particles.
- failure remains visible but dips lower and uses a dimmer material intensity than victory.
- both modes hide and return opacity `0` after the ceremony lifetime.

- [x] **Step 2: Verify red**

Run:

```bash
npm test -- src/game/threePresentation.test.ts
```

Expected: fail because `getStatusBadgeState` is not exported.

- [x] **Step 3: Implement helper state**

Create `StatusBadgeMode`, `StatusBadgeState`, and `getStatusBadgeState`. Keep the math deterministic and independent of Three.js.

- [x] **Step 4: Verify green**

Run:

```bash
npm test -- src/game/threePresentation.test.ts
```

Expected: all Three presentation tests pass.

### Task 2: Three.js Ceremony Rendering

**Files:**
- Modify: `src/game/ThreeStage.ts`

- [x] **Step 1: Replace inline badge timing**

Use `getStatusBadgeState` inside `animateStatusBadge` for position, rotation, scale, opacity, and mode-specific dimming.

- [x] **Step 2: Add victory particles**

Build a compact `statusBadgeParticles` group with small star/sphere meshes. Show particles only when `statusBadgeMode` is `"victory"` and helper state marks them visible.

- [x] **Step 3: Build check**

Run:

```bash
npm run build
```

Expected: TypeScript and Vite build pass.

### Task 3: Docs, Verification, Commit

**Files:**
- Modify: `docs/project-roadmap.md`
- Modify: `docs/superpowers/plans/2026-05-27-m9-badge-ceremony.md`

- [x] **Step 1: Update roadmap**

Record the second M9 slice as badge ceremony polish with no new external assets.

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
git add docs/project-roadmap.md docs/superpowers/specs/2026-05-27-m9-badge-ceremony-design.md docs/superpowers/plans/2026-05-27-m9-badge-ceremony.md src/game/threePresentation.ts src/game/threePresentation.test.ts src/game/ThreeStage.ts
git commit -m "Add M9 badge ceremony polish"
```
