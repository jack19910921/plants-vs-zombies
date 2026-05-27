# Final Acceptance Closeout Design

## Goal

Close the remaining roadmap items into a single acceptance-ready pass so the prototype is ready for user验收.

## Remaining Checklist

- Close M11 asset replacement as complete; deeper particle choreography remains optional future polish.
- Add a gentle motion setting beside the existing sound toggle.
- Add one small gameplay-content distinction: bucket enemies resist ice slow duration.
- Update the production preview checklist so验收 covers the new setting.
- Keep all changes test-backed and avoid heavy browser smoke in this pass.

## Scope

Included:

- DOM HUD reduced-motion toggle.
- Main runtime skips decorative Three.js event pulses while reduced motion is enabled.
- Bucket enemies receive a shorter slow duration from ice projectiles.
- Roadmap and production checklist closeout.

Excluded:

- New art assets.
- New levels, new plants, saved run history, or large particle systems.
- Browser screenshot automation.

## Verification

- `src/ui/domOverlay.test.ts` covers reduced-motion UI behavior.
- `src/game/rules.test.ts` covers bucket slow resistance.
- Final verification uses `npm test`, `npm run build`, and `git diff --check`.
