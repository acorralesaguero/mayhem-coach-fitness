import type { Lift } from "./program";
export type Ex = { name: string; reps: string; lift?: Lift; pct?: number; rx?: [number, number]; cue: string; rest?: string; requires?: string };
export type Metcon = { name: string; format: string; minutes: number; ex: Ex[] };
export type Focus = "lower" | "upper" | "engine" | "oly" | "full" | "recovery";

const LIB_LIFT_LABELS: Record<Lift, string> = {
  back_squat: "Back squat", front_squat: "Front squat", deadlift: "Deadlift", strict_press: "Strict press",
  push_press: "Push press", clean_jerk: "Clean & jerk", snatch: "Snatch",
};

// Quarterly phase → strength scheme
export const PHASES = [
  { name: "Base / Hypertrophy", sets: "4 x 8", pct: 0.65 },
  { name: "Strength", sets: "5 x 5", pct: 0.75 },
  { name: "Peak", sets: "5 x 3", pct: 0.82 },
  { name: "Rebuild", sets: "4 x 6", pct: 0.7 },
];
// 4-week wave: build, build, peak, deload
export const WAVE = [0, 0.05, 0.1, -0.1];

export const STRENGTH: Record<Exclude<Focus, "recovery" | "engine">, Lift> = {
  lower: "back_squat", upper: "strict_press", oly: "clean_jerk", full: "deadlift",
};

export const METCONS: Record<Exclude<Focus, "recovery">, Metcon[]> = {
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

export const ACCESSORY: Record<Exclude<Focus, "recovery">, Ex[]> = {
  lower: [{ name: "Bulgarian split squat", reps: "3 x 10/leg", cue: "Torso tall" }, { name: "Nordic curls", reps: "3 x 6", cue: "Slow eccentric" }],
  upper: [{ name: "Dumbbell bench press", reps: "3 x 12", cue: "Shoulder blades pinned" }, { name: "Bent-over rows", reps: "3 x 12", cue: "Pull to hip" }],
  engine: [{ name: "Sled push / heavy carry", reps: "6 x 20 m", cue: "Short fast steps" }, { name: "Hollow hold", reps: "4 x 30 s", cue: "Low back glued" }],
  oly: [{ name: "Snatch-grip RDL", reps: "3 x 8", cue: "Lats on" }, { name: "Overhead squat", reps: "3 x 5 light", cue: "Active shoulders" }],
  full: [{ name: "Farmer carry", reps: "4 x 40 m", cue: "Tall posture" }, { name: "GHD sit-ups / weighted plank", reps: "3 x 15 / 45 s", cue: "Control" }],
};

export const WARMUP: Ex[] = [
  { name: "Easy row / bike", reps: "3 min", cue: "Build gradually" },
  { name: "World's greatest stretch", reps: "5/side", cue: "Breathe into it" },
  { name: "Movement prep with empty bar", reps: "2 rounds", cue: "Rehearse today's patterns" },
];

