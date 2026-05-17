"use client";

import { motion } from "framer-motion";

export default function UseCase({ t }: { t: (key: string) => string }) {
  const useCases = [
    { icon: "😂", titleKey: "usecase_meme", descKey: "usecase_meme_desc" },
    { icon: "🧠", titleKey: "usecase_community", descKey: "usecase_community_desc" },
    { icon: "⚡", titleKey: "usecase_exp", descKey: "usecase_exp_desc" },
  ];

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
          {t("usecase_title")}
        </h2>
        <p className="text-gray-400 mt-3">{t("usecase_subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {useCases.map((useCase, index) => (
          <motion.div key={index} className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-300">
            <div className="text-4xl mb-3">{useCase.icon}</div>
            <h3 className="text-lg font-semibold text-white mb-2">{t(useCase.titleKey)}</h3>
            <p className="text-gray-400 text-sm">{t(useCase.descKey)}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}