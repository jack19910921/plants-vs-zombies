import { describe, expect, it } from "vitest";
import { DIFFICULTY, LEVEL_ONE, PLANTS, ZOMBIES } from "./config";
import {
  advanceCombat,
  createInitialState,
  getPlantingResult,
  moveHeroLane,
  plantAt,
  selectPlant,
  spawnDueZombies,
  updateStatus
} from "./rules";

describe("game rules", () => {
  it("spends sun and occupies a grid cell when planting succeeds", () => {
    const state = selectPlant(createInitialState(LEVEL_ONE), "peashooter");
    const next = plantAt(state, PLANTS, 2, 3);
    expect(next.sun).toBe(150);
    expect(next.plants).toHaveLength(1);
    expect(next.plants[0]).toMatchObject({ plantId: "peashooter", lane: 2, column: 3 });
  });

  it("does not allow sun to become negative", () => {
    const state = selectPlant({ ...createInitialState(LEVEL_ONE), sun: 20 }, "peashooter");
    const next = plantAt(state, PLANTS, 2, 3);
    expect(next.sun).toBe(20);
    expect(next.plants).toHaveLength(0);
  });

  it("does not plant into an occupied cell", () => {
    const first = plantAt(selectPlant(createInitialState(LEVEL_ONE), "sunflower"), PLANTS, 1, 1);
    const second = plantAt(selectPlant(first, "peashooter"), PLANTS, 1, 1);
    expect(second.plants).toHaveLength(1);
    expect(second.sun).toBe(first.sun);
  });

  it("reports why planting cannot happen", () => {
    const empty = createInitialState(LEVEL_ONE);
    expect(getPlantingResult(empty, PLANTS, 0, 0)).toMatchObject({ ok: false, reason: "no-selection" });

    const lowSun = selectPlant({ ...empty, sun: 20 }, "peashooter");
    expect(getPlantingResult(lowSun, PLANTS, 0, 0)).toMatchObject({ ok: false, reason: "not-enough-sun" });

    const planted = plantAt(selectPlant(empty, "sunflower"), PLANTS, 0, 0);
    expect(getPlantingResult(selectPlant(planted, "wallnut"), PLANTS, 0, 0)).toMatchObject({
      ok: false,
      reason: "occupied"
    });

    const coolingDown = selectPlant({ ...planted, nowMs: planted.nowMs + 1000 }, "sunflower");
    expect(getPlantingResult(coolingDown, PLANTS, 1, 1)).toMatchObject({ ok: false, reason: "cooldown" });
  });

  it("applies easy difficulty to starting sun", () => {
    const normal = createInitialState(LEVEL_ONE, DIFFICULTY.normal);
    const easy = createInitialState(LEVEL_ONE, DIFFICULTY.easy);

    expect(easy.sun).toBeGreaterThan(normal.sun);
    expect(easy.sun % 25).toBe(0);
  });

  it("spawns each wave entry once", () => {
    const state = { ...createInitialState(LEVEL_ONE), nowMs: 20000 };
    const first = spawnDueZombies(state, LEVEL_ONE, ZOMBIES);
    const second = spawnDueZombies(first, LEVEL_ONE, ZOMBIES);
    expect(first.zombies).toHaveLength(2);
    expect(second.zombies).toHaveLength(2);
    expect(first.zombies[0].hp).toBeGreaterThan(1);
  });

  it("applies easy difficulty to spawned zombie health", () => {
    const spawned = spawnDueZombies(
      { ...createInitialState(LEVEL_ONE), nowMs: 9000 },
      LEVEL_ONE,
      ZOMBIES,
      DIFFICULTY.easy
    );

    expect(spawned.zombies[0].hp).toBeLessThan(ZOMBIES.basic.maxHp);
  });

  it("records wave spawn events for presentation cues", () => {
    const state = { ...createInitialState(LEVEL_ONE), nowMs: 9000 };
    const next = spawnDueZombies(state, LEVEL_ONE, ZOMBIES);
    expect(next.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "wave-spawned",
          waveIndex: 0,
          lane: 2,
          zombieId: "basic"
        })
      ])
    );
  });

  it("sets failure when a zombie reaches the base", () => {
    const state = createInitialState(LEVEL_ONE);
    const next = updateStatus(
      {
        ...state,
        zombies: [{ id: "z1", zombieId: "basic", lane: 0, x: -0.1, hp: 10, slowedUntilMs: 0 }]
      },
      LEVEL_ONE
    );
    expect(next.status).toBe("failure");
  });

  it("records a level-ended event when the status changes", () => {
    const state = {
      ...createInitialState(LEVEL_ONE),
      nowMs: LEVEL_ONE.durationMs,
      spawnedWaveIndexes: LEVEL_ONE.waves.map((_, index) => index)
    };
    const next = updateStatus(state, LEVEL_ONE);
    expect(next.status).toBe("victory");
    expect(next.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "level-ended",
          status: "victory",
          atMs: LEVEL_ONE.durationMs
        })
      ])
    );
  });

  it("moves zombies toward the base", () => {
    const state = {
      ...createInitialState(LEVEL_ONE),
      zombies: [{ id: "z1", zombieId: "basic" as const, lane: 0 as const, x: 8, hp: 70, slowedUntilMs: 0 }]
    };
    const next = advanceCombat(
      state,
      PLANTS,
      { basic: { id: "basic", name: "普通僵尸", maxHp: 70, speedCellsPerSecond: 1, damagePerSecond: 18 } },
      1000
    );
    expect(next.zombies[0].x).toBeLessThan(8);
  });

  it("applies easy difficulty to zombie movement speed", () => {
    const base = {
      ...createInitialState(LEVEL_ONE),
      zombies: [{ id: "zombie-1", zombieId: "basic" as const, lane: 2 as const, x: 8, hp: 70, slowedUntilMs: 0 }]
    };

    const normal = advanceCombat(base, PLANTS, ZOMBIES, 1000, DIFFICULTY.normal);
    const easy = advanceCombat(base, PLANTS, ZOMBIES, 1000, DIFFICULTY.easy);

    expect(easy.zombies[0].x).toBeGreaterThan(normal.zombies[0].x);
  });

  it("creates projectiles from peashooters when a zombie is ahead", () => {
    const planted = plantAt(selectPlant(createInitialState(LEVEL_ONE), "peashooter"), PLANTS, 0, 1);
    const state = {
      ...planted,
      nowMs: 2000,
      zombies: [{ id: "z1", zombieId: "basic" as const, lane: 0 as const, x: 7, hp: 70, slowedUntilMs: 0 }]
    };
    const next = advanceCombat(
      state,
      PLANTS,
      { basic: { id: "basic", name: "普通僵尸", maxHp: 70, speedCellsPerSecond: 1, damagePerSecond: 18 } },
      16
    );
    expect(next.projectiles.length).toBeGreaterThan(0);
  });

  it("lets sunflowers produce additional sun over time", () => {
    const planted = plantAt(selectPlant(createInitialState(LEVEL_ONE), "sunflower"), PLANTS, 0, 1);
    const next = advanceCombat({ ...planted, nowMs: 5000 }, PLANTS, ZOMBIES, 16);
    expect(next.sun).toBe(planted.sun + 25);
  });

  it("provides base sun over time even without sunflowers", () => {
    const state = { ...createInitialState(LEVEL_ONE), sun: 0, nowMs: 9000 };
    const next = advanceCombat(state, PLANTS, ZOMBIES, 16);

    expect(next.sun).toBe(25);
    expect(next.nextBaseSunAtMs).toBeGreaterThan(state.nowMs);
    expect(next.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "sun-produced",
          sourceId: "base-sun",
          amount: 25,
          atMs: state.nowMs
        })
      ])
    );
  });

  it("does not provide base sun again before the next scheduled drip", () => {
    const state = { ...createInitialState(LEVEL_ONE), sun: 0, nowMs: 9000 };
    const first = advanceCombat(state, PLANTS, ZOMBIES, 16);
    const second = advanceCombat({ ...first, nowMs: 9016 }, PLANTS, ZOMBIES, 16);

    expect(second.sun).toBe(25);
    expect(
      second.events.filter((event) => event.type === "sun-produced" && event.sourceId === "base-sun")
    ).toHaveLength(1);
  });

  it("stops zombies while they chew through a plant", () => {
    const planted = plantAt(selectPlant(createInitialState(LEVEL_ONE), "wallnut"), PLANTS, 0, 3);
    const state = {
      ...planted,
      zombies: [{ id: "z1", zombieId: "basic" as const, lane: 0 as const, x: 3.5, hp: 70, slowedUntilMs: 0 }]
    };
    const next = advanceCombat(
      state,
      PLANTS,
      { basic: { id: "basic", name: "普通僵尸", maxHp: 70, speedCellsPerSecond: 1, damagePerSecond: 18 } },
      1000
    );
    expect(next.zombies[0].x).toBe(3.5);
    expect(next.plants[0].hp).toBeLessThan(planted.plants[0].hp);
  });

  it("keeps potato mines quiet until they finish arming", () => {
    const planted = plantAt(selectPlant(createInitialState(LEVEL_ONE), "potatomine"), PLANTS, 0, 3);
    const state = {
      ...planted,
      nowMs: PLANTS.potatomine.armsAfterMs - 100,
      zombies: [{ id: "z1", zombieId: "basic" as const, lane: 0 as const, x: 3.25, hp: 70, slowedUntilMs: 0 }]
    };

    const next = advanceCombat(state, PLANTS, ZOMBIES, 16);

    expect(next.plants).toEqual(expect.arrayContaining([expect.objectContaining({ plantId: "potatomine" })]));
    expect(next.zombies).toEqual(expect.arrayContaining([expect.objectContaining({ id: "z1" })]));
    expect(next.events.some((event) => event.type === "potato-mine-exploded")).toBe(false);
  });

  it("explodes armed potato mines when zombies step into their cell", () => {
    const planted = plantAt(selectPlant(createInitialState(LEVEL_ONE), "potatomine"), PLANTS, 0, 3);
    const mine = planted.plants[0];
    const state = {
      ...planted,
      nowMs: PLANTS.potatomine.armsAfterMs,
      zombies: [
        { id: "z1", zombieId: "basic" as const, lane: 0 as const, x: 3.25, hp: 70, slowedUntilMs: 0 },
        { id: "z2", zombieId: "bucket" as const, lane: 0 as const, x: 3.55, hp: 180, slowedUntilMs: 0 },
        { id: "z3", zombieId: "basic" as const, lane: 1 as const, x: 3.25, hp: 70, slowedUntilMs: 0 }
      ]
    };

    const next = advanceCombat(state, PLANTS, ZOMBIES, 16);

    expect(next.plants.some((plant) => plant.id === mine.id)).toBe(false);
    expect(next.zombies).toEqual([
      expect.objectContaining({ id: "z2", hp: 60 }),
      expect.objectContaining({ id: "z3", hp: 70 })
    ]);
    expect(next.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "potato-mine-exploded",
          sourceId: mine.id,
          lane: 0,
          column: 3,
          damage: 120
        }),
        expect.objectContaining({
          type: "zombie-defeated",
          targetId: "z1"
        })
      ])
    );
  });

  it("fires from the hero lane so movement affects combat", () => {
    const state = {
      ...createInitialState(LEVEL_ONE),
      nowMs: 1000,
      zombies: [{ id: "z1", zombieId: "basic" as const, lane: 2 as const, x: 7, hp: 70, slowedUntilMs: 0 }]
    };
    const next = advanceCombat(state, PLANTS, ZOMBIES, 16);
    expect(next.projectiles.length).toBeGreaterThan(0);
    expect(next.nextHeroShotAtMs).toBeGreaterThan(state.nowMs);
  });

  it("moves the hero lane by touch or keyboard while clamping to the board", () => {
    const state = createInitialState(LEVEL_ONE);

    expect(moveHeroLane(state, -1).heroLane).toBe(1);
    expect(moveHeroLane(state, 1).heroLane).toBe(3);
    expect(moveHeroLane({ ...state, heroLane: 0 }, -1).heroLane).toBe(0);
    expect(moveHeroLane({ ...state, heroLane: 4 }, 1).heroLane).toBe(4);
  });

  it("records combat events for presentation feedback", () => {
    const planted = plantAt(selectPlant(createInitialState(LEVEL_ONE), "peashooter"), PLANTS, 0, 1);
    const firingState = {
      ...planted,
      nowMs: 2000,
      zombies: [{ id: "z1", zombieId: "basic" as const, lane: 0 as const, x: 7, hp: 70, slowedUntilMs: 0 }]
    };
    const afterFire = advanceCombat(firingState, PLANTS, ZOMBIES, 16);
    expect(afterFire.events.some((event) => event.type === "plant-fired" && event.sourceId === planted.plants[0].id)).toBe(
      true
    );

    const hitState = {
      ...createInitialState(LEVEL_ONE),
      nowMs: 2400,
      zombies: [{ id: "z1", zombieId: "basic" as const, lane: 0 as const, x: 2.1, hp: 70, slowedUntilMs: 0 }],
      projectiles: [{ id: "p1", lane: 0 as const, x: 2.05, damage: 20, slows: true }]
    };
    const afterHit = advanceCombat(hitState, PLANTS, ZOMBIES, 16);
    expect(afterHit.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "zombie-hit",
          targetId: "z1",
          damage: 20,
          slows: true
        })
      ])
    );
  });
});
