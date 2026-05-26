# M2 Audio And Settings Design

## Goal

Add gentle generated sound feedback so the game feels more tactile while staying safe for a private child-friendly prototype and avoiding external audio licensing concerns.

## Scope

In scope:

- A sound on/off toggle in the DOM HUD.
- A small Web Audio controller that generates short cues with oscillators and gain envelopes.
- Event-driven sounds for card selection, successful planting, shooting, zombie hit, sun production, wave alert, victory, failure, and generic buttons.
- Browser-autoplay-safe behavior: audio starts only after a user gesture.

Out of scope:

- External audio files.
- Background music.
- Volume sliders.
- Persistent settings storage.
- Large UI settings panels.

## Architecture

Create `src/game/audio.ts` as a focused module. It owns the Web Audio context, sound synthesis, enabled state, and event-to-sound mapping. It must not import Phaser or DOM HUD code.

The DOM HUD owns the sound toggle UI and calls an `onToggleSound` callback. `src/main.ts` wires UI and game events to the audio controller. Existing `CombatEvent` values should drive most sounds. Successful planting can use a small scene UI event because planting success is currently handled in `GameScene`.

Audio should default to enabled but locked until the first gesture. If the browser refuses to start audio before a gesture, the controller should fail quietly and avoid console noise.

## Sound Direction

Generated cues should be short and soft:

- Card/select: small blip.
- Plant: warm low pop.
- Shoot: short pluck.
- Hit: muted tap.
- Sun: bright two-note sparkle.
- Wave: low alert pulse.
- Victory: rising three-note chime.
- Failure: gentle descending cue.
- Button: soft click.

## Testing

Add unit tests for pure behavior:

- Default settings are enabled.
- Toggling settings flips enabled state.
- Combat events map to the expected sound IDs.
- Terminal status maps victory/failure to the correct sounds.

DOM tests should cover:

- The sound toggle renders in the HUD.
- The toggle label changes when disabled.

Browser checks should cover:

- First page load has no console warnings/errors.
- Toggling sound does not throw.
- Planting and sun production still work with audio enabled.

## Acceptance Criteria

- `npm test` passes.
- `npm run build` passes with only the known chunk-size warning.
- Browser console remains free of audio/autoplay errors.
- Player can turn sound on/off from the HUD.
- No external audio assets are added.
