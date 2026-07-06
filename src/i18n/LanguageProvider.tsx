"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AppLocale,
  DEFAULT_LOCALE,
  TranslationKey,
  translations,
} from "./translations";

type LanguageContextValue = {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  toggleLocale: () => void;
  t: (key: TranslationKey) => string;
};

const STORAGE_KEY = "agripulse-locale";

const LanguageContext = createContext<LanguageContextValue | null>(null);

const isAppLocale = (value: string | null): value is AppLocale => {
  return value === "fr" || value === "en";
};

const readStoredLocale = (): AppLocale => {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  const storedLocale = window.localStorage.getItem(STORAGE_KEY);
  if (isAppLocale(storedLocale)) return storedLocale;

  const browserLocale = window.navigator.language.slice(0, 2);
  return isAppLocale(browserLocale) ? browserLocale : DEFAULT_LOCALE;
};

const readTranslation = (key: TranslationKey, locale: AppLocale): string => {
  const [group, item] = key.split(".") as [
    keyof typeof translations,
    string,
  ];
  const groupTranslations = translations[group] as Record<
    string,
    Record<AppLocale, string>
  >;

  return groupTranslations[item]?.[locale] ?? key;
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>(DEFAULT_LOCALE);

  useEffect(() => {
    setLocaleState(readStoredLocale());
  }, []);

  const setLocale = useCallback((nextLocale: AppLocale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(STORAGE_KEY, nextLocale);
    document.documentElement.lang = nextLocale;
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "fr" ? "en" : "fr");
  }, [locale, setLocale]);

  const t = useCallback(
    (key: TranslationKey) => readTranslation(key, locale),
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      toggleLocale,
      t,
    }),
    [locale, setLocale, toggleLocale, t],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useI18n must be used within LanguageProvider");
  }

  return context;
}
