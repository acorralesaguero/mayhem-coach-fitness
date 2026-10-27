import { useTranslation } from "@/lib/i18n";
import { createContext, useContext } from "react";
import { Button } from "./ui/button";
const SectionLabel = createContext("Options");
export function Chips({
  options,
  value,
  onChange,
  multi = false,
  label,
}: {
  options: readonly (string | number)[];
  value: string | number | (string | number)[] | null | undefined;
  onChange: (v: never) => void;
  multi?: boolean;
  label?: string;
}) {
  const { t } = useTranslation();
  const title = useContext(SectionLabel);
  const arr = Array.isArray(value) ? value : value == null ? [] : [value];
  return (
    <div role="group" aria-label={t(label ?? title)} className="flex flex-wrap gap-2">
      {t(
        options.map((o) => (
          <Button
            key={o}
            variant={arr.includes(o) ? "ink" : "outline"}
            aria-pressed={arr.includes(o)}
            className="min-h-11 rounded-full"
            onClick={() =>
              onChange(
                (multi ? (arr.includes(o) ? arr.filter((x) => x !== o) : [...arr, o]) : o) as never,
              )
            }
          >
            {t(o)}
          </Button>
        )),
      )}
    </div>
  );
}
export function Scale({
  label,
  value,
  onChange,
  low,
  high,
}: {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
  low: string;
  high: string;
}) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-medium">{t(label)}</span>
        <span className="text-sm text-muted-foreground">
          {t(low)}
          {t(" → ")}
          {t(high)}
        </span>
      </div>
      <div role="radiogroup" aria-label={t(label)} className="mt-2 grid grid-cols-5 gap-2">
        {t(
          [1, 2, 3, 4, 5].map((n) => (
            <Button
              key={n}
              role="radio"
              aria-checked={value === n}
              aria-label={t(`${label} ${n} of 5`)}
              variant={value === n ? "ink" : "outline"}
              className="h-12 rounded-full tabular-nums"
              onClick={() => onChange(n)}
            >
              {t(n)}
            </Button>
          )),
        )}
      </div>
    </div>
  );
}
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const { t } = useTranslation();
  return (
    <SectionLabel.Provider value={title}>
      <section className="border-b py-7 last:border-b-0">
        <p className="mb-4 text-sm font-semibold">{t(title)}</p>
        {t(children)}
      </section>
    </SectionLabel.Provider>
  );
}
