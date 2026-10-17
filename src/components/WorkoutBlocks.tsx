import { useTranslation } from "@/lib/i18n";
import type { ReactNode } from "react";
import type { WorkoutPlan, PlanExercise } from "@/lib/program";
export function WorkoutBlocks({
  plan,
  blockTools,
  exerciseTools,
}: {
  plan: WorkoutPlan;
  blockTools?: (i: number) => ReactNode;
  exerciseTools?: (e: PlanExercise, i: number, j: number) => ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      {t(
        plan.blocks.map((b, i) => (
          <section className="border-b py-5" key={i}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="eyebrow">
                  {t(b.minutes)}
                  {t(" min · ")}
                  {t(b.format)}
                </p>
                <h2 className="mt-1 text-2xl">{t(b.name)}</h2>
              </div>
              {t(blockTools?.(i))}
            </div>
            {t(
              b.result && (
                <p className="mt-3 font-semibold text-olive">
                  {t("Score: ")}
                  {t(b.result)}
                </p>
              ),
            )}
            <ul className="mt-3 divide-y">
              {t(
                b.exercises.map((e, j) => (
                  <li key={`${e.name}-${j}`} className="py-3">
                    <div className="flex flex-wrap justify-between gap-2">
                      <span className="font-semibold">{t(e.name)}</span>
                      <span className="text-clay">{t(e.prescription)}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t(e.swapped_from && `Swapped from ${e.swapped_from} · `)}
                      {t(e.cue)}
                      {t(e.rest && ` · Rest ${e.rest}`)}
                    </p>
                    {t(exerciseTools?.(e, i, j))}
                  </li>
                )),
              )}
            </ul>
          </section>
        )),
      )}
    </div>
  );
}
