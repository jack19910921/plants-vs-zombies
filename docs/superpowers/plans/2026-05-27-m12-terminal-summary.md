# M12 Terminal Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add compact victory/failure summary stats to the terminal modal.

**Architecture:** Extend DOM overlay render state with optional summary counts, compute them from live game state in `createDomOverlay`, and style the summary in `src/styles.css`.

**Tech Stack:** TypeScript, DOM markup, CSS, Vitest, Vite.

---

### Task 1: Terminal Summary Markup

**Files:**
- Modify: `src/ui/domOverlay.test.ts`
- Modify: `src/ui/domOverlay.ts`

- [x] **Step 1: Write failing tests**

Add tests that terminal modals show:

- Victory: `守住 8/8 波`, `剩余植物 4`, `阳光 120`.
- Failure: `守到 6/9 波`, `剩余植物 2`, `阳光 35`.

- [x] **Step 2: Verify tests fail**

Run: `npm test -- src/ui/domOverlay.test.ts`

Expected: fail because terminal summary markup is missing.

- [x] **Step 3: Implement markup**

Add optional `spawnedWaveCount` and `totalWaveCount` render-state fields and render a `.modal-summary` block for victory/failure states.

- [x] **Step 4: Compute live counts**

In `createDomOverlay`, pass `state.spawnedWaveIndexes.length`, `state.plants.length`, `state.sun`, and `level.waves.length`.

- [x] **Step 5: Verify tests pass**

Run: `npm test -- src/ui/domOverlay.test.ts`

Expected: pass.

### Task 2: Responsive Styling

**Files:**
- Modify: `src/styles.css`

- [x] **Step 1: Add summary chip styling**

Add a three-column `.modal-summary` layout for desktop.

- [x] **Step 2: Add mobile fallback**

Stack summary chips on narrow/coarse-pointer viewports.

### Task 3: Docs And Verification

**Files:**
- Create: `docs/superpowers/specs/2026-05-27-m12-terminal-summary-design.md`
- Create: `docs/superpowers/plans/2026-05-27-m12-terminal-summary.md`
- Modify: `docs/project-roadmap.md`

- [x] **Step 1: Update roadmap**

Record M12 terminal summary as delivered.

- [x] **Step 2: Run full verification**

Run:

```bash
npm test
npm run build
git diff --check
```

Expected: all pass.

- [x] **Step 3: Commit**

Run:

```bash
git add docs src
git commit -m "Add terminal level summary"
```
