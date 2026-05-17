"use client";

import { motion } from "framer-motion";

export default function WhyBluPrint({ t }: { t: (key: string) => string }) {
  const features = [
    { icon: "⚡", titleKey: "why_instant", descKey: "why_instant_desc" },
    { icon: "🔒", titleKey: "why_security", descKey: "why_security_desc" },
    { icon: "🧠", titleKey: "why_nocode", descKey: "why_nocode_desc" },
  ];

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <motion.h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
          {t("why_title")}
        </motion.h2>
        <motion.p className="text-gray-400 mt-3">{t("why_subtitle")}</motion.p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div key={index} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-300">
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-white mb-2">{t(feature.titleKey)}</h3>
            <p className="text-gray-400 text-sm">{t(feature.descKey)}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}