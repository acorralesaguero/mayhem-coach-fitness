import { useTranslation } from "@/lib/i18n";
import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/forge-start.jpg";
import avif800 from "@/assets/forge-start-800.avif";
import avif1600 from "@/assets/forge-start-1600.avif";
import webp800 from "@/assets/forge-start-800.webp";
import webp1600 from "@/assets/forge-start-1600.webp";
import logo from "@/assets/forge-logo.png";
import { BRAND, pageHead, SITE_URL } from "@/lib/brand";
import { buildSession } from "@/lib/program";
import { WorkoutBlocks } from "@/components/WorkoutBlocks";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
export const SHOW_TESTIMONIALS = false;
export const FAQ_COPY = {
  price: "A sample session is available without an account. Pricing details are not yet available.",
};
export const Route = createFileRoute("/")({
  head: () => {
    const h = pageHead(
      "Adaptive functional-fitness workouts",
      "Strength, engine and skill in 30, 60 or 90 minutes, adapted to your readiness and equipment.",
      "/",
    );
    return {
      ...h,
      meta: [
        ...h.meta,
        { property: "og:image", content: SITE_URL + "/forge-cover.jpg" },
        { name: "twitter:image", content: SITE_URL + "/forge-cover.jpg" },
      ],
    };
  },
  component: Home,
});
function Home() {
  const { t } = useTranslation();
  const plan = buildSession({
    date: new Date(2026, 9, 17),
    duration: 60,
    groups: ["Full body"],
    benchmarks: {},
    readiness: {
      energy: 3,
      sleep_hours: 7,
      sleep_quality: null,
      stress: null,
      soreness: 3,
      motivation: null,
    },
    tier: "scaled",
    equipment: ["Full gym"],
    experience: "Intermediate",
  });
  return (
    <main>
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <picture>
          <source type="image/avif" srcSet={`${avif800} 800w, ${avif1600} 1600w`} sizes="100vw" />
          <source type="image/webp" srcSet={`${webp800} 800w, ${webp1600} 1600w`} sizes="100vw" />
          <img
            src={hero}
            alt={t("Kettlebell and plates in a sunlit gym")}
            width={1024}
            height={1536}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </picture>
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/90 to-ink/50" />
        <div className="relative mx-auto max-w-5xl px-6 pb-12 pt-7">
          <header className="mb-20 flex items-center justify-between gap-4">
            <img src={logo} alt={t(BRAND.name)} width={260} height={54} className="w-40" />
            <Button
              asChild
              variant="outline"
              className="border-ink-foreground/40 bg-transparent text-ink-foreground"
            >
              <Link to="/auth" search={{ mode: "signin" }}>
                {t(" Sign in ")}
              </Link>
            </Button>
          </header>
          <p className="eyebrow text-sand">
            {t(BRAND.name)}
            {t(" · ")}
            {t(BRAND.tagline)}
          </p>
          <h1 className="mt-4 max-w-2xl text-5xl leading-tight sm:text-6xl">
            {t(" Workouts that adapt to how you slept. ")}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed">
            {t(
              " Strength, engine and skill sessions in 30, 60 or 90 minutes. Check in with your energy and sleep, and ",
            )}
            {t(BRAND.name)}
            {t(" adjusts your loads and your session for your equipment and injuries. ")}
          </p>
          <Button asChild variant="clay" size="xl" className="mt-7">
            <Link to="/try">{t("Try today's workout — no account")}</Link>
          </Button>
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-6">
        <section className="py-12">
          <h2 className="text-4xl">{t("How it works")}</h2>
          <div className="mt-6 grid gap-7 sm:grid-cols-3">
            {t(
              [
                ["01", "Check in", "Tell us your energy, soreness and hours slept."],
                [
                  "02",
                  "Get your session",
                  "Pre-written programming fits your readiness and equipment.",
                ],
                [
                  "03",
                  "Log and progress",
                  "Record your weights and scores, and follow your progress.",
                ],
              ].map(([n, title, desc]) => (
                <div key={n}>
                  <p className="text-clay">{t(n)}</p>
                  <h3 className="mt-2 text-2xl">{t(title)}</h3>
                  <p className="mt-2 text-base text-muted-foreground">{t(desc)}</p>
                </div>
              )),
            )}
          </div>
        </section>
        <section className="border-t py-10">
          <p className="eyebrow">{t("Today's sample · 60 minutes")}</p>
          <h2 className="mt-2 text-3xl">{t(plan.title)}</h2>
          <Accordion type="single" collapsible>
            <AccordionItem value="sample">
              <AccordionTrigger>{t("See the full session")}</AccordionTrigger>
              <AccordionContent>
                <WorkoutBlocks plan={plan} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
        <section className="border-t py-10">
          <h2 className="text-4xl">{t("A few questions")}</h2>
          <Accordion type="single" collapsible>
            {t(
              [
                [
                  "Is this AI?",
                  "Sessions are pre-written programming. Loads adapt to your check-in, and an AI assistant can modify a session for equipment or injuries.",
                ],
                [
                  "What equipment do I need?",
                  "Choose a full gym, dumbbells and a kettlebell, or bodyweight only.",
                ],
                ["Is it free?", FAQ_COPY.price],
                [
                  "Is this medical advice?",
                  "No. Consult a physician before starting an exercise program.",
                ],
              ].map(([q, a]) => (
                <AccordionItem key={q} value={q ?? "question"}>
                  <AccordionTrigger>{t(q)}</AccordionTrigger>
                  <AccordionContent className="text-base">{t(a)}</AccordionContent>
                </AccordionItem>
              )),
            )}
          </Accordion>
        </section>
        <footer className="flex flex-wrap justify-between gap-4 border-t py-8 text-base text-muted-foreground">
          <span>{t(BRAND.name)}</span>
          <div className="flex gap-5">
            <Link to="/privacy">{t("Privacy")}</Link>
            <Link to="/terms">{t("Terms")}</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
