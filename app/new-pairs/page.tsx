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
  holderCount?: number;
  organicScore?: number;
  isVerified?: boolean;
  createdAt?: string;
  dex?: string;
}

export default function NewPairsPage() {
  const [activeTab, setActiveTab] = useState<"bluprint" | "jupiter">("jupiter");
  const [bluprintTokens, setBluprintTokens] = useState<Token[]>([]);
  const [jupiterTokens, setJupiterTokens] = useState<Token[]>([]);
  const [bluprintLoading, setBluprintLoading] = useState(true);
  const [jupiterLoading, setJupiterLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // BluPrint tokenlarını çek
  useEffect(() => {
    fetchBluprintTokens();
  }, []);

  // Jupiter tokenlarını sadece sekme aktifken çek
  useEffect(() => {
    if (activeTab === "jupiter") {
      fetchJupiterTokens();
    }
  }, [activeTab]);

  const fetchBluprintTokens = async () => {
    setBluprintLoading(true);
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
      console.error("BluPrint fetch error:", err);
    } finally {
      setBluprintLoading(false);
    }
  };

  const fetchJupiterTokens = async () => {
    setJupiterLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/jupiter-recent");
      const data = await res.json();
      
      if (data.success && data.tokens && data.tokens.length > 0) {
        setJupiterTokens(data.tokens.slice(0, 50));
      } else {
        setError(data.error || "No tokens found");
        setJupiterTokens([]);
      }
    } catch (err: any) {
      console.error("Jupiter fetch error:", err);
      setError(err.message || "Failed to fetch from Jupiter API");
      setJupiterTokens([]);
    } finally {
      setJupiterLoading(false);
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

  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return "Recently";
    }
  };

  const TokenRow = ({ token, index, isBluprint }: { token: Token; index: number; isBluprint: boolean }) => (
    <div className="group hover:bg-gray-800/30 transition-all duration-150 border-b border-gray-800/50 last:border-0">
      <div 
        className="flex items-center gap-3 px-4 py-3 cursor-pointer" 
        onClick={() => window.open(`https://solscan.io/token/${token.mint}`, "_blank")}
      >
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
            ) : isBluprint ? (
              <img src="/favicon.ico" alt="BluPrint" className="w-5 h-5" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                {token.symbol?.charAt(0) || "?"}
              </div>
            )}
          </div>
          <div>
            <div className="font-semibold text-white text-sm">{token.name}</div>
            <div className="text-xs text-gray-500">/{token.symbol}</div>
          </div>
        </div>
        
        {/* Source */}
        <div className="w-28">
          {isBluprint ? (
            <div className="flex items-center gap-1">
              <img src="/favicon.ico" alt="BluPrint" className="w-4 h-4" />
              <span className="text-xs text-blue-400">BluPrint</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
              <span className="text-xs text-purple-400">Jupiter</span>
            </div>
          )}
        </div>
        
        {/* Liquidity */}
        <div className="flex-1 text-right">
          <div className="text-sm text-white">
            {token.liquidity ? `$${formatNumber(token.liquidity)}` : "—"}
          </div>
          <div className="text-xs text-gray-600">Liq</div>
        </div>
        
        {/* Volume 24h */}
        <div className="w-28 text-right">
          <div className="text-sm text-white">
            {token.volume24h ? `$${formatNumber(token.volume24h)}` : "—"}
          </div>
          <div className="text-xs text-gray-600">Vol 24h</div>
        </div>
        
        {/* Price Change */}
        <div className="w-24 text-right">
          {formatPriceChange(token.priceChange24h)}
          <div className="text-xs text-gray-600">24h</div>
        </div>
        
        {/* Created At */}
        <div className="w-24 text-right hidden lg:block">
          <div className="text-xs text-gray-400">{formatTimeAgo(token.createdAt)}</div>
          <div className="text-xs text-gray-600">Created</div>
        </div>
        
        {/* Holder Count (Jupiter only) */}
        {!isBluprint && (
          <div className="w-16 text-right hidden xl:block">
            <div className="text-sm text-white">{token.holderCount || "—"}</div>
            <div className="text-xs text-gray-600">Holders</div>
          </div>
        )}
        
        {/* Action Arrow */}
        <div className="w-8 text-right">
          <button className="opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-gray-500 hover:text-purple-400 text-sm">→</span>
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
            <p className="text-gray-500 text-sm mt-1">
              Discover the latest tokens on Solana
              {activeTab === "jupiter" && !jupiterLoading && jupiterTokens.length > 0 && (
                <span className="ml-2 text-xs text-green-400">✨ Live from Jupiter API</span>
              )}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 border-b border-gray-800">
            <button
              onClick={() => setActiveTab("jupiter")}
              className={`flex items-center gap-2 px-6 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === "jupiter"
                  ? "text-purple-400 border-b-2 border-purple-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
              Jupiter Recent
            </button>
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
          </div>

          {/* Table Header */}
          <div className="hidden md:flex items-center gap-3 px-4 py-2 text-xs text-gray-500 border-b border-gray-800">
            <div className="w-10">#</div>
            <div className="w-48">Token</div>
            <div className="w-28">Source</div>
            <div className="flex-1 text-right">Liquidity</div>
            <div className="w-28 text-right">Volume 24h</div>
            <div className="w-24 text-right">24h</div>
            <div className="w-24 text-right hidden lg:block">Created</div>
            {activeTab === "jupiter" && <div className="w-16 text-right hidden xl:block">Holders</div>}
            <div className="w-8"></div>
          </div>

          {/* Jupiter Tab */}
          {activeTab === "jupiter" && (
            <>
              {jupiterLoading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500" />
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <p className="text-red-400">⚠️ {error}</p>
                  <button 
                    onClick={fetchJupiterTokens}
                    className="mt-4 px-4 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 text-white"
                  >
                    Retry
                  </button>
                </div>
              ) : jupiterTokens.length > 0 ? (
                <div className="divide-y divide-gray-800/50">
                  {jupiterTokens.map((token, idx) => (
                    <TokenRow key={token.mint || idx} token={token} index={idx} isBluprint={false} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  <p>No tokens found</p>
                  <button 
                    onClick={fetchJupiterTokens}
                    className="mt-4 px-4 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700 text-white"
                  >
                    Refresh
                  </button>
                </div>
              )}
            </>
          )}

          {/* BluPrint Tab */}
          {activeTab === "bluprint" && (
            <>
              {bluprintLoading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500" />
                </div>
              ) : bluprintTokens.length > 0 ? (
                <div className="divide-y divide-gray-800/50">
                  {bluprintTokens.map((token, idx) => (
                    <TokenRow key={token.mint || idx} token={token} index={idx} isBluprint={true} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 text-gray-500">
                  <p>No tokens created yet</p>
                  <p className="text-sm mt-2">Be the first to create a token on BluPrint!</p>
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