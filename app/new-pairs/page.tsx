"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  txns24h?: number;
  pairAddress?: string;
  dexUrl?: string;
}

export default function NewPairsPage() {
  const [activeTab, setActiveTab] = useState<"bluprint" | "market">("market");
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
        const validTokens = data.tokens.filter((t: any) => 
          t.name && t.name !== "SPL Token" &&
          t.symbol && t.symbol !== "SPL" &&
          t.image && t.image.length > 0
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
    setLoading(true);
    try {
      const res = await fetch(`/api/dex-screener?filter=${filter}`);
      const data = await res.json();
      if (data.success && data.tokens) {
        setMarketTokens(data.tokens.slice(0, 50));
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
    const isZero = change === 0;
    return (
      <span className={`text-sm font-mono ${isPositive ? "text-green-400" : isZero ? "text-gray-500" : "text-red-400"}`}>
        {isPositive ? `+${change.toFixed(2)}%` : `${change.toFixed(2)}%`}
      </span>
    );
  };

  const TokenRow = ({ token, index, isBluprint }: { token: Token; index: number; isBluprint: boolean }) => (
    <div className="group hover:bg-gray-800/30 transition-all duration-150 border-b border-gray-800/50 last:border-0">
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => window.open(`https://solscan.io/token/${token.mint}`, "_blank")}>
        {/* Rank */}
        <div className="w-10 text-center">
          <span className={`text-sm font-mono ${index < 3 ? "text-yellow-500" : "text-gray-500"}`}>
            #{index + 1}
          </span>
        </div>
        
        {/* Token Info */}
        <div className="flex items-center gap-3 w-48">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
            {token.image ? (
              <img src={token.image} alt={token.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm">🚀</span>
            )}
          </div>
          <div>
            <div className="font-semibold text-white text-sm">{token.name}</div>
            <div className="text-xs text-gray-500">/{token.symbol}</div>
          </div>
        </div>
        
        {/* Market Cap / Liquidity */}
        <div className="flex-1 text-right">
          <div className="text-sm text-white">{token.liquidity ? formatNumber(token.liquidity) : "—"}</div>
          <div className="text-xs text-gray-600">Liquidity</div>
        </div>
        
        {/* Volume 24h */}
        <div className="w-28 text-right">
          <div className="text-sm text-white">{formatNumber(token.volume24h)}</div>
          <div className="text-xs text-gray-600">Volume 24h</div>
        </div>
        
        {/* Price Change */}
        <div className="w-24 text-right">
          {formatPriceChange(token.priceChange24h)}
          <div className="text-xs text-gray-600">24h %</div>
        </div>
        
        {/* Action */}
        <div className="w-12 text-right">
          <button className="opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-gray-500 hover:text-blue-400 text-sm">→</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <PageTransition>
      <div className="relative min-h-screen bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-purple-900/30 to-black" />
        
        <div className="relative z-10 pt-20 sm:pt-24 max-w-7xl mx-auto px-4 pb-16">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">New Pairs</h1>
            <p className="text-gray-500 text-sm mt-1">Discover the latest tokens on Solana</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-gray-800">
            <button
              onClick={() => setActiveTab("market")}
              className={`px-6 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === "market"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              🌍 Market
            </button>
            <button
              onClick={() => setActiveTab("bluprint")}
              className={`px-6 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === "bluprint"
                  ? "text-blue-400 border-b-2 border-blue-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              🔷 BluPrint Origin
            </button>
          </div>

          {/* Filters (only for market) */}
          {activeTab === "market" && (
            <div className="flex gap-2 mb-6">
              {[
                { id: "trending", label: "🔥 Trending" },
                { id: "volume", label: "💧 High Volume" },
                { id: "new", label: "✨ New Pairs" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as any)}
                  className={`px-4 py-1.5 rounded-full text-xs transition-all duration-200 ${
                    filter === f.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {/* Table Header */}
          <div className="hidden md:flex items-center gap-3 px-4 py-2 text-xs text-gray-500 border-b border-gray-800">
            <div className="w-10">#</div>
            <div className="w-48">Token</div>
            <div className="flex-1 text-right">Liquidity</div>
            <div className="w-28 text-right">Volume 24h</div>
            <div className="w-24 text-right">Price 24h</div>
            <div className="w-12"></div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500" />
            </div>
          )}

          {/* Token List */}
          {!loading && (
            <div className="divide-y divide-gray-800/50">
              {activeTab === "market" && marketTokens.length > 0 ? (
                marketTokens.map((token, idx) => (
                  <TokenRow key={token.mint || idx} token={token} index={idx} isBluprint={false} />
                ))
              ) : activeTab === "bluprint" && bluprintTokens.length > 0 ? (
                bluprintTokens.map((token, idx) => (
                  <TokenRow key={token.mint || idx} token={token} index={idx} isBluprint={true} />
                ))
              ) : (
                <div className="text-center py-20 text-gray-500">
                  <p>No tokens found</p>
                </div>
              )}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
}