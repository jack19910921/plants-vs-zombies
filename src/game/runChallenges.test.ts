import { describe, expect, it } from "vitest";
import { LEVELS } from "./config";
import {
  createRunChallenge,
  getChallengeHudLabel,
  getChallengeNudgeText,
  getChallengeResultLabel,
  getModifierAnnouncement,
  syncChallengeProgressFromState,
  updateChallengeForEvent
} from "./runChallenges";

describe("run challenges", () => {
  it("selects the same challenge for the same seed and run input", () => {
    const first = createRunChallenge({
      level: LEVELS[1],
      difficultyId: "normal",
      seed: 12345,
      runIndex: 2
    });
    const second = createRunChallenge({
      level: LEVELS[1],
      difficultyId: "normal",
      seed: 12345,
      runIndex: 2
    });

    expect(second).toEqual(first);
  });

  it("changes selection when the run index changes", () => {
    const first = createRunChallenge({
      level: LEVELS[1],
      difficultyId: "normal",
      seed: 12345,
      runIndex: 1
    });
    const second = createRunChallenge({
      level: LEVELS[1],
      difficultyId: "normal",
      seed: 12345,
      runIndex: 2
    });

    expect(`${second.objective.id}:${second.modifier.id}`).not.toBe(`${first.objective.id}:${first.modifier.id}`);
  });

  it("does not select slow-hit objectives before snowpea is unlocked", () => {
    for (let seed = 1; seed <= 50; seed += 1) {
      const challenge = createRunChallenge({
        level: LEVELS[0],
        difficultyId: "normal",
        seed,
        runIndex: seed
      });

      expect(challenge.objective.kind).not.toBe("slow-hit-count");
    }
  });

  it("returns short child-readable labels", () => {
    const challenge = createRunChallenge({
      level: LEVELS[2],
      difficultyId: "easy",
      seed: 7,
      runIndex: 3
    });

    expect(getChallengeHudLabel(challenge)).toMatch(/^目标：/);
    expect(getModifierAnnouncement(challenge.modifier)).toContain("：");
    expect(getChallengeNudgeText(challenge)).not.toHaveLength(0);
    expect(getChallengeResultLabel({ ...challenge, completed: true })).toBe("小任务完成");
  });
});

describe("run challenge progress", () => {
  it("tracks plant, defeat, and slow-hit event progress", () => {
    const plantChallenge = createRunChallenge({ level: LEVELS[2], difficultyId: "normal", seed: 11, runIndex: 1 });
    const planting = {
      ...plantChallenge,
      objective: {
        id: "plant-sunflowers",
        kind: "plant-count",
        target: 3,
        label: "种 3 朵向日葵",
        plantId: "sunflower"
      },
      current: 0,
      completed: false
    } as const;

    expect(updateChallengeForEvent(planting, { type: "plant", plantId: "sunflower" })!.current).toBe(1);
    expect(updateChallengeForEvent(planting, { type: "plant", plantId: "wallnut" })!.current).toBe(0);

    const defeat = {
      ...plantChallenge,
      objective: { id: "defeat-zombies", kind: "defeat-count", target: 2, label: "打倒 2 个僵尸" },
      current: 1,
      completed: false
    } as const;
    expect(updateChallengeForEvent(defeat, { type: "defeat" })!.completed).toBe(true);

    const slow = {
      ...plantChallenge,
      objective: {
        id: "slow-hit-count",
        kind: "slow-hit-count",
        target: 2,
        label: "冻住 2 次敌人",
        plantId: "snowpea"
      },
      current: 1,
      completed: false
    } as const;
    expect(updateChallengeForEvent(slow, { type: "slow-hit" })!.completed).toBe(true);
  });

  it("syncs mower and sun reserve progress from state", () => {
    const challenge = createRunChallenge({ level: LEVELS[0], difficultyId: "normal", seed: 5, runIndex: 1 });
    const mower = {
      ...challenge,
      objective: { id: "protect-mowers", kind: "mower-protection", target: 1, label: "保护 1 台小车" },
      current: 0,
      completed: false
    } as const;
    const syncedMower = syncChallengeProgressFromState(mower, { sun: 75, mowerLanes: [2] });
    expect(syncedMower).toMatchObject({ current: 1, completed: true });

    const sun = {
      ...challenge,
      objective: { id: "save-sun", kind: "sun-reserve", target: 100, label: "留下 100 阳光" },
      current: 0,
      completed: false
    } as const;
    const syncedSun = syncChallengeProgressFromState(sun, { sun: 125, mowerLanes: [] });
    expect(syncedSun).toMatchObject({ current: 125, completed: true });
  });
});
