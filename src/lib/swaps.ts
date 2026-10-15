// Stimulus-matched movement substitutions. Pure — tested in src/test/swaps.test.ts.
const GROUPS: { match: RegExp; options: string[] }[] = [
  { match: /row(er|ing)?\b(?!.*(ring|dumbbell|db|barbell|bent))/i, options: ["Echo bike", "SkiErg", "Run", "Jump rope (double-unders)"] },
  { match: /bike|assault|echo/i, options: ["Row", "SkiErg", "Run", "Jump rope (double-unders)"] },
  { match: /ski/i, options: ["Row", "Echo bike", "Burpees"] },
  { match: /\brun\b|sprint|shuttle/i, options: ["Row", "Echo bike", "Jump rope (double-unders)"] },
  { match: /double.?under|jump rope/i, options: ["Single-unders (x3)", "Lateral hops", "Row"] },
  { match: /front squat|back squat|\bsquat\b/i, options: ["Dumbbell front squat", "Goblet squat", "Bulgarian split squat", "Air squat (tempo)"] },
  { match: /deadlift|rdl/i, options: ["Dumbbell RDL", "Kettlebell deadlift", "Single-leg RDL", "Hip thrust"] },
  { match: /press|jerk/i, options: ["Dumbbell push press", "Landmine press", "Pike push-up", "Kettlebell press"] },
  { match: /clean|snatch/i, options: ["Dumbbell power clean", "Dumbbell snatch", "Kettlebell swing", "Hang power clean"] },
  { match: /thruster|wall ball/i, options: ["Dumbbell thruster", "Wall ball", "Goblet squat + press"] },
  { match: /pull.?up|chin|muscle.?up|toes.?to.?bar/i, options: ["Ring row", "Dumbbell row", "Banded pull-up", "Hanging knee raise"] },
  { match: /push.?up|dip|bench/i, options: ["Dumbbell bench press", "Incline push-up", "Ring push-up"] },
  { match: /lunge|step.?up|box/i, options: ["Reverse lunge", "Step-up", "Air squat", "Box jump"] },
  { match: /swing|kettlebell/i, options: ["Dumbbell swing", "Hip thrust", "Banded good morning"] },
  { match: /burpee/i, options: ["Up-down (no push-up)", "Squat thrust", "Mountain climbers"] },
];

const GENERIC = ["Dumbbell version", "Bodyweight version", "Kettlebell version"];

export function swapOptions(name: string): string[] {
  const g = GROUPS.find((x) => x.match.test(name));
  return (g?.options ?? GENERIC).filter((o) => o.toLowerCase() !== name.toLowerCase());
}
