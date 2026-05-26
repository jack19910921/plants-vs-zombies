# Toy Tabletop Plant Squad Roadmap

## North Star

Build a private, child-friendly lane-defense prototype inspired by plant defense games, without using protected official PVZ assets. The game should feel playful, readable, and increasingly tactile: realistic open-license or generated plant/object imagery, clear combat feedback, and small 3D animated moments that make rewards and danger feel alive.

## Current State

The project is a playable vertical slice on `main`.

Completed:

- Phaser + Vite + TypeScript + Vitest project foundation.
- One playable level with plant selection, planting, sun cost, cooldowns, zombie waves, shooting, hero lane movement, pause/resume, victory, failure, and restart.
- DOM HUD over Phaser canvas.
- Open/localized visual assets recorded in `docs/asset-sources.md`.
- Three.js overlay with animated 3D sun coin.
- Combat presentation events and feedback: fire recoil, hit flashes, chewing, slow highlight, health bars, defeated effects, and sun production feedback.
- Wave and level milestone feedback: 3D wave pulse and victory/failure badge.
- Automated rule/UI tests and browser visual checks used before commits.

Known constraints:

- Do not use official PVZ protected art, audio, names, or UI assets.
- Keep game rules in `src/game/rules.ts` and renderer-facing effects in `src/game/GameScene.ts` / `src/game/ThreeStage.ts`.
- Prefer small, testable slices with commits after verification.
- Do not use parallel subagents unless tasks are completely independent.

## Delivery Strategy

Use milestone-driven development. Each milestone must produce a playable, verifiable improvement and leave the game in a clean state.

For each milestone:

1. Write or update a lightweight design note when the work touches multiple files or player-facing behavior.
2. Create a concrete task checklist before coding.
3. Add tests first for rules, state transitions, DOM markup, or stable helper APIs.
4. Implement narrowly, preserving existing boundaries.
5. Verify with `npm test`, `npm run build`, and browser inspection when visuals are touched.
6. Commit the milestone or a coherent sub-slice.

## Milestone Plan

### M0: Foundation And Playable Slice

Status: complete.

Goal: prove the core game loop works end to end.

Delivered:

- Project bootstrapping.
- Level one rules.
- HUD.
- Basic combat.
- Asset localization.
- Initial 3D sun animation.
- Combat and milestone presentation feedback.

Exit evidence:

- `npm test` passes.
- `npm run build` passes with only known chunk-size warning.
- Browser console checks show no errors or warnings after visual changes.

### M1: Onboarding And Child-Friendly Feedback

Status: complete.

Goal: make the current vertical slice easier for a child to understand without adult explanation.

Scope:

- Add first-run tutorial prompts for selecting a plant, planting on the board, moving the hero lane, pausing, and restarting.
- Add readable in-game feedback for invalid actions: not enough sun, cooldown, occupied tile, and wrong placement area.
- Add positive reinforcement for first plant, first zombie defeated, first sun production, victory, and retry after failure.

Delivered:

- Tutorial strip in the DOM HUD.
- Specific invalid planting feedback for no selection, outside board, occupied tile, not enough sun, and cooldown.
- Positive first-time feedback for first plant, first sun production, and first zombie defeat.
- Desktop and mobile-width browser checks with clean console output.

Architecture:

- Add tutorial/progress state to game state only where rules need to know about milestones.
- Keep tutorial copy and DOM rendering in `src/ui/domOverlay.ts`.
- Use `CombatEvent` or a sibling presentation event pattern for UI/3D feedback triggers.

Acceptance:

- A new player can understand the first 30 seconds by reading short prompts.
- Invalid actions produce visible feedback without changing game rules incorrectly.
- Tests cover tutorial markup and any new rule-level milestones.
- Browser check verifies no HUD overlap on desktop and mobile widths.

Dependencies:

- Existing DOM HUD.
- Existing combat/milestone event pattern.

### M2: Audio And Settings

Status: complete.

Goal: add tactile sound feedback while keeping the game safe for household use.

Scope:

