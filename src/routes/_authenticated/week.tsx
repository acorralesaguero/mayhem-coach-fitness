import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { Chips } from "@/components/Chips";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DAYS, DURATIONS, MUSCLE_GROUPS } from "@/lib/options";

export const Route = createFileRoute("/_authenticated/week")({
  head: () => ({ meta: [{ title: "Weekly program — Forge" }, { name: "description", content: "Choose training days and muscle focus for each day." }] }),
  component: WeekPage,
});

type Day = { day_of_week: number; is_training: boolean; muscle_groups: string[]; duration: number };

function WeekPage() {
  const { user } = useAuth();
  const [days, setDays] = useState<Day[] | null>(null);
  const [open, setOpen] = useState<number | null>(new Date().getDay());

  useEffect(() => {
    if (!user) return;
    supabase.from("week_plan").select("*").eq("user_id", user.id).then(({ data }) => {
      setDays(DAYS.map((_, i) => {
        const d = data?.find((r) => r.day_of_week === i);
        return d ? { day_of_week: i, is_training: d.is_training, muscle_groups: d.muscle_groups, duration: d.duration }
          : { day_of_week: i, is_training: false, muscle_groups: [], duration: 60 };
      }));
    });
  }, [user]);

  if (!days || !user) return <p className="text-muted-foreground">Loading…</p>;
  const update = (i: number, patch: Partial<Day>) => setDays(days.map((d) => (d.day_of_week === i ? { ...d, ...patch } : d)));

  async function save() {
    const { error } = await supabase.from("week_plan").upsert(days!.map((d) => ({ ...d, user_id: user!.id })), { onConflict: "user_id,day_of_week" });
    if (error) toast.error(error.message); else toast.success("Week saved");
  }

  const count = days.filter((d) => d.is_training).length;
  return (
    <div className="space-y-4">
      <header>
        <p className="eyebrow">Weekly program</p>
        <h1 className="text-4xl">Shape your week</h1>
        <p className="mt-1 text-sm text-muted-foreground">{count} training {count === 1 ? "day" : "days"} · tap a day to set its focus</p>
      </header>
      <div className="space-y-2">
        {days.map((d) => (
          <div key={d.day_of_week} className="surface overflow-hidden">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4">
              <button className="min-w-0 text-left" onClick={() => setOpen(open === d.day_of_week ? null : d.day_of_week)}>
                <div className="font-display text-2xl leading-none">{DAYS[d.day_of_week]}</div>
                <div className="mt-1 truncate text-xs text-muted-foreground">
                  {d.is_training ? `${d.duration} min · ${d.muscle_groups.join(", ") || "choose focus"}` : "Rest / active recovery"}
                </div>
              </button>
              <Switch checked={d.is_training} onCheckedChange={(v) => { update(d.day_of_week, { is_training: v }); if (v) setOpen(d.day_of_week); }} />
            </div>
            {open === d.day_of_week && d.is_training && (
              <div className="space-y-4 border-t p-4">
                <div><p className="eyebrow mb-2">Focus</p><Chips multi options={MUSCLE_GROUPS} value={d.muscle_groups} onChange={(v: string[]) => update(d.day_of_week, { muscle_groups: v })} /></div>
                <div><p className="eyebrow mb-2">Minutes</p><Chips options={DURATIONS} value={d.duration} onChange={(v: number) => update(d.day_of_week, { duration: v })} /></div>
              </div>
            )}
          </div>
        ))}
      </div>
      <Button variant="ink" size="xl" className="w-full" onClick={save}>Save week</Button>
    </div>
  );
}
