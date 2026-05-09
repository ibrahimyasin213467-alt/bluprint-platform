"use client";

import { motion } from "framer-motion";

interface HeroSectionProps {
  onCreateClick: () => void;
}

export default function HeroSection({ onCreateClick }: HeroSectionProps) {
  return (
    <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center md:text-left"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
          Launch Your Meme Coin
          <br />
          <span className="text-blue-600">in Seconds ⚡</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto md:mx-0 mb-8">
          No code. No friction. Just launch.
        </p>
        <button
          onClick={onCreateClick}
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg shadow-blue-500/30 transition-all"
        >
          ✨ Create Token
        </button>
      </motion.div>

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
    </div>
  );
}