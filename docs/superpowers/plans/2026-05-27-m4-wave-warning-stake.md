# M4 Wave Warning Stake Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 3D warning stake/flag that pops up during wave alerts.

**Architecture:** Keep timing state in `threePresentation`, mesh construction and animation in `ThreeStage`, and reuse the existing `pulseWaveAlert()` event path.

**Tech Stack:** TypeScript, Three.js, Vitest, Vite, Playwright.

---

## File Structure

- Modify `src/game/threePresentation.ts`: add `getWaveWarningStakeState(ageMs)`.
- Modify `src/game/threePresentation.test.ts`: cover stake visibility and expiry.
- Modify `src/game/ThreeStage.ts`: build and animate a warning stake group.
- Modify `docs/project-roadmap.md`: record warning-stake progress.

## Task 1: Warning Stake State Helper

- [x] **Step 1: Write failing helper tests**

Add tests that assert the stake is visible at `0`, larger at `240`, and hidden at `1000`.

- [x] **Step 2: Run tests and verify red**

Run:

```bash
npm test -- src/game/threePresentation.test.ts
```

Expected: fail because `getWaveWarningStakeState` does not exist.

- [x] **Step 3: Implement helper**

Export `WaveWarningStakeState` and `getWaveWarningStakeState(ageMs)`.

- [x] **Step 4: Run tests and verify green**

Run:

```bash
npm test -- src/game/threePresentation.test.ts
```

Expected: helper tests pass.

## Task 2: ThreeStage Mesh

- [x] **Step 1: Build warning stake mesh**

Add a small wooden post and red flag group in `ThreeStage`.

- [x] **Step 2: Animate from helper**

Use `wavePulseStartedAt` inside `animateWaveWarningStake(now)`.

## Task 3: Verification And Commit

- [x] **Step 1: Run all tests**

Run:

```bash
npm test
```

Expected: all tests pass.

- [x] **Step 2: Build**

Run:

```bash
npm run build
```

Expected: build succeeds with only the known chunk-size warning.

- [x] **Step 3: Browser check**

Open `http://127.0.0.1:5173/`, wait for the first wave, verify the Three canvas changes pixels, and check console warnings/errors.

- [x] **Step 4: Commit**

Commit:

```bash
git add docs/superpowers/specs/2026-05-27-m4-wave-warning-stake-design.md docs/superpowers/plans/2026-05-27-m4-wave-warning-stake.md docs/project-roadmap.md src/game/threePresentation.ts src/game/threePresentation.test.ts src/game/ThreeStage.ts
git commit -m "Add 3D wave warning stake"
```