- Add generated or open-license short sounds for planting, shooting, hit, sun production, wave alert, victory, failure, and button clicks.
- Add a sound on/off toggle and default to a gentle volume.
- Ensure audio starts only after user interaction to satisfy browser autoplay rules.

Delivered:

- Generated Web Audio cues, no external audio files.
- HUD sound on/off toggle.
- Event-driven sounds for selection, planting, shooting, hits, sun, waves, victory, failure, and buttons.
- Browser checks for toggle behavior and clean console output.

Architecture:

- Create an audio controller module, likely `src/game/audio.ts`.
- Keep audio event wiring in `src/main.ts` or a small integration layer.
- Reuse existing `CombatEvent` and level events instead of duplicating game logic.

Acceptance:

- Audio can be toggled off.
- No browser autoplay errors.
- Tests cover the toggle markup and audio controller behavior where practical.
- Browser console has no errors or warnings.

Dependencies:

- M1 is helpful but not required.
- Existing event stream is required.

### M3: Level Progression And Difficulty

Status: complete.

Goal: turn the prototype from one isolated level into a small sequence.

Scope:

- Add at least two more level configs with distinct wave timing and allowed plant mixes.
- Add easy/normal difficulty selection.
- Add level start, victory progression, and replay flow.
- Add a simple level select or next-level button.

Delivered so far:

- Added a `LEVELS` list with `阳光草坪` and `薄雾菜园`.
- Replaced fixed `LEVEL_ONE` references in scene/HUD flow with current-level metadata.
- Added victory next-level action for levels that have a following level.
- Added tests for level config uniqueness, HUD level naming, and next-level modal markup.
- Added `轻松` / `普通` difficulty selection that changes starting sun, zombie health, and zombie speed through config.
- Expanded the current mini-run to three levels and added final-victory completion copy.
- Made `allowedPlants` visible through progressive plant unlocks and locked-card HUD states.

Architecture:

- Keep level data in `src/game/config.ts` or split to `src/game/levels.ts` if config grows too large.
- Keep progression state explicit in `GameState`.
- Avoid hard-coding `LEVEL_ONE` in UI and scene code once multiple levels exist.

Acceptance:

- Player can finish level one and move to level two.
- Easy/normal changes sun, speed, or hp through configuration, not duplicated rules.
- Tests cover level selection, progression, and difficulty modifiers.

Dependencies:

- M1 onboarding should happen first so new level flow has clear messaging.

### M4: Richer 3D Prop Layer

Status: complete.

Goal: make the game feel more physically real without moving core gameplay into 3D.

Scope:

- Add small 3D props tied to events: seed packet flip, gardening tool, reward medal, sun collection trail, or lane warning marker.
- Add one persistent 3D scene motif that reinforces the tabletop/toy identity.
- Keep 3D decorative and feedback-oriented; gameplay hit detection stays in rules.

Delivered so far:

- Added a test-backed 3D seed-packet flip for plant selection and planting.
- Added a persistent 3D garden tool prop that idles and swings on planting.
- Added a 3D wave warning stake that pops up during incoming waves.
- Added a test-backed 3D sun collection trail that flies into the sun coin when sun is produced.

Architecture:

- Expand `src/game/ThreeStage.ts` only while it stays readable.
- If it grows too large, split focused builders into `src/game/three/`.
- Expose methods such as `pulseSunCollection`, `pulseWaveAlert`, and future narrowly named triggers.

Acceptance:

- 3D canvas remains nonblank and animated.
- Visual effects do not obscure HUD or board interactions.
- Browser screenshot comparison confirms animation changes frame to frame.

Dependencies:

- M1 and M2 can run before this, because 3D polish benefits from settled event names.

### M5: Visual Asset Upgrade

Status: in progress.

Goal: improve realism and consistency while staying license-safe.

Scope:

- Replace placeholder-style compositions with a consistent set of open-license, generated, or user-owned plant/object/zombie-like character assets.
- Normalize image crop, contrast, transparency, and silhouette readability.
- Update `docs/asset-sources.md` for every external asset.

Delivered so far:

