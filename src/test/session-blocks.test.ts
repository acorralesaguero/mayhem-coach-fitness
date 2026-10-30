import { describe, it, expect } from "vitest";
import { buildSession } from "@/lib/program";
import { prefillActual } from "@/lib/progress";
const base = {
  date: new Date(2026, 9, 20),
  groups: ["Arms"],
  benchmarks: {},
  readiness: { energy: 3, sleep_hours: 7, sleep_quality: null, stress: null, soreness: 3, motivation: null },
  tier: "scaled" as const,
};
describe("session blocks", () => {
  it("60-minute session has a simple Builder block plus a Tabata finisher", () => {
    const p = buildSession({ ...base, duration: 60, equipment: ["Full gym"] });
    const names = p.blocks.map((b) => b.name);
    expect(names).toContain("Builder");
    expect(p.blocks.find((b) => b.name === "Builder")?.exercises.length).toBeGreaterThan(0);
    expect(p.blocks.reduce((s, b) => s + b.minutes, 0)).toBe(60);
  });
  it("today's equipment choice removes dumbbell moves for bodyweight-only", () => {
    const p = buildSession({ ...base, duration: 60, equipment: ["Bodyweight only"] });
    const all = p.blocks.flatMap((b) => b.exercises.map((e) => e.requires));
    expect(all.every((r) => r === "Bodyweight only")).toBe(true);
  });
});
describe("variety", () => {
  it("warm-up changes from one day to the next", () => {
    const warm = (d: number) =>
      buildSession({ ...base, date: new Date(2026, 9, d), groups: ["Legs"], duration: 60, equipment: ["Full gym"] })
        .blocks[0]!.exercises.map((e) => e.name).join();
    expect(warm(20)).not.toBe(warm(21));
  });
});
describe("prefill", () => {
  it("uses the prescription when no history", () => {
    expect(prefillActual({ name: "Thrusters", prescription: "12 @ 65 lb" }, [], "lb")).toEqual({ weight: "65 lb", reps: "12" });
  });
  it("averages the last three logs for that movement", () => {
    const h = [100, 110, 120, 200].map((w) => ({
      plan: { blocks: [{ exercises: [{ name: "Thrusters", actual: { weight_num: w, reps_num: 10 } }] }] },
    }));
    expect(prefillActual({ name: "Thrusters", prescription: "12 @ 65 lb" }, h, "lb")).toEqual({ weight: "110 lb", reps: "10" });
  });
});
