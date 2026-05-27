# M7 Packaging And Performance Design

## Goal

Make the private prototype easier to preview and share by giving production builds a clearer bundle shape and a repeatable preview checklist.

## Current Finding

The current production build emits one large `index` JavaScript chunk around 2 MB minified. Most of that weight comes from Phaser and Three.js, which are expected engine dependencies for this prototype.

## Chosen Approach

Add an explicit Vite build configuration that splits Phaser and Three.js into separate engine chunks:

- `engine-phaser`
- `engine-three`
- app entry chunk

This does not make Phaser or Three smaller, but it makes the build easier to reason about, lets browser caching treat engine code separately from game code, and removes the misleading single-entry chunk warning by setting a documented engine-sized warning budget.

Also add a production preview checklist covering tests, build, preview server, desktop/mobile smoke, console checks, and asset-license review.

## Boundaries

- No gameplay changes.
- No new dependencies.
- Do not lazy-load Phaser yet because it is required for the first playable frame.
- Do not lazy-load Three.js in this slice; the 3D layer is visible immediately and its import boundary can be revisited after more features settle.

## Verification

- Vitest covers the Vite chunk classifier.
- `npm run build` should finish without the previous large single chunk warning.
- Production preview should load on desktop and mobile viewports with no console warnings or errors.
- `npm test`, `npm run build`, and `git diff --check` must pass before commit.
