import { useTranslation } from "@/lib/i18n";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWeekPlan, useRefresh, useProfile } from "@/lib/data";
import { buildSession } from "@/lib/program";
import { pageHead } from "@/lib/brand";
import { PageSkeleton } from "@/components/PageSkeleton";
import { useAuth } from "@/lib/use-auth";
import { Chips } from "@/components/Chips";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DAYS, DURATIONS, MUSCLE_GROUPS } from "@/lib/options";

export const Route = createFileRoute("/_authenticated/week")({
  head: () => pageHead("Weekly program", "Choose training days and muscle focus for each day."),
  component: WeekPage,
});

type Day = { day_of_week: number; is_training: boolean; muscle_groups: string[]; duration: number };

function WeekPage() {
  const { t, tx, tError } = useTranslation();
  const { user } = useAuth();
  const [days, setDays] = useState<Day[] | null>(null);
  const [open, setOpen] = useState<number | null>(new Date().getDay());

  const { data: week } = useWeekPlan();
  const { data: profile } = useProfile();
  const refresh = useRefresh();
  useEffect(() => {
    if (week)
      setDays(
        DAYS.map(
          (_, i) =>
            week.find((d) => d.day_of_week === i) ?? {
              day_of_week: i,
              is_training: false,
              muscle_groups: [],
              duration: 60,
            },
        ),
      );
  }, [week]);

  if (!days || !user) return <PageSkeleton />;
  const update = (i: number, patch: Partial<Day>) =>
    setDays(days.map((d) => (d.day_of_week === i ? { ...d, ...patch } : d)));

  async function save() {
    if (!days || !user) return;
    const { error } = await supabase.from("week_plan").upsert(
      days.map((d) => ({ ...d, suggested: false, user_id: user.id })),
      { onConflict: "user_id,day_of_week" },
    );
    if (error) toast.error(tError(error.message));
    else {
      toast.success(t("Week saved"));
      await refresh();
    }
  }

  const count = days.filter((d) => d.is_training).length;
  const preview = (d: Day) => {
    const date = new Date();
    date.setDate(date.getDate() + ((d.day_of_week - date.getDay() + 7) % 7));
    return buildSession({
      date,
      duration: d.duration === 30 ? 30 : d.duration === 90 ? 90 : 60,
      groups: d.muscle_groups,
      benchmarks: profile ?? {},
      readiness: { energy: 3, sleep_hours: 7, sleep_quality: null, stress: null, soreness: 3, motivation: null },
      tier: "scaled",
      equipment: profile?.equipment ?? [],
      experience: profile?.experience ?? null,
    });
  };
  return (
    <div className="space-y-4">
      <header>
        <p className="eyebrow">{t("Weekly program")}</p>
        <h1 className="text-4xl">{t("Shape your week")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {tx(count === 1 ? "{count} training day" : "{count} training days", { count })}
          {t(" · tap a day to set its focus ")}
        </p>
      </header>
      {t(
        week?.some((d) => d.suggested) && (
          <p className="text-sm text-olive">{t("Suggested for you — edit anything")}</p>
        ),
      )}
      <div className="space-y-2">
        {t(
          days.map((d) => (
            <div key={d.day_of_week} className="surface overflow-hidden">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4">
                <Button
                  variant="ghost"
                  className="h-auto min-h-11 min-w-0 flex-col items-start gap-1 rounded-xl text-left"
                  onClick={() => setOpen(open === d.day_of_week ? null : d.day_of_week)}
                >
                  <div className="text-lg font-semibold leading-normal">{t(DAYS[d.day_of_week])}</div>
                  <div className="w-full whitespace-normal text-sm text-muted-foreground">
                    {t(
                      d.is_training
                        ? `${d.duration} min · ${d.muscle_groups.join(", ") || "choose focus"}`
                        : "Rest / active recovery",
                    )}
                  </div>
                </Button>
                <Switch
                  aria-label={tx("Train on {day}", { day: t(DAYS[d.day_of_week] ?? "") })}
                  checked={d.is_training}
                  onCheckedChange={(v) => {
                    update(d.day_of_week, { is_training: v });
                    if (v) setOpen(d.day_of_week);
                  }}
                />
              </div>
              {t(
                d.is_training && (
                  <details className="border-t px-4 py-2">
                    <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">
                      {t(preview(d).title)}
                    </summary>
                    <div className="space-y-3 pb-3">
                      {preview(d).blocks.map((b, bi) => (
                        <div key={bi}>
                          <p className="eyebrow">
                            {t(b.name)} · {t(b.minutes)}
                            {t(" min · ")}
                            {t(b.format)}
                          </p>
                          <ul className="mt-1 text-sm">
                            {b.exercises.map((e, ei) => (
                              <li key={ei} className="flex justify-between gap-2">
                                <span>{t(e.name)}</span>
                                <span className="text-right text-clay">{t(e.prescription)}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </details>
                ),
              )}
              {t(
                open === d.day_of_week && d.is_training && (
                  <div className="space-y-4 border-t p-4">
                    <div>
                      <p className="eyebrow mb-2">{t("Focus")}</p>
                      <Chips
                        multi
                        options={MUSCLE_GROUPS}
                        value={d.muscle_groups}
                        onChange={(v: string[]) => update(d.day_of_week, { muscle_groups: v })}
                      />
                    </div>
                    <div>
                      <p className="eyebrow mb-2">{t("Minutes")}</p>
                      <Chips
                        options={DURATIONS}
                        value={d.duration}
                        onChange={(v: number) => update(d.day_of_week, { duration: v })}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          )),
        )}
      </div>
      <Button variant="ink" size="xl" className="w-full" onClick={save}>
        {t(" Save week ")}
      </Button>
    </div>
  );
}
