# M5 Card Visual Unification Design

## Goal

Make plant cards visually match the field miniatures by reusing the same profile colors for rims, bases, and art frames.

## Player Experience

- Each plant card should feel like a small physical seed packet instead of a generic white button.
- Card colors should match the planted miniature: sunflower warm/green, wallnut earthy, snow pea cool, potato mine low/earthy.
- Locked cards should still be clearly disabled and readable on mobile.

## Chosen Approach

Use `getPlantMiniatureProfile(plantId)` inside `src/ui/domOverlay.ts` to add CSS custom properties to each card:

- `--plant-rim`
- `--plant-base`
- `--plant-stem`
- `--plant-art`

Then update `src/styles.css` so `.plant-card` and `.plant-art` use those variables for frame, packet wash, and art depth. This keeps card colors synchronized with the field rendering profiles without adding new assets.

## Boundaries

- No new external assets.
- No gameplay changes.
- Do not add visible explanatory text.
- Keep mobile card text and tap targets within existing tray bounds.

## Verification

- DOM markup tests verify profile variables are present on cards and locked cards keep profile styling.
- Browser screenshots verify desktop and mobile trays remain readable.
- `npm test`, `npm run build`, and `git diff --check` must pass before commit.
