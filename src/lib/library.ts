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

// Simple "builder" bodybuilding supersets that pair with the functional blocks.
export const PUMP: Record<Exclude<Focus, "recovery">, Ex[]> = {
  lower: [
    { name: "Goblet squat", reps: "3 x 12", cue: "Slow down, drive up", rx: [35, 26] },
    { name: "Dumbbell Romanian deadlift", reps: "3 x 12", cue: "Hinge, soft knees", rx: [35, 25] },
    { name: "Glute bridge", reps: "3 x 15", cue: "Squeeze at the top" },
    { name: "Calf raises", reps: "3 x 20", cue: "Full range, pause at top" },
  ],
  upper: [
    { name: "Dumbbell biceps curl", reps: "3 x 12", cue: "Elbows pinned", rx: [25, 15] },
    { name: "Dumbbell triceps extension", reps: "3 x 12", cue: "Elbows to the ceiling", rx: [25, 15] },
    { name: "Push-ups", reps: "3 x max -2", cue: "Body in one line" },
    { name: "Dumbbell row", reps: "3 x 12/arm", cue: "Pull to the hip", rx: [40, 25] },
  ],
  engine: [
    { name: "Push-ups", reps: "3 x 12", cue: "Body in one line" },
    { name: "Dumbbell row", reps: "3 x 12/arm", cue: "Pull to the hip", rx: [40, 25] },
    { name: "Dumbbell lateral raise", reps: "3 x 15", cue: "Lead with elbows", rx: [15, 10] },
  ],
  oly: [
    { name: "Dumbbell shoulder press", reps: "3 x 10", cue: "Ribs down", rx: [35, 20] },
    { name: "Pull-ups", reps: "3 x 6–10", cue: "Chest to the bar" },
    { name: "Dumbbell biceps curl", reps: "3 x 12", cue: "Elbows pinned", rx: [25, 15] },
  ],
  full: [
    { name: "Dumbbell bench press", reps: "3 x 12", cue: "Shoulder blades pinned", rx: [40, 25] },
    { name: "Dumbbell row", reps: "3 x 12/arm", cue: "Pull to the hip", rx: [40, 25] },
    { name: "Dumbbell biceps curl", reps: "3 x 12", cue: "Elbows pinned", rx: [25, 15] },
    { name: "Dumbbell triceps extension", reps: "3 x 12", cue: "Elbows to the ceiling", rx: [25, 15] },
  ],
};
export const TABATA_CORE: Ex[] = [
  { name: "Hollow rock", reps: "20 s on / 10 s off", cue: "Low back down" },
  { name: "Mountain climbers", reps: "20 s on / 10 s off", cue: "Hips level" },
];
for (const list of [...Object.values(PUMP), TABATA_CORE])
  for (const m of list) m.requires = equipmentFor(m.name);

