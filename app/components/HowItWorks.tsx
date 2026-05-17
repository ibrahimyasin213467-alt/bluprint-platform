"use client";

import { motion } from "framer-motion";

export default function HowItWorks({ t }: { t: (key: string) => string }) {
  const steps = [
    { number: "1", titleKey: "how_step1", descKey: "how_step1_desc" },
    { number: "2", titleKey: "how_step2", descKey: "how_step2_desc" },
    { number: "3", titleKey: "how_step3", descKey: "how_step3_desc" },
  ];

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
          {t("how_title")}
        </h2>
        <p className="text-gray-400 mt-3">{t("how_subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <motion.div key={index} className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white">
              {step.number}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{t(step.titleKey)}</h3>
            <p className="text-gray-400 text-sm">{t(step.descKey)}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}