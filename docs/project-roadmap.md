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
- M9 Three.js polish for seed packet shine, sun trails, wave warning beacons, planting sparks, potato mine shockwave feedback, and badge ceremony moments.
- M10 procedural toy-garden art pass for richer tabletop props and board polish without external assets.
- M11 asset replacement pass started with user-provided ChatGPT image-model plants/board, original toy enemy SVGs, and matching projectile/sun pickup polish.
- M12 terminal summary adds compact victory/failure stats for wave progress, remaining plants, and sun.
- Final acceptance closeout adds a gentle motion setting and a small bucket enemy ice-resistance behavior.
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

Status: complete.

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
- Added profile-driven plant card visuals so HUD cards reuse the same rim/base/stem colors as field miniatures.
- Added test-backed asset presentation normalization so local plant/enemy textures use consistent crop, filter, focus, and field offsets in DOM and Phaser rendering.

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

Status: complete.

Goal: make the prototype comfortable on phone/tablet screens.

Scope:

- Verify plant tray sizing, tap targets, pause modal, tutorial prompts, and safe-area behavior.
- Add touch-specific affordances if needed.
- Confirm no text overflow in Chinese labels.

Delivered:

- Added shared hero lane movement logic for keyboard and touch.
- Added mobile touch buttons for moving the 小队长 up/down.
- Reworked narrow-screen HUD sizing to avoid transform-shrunk tap targets.
- Added safe-area-aware HUD, 3D coin, modal, tutorial, and plant tray spacing.
- Verified mobile tap targets and Chinese labels with browser viewport checks.

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

Status: complete.

Goal: make the prototype easier to share privately and keep load/runtime performance reasonable.

Scope:

- Address the current Phaser/Three large chunk warning if it starts affecting load time.
- Consider code splitting Three.js or lazy-loading heavier visual layers.
- Add a simple production preview checklist.

Delivered:

- Added Vite production chunk strategy for separate app, Phaser, and Three.js chunks.
- Assessed Phaser/Three as expected engine-sized dependencies instead of app code bloat.
- Removed the previous single large entry chunk warning while keeping engine chunks explicit.
- Added `docs/production-preview-checklist.md` for private-share build checks.
- Verified production preview on desktop and mobile viewports with clean console output.

Architecture:

- Keep bundling changes isolated to Vite config and import boundaries.
- Avoid premature optimization before gameplay flows settle.

Acceptance:

- Build remains green.
- Load behavior is acceptable on target devices.
- Any bundle changes do not break Phaser or Three initialization.

Dependencies:

- Best after M1-M4, when major runtime surfaces are known.

### M8: Potato Mine Arming

Status: complete.

Goal: make the existing `土豆雷` unlock a real delayed-trap tactic.

Scope:

- Use the existing `armsAfterMs` and `damage` plant config fields.
- Trigger only after the mine is armed.
- Damage lane-local zombies near the planted cell.
- Add visible and audible feedback without new external assets.

Delivered:

- Added rules for armed potato mines to explode when zombies enter the same cell.
- Kept unarmed potato mines quiet until their arming delay finishes.
- Added a `potato-mine-exploded` combat event for renderer/audio integration.
- Added Phaser dirt-burst shockwave feedback using existing primitives.
- Mapped the explosion to the existing generated `hit` sound.

Architecture:

- Keep trap behavior deterministic in `src/game/rules.ts`.
- Keep presentation derived from combat events in `src/game/GameScene.ts`.
- Reuse generated audio rather than adding external sound assets.

Acceptance:

- Rules tests cover unarmed and armed mine behavior.
- Audio tests cover the new event mapping.
- Build and browser smoke remain clean.

Dependencies:

- Best after M3, because `土豆雷` is unlocked in the later level sequence.

### M9: 3D Animation Juice Pass

Status: complete.

Goal: make the existing Three.js layer feel more expressive and surprising without adding external assets or obscuring gameplay.

Scope:

- Observe the current desktop and mobile visual behavior before changing it.
- Strengthen high-value event feedback with brief procedural Three.js effects.
- Keep the 3D layer decorative and derived from existing event state.

