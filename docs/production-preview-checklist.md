# Production Preview Checklist

Use this before sharing a private build with family or testing on another device.

## Build Gate

- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Confirm the build emits separate `index`, `engine-three`, and `engine-phaser` JavaScript chunks.
- [ ] Confirm the build has no Vite warnings or TypeScript errors.

## Preview Gate

- [ ] Run `npm run preview -- --port 4173`.
- [ ] Open `http://127.0.0.1:4173/`.
- [ ] Check the desktop viewport around `1280x720`.
- [ ] Check a mobile viewport around `390x844`.
- [ ] Confirm browser console warnings/errors are `0`.

## Playability Gate

- [ ] Select a plant card and plant it on the board.
- [ ] Use the mobile `上移` and `下移` buttons to move the 小队长.
- [ ] Open the pause modal and resume with `继续`.
- [ ] Toggle sound on/off after a user gesture.
- [ ] Toggle `动效柔和` and confirm large decorative 3D pulses stop while core gameplay remains usable.
- [ ] Confirm bucket enemies recover from ice slow faster than basic enemies.
- [ ] Confirm Chinese labels do not overflow cards, chips, tutorial text, or modals.

## Asset And Sharing Gate

- [ ] Review `docs/asset-sources.md` for every external asset used in the build.
- [ ] Confirm no official PVZ protected names, artwork, UI, or audio have been added.
- [ ] Share the preview only as a private prototype unless assets and distribution rights are reviewed again.
