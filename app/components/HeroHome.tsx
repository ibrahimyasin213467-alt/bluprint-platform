"use client";

import { motion } from "framer-motion";

interface HeroHomeProps {
  onScrollToForm: () => void;
}

export default function HeroHome({ onScrollToForm }: HeroHomeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center md:text-left"
    >
      <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-sm font-medium mb-6 shadow-sm">
        🚀 BluPrint Launchpad
      </div>
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
        Launch Your
        <br />
        <span className="text-blue-600">$Solana Meme Coin</span>
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto md:mx-0 mb-10">
        No code. No friction. Just launch.
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onScrollToForm}
        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg shadow-blue-500/30 transition-all"
      >
        ✨ CREATE TOKEN
      </motion.button>
    </motion.div>
  );
}