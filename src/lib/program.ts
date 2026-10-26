// Independent fixed Forge programming; conservative draft for qualified coach review.
import {
  PHASES,
  WAVE,
  METCONS,
  WARMUP,
  STRENGTH_OPTIONS,
  RECOVERY,
  PUMP,
  TABATA_CORE,
  equipmentFor,
  type Ex,
  type Focus,
} from "./library";
export { LIFT_LABELS } from "./library";
import { swapOptions } from "./swaps";
export type Lift =
  | "back_squat"
  | "front_squat"
  | "deadlift"
  | "strict_press"
  | "push_press"
  | "clean_jerk"
  | "snatch";
export type Units = "lb" | "kg";
export type Benchmarks = Partial<Record<Lift, number | null>> & { units?: string | null };
export type Readiness = {
  energy: number;
  sleep_hours: number;
  sleep_quality: number | null;
  stress: number | null;
  soreness: number;
  motivation: number | null;
};
export type Tier = "rx" | "scaled";

export type PlanExercise = {
  name: string;
  prescription: string;
  rest: string;
  cue: string;
  lift?: Lift | undefined;
  requires?: string | undefined;
  actual?:
    | {
        weight?: string | undefined;
        reps?: string | undefined;
        weight_num?: number | undefined;
        reps_num?: number | undefined;
      }
    | undefined;
  swapped_from?: string | undefined;
};
export type WorkoutPlan = {
  title: string;
  coach_note: string;
  intensity: "recovery" | "moderate" | "hard" | "max";
  blocks: {
    name: string;
    format: string;
    minutes: number;
    result?: string;
    exercises: PlanExercise[];
  }[];
  cooldown: string;
  limitations_applied?: string | undefined;
};

export function readinessScore(r: Readiness): number {
  const sleep = Math.min(5, Math.max(1, (r.sleep_hours - 4) * 1.0 + 1)); // 4h→1, 8h→5
  return (
    (r.energy +
      (r.sleep_quality ?? 3) +
      (r.motivation ?? 3) +
      (6 - (r.stress ?? 3)) +
      (6 - r.soreness) +
      sleep) /
    6
  );
}

export function readinessFactor(r: Readiness): number {
  const s = readinessScore(r);
  if (s >= 3.8) return 1;
  if (s >= 3) return 0.95;
  if (s >= 2.3) return 0.9;
  return 0.85;
}

export function roundLoad(v: number, units: Units): number {
  const step = units === "kg" ? 2.5 : 5;
  return Math.max(step, Math.round(v / step) * step);
}

const EPOCH = Date.UTC(2026, 0, 5); // a Monday
export function weekIndex(d: Date) {
  return Math.floor(
    (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - EPOCH) / (7 * 86400000),
  );
}

export function focusFor(groups: string[], dow: number): Focus {
  const g = groups.join(" ").toLowerCase();
  if (/olympic/.test(g)) return "oly";
  if (/engine|cardio/.test(g)) return "engine";
  if (/mobility/.test(g) && groups.length === 1) return "recovery";
  if (/legs|glutes/.test(g)) return "lower";
  if (/chest|back|shoulders|arms|gymnastics/.test(g)) return "upper";
  if (/full/.test(g)) return "full";
  return (
    (["recovery", "lower", "upper", "engine", "oly", "full", "full"] as Focus[])[dow] ?? "full"
  );
}

function loadFor(
  ex: Ex,
  b: Benchmarks,
  units: Units,
  factor: number,
  tier: Tier,
  pctBoost = 0,
): string {
  const oneRm = ex.lift ? b[ex.lift] : null;
  let w: number | null = null;
  if (oneRm && ex.pct) w = oneRm * (ex.pct + pctBoost) * factor;
  else if (ex.rx) {
    const base = units === "kg" ? ex.rx[0] * 0.4536 : ex.rx[0];
    w = base * factor;
  }
  if (w == null)
    return ex.requires &&
      ex.requires !== "Bodyweight only" &&
      /Dumbbells|Kettlebells|Barbell/.test(ex.requires)
      ? `${ex.reps} @ choose a load (RPE 7)`
      : ex.reps;
  if (tier === "scaled") w *= 0.7;
  return `${ex.reps} @ ${roundLoad(w, units)} ${units}`;
}

