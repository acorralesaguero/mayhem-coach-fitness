import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { spanish } from "./spanish";
export type Language = "en" | "es";
const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
}>({ language: "en", setLanguage: () => {} });
export function translate<T>(value: T, language: Language): T {
  if (language !== "es" || typeof value !== "string") return value;
  const exact = spanish[value.trim()];
  if (exact) return value.replace(value.trim(), exact) as T;
  let result = value;
  const keys = Object.keys(spanish).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (key.length < 3) continue;
    result = result.replace(
      new RegExp(`(?<![\\p{L}])${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}])`, "gu"),
      () => spanish[key] ?? key,
    );
  }
  return result as T;
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
