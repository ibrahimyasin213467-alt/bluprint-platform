"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { locales, type Locale } from "@/app/lib/i18n";

const flags: Record<Locale, string> = {
  en: "🇬🇧",
  ru: "🇷🇺",
  zh: "🇨🇳",
};

const names: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
  zh: "中文",
};

export default function LanguageSwitcher() {
  const [locale, setLocale] = useState<Locale>("en");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale;
    if (saved && locales.includes(saved)) {
      setLocale(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const changeLanguage = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem("locale", newLocale);
    document.documentElement.lang = newLocale;
    setIsOpen(false);
    window.location.reload();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        <span className="text-lg">{flags[locale]}</span>
        <span className="text-sm hidden sm:inline">{names[locale]}</span>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
          >
            {locales.map((lang) => (
              <button
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={`flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
                  locale === lang ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600" : ""
                }`}
              >
                <span className="text-xl">{flags[lang]}</span>
                <span>{names[lang]}</span>
                {locale === lang && (
                  <svg className="w-4 h-4 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}