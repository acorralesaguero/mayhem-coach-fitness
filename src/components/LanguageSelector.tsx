import { Languages } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
export function LanguageSelector() {
  const { language, setLanguage } = useTranslation();
  return (
    <div className="relative z-50 flex justify-end border-b bg-background px-5 py-2">
      <label className="flex items-center gap-2 text-sm text-foreground">
        <Languages className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">{language === "es" ? "Idioma" : "Language"}</span>
        <select
          aria-label={language === "es" ? "Idioma" : "Language"}
          value={language}
          onChange={(e) => setLanguage(e.target.value === "es" ? "es" : "en")}
          className="min-h-11 rounded border border-input bg-background px-2 text-foreground"
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </select>
      </label>
    </div>
  );
}
