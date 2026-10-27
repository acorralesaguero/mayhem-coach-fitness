import { useTranslation, type Language } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const OPTIONS: { code: string; value: Language; name: string }[] = [
  { code: "EN", value: "en", name: "English" },
  { code: "ES", value: "es", name: "Español" },
];

/** macOS-style segmented control: a pill track with the active language raised. */
export function LanguageSelector({
  tone = "light",
  className,
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  const { language, setLanguage } = useTranslation();
  const dark = tone === "dark";
  return (
    <div
      role="group"
      aria-label={language === "es" ? "Idioma" : "Language"}
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border p-0.5",
        dark
          ? "border-ink-foreground/25 bg-ink/40 backdrop-blur-sm"
          : "border-border bg-muted/70",
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const active = language === option.value;
        return (
          <Button
            variant="ghost"
            key={option.code}
            type="button"
            aria-pressed={active}
            title={option.name}
            onClick={() => setLanguage(option.value)}
            className={cn(
              "min-h-9 min-w-10 rounded-full px-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? dark
                  ? "bg-ink-foreground text-ink shadow-sm"
                  : "bg-card text-foreground shadow-sm"
                : dark
                  ? "text-ink-foreground/70 hover:text-ink-foreground"
                  : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.code}
          </Button>
        );
      })}
    </div>
  );
}