// ---- Expanded variety: rotating warm-ups, more circuits and builder sets ----
const w = (name: string, reps: string, cue: string): Ex => ({ name, reps, cue });
type TrainFocus = Exclude<Focus, "recovery">;
export const WARMUPS: Record<TrainFocus, { name: string; ex: Ex[] }[]> = {
  lower: [
    { name: "Hip opener", ex: [w("Easy bike", "3 min", "Build gradually"), w("Cossack squat", "6/side", "Sit deep, heel down"), w("Glute bridge", "12", "Squeeze at the top"), w("Air squats", "10 slow", "Pause at the bottom")] },
    { name: "Squat prep", ex: [w("Jumping jacks", "40", "Light on your feet"), w("Spiderman lunge", "5/side", "Elbow to instep"), w("Goblet squat hold", "30 s", "Pry knees open"), w("Lateral lunges", "8/side", "Push hips back")] },
    { name: "Posterior chain primer", ex: [w("Row", "300 m", "Smooth strokes"), w("Good mornings", "12", "Flat back"), w("Single-leg glute bridge", "8/side", "Hips level"), w("Squat jumps", "6", "Land soft")] },
    { name: "Athletic legs", ex: [w("High knees", "30 s", "Drive the knees"), w("Butt kicks", "30 s", "Quick feet"), w("Reverse lunges", "6/side", "Knee kisses the floor"), w("World's greatest stretch", "4/side", "Breathe into it")] },
  ],
  upper: [
    { name: "Shoulder prep", ex: [w("Row", "250 m", "Easy pace"), w("Arm circles", "15 each way", "Big and slow"), w("Scapular push-ups", "10", "Arms stay straight"), w("Inchworms", "5", "Walk hands out long")] },
    { name: "Push-pull primer", ex: [w("Jumping jacks", "40", "Light on your feet"), w("Prone Y-T raise", "8 each", "Thumbs up"), w("Incline push-up", "10", "Body in one line"), w("Scapular pull-ups", "8", "Shoulders down and back")] },
    { name: "Calisthenics prep", ex: [w("Bear crawl", "20 m", "Knees hover"), w("Wrist rocks", "10", "Ease into it"), w("Pike push-up", "6", "Head through the arms"), w("Hollow hold", "20 s", "Low back glued")] },
    { name: "Thoracic reset", ex: [w("Easy bike", "3 min", "Conversational pace"), w("Thread the needle", "6/side", "Follow your hand"), w("Down-dog to cobra", "8", "Slow transitions"), w("Push-ups", "8", "Quality reps")] },
  ],
  engine: [
    { name: "Run builder", ex: [w("Jog", "3 min", "Nose breathing"), w("A-skips", "20 m", "Tall posture"), w("Leg swings", "10/side", "Relaxed swing"), w("Strides", "3 x 15 s", "Build to 80%")] },
    { name: "Engine ramp", ex: [w("Row", "2 min easy + 1 min moderate", "Build gradually"), w("Burpees", "5", "Smooth, not fast"), w("World's greatest stretch", "4/side", "Breathe into it")] },
    { name: "Bootcamp primer", ex: [w("Jumping jacks", "50", "Light on your feet"), w("Mountain climbers", "20", "Hips level"), w("Air squats", "15", "Full depth"), w("Inchworms", "5", "Walk hands out long")] },
    { name: "Rope rhythm", ex: [w("Single-unders", "2 min", "Stay on the balls of your feet"), w("Lateral hops", "20", "Quick contacts"), w("Spiderman lunge", "4/side", "Elbow to instep")] },
  ],
  oly: [
    { name: "Barbell complex", ex: [w("Row", "300 m", "Smooth strokes"), w("Movement prep with empty bar", "2 rounds", "Rehearse today's patterns"), w("Overhead squat with PVC", "8", "Active shoulders"), w("Muscle snatch with empty bar", "5", "Elbows high and outside")] },
    { name: "Lifter's mobility", ex: [w("Goblet squat hold", "45 s", "Pry knees open"), w("Front rack stretch", "30 s/side", "Elbows up"), w("Hang power clean with empty bar", "5", "Jump and shrug"), w("Broad jumps", "4", "Explode, land soft")] },
    { name: "Triple extension", ex: [w("Easy bike", "3 min", "Build gradually"), w("Squat jumps", "6", "Land soft"), w("Good mornings", "10", "Flat back"), w("Push press with empty bar", "8", "Dip and drive")] },
  ],
  full: [
    { name: "Classic prep", ex: [w("Easy row / bike", "3 min", "Build gradually"), w("World's greatest stretch", "5/side", "Breathe into it"), w("Movement prep with empty bar", "2 rounds", "Rehearse today's patterns")] },
    { name: "Military PT", ex: [w("Jumping jacks", "40", "Count out loud"), w("Push-ups", "10", "Body in one line"), w("Air squats", "15", "Full depth"), w("Flutter kicks", "20", "Low back down")] },
    { name: "Freestyle flow", ex: [w("Bear crawl", "20 m", "Knees hover"), w("Inchworms", "5", "Walk hands out long"), w("Reverse lunges", "6/side", "Stay tall"), w("Burpees", "5", "Smooth, not fast")] },
    { name: "Dynamic total body", ex: [w("Jog", "2 min", "Easy pace"), w("Arm circles", "10 each way", "Big and slow"), w("Cossack squat", "5/side", "Sit deep"), w("Plank shoulder taps", "16", "Hips still")] },
  ],
};

