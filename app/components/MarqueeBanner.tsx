"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

interface BoostToken {
  id: string;
  mint: string;
  name: string;
  symbol: string;
  image?: string;
  boostCount: number;
}

export default function BoostTicker() {
  const [isHovered, setIsHovered] = useState(false);
  const [boostedTokens, setBoostedTokens] = useState<BoostToken[]>([]);
  const tickerRef = useRef<HTMLDivElement>(null);
  
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
    window.addEventListener('boost-updated', fetchBoostedTokens);
    return () => {
      clearInterval(interval);
      window.removeEventListener('boost-updated', fetchBoostedTokens);
    };
  }, []);

  const marqueeTokens = [...boostedTokens, ...boostedTokens, ...boostedTokens];

  useEffect(() => {
    if (!tickerRef.current || isHovered || boostedTokens.length === 0) return;
    
    const totalWidth = tickerRef.current.scrollWidth / 3;
    const duration = totalWidth / 60;
    
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
    <div className="relative w-full overflow-hidden bg-gray-950/95 backdrop-blur-sm border-y border-gray-800/50 shadow-lg">
      {/* Premium Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-[0.03] pointer-events-none" />
      
      {/* Animated Glow Streaks */}
      <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-blue-500/10 to-transparent animate-pulse-slow pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-full bg-gradient-to-l from-purple-500/10 to-transparent animate-pulse-slow-delayed pointer-events-none" />
      
      <div className="relative py-2">
        <div className="overflow-hidden">
          <div 
            ref={tickerRef}
            className="flex gap-2 whitespace-nowrap"
            style={{ width: "max-content" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <motion.div 
              className="flex gap-2"
              style={{ x: translateX }}
            >
              {marqueeTokens.map((token, idx) => (
                <div
                  key={`${token.mint}-${idx}`}
                  className="group relative flex items-center gap-2 px-3 py-1 bg-gray-900/80 rounded-full border border-gray-700/50 hover:border-blue-500/50 transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
                >
                  {/* Token Logo */}
                  <div className="relative w-5 h-5 flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300" />
                    {token.image ? (
                      <img src={token.image} alt={token.name} className="w-5 h-5 rounded-full relative z-10 object-cover" />
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center relative z-10">
                        <span className="text-[9px] font-bold text-white">{token.symbol?.charAt(0) || "?"}</span>
                      </div>
                    )}
                  </div>

                  {/* Token Info */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-white">{token.name}</span>
                    <span className="text-[10px] text-gray-500 font-mono">{token.symbol}</span>
                    
                    {/* Live Dot */}
                    <span className="relative flex h-1.5 w-1.5 ml-1">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                    </span>
                    
                    {/* Boost Badge */}
                    <div className="flex items-center gap-0.5 ml-1 px-1.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20">
                      <span className="text-[9px]">🚀</span>
                      <span className="text-[9px] font-semibold text-blue-400">{token.boostCount || 0}</span>
                    </div>
                  </div>

                  {/* Hover Glow */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-10" />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Kenar Gradyanları */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-950 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-950 to-transparent pointer-events-none" />
      
      {/* Header Text */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-blue-400 tracking-wider">⚡ BOOSTED</span>
          <div className="w-6 h-[1px] bg-gradient-to-r from-blue-500 to-transparent" />
        </div>
      </div>
    </div>
  );
}