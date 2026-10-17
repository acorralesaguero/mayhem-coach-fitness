import type { Lift } from "./program";
export type Ex = {
  name: string;
  reps: string;
  lift?: Lift | undefined;
  pct?: number | undefined;
  rx?: [number, number];
  cue: string;
  rest?: string;
  requires?: string;
};
export type Metcon = { name: string; format: string; minutes: number; ex: Ex[] };
export type Focus = "lower" | "upper" | "engine" | "oly" | "full" | "recovery";

export const LIFT_LABELS: Record<Lift, string> = {
  back_squat: "Back squat",
  front_squat: "Front squat",
  deadlift: "Deadlift",
  strict_press: "Strict press",
  push_press: "Push press",
  clean_jerk: "Clean & jerk",
  snatch: "Snatch",
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
  lower: "back_squat",
  upper: "strict_press",
  oly: "clean_jerk",
  full: "deadlift",
};

export const METCONS: Record<Exclude<Focus, "recovery">, Metcon[]> = {
  lower: [
    {
      name: "Leg Burner",
      format: "4 rounds for time",
      minutes: 14,
      ex: [
        {
          name: "Thrusters",
          reps: "12",
          lift: "front_squat",
          pct: 0.4,
          rx: [95, 65],
          cue: "Drive from heels, bar finishes over mid-foot",
        },
        { name: "Box jumps", reps: "15", cue: "Stand tall at the top" },
        { name: "Walking lunges", reps: "20", cue: "Knee kisses the floor" },
      ],
    },
    {
      name: "Wall Street",
      format: "AMRAP 12",
      minutes: 12,
      ex: [
        { name: "Wall balls", reps: "15", rx: [20, 14], cue: "Full depth, fast hips" },
        {
          name: "Deadlifts",
          reps: "9",
          lift: "deadlift",
          pct: 0.5,
          rx: [185, 125],
          cue: "Lats tight, bar close",
        },
        { name: "Burpees", reps: "6", cue: "Steady breathing" },
      ],
    },
  ],
  upper: [
    {
      name: "Press & Pull",
      format: "EMOM 12",
      minutes: 12,
      ex: [
        {
          name: "Min 1: Push press",
          reps: "8",
          lift: "push_press",
          pct: 0.55,
          rx: [115, 75],
          cue: "Dip straight down",
        },
        { name: "Min 2: Pull-ups", reps: "8–10", cue: "Scale to ring rows" },
        { name: "Min 3: Push-ups", reps: "12–15", cue: "Plank tight" },
      ],
    },
    {
      name: "Upper Chipper",
      format: "For time",
      minutes: 14,
      ex: [
        {
          name: "Dumbbell snatch (alt.)",
          reps: "30",
          rx: [50, 35],
          cue: "Punch through at the top",
        },
        { name: "Toes-to-bar", reps: "30", cue: "Kip from the lats" },
        {
          name: "Shoulder-to-overhead",
          reps: "20",
          lift: "push_press",
          pct: 0.5,
          rx: [115, 75],
          cue: "Lock out, head through",
        },
      ],
    },
  ],
  engine: [
    {
      name: "Aerobic Builder",
      format: "5 x 4 min on / 1 min off",
      minutes: 25,
      ex: [
        {
          name: "Row or bike",
          reps: "4 min @ conversational pace",
          cue: "Nasal breathing if you can",
        },
      ],
    },
    {
      name: "Mixed Monostructural",
      format: "3 rounds, steady",
      minutes: 24,
      ex: [
        { name: "Run", reps: "800 m", cue: "Even splits" },
        { name: "Row", reps: "750 m", cue: "Legs-body-arms" },
        { name: "Double-unders", reps: "60", cue: "Scale: 120 singles" },
      ],
    },
  ],
  oly: [
    {
      name: "Speed & Power",
      format: "10 rounds for time",
      minutes: 12,
      ex: [
        {
          name: "Power cleans",
          reps: "3",
          lift: "clean_jerk",
          pct: 0.6,
          rx: [135, 95],
          cue: "Fast elbows",
        },
        { name: "Bar-facing burpees", reps: "5", cue: "Jump two feet" },
      ],
    },
    {
      name: "Snatch Sprint",
      format: "AMRAP 8",
      minutes: 8,
      ex: [
        {
          name: "Power snatch",
          reps: "5",
          lift: "snatch",
          pct: 0.55,
          rx: [95, 65],
          cue: "Bar close, punch under",
        },
        { name: "Air squats", reps: "10", cue: "Full depth" },
      ],
    },
  ],
  full: [
    {
      name: "The Grinder",
      format: "21-15-9 for time",
      minutes: 12,
      ex: [
        {
          name: "Deadlifts",
          reps: "21-15-9",
          lift: "deadlift",
          pct: 0.55,
          rx: [225, 155],
          cue: "Brace before every pull",
        },
        { name: "Kettlebell swings", reps: "21-15-9", rx: [53, 35], cue: "Hips snap" },
        { name: "Burpees", reps: "21-15-9", cue: "Unbroken pace" },
      ],
    },
    {
      name: "Hybrid Ladder",
      format: "AMRAP 14",
      minutes: 14,
      ex: [
        { name: "Cal row", reps: "12", cue: "Hard pull, relaxed return" },
        {
          name: "Front squats",
          reps: "9",
          lift: "front_squat",
          pct: 0.5,
          rx: [115, 75],
          cue: "Elbows high",
        },
        { name: "Pull-ups", reps: "6", cue: "Scale to jumping pull-ups" },
      ],
    },
  ],
};

