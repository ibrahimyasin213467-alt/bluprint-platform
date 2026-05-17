"use client";

import { motion } from "framer-motion";

export default function WhyBluPrint() {
  const features = [
    {
      icon: "⚡",
      title: "Instant Launch",
      description: "Deploy your token in seconds."
    },
    {
      icon: "🔒",
      title: "Built-In Security",
      description: "Mint and freeze authority options included."
    },
    {
      icon: "🧠",
      title: "No-Code Experience",
      description: "No developers needed."
    }
  ];

  return (
    <section className="py-16">
      <div className="text-center mb-12">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent"
        >
          Why BluPrint?
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-gray-400 mt-3"
        >
          A fast and simple way to launch on Solana.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-gray-400 text-sm">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}