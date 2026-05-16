"use client";

import Link from "next/link";
import { motion } from "framer-motion";

// ÖRNEK VERİ - GEÇİCİ
const sampleTokens = [
  { mint: "1", symbol: "BLUEP", name: "BluPrint", boostCount: 15 },
  { mint: "2", symbol: "MEME", name: "Meme Coin", boostCount: 12 },
  { mint: "3", symbol: "SOL", name: "Solana", boostCount: 8 },
  { mint: "4", symbol: "BONK", name: "Bonk", boostCount: 5 },
];

export default function MarqueeBanner() {
  const marqueeItems = [...sampleTokens, ...sampleTokens, ...sampleTokens];

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-gray-900/80 via-purple-900/80 to-gray-900/80 py-2 border-y border-purple-500/30">
      <div className="relative flex overflow-hidden whitespace-nowrap">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 20,
            ease: "linear",
            repeat: Infinity,
          }}
          className="flex gap-4"
        >
          {marqueeItems.map((token, index) => (
            <div
              key={`${token.mint}-${index}`}
              className="flex items-center gap-2 px-4 py-1.5 bg-gray-800/50 rounded-full border border-purple-500/30"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-[10px]">
                🚀
              </div>
              <span className="text-sm font-semibold text-white">{token.symbol}</span>
              <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
                🔥 {token.boostCount}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}