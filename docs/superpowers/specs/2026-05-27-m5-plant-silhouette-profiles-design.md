# M5 Plant Silhouette Profiles Design

## Goal

Give each plant family a distinct tabletop silhouette so existing safe assets read more like separate characters instead of one reused round token.

## Player Experience

- Sunflower should feel taller and brighter.
- Peashooter and snow pea should feel like compact shooters with a little more forward body.
- Wallnut should feel squat, wide, and sturdy.
- Potato mine should feel low to the ground when it appears in later levels.

## Chosen Approach

Extend `src/game/worldPresentation.ts` with a pure `getPlantMiniatureProfile(plantId)` helper. `GameScene` will use the profile to size the image, base, stem, highlight, and rim for each plant.

This keeps the rendering upgrade local to presentation code and avoids adding new assets or changing rules.

## Boundaries

- No gameplay changes.
- No new external assets.
- No per-level special cases.
- Do not make silhouettes so extreme that hit feedback or health bars become unclear.

## Verification

- Unit tests cover profile differences for sunflower, peashooter, wallnut, snow pea, and potato mine.
- Browser screenshots confirm the first-level cards and planted figures remain readable.
- `npm test`, `npm run build`, and `git diff --check` must pass before commit.
