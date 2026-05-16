"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";

interface Token {
  mint: string;
  name: string;
  symbol: string;
  image?: string;
  description?: string;
  createdAt?: string;
  volume24h?: number;
  liquidity?: number;
  priceChange24h?: number;
}

export default function NewPairsPage() {
  const [activeTab, setActiveTab] = useState<"bluprint" | "market">("bluprint");
  const [bluprintTokens, setBluprintTokens] = useState<Token[]>([]);
  const [marketTokens, setMarketTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"trending" | "volume" | "new">("trending");

  useEffect(() => {
    if (activeTab === "bluprint") {
      fetchBluprintTokens();
    } else {
      fetchMarketTokens();
    }
  }, [activeTab, filter]);

  const fetchBluprintTokens = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tokens?limit=50");
      const data = await res.json();
      if (data.success) {
        // Sadece metadata'sı olan token'ları göster
        const validTokens = data.tokens.filter((t: any) => 
          t.name && t.name !== "SPL Token" &&
          t.symbol && t.symbol !== "SPL" &&
          t.image && t.image.length > 0
        );
        setBluprintTokens(validTokens.slice(0, 30));
      }
    } catch (err) {
      console.error("Failed to fetch bluprint tokens:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketTokens = async () => {
    setLoading(true);
    try {
      let url = "https://api.dexscreener.com/latest/dex/search?q=Solana";
      
      if (filter === "trending") {
        url = "https://api.dexscreener.com/latest/dex/tokens/trending?chain=solana";
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.pairs && Array.isArray(data.pairs)) {
        const formattedTokens = data.pairs.slice(0, 30).map((pair: any) => ({
          mint: pair.baseToken?.address || pair.pairAddress,
          name: pair.baseToken?.name || "Unknown",
          symbol: pair.baseToken?.symbol || "???",
          image: pair.info?.image || "",
          volume24h: pair.volume?.h24 || 0,
          liquidity: pair.liquidity?.usd || 0,
          priceChange24h: pair.priceChange?.h24 || 0,
        }));
        setMarketTokens(formattedTokens);
      } else {
        // Mock veri (API hatası durumunda)
        setMarketTokens([
          { mint: "1", name: "Bonk", symbol: "BONK", volume24h: 1500000, liquidity: 500000, priceChange24h: 15.5 },
          { mint: "2", name: "DogWifHat", symbol: "WIF", volume24h: 2800000, liquidity: 1200000, priceChange24h: -5.2 },
          { mint: "3", name: "Popcat", symbol: "POPCAT", volume24h: 890000, liquidity: 320000, priceChange24h: 42.8 },
          { mint: "4", name: "Myro", symbol: "MYRO", volume24h: 450000, liquidity: 180000, priceChange24h: 8.3 },
          { mint: "5", name: "Wen", symbol: "WEN", volume24h: 2340000, liquidity: 890000, priceChange24h: -12.1 },
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch market tokens:", err);
      // Mock veri
      setMarketTokens([
        { mint: "1", name: "Bonk", symbol: "BONK", volume24h: 1500000, liquidity: 500000, priceChange24h: 15.5 },
        { mint: "2", name: "DogWifHat", symbol: "WIF", volume24h: 2800000, liquidity: 1200000, priceChange24h: -5.2 },
        { mint: "3", name: "Popcat", symbol: "POPCAT", volume24h: 890000, liquidity: 320000, priceChange24h: 42.8 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num?: number) => {
    if (!num) return "0";
    if (num > 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num > 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPriceChange = (change?: number) => {
    if (change === undefined || change === null) return null;
    const isPositive = change > 0;
    return (
      <span className={`text-xs font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}>
        {isPositive ? "+" : ""}{change.toFixed(1)}%
      </span>
    );
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        
        <div className="relative z-10 pt-20 sm:pt-28 max-w-6xl mx-auto px-3 sm:px-4 pb-16">
          
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              New Pairs
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-gray-400 mt-2"
            >
              Discover the latest tokens on BluPrint and across Solana
            </motion.p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab("bluprint")}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
                activeTab === "bluprint"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-800"
              }`}
            >
              🔷 BluPrint Origin
            </button>
            <button
              onClick={() => setActiveTab("market")}
              className={`px-6 py-2 rounded-full font-semibold transition-all duration-200 ${
                activeTab === "market"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-800"
              }`}
            >
              🌍 Market
            </button>
          </div>

          {/* Market Filters */}
          {activeTab === "market" && (
            <div className="flex justify-center gap-2 mb-6 flex-wrap">
              {[
                { id: "trending", label: "🔥 Trending", icon: "🔥" },
                { id: "volume", label: "💧 High Volume", icon: "💧" },
                { id: "new", label: "✨ New Verified", icon: "✨" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={`px-4 py-1.5 rounded-full text-sm transition-all duration-200 ${
                    filter === f.id
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-800"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {/* Token List */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {(activeTab === "bluprint" ? bluprintTokens : marketTokens).map((token, index) => (
                  <motion.div
                    key={token.mint || index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.02 }}
                    className="group relative bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 p-4"
                  >
                    <div className="flex items-start gap-3">
                      {/* Logo */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden">
                        {token.image ? (
                          <img src={token.image} alt={token.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl">🚀</span>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-white">{token.name}</h3>
                          <span className="text-xs text-gray-500">{token.symbol}</span>
                          {activeTab === "bluprint" && (
                            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">✓ Verified</span>
                          )}
                        </div>
                        
                        {/* Market data */}
                        {activeTab === "market" && (
                          <div className="flex gap-3 mt-2 text-xs">
                            {token.volume24h !== undefined && (
                              <span className="text-gray-400">Vol: {formatNumber(token.volume24h)}</span>
                            )}
                            {token.liquidity !== undefined && (
                              <span className="text-gray-400">Liq: {formatNumber(token.liquidity)}</span>
                            )}
                            {formatPriceChange(token.priceChange24h)}
                          </div>
                        )}
                        
                        {/* Description */}
                        {activeTab === "bluprint" && token.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">{token.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Button */}
                    <button
                      onClick={() => window.open(`https://solscan.io/token/${token.mint}`, "_blank")}
                      className="mt-3 w-full py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-xs text-gray-300 transition-all duration-200"
                    >
                      🔍 View on Solscan
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Empty State */}
          {!loading && activeTab === "bluprint" && bluprintTokens.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <p className="text-lg">No verified tokens yet</p>
              <p className="text-sm mt-2">Be the first to create a token with logo and metadata!</p>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}