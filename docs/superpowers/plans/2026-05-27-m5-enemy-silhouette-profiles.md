# Enemy Silhouette Profiles Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add enemy-specific visual profiles so basic, cone, and bucket enemies have distinct silhouettes and weight.

**Architecture:** Extend `src/game/worldPresentation.ts` with a pure zombie profile helper and tests. Use the helper from `src/game/GameScene.ts` to draw variant body dimensions, shadows, foot pads, rims, tints, and headgear.

**Tech Stack:** TypeScript, Phaser, Vitest, Vite, Playwright browser checks.

---

### Task 1: Zombie Profile Helper

**Files:**
- Modify: `src/game/worldPresentation.ts`
- Modify: `src/game/worldPresentation.test.ts`

- [x] **Step 1: Write failing tests**

Test these expectations:

```ts
getZombieMiniatureProfile("basic")
getZombieMiniatureProfile("cone")
getZombieMiniatureProfile("bucket")
```

Expected behavior:
- cone has `headgear` set to `"cone"` and is taller than basic.
- bucket has `headgear` set to `"bucket"` and is wider/heavier than basic.
- bucket uses a different rim color from basic.
- basic has `headgear` set to `"none"`.

- [x] **Step 2: Verify red**

Run:

```bash
npm test -- src/game/worldPresentation.test.ts
```

Expected: fail because `getZombieMiniatureProfile` is not exported.

- [x] **Step 3: Implement helper**

Add a `ZombieMiniatureProfile` interface and profile data for `basic`, `cone`, and `bucket`.

- [x] **Step 4: Verify green**

Run:

```bash
npm test -- src/game/worldPresentation.test.ts
```

Expected: all world presentation tests pass.

### Task 2: GameScene Integration

**Files:**
- Modify: `src/game/GameScene.ts`

- [x] **Step 1: Import zombie profile helper**

Use `getZombieMiniatureProfile(zombie.zombieId)` inside `drawZombie`.

- [x] **Step 2: Apply profile values**

Use profile values for shadow size, foot pads, backing ellipse, image size, rim color, tint, hit flash size, slow aura size, and headgear.

- [x] **Step 3: Verify browser**

Let early waves spawn on desktop and mobile and confirm enemy silhouettes are distinct and console warnings/errors remain zero.

### Task 3: Roadmap, Verification, Commit

**Files:**
- Modify: `docs/project-roadmap.md`
- Modify: `docs/superpowers/plans/2026-05-27-m5-enemy-silhouette-profiles.md`

- [x] **Step 1: Update roadmap**

Add enemy silhouette profiles to M5 delivered work.

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
git add docs/project-roadmap.md docs/superpowers/specs/2026-05-27-m5-enemy-silhouette-profiles-design.md docs/superpowers/plans/2026-05-27-m5-enemy-silhouette-profiles.md src/game/worldPresentation.ts src/game/worldPresentation.test.ts src/game/GameScene.ts
git commit -m "Add enemy silhouette profiles"
```
