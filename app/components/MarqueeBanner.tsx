"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Token {
  mint: string;
  name: string;
  symbol: string;
  image: string;
}

export default function MarqueeBanner() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBoostedTokens();
  }, []);

  const fetchBoostedTokens = async () => {
    try {
      const res = await fetch("/api/boosted-tokens");
      const data = await res.json();
      if (data.success) {
        setTokens(data.tokens);
      } else {
        // Mock data for demo
        setTokens([
          { mint: "1", name: "Bonk", symbol: "BONK", image: "" },
          { mint: "2", name: "Dogwifhat", symbol: "WIF", image: "" },
          { mint: "3", name: "Popcat", symbol: "POPCAT", image: "" },
          { mint: "4", name: "Myro", symbol: "MYRO", image: "" },
          { mint: "5", name: "Wen", symbol: "WEN", image: "" },
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || tokens.length === 0) return null;

  return (
    <div className="relative overflow-hidden py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-y border-blue-500/30">
      <motion.div
        animate={{ x: [0, -1000] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="flex gap-6 whitespace-nowrap"
      >
        {[...tokens, ...tokens].map((token, idx) => (
          <div key={idx} className="inline-flex items-center gap-2 px-4">
            <span className="text-yellow-500">🔥</span>
            <span className="text-white font-medium">{token.symbol}</span>
            <span className="text-green-500 text-xs">+{Math.floor(Math.random() * 50 + 10)}%</span>
            <a
              href={`/token/${token.mint}`}
              className="text-xs text-blue-400 hover:text-blue-300 underline"
            >
              Buy →
            </a>
          </div>
        ))}
      </motion.div>
    </div>
  );
}