# M4 Seed Packet Flip Design

## Goal

Add a small 3D seed-packet flip when the player selects or plants a card, reinforcing that the plant tray is a tactile toy surface.

## Player Experience

Selecting a plant briefly flips a small 3D seed packet in the Three.js overlay. Planting uses the same object with a warmer accent and a slightly stronger pop. It stays decorative and does not block the board or HUD.

## Architecture

`ThreeStage` owns the mesh group and rendering. A pure helper in `src/game/threePresentation.ts` computes seed-packet animation state from elapsed time and mode, making the timing testable without WebGL. `src/main.ts` listens to existing `sound-requested` events for `select` and `plant` and triggers the 3D flip.

## Testing

Unit tests cover seed-packet animation visibility, scale, and expiry. Browser verification confirms the Three.js canvas remains nonblank and the game controls still work with no console warnings/errors.
