"use client";

import { motion } from "framer-motion";
import { useI18n } from "../lib/i18n-provider";

export default function TrustSection() {
  const { t } = useI18n();

  const trustItems = [
    `✔ ${t('trust_mint')}`,
    `✔ ${t('trust_freeze')}`,
    `✔ ${t('trust_secure')}`,
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
        {t('trust_title')}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-8">{t('trust_subtitle') || 'Trust & Security'}</p>
      <div className="flex flex-wrap justify-center gap-4">
        {trustItems.map((item, i) => (
          <div key={i} className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-sm font-medium">
            {item}
          </div>
        ))}
      </div>
    </motion.div>
  );
}