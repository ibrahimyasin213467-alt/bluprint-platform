"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Token {
  mint: string;
  name: string;
  symbol: string;
  createdAt: string;
}

export default function LiveTokenList() {
  const [isOpen, setIsOpen] = useState(false);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTokens = async () => {
    setLoading(true);
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

  useEffect(() => {
    if (isOpen) {
      fetchTokens();
    }
  }, [isOpen]);

  return (
    <>
      {/* LIVE BUTONU - NAVBAR İÇİN */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-full px-4 py-1.5 text-sm font-medium transition flex items-center gap-1.5"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
        </span>
        LIVE
      </button>

      {/* MODAL */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-red-500 animate-pulse">●</span>
                  LIVE TOKENS
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition text-xl"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                  <div className="text-center py-10 text-gray-500">
                    <div className="animate-spin inline-block w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full" />
                    <p className="mt-2">Yükleniyor...</p>
                  </div>
                ) : tokens.length === 0 ? (
                  <div className="text-center py-10 text-gray-500">
                    🚀 Henüz token oluşturulmamış.
                    <br />
                    <span className="text-sm">İlk token'ı sen oluştur!</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tokens.map((token, index) => (
                      <div
                        key={token.mint}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:shadow-md transition group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 font-mono">
                              #{index + 1}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {token.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({token.symbol})
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 font-mono mt-0.5">
                            {token.mint.slice(0, 8)}...{token.mint.slice(-6)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              window.open(
                                `https://jup.ag/swap/SOL-${token.mint}`,
                                "_blank"
                              )
                            }
                            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-1.5 px-3 rounded-full transition flex items-center gap-1"
                          >
                            <span>💰</span>
                            Buy ${token.symbol}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t text-center text-xs text-gray-400 bg-gray-50">
                🚀 Only last 50 tokens are shown • Buy with Jupiter
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}