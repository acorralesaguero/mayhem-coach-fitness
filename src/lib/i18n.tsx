import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { spanish } from "./spanish";
const translationPattern = new RegExp(
  `(?<![\\p{L}])(?:${Object.keys(spanish)
    .sort((a, b) => b.length - a.length)
    .map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")})(?![\\p{L}])`,
  "gu",
);
export type Language = "en" | "es";
const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
}>({ language: "en", setLanguage: () => {} });
export function translate<T>(value: T, language: Language): T {
  if (language !== "es" || typeof value !== "string") return value;
  const exact = spanish[value.trim()];
  if (exact) return value.replace(value.trim(), exact) as T;
  const pattern = value.match(
    /^In your last (\d+) check-ins, energy averaged ([\d.]+) after 7h\+ sleep and ([\d.]+) after less \(n=(\d+) vs n=(\d+)\)$/,
  );
  if (pattern)
    return `En tus últimos ${pattern[1]} registros, tu energía media fue ${pattern[2]} después de dormir 7 horas o más y ${pattern[3]} con menos sueño (n=${pattern[4]} frente a n=${pattern[5]}).` as T;
  const ready = value.match(
    /^(.+?) phase, (.+?)\. Readiness is down today, so loads are trimmed (\d+)%\. Same session as everyone else — just smarter weights\.$/,
  );
  if (ready)
    return `${translate(ready[1], language)}: ${translate(ready[2], language)}. Tu preparación es menor hoy, así que reducimos las cargas un ${ready[3]}%. La misma sesión, con cargas adaptadas a ti.` as T;
  return value.replace(translationPattern, (match) => spanish[match] ?? match) as T;
}
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  useEffect(() => {
    try {
      if (localStorage.getItem("forge:language") === "es") setLanguage("es");
    } catch {}
  }, []);
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  function select(next: Language) {
    setLanguage(next);
    try {
      localStorage.setItem("forge:language", next);
    } catch {}
  }
  return (
    <LanguageContext.Provider value={{ language, setLanguage: select }}>
      {children}
    </LanguageContext.Provider>
  );
}
export function useTranslation() {
  const context = useContext(LanguageContext);
  return { ...context, t: <T,>(value: T) => translate(value, context.language) };
}
