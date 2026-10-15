import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { buildSession, type Tier, type WorkoutPlan } from "@/lib/program";
import { guessTimer } from "@/lib/timer";
import { Chips, Scale, Section } from "@/components/Chips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DAYS, DURATIONS, MUSCLE_GROUPS } from "@/lib/options";

export const Route = createFileRoute("/_authenticated/today")({
  head: () => ({ meta: [{ title: "Today — Forge" }, { name: "description", content: "Daily check-in and your coached session." }] }),
  component: TodayPage,
});

type Workout = { id: string; title: string; duration: number; muscle_groups: string[]; plan: WorkoutPlan; completed: boolean; rpe: number | null };

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function TodayPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(true);
  const [name, setName] = useState("");
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [duration, setDuration] = useState<30 | 60 | 90>(60);
  const [groups, setGroups] = useState<string[]>([]);
  const [isTrainingDay, setIsTrainingDay] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    const dow = new Date().getDay();
    const [{ data: prof }, { data: day }, { data: w }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("week_plan").select("*").eq("user_id", user.id).eq("day_of_week", dow).maybeSingle(),
      supabase.from("workouts").select("*").eq("user_id", user.id).eq("workout_date", todayStr()).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);
    setOnboarded(!!prof?.onboarded);
    setName(prof?.display_name ?? "");
    const dur = (day?.duration ?? prof?.default_duration ?? 60) as 30 | 60 | 90;
    setDuration([30, 60, 90].includes(dur) ? dur : 60);
    setGroups(day?.muscle_groups ?? []);
    setIsTrainingDay(day ? day.is_training : true);
    setWorkout(w ? ({ ...w, plan: w.plan as unknown as WorkoutPlan } as Workout) : null);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  if (!onboarded) {
    return (
      <div className="space-y-6 pt-10">
        <p className="eyebrow">Welcome</p>
        <h1 className="text-5xl leading-none">First, tell your coach about you.</h1>
        <p className="text-sm text-muted-foreground">Body type, goals, equipment and how you like to progress — two minutes.</p>
        <Button asChild variant="ink" size="xl" className="w-full"><Link to="/profile">Build my profile</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header>
        <p className="eyebrow">{DAYS[new Date().getDay()]} · {new Date().toLocaleDateString(undefined, { month: "long", day: "numeric" })}</p>
        <h1 className="text-4xl">{workout ? workout.title : `Morning, ${name || "athlete"}.`}</h1>
      </header>
      {workout ? (
        <WorkoutView w={workout} onChange={load} />
      ) : (
        <CheckIn duration={duration} setDuration={setDuration} groups={groups} setGroups={setGroups}
          restDay={!isTrainingDay} onDone={load} />
      )}
    </div>
  );
}

