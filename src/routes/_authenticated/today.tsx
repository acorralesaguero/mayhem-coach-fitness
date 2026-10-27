import { useTranslation } from "@/lib/i18n";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Repeat2, Send, Timer, Copy } from "lucide-react";
import { adjustWorkout } from "@/lib/coach.functions";
import {
  useProfile,
  useWeekPlan,
  useTodayWorkout,
  useWorkouts,
  useRefresh,
  checkinOptions,
} from "@/lib/data";
import { pendingSessionValid } from "@/lib/coach-validation";
import { pageHead } from "@/lib/brand";
import {
  buildSession,
  adaptExercise,
  type PlanExercise,
  type WorkoutPlan,
  type Tier,
} from "@/lib/program";
import { dateKey, parseNumeric, prefillActual, streak, prBoard, type HistoryWorkout } from "@/lib/progress";
import { swapOptions } from "@/lib/swaps";
import { guessTimer } from "@/lib/timer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { WorkoutBlocks } from "@/components/WorkoutBlocks";
import { PageSkeleton } from "@/components/PageSkeleton";
import { Chips, Scale, Section } from "@/components/Chips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DAYS, DURATIONS, EQUIPMENT, MUSCLE_GROUPS } from "@/lib/options";
import type { Database } from "@/integrations/supabase/types";
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Workout = Database["public"]["Tables"]["workouts"]["Row"];
export const Route = createFileRoute("/_authenticated/today")({
  head: () => pageHead("Today", "Daily readiness check-in and your training session."),
  component: TodayPage,
});
function TodayPage() {
  const { t, tx, tError, language, locale } = useTranslation();
  const { data: profile, error: profileError } = useProfile(),
    { data: week } = useWeekPlan(),
    { data: workout, isPending } = useTodayWorkout(),
    { data: works } = useWorkouts(),
    refresh = useRefresh(),
    navigate = useNavigate(),
    adjust = useServerFn(adjustWorkout);
  const client = useQueryClient();
  const [importing, setImporting] = useState(false),
    [importChecked, setImportChecked] = useState(false);
  useEffect(() => {
    if (profile && (!profile.onboarded || !profile.par_q_ack_at)) navigate({ to: "/onboarding" });
  }, [profile, navigate]);
  useEffect(() => {
    if (!profile) return;
    const timer = setTimeout(() => client.prefetchQuery(checkinOptions(profile.id)), 1200);
    return () => clearTimeout(timer);
  }, [profile, client]);
  useEffect(() => {
    if (!profile?.onboarded || !profile.par_q_ack_at || isPending || importChecked) return;
    setImportChecked(true);
    try {
      const raw = localStorage.getItem("forge:pending-session");
      if (!raw) return;
      const pending = JSON.parse(raw);
      if (
        workout ||
        !pendingSessionValid(pending.timestamp) ||
        !pending.plan?.blocks ||
        ![30, 60, 90].includes(pending.duration)
      ) {
        localStorage.removeItem("forge:pending-session");
        return;
      }
      setImporting(true);
      Promise.resolve(
        supabase.rpc("create_checkin_and_workout", {
          checkin_data: null as never,
          workout_data: {
            plan: pending.plan,
            title: pending.plan.title,
            duration: pending.duration,
            muscle_groups: ["Full body"],
            date: dateKey(new Date()),
          },
        }),
      )
        .then(async ({ data: id, error }) => {
          if (error) {
            toast.error(t("Couldn't save your sample session. Please check in below."));
            return;
          }
          localStorage.removeItem("forge:pending-session");
          if (id && profile.limitations)
            try {
              await adjust({
                data: {
                  workoutId: id,
                  language,
                  message: ("Standing limitations: " + profile.limitations).slice(0, 500),
                },
              });
            } catch {
              toast.error(t("Couldn't apply your limitations automatically — use 'Ask your coach to adjust'."));
            }
          await refresh();
        })
        .finally(() => setImporting(false));
    } catch {
      /* Invalid or disabled storage. */
    }
  }, [profile, workout, isPending, importChecked, adjust, refresh]);
  if (profileError)
    return <p role="alert">{t("Your training data could not load. Please try again.")}</p>;
  if (!profile || isPending || importing || !profile.onboarded || !profile.par_q_ack_at)
    return <PageSkeleton />;
  const day = week?.find((d) => d.day_of_week === new Date().getDay());
  return (
    <div className="space-y-4">
      <header>
        <p className="eyebrow">
          {t(DAYS[new Date().getDay()])}
          {t(" ·")}
          {t(" ")}
          {t(
            new Date().toLocaleDateString(locale, {
              month: "long",
              day: "numeric",
            }),
          )}
        </p>
        <h1 className="mt-2 text-4xl">
          {workout ? t(workout.title) : tx("Morning, {name}.", { name: profile.display_name || t("athlete") })}
        </h1>
      </header>
      {t(
        workout ? (
          <WorkoutView
            w={workout}
            profile={profile}
            works={works ?? []}
            week={week ?? []}
            onChange={refresh}
          />
        ) : (
          <CheckIn
            profile={profile}
            initialDuration={day?.duration ?? profile.default_duration}
            initialGroups={day?.muscle_groups ?? []}
            restDay={day ? !day.is_training : false}
            recentTitles={(works ?? []).slice(0, 20).map((w) => w.title)}
            onDone={refresh}
          />
        ),
      )}
    </div>
  );
}
function CheckIn({
  profile,
  initialDuration,
  initialGroups,
  restDay,
  recentTitles,
  onDone,
}: {
  profile: Profile;
  initialDuration: number;
  initialGroups: string[];
  restDay: boolean;
  recentTitles: string[];
  onDone: () => Promise<void>;
}) {
  const { t, tx, tError, language, locale } = useTranslation();
  const [duration, setDuration] = useState<30 | 60 | 90>(
      initialDuration === 30 ? 30 : initialDuration === 90 ? 90 : 60,
    ),
    [groups, setGroups] = useState(initialGroups),
    [energy, setEnergy] = useState<number | null>(null),
    [soreness, setSoreness] = useState<number | null>(null),
    [sleep, setSleep] = useState<number | null>(null),
    [quality, setQuality] = useState<number | null>(null),
    [stress, setStress] = useState<number | null>(null),
    [motivation, setMotivation] = useState<number | null>(null),
    [notes, setNotes] = useState(""),
    [tier, setTier] = useState<Tier>("scaled"),
    [tools, setTools] = useState<string[]>(profile.equipment?.length ? profile.equipment : ["Full gym"]),
    [busy, setBusy] = useState(false);
  const adjust = useServerFn(adjustWorkout);
  const checkedIn = energy !== null && soreness !== null && sleep !== null;
  async function submit(quick = false) {
    if ((!quick && !checkedIn) || busy) return;
    setBusy(true);
    try {
      const readiness = {
        energy: energy ?? 3,
        soreness: soreness ?? 3,
        sleep_hours: sleep ?? 7,
        sleep_quality: quality,
        stress,
        motivation,
      };
      const plan = buildSession({
        date: new Date(),
        duration,
        groups,
        benchmarks: profile,
        readiness,
        tier,
        equipment: tools,
        experience: profile.experience,
        recentTitles,
      });
      const { data: id, error } = await supabase.rpc("create_checkin_and_workout", {
        checkin_data: quick && !checkedIn ? (null as never) : { ...readiness, notes },
        workout_data: {
          plan: plan as never,
          title: plan.title,
          duration,
          muscle_groups: groups,
          date: dateKey(new Date()),
        },
      });
      if (error) throw error;
      if (id) {
        const message = [
          profile.limitations && `Standing limitations: ${profile.limitations}`,
          notes.trim(),
        ]
          .filter(Boolean)
          .join(". ")
          .slice(0, 500);
        if (message.length >= 2)
          try {
            await adjust({ data: { workoutId: id, language, message } });
          } catch {
            toast.error(t("Couldn't apply your limitations automatically — use 'Ask your coach to adjust'."));
          }
      }
      await onDone();
    } catch (e) {
      toast.error(tError((e as Error).message));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      {t(
        restDay && (
          <p className="text-muted-foreground">
            {t(" Planned rest day. Choose mobility for an easy recovery session. ")}
          </p>
        ),
      )}
      <Button
        variant="clay"
        size="xl"
        className="my-4 w-full"
        disabled={busy}
        onClick={() => submit(true)}
      >
        {busy ? t("Preparing your session…") : tx("Start today's {minutes}-minute workout", { minutes: duration })}
      </Button>
      <p className="text-sm text-muted-foreground">
        {groups.length ? groups.map((g) => t(g)).join(", ") : t("Planned focus")} · {tools.map((g) => t(g)).join(", ")}
      </p>
      <details className="mt-6 border-y py-3">
        <summary className="min-h-11 cursor-pointer font-semibold">{t("Check in & customize")}</summary>
      <Section title={t("Readiness")}>
        <div className="space-y-5">
          <Scale label="Energy" low="drained" high="charged" value={energy} onChange={setEnergy} />
          <Scale
            label="Soreness"
            low="fresh"
            high="very sore"
            value={soreness}
            onChange={setSoreness}
          />
          <label className="block">
            <div className="flex justify-between">
              <span>{t("Hours slept")}</span>
              <span>{t(sleep === null ? "—" : `${sleep} hours`)}</span>
            </div>
            <input
              aria-label={t("Hours slept")}
              aria-valuetext={t(sleep === null ? "Not selected" : `${sleep} hours`)}
              type="range"
              min={0}
              max={12}
              step={0.5}
              value={sleep ?? 7}
              onPointerDown={(e) => {
                if (sleep === null) setSleep(Number(e.currentTarget.value));
              }}
              onKeyDown={(e) => {
                if (sleep === null) setSleep(Number(e.currentTarget.value));
              }}
              onChange={(e) => setSleep(Number(e.target.value))}
              className="mt-3 min-h-11 w-full accent-clay"
            />
          </label>
        </div>
        <details className="mt-5">
          <summary className="min-h-11 cursor-pointer">{t("More detail")}</summary>
          <div className="space-y-5">
            <Scale
              label="Sleep quality"
              low="poor"
              high="deep"
              value={quality}
              onChange={setQuality}
            />
            <Scale label="Stress" low="calm" high="high" value={stress} onChange={setStress} />
            <Scale
              label="Motivation"
              low="low"
              high="high"
              value={motivation}
              onChange={setMotivation}
            />
          </div>
        </details>
      </Section>
      <Section title={t("Session")}>
        <Chips options={DURATIONS} value={duration} onChange={setDuration} />
        <p className="eyebrow mb-2 mt-4">{t("Focus today")}</p>
        <Chips multi options={MUSCLE_GROUPS} value={groups} onChange={setGroups} />
        <p className="eyebrow mb-2 mt-4">{t("Equipment available today")}</p>
        <Chips multi options={EQUIPMENT} value={tools} onChange={(v: string[]) => setTools(v.length ? v : ["Bodyweight only"])} />
        <Chips label="Workout tier" options={["scaled", "rx"]} value={tier} onChange={setTier} />
      </Section>
      <Section title={t("Anything to account for today?")}>
        <Textarea
          maxLength={500}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("Equipment, space, or something your coach should know")}
        />
        <p className="mt-2 text-sm text-muted-foreground">{t("Forge is not medical advice.")}</p>
      </Section>
      <Button
        variant="clay"
        size="xl"
        className="my-5 w-full"
        disabled={busy || !checkedIn}
        onClick={() => submit()}
      >
        {busy ? t("Preparing your session…") : tx("Get today's {minutes}-minute workout", { minutes: duration })}
      </Button>
      </details>
    </div>
  );
}
function WorkoutView({
  w,
  profile,
  works,
  week,
  onChange,
}: {
  w: Workout;
  profile: Profile;
  works: Workout[];
  week: Database["public"]["Tables"]["week_plan"]["Row"][];
  onChange: () => Promise<void>;
}) {
  const { t, tx, tError, language, locale } = useTranslation();
  const initial = w.plan as unknown as WorkoutPlan;
  const [plan, setPlan] = useState(initial),
    [rpe, setRpe] = useState(w.rpe ?? 7),
    [feedback, setFeedback] = useState(w.feedback ?? ""),
    [note, setNote] = useState(""),
    [busy, setBusy] = useState(false),
    [openSwap, setOpenSwap] = useState<string | null>(null);
  const adjust = useServerFn(adjustWorkout);
  useEffect(() => setPlan(w.plan as unknown as WorkoutPlan), [w.plan]);
  async function savePlan(next: WorkoutPlan) {
    setPlan(next);
    const { error } = await supabase
      .from("workouts")
      .update({ plan: next as never })
      .eq("id", w.id)
      .eq("user_id", profile.id);
    if (error) toast.error(tError(error.message));
    else await onChange();
  }
  function patchEx(i: number, j: number, patch: Partial<PlanExercise>) {
    return {
      ...plan,
      blocks: plan.blocks.map((b, bi) =>
        bi !== i
          ? b
          : { ...b, exercises: b.exercises.map((e, ei) => (ei !== j ? e : { ...e, ...patch })) },
      ),
    };
  }
  async function ask() {
    if (note.trim().length < 2) return;
    setBusy(true);
    try {
      await adjust({ data: { workoutId: w.id, language, message: note.trim() } });
      setNote("");
      await onChange();
      toast.success(t("Session adjusted"));
    } catch (e) {
      toast.error(tError((e as Error).message));
    } finally {
      setBusy(false);
    }
  }
  const history = works.map((x) => ({ ...x, plan: x.plan as unknown as WorkoutPlan }));
  const past = history.filter((x) => x.id !== w.id);
  const fill = (e: PlanExercise) => prefillActual(e, past, profile.units ?? "lb");
  const prs = prBoard(history);
  const newPrs = Object.entries(prs).filter(([, pr]) => pr.date === w.workout_date);
  const planned = week.filter((d) => d.is_training).length;
  const currentStreak = streak(history, planned);
  let next = "Rest day";
  for (let i = 1; i <= 7; i++) {
    const d = week.find((d) => d.is_training && d.day_of_week === (new Date().getDay() + i) % 7);
    if (d) {
      next = `${DAYS[d.day_of_week]} · ${d.muscle_groups.join(", ") || "Full body"}`;
      break;
    }
  }
  const streakLabel = tx(currentStreak === 1 ? "{count} week streak" : "{count} weeks streak", { count: currentStreak });
  const phaseNote = plan.coach_note.match(/^(.+?) phase(?:, (.+?))?\. (.+)$/);
  const coachNote = phaseNote
    ? tx(phaseNote[2] ? "{phase} phase, {wave}. {note}" : "{phase} phase. {note}", {
        phase: t(phaseNote[1] ?? ""),
        wave: t(phaseNote[2] ?? ""),
        note: t(phaseNote[3] ?? ""),
      })
    : t(plan.coach_note);
  const recap = [
    t(w.title),
    `${w.duration} min · RPE ${w.rpe ?? rpe}`,
    ...plan.blocks.filter((b) => b.result).map((b) => `${t(b.name)}: ${t(b.result)}`),
    streakLabel,
    `${t("Next:")} ${t(next)}`,
  ].join("\n");
  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {t(w.duration)}
        {t(" min · ")}
        {t(plan.intensity)}
      </p>
      <blockquote className="my-5 border-l-2 border-clay pl-4 text-base leading-relaxed text-muted-foreground">
        {coachNote}
      </blockquote>
      {t(
        plan.limitations_applied && (
          <p className="text-sm text-muted-foreground">
            {t(" Limitations applied: ")}
            {plan.limitations_applied}
          </p>
        ),
      )}
      {t(
        !w.completed && (
          <Section title={t("Ask your coach to adjust")}>
            <div className="flex gap-2">
              <Input
                aria-label={t("Coach adjustment note")}
                maxLength={500}
                value={note}
                disabled={busy}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("No rower, limited space…")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") ask();
                }}
              />
              <Button
                variant="ink"
                size="icon"
                className="h-11 w-11 shrink-0"
                disabled={busy || note.trim().length < 2}
                onClick={ask}
                aria-label={t("Send to coach")}
              >
                <Send />
              </Button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("Forge is not medical advice.")}
            </p>
          </Section>
        ),
      )}
      <WorkoutBlocks
        plan={plan}
        blockTools={(i) => (
          <div className="flex flex-col gap-2">
            <Button asChild variant="outline" className="min-h-11">
              <Link
                to="/timer"
                search={{
                  ...guessTimer(plan.blocks[i]?.format ?? "", plan.blocks[i]?.minutes ?? 10),
                  w: w.id,
                  b: i,
                }}
              >
                <Timer />
                {t(" Timer ")}
              </Link>
            </Button>
            {t(
              !w.completed && /for time|chipper/i.test(plan.blocks[i]?.format ?? "") && (
                <Input
                  className="w-36"
                  aria-label={tx("{block} finish time", { block: t(plan.blocks[i]?.name ?? "") })}
                  placeholder={t("Finish time mm:ss")}
                  defaultValue={plan.blocks[i]?.result ?? ""}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value && !/^\d{1,3}:[0-5]\d$/.test(value)) {
                      toast.error(t("Use mm:ss for finish time"));
                      return;
                    }
                    savePlan({
                      ...plan,
                      blocks: plan.blocks.map((b, j) => (j === i ? { ...b, result: value } : b)),
                    });
                  }}
                />
              ),
            )}
          </div>
        )}
        exerciseTools={(e, i, j) =>
          w.completed ? (
            <>
              {t(
                (e.actual?.weight || e.actual?.reps) && (
                  <p className="mt-2 text-sm">
                    {t(" Logged: ")}
                    {e.actual.weight} {t(e.actual.reps && `· ${e.actual.reps} reps`)}
                  </p>
                ),
              )}
            </>
          ) : (
            <>
              <div className="mt-3 grid grid-cols-[1fr_1fr_auto] gap-2">
                <Input
                  aria-label={tx("{exercise} weight used", { exercise: t(e.name) })}
                  placeholder={t("Weight used")}
                  defaultValue={e.actual?.weight ?? fill(e).weight}
                  onBlur={(ev) => {
                    if (ev.target.value === (e.actual?.weight ?? "")) return;
                    savePlan(
                      patchEx(i, j, {
                        actual: {
                          ...e.actual,
                          weight: ev.target.value,
                          weight_num: parseNumeric(ev.target.value.trim().split(/\s+/)[0] ?? ""),
                        },
                      }),
                    );
                  }}
                />
                <Input
                  aria-label={tx("{exercise} reps done", { exercise: t(e.name) })}
                  placeholder={t("Reps done")}
                  defaultValue={e.actual?.reps ?? fill(e).reps}
                  onBlur={(ev) => {
                    if (ev.target.value === (e.actual?.reps ?? "")) return;
                    savePlan(
                      patchEx(i, j, {
                        actual: {
                          ...e.actual,
                          reps: ev.target.value,
                          reps_num: parseNumeric(ev.target.value),
                        },
                      }),
                    );
                  }}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-11 w-11"
                  aria-label={tx("Swap {exercise}", { exercise: t(e.name) })}
                  onClick={() => setOpenSwap(openSwap === `${i}-${j}` ? null : `${i}-${j}`)}
                >
                  <Repeat2 />
                </Button>
              </div>
              {t(
                openSwap === `${i}-${j}` && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {t(
                      swapOptions(e.name)
                        .map((name) =>
                          adaptExercise({ ...e, name }, profile.equipment, profile.experience),
                        )
                        .filter((x, k, a) => a.findIndex((y) => y.name === x.name) === k)
                        .map((x) => (
                          <Button
                            key={x.name}
                            variant="outline"
                            className="min-h-11"
                            onClick={() => {
                              setOpenSwap(null);
                              savePlan(
                                patchEx(i, j, {
                                  ...x,
                                  swapped_from: e.swapped_from ?? e.name,
                                  lift: undefined,
                                  actual: undefined,
                                  prescription:
                                    (e.prescription.split(" @ ")[0] ?? e.prescription) +
                                    (["Dumbbells", "Kettlebells"].includes(x.requires ?? "")
                                      ? " @ choose a load (RPE 7)"
                                      : ""),
                                }),
                              );
                            }}
                          >
                            {t(x.name)}
                          </Button>
                        )),
                    )}
                  </div>
                ),
              )}
            </>
          )
        }
      />
      <Section title={t("Cooldown")}>
        <p>{t(plan.cooldown)}</p>
      </Section>
      {t(
        w.completed ? (
          <Section title={t("Session complete")}>
            <p>
              {t(w.duration)}
              {t(" min · RPE ")}
              {t(w.rpe)}
            </p>
            {t(
              plan.blocks
                .filter((b) => b.result)
                .map((b) => (
                  <p key={b.name} className="mt-2">
                    {t(b.name)}
                    {t(": ")}
                    {t(b.result)}
                  </p>
                )),
            )}
            {t(
              newPrs.map(([lift, pr]) => (
                <p key={lift} className="mt-2 text-olive">
                  {t(" Best recent ")}
                  {t(lift.replaceAll("_", " "))}
                  {t(": ")}
                  {t(pr.value.toFixed(1))} {t(profile.units)}
                </p>
              )),
            )}
            <p className="mt-3">
              {streakLabel} · {t("Next:")} {" "}
              {t(next)}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(recap);
                  toast.success(t("Summary copied"));
                } catch {
                  toast.error(t("Clipboard unavailable"));
                }
              }}
            >
              <Copy />
              {t(" Copy summary ")}
            </Button>
          </Section>
        ) : (
          <Section title={t("Finish & log")}>
            <label className="block">
              {t(" Effort (RPE): ")}
              {t(rpe)}
              <input
                type="range"
                min={1}
                max={10}
                value={rpe}
                aria-label={t("Effort")}
                aria-valuetext={t(`${rpe} of 10`)}
                onChange={(e) => setRpe(Number(e.target.value))}
                className="my-3 min-h-11 w-full accent-clay"
              />
            </label>
            <Textarea
              aria-label={t("Workout feedback")}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={t("How did it feel?")}
            />
            <Button
              variant="ink"
              size="xl"
              className="mt-4 w-full"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const logged: WorkoutPlan = {
                  ...plan,
                  blocks: plan.blocks.map((b) => ({
                    ...b,
                    exercises: b.exercises.map((e) => {
                      if (e.actual?.weight || e.actual?.reps) return e;
                      const f = fill(e);
                      if (!f.weight && !f.reps) return e;
                      return { ...e, actual: { weight: f.weight, reps: f.reps, weight_num: parseNumeric(f.weight.split(" ")[0] ?? ""), reps_num: parseNumeric(f.reps) } };
                    }),
                  })),
                };
                const { error } = await supabase
                  .from("workouts")
                  .update({ completed: true, rpe, feedback, plan: logged as never })
                  .eq("id", w.id)
                  .eq("user_id", profile.id);
                setBusy(false);
                if (error) toast.error(tError(error.message));
                else {
                  toast.success(t("Logged. Great work."));
                  await onChange();
                }
              }}
            >
              {t(" Mark complete ")}
            </Button>
          </Section>
        ),
      )}
    </div>
  );
}
