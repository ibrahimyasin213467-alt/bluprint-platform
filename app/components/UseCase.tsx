"use client";

import { motion } from "framer-motion";
import { useI18n } from "../lib/i18n-provider";

export default function UseCase() {
  const { t } = useI18n();

  const useCases = [
    { emoji: "😂", title: t('usecase_meme'), desc: t('usecase_meme_desc') },
    { emoji: "🧠", title: t('usecase_community'), desc: t('usecase_community_desc') },
    { emoji: "⚡", title: t('usecase_exp'), desc: t('usecase_exp_desc') },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="text-center mb-24"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {t('usecase_title')}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t('usecase_subtitle') || 'Use Cases'}</p>
      <div className="flex flex-wrap justify-center gap-6">
        {useCases.map((uc, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 w-48 text-center">
            <div className="text-4xl mb-2">{uc.emoji}</div>
            <div className="font-bold text-gray-900 dark:text-white">{uc.title}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{uc.desc}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}