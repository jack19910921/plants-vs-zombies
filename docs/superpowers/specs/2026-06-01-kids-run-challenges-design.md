# Kids Run Challenges Design

## Goal

Add a light replay loop for the iPad-first, offline child-friendly game without changing its pure single-player positioning. The next slice should help a child who can read short Chinese prompts play more independently, while making each 6-10 minute session feel a little different.

The feature combines:

- One short per-run objective.
- One gentle per-run modifier.
- Immediate sticker-like result feedback at the end of the level.

It must not add accounts, network features, long-term progression, stores, calendars, or a complex setup menu.

## Player Experience

At the start of each level, the game automatically assigns a short objective. The child does not choose it from a menu. Copy should stay brief enough to read at a glance, for example:

- `保护 1 台小车`
- `种 3 朵向日葵`
- `打倒 5 个僵尸`
- `留下 100 阳光`
- `冻住 2 次敌人`

The level also receives one gentle modifier. The modifier should slightly change rhythm or emphasis without making the rules feel unfamiliar:

- `阳光日`: base sun arrives a little faster.
- `慢慢来`: the first enemy wave starts later.
- `小勇士`: enemies are a little slower, but the level has fewer mower safety nets.
- `花园忙`: starting sun is lower, but sunflower cooldown is shorter.

The HUD shows the current objective as a compact chip. The modifier is announced briefly at the beginning of the level, then gets out of the way. End-of-level feedback shows whether the objective was completed. Failure still shows useful progress, such as `差一点 2/3`, so the child can understand what to try next.

## Rules And Data

Introduce a small run setup layer in `src/game/`:

- `RunModifier` describes the current level variation.
- `ChallengeObjective` describes the current per-run goal.
- `RunChallengeState` stores the selected objective, selected modifier, and progress.

Each level start selects one modifier and one objective using the current level id, difficulty id, and a local session seed. The seed is only for the current browser page session. Refreshing the page may pick a different combination. A future daily fixed task can use a date-based local seed, but this slice should avoid that extra product surface.

Objective progress belongs in the game/rules layer, not the DOM. Rendering should read explicit objective state rather than inferring from transient UI events. The first implementation should support these objective families:

- Plant count objective: planting a target plant id a target number of times.
- Defeat count objective: defeating a target number of enemies.
- Mower protection objective: keeping at least a target number of mower lanes unused.
- Sun reserve objective: ending the level with at least a target amount of sun.
- Slow-hit objective: landing a target number of slowing projectile hits.

Modifiers should be data-driven and conservative:

- Base sun interval multiplier.
- First wave delay.
- Starting sun adjustment.
- Mower lane override or reduction.
- Plant cooldown multiplier for a specific plant.
- Zombie speed multiplier adjustment.

The existing difficulty config remains the main difficulty knob. Modifiers should layer on top of the selected difficulty without replacing it.

## UI And Feedback

Keep the interface iPad landscape-first and reuse the current DOM HUD style.

Required UI changes:

- Add a compact objective chip to the top HUD, such as `目标：种 3 朵向日葵`.
- Show brief modifier feedback through the existing tutorial or feedback strip, such as `阳光日：阳光来得快`.
- Add objective result text to the terminal summary modal:
  - Completed: `小任务完成`
  - Incomplete: `差一点 2/3`
- Allow the tutorial strip to provide occasional short objective nudges, such as `还差 1 朵向日葵`.

Avoid adding new required buttons, setup screens, or a challenge picker. The child should be able to start playing exactly as before.

## UI Layout Notes

Visual direction should stay close to the existing toy tabletop interface:

- Material language: paper chips, warm garden colors, chunky borders, and small sticker-like reward states.
- Typography: the current heavy Chinese HUD type, with short labels and no paragraph text during live play.
- Motion tone: brief reward/danger/objective transitions only, respecting the existing gentle-motion setting.
- Playfield protection: no center-screen panels during normal play, no new lower-middle overlay, and no always-open task drawer.

Desktop and roomy tablet layout:

```text
[阳光] [关卡 · 第 2 波 / 8] [目标：种 3 朵向日葵] [轻松/普通] [暂停] [声音] [动效]

                         [阳光日：阳光来得快]

                         playable board stays clear

[植物卡] [植物卡] [植物卡] [植物卡] [植物卡]
```

iPad landscape layout:

```text
[阳光] [第 2/8 波] [目标：种 3 朵向日葵] [难度] [暂停] [音] [动效]
                 [还差 1 朵向日葵]
```

The iPad top row should remain a single compact HUD strip. The objective chip should use the shortest available copy and truncate only as a last resort. If the wave label and objective compete for space, the wave label should shorten first, for example from `暮色农圃 · 第 2 波 / 10` to `第 2/10 波`.

End modal layout:

```text
守住啦！
获得本关植物奖章。

[守住 8/8 波] [剩余植物 6] [阳光 125]
[小任务完成]

[下一关]
```

When incomplete, the objective result chip should use progress copy such as `[差一点 2/3]`. It should feel encouraging rather than corrective.

## Architecture

The implementation should preserve existing boundaries:

- Keep objective and modifier types close to `src/game/types.ts`.
- Put selection helpers in a focused `src/game/runChallenges.ts` module if the logic is more than a few functions.
- Keep deterministic state updates in `src/game/rules.ts`.
- Keep Phaser/Three presentation derived from state or combat events.
- Keep DOM rendering in `src/ui/domOverlay.ts`.

The run setup should be created when `GameScene` starts or restarts a level. It should be reset on restart and next-level transitions. Difficulty changes should also create a fresh run challenge because changing difficulty already restarts the current level.

## Testing

Add focused tests for:

- Objective/modifier selection is stable for the same seed and input.
- Objective options are valid for the current level's allowed plants and wave content.
- Planting, defeating enemies, mower usage, sun reserve, and slow-hit objectives report progress correctly.
- Modifiers affect the intended rule inputs without changing unrelated behavior.
- HUD markup includes the objective chip, modifier feedback, and terminal result text.

Run `npm test` and `npm run build` after implementation. Because the HUD changes are visible on iPad, also run a browser check at an iPad landscape viewport before calling the implementation done.

## Non-Goals

This slice will not include:

- Online play, accounts, sync, or analytics.
- Long-term saved rewards or collections.
- Daily calendars or fixed date-based missions.
- A challenge selection menu.
- New paid/progression systems.
- Large balance redesigns for all levels.

## Acceptance

The slice is successful when:

- A child can understand the current short objective from the HUD.
- Each level start feels slightly different through one gentle modifier.
- End-of-level feedback clearly says whether the small task was completed.
- Failure feedback shows progress instead of only saying the player lost.
- The game remains pure offline single-player and playable in the existing iPad-first flow.
- Tests and build pass, with no visible HUD overlap in iPad landscape browser verification.