function CheckIn({ duration, setDuration, groups, setGroups, restDay, onDone }: {
  duration: 30 | 60 | 90; setDuration: (d: 30 | 60 | 90) => void; groups: string[]; setGroups: (g: string[]) => void; restDay: boolean; onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [tier, setTier] = useState<Tier>("rx");
  const [c, setC] = useState({ energy: 3, sleep_hours: 7, sleep_quality: 3, stress: 3, soreness: 2, motivation: 3, day_outlook: "", notes: "" });
  const set = (k: keyof typeof c) => (v: number | string) => setC({ ...c, [k]: v });

  async function submit() {
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in again.");
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      const { data: ck, error: cErr } = await supabase.from("checkins")
        .insert({ ...c, user_id: user.id, available_minutes: duration }).select().single();
      if (cErr) throw cErr;
      const plan = buildSession({ date: new Date(), duration, groups, benchmarks: prof ?? {}, readiness: c, tier });
      const { error } = await supabase.from("workouts").insert({
        user_id: user.id, checkin_id: ck.id, workout_date: todayStr(), duration, muscle_groups: groups, title: plan.title, plan: plan as never,
      });
      if (error) throw error;
      onDone();
    } catch (e) {
      toast.error((e as Error).message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {restDay ? "Today is a planned rest day — but if you want to move, check in and your coach will keep it smart." : "Check in first. Your coach shapes today's session around how you're doing."}
      </p>
      <Section title="How's your day looking?">
        <Input value={c.day_outlook} onChange={(e) => set("day_outlook")(e.target.value)} placeholder="Busy, calm, travelling, big meeting at 3…" className="h-12" />
      </Section>
      <Section title="Readiness">
        <div className="space-y-5">
          <Scale label="Energy" low="drained" high="charged" value={c.energy} onChange={set("energy")} />
          <Scale label="Sleep quality" low="poor" high="deep" value={c.sleep_quality} onChange={set("sleep_quality")} />
          <div>
            <div className="flex items-baseline justify-between"><span className="text-sm font-medium">Hours slept</span><span className="font-display text-2xl">{c.sleep_hours}h</span></div>
            <input type="range" min={3} max={11} step={0.5} value={c.sleep_hours} onChange={(e) => set("sleep_hours")(Number(e.target.value))} className="mt-2 w-full accent-[var(--clay)]" />
          </div>
          <Scale label="Stress" low="calm" high="maxed" value={c.stress} onChange={set("stress")} />
          <Scale label="Soreness" low="fresh" high="wrecked" value={c.soreness} onChange={set("soreness")} />
          <Scale label="Motivation" low="low" high="fired up" value={c.motivation} onChange={set("motivation")} />
        </div>
      </Section>
      <Section title="Session">
        <div className="space-y-4">
          <Chips options={DURATIONS} value={duration} onChange={setDuration} />
          <Chips multi options={MUSCLE_GROUPS} value={groups} onChange={setGroups} />
          <div className="flex gap-2">
            {(["rx", "scaled"] as const).map((t) => (
              <button key={t} type="button" className="chip" data-active={tier === t} onClick={() => setTier(t)}>{t === "rx" ? "Rx" : "Scaled"}</button>
            ))}
          </div>
        </div>
      </Section>
      <Section title="Anything else?">
        <Textarea value={c.notes} onChange={(e) => set("notes")(e.target.value)} placeholder="Niggles, nutrition, mood…" />
      </Section>
      <Button variant="clay" size="xl" className="w-full" disabled={busy} onClick={submit}>
        {busy ? "Your coach is programming…" : `Build my ${duration}-minute session`}
      </Button>
    </div>
  );
}

function WorkoutView({ w, onChange }: { w: Workout; onChange: () => void }) {
  const [rpe, setRpe] = useState<number>(w.rpe ?? 7);
  const [feedback, setFeedback] = useState("");
  const p = w.plan;

  async function complete() {
    const { error } = await supabase.from("workouts").update({ completed: true, rpe, feedback }).eq("id", w.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Logged. Great work.");
    onChange();
  }
  async function redo() {
    await supabase.from("workouts").delete().eq("id", w.id);
    onChange();
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="chip" data-active="true">{w.duration} min</span>
        <span className="chip capitalize">{p.intensity}</span>
        {w.muscle_groups.map((g) => <span key={g} className="chip">{g}</span>)}
      </div>
      <blockquote className="surface border-l-4 !border-l-clay p-5 font-display text-xl italic leading-snug">
        {p.coach_note}
      </blockquote>
      {p.blocks.map((b, i) => {
        const t = guessTimer(b.format, b.minutes);
        return (
          <section key={i} className="surface p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <p className="eyebrow">{b.minutes} min · {b.format}</p>
                <h2 className="mt-1 text-2xl">{b.name}</h2>
              </div>
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link to="/timer" search={t}><Timer /> Timer</Link>
              </Button>
            </div>
            <ul className="mt-4 divide-y">
              {b.exercises.map((e, j) => (
                <li key={j} className="py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-medium">{e.name}</span>
                    <span className="shrink-0 text-sm text-clay">{e.prescription}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{e.cue}{e.rest ? ` · Rest ${e.rest}` : ""}</p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <Section title="Cooldown"><p className="text-sm">{p.cooldown}</p></Section>
      {w.completed ? (
        <p className="text-center text-sm text-muted-foreground">Completed · RPE {w.rpe}</p>
      ) : (
        <Section title="Finish & log">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm"><span>Effort (RPE)</span><span className="font-display text-2xl">{rpe}</span></div>
              <input type="range" min={1} max={10} value={rpe} onChange={(e) => setRpe(Number(e.target.value))} className="w-full accent-[var(--clay)]" />
            </div>
            <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="How did it feel? Weights used?" />
            <Button variant="ink" size="xl" className="w-full" onClick={complete}>Mark complete</Button>
            <button className="w-full text-xs text-muted-foreground" onClick={redo}>Redo check-in & regenerate</button>
          </div>
        </Section>
      )}
    </div>
  );
}
