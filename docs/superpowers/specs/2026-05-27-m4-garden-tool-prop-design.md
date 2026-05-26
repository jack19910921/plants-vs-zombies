# M4 Garden Tool Prop Design

## Goal

Add a small persistent 3D garden tool prop to the Three.js overlay so the game feels more like a tactile tabletop gardening toy, not just a flat board with occasional effects.

## Player Experience

A small 3D hand trowel sits behind the sun coin in the corner overlay and gently idles. When the player plants something, it swings slightly like a child-sized garden tool being used. The effect stays decorative and never changes planting, combat, or level rules.

## Architecture

`src/game/threePresentation.ts` gets a pure `getGardenToolState()` helper for idle and planting-pulse motion. `ThreeStage` builds the trowel from simple Three.js primitives and applies the helper state each frame. `src/main.ts` already receives `sound-requested` events, so the existing plant event can trigger the tool swing alongside the seed-packet flip.

## Testing

Unit tests cover idle visibility, changing idle rotation over time, and stronger plant-pulse motion shortly after planting. Browser verification checks the Three canvas remains nonblank, selecting/planting still changes pixels, and console warnings/errors remain at zero.
