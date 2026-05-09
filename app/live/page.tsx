"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";
import { useToast } from "../components/ToastProvider";
import { useI18n } from "../lib/i18n-provider";

interface Token {
  mint: string;
  name: string;
  symbol: string;
  createdAt: string;
  image?: string;
  twitter?: string;
  telegram?: string;
  website?: string;
}

export default function LivePage() {
  const { showToast } = useToast();
  const { t } = useI18n();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [newTokenMint, setNewTokenMint] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch("/api/track-token");
        const data = await res.json();
        if (data.success) {
          const oldMints = tokens.map(t => t.mint);
          const newTokens = data.tokens.filter((t: Token) => !oldMints.includes(t.mint));
          if (newTokens.length > 0 && newTokens[0]) {
            setNewTokenMint(newTokens[0].mint);
            setTimeout(() => setNewTokenMint(null), 5000);
          }
          setTokens(data.tokens);
        }
      } catch (err) {
        console.error("Token list error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTokens();
    const interval = setInterval(fetchTokens, 10000);
    return () => clearInterval(interval);
  }, [tokens]);

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text);
    showToast(`✅ ${name} ${t('live_copy')}!`, "success");
  };

  const getTokenImage = (token: Token) => {
    if (token.image && token.image.trim() !== '') {
      if (token.image.startsWith('http')) {
        return token.image;
      }
      return token.image;
    }
    return "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png";
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen">
        <Navbar mounted={mounted} />
        <div className="pt-28 max-w-6xl mx-auto px-4 pb-16">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-red-500 animate-pulse">●</span>
              {t('live_title')}
            </h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">{t('live_last')}</div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin inline-block w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full" />
              <p className="mt-3 text-gray-500 dark:text-gray-400">{t('live_loading')}</p>
            </div>
          ) : tokens.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
              <div className="text-5xl mb-3">🚀</div>
              <p className="text-gray-500 dark:text-gray-400">{t('live_empty')}</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('live_empty_hint')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tokens.map((token, index) => {
                const isNew = newTokenMint === token.mint;
                const hasSocial = token.twitter || token.telegram || token.website;
                
                return (
                  <motion.div
                    key={token.mint}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <AnimatePresence>
                      {isNew && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ duration: 0.3 }}
                          className="absolute top-2 left-2 z-10"
                        >
                          <div className="relative">
                            <div className="absolute inset-0 bg-orange-500 rounded-full blur-xl animate-ping opacity-75" />
                            <span className="relative text-3xl drop-shadow-lg">🔥</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <img
                          src={getTokenImage(token)}
                          alt={token.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-gray-700 bg-white"
                          onError={(e) => {
                            e.currentTarget.src = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png";
                          }}
                        />
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white text-lg">
                            {token.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {token.symbol}
                          </div>
                        </div>
                      </div>

                      {/* MINT ADRESİ + KOPYALAMA BUTONU */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex-1 text-xs text-gray-400 font-mono break-all bg-gray-50 dark:bg-gray-900 p-2 rounded-lg">
                          {token.mint.slice(0, 12)}...{token.mint.slice(-8)}
                        </div>
                        <button
                          onClick={() => copyToClipboard(token.mint, token.name)}
                          className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
                          title={t('live_copy')}
                        >
                          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>

                      {hasSocial && (
                        <div className="flex justify-center gap-3 mb-3 pt-1 border-t border-gray-100 dark:border-gray-700">
                          {token.twitter && (
                            <a
                              href={token.twitter.startsWith('http') ? token.twitter : `https://${token.twitter}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 hover:text-blue-400 transition text-lg"
                              title="Twitter/X"
                            >
                              🐦
                            </a>
                          )}
                          {token.telegram && (
                            <a
                              href={token.telegram.startsWith('http') ? token.telegram : `https://${token.telegram}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 hover:text-sky-500 transition text-lg"
                              title="Telegram"
                            >
                              💬
                            </a>
                          )}
                          {token.website && (
                            <a
                              href={token.website.startsWith('http') ? token.website : `https://${token.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-500 hover:text-green-500 transition text-lg"
                              title="Website"
                            >
                              🌐
                            </a>
                          )}
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-2">
                        <div className="text-[10px] text-gray-400 dark:text-gray-500">
                          {new Date(token.createdAt).toLocaleString()}
                        </div>
                        <button
                          onClick={() => window.open(`https://jup.ag/swap/SOL-${token.mint}`, "_blank")}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-full transition flex items-center gap-1 text-sm"
                        >
                          <span>💰</span>
                          {t('live_buy')} {token.symbol}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}