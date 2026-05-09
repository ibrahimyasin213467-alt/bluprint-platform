"use client";

import { motion } from "framer-motion";

export default function HeroMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center"
    >
      <div className="relative w-[280px] h-[560px] bg-black rounded-[40px] shadow-2xl border-4 border-gray-300 dark:border-gray-600 overflow-hidden">
        <img
          src="/phantom-mock.png"
          alt="Phantom Wallet"
          className="w-full h-full object-cover"
        />
      </div>
    </motion.div>
  );
}