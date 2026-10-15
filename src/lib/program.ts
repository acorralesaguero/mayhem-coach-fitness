// Fixed Forge programming (Mayhem-style). Workouts are pre-written; only loads/volume adapt.
export type Lift = "back_squat" | "front_squat" | "deadlift" | "strict_press" | "push_press" | "clean_jerk" | "snatch";
export type Units = "lb" | "kg";
export type Benchmarks = Partial<Record<Lift, number | null>> & { units?: string | null };
export type Readiness = { energy: number; sleep_hours: number; sleep_quality: number; stress: number; soreness: number; motivation: number };
export type Tier = "rx" | "scaled";

export type PlanExercise = { name: string; prescription: string; rest: string; cue: string; actual?: { weight?: string; reps?: string }; swapped_from?: string };
export type WorkoutPlan = {
  title: string;
  coach_note: string;
  intensity: "recovery" | "moderate" | "hard" | "max";
  blocks: { name: string; format: string; minutes: number; exercises: PlanExercise[] }[];
  cooldown: string;
};

type Ex = { name: string; reps: string; lift?: Lift; pct?: number; rx?: [number, number]; cue: string; rest?: string };
type Metcon = { name: string; format: string; minutes: number; ex: Ex[] };
type Focus = "lower" | "upper" | "engine" | "oly" | "full" | "recovery";

export const LIFT_LABELS: Record<Lift, string> = {
  back_squat: "Back squat", front_squat: "Front squat", deadlift: "Deadlift", strict_press: "Strict press",
  push_press: "Push press", clean_jerk: "Clean & jerk", snatch: "Snatch",
};

// Quarterly phase → strength scheme
const PHASES = [
  { name: "Base / Hypertrophy", sets: "4 x 8", pct: 0.65 },
  { name: "Strength", sets: "5 x 5", pct: 0.75 },
  { name: "Peak", sets: "5 x 3", pct: 0.82 },
  { name: "Rebuild", sets: "4 x 6", pct: 0.7 },
];
// 4-week wave: build, build, peak, deload
const WAVE = [0, 0.05, 0.1, -0.1];

const STRENGTH: Record<Exclude<Focus, "recovery" | "engine">, Lift> = {
  lower: "back_squat", upper: "strict_press", oly: "clean_jerk", full: "deadlift",
};

const METCONS: Record<Exclude<Focus, "recovery">, Metcon[]> = {
  lower: [
    { name: "Leg Burner", format: "4 rounds for time", minutes: 14, ex: [
      { name: "Thrusters", reps: "12", lift: "front_squat", pct: 0.4, rx: [95, 65], cue: "Drive from heels, bar finishes over mid-foot" },
      { name: "Box jumps", reps: "15", cue: "Stand tall at the top" },
      { name: "Walking lunges", reps: "20", cue: "Knee kisses the floor" }] },
    { name: "Wall Street", format: "AMRAP 12", minutes: 12, ex: [
      { name: "Wall balls", reps: "15", rx: [20, 14], cue: "Full depth, fast hips" },
      { name: "Deadlifts", reps: "9", lift: "deadlift", pct: 0.5, rx: [185, 125], cue: "Lats tight, bar close" },
      { name: "Burpees", reps: "6", cue: "Steady breathing" }] },
  ],
  upper: [
    { name: "Press & Pull", format: "EMOM 12", minutes: 12, ex: [
      { name: "Min 1: Push press", reps: "8", lift: "push_press", pct: 0.55, rx: [115, 75], cue: "Dip straight down" },
      { name: "Min 2: Pull-ups", reps: "8–10", cue: "Scale to ring rows" },
      { name: "Min 3: Push-ups", reps: "12–15", cue: "Plank tight" }] },
    { name: "Upper Chipper", format: "For time", minutes: 14, ex: [
      { name: "Dumbbell snatch (alt.)", reps: "30", rx: [50, 35], cue: "Punch through at the top" },
      { name: "Toes-to-bar", reps: "30", cue: "Kip from the lats" },
      { name: "Shoulder-to-overhead", reps: "20", lift: "push_press", pct: 0.5, rx: [115, 75], cue: "Lock out, head through" }] },
  ],
  engine: [
    { name: "Aerobic Builder", format: "5 x 4 min on / 1 min off", minutes: 25, ex: [
      { name: "Row or bike", reps: "4 min @ conversational pace", cue: "Nasal breathing if you can" }] },
    { name: "Mixed Monostructural", format: "3 rounds, steady", minutes: 24, ex: [
      { name: "Run", reps: "800 m", cue: "Even splits" },
      { name: "Row", reps: "750 m", cue: "Legs-body-arms" },
      { name: "Double-unders", reps: "60", cue: "Scale: 120 singles" }] },
  ],
  oly: [
    { name: "Speed & Power", format: "10 rounds for time", minutes: 12, ex: [
      { name: "Power cleans", reps: "3", lift: "clean_jerk", pct: 0.6, rx: [135, 95], cue: "Fast elbows" },
      { name: "Bar-facing burpees", reps: "5", cue: "Jump two feet" }] },
    { name: "Snatch Sprint", format: "AMRAP 8", minutes: 8, ex: [
      { name: "Power snatch", reps: "5", lift: "snatch", pct: 0.55, rx: [95, 65], cue: "Bar close, punch under" },
      { name: "Air squats", reps: "10", cue: "Full depth" }] },
  ],
  full: [
    { name: "The Grinder", format: "21-15-9 for time", minutes: 12, ex: [
      { name: "Deadlifts", reps: "21-15-9", lift: "deadlift", pct: 0.55, rx: [225, 155], cue: "Brace before every pull" },
      { name: "Kettlebell swings", reps: "21-15-9", rx: [53, 35], cue: "Hips snap" },
      { name: "Burpees", reps: "21-15-9", cue: "Unbroken pace" }] },
    { name: "Hybrid Ladder", format: "AMRAP 14", minutes: 14, ex: [
      { name: "Cal row", reps: "12", cue: "Hard pull, relaxed return" },
      { name: "Front squats", reps: "9", lift: "front_squat", pct: 0.5, rx: [115, 75], cue: "Elbows high" },
      { name: "Pull-ups", reps: "6", cue: "Scale to jumping pull-ups" }] },
  ],
};

