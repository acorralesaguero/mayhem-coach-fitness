import { z } from "zod";
import type { WorkoutPlan } from "./program";
const responseSchema = z.object({
  coach_note: z.string().min(1).max(1000),
  blocks: z.array(
    z.object({
      exercises: z.array(
        z.object({
          name: z.string().min(1).max(120),
          prescription: z.string().min(1).max(200),
          rest: z.string().max(120),
          cue: z.string().max(500),
          swapped_from: z.string().max(120).nullable(),
        }),
      ),
    }),
  ),
});
export function validateAdjustment(raw: unknown, plan: WorkoutPlan) {
  const parsed = responseSchema.safeParse(raw);
  const fail = () => {
    throw new Error("Coach returned an invalid session — try rephrasing.");
  };
  if (!parsed.success) return fail();
  const out = parsed.data;
  if (out.blocks.length !== plan.blocks.length) return fail();
  for (const [i, b] of plan.blocks.entries()) {
    const next = out.blocks[i];
    if (!next || next.exercises.length !== b.exercises.length) return fail();
    for (const [j, e] of b.exercises.entries()) {
      const n = next.exercises[j];
      if (!n || (n.name !== e.name && n.swapped_from !== e.name)) return fail();
    }
  }
  return out;
}
export function pendingSessionValid(timestamp: unknown, now = Date.now()) {
  return (
    typeof timestamp === "number" &&
    Number.isFinite(timestamp) &&
    timestamp <= now &&
    now - timestamp < 86400000
  );
}
export function benchmarkSuggestion(estimate: number, current: number | null) {
  return (
    estimate > 0 &&
    (current === null || current <= 0 || Math.abs(estimate - current) / current >= 0.03)
  );
}