export function buildSession(opts: {
  date: Date;
  duration: 30 | 60 | 90;
  groups: string[];
  benchmarks: Benchmarks;
  readiness: Readiness;
  tier: Tier;
  equipment?: string[];
  experience?: string | null;
  limitations?: string | null;
  recentTitles?: string[];
}): WorkoutPlan {
  const { date, duration, benchmarks: b, readiness, tier } = opts;
  const units: Units = b.units === "kg" ? "kg" : "lb";
  const wk = weekIndex(date);
  const phase = PHASES[Math.floor(date.getMonth() / 3)] ?? PHASES[0];
  if (!phase) throw new Error("Phase not found");
  const wave = WAVE[((wk % 4) + 4) % 4] ?? 0;
  const factor = readinessFactor(readiness);
  let focus = focusFor(opts.groups, date.getDay());
  if (opts.experience === "Beginner" && focus === "oly") focus = "full";

  const rx = (e: Ex): PlanExercise =>
    adaptExercise(
      {
        name: e.name,
        prescription: e.reps,
        rest: e.rest ?? "",
        cue: e.cue,
        requires: e.requires,
        lift: e.lift,
      },
      opts.equipment ?? [],
      opts.experience,
    );
  const warmMin = duration === 30 ? 5 : 10;

  if (focus === "recovery") {
    const flow = duration - warmMin;
    return {
      title: leastRecent(RECOVERY, opts.recentTitles ?? [], wk, (x) => x.name).name,
      intensity: "recovery",
      cooldown: "5 min box breathing.",
      coach_note: `${phase.name} phase. Today is about circulation and range of motion — move, don't grind.`,
      blocks: [
        {
          name: "Warm-up",
          format: "Easy flow",
          minutes: warmMin,
          exercises: leastRecent(RECOVERY, opts.recentTitles ?? [], wk, (x) => x.name).ex.map(rx),
        },
        {
          name: "Mobility & Zone 2",
          format: "Continuous, easy",
          minutes: flow,
          exercises: [
            adaptExercise(
              {
                name: "Easy bike",
                prescription: `${Math.round(flow * 0.6)} min easy`,
                rest: "",
                cue: "Could hold a conversation",
              },
              opts.equipment ?? [],
              opts.experience,
            ),
            {
              name: "Hip & T-spine circuit",
              prescription: `${Math.round(flow * 0.4)} min`,
              rest: "",
              cue: "Couch stretch, pigeon, thread the needle",
              requires: "Bodyweight only",
            },
          ],
        },
      ],
    };
  }

  const metcons = METCONS[focus];
  const met = leastRecent(metcons, opts.recentTitles ?? [], wk, (x) => x.name);
  const blocks: WorkoutPlan["blocks"] = [
    { name: "Warm-up", format: "2 rounds easy", minutes: warmMin, exercises: WARMUP.map(rx) },
  ];

  const metEx = met.ex.map((e) =>
    adaptExercise(
      {
        name: e.name,
        prescription: loadFor(e, b, units, factor, tier),
        rest: e.rest ?? "",
        cue: e.cue,
        lift: e.lift,
        requires: e.requires,
      },
      opts.equipment ?? [],
      opts.experience,
    ),
  );

  let strengthName = "";
  if (duration > 30 && focus !== "engine") {
    const chosen = leastRecent(STRENGTH_OPTIONS[focus], opts.recentTitles ?? [], wk, (x) => x.name);
    strengthName = chosen.name;
    const ex: Ex = {
      ...chosen,
      reps: phase.sets,
      pct: phase.pct,
      cue: "Controlled technique; leave 2–3 reps in reserve",
      rest: "2 min",
    };
    blocks.push({
      name: "Strength",
      format: `${phase.name} · ${phase.sets}`,
      minutes: 20,
      exercises: [
        adaptExercise(
          {
            name: ex.name,
            prescription: loadFor(ex, b, units, factor, tier, wave),
            lift: ex.lift,
            requires: ex.requires,
            rest: "2 min",
            cue: ex.cue,
          },
          opts.equipment ?? [],
          opts.experience,
        ),
      ],
    });
  }
  blocks.push({
    name: met.name,
    format: met.format,
    minutes: Math.min(met.minutes, duration - blocks.reduce((s, x) => s + x.minutes, 0)),
    exercises: metEx,
  });
  const spare = duration - blocks.reduce((s, x) => s + x.minutes, 0);
  const finisher = spare >= 14 ? 4 : 0;
  if (spare - finisher > 0)
    blocks.push({
      name: "Builder",
      format: "Supersets · 60 s rest",
      minutes: spare - finisher,
      exercises: PUMP[focus].map((e) =>
        adaptExercise(
          {
            name: e.name,
            prescription: loadFor(e, b, units, factor, tier),
            rest: "",
            cue: e.cue,
            requires: e.requires,
          },
          opts.equipment ?? [],
          opts.experience,
        ),
      ),
    });
  if (finisher)
    blocks.push({
      name: "Core finisher",
      format: "Tabata 8 rounds",
      minutes: finisher,
      exercises: TABATA_CORE.map(rx),
    });

  const intensity: WorkoutPlan["intensity"] =
    factor >= 1 && wave > 0 ? "hard" : factor >= 0.95 ? "moderate" : "recovery";
  const waveLabel = wave < 0 ? "deload week" : wave === 0.1 ? "peak week" : "build week";
  const note =
    factor < 1
      ? `Readiness is down today, so loads are trimmed ${Math.round((1 - factor) * 100)}%. Same session as everyone else — just smarter weights.`
      : "You're ready. Hit the prescribed loads and own the metcon.";
  return {
    title: `${focus.charAt(0).toUpperCase()}${focus.slice(1)} · ${met.name}${strengthName ? " · " + strengthName : ""}`,
    coach_note: `${phase.name} phase, ${waveLabel}. ${note}`,
    intensity,
    blocks,
    cooldown: "5 min easy spin + stretch the muscles you trained.",
  };
}