const ACCESSORY: Record<Exclude<Focus, "recovery">, Ex[]> = {
  lower: [{ name: "Bulgarian split squat", reps: "3 x 10/leg", cue: "Torso tall" }, { name: "Nordic curls", reps: "3 x 6", cue: "Slow eccentric" }],
  upper: [{ name: "Dumbbell bench press", reps: "3 x 12", cue: "Shoulder blades pinned" }, { name: "Bent-over rows", reps: "3 x 12", cue: "Pull to hip" }],
  engine: [{ name: "Sled push / heavy carry", reps: "6 x 20 m", cue: "Short fast steps" }, { name: "Hollow hold", reps: "4 x 30 s", cue: "Low back glued" }],
  oly: [{ name: "Snatch-grip RDL", reps: "3 x 8", cue: "Lats on" }, { name: "Overhead squat", reps: "3 x 5 light", cue: "Active shoulders" }],
  full: [{ name: "Farmer carry", reps: "4 x 40 m", cue: "Tall posture" }, { name: "GHD sit-ups / weighted plank", reps: "3 x 15 / 45 s", cue: "Control" }],
};

const WARMUP: Ex[] = [
  { name: "Easy row / bike", reps: "3 min", cue: "Build gradually" },
  { name: "World's greatest stretch", reps: "5/side", cue: "Breathe into it" },
  { name: "Movement prep with empty bar", reps: "2 rounds", cue: "Rehearse today's patterns" },
];

export function readinessScore(r: Readiness): number {
  const sleep = Math.min(5, Math.max(1, (r.sleep_hours - 4) * 1.0 + 1)); // 4h→1, 8h→5
  return (r.energy + r.sleep_quality + r.motivation + (6 - r.stress) + (6 - r.soreness) + sleep) / 6;
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
  return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - EPOCH) / (7 * 86400000));
}

export function focusFor(groups: string[], dow: number): Focus {
  const g = groups.join(" ").toLowerCase();
  if (/olympic/.test(g)) return "oly";
  if (/engine|cardio/.test(g)) return "engine";
  if (/mobility/.test(g) && groups.length === 1) return "recovery";
  if (/legs|glutes/.test(g)) return "lower";
  if (/chest|back|shoulders|arms|gymnastics/.test(g)) return "upper";
  if (/full/.test(g)) return "full";
  return (["recovery", "lower", "upper", "engine", "oly", "full", "full"] as Focus[])[dow]!;
}

function loadFor(ex: Ex, b: Benchmarks, units: Units, factor: number, tier: Tier, pctBoost = 0): string {
  const oneRm = ex.lift ? b[ex.lift] : null;
  let w: number | null = null;
  if (oneRm && ex.pct) w = oneRm * (ex.pct + pctBoost) * factor;
  else if (ex.rx) { const base = units === "kg" ? ex.rx[0] * 0.4536 : ex.rx[0]; w = base * factor; }
  if (w == null) return ex.reps;
  if (tier === "scaled") w *= 0.7;
  return `${ex.reps} @ ${roundLoad(w, units)} ${units}`;
}

