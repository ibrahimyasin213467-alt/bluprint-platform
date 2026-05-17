"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "./ToastProvider";

export default function BoostSection() {
  const router = useRouter();
  const { connected } = useWallet();
  const { showToast } = useToast();

  const handleBoostClick = () => {
    if (!connected) {
      showToast("Please connect your wallet first", "warning");
      return;
    }
    router.push("/create");
  };

  const benefits = [
    { icon: "📢", text: "Featured in Launch Feed" },
    { icon: "👁️", text: "Increased Visibility" },
    { icon: "🎯", text: "More Discoverability" }
  ];

  return (
    <section className="py-20 relative">
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-1/4 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative group"
        >
          {/* Animated border glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500" />
          
          {/* Main Card */}
          <div className="relative bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-black/95 backdrop-blur-xl rounded-2xl border border-blue-500/30 overflow-hidden">
            
            {/* Animated shine effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />

            {/* Floating rocket animation */}
            <div className="absolute -top-4 -right-4 opacity-20 group-hover:opacity-40 transition duration-500">
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-6xl"
              >
                🚀
              </motion.div>
            </div>

            <div className="p-8 sm:p-10">
              {/* Featured Badge */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md animate-pulse" />
                  <div className="relative flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/40 backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                    </span>
                    <span className="text-xs font-semibold text-blue-400 tracking-wide">⭐ FEATURED LAUNCH</span>
                  </div>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="text-center mb-8">
                <motion.h2 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent mb-3"
                >
                  🚀 Boost Your Token
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  className="text-gray-400 text-sm sm:text-base"
                >
                  Get featured in the BluPrint launch feed and increase visibility instantly.
                </motion.p>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-300"
                  >
                    <span className="text-sm">{benefit.icon}</span>
                    <span className="text-xs text-gray-300 font-medium">{benefit.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* Price & CTA */}
              <div className="text-center">
                <div className="mb-6">
                  <span className="text-3xl font-bold text-white">0.1 SOL</span>
                  <span className="text-gray-500 text-sm ml-2">for 4 days</span>
                </div>

                <motion.button
                  onClick={handleBoostClick}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group/btn"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-0 group-hover/btn:opacity-100 transition duration-300" />
                  <div className="relative px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 rounded-xl text-white font-bold text-sm sm:text-base transition-all duration-200 shadow-lg shadow-blue-500/25 flex items-center gap-2">
                    <span>🚀</span>
                    <span>Boost Now</span>
                    <span className="text-xs opacity-80">→</span>
                  </div>
                </motion.button>

                <p className="text-[11px] text-gray-600 mt-4">
                  Get 4 days of premium visibility • Global banner placement
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
