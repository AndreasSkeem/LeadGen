"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PreferredLanguage } from "@/lib/types";
import { DEFAULT_LANGUAGE, detectBrowserLanguage, LANGUAGE_STORAGE_KEY } from "@/lib/i18n";

type LanguageContextValue = {
  language: PreferredLanguage;
  setLanguage: (language: PreferredLanguage) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<PreferredLanguage>(() => {
    if (typeof window === "undefined") return DEFAULT_LANGUAGE;

    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY) as PreferredLanguage | null;
    return stored ?? detectBrowserLanguage();
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (nextLanguage: PreferredLanguage) => setLanguageState(nextLanguage),
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }

  return context;
}
