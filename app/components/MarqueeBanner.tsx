"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface BoostToken {
  id: string;
  mint: string;
  name: string;
  symbol: string;
  image?: string;
  boostCount: number;
}

export default function MarqueeBanner() {
  const [boostTokens, setBoostTokens] = useState<BoostToken[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoostTokens();
    const interval = setInterval(fetchBoostTokens, 30000);
    window.addEventListener('boost-updated', fetchBoostTokens);
    return () => {
      clearInterval(interval);
      window.removeEventListener('boost-updated', fetchBoostTokens);
    };
  }, []);

  const fetchBoostTokens = async () => {
    try {
      const res = await fetch("/api/boost/tokens");
      const data = await res.json();
      if (data.success && data.tokens.length > 0) {
        setBoostTokens(data.tokens);
      } else {
        // Örnek demo veri
        setBoostTokens([
          { id: "1", mint: "demo1", name: "BluPrint", symbol: "BLUEP", boostCount: 15 },
          { id: "2", mint: "demo2", name: "Solana", symbol: "SOL", boostCount: 12 },
          { id: "3", mint: "demo3", name: "Bonk", symbol: "BONK", boostCount: 8 },
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch boost tokens:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || boostTokens.length === 0) {
    return null;
  }

  const marqueeItems = [...boostTokens, ...boostTokens, ...boostTokens];

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 py-2 border-y border-purple-500/30">
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
            <Link
              key={`${token.id}-${index}`}
              href={`/?boost=${token.mint}`}
              className="flex items-center gap-2 px-3 py-1 bg-gray-800/50 rounded-full border border-purple-500/30 hover:border-purple-500 transition-all duration-200"
            >
              {token.image ? (
                <img src={token.image} alt={token.name} className="w-5 h-5 rounded-full" />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-[10px]">
                  🚀
                </div>
              )}
              <span className="text-sm font-semibold text-white">{token.symbol}</span>
              <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
                🔥 {token.boostCount}
              </span>
            </Link>
          ))}
        </motion.div>
      </div>
    </div>
  );
}