"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Footer from "../components/Footer";
import PageTransition from "../components/PageTransition";

interface Token {
  chainId: string;
  dexId: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceUsd: string;
  priceChange: {
    h1: number;
    h6: number;
    h24: number;
  };
  volume: {
    h24: number;
  };
  liquidity: {
    usd: number;
  };
  marketCap: number;
  pairCreatedAt: number;
  info?: {
    imageUrl?: string;
  };
}

export default function NewPairsPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"marketCap" | "volume" | "created">("marketCap");

  useEffect(() => {
    fetchTokens();
  }, []);

  const fetchTokens = async () => {
    try {
      const res = await fetch("https://api.dexscreener.com/token-profiles/latest/v1");
      const profiles = await res.json();
      
      const detailed = await Promise.all(
        profiles.slice(0, 30).map(async (profile: any) => {
          try {
            const pairRes = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${profile.tokenAddress}`);
            const pairData = await pairRes.json();
            if (pairData.pairs?.[0]) {
              return { ...profile, ...pairData.pairs[0] };
            }
            return null;
          } catch {
            return null;
          }
        })
      );
      
      setTokens(detailed.filter(t => t && t.priceUsd));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getSortedTokens = () => {
    return [...tokens].sort((a, b) => {
      if (sortBy === "marketCap") return (b.marketCap || 0) - (a.marketCap || 0);
      if (sortBy === "volume") return (b.volume?.h24 || 0) - (a.volume?.h24 || 0);
      return (b.pairCreatedAt || 0) - (a.pairCreatedAt || 0);
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    return `$${num.toFixed(2)}`;
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (num < 0.000001) return num.toExponential(4);
    if (num < 0.001) return `$${num.toFixed(8)}`;
    if (num < 1) return `$${num.toFixed(6)}`;
    return `$${num.toFixed(4)}`;
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-gray-950">
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        </div>
      </PageTransition>
    );
  }

  const sortedTokens = getSortedTokens();

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-950">
        <div className="pt-6 px-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-white">🔥 New Pairs</h1>
            <div className="flex gap-2">
              <button onClick={() => setSortBy("marketCap")} className={`px-3 py-1.5 text-sm rounded-lg ${sortBy === "marketCap" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}>Market Cap</button>
              <button onClick={() => setSortBy("volume")} className={`px-3 py-1.5 text-sm rounded-lg ${sortBy === "volume" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}>Volume 24H</button>
              <button onClick={() => setSortBy("created")} className={`px-3 py-1.5 text-sm rounded-lg ${sortBy === "created" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-400"}`}>Latest</button>
            </div>
          </div>

          {/* Token Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedTokens.map((token, idx) => (
              <motion.div key={token.pairAddress} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }} className="bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-700 p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {token.info?.imageUrl ? <img src={token.info.imageUrl} className="w-10 h-10 rounded-full" /> : <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">{token.baseToken.symbol?.charAt(0)}</div>}
                    <div><div className="font-semibold text-white">{token.baseToken.symbol}</div><div className="text-xs text-gray-500">{token.baseToken.name?.slice(0, 20)}</div></div>
                  </div>
                  <div className="text-right"><div className="font-mono text-white">{formatPrice(token.priceUsd)}</div><div className={`text-xs ${token.priceChange?.h24 > 0 ? "text-green-500" : "text-red-500"}`}>{token.priceChange?.h24 > 0 ? "+" : ""}{token.priceChange?.h24?.toFixed(2)}%</div></div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-800">
                  <div><div className="text-xs text-gray-500">MCap</div><div className="text-sm font-mono text-white">{formatNumber(token.marketCap || 0)}</div></div>
                  <div><div className="text-xs text-gray-500">Volume 24H</div><div className="text-sm font-mono text-white">{formatNumber(token.volume?.h24 || 0)}</div></div>
                  <div><div className="text-xs text-gray-500">Liq</div><div className="text-sm font-mono text-white">{formatNumber(token.liquidity?.usd || 0)}</div></div>
                </div>
                <div className="mt-3 flex gap-2">
                  <a href={`https://dexscreener.com/solana/${token.pairAddress}`} target="_blank" className="flex-1 text-center text-xs bg-gray-800 text-gray-300 py-1.5 rounded-lg">📊 DexScreener</a>
                  <a href={`https://jup.ag/swap/SOL-${token.baseToken.address}`} target="_blank" className="flex-1 text-center text-xs bg-blue-600/20 text-blue-400 py-1.5 rounded-lg">🚀 Buy</a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}