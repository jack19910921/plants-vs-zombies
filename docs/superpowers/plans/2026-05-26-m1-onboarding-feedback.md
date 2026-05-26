# M1 Onboarding Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the first child-friendly onboarding slice: tutorial prompts plus specific feedback for failed planting attempts.

**Architecture:** Keep gameplay validation in `src/game/rules.ts` and render tutorial/feedback copy in `src/ui/domOverlay.ts`. Use typed planting results so `GameScene` can surface feedback without duplicating rule conditions.

**Tech Stack:** TypeScript, Phaser, DOM HUD, Vitest, Vite.

---

## File Structure

- Modify `src/game/types.ts`: add planting failure/result types and short-lived UI feedback event type if needed.
- Modify `src/game/rules.ts`: add `getPlantingResult` helper and make `plantAt` reuse it.
- Modify `src/game/rules.test.ts`: cover planting failure reasons and successful planting behavior.
- Modify `src/game/GameScene.ts`: set feedback when board clicks fail or land outside the board.
- Modify `src/ui/domOverlay.ts`: render tutorial prompt and feedback message.
- Modify `src/ui/domOverlay.test.ts`: cover prompt and feedback markup.
- Modify `src/styles.css`: style the tutorial strip without blocking board/plant tray.

## Task 1: Rule-Level Planting Result

- [ ] **Step 1: Write failing tests for planting failure reasons**

Add tests in `src/game/rules.test.ts`:

```ts
it("reports why planting cannot happen", () => {
  const empty = createInitialState(LEVEL_ONE);
  expect(getPlantingResult(empty, PLANTS, 0, 0)).toMatchObject({ ok: false, reason: "no-selection" });

  const lowSun = selectPlant({ ...empty, sun: 20 }, "peashooter");
  expect(getPlantingResult(lowSun, PLANTS, 0, 0)).toMatchObject({ ok: false, reason: "not-enough-sun" });

  const planted = plantAt(selectPlant(empty, "sunflower"), PLANTS, 0, 0);
  expect(getPlantingResult(selectPlant(planted, "wallnut"), PLANTS, 0, 0)).toMatchObject({
    ok: false,
    reason: "occupied"
  });

  const coolingDown = selectPlant({ ...planted, nowMs: planted.nowMs + 1000 }, "sunflower");
  expect(getPlantingResult(coolingDown, PLANTS, 1, 1)).toMatchObject({ ok: false, reason: "cooldown" });
});
```

- [ ] **Step 2: Run rule test and verify red**

Run:

```bash
npm test -- src/game/rules.test.ts
```

Expected: fail because `getPlantingResult` is not exported.

- [ ] **Step 3: Implement typed planting result**

Add types in `src/game/types.ts`, then implement and export `getPlantingResult` in `src/game/rules.ts`. Update `plantAt` to call it and return unchanged state when `ok` is false.

- [ ] **Step 4: Run rule test and verify green**

Run:

```bash
npm test -- src/game/rules.test.ts
```

Expected: all rule tests pass.

## Task 2: DOM Tutorial And Feedback Markup

- [ ] **Step 1: Write failing DOM tests**

Add tests in `src/ui/domOverlay.test.ts`:

```ts
it("renders the initial tutorial prompt", () => {
  const html = createDomOverlayMarkup({
    sun: 250,
    waveText: "第 1 波 / 8",
    status: "playing",
    selectedPlantId: null,
    cooldownReadyAt: {
      sunflower: 0,
      peashooter: 0,
      wallnut: 0,
      snowpea: 0,
      potatomine: 0
    },
    nowMs: 0,
    plantsCount: 0,
    recentFeedback: null,
    recentEvents: []
  });
  expect(html).toContain("先选一张植物卡片");
});

it("renders specific invalid action feedback", () => {
  const html = createDomOverlayMarkup({
    sun: 250,
    waveText: "第 1 波 / 8",
    status: "playing",
    selectedPlantId: "sunflower",
    cooldownReadyAt: {
      sunflower: 0,
      peashooter: 0,
      wallnut: 0,
      snowpea: 0,
      potatomine: 0
    },
    nowMs: 0,
    plantsCount: 0,
    recentFeedback: { type: "planting", reason: "occupied" },
    recentEvents: []
  });
  expect(html).toContain("这个格子已经有植物啦");
});
```

