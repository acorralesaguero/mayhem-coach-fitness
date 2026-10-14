export function Chips({ options, value, onChange, multi = false }: {
  options: readonly (string | number)[];
  value: string | number | (string | number)[] | null | undefined;
  onChange: (v: never) => void;
  multi?: boolean;
}) {
  const arr = Array.isArray(value) ? value : value == null ? [] : [value];
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = arr.includes(o);
        return (
          <button type="button" key={o} className="chip" data-active={active}
            onClick={() => {
              if (multi) onChange((active ? arr.filter((x) => x !== o) : [...arr, o]) as never);
              else onChange(o as never);
            }}>
            {o}
          </button>
        );
      })}
    </div>
  );
}

export function Scale({ label, value, onChange, low, high }: { label: string; value: number; onChange: (v: number) => void; low: string; high: string }) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{low} → {high}</span>
      </div>
      <div className="mt-2 grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" className="chip !px-0 h-11" data-active={value === n} onClick={() => onChange(n)}>{n}</button>
        ))}
      </div>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="surface p-5">
      <p className="eyebrow mb-3">{title}</p>
      {children}
    </section>
  );
}
