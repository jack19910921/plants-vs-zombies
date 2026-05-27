# Potato Mine Arming Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `土豆雷` act as an armed lane trap with a visible explosion feedback event.

**Architecture:** Add a `potato-mine-exploded` combat event in `src/game/types.ts`, implement trap resolution in `src/game/rules.ts`, map the event to existing audio in `src/game/audio.ts`, and render a short burst in `src/game/GameScene.ts`.

**Tech Stack:** TypeScript, Vitest, Phaser, existing generated Web Audio, Vite.

---

### Task 1: Trap Rules

**Files:**
- Modify: `src/game/types.ts`
- Modify: `src/game/rules.ts`
- Modify: `src/game/rules.test.ts`

- [x] **Step 1: Write failing tests**

Add tests proving unarmed potato mines do not explode and armed potato mines damage zombies, remove themselves, and emit `potato-mine-exploded`.

- [x] **Step 2: Verify red**

Run:

```bash
npm test -- src/game/rules.test.ts
```

Expected: fail because the explosion behavior is missing.

- [x] **Step 3: Implement minimal rule behavior**

Add the event type and a narrow trap-resolution block in `advanceCombat`.

- [x] **Step 4: Verify green**

Run:

```bash
npm test -- src/game/rules.test.ts
```

Expected: all rules tests pass.

### Task 2: Audio And Presentation

**Files:**
- Modify: `src/game/audio.ts`
- Modify: `src/game/audio.test.ts`
- Modify: `src/game/GameScene.ts`

- [x] **Step 1: Write failing audio test**

Add a test proving `potato-mine-exploded` maps to `hit`.

- [x] **Step 2: Verify red**

Run:

```bash
npm test -- src/game/audio.test.ts
```

Expected: fail until the event is handled.

- [x] **Step 3: Implement mapping and burst rendering**

Map the event to `hit` and draw a short-lived dirt shockwave in `GameScene.redrawDynamicWorld`.

- [x] **Step 4: Verify green**

Run:

```bash
npm test -- src/game/audio.test.ts
```

Expected: all audio tests pass.

### Task 3: Docs, Verification, Commit

**Files:**
- Modify: `docs/project-roadmap.md`
- Modify: `docs/superpowers/plans/2026-05-27-m8-potato-mine-arming.md`

- [x] **Step 1: Update roadmap**

Add M8 as complete with trap rules and visible burst feedback.

- [x] **Step 2: Mark plan complete**

Check off completed steps in this plan.

- [x] **Step 3: Run verification**

Run:

```bash
npm test
npm run build
git diff --check
```

Then run browser smoke on a local server for desktop and mobile console checks.

- [ ] **Step 4: Commit**

Run:

```bash
git add docs/project-roadmap.md docs/superpowers/specs/2026-05-27-m8-potato-mine-arming-design.md docs/superpowers/plans/2026-05-27-m8-potato-mine-arming.md src/game/types.ts src/game/rules.ts src/game/rules.test.ts src/game/audio.ts src/game/audio.test.ts src/game/GameScene.ts
git commit -m "Add potato mine arming"
```
