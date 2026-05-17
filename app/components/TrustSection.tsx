"use client";

import { motion } from "framer-motion";

export default function TrustSection() {
  const items = [
    "Mint Authority Options",
    "Freeze Authority Options", 
    "Metadata Support",
    "IPFS Upload Included"
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
          Built for Secure Launches
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-gray-400 mt-3"
        >
          Launch Solana tokens with confidence and control.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {items.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4"
          >
            <span className="text-green-400 text-xl">✔</span>
            <span className="text-gray-300">{item}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}