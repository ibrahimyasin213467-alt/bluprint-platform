// app/components/BoostTicker.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

// Örnek boosted token verisi (gerçek API'den çekilecek)
const SAMPLE_BOOSTED_TOKENS = [
  { id: 1, name: "PEPEX", symbol: "PPX", logo: "", marketCap: "$1.2M", holders: "14.2K", boostScore: 94 },
  { id: 2, name: "BLUEPRINT", symbol: "BLUE", logo: "", marketCap: "$890K", holders: "8.1K", boostScore: 87 },
  { id: 3, name: "SOLANA MEME", symbol: "SOM", logo: "", marketCap: "$2.1M", holders: "22.5K", boostScore: 99 },
  { id: 4, name: "DRAGON", symbol: "DRGN", logo: "", marketCap: "$456K", holders: "3.9K", boostScore: 76 },
];

export default function BoostTicker() {
  const [isHovered, setIsHovered] = useState(false);
  const [boostedTokens, setBoostedTokens] = useState(SAMPLE_BOOSTED_TOKENS);
  const tickerRef = useRef<HTMLDivElement>(null);
  
  // Mouse durumuna göre animasyonu yavaşlat/durdur
  const x = useMotionValue(0);
  const translateX = useTransform(x, (value) => `-${value}%`);

  useEffect(() => {
    const fetchBoostedTokens = async () => {
      try {
        const res = await fetch("/api/boost/tokens");
        const data = await res.json();
        if (data.success && data.tokens.length > 0) {
          setBoostedTokens(data.tokens.slice(0, 20));
        }
      } catch (err) {
        console.error("Boost ticker fetch error:", err);
      }
    };
    
    fetchBoostedTokens();
    const interval = setInterval(fetchBoostedTokens, 30000);
    return () => clearInterval(interval);
  }, []);

  // Sonsuz kayma için token listesini 3 kopya oluştur
  const marqueeTokens = [...boostedTokens, ...boostedTokens, ...boostedTokens];

  useEffect(() => {
    if (!tickerRef.current || isHovered) return;
    
    const totalWidth = tickerRef.current.scrollWidth / 3; // Tek kopyanın genişliği
    const duration = totalWidth / 80; // Hız sabiti (80px/saniye)
    
    const controls = animate(x, totalWidth, {
      duration: duration,
      ease: "linear",
      repeat: Infinity,
      repeatType: "loop",
      repeatDelay: 0,
    });
    
    return controls.stop;
  }, [boostedTokens, isHovered, x]);

  if (boostedTokens.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden bg-white/90 backdrop-blur-sm border-y border-gray-200/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
      {/* Premium Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-blue-600/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-[0.015] pointer-events-none" />
      
      {/* Animated Glow Streaks */}
      <div className="absolute top-0 left-0 w-40 h-full bg-gradient-to-r from-blue-400/20 to-transparent animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-60 h-full bg-gradient-to-l from-blue-400/10 to-transparent animate-pulse-slow-delayed pointer-events-none" />
      
      <div className="relative py-3">
        <div className="overflow-hidden">
          <div 
            ref={tickerRef}
            className="flex gap-3 whitespace-nowrap"
            style={{ width: "max-content" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div 
              className="flex gap-3"
              style={{ x: translateX }}
            >
              {marqueeTokens.map((token, idx) => (
                <div
                  key={`${token.id}-${idx}`}
                  className="group relative flex items-center gap-3 px-3 py-1.5 bg-gray-50/80 rounded-full border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
                >
                  {/* Token Logo Area */}
                  <div className="relative w-6 h-6 flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300" />
                    {token.logo ? (
                      <Image src={token.logo} alt={token.name} width={24} height={24} className="rounded-full relative z-10" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative z-10">
                        <span className="text-[10px] font-bold text-white">{token.symbol.charAt(0)}</span>
                      </div>
                    )}
                  </div>

                  {/* Token Info */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-gray-900">{token.name}</span>
                    <span className="text-[11px] text-gray-400 font-mono">{token.symbol}</span>
                    
                    {/* Live Indicator Dot */}
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                    </span>
                    
                    {/* Boosted Badge */}
                    <div className="flex items-center gap-1 ml-2">
                      <span className="text-[10px] font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">🚀</span>
                      <span className="text-[10px] font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent animate-pulse-glow">BOOSTED</span>
                    </div>
                    
                    {/* Market Cap */}
                    <div className="hidden sm:block ml-2">
                      <span className="text-[10px] text-gray-400">{token.marketCap || `${(token.boostScore * 15)}K`}</span>
                    </div>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-10" />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Kenar Gradyanları (içe doğru soluklaşma) */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white/90 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white/90 to-transparent pointer-events-none" />
      
      {/* Header Text (Sol üst köşe) - Floating Effect */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-blue-500 tracking-wider">⚡ GLOBAL BOOSTED SPOTLIGHT</span>
          <div className="w-8 h-[1px] bg-gradient-to-r from-blue-400 to-transparent" />
        </div>
      </div>
    </div>
  );
}

// Tailwind Animasyonları (`globals.css` eklenecek)
/*
@keyframes pulse-slow {
  0%, 100% { opacity: 0; transform: translateX(-100%); }
  50% { opacity: 1; transform: translateX(0%); }
}
.animate-pulse-slow {
  animation: pulse-slow 8s ease-in-out infinite;
}
.animate-pulse-slow-delayed {
  animation: pulse-slow 8s ease-in-out 4s infinite;
}
@keyframes pulse-glow {
  0%, 100% { text-shadow: 0 0 0px rgba(59,130,246,0); }
  50% { text-shadow: 0 0 8px rgba(59,130,246,0.5); }
}
.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}
*/