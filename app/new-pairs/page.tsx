"use client";

import { useState, useEffect } from "react";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";

interface Token {
  mint: string;
  name: string;
  symbol: string;
  image?: string;
  volume24h?: number;
  liquidity?: number;
  priceChange24h?: number;
  pairAddress?: string;
  dexUrl?: string;
  dex?: string;
  pairCreatedAt?: string;
}

export default function NewPairsPage() {
  const [marketTokens, setMarketTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchNewPairs();
    // Her 5 dakikada bir yenile
    const interval = setInterval(fetchNewPairs, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchNewPairs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dex-screener?filter=new");
      const data = await res.json();
      if (data.success && data.tokens && data.tokens.length > 0) {
        setMarketTokens(data.tokens.slice(0, 50));
        setLastUpdated(new Date());
      } else {
        setMarketTokens([]);
      }
    } catch (err) {
      console.error(err);
      setMarketTokens([]);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num?: number) => {
    if (!num) return "0";
    if (num > 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B`;
    if (num > 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num > 1_000) return `${(num / 1_000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPriceChange = (change?: number) => {
    if (change === undefined || change === null) return <span className="text-gray-500">0%</span>;
    const isPositive = change > 0;
    return (
      <span className={`text-sm font-mono ${isPositive ? "text-green-400" : "text-red-400"}`}>
        {isPositive ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`}
      </span>
    );
  };

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return "Recently";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-purple-900/30 to-black" />
        
        <div className="relative z-10 pt-20 sm:pt-24 max-w-7xl mx-auto px-4 pb-16">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-white">New Pairs</h1>
              <p className="text-gray-500 text-sm mt-1">
                Latest token pairs on Solana from DexScreener
                {lastUpdated && (
                  <span className="ml-2 text-xs text-gray-600">
                    Updated {formatTime(lastUpdated.toISOString())}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={fetchNewPairs}
              disabled={loading}
              className="px-3 py-1.5 bg-gray-800 rounded-lg text-xs text-gray-400 hover:bg-gray-700 transition"
            >
              {loading ? "Refreshing..." : "🔄 Refresh"}
            </button>
          </div>

          {/* Table Header */}
          <div className="hidden md:flex items-center gap-3 px-4 py-2 text-xs text-gray-500 border-b border-gray-800">
            <div className="w-10">#</div>
            <div className="w-48">Token</div>
            <div className="w-24">Chain</div>
            <div className="flex-1 text-right">Liquidity</div>
            <div className="w-28 text-right">Volume 24h</div>
            <div className="w-24 text-right">24h %</div>
            <div className="w-24 text-right">Created</div>
            <div className="w-12"></div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500" />
            </div>
          )}

          {/* Token List */}
          {!loading && (
            <div className="divide-y divide-gray-800/50">
              {marketTokens.length > 0 ? (
                marketTokens.map((token, idx) => (
                  <div key={token.mint || idx} className="group hover:bg-gray-800/30 transition-all duration-150 border-b border-gray-800/50 last:border-0">
                    <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => window.open(token.dexUrl || `https://dexscreener.com/solana/${token.pairAddress}`, "_blank")}>
                      <div className="w-10 text-center">
                        <span className={`text-sm font-mono ${idx < 3 ? "text-yellow-500" : "text-gray-500"}`}>
                          #{idx + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 w-48">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden">
                          {token.image ? (
                            <img src={token.image} alt={token.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-xs font-bold">
                              ?
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">{token.name}</div>
                          <div className="text-xs text-gray-500">/{token.symbol}</div>
                        </div>
                      </div>
                      <div className="w-24">
                        <div className="flex items-center gap-1">
                          <span>🌍</span>
                          <span className="text-xs text-orange-400">Solana</span>
                        </div>
                      </div>
                      <div className="flex-1 text-right">
                        <div className="text-sm text-white">${formatNumber(token.liquidity)}</div>
                        <div className="text-xs text-gray-600">Liquidity</div>
                      </div>
                      <div className="w-28 text-right">
                        <div className="text-sm text-white">${formatNumber(token.volume24h)}</div>
                        <div className="text-xs text-gray-600">Volume 24h</div>
                      </div>
                      <div className="w-24 text-right">
                        {formatPriceChange(token.priceChange24h)}
                        <div className="text-xs text-gray-600">24h %</div>
                      </div>
                      <div className="w-24 text-right">
                        <div className="text-xs text-gray-500">{formatTime(token.pairCreatedAt)}</div>
                        <div className="text-xs text-gray-600">Created</div>
                      </div>
                      <div className="w-12 text-right">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-gray-500 hover:text-orange-400 text-sm">→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-gray-500">
                  <p>No new pairs found</p>
                  <button 
                    onClick={fetchNewPairs}
                    className="mt-4 px-4 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer Info */}
          {!loading && marketTokens.length > 0 && (
            <div className="mt-6 text-center text-xs text-gray-600">
              <p>Data from DexScreener • New pairs updated every 5 minutes</p>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}