# Miniature Volume Rendering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade plant and enemy rendering so existing safe assets read as tabletop miniatures with more physical volume.

**Architecture:** Add pure helper functions in `src/game/worldPresentation.ts` with tests in `src/game/worldPresentation.test.ts`. Use the helpers from `src/game/GameScene.ts` to draw extra Phaser primitive layers and apply squash/stretch values.

**Tech Stack:** TypeScript, Phaser, Vitest, Vite, Playwright browser checks.

---

### Task 1: Presentation Helper

**Files:**
- Create: `src/game/worldPresentation.ts`
- Create: `src/game/worldPresentation.test.ts`

- [x] **Step 1: Write failing tests**

Add tests for:

```ts
getPlantMiniatureState(1000, 1, 2, 0.8, 0)
getPlantMiniatureState(1000, 1, 2, 0, 0.9)
getZombieMiniatureState(1000, 4.5, false, 0)
getZombieMiniatureState(1000, 4.5, true, 0.8)
```

Expected behavior:
- plant fire pulse recoils left and stretches upward
- plant hit pulse shakes sideways, squashes downward, and increases damage flash
- zombie chewing lunges forward and widens its shadow
- zombie hit pulse recoils backward and increases damage flash

- [x] **Step 2: Verify red**

Run:

```bash
npm test -- src/game/worldPresentation.test.ts
```

Expected: fail because the helper module does not exist.

- [x] **Step 3: Implement helpers**

Create:

```ts
export function getPlantMiniatureState(...)
export function getZombieMiniatureState(...)
```

Return only numbers needed by drawing code: offsets, scale, rotation, shadow scale, and flash alpha.

- [x] **Step 4: Verify green**

Run:

```bash
npm test -- src/game/worldPresentation.test.ts
```

Expected: all helper tests pass.

### Task 2: Phaser Drawing Upgrade

**Files:**
- Modify: `src/game/GameScene.ts`

- [x] **Step 1: Import helpers**

Use `getPlantMiniatureState` and `getZombieMiniatureState` inside `drawPlant` and `drawZombie`.

- [x] **Step 2: Add plant volume layers**

Draw base ellipse, stem support, deeper backing, image squash/stretch, rim, and highlight using helper values.

- [x] **Step 3: Add zombie volume layers**

Draw contact shadow, foot pads, side backing, image squash/stretch, rim, and existing variant props using helper values.

- [x] **Step 4: Verify browser**

Use Playwright to inspect desktop and mobile screenshots and confirm console warnings/errors remain zero.

### Task 3: Roadmap, Full Verification, Commit

**Files:**
- Modify: `docs/project-roadmap.md`
- Modify: `docs/superpowers/plans/2026-05-27-m5-miniature-volume-rendering.md`

- [x] **Step 1: Update roadmap**

Mark M4 complete and add the miniature rendering slice under M5 delivered work.

- [x] **Step 2: Mark plan complete**

Check off completed steps in this plan.

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
git add docs/project-roadmap.md docs/superpowers/specs/2026-05-27-m5-miniature-volume-rendering-design.md docs/superpowers/plans/2026-05-27-m5-miniature-volume-rendering.md src/game/worldPresentation.ts src/game/worldPresentation.test.ts src/game/GameScene.ts
git commit -m "Add miniature volume rendering"
```
