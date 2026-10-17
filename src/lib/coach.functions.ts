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
  .inputValidator((d: unknown) => z.object({ workoutId: z.string().uuid(), message: z.string().transform(s=>s.normalize("NFKC").replace(/[\u0000-\u001f]/g," ").trim()).pipe(z.string().min(2).max(500)) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: w, error } = await supabase.from("workouts").select("plan").eq("id", data.workoutId).eq("user_id",userId).single();
    if (error || !w) throw new Error("Workout not found");
    const plan = w.plan as unknown as WorkoutPlan;
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("Coach unavailable");

    const openai = createOpenAI({ baseURL: "https://ai.gateway.lovable.dev/v1", apiKey: key, headers: { "Lovable-API-Key": key, "X-Lovable-AIG-SDK": "vercel-ai-sdk" } });
    const result = streamText({
      abortSignal: AbortSignal.timeout(30000),
      maxOutputTokens: 5000,
      model: openai.responses("openai/gpt-6-astra"),
      output: Output.object({ schema }),
      system: "You are a functional fitness coach. The athlete has a fixed session. Change ONLY the exercises affected by their note (equipment, space, injury, broken machine), keeping the same stimulus, reps, time domain, avoiding advanced movements for beginners and keeping loads conservative, and number of blocks and exercises in the same order. For changed exercises set swapped_from to the original name, else null. coach_note: one sentence on what changed.",
      prompt: `Note: ${data.message}\n\nSession blocks:\n${JSON.stringify(plan.blocks.map((b) => ({ name: b.name, exercises: b.exercises.map(({ actual: _a, ...e }) => e) })))}`,
      providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
    });
    let raw;
    try { raw = await result.output; } catch { throw new Error("Coach could not adjust the session — try again."); }
    const parsed=z.object({coach_note:z.string().min(1).max(1000),blocks:z.array(z.object({exercises:z.array(z.object({name:z.string().min(1).max(120),prescription:z.string().min(1).max(200),rest:z.string().max(120),cue:z.string().max(500),swapped_from:z.string().max(120).nullable()}))}))}).safeParse(raw);
    if(!parsed.success)throw new Error("Coach returned an invalid session — try rephrasing.");
    const out=parsed.data;
    if(out.blocks.length!==plan.blocks.length)throw new Error("Coach returned an invalid session — try rephrasing.");
    for(const [i,b] of plan.blocks.entries()){
      const replacement=out.blocks[i];
      if(!replacement||replacement.exercises.length!==b.exercises.length)throw new Error("Coach returned an invalid session — try rephrasing.");
      for(const [j,e] of b.exercises.entries()){const n=replacement.exercises[j];if(!n||(n.name!==e.name&&n.swapped_from!==e.name))throw new Error("Coach returned an invalid session — try rephrasing.");}
    }
    const next:WorkoutPlan={...plan,coach_note:out.coach_note,blocks:plan.blocks.map((b,i)=>({...b,exercises:b.exercises.map((old,j)=>{const n=out.blocks[i]?.exercises[j];if(!n)return old;return {...old,...n,swapped_from:n.swapped_from??old.swapped_from,...(n.name!==old.name?{lift:undefined,actual:undefined}:{actual:old.actual})};})}))};
    const { error: uErr } = await supabase.from("workouts").update({ plan: next as never }).eq("id", data.workoutId).eq("user_id",userId);
    if (uErr) throw new Error(uErr.message);
    return { ok: true };
  });