export const ACCESSORY: Record<Exclude<Focus, "recovery">, Ex[]> = {
  lower: [
    { name: "Bulgarian split squat", reps: "3 x 10/leg", cue: "Torso tall" },
    { name: "Nordic curls", reps: "3 x 6", cue: "Slow eccentric" },
  ],
  upper: [
    { name: "Dumbbell bench press", reps: "3 x 12", cue: "Shoulder blades pinned" },
    { name: "Bent-over rows", reps: "3 x 12", cue: "Pull to hip" },
  ],
  engine: [
    { name: "Sled push / heavy carry", reps: "6 x 20 m", cue: "Short fast steps" },
    { name: "Hollow hold", reps: "4 x 30 s", cue: "Low back glued" },
  ],
  oly: [
    { name: "Snatch-grip RDL", reps: "3 x 8", cue: "Lats on" },
    { name: "Overhead squat", reps: "3 x 5 light", cue: "Active shoulders" },
  ],
  full: [
    { name: "Farmer carry", reps: "4 x 40 m", cue: "Tall posture" },
    { name: "GHD sit-ups / weighted plank", reps: "3 x 15 / 45 s", cue: "Control" },
  ],
};

export const WARMUP: Ex[] = [
  { name: "Easy row / bike", reps: "3 min", cue: "Build gradually" },
  { name: "World's greatest stretch", reps: "5/side", cue: "Breathe into it" },
  { name: "Movement prep with empty bar", reps: "2 rounds", cue: "Rehearse today's patterns" },
];