- Added test-backed miniature volume rendering around existing safe assets: plant bases, stem supports, contact shadows, image squash/stretch, zombie foot pads, and stronger hit/chew body feedback.
- Added test-backed plant silhouette profiles so sunflower, peashooter, wallnut, snow pea, and potato mine render with distinct body proportions, bases, stems, and rim colors.
- Added test-backed enemy silhouette profiles so basic, cone, and bucket enemies render with distinct body weight, shadows, rims, tints, and headgear geometry.
- Added test-backed health wear feedback so damaged plants and enemies gain cracks, scuffs, and subtle critical-health overlays.

Architecture:

- Keep asset lookup centralized in `src/game/assets.ts`.
- Prefer local asset files under `src/assets/`.
- Do not embed remote URLs in gameplay code.

Acceptance:

- Each plant and enemy is recognizable at gameplay scale.
- Assets read clearly on desktop and mobile.
- Source/license documentation is complete.

Dependencies:

- Can run in parallel with code milestones only if asset work does not change rules or UI layout.

### M6: Mobile And Touch Hardening

Status: planned.

Goal: make the prototype comfortable on phone/tablet screens.

Scope:

- Verify plant tray sizing, tap targets, pause modal, tutorial prompts, and safe-area behavior.
- Add touch-specific affordances if needed.
- Confirm no text overflow in Chinese labels.

Architecture:

- Keep responsive UI in `src/styles.css`.
- Prefer DOM HUD changes over canvas text for dense UI.

Acceptance:

- Main loop is playable on a narrow mobile viewport.
- HUD does not cover critical board cells.
- Tap targets remain usable.

Dependencies:

- Best after M1 and M3, when HUD flows are more complete.

### M7: Packaging And Performance

Status: planned.

Goal: make the prototype easier to share privately and keep load/runtime performance reasonable.

Scope:

- Address the current Phaser/Three large chunk warning if it starts affecting load time.
- Consider code splitting Three.js or lazy-loading heavier visual layers.
- Add a simple production preview checklist.

Architecture:

- Keep bundling changes isolated to Vite config and import boundaries.
- Avoid premature optimization before gameplay flows settle.

Acceptance:

- Build remains green.
- Load behavior is acceptable on target devices.
- Any bundle changes do not break Phaser or Three initialization.

Dependencies:

- Best after M1-M4, when major runtime surfaces are known.

## Backlog By Domain

Gameplay:

- More plants with distinct but simple roles.
- More zombie variants with clear silhouettes and behaviors.
- Potato mine arming/explosion behavior if not already fully expressed.
- Level progression and difficulty.

UX:

- Tutorial prompts.
- Invalid action feedback.
- Settings panel for audio and reduced motion.
- Better victory/failure summary.

Visual:

- Consistent realistic assets.
- 3D prop feedback.
- Improved lane readability.
- Mobile HUD polish.

Audio:

- Gentle event sounds.
- Sound toggle.
- Volume discipline.

Engineering:

- Split large files only when a milestone touches them substantially.
- Keep rules deterministic and testable.
- Keep render effects disposable and derived from state/events.
- Add browser screenshot checks for visual-heavy changes.

Compliance:

- No official PVZ assets.
- Document every external asset.
- Prefer CC0/public-domain/open-license/generated/user-owned sources.

## Decision Rules

Choose the next task by asking:

1. Does it make the current game easier to understand or more fun in the first minute?
2. Does it reduce future rework by clarifying architecture or data flow?
3. Can it be verified with tests and browser checks in one coherent slice?
4. Does it preserve licensing safety?

If the answer is no to most of these, keep it in the backlog.

## Recommended Next Slice

Start with M2: Audio And Settings.

Reason:

- M1 now gives the player clear textual guidance; audio is the next strongest first-minute feedback layer.
- Generated Web Audio cues avoid external asset licensing risk.
- The existing `CombatEvent` stream provides clean triggers for planting, sun, hit, wave, victory, and failure sounds.

Proposed first implementation plan:

1. Add a tiny audio controller using browser Web Audio.
2. Add a sound toggle to the DOM HUD.
3. Wire existing events to gentle generated cues after the first user gesture.
4. Verify browser autoplay safety and clean console output.
5. Commit as a single audio/settings slice.
