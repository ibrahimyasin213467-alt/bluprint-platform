"use client";

import { useState, useEffect } from "react";

interface BoostedToken {
  mint: string;
  symbol: string;
  name: string;
  image?: string;
  boostCount: number;
  expiresAt: number;
}

export default function MarqueeBanner() {
  const [tokens, setTokens] = useState<BoostedToken[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTokens();
    const interval = setInterval(fetchTokens, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTokens = async () => {
    try {
      const res = await fetch('/api/boost/active');
      const data = await res.json();
      if (data.success && data.tokens) {
        setTokens(data.tokens);
      } else {
        // Mock data - API boşsa göster
        setTokens([
          { mint: "mock1", symbol: "BLUEP", name: "BluPrint", boostCount: 15, expiresAt: Date.now() + 86400000 },
          { mint: "mock2", symbol: "SOL", name: "Solana", boostCount: 12, expiresAt: Date.now() + 86400000 },
          { mint: "mock3", symbol: "BONK", name: "Bonk", boostCount: 8, expiresAt: Date.now() + 86400000 },
        ]);
      }
    } catch (err) {
      console.error("Banner error:", err);
      // Hata durumunda mock data
      setTokens([
        { mint: "mock1", symbol: "BLUEP", name: "BluPrint", boostCount: 15, expiresAt: Date.now() + 86400000 },
        { mint: "mock2", symbol: "SOL", name: "Solana", boostCount: 12, expiresAt: Date.now() + 86400000 },
        { mint: "mock3", symbol: "BONK", name: "Bonk", boostCount: 8, expiresAt: Date.now() + 86400000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Loading veya token yoksa gösterme
  if (loading) return null;
  if (tokens.length === 0) return null;

  // Banner içeriği - 3 kopya ile sonsuz kayma
  const bannerContent = [...tokens, ...tokens, ...tokens];

  return (
    <div className="w-full bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 border-y border-purple-500/30 overflow-hidden py-2">
      <div className="whitespace-nowrap animate-marquee inline-block">
        {bannerContent.map((token, idx) => (
          <button
            key={`${token.mint}-${idx}`}
            onClick={() => window.open(`https://solscan.io/token/${token.mint}`, "_blank")}
            className="inline-flex items-center gap-2 mx-2 px-3 py-1 bg-gray-800/50 rounded-full border border-purple-500/30 hover:border-purple-500 hover:bg-gray-800 transition-all duration-200"
          >
            {/* Logo */}
            {token.image ? (
              <img src={token.image} alt={token.symbol} className="w-5 h-5 rounded-full" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-[10px]">
                🚀
              </div>
            )}
            
            {/* Token ismi */}
            <span className="text-sm font-semibold text-white">{token.symbol}</span>
            
            {/* Boost sayısı */}
            <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
              🔥 {token.boostCount}
            </span>
          </button>
        ))}
      </div>

      {/* CSS Animasyonu */}
      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  );
}