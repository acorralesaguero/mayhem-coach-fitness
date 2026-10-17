import { useTranslation } from "@/lib/i18n";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { pageHead } from "@/lib/brand";
import { useProfile, useRefresh } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";
import { suggestedWeek, parseNumeric } from "@/lib/progress";
import { LIFT_LABELS } from "@/lib/program";
import { Chips, Section } from "@/components/Chips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { EXPERIENCE, EQUIPMENT, DURATIONS, GOALS } from "@/lib/options";
export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => pageHead("Set up your training", "Build your equipment-aware weekly training plan."),
  component: Onboarding,
});
function Onboarding() {
  const { t, tError } = useTranslation();
  const { user } = useAuth(),
    { data: p } = useProfile(),
    refresh = useRefresh(),
    navigate = useNavigate();
  const [step, setStep] = useState(1),
    [experience, setExperience] = useState("Beginner"),
    [equipment, setEquipment] = useState<string[]>(["Bodyweight only"]),
    [days, setDays] = useState(3),
    [duration, setDuration] = useState(60),
    [units, setUnits] = useState("lb"),
    [goal, setGoal] = useState("General health"),
    [limitations, setLimitations] = useState(""),
    [clear, setClear] = useState(false),
    [bench, setBench] = useState<Record<string, number | null>>({}),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!p) return;
    setExperience(p.experience ?? "Beginner");
    setEquipment(p.equipment.length ? p.equipment : ["Bodyweight only"]);
    setDays(p.days_per_week);
    setDuration(p.default_duration);
    setUnits(p.units);
    setGoal(p.primary_goal ?? "General health");
    setLimitations(p.limitations ?? "");
    setClear(!!p.par_q_ack_at);
  }, [p]);
  async function save(finish = false, skip = false) {
    if (!user) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        experience,
        equipment,
        days_per_week: days,
        default_duration: duration,
        units,
        primary_goal: goal,
        limitations,
        par_q_ack_at: clear ? new Date().toISOString() : null,
        ...(!skip ? bench : {}),
        ...(finish ? { onboarded: true } : {}),
      });
      if (error) throw error;
      if (finish) {
        const { error } = await supabase.from("week_plan").upsert(
          suggestedWeek(days, goal, experience, duration).map((d) => ({ ...d, user_id: user.id })),
          { onConflict: "user_id,day_of_week" },
        );
        if (error) throw error;
        await refresh();
        navigate({ to: "/today" });
      } else setStep(step + 1);
    } catch (e) {
      toast.error(tError((e as Error).message));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <p className="eyebrow">
        {t(step)}
        {t(" of 3")}
      </p>
      <Progress value={(step / 3) * 100} className="mt-3 h-1" />
      <h1 className="mt-6 text-4xl">
        {t(
          step === 1
            ? "Your training rhythm"
            : step === 2
              ? "Your goal and safety"
              : "Your starting weights",
        )}
      </h1>
      {t(
        step === 1 ? (
          <>
            <Section title={t("Experience")}>
              <Chips options={EXPERIENCE} value={experience} onChange={setExperience} />
            </Section>
            <Section title={t("Equipment")}>
              <Chips multi options={EQUIPMENT} value={equipment} onChange={setEquipment} />
              <div className="mt-3 flex gap-2">
                <Button variant="ghost" onClick={() => setEquipment(["Full gym"])}>
                  {t(" Full gym ")}
                </Button>
                <Button variant="ghost" onClick={() => setEquipment(["Bodyweight only"])}>
                  {t(" Bodyweight only ")}
                </Button>
              </div>
            </Section>
            <Section title={t("Days per week")}>
              <Chips options={[2, 3, 4, 5, 6]} value={days} onChange={setDays} />
            </Section>
            <Section title={t("Usual minutes")}>
              <Chips options={DURATIONS} value={duration} onChange={setDuration} />
            </Section>
            <Section title={t("Units")}>
              <Chips options={["lb", "kg"]} value={units} onChange={setUnits} />
            </Section>
          </>
        ) : step === 2 ? (
          <>
            <Section title={t("Primary goal")}>
              <Chips options={GOALS} value={goal} onChange={setGoal} />
            </Section>
            <Section title={t("Injuries or limitations (optional)")}>
              <Textarea
                maxLength={500}
                value={limitations}
                onChange={(e) => setLimitations(e.target.value)}
              />
              <p className="mt-2 text-sm text-muted-foreground">
                {t("Forge is not medical advice.")}
              </p>
            </Section>
            <label className="my-5 flex items-start gap-3">
              <Checkbox
                aria-label={t("I'm cleared to exercise and understand Forge is not medical advice")}
                checked={clear}
                onCheckedChange={(v) => setClear(v === true)}
              />
              <span>{t("I'm cleared to exercise and understand Forge is not medical advice")}</span>
            </label>
          </>
        ) : (
          <>
            <p className="mt-4 text-muted-foreground">
              {t("Optional best single lifts, in ")}
              {t(units)}
              {t(".")}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {t(
                Object.entries(LIFT_LABELS).map(([key, label]) => (
                  <label key={key}>
                    {t(label)}
                    <Input
                      aria-label={t(label)}
                      inputMode="decimal"
                      value={bench[key] ?? ""}
                      onChange={(e) =>
                        setBench({ ...bench, [key]: parseNumeric(e.target.value) ?? null })
                      }
                    />
                  </label>
                )),
              )}
            </div>
            <Button
              variant="outline"
              size="xl"
              className="mt-6 w-full"
              disabled={busy}
              onClick={() => save(true, true)}
            >
              {t(" Skip — use scaled defaults ")}
            </Button>
          </>
        ),
      )}
      <div className="my-6 flex gap-3">
        {t(
          step > 1 && (
            <Button variant="outline" onClick={() => setStep(step - 1)}>
              {t(" Back ")}
            </Button>
          ),
        )}
        <Button
          variant="ink"
          size="xl"
          className="flex-1"
          disabled={busy || (step === 2 && !clear)}
          onClick={() => save(step === 3)}
        >
          {t(step === 3 ? "Start training" : "Continue")}
        </Button>
      </div>
    </div>
  );
}
