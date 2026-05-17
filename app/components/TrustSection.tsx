"use client";

import { motion } from "framer-motion";

export default function TrustSection({ t }: { t: (key: string) => string }) {
  const items = [
    { icon: "✔", textKey: "trust_mint" },
    { icon: "✔", textKey: "trust_freeze" },
    { icon: "✔", textKey: "trust_metadata" },
    { icon: "✔", textKey: "trust_ipfs" },
  ];

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
          {t("trust_title")}
        </h2>
        <p className="text-gray-400 mt-3">{t("trust_subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {items.map((item, index) => (
          <motion.div key={index} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
            <span className="text-green-400 text-xl">{item.icon}</span>
            <span className="text-gray-300">{t(item.textKey)}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}