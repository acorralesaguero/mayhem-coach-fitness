export type TimerMode = "fortime" | "amrap" | "emom" | "tabata" | "intervals";

export type TimerConfig = {
  mode: TimerMode;
  /** work seconds per round (emom: interval length; tabata/intervals: work) */
  work: number;
  /** rest seconds per round (tabata/intervals only) */
  rest: number;
  rounds: number;
  /** total cap seconds for fortime / amrap */
  cap: number;
};

export type TimerState = {
  phase: "work" | "rest" | "done";
  round: number; // 1-based
  remaining: number; // seconds left in current phase (fortime: elapsed shown separately)
  totalElapsed: number;
};

export function totalDuration(c: TimerConfig): number {
  switch (c.mode) {
    case "fortime":
    case "amrap":
      return c.cap;
    case "emom":
      return c.work * c.rounds;
    default:
      return (c.work + c.rest) * c.rounds;
  }
}

export function computeState(c: TimerConfig, elapsed: number): TimerState {
  const total = totalDuration(c);
  const t = Math.max(0, Math.floor(elapsed));
  if (t >= total) return { phase: "done", round: c.mode === "fortime" || c.mode === "amrap" ? 1 : c.rounds, remaining: 0, totalElapsed: total };
  if (c.mode === "fortime" || c.mode === "amrap") return { phase: "work", round: 1, remaining: total - t, totalElapsed: t };
  if (c.mode === "emom") {
    const round = Math.floor(t / c.work) + 1;
    return { phase: "work", round, remaining: c.work - (t % c.work), totalElapsed: t };
  }
  const cycle = c.work + c.rest;
  const round = Math.floor(t / cycle) + 1;
  const inCycle = t % cycle;
  if (inCycle < c.work) return { phase: "work", round, remaining: c.work - inCycle, totalElapsed: t };
  return { phase: "rest", round, remaining: cycle - inCycle, totalElapsed: t };
}

export const PRESETS: Record<TimerMode, TimerConfig> = {
  fortime: { mode: "fortime", work: 0, rest: 0, rounds: 1, cap: 15 * 60 },
  amrap: { mode: "amrap", work: 0, rest: 0, rounds: 1, cap: 12 * 60 },
  emom: { mode: "emom", work: 60, rest: 0, rounds: 10, cap: 0 },
  tabata: { mode: "tabata", work: 20, rest: 10, rounds: 8, cap: 0 },
  intervals: { mode: "intervals", work: 40, rest: 20, rounds: 10, cap: 0 },
};

/** Best-effort timer config from a block format string like "EMOM 12" or "AMRAP 10". */
export function guessTimer(format: string, minutes: number): TimerConfig {
  const f = format.toLowerCase();
  const num = Number(f.match(/(\d+)/)?.[1] ?? minutes) || minutes;
  if (f.includes("tabata")) return PRESETS.tabata;
  if (f.includes("emom") || f.includes("every minute")) return { ...PRESETS.emom, rounds: num };
  if (f.includes("e2mom") || f.includes("every 2")) return { ...PRESETS.emom, work: 120, rounds: Math.max(1, Math.round(minutes / 2)) };
  if (f.includes("amrap")) return { ...PRESETS.amrap, cap: num * 60 };
  if (f.includes("on") && f.includes("off")) {
    const [w, r] = (f.match(/\d+/g) ?? []).map(Number);
    if (w && r) return { mode: "intervals", work: w, rest: r, rounds: Math.max(1, Math.floor((minutes * 60) / (w + r))), cap: 0 };
  }
  return { ...PRESETS.fortime, cap: Math.max(1, minutes) * 60 };
}
