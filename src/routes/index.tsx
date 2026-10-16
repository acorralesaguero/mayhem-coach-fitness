import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import hero from "@/assets/forge-start.jpg";
import logo from "@/assets/forge-logo.png";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Forge — Your Hybrid Athlete Coach" },
      { name: "description", content: "Functional fitness coaching that adapts to your sleep, energy and week. 30, 60 and 90 minute sessions." },
      { property: "og:title", content: "Forge — Your Hybrid Athlete Coach" },
      { property: "og:description", content: "Functional fitness coaching that adapts to your sleep, energy and week." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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
      <img src={hero} alt="Kettlebell and weight plates in a sunlit functional fitness gym" width={1024} height={1536}
        className="absolute inset-0 h-full w-full object-cover object-center" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
      <div className="relative mx-auto flex min-h-[100dvh] max-w-xl flex-col justify-between px-6 pb-10 pt-8">
        <h1 className="w-full max-w-sm">
          <img src={logo} alt="Forge" width={1346} height={280} className="h-auto w-full" />
        </h1>
        <div>
          <p className="eyebrow !text-sand">Hybrid athlete coaching</p>
          <h2 className="mt-3 text-5xl leading-[1] sm:text-6xl">
            Train with intent.<br /><em className="text-sand">Adapt every day.</em>
          </h2>
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
