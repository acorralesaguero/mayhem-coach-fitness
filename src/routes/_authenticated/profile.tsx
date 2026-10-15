import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Chips, Section } from "@/components/Chips";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { LIFT_LABELS, type Lift } from "@/lib/program";

const BENCH: (Lift | "bodyweight" | "max_pullups" | "max_pushups")[] = ["bodyweight", "back_squat", "front_squat", "deadlift", "strict_press", "push_press", "clean_jerk", "snatch", "max_pullups", "max_pushups"];
const BLABEL: Record<string, string> = { ...LIFT_LABELS, bodyweight: "Bodyweight", max_pullups: "Max pull-ups (reps)", max_pushups: "Max push-ups (reps)" };
import { BODY_TYPES, BUILD_FOCUS, DURATIONS, EQUIPMENT, EXPERIENCE, GOALS, PROGRESSION, TARGET_PHYSIQUES } from "@/lib/options";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Athlete profile — Forge" }, { name: "description", content: "Your body type, goals and progression style." }] }),
  component: ProfilePage,
});

type P = {
  current_body_type: string | null; target_physique: string | null; primary_goal: string | null;
  build_focus: string[]; progression_style: string | null; experience: string | null;
  default_duration: number; equipment: string[]; limitations: string | null;
  units: string; [k: string]: unknown;
};

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [p, setP] = useState<P | null>(null);
  const [onboarded, setOnboarded] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      setOnboarded(!!data?.onboarded);
      setP({
        current_body_type: data?.current_body_type ?? null, target_physique: data?.target_physique ?? null,
        primary_goal: data?.primary_goal ?? null, build_focus: data?.build_focus ?? [],
        progression_style: data?.progression_style ?? null, experience: data?.experience ?? null,
        default_duration: data?.default_duration ?? 60, equipment: data?.equipment ?? [], limitations: data?.limitations ?? "", units: data?.units ?? "lb",
        ...Object.fromEntries(BENCH.map((k) => [k, (data as Record<string, unknown> | null)?.[k] ?? null])),
      });
    });
  }, [user]);

  if (!p || !user) return <p className="text-muted-foreground">Loading…</p>;
  const set = <K extends keyof P>(k: K) => (v: P[K]) => setP({ ...p, [k]: v });

  async function save() {
    const { error } = await supabase.from("profiles").upsert({ id: user!.id, ...(p as object), onboarded: true });
    if (error) { toast.error(error.message); return; }
    toast.success("Profile saved");
    if (!onboarded) navigate({ to: "/week" });
  }

  return (
    <div className="space-y-4">
      <header className="flex items-end justify-between">
        <div>
          <p className="eyebrow">Athlete profile</p>
          <h1 className="text-4xl">{onboarded ? "Your blueprint" : "Let's build your blueprint"}</h1>
        </div>
        <button className="text-xs text-muted-foreground" onClick={() => supabase.auth.signOut()}>Sign out</button>
      </header>
      <Section title="Current body type"><Chips options={BODY_TYPES} value={p.current_body_type} onChange={set("current_body_type")} /></Section>
      <Section title="Physique you're chasing"><Chips options={TARGET_PHYSIQUES} value={p.target_physique} onChange={set("target_physique")} /></Section>
      <Section title="Primary goal"><Chips options={GOALS} value={p.primary_goal} onChange={set("primary_goal")} /></Section>
      <Section title="What you want to build"><Chips multi options={BUILD_FOCUS} value={p.build_focus} onChange={set("build_focus")} /></Section>
      <Section title="How you want to progress"><Chips options={PROGRESSION} value={p.progression_style} onChange={set("progression_style")} /></Section>
      <Section title="Experience"><Chips options={EXPERIENCE} value={p.experience} onChange={set("experience")} /></Section>
      <Section title="Usual session length (min)"><Chips options={DURATIONS} value={p.default_duration} onChange={set("default_duration")} /></Section>
      <Section title="Equipment available"><Chips multi options={EQUIPMENT} value={p.equipment} onChange={set("equipment")} /></Section>
      <Section title="Benchmarks (1-rep max)">
        <p className="mb-3 text-xs text-muted-foreground">Workouts are fixed — your weights are calculated from these. Leave blank to use standard Rx loads.</p>
        <Chips options={["lb", "kg"]} value={p.units} onChange={(v) => setP({ ...p, units: v as string })} />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {BENCH.map((k) => (
            <label key={k} className="text-xs text-muted-foreground">{BLABEL[k]}
              <Input inputMode="decimal" className="mt-1 h-11" value={(p[k] as number | null) ?? ""}
                onChange={(e) => setP({ ...p, [k]: e.target.value === "" ? null : Number(e.target.value) })} />
            </label>
          ))}
        </div>
      </Section>
      <Section title="Injuries or limitations">
        <Textarea value={p.limitations ?? ""} onChange={(e) => set("limitations")(e.target.value)} placeholder="e.g. tight left shoulder, no running" />
      </Section>
      <Button variant="ink" size="xl" className="w-full" onClick={save}>{onboarded ? "Save" : "Continue to my week"}</Button>
    </div>
  );
}
