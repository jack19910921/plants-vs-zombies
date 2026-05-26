# M5 Asset Presentation Normalization Design

## Goal

Finish M5 by normalizing how existing safe assets are cropped, filtered, and framed across DOM cards and Phaser field rendering.

## Player Experience

- Plant and enemy images should feel intentionally framed instead of raw photo rectangles.
- Card art and field figures should use the same crop focus and contrast tuning.
- Existing open/public-domain assets stay local and documented.
- Mobile readability should remain intact.

## Chosen Approach

Add a pure `src/game/assetPresentation.ts` module with per-asset presentation profiles:

- DOM background position and CSS filter.
- Phaser crop fractions for source textures.
- Field display offsets for small focus corrections.
- Shared fallback helpers for converting crop fractions to source pixel crops.

`src/ui/domOverlay.ts` will emit CSS variables from the same plant asset profiles. `src/game/GameScene.ts` will use the profiles to crop field images and apply subtle display offsets.

## Boundaries

- No new external assets.
- No gameplay/rules changes.
- No protected PVZ assets.
- Keep presentation data deterministic and unit-tested.

## Verification

- Unit tests cover all plant and enemy profile IDs, valid crop ranges, DOM filter values, and source-pixel crop conversion.
- Browser checks verify desktop and mobile rendering after crop/filter changes.
- `npm test`, `npm run build`, and `git diff --check` must pass before marking M5 complete.
