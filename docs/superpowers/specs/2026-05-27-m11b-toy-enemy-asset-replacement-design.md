# M11b Toy Enemy Asset Replacement Design

## Goal

Replace the remaining shared public-domain enemy placeholder with small original toy enemy assets while preserving the existing combat rules, enemy variants, and Phaser rendering path.

## Scope

Included:

- Add three original SVG enemy assets for `basic`, `cone`, and `bucket`.
- Register enemy textures through `src/game/assets.ts`.
- Preload and render the matching texture for each spawned enemy.
- Keep existing enemy movement, hp, chewing, hit flash, slow aura, wear, and health bar behavior.
- Record the new non-code assets in `docs/asset-sources.md`.

Excluded:

- New enemy behavior or wave balance.
- External enemy images, official game art, or downloaded vector assets.
- Heavy browser screenshot smoke.
- Reworking projectile or sun particle art.

## Visual Direction

The enemies should read as soft tabletop toy figures, not horror characters. The cone and bucket variants own their headgear in the SVG asset, so Phaser should not duplicate old procedural headgear geometry on top of the texture.

## Architecture

`src/game/assets.ts` exposes `ZOMBIE_TEXTURES: Record<ZombieId, string>` alongside the existing plant and board registries. `GameScene` preloads every enemy texture and chooses `zombie-${zombie.zombieId}` while drawing. `assetPresentation.ts` keeps enemy crop/filter/offset data and records that M11 toy enemy textures own their headgear silhouettes.

## Verification

- `src/game/assets.test.ts` checks that all enemy ids point at M11 toy SVG files.
- `src/game/assetPresentation.test.ts` checks that procedural headgear is disabled for the generated enemy textures.
- Final verification uses `npm test`, `npm run build`, and `git diff --check`.
