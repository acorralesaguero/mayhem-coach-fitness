import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const exerciseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["name", "prescription", "rest", "cue"],
  properties: {
    name: { type: "string" },
    prescription: { type: "string", description: "sets x reps, time, or distance" },
    rest: { type: "string" },
    cue: { type: "string", description: "one short coaching cue" },
  },
} as const;

const workoutJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "coach_note", "intensity", "blocks", "cooldown"],
  properties: {
    title: { type: "string" },
    coach_note: {
      type: "string",
      description: "2-3 sentences addressing the athlete about today's readiness and why the session is shaped this way",
    },
    intensity: { type: "string", enum: ["recovery", "moderate", "hard", "max"] },
    blocks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "format", "minutes", "exercises"],
        properties: {
          name: { type: "string", description: "e.g. Warm-up, Strength, Conditioning, Finisher" },
          format: { type: "string", description: "e.g. EMOM 12, 5 rounds for time, AMRAP 10, straight sets" },
          minutes: { type: "number" },
          exercises: { type: "array", items: exerciseSchema },
        },
      },
    },
    cooldown: { type: "string" },
  },
} as const;

export type WorkoutPlan = {
  title: string;
  coach_note: string;
  intensity: "recovery" | "moderate" | "hard" | "max";
  blocks: {
    name: string;
    format: string;
    minutes: number;
    exercises: { name: string; prescription: string; rest: string; cue: string }[];
  }[];
  cooldown: string;
};

const SYSTEM = `You are an elite hybrid-athlete coach blending the Mayhem Athlete methodology (functional fitness, strength + engine + gymnastics, smart weekly structure, intensity matched to readiness) with Freeletics-style bodyweight HIIT and adaptive progression. 
Write one session that fits EXACTLY the requested total minutes (block minutes must sum to the total, including warm-up). 
Adapt intensity to the athlete's check-in: low sleep, high stress, high soreness or low energy => reduce volume/intensity or shift to skill/aerobic/mobility work; strong readiness => push. 
Respect equipment, limitations, experience, goals and target physique. Use real, specific movements and loads described as %1RM, RPE, or scaled options. Be concise.`;

export const generateWorkout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        checkin: z.object({
          energy: z.number().min(1).max(5),
          sleep_hours: z.number().min(0).max(14),
          sleep_quality: z.number().min(1).max(5),
          stress: z.number().min(1).max(5),
          soreness: z.number().min(1).max(5),
          motivation: z.number().min(1).max(5),
          day_outlook: z.string().max(300),
          notes: z.string().max(500),
        }),
        duration: z.union([z.literal(30), z.literal(60), z.literal(90)]),
        muscle_groups: z.array(z.string()).max(10),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("AI is not configured.");

    const { data: checkin, error: cErr } = await supabase
      .from("checkins")
      .insert({ ...data.checkin, user_id: userId, available_minutes: data.duration })
      .select()
      .single();
    if (cErr) throw new Error(cErr.message);

    const [{ data: profile }, { data: history }, { data: recent }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase
        .from("checkins")
        .select("checkin_date, energy, sleep_hours, stress, soreness")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),
      supabase
        .from("workouts")
        .select("workout_date, title, muscle_groups, completed, rpe, feedback")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

    const prompt = `ATHLETE PROFILE: ${JSON.stringify({
      current_body_type: profile?.current_body_type,
      target_physique: profile?.target_physique,
      primary_goal: profile?.primary_goal,
      build_focus: profile?.build_focus,
      progression_style: profile?.progression_style,
      experience: profile?.experience,
      equipment: profile?.equipment,
      limitations: profile?.limitations,
    })}
TODAY'S CHECK-IN (1-5 scales; stress/soreness 5 = very high): ${JSON.stringify(data.checkin)}
TOTAL MINUTES: ${data.duration}
TARGET MUSCLE GROUPS TODAY: ${data.muscle_groups.join(", ") || "full body"}
RECENT CHECK-INS: ${JSON.stringify(history ?? [])}
RECENT SESSIONS: ${JSON.stringify(recent ?? [])}`;

    const { streamText, Output, jsonSchema } = await import("ai");
    const { createGatewayProvider, COACH_MODEL } = await import("./ai-gateway.server");
    const provider = createGatewayProvider(apiKey);

    const result = streamText({
      model: provider.responses(COACH_MODEL),
      system: SYSTEM,
      prompt,
      output: Output.object({ schema: jsonSchema<WorkoutPlan>(workoutJsonSchema as never) }),
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    });

    let plan: WorkoutPlan;
    try {
      plan = (await result.output) as WorkoutPlan;
    } catch (e) {
      console.error("coach generation failed", e);
      const msg = String((e as Error)?.message ?? "");
      if (msg.includes("402")) throw new Error("AI credits are used up. Please top up to keep generating sessions.");
      if (msg.includes("429")) throw new Error("The coach is busy right now. Try again in a minute.");
      throw new Error("Your coach couldn't write a session right now. Please try again.");
    }

    const { data: workout, error: wErr } = await supabase
      .from("workouts")
      .insert({
        user_id: userId,
        checkin_id: checkin.id,
        duration: data.duration,
        muscle_groups: data.muscle_groups,
        title: plan.title,
        plan: plan as never,
      })
      .select()
      .single();
    if (wErr) throw new Error(wErr.message);
    return { id: workout.id as string };
  });
