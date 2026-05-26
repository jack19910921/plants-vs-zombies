# Plant Silhouette Profiles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add plant-specific visual profiles so the existing localized assets have more distinct character silhouettes.

**Architecture:** Add a pure profile helper in `src/game/worldPresentation.ts`, cover it with `src/game/worldPresentation.test.ts`, then consume it in `src/game/GameScene.ts` when drawing plant base, stem, image, rim, and highlight.

**Tech Stack:** TypeScript, Phaser, Vitest, Vite, Playwright browser checks.

---

### Task 1: Profile Helper

**Files:**
- Modify: `src/game/worldPresentation.ts`
- Modify: `src/game/worldPresentation.test.ts`

- [x] **Step 1: Write failing tests**

Test these expectations:

```ts
getPlantMiniatureProfile("sunflower")
getPlantMiniatureProfile("peashooter")
getPlantMiniatureProfile("wallnut")
getPlantMiniatureProfile("snowpea")
getPlantMiniatureProfile("potatomine")
```

Expected behavior:
- sunflower image is taller than wallnut
- wallnut base is wider than peashooter
- potato mine stem is shorter than sunflower
- snow pea uses a cool rim color distinct from peashooter

- [x] **Step 2: Verify red**

Run:

```bash
npm test -- src/game/worldPresentation.test.ts
```

Expected: fail because `getPlantMiniatureProfile` is not exported.

- [x] **Step 3: Implement profile helper**

Add profile values for image width/height, base width, base height, stem height, stem color, rim color, and highlight alpha.

- [x] **Step 4: Verify green**

Run:

```bash
npm test -- src/game/worldPresentation.test.ts
```

Expected: helper tests pass.

### Task 2: GameScene Integration

**Files:**
- Modify: `src/game/GameScene.ts`

- [x] **Step 1: Import profile helper**

Use `getPlantMiniatureProfile(plant.plantId)` inside `drawPlant`.

- [x] **Step 2: Apply plant-specific sizes**

Use profile values for base ellipse size, stem support height/color, image display size, rim size/color, and highlight alpha.

- [x] **Step 3: Verify browser**

Plant several level-one plants in desktop and mobile viewports and confirm silhouettes remain readable.

### Task 3: Roadmap, Verification, Commit

**Files:**
- Modify: `docs/project-roadmap.md`
- Modify: `docs/superpowers/plans/2026-05-27-m5-plant-silhouette-profiles.md`

- [x] **Step 1: Update roadmap**

Add plant silhouette profiles to M5 delivered work.

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
git add docs/project-roadmap.md docs/superpowers/specs/2026-05-27-m5-plant-silhouette-profiles-design.md docs/superpowers/plans/2026-05-27-m5-plant-silhouette-profiles.md src/game/worldPresentation.ts src/game/worldPresentation.test.ts src/game/GameScene.ts
git commit -m "Add plant silhouette profiles"
```
