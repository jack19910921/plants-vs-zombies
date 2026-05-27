# Final Acceptance Closeout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the remaining acceptance checklist in one coherent closeout pass.

**Architecture:** Keep gameplay changes in `src/game/rules.ts`, HUD settings in `src/ui/domOverlay.ts`, runtime integration in `src/main.ts`, and responsive layout in `src/styles.css`.

**Tech Stack:** TypeScript, Phaser 3, Three.js integration, DOM markup, CSS, Vitest, Vite.

---

### Task 1: Reduced Motion Setting

**Files:**
- Modify: `src/ui/domOverlay.test.ts`
- Modify: `src/ui/domOverlay.ts`
- Modify: `src/main.ts`
- Modify: `src/styles.css`

- [x] **Step 1: Write failing DOM tests**

Add tests that the HUD renders `data-action="motion"`, starts as `动效正常`, toggles to `动效柔和`, and calls `onToggleMotion(true)`.

- [x] **Step 2: Verify tests fail**

Run: `npm test -- src/ui/domOverlay.test.ts`

Expected: fail because the motion action is missing.

- [x] **Step 3: Implement DOM toggle**

Add `reducedMotion` and `onToggleMotion` options to `createDomOverlay`, render a motion toggle button, and update local overlay state on click.

- [x] **Step 4: Integrate runtime behavior**

Track `reducedMotion` in `src/main.ts`, set `document.documentElement.dataset.motion`, and skip decorative Three.js event pulses while enabled.

- [x] **Step 5: Add responsive CSS**

Add space for the new HUD chip on desktop and mobile.

- [x] **Step 6: Verify targeted tests pass**

Run: `npm test -- src/ui/domOverlay.test.ts`

Expected: pass.

### Task 2: Bucket Ice Resistance

**Files:**
- Modify: `src/game/rules.test.ts`
- Modify: `src/game/rules.ts`

- [x] **Step 1: Write failing rule test**

Assert that a bucket enemy hit by an ice projectile receives a shorter slow duration than a basic enemy and ends at `nowMs + 1000`.

- [x] **Step 2: Verify test fails**

Run: `npm test -- src/game/rules.test.ts`

Expected: fail because bucket enemies currently receive the normal slow duration.

- [x] **Step 3: Implement minimal rule change**

Add `ICE_SLOW_MS = 2000` and `BUCKET_ICE_SLOW_MS = 1000`, then apply the shorter duration when `target.zombieId === "bucket"`.

- [x] **Step 4: Verify targeted tests pass**

Run: `npm test -- src/game/rules.test.ts`

Expected: pass.

### Task 3: Roadmap And Preview Checklist

**Files:**
- Modify: `docs/project-roadmap.md`
- Modify: `docs/production-preview-checklist.md`

- [x] **Step 1: Update roadmap**

Mark M11 complete, add the final acceptance closeout, and move remaining speculative ideas into future backlog wording.

- [x] **Step 2: Update preview checklist**

Add quick manual checks for the motion toggle and bucket slow-resistance behavior.

### Task 4: Verification And Commit

**Files:**
- All modified `docs` and `src` files.

- [x] **Step 1: Run full verification**

Run:

```bash
npm test
npm run build
git diff --check
```

Expected: all pass.

- [x] **Step 2: Commit**

Run:

```bash
git add docs src
git commit -m "Close out acceptance checklist"
```