- [ ] **Step 2: Run DOM test and verify red**

Run:

```bash
npm test -- src/ui/domOverlay.test.ts
```

Expected: fail because `createDomOverlayMarkup` does not accept/render the new fields.

- [ ] **Step 3: Implement markup and copy**

Extend `OverlayRenderState` with `plantsCount`, `recentFeedback`, and `recentEvents`. Add helper functions that choose tutorial and feedback copy. Render a `.tutorial-strip` inside `.hud`.

- [ ] **Step 4: Run DOM test and verify green**

Run:

```bash
npm test -- src/ui/domOverlay.test.ts
```

Expected: all DOM tests pass.

## Task 3: Scene Feedback Integration

- [ ] **Step 1: Add scene feedback state**

In `src/game/GameScene.ts`, store a short-lived planting feedback object when board clicks fail. Use `getPlantingResult` before `plantAt`, and emit the feedback through `uiEvents`.

- [ ] **Step 2: Render feedback from integration**

Update `createDomOverlay` to pass `plantsCount`, recent events, and the latest feedback into `createDomOverlayMarkup`.

- [ ] **Step 3: Run all tests**

Run:

```bash
npm test
```

Expected: all tests pass.

## Task 4: Styling And Browser Verification

- [ ] **Step 1: Style tutorial strip**

Add `.tutorial-strip` and `.feedback-pill` styles to `src/styles.css`. Keep the strip compact, non-overlapping, and readable on mobile.

- [ ] **Step 2: Build**

Run:

```bash
npm run build
```

Expected: build succeeds with only the known chunk-size warning.

- [ ] **Step 3: Browser check**

Open or reload `http://127.0.0.1:5173/`. Verify:

- Initial prompt is visible.
- Selecting a plant changes prompt.
- Clicking an occupied tile shows occupied feedback.
- Console has no warnings or errors.

- [ ] **Step 4: Commit**

Commit:

```bash
git add src/game/types.ts src/game/rules.ts src/game/rules.test.ts src/game/GameScene.ts src/ui/domOverlay.ts src/ui/domOverlay.test.ts src/styles.css docs/superpowers/specs/2026-05-26-m1-onboarding-feedback-design.md docs/superpowers/plans/2026-05-26-m1-onboarding-feedback.md
git commit -m "Add onboarding feedback prompts"
```

## Task 5: Positive Reinforcement Feedback

- [ ] **Step 1: Write failing DOM/helper tests**

Add tests in `src/ui/domOverlay.test.ts` for deriving first-time achievements from state/events and rendering the feedback pill.

Expected achievements:

- `first-plant`: first successful plant on the board.
- `first-sun`: first `sun-produced` combat event.
- `first-zombie-defeated`: first `zombie-defeated` combat event.

- [ ] **Step 2: Run DOM test and verify red**

Run:

```bash
npm test -- src/ui/domOverlay.test.ts
```

Expected: fail because achievement feedback helpers do not exist.

- [ ] **Step 3: Implement achievement feedback**

Extend overlay feedback to include an `achievement` variant. Add a helper that returns the next unshown achievement from the latest `GameState`, then make `createDomOverlay` show it briefly.

- [ ] **Step 4: Verify**

Run:

```bash
npm test
npm run build
```

Expected: tests pass and build succeeds with only the known chunk-size warning.

- [ ] **Step 5: Browser check and commit**

Verify first planting and first combat milestone feedback in the browser. Commit:

```bash
git add docs/superpowers/plans/2026-05-26-m1-onboarding-feedback.md src/ui/domOverlay.ts src/ui/domOverlay.test.ts
git commit -m "Add positive onboarding feedback"
```
