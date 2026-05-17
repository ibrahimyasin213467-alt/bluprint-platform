"use client";

import { motion } from "framer-motion";

export default function FinalCTA({ onScrollToForm, t }: { onScrollToForm: () => void; t: (key: string) => string }) {
  return (
    <section className="py-20 text-center">
      <motion.div className="max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{t("cta_title")}</h2>
        <p className="text-gray-400 mb-8">{t("cta_subtitle")}</p>
        <button onClick={onScrollToForm} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">
          ✨ {t("cta_button")}
        </button>
      </motion.div>
    </section>
  );
}