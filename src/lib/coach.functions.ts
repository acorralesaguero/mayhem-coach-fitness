import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { WorkoutPlan } from "@/lib/program";

/** Coach adjusts only affected movements of a fixed session based on the athlete's note. */
export const adjustWorkout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ workoutId: z.string().uuid(), message: z.string().min(2).max(500) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: w, error } = await supabase.from("workouts").select("plan").eq("id", data.workoutId).single();
    if (error || !w) throw new Error("Workout not found");
    const plan = w.plan as unknown as WorkoutPlan;
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Coach unavailable");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a functional fitness coach. The athlete has a fixed session. Change ONLY the exercises affected by their note (equipment, space, injury, machine issues), keeping the same stimulus, reps, time domain and block structure. Keep loads sensible. Return JSON {\"blocks\":[...same shape...],\"coach_note\":\"one sentence about what changed\"}. For changed exercises set swapped_from to the original name." },
          { role: "user", content: `Note: ${data.message}\n\nSession blocks:\n${JSON.stringify(plan.blocks)}` },
        ],
      }),
    });
    if (res.status === 429) throw new Error("Coach is busy — try again in a moment.");
    if (res.status === 402) throw new Error("AI credits are used up.");
    if (!res.ok) throw new Error("Coach could not adjust the session.");
    const json = await res.json();
    const out = JSON.parse(json.choices?.[0]?.message?.content ?? "{}");
    if (!Array.isArray(out.blocks) || out.blocks.length !== plan.blocks.length) throw new Error("Coach returned an invalid session — try rephrasing.");
    const next: WorkoutPlan = { ...plan, blocks: out.blocks, coach_note: out.coach_note || plan.coach_note };
    const { error: uErr } = await supabase.from("workouts").update({ plan: next as never }).eq("id", data.workoutId);
    if (uErr) throw new Error(uErr.message);
    return { ok: true };
  });