// Independently authored, conservative draft sessions for coach review.
const ex = (name: string, reps: string, lift?: Lift, pct?: number): Ex => ({
  name,
  reps,
  lift,
  pct,
  cue: "Controlled technique; stop if painful",
});
const added: Record<Exclude<Focus, "recovery">, Metcon[]> = {
  lower: [
    {
      name: "Groundwork",
      format: "AMRAP 10",
      minutes: 10,
      ex: [ex("Goblet squat", "10"), ex("Reverse lunges", "12"), ex("Plank", "30 s")],
    },
    {
      name: "Step & Settle",
      format: "EMOM 12",
      minutes: 12,
      ex: [ex("Box step-ups", "10"), ex("Air squats", "12"), ex("Easy bike", "40 s")],
    },
    {
      name: "Lower Ladder",
      format: "For time · cap 15",
      minutes: 15,
      ex: [
        ex("Front squats", "15-12-9", "front_squat", 0.35),
        ex("Walking lunges", "20-16-12"),
        ex("Sit-ups", "15-12-9"),
      ],
    },
    {
      name: "Steady Legs",
      format: "4 x 3 min on / 1 min off",
      minutes: 16,
      ex: [ex("Kettlebell swings", "12"), ex("Air squats", "15"), ex("Run", "100 m")],
    },
  ],
  upper: [
    {
      name: "Push Pull Pace",
      format: "AMRAP 12",
      minutes: 12,
      ex: [ex("Dumbbell push press", "10"), ex("Ring rows", "10"), ex("Sit-ups", "12")],
    },
    {
      name: "Upper Engine",
      format: "EMOM 15",
      minutes: 15,
      ex: [ex("Strict press", "8", "strict_press", 0.35), ex("Pull-ups", "6"), ex("Row", "40 s")],
    },
    {
      name: "Press Path",
      format: "For time · cap 14",
      minutes: 14,
      ex: [ex("Push-ups", "30"), ex("Dumbbell rows", "30"), ex("Dumbbell push press", "30")],
    },
    {
      name: "Shoulder Rhythm",
      format: "5 x 2 min on / 1 min off",
      minutes: 15,
      ex: [
        ex("Push press", "8", "push_press", 0.35),
        ex("Ring rows", "10"),
        ex("Mountain climbers", "20"),
      ],
    },
  ],
  engine: [
    {
      name: "Easy Miles",
      format: "AMRAP 16",
      minutes: 16,
      ex: [ex("Run", "400 m"), ex("Burpees", "6")],
    },
    {
      name: "Engine Clock",
      format: "EMOM 15",
      minutes: 15,
      ex: [ex("Row", "45 s"), ex("Bike", "45 s"), ex("Walk", "45 s")],
    },
    {
      name: "Pace Chipper",
      format: "For time · cap 20",
      minutes: 20,
      ex: [ex("Row", "1000 m"), ex("Run", "800 m"), ex("Single-unders", "100")],
    },
    {
      name: "Cruise Intervals",
      format: "4 x 4 min on / 1 min off",
      minutes: 20,
      ex: [ex("Bike", "4 min comfortable")],
    },
  ],
  oly: [
    {
      name: "Clean Rhythm",
      format: "EMOM 12",
      minutes: 12,
      ex: [ex("Power cleans", "3", "clean_jerk", 0.4), ex("Air squats", "12"), ex("Walk", "40 s")],
    },
    {
      name: "Light & Fast",
      format: "AMRAP 10",
      minutes: 10,
      ex: [ex("Power snatch", "4", "snatch", 0.35), ex("Burpees", "6")],
    },
    {
      name: "Technique Chipper",
      format: "For time · cap 15",
      minutes: 15,
      ex: [ex("Clean & jerk", "20", "clean_jerk", 0.35), ex("Sit-ups", "30"), ex("Run", "400 m")],
    },
    {
      name: "Power Windows",
      format: "4 x 2 min on / 1 min off",
      minutes: 12,
      ex: [ex("Power cleans", "5", "clean_jerk", 0.4), ex("Box step-ups", "10")],
    },
  ],
  full: [
    {
      name: "Everyday Athlete",
      format: "AMRAP 12",
      minutes: 12,
      ex: [ex("Goblet squat", "10"), ex("Push-ups", "8"), ex("Run", "200 m")],
    },
    {
      name: "Full Circuit",
      format: "EMOM 15",
      minutes: 15,
      ex: [
        ex("Deadlifts", "8", "deadlift", 0.35),
        ex("Dumbbell push press", "10"),
        ex("Row", "40 s"),
      ],
    },
    {
      name: "Whole Body Chipper",
      format: "For time · cap 18",
      minutes: 18,
      ex: [
        ex("Walking lunges", "40"),
        ex("Kettlebell swings", "30"),
        ex("Push-ups", "20"),
        ex("Burpees", "10"),
      ],
    },
    {
      name: "Balanced Intervals",
      format: "5 x 2 min on / 1 min off",
      minutes: 15,
      ex: [ex("Front squats", "6", "front_squat", 0.35), ex("Ring rows", "8"), ex("Bike", "30 s")],
    },
  ],
};
for (const focus of Object.keys(added) as (keyof typeof added)[])
  METCONS[focus].push(...added[focus]);
