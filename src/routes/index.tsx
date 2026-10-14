import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import hero from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Forge — Your Hybrid Athlete Coach" },
      { name: "description", content: "Functional fitness coaching that adapts to your sleep, energy and week. 30, 60 and 90 minute sessions." },
      { property: "og:title", content: "Forge — Your Hybrid Athlete Coach" },
      { property: "og:description", content: "Functional fitness coaching that adapts to your sleep, energy and week." },
    ],
  }),
  component: Index,
});

function Index() {
  const { session } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (session) navigate({ to: "/today" });
  }, [session, navigate]);

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-ink text-ink-foreground">
      <img src={hero} alt="Athlete preparing to lift a kettlebell" width={896} height={1280}
        className="absolute inset-0 h-full w-full object-cover opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
      <div className="relative mx-auto flex min-h-[100dvh] max-w-xl flex-col justify-between px-6 pb-10 pt-8">
        <span className="font-display text-2xl tracking-wide">Forge</span>
        <div>
          <p className="eyebrow !text-sand">Hybrid athlete coaching</p>
          <h1 className="mt-3 text-5xl leading-[0.95] sm:text-6xl">
            Train with intent.<br /><em className="text-sand">Adapt every day.</em>
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-relaxed opacity-80">
            Strength, engine and skill — programmed around your week and how you actually feel this morning.
            Sessions in 30, 60 or 90 minutes.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="clay" size="xl"><Link to="/auth">Start training</Link></Button>
          </div>
        </div>
      </div>
    </main>
  );
}