export function leastRecent<T>(
  items: T[],
  recent: string[],
  week: number,
  label: (x: T) => string,
): T {
  const ranked = items.map((item, i) => ({
    item,
    i,
    rank: recent.findIndex((title) => title.includes(label(item))),
  }));
  ranked.sort(
    (a, b) =>
      (b.rank === -1 ? Number.MAX_SAFE_INTEGER : b.rank) -
        (a.rank === -1 ? Number.MAX_SAFE_INTEGER : a.rank) ||
      ((a.i - (week % items.length) + items.length) % items.length) -
        ((b.i - (week % items.length) + items.length) % items.length),
  );
  const first = ranked[0];
  if (!first) throw new Error("Empty session library");
  return first.item;
}
export function adaptExercise(
  e: PlanExercise,
  equipment: string[],
  experience?: string | null,
): PlanExercise {
  const compatible = (n: string) =>
    equipment.length === 0 ||
    equipment.includes("Full gym") ||
    equipmentFor(n) === "Bodyweight only" ||
    equipment.includes(equipmentFor(n));
  const advanced = (n: string) =>
    /snatch|clean.?&.?jerk|power cleans|toes.to.bar|double.under/i.test(n) &&
    !/dumbbell power clean/i.test(n);
  let name = e.name;
  if (experience === "Beginner" && advanced(name))
    name = /under/i.test(name)
      ? "Single-unders (x3)"
      : /toes/i.test(name)
        ? "Hanging knee raise"
        : /snatch/i.test(name)
          ? "Kettlebell swing"
          : "Dumbbell power clean";
  if (!compatible(name))
    name =
      swapOptions(name).find((n) => compatible(n) && !(experience === "Beginner" && advanced(n))) ??
      (/squat|lunge|jump|thruster/i.test(name)
        ? "Air squat (tempo)"
        : /deadlift|swing|clean|snatch/i.test(name)
          ? "Hip thrust"
          : /press|push/i.test(name)
            ? "Incline push-up"
            : /pull|row|hanging/i.test(name)
              ? "Prone Y-T raise"
              : "March in place");
  if (/^(Bodyweight|Dumbbell|Kettlebell) version$/.test(name))
    name =
      name === "Bodyweight version"
        ? "March in place"
        : name === "Dumbbell version"
          ? "Dumbbell row"
          : "Kettlebell deadlift";
  if (name === e.name) return { ...e, requires: equipmentFor(name) };
  let prescription = e.prescription.split(" @ ")[0] ?? e.prescription;
  if (/Single-unders/.test(name))
    prescription = prescription.replace(/\d+/g, (n) => String(Number(n) * 3));
  if (["Dumbbells", "Kettlebells"].includes(equipmentFor(name)))
    prescription += " @ choose a load (RPE 7)";
  return {
    ...e,
    name,
    prescription,
    lift: undefined,
    requires: equipmentFor(name),
    swapped_from: e.swapped_from ?? e.name,
  };
}
