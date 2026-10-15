import { describe, expect, it } from "vitest";
import { swapOptions } from "@/lib/swaps";

describe("swapOptions", () => {
  it("offers cardio alternatives for the bike", () => {
    expect(swapOptions("Echo bike")).toContain("Row");
  });
  it("offers ring rows for pull-ups", () => {
    expect(swapOptions("Strict pull-ups")).toContain("Ring row");
  });
  it("offers dumbbell options for barbell front squat", () => {
    expect(swapOptions("Front squat")).toContain("Dumbbell front squat");
  });
  it("falls back to generic options", () => {
    expect(swapOptions("Mystery move")).toEqual(["Dumbbell version", "Bodyweight version", "Kettlebell version"]);
  });
});
