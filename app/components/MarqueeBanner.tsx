"use client";

import { useState, useEffect } from "react";

export default function MarqueeBanner() {
  const [tokens, setTokens] = useState([
    { mint: "1", symbol: "BLUEP", name: "BluPrint", boostCount: 15 },
    { mint: "2", symbol: "SOL", name: "Solana", boostCount: 12 },
    { mint: "3", symbol: "BONK", name: "Bonk", boostCount: 8 },
    { mint: "4", symbol: "PEPE", name: "Pepe", boostCount: 20 },
    { mint: "5", symbol: "WIF", name: "DogWifHat", boostCount: 18 },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API'yi dene, gelmezse mock data kullan
    fetch('/api/boost/active')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.tokens && data.tokens.length > 0) {
          setTokens(data.tokens);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return null;

  // Sonsuz kayma için 3 kopya
  const bannerContent = [...tokens, ...tokens, ...tokens];

  return (
    <div className="w-full overflow-hidden bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 border-y border-purple-500/30 py-2">
      <div className="whitespace-nowrap inline-block animate-marquee">
        {bannerContent.map((token, idx) => (
          <button
            key={`${token.mint}-${idx}`}
            onClick={() => window.open(`https://solscan.io/token/${token.mint}`, "_blank")}
            className="inline-flex items-center gap-2 mx-2 px-3 py-1 bg-gray-800/50 rounded-full border border-purple-500/30 hover:border-purple-500 hover:bg-gray-800 transition-all duration-200"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-[10px]">
              🚀
            </div>
            <span className="text-sm font-semibold text-white">{token.symbol}</span>
            <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded-full">
              🔥 {token.boostCount}
            </span>
          </button>
        ))}
      </div>

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