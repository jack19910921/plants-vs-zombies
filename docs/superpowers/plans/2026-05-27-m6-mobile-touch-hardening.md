# Mobile And Touch Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the prototype playable and readable on phone/tablet screens with touch movement controls and hardened responsive HUD layout.

**Architecture:** Add a pure lane movement helper in `src/game/rules.ts`, expose a narrow `GameScene.moveHeroLane(delta)` adapter, add DOM lane buttons in `src/ui/domOverlay.ts`, and update `src/styles.css` for safe-area-aware mobile sizing.

**Tech Stack:** TypeScript, Phaser, DOM overlay, CSS media queries, Vitest, Vite, Playwright/browser smoke checks.

---

### Task 1: Shared Hero Lane Movement

**Files:**
- Modify: `src/game/rules.ts`
- Modify: `src/game/rules.test.ts`
- Modify: `src/game/GameScene.ts`

- [x] **Step 1: Write failing tests**

Add tests proving `moveHeroLane` moves up/down and clamps at lanes `0` and `4`.

- [x] **Step 2: Verify red**

Run:

```bash
npm test -- src/game/rules.test.ts
```

Expected: fail because `moveHeroLane` is not exported yet.

- [x] **Step 3: Implement the helper and scene adapter**

Export `moveHeroLane(state, delta)` from `rules.ts`, use it inside `GameScene.handleKeyboard`, and add public `GameScene.moveHeroLane(delta)`.

- [x] **Step 4: Verify green**

Run:

```bash
npm test -- src/game/rules.test.ts
```

Expected: all rules tests pass.

### Task 2: DOM Touch Controls

**Files:**
- Modify: `src/ui/domOverlay.ts`
- Modify: `src/ui/domOverlay.test.ts`

- [x] **Step 1: Write failing tests**

Add DOM tests verifying the overlay renders `data-action="lane-up"` / `data-action="lane-down"` buttons and dispatches `scene.moveHeroLane(-1)` / `scene.moveHeroLane(1)`.

- [x] **Step 2: Verify red**

Run:

```bash
npm test -- src/ui/domOverlay.test.ts
```

Expected: fail because lane controls are not present or wired.

- [x] **Step 3: Implement controls**

Render a compact `.lane-controls` cluster and handle its actions in the overlay click listener.

- [x] **Step 4: Verify green**

Run:

```bash
npm test -- src/ui/domOverlay.test.ts
```

Expected: all DOM overlay tests pass.

### Task 3: Mobile Layout Hardening

**Files:**
- Modify: `src/styles.css`

- [x] **Step 1: Update responsive CSS**

Replace mobile transform scaling with real grid sizing, apply safe-area inset variables, set minimum touch sizes, wrap tutorial/feedback text, and keep modal content within the viewport.

- [x] **Step 2: Browser smoke**

Run a dev server and inspect desktop plus mobile viewports for no console warnings/errors and readable controls.

### Task 4: Roadmap, Verification, Commit

**Files:**
- Modify: `docs/project-roadmap.md`
- Modify: `docs/superpowers/plans/2026-05-27-m6-mobile-touch-hardening.md`

- [x] **Step 1: Update roadmap**

Mark M6 complete and list delivered touch controls, responsive HUD, safe-area handling, and verification.

- [x] **Step 2: Mark plan complete**

Check off completed steps in this plan.

- [x] **Step 3: Run verification**

Run:

```bash
npm test
npm run build
git diff --check
```

Expected: all pass; build may retain the known Phaser/Three chunk-size warning until M7.

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/project-roadmap.md docs/superpowers/specs/2026-05-27-m6-mobile-touch-hardening-design.md docs/superpowers/plans/2026-05-27-m6-mobile-touch-hardening.md src/game/rules.ts src/game/rules.test.ts src/game/GameScene.ts src/ui/domOverlay.ts src/ui/domOverlay.test.ts src/styles.css
git commit -m "Harden mobile touch controls"
```
