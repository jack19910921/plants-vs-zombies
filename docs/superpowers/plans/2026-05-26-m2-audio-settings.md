# M2 Audio And Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add generated Web Audio sound effects and a HUD sound toggle without introducing external audio assets.

**Architecture:** Keep audio in `src/game/audio.ts`, keep HUD controls in `src/ui/domOverlay.ts`, and wire them together in `src/main.ts`. Use existing `CombatEvent` values for most triggers and small `GameScene.uiEvents` hooks for user actions such as selecting and planting.

**Tech Stack:** TypeScript, Web Audio API, Phaser event emitter, DOM HUD, Vitest, Vite.

---

## File Structure

- Create `src/game/audio.ts`: sound IDs, settings helpers, event mapping, and Web Audio controller.
- Create `src/game/audio.test.ts`: pure unit tests for settings and event mapping.
- Modify `src/ui/domOverlay.ts`: sound toggle markup and click handling.
- Modify `src/ui/domOverlay.test.ts`: sound toggle label tests.
- Modify `src/game/GameScene.ts`: emit sound events for select/plant where needed.
- Modify `src/main.ts`: instantiate audio controller and wire state/events/UI.
- Modify `src/styles.css`: keep top HUD layout stable with sound toggle.

## Task 1: Audio Mapping And Settings Helpers

- [ ] **Step 1: Write failing audio tests**

Create `src/game/audio.test.ts` with tests for default settings, toggling, combat event mapping, and terminal status mapping.

- [ ] **Step 2: Run audio test and verify red**

Run:

```bash
npm test -- src/game/audio.test.ts
```

Expected: fail because `src/game/audio.ts` does not exist.

- [ ] **Step 3: Implement helpers**

Create `src/game/audio.ts` with:

- `SoundId`
- `createAudioSettings`
- `toggleAudioSettings`
- `getSoundForCombatEvent`
- `getSoundForStatus`

- [ ] **Step 4: Run audio test and verify green**

Run:

```bash
npm test -- src/game/audio.test.ts
```

Expected: audio tests pass.

## Task 2: HUD Sound Toggle

- [ ] **Step 1: Write failing DOM tests**

Extend `src/ui/domOverlay.test.ts` so markup includes `data-action="sound"` and displays `声音开` / `声音关`.

- [ ] **Step 2: Implement toggle markup and callback**

Extend `createDomOverlayMarkup` with `soundEnabled`. Extend `createDomOverlay` options with `soundEnabled` and `onToggleSound`.

- [ ] **Step 3: Run DOM tests**

Run:

```bash
npm test -- src/ui/domOverlay.test.ts
```

Expected: DOM tests pass.

## Task 3: Web Audio Controller And Wiring

- [ ] **Step 1: Implement generated audio controller**

In `src/game/audio.ts`, add `createGameAudioController()` that lazily creates/resumes `AudioContext`, plays short oscillator/gain-envelope cues, and silently skips playback when disabled or unavailable.

- [ ] **Step 2: Emit action sound events**

In `src/game/GameScene.ts`, emit `sound-requested` for card selection and successful planting.

- [ ] **Step 3: Wire in main**

In `src/main.ts`, create the audio controller, pass sound settings into DOM overlay, unlock/play on user gestures, map game events to sounds, and dedupe event IDs like the Three.js event wiring.

## Task 4: Verification

- [ ] **Step 1: Run all tests**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Build**

Run:

```bash
npm run build
```

Expected: build succeeds with only the known chunk-size warning.

- [ ] **Step 3: Browser check**

Open or reload `http://127.0.0.1:5173/`. Verify:

- Sound toggle is visible.
- Toggle changes label.
- Selecting and planting still work.
- Console has no warnings or errors.

- [ ] **Step 4: Commit**

Commit:

```bash
git add docs/superpowers/specs/2026-05-26-m2-audio-settings-design.md docs/superpowers/plans/2026-05-26-m2-audio-settings.md src/game/audio.ts src/game/audio.test.ts src/game/GameScene.ts src/main.ts src/ui/domOverlay.ts src/ui/domOverlay.test.ts src/styles.css
git commit -m "Add generated sound effects"
```
