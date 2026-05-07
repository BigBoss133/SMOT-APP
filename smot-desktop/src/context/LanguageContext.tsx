import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { TranslationLanguage } from "../i18n/translations";

interface LanguageContextValue {
  language: TranslationLanguage;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const LanguageProvider = ({ children }: PropsWithChildren) => {
  const [language, setLanguage] = useState<TranslationLanguage>("it");

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
