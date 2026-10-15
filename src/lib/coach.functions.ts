import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createOpenAI } from "@ai-sdk/openai";
import { jsonSchema, Output, streamText } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { WorkoutPlan } from "@/lib/program";

const exSchema: import("ai").JSONSchema7 = {
  type: "object", additionalProperties: false,
  required: ["name", "prescription", "rest", "cue", "swapped_from"],
  properties: { name: { type: "string" }, prescription: { type: "string" }, rest: { type: "string" }, cue: { type: "string" }, swapped_from: { type: ["string", "null"] } },
};
const schema = jsonSchema<{ coach_note: string; blocks: { exercises: { name: string; prescription: string; rest: string; cue: string; swapped_from: string | null }[] }[] }>({
  type: "object", additionalProperties: false, required: ["coach_note", "blocks"],
  properties: {
    coach_note: { type: "string" },
    blocks: { type: "array", items: { type: "object", additionalProperties: false, required: ["exercises"], properties: { exercises: { type: "array", items: exSchema } } } },
  },
});

/** Coach adjusts only affected movements of a fixed session based on the athlete's note. */
export const adjustWorkout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ workoutId: z.string().uuid(), message: z.string().min(2).max(500) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: w, error } = await supabase.from("workouts").select("plan").eq("id", data.workoutId).single();
    if (error || !w) throw new Error("Workout not found");
    const plan = w.plan as unknown as WorkoutPlan;
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Coach unavailable");

    const openai = createOpenAI({ baseURL: "https://ai.gateway.lovable.dev/v1", apiKey: key, headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" } });
    const result = streamText({
      model: openai.responses("openai/gpt-6-astra"),
      output: Output.object({ schema }),
      system: "You are a functional fitness coach. The athlete has a fixed session. Change ONLY the exercises affected by their note (equipment, space, injury, broken machine), keeping the same stimulus, reps, time domain, and number of blocks and exercises in the same order. For changed exercises set swapped_from to the original name, else null. coach_note: one sentence on what changed.",
      prompt: `Note: ${data.message}\n\nSession blocks:\n${JSON.stringify(plan.blocks.map((b) => ({ name: b.name, exercises: b.exercises.map(({ actual: _a, ...e }) => e) })))}`,
      providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
    });
    let out;
    try { out = await result.output; } catch { throw new Error("Coach could not adjust the session — try again."); }
    if (out.blocks.length !== plan.blocks.length) throw new Error("Coach returned an invalid session — try rephrasing.");
    const next: WorkoutPlan = {
      ...plan,
      coach_note: out.coach_note || plan.coach_note,
      blocks: plan.blocks.map((b, i) => ({
        ...b,
        exercises: out.blocks[i]!.exercises.map((e) => ({ name: e.name, prescription: e.prescription, rest: e.rest, cue: e.cue, ...(e.swapped_from ? { swapped_from: e.swapped_from } : {}) })),
      })),
    };
    const { error: uErr } = await supabase.from("workouts").update({ plan: next as never }).eq("id", data.workoutId);
    if (uErr) throw new Error(uErr.message);
    return { ok: true };
  });
