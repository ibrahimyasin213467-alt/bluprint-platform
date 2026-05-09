"use client";

import { motion } from "framer-motion";
import { useI18n } from "../lib/i18n-provider";

export default function WhyBluPrint() {
  const { t } = useI18n();

  const features = [
    { icon: "⚡", title: t('why_instant'), desc: t('why_instant_desc') },
    { icon: "🔒", title: t('why_security'), desc: t('why_security_desc') },
    { icon: "🧠", title: t('why_nocode'), desc: t('why_nocode_desc') },
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
        {t('why_title')}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-12">{t('why_subtitle')}</p>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="text-5xl mb-4">{f.icon}</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
            <p className="text-gray-500 dark:text-gray-400">{f.desc}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}