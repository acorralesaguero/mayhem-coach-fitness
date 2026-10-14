import { describe, expect, it } from "vitest";
import { computeState, guessTimer, PRESETS } from "@/lib/timer";

describe("timer", () => {
  it("EMOM 10 advances one round per minute", () => {
    expect(computeState(PRESETS.emom, 0)).toMatchObject({ round: 1, remaining: 60 });
    expect(computeState(PRESETS.emom, 61)).toMatchObject({ round: 2, remaining: 59 });
    expect(computeState(PRESETS.emom, 600).phase).toBe("done");
  });
  it("Tabata is 20s work / 10s rest x 8", () => {
    expect(computeState(PRESETS.tabata, 19).phase).toBe("work");
    expect(computeState(PRESETS.tabata, 20).phase).toBe("rest");
    expect(computeState(PRESETS.tabata, 30)).toMatchObject({ phase: "work", round: 2 });
    expect(computeState(PRESETS.tabata, 240).phase).toBe("done");
  });
  it("guesses EMOM and AMRAP from block format", () => {
    expect(guessTimer("EMOM 12", 12)).toMatchObject({ mode: "emom", rounds: 12 });
    expect(guessTimer("AMRAP 8", 8)).toMatchObject({ mode: "amrap", cap: 480 });
  });
});
