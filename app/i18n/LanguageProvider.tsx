"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import enTranslations from "@/public/locales/en.json";
import esTranslations from "@/public/locales/es.json";
import { isLanguage, type Language } from "@/app/i18n/translations";

type Translations = Record<string, string>;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  translations: Translations;
}

const defaultLanguage: Language = "es";
const translationsByLanguage: Record<Language, Translations> = {
  es: esTranslations,
  en: enTranslations,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function readStoredLanguage(): Language {
  if (typeof window === "undefined") return defaultLanguage;

  const storedLanguage = localStorage.getItem("lang");
  if (isLanguage(storedLanguage)) return storedLanguage;

  const cookieLanguage = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("lang="))
    ?.split("=")[1];

  return isLanguage(cookieLanguage) ? cookieLanguage : defaultLanguage;
}

function formatTranslation(value: string, replacements?: Record<string, string | number>) {
  if (!replacements) return value;

  return Object.entries(replacements).reduce(
    (message, [key, replacement]) => message.replaceAll(`{${key}}`, String(replacement)),
    value,
  );
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);

  useEffect(() => {
    const initialLanguage = readStoredLanguage();
    document.documentElement.lang = initialLanguage;
    window.setTimeout(() => setLanguageState(initialLanguage), 0);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    if (!isLanguage(lang)) return;

    setLanguageState(lang);
    localStorage.setItem("lang", lang);
    document.cookie = `lang=${lang}; path=/; max-age=31536000`;
    document.documentElement.lang = lang;
  }, []);

  const value = useMemo<LanguageContextType>(() => {
    const translations = translationsByLanguage[language];

    return {
      language,
      setLanguage,
      translations,
      t: (key, replacements) =>
        formatTranslation(translations[key] ?? translationsByLanguage.es[key] ?? key, replacements),
    };
  }, [language, setLanguage]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation() {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    return {
      language: defaultLanguage,
      setLanguage: () => {},
      t: (key: string, replacements?: Record<string, string | number>) =>
        formatTranslation(translationsByLanguage.es[key] ?? key, replacements),
      translations: translationsByLanguage.es,
    };
  }

  return context;
}
