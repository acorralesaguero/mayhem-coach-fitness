import type { Lift, WorkoutPlan } from "./program";
export const parseNumeric = (v: string): number | undefined => {
  const s = v.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(s)) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};
export const epley = (weight: number, reps: number) =>
  weight > 0 && Number.isInteger(reps) && reps >= 1 && reps <= 10 ? weight * (1 + reps / 30) : null;
export type HistoryWorkout = {
  id?: string;
  workout_date: string;
  title: string;
  duration: number;
  completed: boolean;
  rpe?: number | null;
  plan: WorkoutPlan;
};
export function prBoard(works: HistoryWorkout[], now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 56);
  const prs: Partial<Record<Lift, { value: number; date: string }>> = {};
  for (const w of works) {
    if (!w.completed || new Date(w.workout_date + "T12:00:00") < cutoff) continue;
    for (const b of w.plan.blocks)
      for (const e of b.exercises) {
        if (!e.lift) continue;
        const value = epley(e.actual?.weight_num ?? 0, e.actual?.reps_num ?? 0);
        if (value && value > (prs[e.lift]?.value ?? 0))
          prs[e.lift] = { value, date: w.workout_date };
      }
  }
  return prs;
}
export function weekStart(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
}
export function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function streak(works: HistoryWorkout[], planned: number, now = new Date()) {
  const target = Math.max(1, planned);
  let start = weekStart(now),
    n = 0;
  const count = (d: Date) =>
    works.filter(
      (w) =>
        w.completed && dateKey(weekStart(new Date(w.workout_date + "T12:00:00"))) === dateKey(d),
    ).length;
  if (count(start) < target) start.setDate(start.getDate() - 7);
  for (let i = 0; i < 104; i++) {
    if (count(start) < target) break;
    n++;
    start.setDate(start.getDate() - 7);
  }
  return n;
}
export function sleepPattern(checks: { energy: number; sleep_hours: number | string }[]) {
  const high = checks.filter((c) => Number(c.sleep_hours) >= 7),
    low = checks.filter((c) => Number(c.sleep_hours) < 7);
  if (checks.length < 14 || high.length < 5 || low.length < 5) return null;
  const avg = (a: typeof checks) => a.reduce((s, c) => s + c.energy, 0) / a.length;
  return `In your last ${checks.length} check-ins, energy averaged ${avg(high).toFixed(1)} after 7h+ sleep and ${avg(low).toFixed(1)} after less (n=${high.length} vs n=${low.length})`;
}
export function suggestedWeek(days: number, goal: string, experience: string, duration: number) {
  const templates: Record<number, [number, string][]> = {
    2: [
      [1, "Full body"],
      [4, "Engine / cardio"],
    ],
    3: [
      [1, "Legs"],
      [3, "Shoulders"],
      [5, "Engine / cardio"],
    ],
    4: [
      [1, "Legs"],
      [2, "Shoulders"],
      [4, "Engine / cardio"],
      [6, "Full body"],
    ],
    5: [
      [1, "Legs"],
      [2, "Shoulders"],
      [3, "Engine / cardio"],
      [4, experience === "Beginner" ? "Full body" : "Olympic lifts"],
      [5, "Full body"],
    ],
    6: [
      [1, "Legs"],
      [2, "Shoulders"],
      [3, "Engine / cardio"],
      [4, experience === "Beginner" ? "Full body" : "Olympic lifts"],
      [5, "Full body"],
      [6, "Mobility"],
    ],
  };
  return Array.from({ length: 7 }, (_, i) => {
    const focus = templates[days]?.find(([day]) => day === i)?.[1];
    return {
      day_of_week: i,
      is_training: !!focus,
      muscle_groups: focus
        ? [goal === "Improve conditioning" && focus === "Shoulders" ? "Engine / cardio" : focus]
        : [],
      duration,
      suggested: true,
    };
  });
}

/** Pre-filled log values: the athlete's average of recent logs for this movement, else the prescription. */
export function prefillActual(
  e: { name: string; prescription: string },
  history: { plan: { blocks: { exercises: { name: string; actual?: { weight_num?: number; reps_num?: number } }[] }[] } }[],
  units: string,
): { weight: string; reps: string } {
  const [repsPart = "", load = ""] = e.prescription.split(" @ ");
  const ws: number[] = [];
  const rs: number[] = [];
  for (const w of history.slice(0, 20))
    for (const b of w.plan?.blocks ?? [])
      for (const x of b.exercises ?? [])
        if (x.name === e.name) {
          if (x.actual?.weight_num) ws.push(x.actual.weight_num);
          if (x.actual?.reps_num) rs.push(x.actual.reps_num);
        }
  const avg = (a: number[]) => Math.round((a.slice(0, 3).reduce((s, v) => s + v, 0) / Math.min(3, a.length)) * 2) / 2;
  const presWeight = /^\d/.test(load) ? (load.match(/^[\d.]+\s*(lb|kg)/)?.[0] ?? "") : "";
  const presReps = repsPart.match(/(\d+)(?!.*\d)/)?.[1] ?? "";
  return {
    weight: ws.length ? `${avg(ws)} ${units}` : presWeight,
    reps: rs.length ? String(avg(rs)) : /\b(s|min|m|cal)\b/.test(repsPart) ? "" : presReps,
  };
}
