"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Background from "./Background";
import Navbar from "./Navbar";

interface Token {
  mint: string;
  name: string;
  symbol: string;
  createdAt: string;
}

export default function LivePageContent() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"home" | "create">("home");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch("/api/track-token");
        const data = await res.json();
        if (data.success) {
          setTokens(data.tokens);
        }
      } catch (err) {
        console.error("Token listesi hatası:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTokens();
  }, []);

  return (
    <div className="relative min-h-screen">
      <Background />
      <div className="relative z-10">
        <Navbar mounted={mounted} />
        <div className="pt-28 max-w-6xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-red-500 animate-pulse">●</span>
              LIVE TOKENS
            </h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">Son 50 token</div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin inline-block w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full" />
              <p className="mt-3 text-gray-500 dark:text-gray-400">Yükleniyor...</p>
            </div>
          ) : tokens.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
              <div className="text-5xl mb-3">🚀</div>
              <p className="text-gray-500 dark:text-gray-400">Henüz token oluşturulmamış.</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">İlk token'ı sen oluştur!</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {tokens.map((token, index) => (
                <motion.div
                  key={token.mint}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-mono">
                        #{index + 1}
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {token.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        ({token.symbol})
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 font-mono mt-1">
                      {token.mint.slice(0, 12)}...{token.mint.slice(-8)}
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                      {new Date(token.createdAt).toLocaleString("tr-TR")}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      window.open(
                        `https://jup.ag/swap/SOL-${token.mint}`,
                        "_blank"
                      )
                    }
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-full transition flex items-center gap-1 text-sm"
                  >
                    <span>💰</span>
                    Buy {token.symbol}
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}