Delivered:

- Added a test-backed seed packet light sweep during select/plant flips.
- Added a test-backed potato mine shockwave helper with warm flash, ring growth, and staggered dirt chunks.
- Added a compact Three.js potato mine shockwave prop and wired it to `potato-mine-exploded`.
- Added a test-backed level-end badge ceremony: victory pops with small reward particles, while failure dips gently without scary effects.
- Added sun trail halos/shimmer, a friendlier wave-warning beacon pulse, and planting dust/spark particles near the garden tool.
- Kept all new visuals procedural; no external assets were added.

Architecture:

- Keep animation timing state in `src/game/threePresentation.ts`.
- Keep render objects in `src/game/ThreeStage.ts`.
- Keep event wiring in `src/main.ts` alongside existing sun, wave, and level feedback triggers.

Acceptance:

- Presentation helper tests cover new animation state.
- Desktop and mobile browser checks show no console warnings/errors.
- The 3D stage remains compact and does not block plant cards or core board reading.
- Victory and failure use distinct, child-friendly event choreography.
- Sun, wave, and planting feedback each have a dedicated test-backed Three.js animation layer.

Dependencies:

- Best after M8, because the potato mine event already exists.

### M10: Realistic Toy Garden Art Pass

Status: complete.

Goal: make the game read more like a real toy garden set on a tabletop without adding external assets.

Delivered:

- Added procedural Three.js tabletop props.
- Added deterministic prop presentation helpers and tests.
- Polished the Phaser board/table drawing and CSS background while preserving gameplay layout.

### M11: Asset Replacement Pass

Status: complete.

Goal: replace placeholder-feeling visuals with user-owned, generated, or original local assets while keeping licensing safe.

Delivered so far:

- Added the user-provided ChatGPT image-model plant and board art.
- Converted the five plant images to transparent cropped PNGs and downscaled them for runtime weight.
- Replaced the flat board fill with the image2 garden board texture.
- Added bottom-center plant anchoring and card `contain` rendering for the new plant art.
- Added original in-repository toy enemy SVG assets for basic, cone, and bucket enemy variants.
- Polished pea/ice projectiles and sun-produced pickup feedback to match the toy asset palette.
- Replaced the called-out fake-looking enemies, projectiles, sun token, base sign, and left-top toy tool with the follow-up user-provided image2 assets.
- Replaced the procedural green hero shooter with image2 peashooter art and added layered projectile/sun particle feedback.
- Registered every new non-code asset in `docs/asset-sources.md`.

Closeout note:

- Deeper particle choreography is now treated as optional future polish, not acceptance-blocking work.

### M12: Terminal Summary Polish

Status: complete.

Goal: make victory and failure clearer by showing a compact end-of-level summary.

Delivered:

- Added terminal modal stats for wave progress, remaining plants, and remaining sun.
- Kept the summary responsive with stacked mobile chips.
- Covered victory and failure summaries with DOM overlay tests.

### Final Acceptance Closeout

Status: complete.

Goal: finish the remaining acceptance checklist without expanding scope.

Delivered:

- Added a `动效正常` / `动效柔和` HUD toggle.
- Skipped decorative Three.js event pulses when gentle motion is enabled.
- Added bucket enemy ice resistance so armored enemies have a clearer behavior difference.
- Updated the private preview checklist for final验收.

## Backlog By Domain

Gameplay:

- More plants with distinct but simple roles.
- More enemy behavior variants beyond the current bucket ice resistance.
- More levels or optional objectives after验收.

UX:

- Saved or shareable run history if the prototype later needs it.

Visual:

- Deeper particle choreography if it stays lightweight.
- Further lane readability tuning after hands-on验收.

Audio:

- More varied sound cues if family testing asks for them.

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

Pause for user验收.

Reason:

- M0-M12 and the final closeout now cover foundation, onboarding, audio, progression, mobile controls, packaging, asset replacement, terminal summaries, gentle motion, and one extra enemy behavior distinction.
- Remaining items are future enhancements rather than acceptance blockers.
- After验收, choose the next slice from family feedback instead of guessing.
