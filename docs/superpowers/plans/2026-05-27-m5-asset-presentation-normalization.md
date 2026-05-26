# Asset Presentation Normalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Normalize local asset crop, filter, and framing across HUD cards and field figures.

**Architecture:** Create `src/game/assetPresentation.ts` with tested pure profile helpers. Consume the profiles in `src/ui/domOverlay.ts` for CSS variables and in `src/game/GameScene.ts` for Phaser crop/display offsets.

**Tech Stack:** TypeScript, Phaser, DOM/CSS, Vitest, Vite, Playwright browser checks.

---

### Task 1: Asset Presentation Profiles

**Files:**
- Create: `src/game/assetPresentation.ts`
- Create: `src/game/assetPresentation.test.ts`

- [x] **Step 1: Write failing tests**

Test:

```ts
getPlantAssetPresentation("sunflower")
getPlantAssetPresentation("wallnut")
getZombieAssetPresentation("basic")
getSourceCropPixels({ x: 0.1, y: 0.2, width: 0.8, height: 0.7 }, 1000, 500)
```

Expected:
- every plant profile has valid crop fractions and a CSS filter string.
- wallnut has a different object position from sunflower.
- zombie profile has valid crop fractions.
- source crop conversion returns integer pixel coordinates within source bounds.

- [x] **Step 2: Verify red**

Run:

```bash
npm test -- src/game/assetPresentation.test.ts
```

Expected: fail because module does not exist.

- [x] **Step 3: Implement profile helpers**

Create plant and zombie profile maps plus `getSourceCropPixels`.

- [x] **Step 4: Verify green**

Run:

```bash
npm test -- src/game/assetPresentation.test.ts
```

Expected: all asset presentation tests pass.

### Task 2: DOM And Phaser Integration

**Files:**
- Modify: `src/ui/domOverlay.ts`
- Modify: `src/styles.css`
- Modify: `src/game/GameScene.ts`

- [x] **Step 1: DOM variables**

Emit `--plant-position` and `--plant-filter` from plant asset profiles.

- [x] **Step 2: CSS usage**

Use those variables in `.plant-art`.

- [x] **Step 3: Phaser crop usage**

Apply source crops to plant and enemy images using `getSourceCropPixels`.

- [x] **Step 4: Verify browser**

Check desktop and mobile screenshots for image readability and no console warnings/errors.

### Task 3: M5 Closeout

**Files:**
- Modify: `docs/project-roadmap.md`
- Modify: `docs/asset-sources.md`
- Modify: `docs/superpowers/plans/2026-05-27-m5-asset-presentation-normalization.md`

- [x] **Step 1: Update roadmap**

Add asset presentation normalization to M5 delivered work and mark M5 complete.

- [x] **Step 2: Update asset sources note**

Document that final M5 visual normalization uses the already documented local assets and does not add new external files.

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
git add docs/project-roadmap.md docs/asset-sources.md docs/superpowers/specs/2026-05-27-m5-asset-presentation-normalization-design.md docs/superpowers/plans/2026-05-27-m5-asset-presentation-normalization.md src/game/assetPresentation.ts src/game/assetPresentation.test.ts src/game/GameScene.ts src/ui/domOverlay.ts src/styles.css
git commit -m "Normalize asset presentation"
```
