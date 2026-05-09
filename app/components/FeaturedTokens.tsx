"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useI18n } from "../lib/i18n-provider";

interface Token {
  mint: string;
  name: string;
  symbol: string;
  createdAt: string;
}

export default function FeaturedTokens() {
  const { t } = useI18n();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [boosted, setBoosted] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tokensRes, boostedRes] = await Promise.all([
          fetch("/api/track-token"),
          fetch("/api/boost-token"),
        ]);
        const tokensData = await tokensRes.json();
        const boostedData = await boostedRes.json();
        
        if (tokensData.success && boostedData.success) {
          const featured = tokensData.tokens
            .filter((t: Token) => boostedData.boosted.includes(t.mint))
            .slice(0, 6);
          setTokens(featured);
          setBoosted(boostedData.boosted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || tokens.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="mb-24"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="text-yellow-500">⭐</span>
          {t('featured_title')}
        </h2>
        <span className="text-xs text-gray-400">{t('featured_subtitle')}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {tokens.map((token) => (
          <div
            key={token.mint}
            className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 rounded-xl p-3 text-center border border-yellow-200 dark:border-yellow-800 hover:shadow-md transition group"
          >
            <div className="relative">
              <img
                src="https://gateway.pinata.cloud/ipfs/QmaZYRoR1eBSqESX4Fo5NR28CZPNig9YuZfJsBzmG7KPe3"
                alt={token.name}
                className="w-12 h-12 rounded-full mx-auto mb-2"
              />
              <div className="absolute -top-1 -right-1">
                <span className="text-xs">⭐</span>
              </div>
            </div>
            <div className="font-bold text-sm truncate">{token.symbol}</div>
            <div className="text-[10px] text-gray-400 truncate">{token.name}</div>
            <button
              onClick={() => window.open(`https://jup.ag/swap/SOL-${token.mint}`, "_blank")}
              className="mt-2 text-[10px] bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded-full w-full transition"
            >
              {t('live_buy')}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  );
}