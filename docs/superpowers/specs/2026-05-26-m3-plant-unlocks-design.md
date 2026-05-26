# M3 Plant Unlocks Design

## Goal

Make `allowedPlants` visible and meaningful so the three-level sequence introduces plant tools gradually instead of showing every option from the first second.

## Player Experience

Level 1 keeps the tray simple with `向日葵`, `豌豆射手`, and `坚果墙`. Level 2 unlocks `寒冰射手`. Level 3 unlocks `土豆雷`. Locked cards stay visible in the tray but are disabled and show `未开放`, so the player can see that more tools are coming without being able to select them too early.

## Architecture

`LevelConfig.allowedPlants` remains the source of truth. `GameScene.setSelectedPlant()` refuses plants that are not allowed in the current level. `createDomOverlay()` passes the current level's allowed plant IDs to `createDomOverlayMarkup()`, and DOM rendering handles locked-card presentation.

Rules stay unchanged because planting rules already assume the scene/UI selects a legal plant. This keeps progression rules in level config and avoids coupling `plantAt()` to a specific level.

## Testing

Config tests verify the unlock sequence. DOM tests verify locked-card markup. Scene-level protection is kept small and defensive; browser verification confirms locked cards are visible and disabled on the first level.
