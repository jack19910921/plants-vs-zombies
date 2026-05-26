# Health Wear Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add visible cracks and scuffs to damaged plants and enemies while keeping rules unchanged.

**Architecture:** Add a pure `getHealthWearState(currentHp, maxHp)` helper in `src/game/worldPresentation.ts`, test it in `src/game/worldPresentation.test.ts`, and consume it from `src/game/GameScene.ts` drawing code.

**Tech Stack:** TypeScript, Phaser, Vitest, Vite, Playwright browser checks.

---

### Task 1: Wear State Helper

**Files:**
- Modify: `src/game/worldPresentation.ts`
- Modify: `src/game/worldPresentation.test.ts`

- [x] **Step 1: Write failing tests**

Test these expectations:

```ts
getHealthWearState(100, 100)
getHealthWearState(50, 100)
getHealthWearState(20, 100)
```

Expected behavior:
- full health has zero cracks and zero overlay alpha.
- half health has visible cracks/scuffs.
- critical health has more cracks and stronger danger alpha than half health.

- [x] **Step 2: Verify red**

Run:

```bash
npm test -- src/game/worldPresentation.test.ts
```

Expected: fail because `getHealthWearState` is not exported.

- [x] **Step 3: Implement helper**

Return crack count, crack alpha, scuff alpha, and danger alpha from current and max HP.

- [x] **Step 4: Verify green**

Run:

```bash
npm test -- src/game/worldPresentation.test.ts
```

Expected: all world presentation tests pass.

### Task 2: GameScene Integration

**Files:**
- Modify: `src/game/GameScene.ts`

- [x] **Step 1: Import wear helper**

Use `getHealthWearState` in `drawPlant` and `drawZombie`.

- [x] **Step 2: Draw plant wear**

Draw subtle crack lines and critical warm overlay using plant profile dimensions.

- [x] **Step 3: Draw enemy wear**

Draw scratch lines and danger overlay using zombie profile dimensions.

- [x] **Step 4: Verify browser**

Run combat long enough for visible damage and confirm the overlays render without console warnings/errors.

### Task 3: Roadmap, Verification, Commit

**Files:**
- Modify: `docs/project-roadmap.md`
- Modify: `docs/superpowers/plans/2026-05-27-m5-health-wear-feedback.md`

- [x] **Step 1: Update roadmap**

Add health wear feedback to M5 delivered work.

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
git add docs/project-roadmap.md docs/superpowers/specs/2026-05-27-m5-health-wear-feedback-design.md docs/superpowers/plans/2026-05-27-m5-health-wear-feedback.md src/game/worldPresentation.ts src/game/worldPresentation.test.ts src/game/GameScene.ts
git commit -m "Add health wear feedback"
```
