"use client";

import { motion } from "framer-motion";
import { useI18n } from "../lib/i18n-provider";

interface FinalCTAProps {
  onScrollToForm: () => void;
}

export default function FinalCTA({ onScrollToForm }: FinalCTAProps) {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="text-center mb-24 bg-gradient-to-r from-blue-600 to-blue-500 rounded-3xl p-12 text-white"
    >
      <h2 className="text-3xl md:text-5xl font-bold mb-4">{t('cta_title')}</h2>
      <p className="text-blue-100 mb-8">{t('cta_subtitle')}</p>
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={onScrollToForm}
          className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-lg shadow-lg transition-all"
        >
          ✨ {t('cta_button')}
        </button>
      </div>
    </motion.div>
  );
}