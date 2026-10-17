import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { pageHead } from "@/lib/brand";
import { buildSession, type WorkoutPlan } from "@/lib/program";
import { Chips, Scale, Section } from "@/components/Chips";
import { WorkoutBlocks } from "@/components/WorkoutBlocks";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/try")({
  head: () =>
    pageHead(
      "Try a workout",
      "Create a sample functional-fitness session without an account.",
      "/try",
    ),
  component: TryPage,
});
function TryPage() {
  const [duration, setDuration] = useState<30 | 60 | 90>(60),
    [equipment, setEquipment] = useState("Full gym"),
    [energy, setEnergy] = useState<number | null>(null),
    [plan, setPlan] = useState<WorkoutPlan | null>(null);
  function generate() {
    if (energy === null) return;
    setPlan(
      buildSession({
        date: new Date(),
        duration,
        groups: ["Full body"],
        benchmarks: {},
        readiness: {
          energy,
          sleep_hours: 7,
          sleep_quality: null,
          stress: null,
          soreness: 3,
          motivation: null,
        },
        tier: "scaled",
        equipment:
          equipment === "Dumbbells + kettlebell" ? ["Dumbbells", "Kettlebells"] : [equipment],
        experience: "Intermediate",
      }),
    );
  }
  function preserve() {
    if (!plan) return;
    try {
      localStorage.setItem(
        "forge:pending-session",
        JSON.stringify({ plan, duration, timestamp: Date.now() }),
      );
    } catch {
      /* Storage may be unavailable. */
    }
  }
  return (
    <main className="mx-auto max-w-xl px-5 py-8">
      <Link to="/" className="text-muted-foreground">
        ← Home
      </Link>
      <h1 className="mt-6 text-4xl">Try your session</h1>
      <Section title="Minutes">
        <Chips options={[30, 60, 90]} value={duration} onChange={setDuration} />
      </Section>
      <Section title="Equipment">
        <Chips
          options={["Full gym", "Dumbbells + kettlebell", "Bodyweight only"]}
          value={equipment}
          onChange={setEquipment}
        />
      </Section>
      <Section title="Readiness">
        <Scale label="Energy" value={energy} onChange={setEnergy} low="drained" high="charged" />
      </Section>
      <Button
        variant="clay"
        size="xl"
        className="my-5 w-full"
        disabled={energy === null}
        onClick={generate}
      >
        Get my sample workout
      </Button>
      {plan && (
        <>
          <h2 className="text-3xl">{plan.title}</h2>
          <p className="mt-3 text-muted-foreground">{plan.coach_note}</p>
          <WorkoutBlocks plan={plan} />
          <p className="my-5">{plan.cooldown}</p>
          <Button asChild variant="ink" size="xl" className="w-full" onClick={preserve}>
            <Link to="/auth" search={{ mode: "signup", from: "try" }}>
              Save this session — create free account
            </Link>
          </Button>
        </>
      )}
    </main>
  );
}
