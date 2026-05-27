# M10 Realistic Toy Garden Art Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use inline execution in this session. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a procedural realistic toy-garden art pass without external assets.

**Architecture:** Add deterministic prop presentation helpers in `src/game/threePresentation.ts`, consume them in `src/game/ThreeStage.ts`, and polish the existing Phaser board/table drawing in `src/game/GameScene.ts`. CSS background changes stay layout-neutral.

**Tech Stack:** TypeScript, Three.js, Phaser, Vitest, Vite.

---

### Task 1: Prop Presentation Helper

**Files:**
- Modify: `src/game/threePresentation.ts`
- Test: `src/game/threePresentation.test.ts`

- [ ] **Step 1: Write failing tests**

Add tests that call `getToyGardenPropProfiles()` and assert:

- At least six props are returned.
- Props use multiple material families.
- Every prop stays within compact stage bounds.

- [ ] **Step 2: Run targeted test**

Run: `npm test -- src/game/threePresentation.test.ts`

Expected: fail because `getToyGardenPropProfiles` is not exported yet.

- [ ] **Step 3: Implement helper**

Export `ToyGardenPropProfile` and `getToyGardenPropProfiles()` from `src/game/threePresentation.ts`. Include small, bounded profile data for pots, watering can, seed crate, pebbles, and tray markers.

- [ ] **Step 4: Verify targeted test**

Run: `npm test -- src/game/threePresentation.test.ts`

Expected: pass.

### Task 2: Three.js Prop Layer

**Files:**
- Modify: `src/game/ThreeStage.ts`

- [ ] **Step 1: Build prop group**

Create a `toyGardenProps` group, build meshes from the helper profiles, and add it before event props.

- [ ] **Step 2: Animate subtly**

Add tiny idle motion/light shimmer in `animate()` so the prop layer has depth but does not distract.

- [ ] **Step 3: Keep bounds safe**

Position persistent props within the compact Three stage and behind active event props.

### Task 3: Phaser Board/Table Polish

**Files:**
- Modify: `src/game/GameScene.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Tabletop**

Replace flat tabletop with layered warm wood rectangles, plank lines, soft vignette, and corner shadows.

- [ ] **Step 2: Garden tray**

Add tray rim, soil shadows, row highlights, and a few tiny pebble/label marks around the board without covering cells.

- [ ] **Step 3: CSS background**

Update body background to richer wood tones while keeping no layout changes.

### Task 4: Verification And Commit

**Files:**
- Verify all modified files.

- [ ] **Step 1: Run full verification**

Run:

```bash
npm test
npm run build
git diff --check
```

- [ ] **Step 2: Browser smoke**

Reload `http://127.0.0.1:5173/` and check:

- Console warning/error count is 0.
- Two canvases are present.
- Screenshot/frame bytes change over time.
- HUD and plant cards remain visible.

- [ ] **Step 3: Commit**

Commit with message: `Add M10 toy garden art pass`.
