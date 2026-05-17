"use client";

import { motion } from "framer-motion";

export default function UseCase() {
  const useCases = [
    {
      icon: "😂",
      title: "Meme Coins",
      description: "Launch viral meme coins in minutes."
    },
    {
      icon: "🧠",
      title: "Community Tokens",
      description: "Build and grow your community token."
    },
    {
      icon: "⚡",
      title: "Experimental Projects",
      description: "Test new ideas instantly on Solana."
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
          Perfect for Every Creator
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-gray-400 mt-3"
        >
          Whatever you're building, BluPrint makes it easy.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {useCases.map((useCase, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center hover:border-blue-500/50 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="text-4xl mb-3">{useCase.icon}</div>
            <h3 className="text-lg font-semibold text-white mb-2">{useCase.title}</h3>
            <p className="text-gray-400 text-sm">{useCase.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}