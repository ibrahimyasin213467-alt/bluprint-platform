"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getTranslation, type Locale, defaultLocale, locales } from "./i18n";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function useI18n() {
  const context = useContext(I18nContext);
  // Provider dışında çağrılırsa hata fırlatma, boş fonksiyon döndür
  if (!context) {
    console.warn("useI18n called outside I18nProvider - using fallback");
    return {
      locale: defaultLocale,
      setLocale: () => {},
      t: (key: string) => key,
    };
  }
  return context;
}

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale;
    if (saved && locales.includes(saved)) {
      setLocale(saved);
    }
    setMounted(true);
  }, []);

  const t = (key: string): string => {
    return getTranslation(locale, key);
  };

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}