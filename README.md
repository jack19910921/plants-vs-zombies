# Toy Tabletop Plant Squad

A child-friendly lane-defense browser prototype inspired by plant defense games. The project uses TypeScript, Vite, Phaser, and Three.js to combine a playable 2D board with small 3D tabletop effects.

This is a private fan prototype and is not affiliated with Plants vs. Zombies, PopCap, or EA. It intentionally avoids official protected game art, audio, names, and UI assets. Asset provenance is tracked in [docs/asset-sources.md](docs/asset-sources.md).

## Features

- Three playable levels with easy and normal difficulty modes.
- Plant cards for sunflower, peashooter, wallnut, snow pea, and potato mine.
- Lane defense flow with sun economy, cooldowns, waves, victory, failure, restart, and level progression.
- Phaser gameplay canvas with a DOM HUD overlay.
- Three.js presentation layer for animated sun tokens, wave warnings, planting feedback, badges, and subtle board depth.
- Generated Web Audio cues with a sound toggle.
- Reduced motion setting for gentler visual effects.
- Vitest coverage for rules, UI overlay behavior, asset mapping, audio, and presentation helpers.

## Getting Started

Install dependencies:

```bash
npm ci
```

Run the local dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run tests:

```bash
npm test
```

## Project Layout

- `src/game/` contains gameplay rules, scene code, assets, audio, and Three.js presentation helpers.
- `src/ui/` contains the DOM overlay for HUD controls, prompts, and status panels.
- `src/assets/` contains local, generated, and open-license visual assets used by the prototype.
- `docs/` contains asset provenance, roadmap notes, and implementation planning records.
- `output/` is local verification output, currently Playwright screenshots. It is ignored by Git and is not required to run or build the project.

## License

Code is licensed under the MIT License. See [LICENSE](LICENSE).

Assets may have their own provenance or usage notes; see [docs/asset-sources.md](docs/asset-sources.md) before reusing them outside this prototype.
