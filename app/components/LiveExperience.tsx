"use client";

import { motion } from "framer-motion";
import { useI18n } from "../lib/i18n-provider";

export default function LiveExperience() {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="text-center mb-24 bg-gradient-to-r from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-3xl p-8 md:p-12"
    >
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
        {t('liveexp_title')}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
        {t('liveexp_subtitle')}
      </p>
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-gray-500">{t('liveexp_demo')}</span>
          </div>
          <span className="text-xs text-gray-400">⚡ ~0.5s</span>
        </div>
        <div className="bg-gray-100 dark:bg-gray-900 rounded-xl p-4 text-center">
          <div className="text-4xl mb-2">🚀</div>
          <div className="text-sm font-mono text-green-600">✅ Token created!</div>
          <div className="text-[10px] text-gray-400 mt-1">B4uMevjg7jTG4mqWqdwMG1PdgJZtw3JEsPm1JMNYgLzs</div>
        </div>
      </div>
    </motion.div>
  );
}