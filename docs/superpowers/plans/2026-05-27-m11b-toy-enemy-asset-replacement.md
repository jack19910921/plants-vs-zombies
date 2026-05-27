# M11b Toy Enemy Asset Replacement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the shared enemy placeholder with original toy enemy SVG assets for the existing three enemy variants.

**Architecture:** Add generated SVG assets under `src/assets/generated/m11`, register them in `src/game/assets.ts`, and let `GameScene` preload and render a texture per `ZombieId`. Keep rules and wave data unchanged.

**Tech Stack:** TypeScript, Phaser 3, Vite, Vitest, SVG assets.

---

### Task 1: Enemy Texture Registry

**Files:**
- Modify: `src/game/assets.test.ts`
- Modify: `src/game/assets.ts`

- [x] **Step 1: Write the failing test**

Add expectations that `ZOMBIE_TEXTURES.basic`, `ZOMBIE_TEXTURES.cone`, and `ZOMBIE_TEXTURES.bucket` point at `toy-zombie-basic.svg`, `toy-zombie-cone.svg`, and `toy-zombie-bucket.svg`.

- [x] **Step 2: Verify the test fails**

Run: `npm test -- src/game/assets.test.ts`

Expected: fail because `ZOMBIE_TEXTURES` is not exported yet.

- [x] **Step 3: Implement the registry**

Export `ZOMBIE_TEXTURES: Record<ZombieId, string>` from `src/game/assets.ts`.

- [x] **Step 4: Verify the test passes**

Run: `npm test -- src/game/assets.test.ts`

Expected: pass.

### Task 2: Generated Enemy Assets And Rendering

**Files:**
- Create: `src/assets/generated/m11/toy-zombie-basic.svg`
- Create: `src/assets/generated/m11/toy-zombie-cone.svg`
- Create: `src/assets/generated/m11/toy-zombie-bucket.svg`
- Modify: `src/game/GameScene.ts`

- [x] **Step 1: Add original SVG assets**

Create three child-friendly toy enemy SVGs with no official source art.

- [x] **Step 2: Preload all enemy textures**

Replace the single `zombie-basic` preload with an `Object.entries(ZOMBIE_TEXTURES)` preload loop.

- [x] **Step 3: Render by enemy id**

Use `zombie-${zombie.zombieId}` when drawing each enemy image.

### Task 3: Avoid Duplicate Headgear

**Files:**
- Modify: `src/game/assetPresentation.test.ts`
- Modify: `src/game/assetPresentation.ts`
- Modify: `src/game/GameScene.ts`

- [x] **Step 1: Write the failing test**

Assert that every M11 toy enemy presentation profile has `drawProceduralHeadgear` set to `false`.

- [x] **Step 2: Verify the test fails**

Run: `npm test -- src/game/assetPresentation.test.ts`

Expected: fail because the property is not present.

- [x] **Step 3: Implement the profile flag**

Add `drawProceduralHeadgear: false` to each enemy asset presentation profile.

- [x] **Step 4: Gate old headgear drawing**

Only draw the old cone/bucket Phaser geometry when `drawProceduralHeadgear` is true.

- [x] **Step 5: Verify related tests pass**

Run:

```bash
npm test -- src/game/assets.test.ts
npm test -- src/game/assetPresentation.test.ts
```

Expected: both pass.

### Task 4: Documentation And Verification

**Files:**
- Modify: `docs/asset-sources.md`
- Modify: `docs/project-roadmap.md`

- [x] **Step 1: Record sources**

Add rows for the three toy enemy SVG files as original in-repository assets.

- [x] **Step 2: Update roadmap**

Record M11b as delivered and leave projectile/sun particle polish as remaining work.

- [x] **Step 3: Run full verification**

Run:

```bash
npm test
npm run build
git diff --check
```

Expected: all pass.

- [x] **Step 4: Commit**

Run:

```bash
git add docs src
git commit -m "Add M11 toy enemy assets"
```
