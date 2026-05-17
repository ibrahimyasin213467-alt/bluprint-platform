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
  createdAt?: string;
  dex?: string;
}

export default function NewPairsPage() {
  const [activeTab, setActiveTab] = useState<"bluprint" | "market">("bluprint");
  const [bluprintTokens, setBluprintTokens] = useState<Token[]>([]);
  const [marketTokens, setMarketTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [marketLoading, setMarketLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBluprintTokens();
  }, []);

  useEffect(() => {
    if (activeTab === "market") {
      fetchMarketTokens();
    }
  }, [activeTab]);

  const fetchBluprintTokens = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tokens?limit=50");
      const data = await res.json();
      if (data.success) {
        const validTokens = data.tokens.filter((t: any) => 
          t.name && t.name !== "SPL Token" &&
          t.symbol && t.symbol !== "SPL"
        );
        setBluprintTokens(validTokens.slice(0, 50));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketTokens = async () => {
    setMarketLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dex-paprika");
      const data = await res.json();
      
      if (data.success && data.tokens && data.tokens.length > 0) {
        setMarketTokens(data.tokens.slice(0, 50));
      } else {
        setError(data.error || "No tokens found");
        setMarketTokens([]);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to fetch");
      setMarketTokens([]);
    } finally {
      setMarketLoading(false);
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

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-purple-900/30 to-black" />
        
        <div className="relative z-10 pt-20 sm:pt-24 max-w-7xl mx-auto px-4 pb-16">
          
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">New Pairs</h1>
            <p className="text-gray-500 text-sm mt-1">Discover the latest tokens on Solana</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-gray-800">
            <button
              onClick={() => setActiveTab("bluprint")}
              className={`flex items-center gap-2 px-6 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === "bluprint"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <img src="/favicon.ico" alt="BluPrint" className="w-4 h-4" />
              BluPrint Origin
            </button>
            <button
              onClick={() => setActiveTab("market")}
              className={`flex items-center gap-2 px-6 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === "market"
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <span>📊</span>
              DexPaprika
            </button>
          </div>

          {/* Table Header */}
          <div className="hidden md:flex items-center gap-3 px-4 py-2 text-xs text-gray-500 border-b border-gray-800">
            <div className="w-10">#</div>
            <div className="w-48">Token</div>
            <div className="w-24">Source</div>
            <div className="flex-1 text-right">Liquidity</div>
            <div className="w-28 text-right">Volume 24h</div>
            <div className="w-24 text-right">24h %</div>
            <div className="w-12"></div>
          </div>

          {/* BluPrint List */}
          {activeTab === "bluprint" && (
            <>
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500" />
                </div>
              ) : (
                <div className="divide-y divide-gray-800/50">
                  {bluprintTokens.length > 0 ? (
                    bluprintTokens.map((token, idx) => (
                      <div key={token.mint || idx} className="group hover:bg-gray-800/30 transition-all duration-150 border-b border-gray-800/50 last:border-0">
                        <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => window.open(`https://solscan.io/token/${token.mint}`, "_blank")}>
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
                                <img src="/favicon.ico" alt="BluPrint" className="w-5 h-5" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-white text-sm">{token.name}</div>
                              <div className="text-xs text-gray-500">/{token.symbol}</div>
                            </div>
                          </div>
                          <div className="w-24">
                            <div className="flex items-center gap-1">
                              <img src="/favicon.ico" alt="BluPrint" className="w-4 h-4" />
                              <span className="text-xs text-blue-400">BluPrint</span>
                            </div>
                          </div>
                          <div className="flex-1 text-right">
                            <div className="text-sm text-white">—</div>
                            <div className="text-xs text-gray-600">Liquidity</div>
                          </div>
                          <div className="w-28 text-right">
                            <div className="text-sm text-white">—</div>
                            <div className="text-xs text-gray-600">Volume 24h</div>
                          </div>
                          <div className="w-24 text-right">
                            <span className="text-gray-500">0%</span>
                            <div className="text-xs text-gray-600">24h %</div>
                          </div>
                          <div className="w-12 text-right">
                            <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-gray-500 hover:text-blue-400 text-sm">→</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-20 text-gray-500">
                      <p>No tokens created yet</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* DexPaprika List */}
          {activeTab === "market" && (
            <>
              {marketLoading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-500" />
                </div>
              ) : error ? (
                <div className="text-center py-20 text-red-400">
                  <p>⚠️ {error}</p>
                  <button 
                    onClick={fetchMarketTokens}
                    className="mt-4 px-4 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 text-white"
                  >
                    Retry
                  </button>
                </div>
              ) : marketTokens.length > 0 ? (
                <div className="divide-y divide-gray-800/50">
                  {marketTokens.map((token, idx) => (
                    <div key={token.mint || idx} className="group hover:bg-gray-800/30 transition-all duration-150 border-b border-gray-800/50 last:border-0">
                      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => window.open(`https://solscan.io/token/${token.mint}`, "_blank")}>
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
                              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center text-xs font-bold text-white">
                                {token.symbol?.charAt(0) || "?"}
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
                            <span>📊</span>
                            <span className="text-xs text-green-400">DexPaprika</span>
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
                        <div className="w-12 text-right">
                          <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-gray-500 hover:text-green-400 text-sm">→</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  <p>No tokens found</p>
                  <button 
                    onClick={fetchMarketTokens}
                    className="mt-4 px-4 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 text-white"
                  >
                    Refresh
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}