import { useTranslation } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { pageHead } from "@/lib/brand";
import { useProfile, useRefresh } from "@/lib/data";
import { deleteAccount } from "@/lib/account.functions";
import { supabase } from "@/integrations/supabase/client";
import { parseNumeric } from "@/lib/progress";
import { LIFT_LABELS } from "@/lib/program";
import { Chips, Section } from "@/components/Chips";
import { PageSkeleton } from "@/components/PageSkeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { DURATIONS, EQUIPMENT, EXPERIENCE, GOALS } from "@/lib/options";
import type { Database } from "@/integrations/supabase/types";
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export const Route = createFileRoute("/_authenticated/profile")({
  head: () => pageHead("Athlete profile", "Equipment, goals, benchmarks and account controls."),
  component: ProfilePage,
});
function ProfilePage() {
  const { t, tError } = useTranslation();
  const { data: profile, error } = useProfile(),
    refresh = useRefresh();
  const [p, setP] = useState<Profile | null>(null),
    [confirmation, setConfirmation] = useState(""),
    [deleting, setDeleting] = useState(false),
    [busy, setBusy] = useState(false);
  const remove = useServerFn(deleteAccount);
  useEffect(() => {
    if (profile) setP(profile);
  }, [profile]);
  if (error) return <p role="alert">{t("Your profile could not load. Please try again.")}</p>;
  if (!p) return <PageSkeleton />;
  const set = (key: keyof Profile, value: unknown) => setP({ ...p, [key]: value });
  async function save() {
    if (!p) return;
    setBusy(true);
    const { error } = await supabase.from("profiles").update(p).eq("id", p.id);
    setBusy(false);
    if (error) toast.error(tError(error.message));
    else {
      toast.success(t("Profile saved"));
      await refresh();
    }
  }
  async function exportData() {
    if (!p) return;
    setBusy(true);
    try {
      const [week, checkins, workouts] = await Promise.all([
        supabase.from("week_plan").select("*").eq("user_id", p.id),
        supabase.from("checkins").select("*").eq("user_id", p.id),
        supabase.from("workouts").select("*").eq("user_id", p.id),
      ]);
      for (const q of [week, checkins, workouts]) if (q.error) throw q.error;
      const url = URL.createObjectURL(
        new Blob(
          [
            JSON.stringify(
              {
                profile: p,
                week_plan: week.data,
                checkins: checkins.data,
                workouts: workouts.data,
              },
              null,
              2,
            ),
          ],
          { type: "application/json" },
        ),
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "forge-data.json";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(tError((e as Error).message));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl">{t("Your blueprint")}</h1>
        <Button variant="ghost" onClick={() => supabase.auth.signOut()}>
          {t(" Sign out ")}
        </Button>
      </header>
      <Section title={t("Primary goal")}>
        <Chips options={GOALS} value={p.primary_goal} onChange={(v) => set("primary_goal", v)} />
      </Section>
      <Section title={t("Experience")}>
        <Chips options={EXPERIENCE} value={p.experience} onChange={(v) => set("experience", v)} />
      </Section>
      <Section title={t("Usual minutes")}>
        <Chips
          options={DURATIONS}
          value={p.default_duration}
          onChange={(v) => set("default_duration", v)}
        />
      </Section>
      <Section title={t("Equipment")}>
        <Chips
          multi
          options={EQUIPMENT}
          value={p.equipment}
          onChange={(v) => set("equipment", v)}
        />
      </Section>
      <Section title={t("Benchmarks (1-rep max)")}>
        <Chips options={["lb", "kg"]} value={p.units} onChange={(v) => set("units", v)} />
        <div className="mt-4 grid grid-cols-2 gap-4">
          {t(
            Object.entries({
              ...LIFT_LABELS,
              bodyweight: "Bodyweight",
              max_pullups: "Max pull-ups",
              max_pushups: "Max push-ups",
            }).map(([key, label]) => (
              <label key={key} className="text-sm">
                {t(label)}
                <Input
                  inputMode="decimal"
                  aria-label={t(label)}
                  value={String(p[key as keyof Profile] ?? "")}
                  className="mt-1 h-11"
                  onChange={(e) => set(key as keyof Profile, parseNumeric(e.target.value) ?? null)}
                />
              </label>
            )),
          )}
        </div>
      </Section>
      <Section title={t("Injuries or limitations")}>
        <Textarea
          maxLength={500}
          value={p.limitations ?? ""}
          onChange={(e) => set("limitations", e.target.value)}
        />
        <p className="mt-2 text-sm text-muted-foreground">{t("Forge is not medical advice.")}</p>
      </Section>
      <Button variant="ink" size="xl" className="my-5 w-full" disabled={busy} onClick={save}>
        {t(" Save profile ")}
      </Button>
      <Section title={t("Your account")}>
        <Button variant="outline" className="w-full" onClick={exportData} disabled={busy}>
          {t(" Download my data ")}
        </Button>
        <Button
          variant="ghost"
          className="mt-3 w-full text-destructive"
          onClick={() => setDeleting(!deleting)}
        >
          {t(" Delete my account ")}
        </Button>
        {t(
          deleting && (
            <div className="mt-4 space-y-3">
              <p>
                {t(
                  " Deleting your account permanently removes your profile and training history. Type DELETE to confirm. ",
                )}
              </p>
              <Input
                aria-label={t("Deletion confirmation")}
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
              />
              <Button
                variant="destructive"
                disabled={confirmation !== "DELETE" || busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await remove({ data: { confirmation: "DELETE" } });
                    await supabase.auth.signOut();
                    window.location.assign("/");
                  } catch (e) {
                    toast.error(tError((e as Error).message));
                    setBusy(false);
                  }
                }}
              >
                {t(" Permanently delete account ")}
              </Button>
            </div>
          ),
        )}
      </Section>
      <div className="my-5 flex gap-5 text-sm">
        <Link to="/privacy">{t("Privacy")}</Link>
        <Link to="/terms">{t("Terms")}</Link>
      </div>
    </div>
  );
}
