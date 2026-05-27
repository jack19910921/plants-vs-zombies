# M11c Projectile And Sun Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish projectile and sun pickup visuals so they better match the M11 toy asset pass.

**Architecture:** Add pure presentation helpers in `src/game/worldPresentation.ts`, consume them in `src/game/GameScene.ts`, and update roadmap documentation. No gameplay logic or assets change.

**Tech Stack:** TypeScript, Phaser 3, Vitest, Vite.

---

### Task 1: Presentation Helpers

**Files:**
- Modify: `src/game/worldPresentation.test.ts`
- Modify: `src/game/worldPresentation.ts`

- [x] **Step 1: Write failing tests**

Add tests for:

- Normal and ice projectiles using distinct toy bead palettes.
- Ice projectiles having a stronger glow than normal projectiles.
- Sun pickup feedback shrinking/fading while its halo expands.

- [x] **Step 2: Verify tests fail**

Run: `npm test -- src/game/worldPresentation.test.ts`

Expected: fail because `getProjectilePresentation` and `getSunPickupPresentation` are not exported.

- [x] **Step 3: Implement helpers**

Add `ProjectilePresentation`, `SunPickupPresentation`, `getProjectilePresentation(slows)`, and `getSunPickupPresentation(progress)`.

- [x] **Step 4: Verify tests pass**

Run: `npm test -- src/game/worldPresentation.test.ts`

Expected: pass.

### Task 2: Phaser Rendering

**Files:**
- Modify: `src/game/GameScene.ts`

- [x] **Step 1: Use projectile helper**

Replace inline projectile colors/radii with `getProjectilePresentation(projectile.slows)`.

- [x] **Step 2: Use sun pickup helper**

Replace inline sun-produced coin styling with `getSunPickupPresentation(sunProgress)`.

### Task 3: Docs And Verification

**Files:**
- Create: `docs/superpowers/specs/2026-05-27-m11c-projectile-sun-polish-design.md`
- Create: `docs/superpowers/plans/2026-05-27-m11c-projectile-sun-polish.md`
- Modify: `docs/project-roadmap.md`

- [x] **Step 1: Update roadmap**

Record M11c as delivered and leave only deeper animation/content work for future slices.

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
git commit -m "Polish M11 projectile and sun visuals"
```
