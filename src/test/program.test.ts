import { describe, expect, it } from "vitest";
import { buildSession, readinessFactor, roundLoad } from "@/lib/program";

const fresh = { energy: 5, sleep_hours: 8, sleep_quality: 5, stress: 1, soreness: 1, motivation: 5 };
const wrecked = { energy: 1, sleep_hours: 4, sleep_quality: 1, stress: 5, soreness: 5, motivation: 1 };

describe("program", () => {
  it("rounds to plates", () => {
    expect(roundLoad(187, "lb")).toBe(185);
    expect(roundLoad(81, "kg")).toBe(80);
  });
  it("trims loads when readiness is low", () => {
    expect(readinessFactor(fresh)).toBe(1);
    expect(readinessFactor(wrecked)).toBe(0.85);
  });
  it.each([30, 60, 90] as const)("%i-minute session sums to its length", (duration) => {
    const p = buildSession({ date: new Date(2026, 4, 12), duration, groups: ["Legs"], benchmarks: { back_squat: 300 }, readiness: fresh, tier: "rx" });
    expect(p.blocks.reduce((s, b) => s + b.minutes, 0)).toBe(duration);
  });
  it("computes squat load from 1RM (Q2 strength 75%)", () => {
    // May 12 2026 → Q2, week index 18 → wave 0.1 (peak) → 85% of 300 = 255
    const p = buildSession({ date: new Date(2026, 4, 12), duration: 60, groups: ["Legs"], benchmarks: { back_squat: 300 }, readiness: fresh, tier: "rx" });
    expect(p.blocks[1].exercises[0].prescription).toBe("5 x 5 @ 255 lb");
  });
});
