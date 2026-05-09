"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Token {
  mint: string;
  name: string;
  symbol: string;
  createdAt: string;
}

export default function RecentTokens() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch("/api/track-token");
        const data = await res.json();
        if (data.success) {
          setTokens(data.tokens.slice(0, 6));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTokens();
  }, []);

  if (loading || tokens.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-24"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-green-500 animate-pulse">●</span>
          Recently Launched
        </h2>
        <a href="/live" className="text-sm text-blue-600 hover:underline">
          View all →
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {tokens.map((token) => (
          <div
            key={token.mint}
            className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center border border-gray-200 dark:border-gray-700 hover:shadow-md transition"
          >
            <img
              src="https://gateway.pinata.cloud/ipfs/QmaZYRoR1eBSqESX4Fo5NR28CZPNig9YuZfJsBzmG7KPe3"
              alt={token.name}
              className="w-12 h-12 rounded-full mx-auto mb-2"
            />
            <div className="font-bold text-sm truncate">{token.symbol}</div>
            <div className="text-[10px] text-gray-400 truncate">{token.name}</div>
            <button
              onClick={() => window.open(`https://jup.ag/swap/SOL-${token.mint}`, "_blank")}
              className="mt-2 text-[10px] bg-blue-600 text-white px-2 py-1 rounded-full w-full"
            >
              Buy
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}