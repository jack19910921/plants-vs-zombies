# Card Visual Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reuse plant miniature profile colors in DOM plant cards so HUD cards and field figures feel like one coherent asset set.

**Architecture:** Import `getPlantMiniatureProfile` in `src/ui/domOverlay.ts`, emit CSS custom properties in card markup, and update `src/styles.css` to use those properties.

**Tech Stack:** TypeScript, DOM markup tests, CSS, Vite, Playwright browser checks.

---

### Task 1: Markup Profile Variables

**Files:**
- Modify: `src/ui/domOverlay.ts`
- Modify: `src/ui/domOverlay.test.ts`

- [x] **Step 1: Write failing tests**

Add tests that verify generated plant cards include:

```html
class="plant-card plant-card--sunflower"
--plant-rim:
--plant-base:
--plant-stem:
--plant-art:
```

Also verify locked cards retain profile variables.

- [x] **Step 2: Verify red**

Run:

```bash
npm test -- src/ui/domOverlay.test.ts
```

Expected: fail because profile classes and variables are not emitted yet.

- [x] **Step 3: Implement markup**

Import `getPlantMiniatureProfile`, convert numeric colors to CSS hex strings, and emit profile variables on each card style.

- [x] **Step 4: Verify green**

Run:

```bash
npm test -- src/ui/domOverlay.test.ts
```

Expected: all DOM overlay tests pass.

### Task 2: CSS Unification

**Files:**
- Modify: `src/styles.css`

- [x] **Step 1: Update plant card styling**

Use CSS custom properties for card border, subtle packet wash, art border, art background, and selected shadow.

- [x] **Step 2: Verify browser**

Check desktop and mobile screenshots for card readability and no overflow.

### Task 3: Roadmap, Verification, Commit

**Files:**
- Modify: `docs/project-roadmap.md`
- Modify: `docs/superpowers/plans/2026-05-27-m5-card-visual-unification.md`

- [x] **Step 1: Update roadmap**

Add card visual unification to M5 delivered work.

- [x] **Step 2: Mark plan complete**

Check off completed steps.

- [x] **Step 3: Run verification**

Run:

```bash
npm test
npm run build
git diff --check
```

Expected: all pass, with only the known Vite chunk-size warning.

- [x] **Step 4: Commit**

Run:

```bash
git add docs/project-roadmap.md docs/superpowers/specs/2026-05-27-m5-card-visual-unification-design.md docs/superpowers/plans/2026-05-27-m5-card-visual-unification.md src/ui/domOverlay.ts src/ui/domOverlay.test.ts src/styles.css
git commit -m "Unify plant card visuals"
```