const extra: Record<TrainFocus, Metcon[]> = {
  lower: [
    { name: "Squat Tabata", format: "Tabata 8 rounds each", minutes: 8, ex: [ex("Air squats", "20 s on / 10 s off"), ex("Reverse lunges", "20 s on / 10 s off")] },
    { name: "Hinge & Hop", format: "E2MOM 16", minutes: 16, ex: [ex("Kettlebell deadlift", "12"), ex("Box jumps", "8"), ex("Wall sit", "30 s")] },
    { name: "Sandbag Patrol", format: "AMRAP 14", minutes: 14, ex: [ex("Goblet squat", "12"), ex("Walking lunges", "16"), ex("Broad jumps", "6"), ex("Run", "200 m")] },
  ],
  upper: [
    { name: "Calisthenics Ladder", format: "EMOM 16", minutes: 16, ex: [ex("Pull-ups", "5"), ex("Push-ups", "12"), ex("Pike push-up", "8"), ex("Hollow hold", "30 s")] },
    { name: "Upper Tabata", format: "Tabata 8 rounds each", minutes: 8, ex: [ex("Push-ups", "20 s on / 10 s off"), ex("Ring rows", "20 s on / 10 s off")] },
    { name: "Bench & Bar", format: "4 rounds for quality", minutes: 16, ex: [ex("Dumbbell bench press", "10"), ex("Dumbbell row", "10/arm"), ex("Dips", "10"), ex("Plank shoulder taps", "20")] },
  ],
  engine: [
    { name: "Bootcamp 400s", format: "5 rounds for time · cap 20", minutes: 20, ex: [ex("Run", "400 m"), ex("Burpees", "10"), ex("Flutter kicks", "20")] },
    { name: "30/30 Engine", format: "EMOM 16 · 30 s on / 30 s off", minutes: 16, ex: [ex("Bike", "30 s hard"), ex("Mountain climbers", "30 s"), ex("Row", "30 s hard"), ex("Jumping jacks", "30 s")] },
    { name: "Burpee Deck", format: "AMRAP 12", minutes: 12, ex: [ex("Burpees", "8"), ex("Squat jumps", "10"), ex("High knees", "30 s")] },
  ],
  oly: [
    { name: "Hang Clean EMOM", format: "EMOM 10", minutes: 10, ex: [ex("Hang power clean", "3", "clean_jerk", 0.45), ex("Push press", "3", "push_press", 0.45)] },
    { name: "Dumbbell Oly Sprint", format: "AMRAP 12", minutes: 12, ex: [ex("Dumbbell snatch", "10 alt"), ex("Dumbbell power clean", "8"), ex("Box step-ups", "10")] },
    { name: "Overhead Engine", format: "3 x 3 min on / 1 min off", minutes: 12, ex: [ex("Overhead squat", "6", "snatch", 0.4), ex("Burpees", "6"), ex("Row", "150 m")] },
  ],
  full: [
    { name: "Murph Lite", format: "For time · cap 25", minutes: 25, ex: [ex("Run", "800 m"), ex("Pull-ups", "50"), ex("Push-ups", "100"), ex("Air squats", "150"), ex("Run", "800 m")] },
    { name: "Freestyle Pyramid", format: "For time · cap 15", minutes: 15, ex: [ex("Burpees", "5-10-15-10-5"), ex("Sit-ups", "10-20-30-20-10"), ex("Squat jumps", "5-10-15-10-5")] },
    { name: "Total Body Tabata", format: "Tabata 4 movements", minutes: 16, ex: [ex("Kettlebell swings", "20 s on / 10 s off"), ex("Push-ups", "20 s on / 10 s off"), ex("Air squats", "20 s on / 10 s off"), ex("Sit-ups", "20 s on / 10 s off")] },
  ],
};
for (const f of Object.keys(extra) as TrainFocus[]) METCONS[f].push(...extra[f]);

