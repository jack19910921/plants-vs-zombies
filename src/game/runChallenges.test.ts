import { describe, expect, it } from "vitest";
import { LEVELS } from "./config";
import {
  createRunChallenge,
  getChallengeHudLabel,
  getChallengeNudgeText,
  getChallengeResultLabel,
  getModifierAnnouncement
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
