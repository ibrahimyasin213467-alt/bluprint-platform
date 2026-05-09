"use client";

import { motion } from "framer-motion";
import { useI18n } from "../lib/i18n-provider";

export default function HowItWorks() {
  const { t } = useI18n();

  const steps = [
    { number: "1", title: t('how_step1'), desc: t('how_step1_desc') },
    { number: "2", title: t('how_step2'), desc: t('how_step2_desc') },
    { number: "3", title: t('how_step3'), desc: t('how_step3_desc') },
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
        {t('how_title')}
      </h2>
      <p className="text-gray-500 dark:text-gray-400 mb-12">{t('how_subtitle') || 'How it works'}</p>
      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((s, i) => (
          <div key={i} className="relative">
            {i < 2 && (
              <div className="hidden md:block absolute top-1/3 left-1/2 w-full h-0.5 bg-blue-200 dark:bg-blue-800 -translate-y-1/2 z-0" />
            )}
            <div className="relative z-10 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {s.number}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{s.title}</h3>
              <p className="text-gray-500 dark:text-gray-400">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}