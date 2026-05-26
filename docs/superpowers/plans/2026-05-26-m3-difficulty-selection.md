# M3 Difficulty Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a HUD difficulty selector whose easy/normal choices change starting sun, zombie health, and zombie movement through configuration.

**Architecture:** Rules accept a `DifficultyConfig` value and remain independent of Phaser. `GameScene` owns the selected `DifficultyId`, restarts the current level when it changes, and exposes the selection to the DOM overlay. The DOM overlay renders a compact segmented control and dispatches difficulty changes back to the scene.

**Tech Stack:** TypeScript, Phaser, DOM HUD, Vitest, Vite.

---

## File Structure

- Modify `src/game/types.ts`: add `DifficultyConfig`.
- Modify `src/game/config.ts`: type `DIFFICULTY` with `DifficultyConfig`.
- Modify `src/game/rules.ts`: apply difficulty to starting sun, zombie spawn health, and zombie movement.
- Modify `src/game/rules.test.ts`: cover sun, health, and speed modifiers.
- Modify `src/game/GameScene.ts`: store selected difficulty and expose `setDifficulty()`.
- Modify `src/ui/domOverlay.ts`: render difficulty control and wire clicks.
- Modify `src/ui/domOverlay.test.ts`: cover difficulty markup.
- Modify `src/styles.css`: keep the segmented control compact on desktop and mobile.

## Task 1: Rule-Level Difficulty

- [x] **Step 1: Write failing rule tests**

Add tests to `src/game/rules.test.ts`:

```ts
it("applies easy difficulty to starting sun", () => {
  const normal = createInitialState(LEVEL_ONE, DIFFICULTY.normal);
  const easy = createInitialState(LEVEL_ONE, DIFFICULTY.easy);

  expect(easy.sun).toBeGreaterThan(normal.sun);
  expect(easy.sun % 25).toBe(0);
});

it("applies easy difficulty to spawned zombie health", () => {
  const spawned = spawnDueZombies(
    { ...createInitialState(LEVEL_ONE), nowMs: 9000 },
    LEVEL_ONE,
    ZOMBIES,
    DIFFICULTY.easy
  );

  expect(spawned.zombies[0].hp).toBeLessThan(ZOMBIES.basic.maxHp);
});

it("applies easy difficulty to zombie movement speed", () => {
  const base = {
    ...createInitialState(LEVEL_ONE),
    zombies: [{ id: "zombie-1", zombieId: "basic" as const, lane: 2 as const, x: 8, hp: 70, slowedUntilMs: 0 }]
  };

  const normal = advanceCombat(base, PLANTS, ZOMBIES, 1000, DIFFICULTY.normal);
  const easy = advanceCombat(base, PLANTS, ZOMBIES, 1000, DIFFICULTY.easy);

  expect(easy.zombies[0].x).toBeGreaterThan(normal.zombies[0].x);
});
```

- [x] **Step 2: Run tests and verify red**

Run:

```bash
npm test -- src/game/rules.test.ts
```

Expected: fail because rules do not accept difficulty config yet.

- [x] **Step 3: Implement rule modifiers**

Add `DifficultyConfig` to `src/game/types.ts`, type `DIFFICULTY`, and update `createInitialState`, `spawnDueZombies`, and `advanceCombat` to accept a difficulty config with a normal default.

- [x] **Step 4: Run tests and verify green**

Run:

```bash
npm test -- src/game/rules.test.ts
```

Expected: rule tests pass.

## Task 2: HUD Difficulty Control

- [x] **Step 1: Write failing DOM tests**

Add tests to `src/ui/domOverlay.test.ts` that assert the markup includes `data-difficulty="easy"`, `data-difficulty="normal"`, and marks the selected difficulty with `is-selected`.

- [x] **Step 2: Implement DOM control**

Extend `OverlayRenderState` with `difficultyId`, render the segmented control in `.hud-top`, and call `scene.setDifficulty()` when a difficulty button is clicked.

- [x] **Step 3: Style the control**

Add compact segmented-control CSS to `src/styles.css`, keeping the mobile top HUD readable.

- [x] **Step 4: Run DOM tests**

Run:

```bash
npm test -- src/ui/domOverlay.test.ts
```

Expected: DOM tests pass.

## Task 3: Scene Integration And Verification

- [x] **Step 1: Wire GameScene**

Add `currentDifficultyId`, `getCurrentDifficultyId()`, `setDifficulty()`, and pass `DIFFICULTY[this.currentDifficultyId]` into rules calls.

- [x] **Step 2: Run all tests**

Run:

```bash
npm test
```

Expected: all tests pass.

- [x] **Step 3: Build**

Run:

```bash
npm run build
```

Expected: build succeeds with only the known chunk-size warning.

- [x] **Step 4: Browser check**

Open `http://127.0.0.1:5173/` and verify difficulty controls, selecting/planting, pause, sound toggle, desktop/mobile layout, and console warnings/errors.

- [x] **Step 5: Commit**

Commit:

```bash
git add docs/superpowers/specs/2026-05-26-m3-difficulty-selection-design.md docs/superpowers/plans/2026-05-26-m3-difficulty-selection.md src/game/types.ts src/game/config.ts src/game/rules.ts src/game/rules.test.ts src/game/GameScene.ts src/ui/domOverlay.ts src/ui/domOverlay.test.ts src/styles.css
git commit -m "Add difficulty selection"
```
