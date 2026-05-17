"use client";

import { motion } from "framer-motion";

export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Choose Your Token",
      description: "Set your token name, symbol and logo."
    },
    {
      number: "2",
      title: "Confirm Transaction",
      description: "Confirm the transaction with your wallet."
    },
    {
      number: "3",
      title: "Launch & Share",
      description: "Your token is live on Solana! 🚀"
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
          How It Works
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-gray-400 mt-3"
        >
          Launch your token in three simple steps.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center"
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white">
              {step.number}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
            <p className="text-gray-400 text-sm">{step.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}