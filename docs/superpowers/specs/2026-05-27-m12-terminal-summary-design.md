# M12 Terminal Summary Design

## Goal

Make victory and failure feel more informative by showing a compact end-of-level summary in the terminal modal.

## Scope

Included:

- Show wave progress, remaining plants, and remaining sun in victory/failure modals.
- Keep the summary compact enough for mobile.
- Derive counts from the existing `GameState` and current level data.

Excluded:

- New scoring rules, badges, rewards, saved history, or gameplay balance changes.
- Browser screenshot smoke unless a later visual pass needs it.

## Architecture

`createDomOverlayMarkup` accepts optional summary counts for direct tests. The live `createDomOverlay` path computes those counts from `state.spawnedWaveIndexes`, `state.plants`, `state.sun`, and `level.waves.length`. CSS keeps the summary as simple chips inside the existing modal.

## Verification

- `src/ui/domOverlay.test.ts` covers victory and failure summary copy.
- Final verification uses `npm test`, `npm run build`, and `git diff --check`.