const b = (name: string, reps: string, cue: string, rx?: [number, number]): Ex => (rx ? { name, reps, cue, rx } : { name, reps, cue });
export const PUMP_SETS: Record<TrainFocus, Ex[][]> = {
  lower: [
    PUMP.lower,
    [b("Bulgarian split squat", "3 x 10/leg", "Torso tall"), b("Dumbbell Romanian deadlift", "3 x 10", "Hinge, soft knees", [40, 25]), b("Wall sit", "3 x 40 s", "Thighs parallel"), b("Single-leg calf raise", "3 x 12/side", "Pause at top")],
    [b("Leg press or goblet squat", "4 x 12", "Full depth, control"), b("Hamstring curl (machine or slider)", "3 x 12", "Slow lowering"), b("Hip thrust", "3 x 12", "Chin tucked, ribs down"), b("Lateral lunges", "3 x 8/side", "Push hips back")],
  ],
  upper: [
    PUMP.upper,
    [b("Dumbbell hammer curl", "3 x 12", "Neutral grip", [25, 15]), b("Bench dips", "3 x 12", "Elbows back"), b("Dumbbell lateral raise", "3 x 15", "Lead with elbows", [15, 10]), b("Diamond push-ups", "3 x 8", "Elbows tight")],
    [b("Lat pulldown or band pulldown", "4 x 12", "Elbows to ribs"), b("Cable or band triceps pushdown", "3 x 15", "Elbows pinned"), b("Dumbbell incline press", "3 x 10", "Control down", [40, 25]), b("Face pulls (band)", "3 x 15", "Pull to forehead")],
    [b("Archer push-ups", "3 x 5/side", "Shift slowly"), b("Chin-ups", "3 x 5–8", "Chest to bar"), b("Pike push-up", "3 x 8", "Head through the arms"), b("Superman hold", "3 x 30 s", "Squeeze glutes")],
  ],
  engine: [
    PUMP.engine,
    [b("Plank shoulder taps", "3 x 20", "Hips still"), b("Dumbbell biceps curl", "3 x 12", "Elbows pinned", [25, 15]), b("Bench dips", "3 x 12", "Elbows back")],
  ],
  oly: [
    PUMP.oly,
    [b("Dumbbell shrugs", "3 x 15", "Pause at the top", [50, 30]), b("Dumbbell reverse fly", "3 x 15", "Squeeze shoulder blades", [15, 10]), b("Back extension (superman)", "3 x 12", "Glutes on")],
  ],
  full: [
    PUMP.full,
    [b("Push-ups", "3 x 12", "Body in one line"), b("Chin-ups", "3 x 6–8", "Chest to bar"), b("Goblet squat", "3 x 12", "Slow down, drive up", [35, 26]), b("Dumbbell hammer curl", "3 x 12", "Neutral grip", [25, 15])],
    [b("Dumbbell incline press", "3 x 10", "Control down", [40, 25]), b("Dumbbell row", "3 x 12/arm", "Pull to the hip", [40, 25]), b("Dumbbell lateral raise", "3 x 15", "Lead with elbows", [15, 10]), b("Cable or band triceps pushdown", "3 x 15", "Elbows pinned")],
  ],
};
export function dayNumber(d: Date) {
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
}
for (const list of [
  ...Object.values(WARMUPS).flat().map((x) => x.ex),
  ...Object.values(extra).flat().map((m) => m.ex),
  ...Object.values(PUMP_SETS).flat(),
])
  for (const m of list) m.requires = equipmentFor(m.name);