export function buildSession(opts: { date: Date; duration: 30 | 60 | 90; groups: string[]; benchmarks: Benchmarks; readiness: Readiness; tier: Tier }): WorkoutPlan {
  const { date, duration, benchmarks: b, readiness, tier } = opts;
  const units: Units = b.units === "kg" ? "kg" : "lb";
  const wk = weekIndex(date);
  const phase = PHASES[Math.floor(date.getMonth() / 3)]!;
  const wave = WAVE[((wk % 4) + 4) % 4]!;
  const factor = readinessFactor(readiness);
  let focus = focusFor(opts.groups, date.getDay());
  if (factor <= 0.85 && focus !== "recovery") focus = "engine";

  const rx = (e: Ex) => ({ name: e.name, prescription: e.reps, rest: e.rest ?? "", cue: e.cue });
  const warmMin = duration === 30 ? 5 : 10;

  if (focus === "recovery") {
    const flow = duration - warmMin;
    return {
      title: "Active Recovery", intensity: "recovery", cooldown: "5 min box breathing.",
      coach_note: `${phase.name} phase. Today is about circulation and range of motion — move, don't grind.`,
      blocks: [
        { name: "Warm-up", format: "Easy flow", minutes: warmMin, exercises: WARMUP.slice(0, 2).map(rx) },
        { name: "Mobility & Zone 2", format: "Continuous, easy", minutes: flow, exercises: [
          { name: "Bike / walk / swim", prescription: `${Math.round(flow * 0.6)} min easy`, rest: "", cue: "Could hold a conversation" },
          { name: "Hip & T-spine circuit", prescription: `${Math.round(flow * 0.4)} min`, rest: "", cue: "Couch stretch, pigeon, thread the needle" }] },
      ],
    };
  }

  const metcons = METCONS[focus];
  const met = metcons[((wk % metcons.length) + metcons.length) % metcons.length]!;
  const blocks: WorkoutPlan["blocks"] = [{ name: "Warm-up", format: "2 rounds easy", minutes: warmMin, exercises: WARMUP.map(rx) }];

  const metEx = met.ex.map((e) => ({ name: e.name, prescription: loadFor(e, b, units, factor, tier), rest: e.rest ?? "", cue: e.cue }));

  if (duration === 30) {
    blocks.push({ name: met.name, format: met.format, minutes: 25 - 0, exercises: metEx });
  } else {
    if (focus !== "engine") {
      const lift = STRENGTH[focus];
      const ex: Ex = { name: LIFT_LABELS[lift], reps: phase.sets, lift, pct: phase.pct, rx: [135, 95], cue: "Same load all sets; leave 1–2 reps in the tank", rest: "2 min" };
      blocks.push({ name: "Strength", format: `${phase.name} · ${phase.sets}`, minutes: 20, exercises: [
        { name: ex.name, prescription: loadFor(ex, b, units, factor, tier, wave), rest: "2 min", cue: ex.cue }] });
    }
    const used = blocks.reduce((s, x) => s + x.minutes, 0);
    const accMin = duration === 90 ? 20 : 0;
    const extraEngine = duration === 90 && focus === "engine" ? 0 : 0;
    blocks.push({ name: met.name, format: met.format, minutes: duration - used - accMin - extraEngine, exercises: metEx });
    if (accMin) blocks.push({ name: "Accessory", format: "Superset, 3 rounds", minutes: accMin, exercises: ACCESSORY[focus].map(rx) });
  }

  const intensity: WorkoutPlan["intensity"] = factor >= 1 && wave > 0 ? "hard" : factor >= 0.95 ? "moderate" : "recovery";
  const waveLabel = wave < 0 ? "deload week" : wave === 0.1 ? "peak week" : "build week";
  const note = factor < 1
    ? `Readiness is down today, so loads are trimmed ${Math.round((1 - factor) * 100)}%. Same session as everyone else — just smarter weights.`
    : "You're ready. Hit the prescribed loads and own the metcon.";
  return {
    title: `${focus[0]!.toUpperCase()}${focus.slice(1)} · ${met.name}`,
    coach_note: `${phase.name} phase, ${waveLabel}. ${note}`,
    intensity, blocks, cooldown: "5 min easy spin + stretch the muscles you trained.",
  };
}
