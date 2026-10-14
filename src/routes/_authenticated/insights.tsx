import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Section } from "@/components/Chips";

export const Route = createFileRoute("/_authenticated/insights")({
  head: () => ({ meta: [{ title: "Insights — Forge" }, { name: "description", content: "Your readiness trends and training history." }] }),
  component: InsightsPage,
});

type C = { checkin_date: string; energy: number; sleep_hours: number; sleep_quality: number; stress: number; soreness: number; motivation: number };
type W = { workout_date: string; title: string; duration: number; completed: boolean; rpe: number | null };

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

function InsightsPage() {
  const { user } = useAuth();
  const [checks, setChecks] = useState<C[]>([]);
  const [works, setWorks] = useState<W[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("checkins").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(28).then(({ data }) => setChecks((data ?? []) as C[]));
    supabase.from("workouts").select("workout_date,title,duration,completed,rpe").eq("user_id", user.id).order("created_at", { ascending: false }).limit(30).then(({ data }) => setWorks((data ?? []) as W[]));
  }, [user]);

  const recent = checks.slice(0, 7);
  const stats = [
    { label: "Energy", v: avg(recent.map((c) => c.energy)).toFixed(1), unit: "/5" },
    { label: "Sleep", v: avg(recent.map((c) => Number(c.sleep_hours))).toFixed(1), unit: "h" },
    { label: "Stress", v: avg(recent.map((c) => c.stress)).toFixed(1), unit: "/5" },
    { label: "Soreness", v: avg(recent.map((c) => c.soreness)).toFixed(1), unit: "/5" },
  ];
  const done = works.filter((w) => w.completed);
  const minutes = done.reduce((a, w) => a + w.duration, 0);

  // simple insight: energy on nights with 7h+ vs less
  const good = checks.filter((c) => Number(c.sleep_hours) >= 7).map((c) => c.energy);
  const poor = checks.filter((c) => Number(c.sleep_hours) < 7).map((c) => c.energy);
  const series = [...checks].reverse().slice(-14);

  return (
    <div className="space-y-4">
      <header><p className="eyebrow">Insights</p><h1 className="text-4xl">What your body is telling us</h1></header>
      {checks.length === 0 ? (
        <p className="text-sm text-muted-foreground">Check in a few days and your trends will appear here.</p>
      ) : (<>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="surface p-4">
              <p className="eyebrow">{s.label} · 7d</p>
              <p className="mt-1 font-display text-4xl">{s.v}<span className="text-base text-muted-foreground">{s.unit}</span></p>
            </div>
          ))}
        </div>
        <Section title="Energy vs sleep · last 14 check-ins">
          <div className="flex h-32 items-end gap-1.5">
            {series.map((c, i) => (
              <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
                <div className="w-full rounded-t bg-clay" style={{ height: `${(c.energy / 5) * 100}%` }} />
                <div className="w-full rounded bg-olive/60" style={{ height: `${(Number(c.sleep_hours) / 11) * 40}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-clay" />Energy</span>
            <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-olive" />Sleep</span>
          </div>
        </Section>
        {good.length > 0 && poor.length > 0 && (
          <Section title="Pattern">
            <p className="font-display text-xl leading-snug">
              After 7+ hours of sleep your energy averages <b>{avg(good).toFixed(1)}</b>, versus <b>{avg(poor).toFixed(1)}</b> on shorter nights.
            </p>
          </Section>
        )}
      </>)}
      <Section title={`Sessions · ${done.length} completed · ${minutes} min`}>
        <ul className="divide-y">
          {works.map((w, i) => (
            <li key={i} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-3 text-sm">
              <div className="min-w-0"><p className="truncate font-medium">{w.title}</p><p className="text-xs text-muted-foreground">{w.workout_date} · {w.duration} min</p></div>
              <span className="text-xs text-muted-foreground">{w.completed ? `RPE ${w.rpe ?? "–"}` : "Not logged"}</span>
            </li>
          ))}
          {works.length === 0 && <li className="py-3 text-sm text-muted-foreground">No sessions yet.</li>}
        </ul>
      </Section>
    </div>
  );
}
