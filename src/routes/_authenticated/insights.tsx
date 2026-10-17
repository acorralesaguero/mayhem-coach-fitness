import { useTranslation } from "@/lib/i18n";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { benchmarkSuggestion } from "@/lib/coach-validation";
import { pageHead } from "@/lib/brand";
import { useCheckins, useWorkouts, useProfile, useRefresh } from "@/lib/data";
import { prBoard, sleepPattern, dateKey, weekStart } from "@/lib/progress";
import { LIFT_LABELS, type Lift, type WorkoutPlan } from "@/lib/program";
import { roundLoad } from "@/lib/program";
import { supabase } from "@/integrations/supabase/client";
import { Section } from "@/components/Chips";
import { PageSkeleton } from "@/components/PageSkeleton";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/_authenticated/insights")({
  head: () => pageHead("Insights", "Readiness, weekly training and your lift progress."),
  component: Insights,
});
function Insights() {
  const { t } = useTranslation();
  const { data: checks, isPending } = useCheckins(),
    { data: works } = useWorkouts(),
    { data: profile } = useProfile(),
    refresh = useRefresh();
  const [dismissed, setDismissed] = useState<string[]>([]);
  if (isPending || !checks || !works || !profile) return <PageSkeleton />;
  const history = works.map((w) => ({ ...w, plan: w.plan as unknown as WorkoutPlan })),
    prs = prBoard(history);
  const series = checks
    .slice(0, 14)
    .reverse()
    .map((c) => ({
      date: c.checkin_date.slice(5),
      energy: c.energy,
      sleep: Number(c.sleep_hours),
    }));
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const d = weekStart(new Date());
    d.setDate(d.getDate() - (7 - i) * 7);
    return {
      week: dateKey(d).slice(5),
      sessions: works.filter(
        (w) =>
          w.completed && dateKey(weekStart(new Date(w.workout_date + "T12:00:00"))) === dateKey(d),
      ).length,
    };
  });
  const pattern = sleepPattern(checks);
  return (
    <div>
      <h1 className="text-4xl">{t("Your training, in perspective")}</h1>
      <Section title={t("Energy and sleep · last 14 check-ins")}>
        {t(
          series.length ? (
            <div className="h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 15 }}>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis
                    yAxisId="energy"
                    domain={[0, 5]}
                    width={35}
                    label={{ value: "Energy", angle: -90, position: "insideLeft" }}
                  />
                  <YAxis
                    yAxisId="sleep"
                    orientation="right"
                    domain={[0, 12]}
                    width={40}
                    label={{ value: "Hours", angle: 90, position: "insideRight" }}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="energy"
                    dataKey="energy"
                    name="Energy"
                    stroke="var(--clay)"
                    isAnimationActive={false}
                  />
                  <Line
                    yAxisId="sleep"
                    dataKey="sleep"
                    name="Sleep hours"
                    stroke="var(--olive)"
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p>{t("No check-ins yet.")}</p>
          ),
        )}
      </Section>
      <Section title={t("Pattern")}>
        <p>{t(pattern ?? "Pattern unlocks after 14 check-ins")}</p>
      </Section>
      <Section title={t("Sessions per week · last 8 weeks")}>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeks} margin={{ left: -20, right: 10 }}>
              <XAxis dataKey="week" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="sessions" fill="var(--olive)" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Section>
      <Section title={t("PR board · estimated 1RM")}>
        {t(
          Object.entries(prs).length === 0 && (
            <p className="text-muted-foreground">
              {t("Log a lift with 1–10 reps to see your estimates.")}
            </p>
          ),
        )}
        {t(
          Object.entries(prs).map(([key, pr]) => {
            const lift = key as Lift,
              base = profile[lift],
              suggest = !dismissed.includes(key) && benchmarkSuggestion(pr.value, base);
            return (
              <div key={key} className="border-b py-4">
                <div className="flex flex-wrap justify-between gap-3">
                  <span>{t(LIFT_LABELS[lift])}</span>
                  <span className="font-semibold">
                    {t(pr.value.toFixed(1))} {t(profile.units)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t(pr.date)}
                  {t(" · Epley estimate")}
                </p>
                {t(
                  suggest && (
                    <div className="mt-4">
                      <p>
                        {t(" Your logged ")}
                        {t(LIFT_LABELS[lift].toLowerCase())}
                        {t(" suggests a 1RM of")}
                        {t(" ")}
                        {t(roundLoad(pr.value, profile.units === "kg" ? "kg" : "lb"))}{" "}
                        {t(profile.units)}
                        {t(". Update? ")}
                      </p>
                      <div className="mt-3 flex gap-3">
                        <Button
                          variant="ink"
                          onClick={async () => {
                            const { error } = await supabase
                              .from("profiles")
                              .update({
                                [lift]: roundLoad(pr.value, profile.units === "kg" ? "kg" : "lb"),
                              } as Partial<Record<Lift, number>>)
                              .eq("id", profile.id);
                            if (error) toast.error(error.message);
                            else await refresh();
                          }}
                        >
                          {t(" Update ")}
                        </Button>
                        <Button variant="outline" onClick={() => setDismissed([...dismissed, key])}>
                          {t(" Dismiss ")}
                        </Button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            );
          }),
        )}
      </Section>
      <Section title={t("Sessions")}>
        <ul className="divide-y">
          {t(
            works.map((w) => (
              <li key={w.id} className="flex flex-wrap justify-between gap-3 py-4">
                <div>
                  <p className="font-semibold">{t(w.title)}</p>
                  <p className="text-sm text-muted-foreground">
                    {t(w.workout_date)}
                    {t(" · ")}
                    {t(w.duration)}
                    {t(" min ")}
                  </p>
                </div>
                <span>{t(w.completed ? `RPE ${w.rpe ?? "—"}` : "Not completed")}</span>
              </li>
            )),
          )}
          {t(!works.length && <li>{t("No sessions yet.")}</li>)}
        </ul>
      </Section>
    </div>
  );
}
