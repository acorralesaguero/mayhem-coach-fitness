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
  const title = useContext(SectionLabel);
  const arr = Array.isArray(value) ? value : value == null ? [] : [value];
  return (
    <div role="group" aria-label={label ?? title} className="flex flex-wrap gap-2">
      {options.map((o) => (
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
          {o}
        </Button>
      ))}
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
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">
          {low} → {high}
        </span>
      </div>
      <div role="radiogroup" aria-label={label} className="mt-2 grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <Button
            key={n}
            role="radio"
            aria-checked={value === n}
            aria-label={`${label} ${n} of 5`}
            variant={value === n ? "ink" : "outline"}
            className="h-11"
            onClick={() => onChange(n)}
          >
            {n}
          </Button>
        ))}
      </div>
    </div>
  );
}
export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <SectionLabel.Provider value={title}>
      <section className="border-b py-5">
        <p className="eyebrow mb-3">{title}</p>
        {children}
      </section>
    </SectionLabel.Provider>
  );
}
