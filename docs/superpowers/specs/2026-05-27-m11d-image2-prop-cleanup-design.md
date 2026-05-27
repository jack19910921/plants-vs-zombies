# M11d Image2 Prop Cleanup Design

## Goal

Replace the screenshot-called-out fake-looking static visuals with the user's follow-up ChatGPT image-model PNGs while keeping gameplay, economy, and level flow unchanged.

## Scope

- Replace basic, cone, and bucket enemy textures with the new image2 PNGs.
- Replace projectile core art, sun token art, the left-side base sign, and the left-top Three.js tool prop with new image2 PNGs.
- Locally remove fake checkerboard backgrounds, preserve alpha, crop, and downscale the assets before committing them.
- Record every new non-code asset in `docs/asset-sources.md`.

## Non-Goals

- No new enemy types, damage rules, particle system, levels, or audio changes.
- No browser-heavy screenshot smoke loop for this cleanup pass.

## Verification

- Asset registry tests must prove every new texture is wired.
- Existing presentation and DOM overlay tests must keep passing.
- Full `npm test`, `npm run build`, and `git diff --check` must pass before commit.