export const STRENGTH_OPTIONS: Record<Exclude<Focus, "recovery" | "engine">, Ex[]> = {
  lower: [
    ex("Back squat", "", "back_squat"),
    ex("Front squat", "", "front_squat"),
    ex("Deadlift", "", "deadlift"),
  ],
  upper: [
    ex("Strict press", "", "strict_press"),
    ex("Push press", "", "push_press"),
    ex("Weighted dumbbell row", ""),
  ],
  oly: [
    ex("Clean & jerk", "", "clean_jerk"),
    ex("Snatch", "", "snatch"),
    ex("Clean & jerk technique", "", "clean_jerk"),
  ],
  full: [
    ex("Deadlift", "", "deadlift"),
    ex("Front squat", "", "front_squat"),
    ex("Push press", "", "push_press"),
  ],
};
export const RECOVERY = [
  {
    name: "Restore & Walk",
    ex: [ex("Walk", "Easy pace"), ex("Hip & T-spine circuit", "Controlled flow")],
  },
  {
    name: "Gentle Reset",
    ex: [
      ex("Easy bike", "Conversational pace"),
      ex("Couch stretch", "60 s/side"),
      ex("Box breathing", "3 min"),
    ],
  },
  {
    name: "Range & Rhythm",
    ex: [ex("Walk", "Easy pace"), ex("Cat-cow", "10 slow reps"), ex("Thread the needle", "8/side")],
  },
];
export function equipmentFor(name: string): string {
  if (/dumbbell|\bdb\b/i.test(name)) return "Dumbbells";
  if (/kettlebell|goblet|farmer carry/i.test(name)) return "Kettlebells";
  if (/ring|band|landmine|wall ball|box (jump|step)|sled|ghd|nordic|swim|skierg/i.test(name))
    return "Full gym";
  if (/pull.?up|toes.?to.?bar|hanging/i.test(name)) return "Pull-up bar";
  if (/under|jump rope/i.test(name)) return "Jump rope";
  if (/row|bike|cal row/i.test(name)) return "Rower / bike";
  if (
    /bar|thruster|press|clean|snatch|deadlift|rdl|front squat|back squat|overhead squat|shoulder.to.overhead/i.test(
      name,
    ) &&
    !/push.up|pike|single.leg/i.test(name)
  )
    return "Barbell & plates";
  return "Bodyweight only";
}
for (const list of [
  ...Object.values(METCONS)
    .flat()
    .map((m) => m.ex),
  ...Object.values(ACCESSORY),
  WARMUP,
  ...Object.values(STRENGTH_OPTIONS),
  ...RECOVERY.map((r) => r.ex),
])
  for (const movement of list) {
    movement.requires = equipmentFor(movement.name);
    if (!movement.lift) {
      const n = movement.name.toLowerCase();
      if (!/dumbbell|kettlebell|goblet|single-leg/.test(n)) {
        if (/back squat/.test(n)) movement.lift = "back_squat";
        else if (/front squat/.test(n)) movement.lift = "front_squat";
        else if (/deadlift/.test(n)) movement.lift = "deadlift";
        else if (/strict press/.test(n)) movement.lift = "strict_press";
        else if (/push press|shoulder.to.overhead/.test(n)) movement.lift = "push_press";
        else if (/clean/.test(n)) movement.lift = "clean_jerk";
        else if (/snatch/.test(n)) movement.lift = "snatch";
      }
    }
  }
