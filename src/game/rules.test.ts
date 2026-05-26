import { describe, expect, it } from "vitest";
import { LEVEL_ONE, PLANTS, ZOMBIES } from "./config";
import { advanceCombat, createInitialState, plantAt, selectPlant, spawnDueZombies, updateStatus } from "./rules";

describe("game rules", () => {
  it("spends sun and occupies a grid cell when planting succeeds", () => {
    const state = selectPlant(createInitialState(LEVEL_ONE), "peashooter");
    const next = plantAt(state, PLANTS, 2, 3);
    expect(next.sun).toBe(50);
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

  it("spawns each wave entry once", () => {
    const state = { ...createInitialState(LEVEL_ONE), nowMs: 10000 };
    const first = spawnDueZombies(state, LEVEL_ONE, ZOMBIES);
    const second = spawnDueZombies(first, LEVEL_ONE, ZOMBIES);
    expect(first.zombies).toHaveLength(2);
    expect(second.zombies).toHaveLength(2);
    expect(first.zombies[0].hp).toBeGreaterThan(1);
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
});
