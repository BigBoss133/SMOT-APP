import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type PropsWithChildren,
} from "react";
import type { TranslationLanguage } from "../i18n/translations";

function detectBrowserLanguage(): TranslationLanguage {
  if (typeof window === "undefined") return "en";
  const lang = navigator.language?.split("-")[0]?.toLowerCase() || "en";
  return lang === "it" ? "it" : "en";
}

interface LanguageContextValue {
  language: TranslationLanguage;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider = ({ children }: PropsWithChildren) => {
  const [language, setLanguage] = useState<TranslationLanguage>(() => {
    try {
      const saved = localStorage.getItem("smot-language");
      if (saved === "it" || saved === "en") return saved;
    } catch {
      // localStorage might be blocked
    }
    return detectBrowserLanguage();
  });

  useEffect(() => {
    try {
      localStorage.setItem("smot-language", language);
    } catch {
      // ignore storage errors
    }
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      toggleLanguage: () =>
        setLanguage((current) => (current === "it" ? "en" : "it")),
    }),
    [language]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
};
