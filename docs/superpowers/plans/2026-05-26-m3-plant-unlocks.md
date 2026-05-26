# M3 Plant Unlocks Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make level-specific `allowedPlants` affect the HUD and scene selection flow.

**Architecture:** Keep unlock data in `LevelConfig.allowedPlants`. Render locked cards in DOM. Guard scene selection before rules receive a selected plant.

**Tech Stack:** TypeScript, Phaser, DOM HUD, Vitest, Vite.

---

## File Structure

- Modify `src/game/config.ts`: use a progressive allowed-plant sequence.
- Modify `src/game/config.test.ts`: verify unlock progression.
- Modify `src/game/GameScene.ts`: ignore locked plant selection and emit feedback.
- Modify `src/ui/domOverlay.ts`: render locked cards as disabled with `未开放`.
- Modify `src/ui/domOverlay.test.ts`: cover locked-card markup.
- Modify `src/styles.css`: add locked-card styling if the existing disabled style is not enough.
- Modify `docs/project-roadmap.md`: record plant unlock progress.

## Task 1: Config Unlock Sequence

- [ ] **Step 1: Write failing config test**

Add assertions that level 1 excludes `snowpea` and `potatomine`, level 2 includes `snowpea`, and level 3 includes `potatomine`.

- [ ] **Step 2: Run config test and verify red**

Run:

```bash
npm test -- src/game/config.test.ts
```

Expected: fail because all current levels allow every plant.

- [ ] **Step 3: Update level allowed plants**

Set:

```ts
level-1: ["sunflower", "peashooter", "wallnut"]
level-2: ["sunflower", "peashooter", "wallnut", "snowpea"]
level-3: ["sunflower", "peashooter", "wallnut", "snowpea", "potatomine"]
```

- [ ] **Step 4: Run config test and verify green**

Run:

```bash
npm test -- src/game/config.test.ts
```

Expected: config test passes.

## Task 2: HUD Locked Cards

- [ ] **Step 1: Write failing DOM test**

Add a test that renders with `allowedPlantIds: ["sunflower"]` and expects the peashooter card to include `disabled`, `is-locked`, and `未开放`.

- [ ] **Step 2: Implement locked-card markup**

Extend `OverlayRenderState` with `allowedPlantIds?: PlantId[]`, render locked cards disabled, and pass `level.allowedPlants` from `createDomOverlay()`.

- [ ] **Step 3: Run DOM tests**

Run:

```bash
npm test -- src/ui/domOverlay.test.ts
```

Expected: DOM tests pass.

## Task 3: Scene Guard, Verification, Commit

- [ ] **Step 1: Guard GameScene selection**

In `setSelectedPlant()`, return early for plants outside `this.currentLevel.allowedPlants` and emit `feedback-changed` with reason `locked`.

- [ ] **Step 2: Add locked feedback copy**

Add `locked: "这株植物下一关再用。"` to overlay planting feedback.

- [ ] **Step 3: Run all tests**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 4: Build**

Run:

```bash
npm run build
```

Expected: build succeeds with only the known chunk-size warning.

- [ ] **Step 5: Browser check**

Open `http://127.0.0.1:5173/` and verify locked cards show `未开放`, are disabled, and the console has no warnings/errors.

- [ ] **Step 6: Commit**

Commit:

```bash
git add docs/superpowers/specs/2026-05-26-m3-plant-unlocks-design.md docs/superpowers/plans/2026-05-26-m3-plant-unlocks.md docs/project-roadmap.md src/game/config.ts src/game/config.test.ts src/game/GameScene.ts src/ui/domOverlay.ts src/ui/domOverlay.test.ts src/styles.css
git commit -m "Add level plant unlocks"
```
